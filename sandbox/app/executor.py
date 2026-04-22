"""Spawns short-lived Docker containers to execute untrusted skill code."""
from __future__ import annotations

import json
import os
import sys
import time
import traceback
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import docker

RUNNER_IMAGE = os.environ.get("SANDBOX_RUNNER_IMAGE", "skillz-runner:latest")
DEFAULT_TIMEOUT = int(os.environ.get("SANDBOX_DEFAULT_TIMEOUT_SEC", "15"))
DEFAULT_MEM = os.environ.get("SANDBOX_MEMORY_LIMIT", "256m")
DEFAULT_CPU = float(os.environ.get("SANDBOX_CPU_LIMIT", "0.5"))


@dataclass
class RunResult:
    status: str
    output: Any
    error: Optional[str]
    duration_ms: int
    api_calls: List[Dict[str, Any]]
    logs: List[Dict[str, Any]]
    blocked: List[Dict[str, Any]]


class SkillExecutor:
    """
    Runs skills in isolated Docker containers when Docker is reachable.
    Falls back to an in-process harness for environments without Docker
    (CI, local quick-tests). The in-process path is NOT a security boundary.
    """

    def __init__(self) -> None:
        try:
            self.client = docker.from_env()
            self.client.ping()
            self.docker_available = True
        except Exception:
            self.client = None
            self.docker_available = False

    def run(
        self,
        code: str,
        inputs: Dict[str, Any],
        permissions: Dict[str, Any],
        mode: str = "live",
    ) -> RunResult:
        if self.docker_available:
            return self._run_docker(code, inputs, permissions, mode)
        return self._run_in_process(code, inputs, permissions, mode)

    def _run_docker(
        self,
        code: str,
        inputs: Dict[str, Any],
        permissions: Dict[str, Any],
        mode: str,
    ) -> RunResult:
        payload = json.dumps(
            {"code": code, "inputs": inputs, "permissions": permissions, "mode": mode}
        )
        timeout = int(permissions.get("timeoutSec") or DEFAULT_TIMEOUT)
        mem = f"{permissions.get('memoryMb') or 256}m"
        started = time.time()

        container = self.client.containers.create(
            image=RUNNER_IMAGE,
            command=["python", "/run/harness.py"],
            stdin_open=True,
            network_disabled=True,
            mem_limit=mem,
            nano_cpus=int(DEFAULT_CPU * 1_000_000_000),
            pids_limit=64,
            read_only=True,
            tmpfs={"/tmp": "size=16m,mode=1777"},
            cap_drop=["ALL"],
            security_opt=["no-new-privileges"],
        )
        try:
            sock = container.attach_socket(params={"stdin": 1, "stream": 1})
            container.start()
            try:
                sock._sock.sendall(payload.encode("utf-8"))
                sock._sock.shutdown(1)
            except Exception:
                pass

            try:
                container.wait(timeout=timeout)
            except Exception:
                container.kill()
                return RunResult(
                    status="KILLED",
                    output=None,
                    error=f"timeout after {timeout}s",
                    duration_ms=int((time.time() - started) * 1000),
                    api_calls=[],
                    logs=[{"level": "error", "message": "execution timed out"}],
                    blocked=[],
                )

            stdout = container.logs(stdout=True, stderr=False).decode("utf-8", errors="replace")
            try:
                last_line = stdout.strip().splitlines()[-1]
                data = json.loads(last_line)
            except Exception as e:
                return RunResult(
                    status="FAILED",
                    output=None,
                    error=f"runner did not return JSON: {e}; raw={stdout[:500]}",
                    duration_ms=int((time.time() - started) * 1000),
                    api_calls=[],
                    logs=[],
                    blocked=[],
                )
            return RunResult(
                status=data.get("status", "FAILED"),
                output=data.get("output"),
                error=data.get("error"),
                duration_ms=data.get("duration_ms") or int((time.time() - started) * 1000),
                api_calls=data.get("api_calls") or [],
                logs=data.get("logs") or [],
                blocked=data.get("blocked") or [],
            )
        finally:
            try:
                container.remove(force=True)
            except Exception:
                pass

    # -- in-process fallback ----------------------------------------------

    def _run_in_process(
        self,
        code: str,
        inputs: Dict[str, Any],
        permissions: Dict[str, Any],
        mode: str,
    ) -> RunResult:
        ctx = _InProcessContext(permissions, mode)
        started = time.time()
        try:
            ns: Dict[str, Any] = {"__name__": "skill"}
            exec(compile(code, "<skill>", "exec"), ns, ns)
            run = ns.get("run")
            if not callable(run):
                raise RuntimeError("skill must define `def run(inputs, ctx): ...`")
            out = run(inputs, ctx)
            return RunResult(
                "SUCCEEDED", out, None, int((time.time() - started) * 1000),
                ctx.api_calls, ctx.logs, ctx.blocked,
            )
        except _InProcessPermissionDenied as e:
            return RunResult(
                "BLOCKED", None, f"permission_denied: {e}",
                int((time.time() - started) * 1000),
                ctx.api_calls, ctx.logs, ctx.blocked,
            )
        except Exception as e:
            ctx.log(traceback.format_exc(), level="error")
            return RunResult(
                "FAILED", None, f"{type(e).__name__}: {e}",
                int((time.time() - started) * 1000),
                ctx.api_calls, ctx.logs, ctx.blocked,
            )


