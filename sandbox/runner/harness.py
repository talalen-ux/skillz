"""
Runner harness. Reads a JSON payload on stdin:
  {
    "code": "...python source...",
    "inputs": {...},
    "permissions": {...},
    "mode": "live" | "mock"
  }
Writes a JSON result on stdout:
  {
    "status": "SUCCEEDED" | "FAILED" | "BLOCKED",
    "output": ...,
    "error": "...",
    "logs": [...],
    "api_calls": [...],
    "blocked": [...]
  }

Network is disabled by Docker (--network=none). Even so, we wrap any HTTP-like
calls through ctx so the harness can deny or mock and produce audit metadata.
"""
import json
import sys
import time
import traceback
from typing import Any, Dict, List
from urllib.parse import urlparse


class PermissionDenied(Exception):
    pass


class Context:
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
        host = (urlparse(url).hostname or "").lower()
        allowed = [d.lower() for d in (self.permissions.get("allowedDomains") or [])]
        if not allowed:
            raise PermissionDenied(f"network denied (no allowedDomains): {host}")
        if not any(host == d or host.endswith("." + d) for d in allowed):
            raise PermissionDenied(f"domain not whitelisted: {host}")
        return host

    def _check_quota(self):
        cap = int(self.permissions.get("maxApiCalls") or 0)
        if self._call_count >= cap:
            raise PermissionDenied(f"maxApiCalls exceeded ({cap})")
        self._call_count += 1

    def http_get(self, url: str) -> str:
        try:
            host = self._check_domain(url)
            self._check_quota()
        except PermissionDenied as e:
            self.blocked.append({"reason": str(e)})
            self.api_calls.append({"domain": url, "ok": False, "ts": int(time.time() * 1000)})
            raise
        # In mock mode, return canned content; in live mode, network is off so
        # we still return a stub but record the would-be call.
        self.api_calls.append({"domain": host, "ok": True, "ts": int(time.time() * 1000)})
        if self.mode == "mock":
            return f"[mock content for {host}]"
        # Live mode in a no-network sandbox: simulate a fetch failure deterministically.
        # A production deployment swaps in a vetted egress proxy here.
        return f"[no-network sandbox: would fetch {url}]"

    def call_action(self, action: str, **kwargs):
        allowed = set(self.permissions.get("allowedActions") or [])
        if action not in allowed:
            self.blocked.append({"reason": f"action not permitted: {action}"})
            raise PermissionDenied(f"action not permitted: {action}")
        self.logs.append({"level": "action", "message": action, "metadata": kwargs})
        return {"ok": True, "action": action, "args": kwargs}

    def spend(self, amount_usd: float, memo: str = ""):
        cap = float(self.permissions.get("maxSpendUsd") or 0)
        if amount_usd <= 0:
            return {"ok": True}
        if not self.permissions.get("walletAccess"):
            self.blocked.append({"reason": "walletAccess not permitted"})
            raise PermissionDenied("walletAccess not permitted")
        if amount_usd > cap:
            self.blocked.append({"reason": f"spend {amount_usd} exceeds cap {cap}"})
            raise PermissionDenied(f"spend {amount_usd} exceeds cap {cap}")
        self.logs.append({"level": "spend", "message": memo or "spend", "metadata": {"usd": amount_usd}})
        return {"ok": True}


def main():
    raw = sys.stdin.read()
    payload = json.loads(raw)
    code = payload["code"]
    inputs = payload.get("inputs", {})
    perms = payload.get("permissions", {})
    mode = payload.get("mode", "live")

    ctx = Context(perms, mode)
    started = time.time()
    result: Dict[str, Any] = {
        "status": "FAILED",
        "output": None,
        "error": None,
        "logs": [],
        "api_calls": [],
        "blocked": [],
        "duration_ms": 0,
    }
    try:
        ns: Dict[str, Any] = {"__name__": "skill"}
        exec(compile(code, "<skill>", "exec"), ns, ns)
        if "run" not in ns or not callable(ns["run"]):
            raise RuntimeError("skill must define `def run(inputs, ctx): ...`")
        out = ns["run"](inputs, ctx)
        result["output"] = out
        result["status"] = "SUCCEEDED"
    except PermissionDenied as e:
        result["status"] = "BLOCKED"
        result["error"] = f"permission_denied: {e}"
    except Exception as e:
        result["status"] = "FAILED"
        result["error"] = f"{type(e).__name__}: {e}"
        ctx.log(traceback.format_exc(), level="error")
    finally:
        result["logs"] = ctx.logs
        result["api_calls"] = ctx.api_calls
        result["blocked"] = ctx.blocked
        result["duration_ms"] = int((time.time() - started) * 1000)
        sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    main()
