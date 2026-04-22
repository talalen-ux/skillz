from typing import Any, Dict, List, Optional
from fastapi import FastAPI
from pydantic import BaseModel

from .executor import SkillExecutor
from .analyzer import analyze
from .scenarios import run_scenarios
from .adversarial import run_adversarial

app = FastAPI(title="Skillz Sandbox", version="0.1.0")
executor = SkillExecutor()


class RunRequest(BaseModel):
    executionId: str
    code: str
    manifest: Dict[str, Any] = {}
    inputs: Dict[str, Any] = {}
    permissions: Dict[str, Any] = {}
    mode: Optional[str] = "live"


class AnalyzeRequest(BaseModel):
    code: str
    manifest: Dict[str, Any] = {}


class ScenarioRequest(BaseModel):
    code: str
    manifest: Dict[str, Any] = {}
    permissions: Dict[str, Any] = {}
    category: str


class AdversarialRequest(BaseModel):
    code: str
    manifest: Dict[str, Any] = {}
    permissions: Dict[str, Any] = {}


@app.get("/health")
def health():
    return {"ok": True, "docker": executor.docker_available}


@app.post("/run")
def run(req: RunRequest):
    r = executor.run(req.code, req.inputs, req.permissions, mode=req.mode or "live")
    return {
        "status": r.status,
        "output": r.output,
        "error": r.error,
        "durationMs": r.duration_ms,
        "apiCalls": r.api_calls,
        "logs": r.logs,
        "blocked": r.blocked,
    }


@app.post("/analyze")
def do_analyze(req: AnalyzeRequest):
    return analyze(req.code, req.manifest)


@app.post("/scenarios")
def do_scenarios(req: ScenarioRequest):
    return run_scenarios(executor, req.code, req.manifest, req.permissions, req.category)


@app.post("/adversarial")
def do_adversarial(req: AdversarialRequest):
    return run_adversarial(executor, req.code, req.manifest, req.permissions)