class _InProcessPermissionDenied(Exception):
    pass


class _InProcessContext:
    """Mirrors the runner harness Context so the same skill code works in both modes."""

    def __init__(self, permissions: Dict[str, Any], mode: str):
        self.permissions = permissions
        self.mode = mode
        self.api_calls: List[Dict[str, Any]] = []
        self.blocked: List[Dict[str, str]] = []
        self.logs: List[Dict[str, Any]] = []
        self._call_count = 0

    def log(self, message: str, level: str = "info", **meta):
        self.logs.append({"level": level, "message": str(message), "metadata": meta or None})

    def _check_domain(self, url: str) -> str:
        from urllib.parse import urlparse
        host = (urlparse(url).hostname or "").lower()
        allowed = [d.lower() for d in (self.permissions.get("allowedDomains") or [])]
        if not allowed:
            raise _InProcessPermissionDenied(f"network denied (no allowedDomains): {host}")
        if not any(host == d or host.endswith("." + d) for d in allowed):
            raise _InProcessPermissionDenied(f"domain not whitelisted: {host}")
        return host

    def _check_quota(self):
        cap = int(self.permissions.get("maxApiCalls") or 0)
        if self._call_count >= cap:
            raise _InProcessPermissionDenied(f"maxApiCalls exceeded ({cap})")
        self._call_count += 1

    def http_get(self, url: str) -> str:
        try:
            host = self._check_domain(url)
            self._check_quota()
        except _InProcessPermissionDenied as e:
            self.blocked.append({"reason": str(e)})
            self.api_calls.append({"domain": url, "ok": False, "ts": int(time.time() * 1000)})
            raise
        self.api_calls.append({"domain": host, "ok": True, "ts": int(time.time() * 1000)})
        if self.mode == "mock":
            return f"[mock content for {host}]"
        return f"[no-network sandbox: would fetch {url}]"

    def call_action(self, action: str, **kwargs):
        allowed = set(self.permissions.get("allowedActions") or [])
        if action not in allowed:
            self.blocked.append({"reason": f"action not permitted: {action}"})
            raise _InProcessPermissionDenied(f"action not permitted: {action}")
        self.logs.append({"level": "action", "message": action, "metadata": kwargs})
        return {"ok": True, "action": action, "args": kwargs}

    def spend(self, amount_usd: float, memo: str = ""):
        cap = float(self.permissions.get("maxSpendUsd") or 0)
        if amount_usd <= 0:
            return {"ok": True}
        if not self.permissions.get("walletAccess"):
            self.blocked.append({"reason": "walletAccess not permitted"})
            raise _InProcessPermissionDenied("walletAccess not permitted")
        if amount_usd > cap:
            self.blocked.append({"reason": f"spend {amount_usd} exceeds cap {cap}"})
            raise _InProcessPermissionDenied(f"spend {amount_usd} exceeds cap {cap}")
        self.logs.append({"level": "spend", "message": memo or "spend", "metadata": {"usd": amount_usd}})
        return {"ok": True}
