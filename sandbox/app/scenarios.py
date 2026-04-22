"""Category-specific scenario tests. Each scenario provides inputs and an
oracle that decides if the output is acceptable."""
from __future__ import annotations

import time
from typing import Any, Callable, Dict, List, Tuple

from .executor import SkillExecutor

Scenario = Tuple[str, Dict[str, Any], Callable[[Any], Tuple[bool, str]]]


def trading_scenarios() -> List[Scenario]:
    def oracle(out, expected):
        if not isinstance(out, dict): return False, "output not dict"
        if out.get("signal") != expected: return False, f"expected {expected}, got {out.get('signal')}"
        return True, "ok"
    return [
        ("uptrend -> sell or hold",
         {"prices": [100, 101, 103, 105, 110]},
         lambda o: oracle(o, "sell") if (isinstance(o, dict) and o.get("signal") == "sell")
                   else oracle(o, "hold")),
        ("downtrend -> buy or hold",
         {"prices": [110, 105, 103, 101, 95]},
         lambda o: oracle(o, "buy") if (isinstance(o, dict) and o.get("signal") == "buy")
                   else oracle(o, "hold")),
        ("flat -> hold",
         {"prices": [100, 100, 100, 100]},
         lambda o: oracle(o, "hold")),
        ("empty -> graceful",
         {"prices": []},
         lambda o: (isinstance(o, dict), "must return dict on empty input")),
    ]


def scraping_scenarios() -> List[Scenario]:
    return [
        ("known title -> bullets",
         {"title": "Python_(programming_language)"},
         lambda o: (isinstance(o, dict) and isinstance(o.get("bullets"), list),
                    "must return bullets list")),
        ("missing title -> error field",
         {},
         lambda o: (isinstance(o, dict) and ("error" in o or "bullets" in o),
                    "must handle missing title")),
    ]


def nlp_scenarios() -> List[Scenario]:
    return [
        ("positive text",
         {"text": "I love this amazing product, it's great!"},
         lambda o: (isinstance(o, dict) and o.get("label") == "positive", "should label positive")),
        ("negative text",
         {"text": "This is terrible and awful, I hate it."},
         lambda o: (isinstance(o, dict) and o.get("label") == "negative", "should label negative")),
        ("neutral text",
         {"text": "the meeting is at noon."},
         lambda o: (isinstance(o, dict) and o.get("label") == "neutral", "should label neutral")),
    ]


def productivity_scenarios() -> List[Scenario]:
    return [
        ("with recipient + topic",
         {"recipient_name": "Alice", "topic": "design review"},
         lambda o: (isinstance(o, dict) and "subject" in o and "body" in o,
                    "must include subject + body")),
        ("missing fields",
         {},
         lambda o: (isinstance(o, dict) and "subject" in o,
                    "must still return a draft")),
    ]


def default_scenarios() -> List[Scenario]:
    return [
        ("smoke",
         {"__mock": True},
         lambda o: (o is not None, "must return something")),
    ]


REGISTRY: Dict[str, Callable[[], List[Scenario]]] = {
    "trading": trading_scenarios,
    "scraping": scraping_scenarios,
    "nlp": nlp_scenarios,
    "productivity": productivity_scenarios,
}


def run_scenarios(executor: SkillExecutor, code: str, manifest: Dict[str, Any],
                  permissions: Dict[str, Any], category: str) -> Dict[str, Any]:
    cases = REGISTRY.get(category, default_scenarios)()
    results = []
    passed = 0
    for name, inputs, oracle in cases:
        t0 = time.time()
        run = executor.run(code, inputs, permissions, mode="mock")
        ok = False
        notes = ""
        if run.status == "SUCCEEDED":
            try:
                ok, notes = oracle(run.output)
            except Exception as e:
                ok, notes = False, f"oracle raised: {e}"
        else:
            notes = f"execution {run.status}: {run.error}"
        if ok: passed += 1
        results.append({
            "name": name,
            "passed": ok,
            "durationMs": int((time.time() - t0) * 1000),
            "notes": notes,
        })
    return {"passed": passed, "total": len(cases), "cases": results}
