from __future__ import annotations

from .aprr import aprr_route
from .fcnp import build_trace, fcnp_prune
from .mncd import mncd_execute
from .satr import satr_rerank


def new_session(email: str = "joyjeni@gmail.com", sector: str = "Agriculture") -> dict:
    return {
        "id": "session_kaggle",
        "email": email,
        "sector": sector,
        "history": [],
        "memory": [],
        "agentRewards": {},
        "agentCounts": {},
    }


def run_pipeline(query: str, session: dict | None = None, email: str = "joyjeni@gmail.com", sector: str = "Agriculture") -> dict:
    session = session or new_session(email, "Agriculture")
    session["sector"] = "Agriculture"
    satr = satr_rerank(query, session)
    aprr = aprr_route(query, satr["truncated"], session)
    mncd = mncd_execute(query, aprr)
    fcnp = fcnp_prune(build_trace(query, mncd))
    executed = [item for item in mncd.get("executed", []) if item.get("ok")]
    failed = [item["toolId"] for item in mncd.get("executed", []) if not item.get("ok")]
    answer = " ".join(item.get("summary", "") for item in executed) or "No tool executed."
    session = {
        **session,
        "memory": fcnp["retained"][:24],
        "history": session.get("history", [])
        + [
            {
                "turn": len(session.get("history", [])) + 1,
                "query": query,
                "selectedToolIds": [item["toolId"] for item in executed],
                "failedToolIds": failed,
                "answer": answer,
            }
        ],
    }
    pipeline_ok = bool(query.strip()) and bool(satr["truncated"]) and bool(aprr["assignments"]) and bool(mncd.get("executed")) and bool(fcnp["retained"])
    return {
        "query": query,
        "satr": satr,
        "aprr": aprr,
        "mncd": mncd,
        "fcnp": fcnp,
        "session": session,
        "answer": answer,
        "pipeline_ok": pipeline_ok,
        "stages": [
            {"id": "satr", "status": "ok" if satr["truncated"] else "empty"},
            {"id": "aprr", "status": "ok" if aprr["assignments"] else "empty"},
            {"id": "mncd", "status": "ok" if mncd.get("executed") else "empty"},
            {"id": "fcnp", "status": "ok" if fcnp["retained"] else "empty"},
        ],
    }
