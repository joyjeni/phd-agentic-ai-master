#!/usr/bin/env python3
"""HTTP orchestrator: SATR → APRR → MNCD → FCNP.

Each objective repo exposes a stdlib microservice under service/app.py.
This master process calls them in order. It does not invent mandi prices.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

SATR_URL = os.environ.get("SATR_URL", "http://127.0.0.1:43131/rerank")
APRR_URL = os.environ.get("APRR_URL", "http://127.0.0.1:43132/route")
MNCD_URL = os.environ.get("MNCD_URL", "http://127.0.0.1:43133/mesh")
FCNP_URL = os.environ.get("FCNP_URL", "http://127.0.0.1:43134/prune")


def post(url: str, payload: dict) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.loads(response.read().decode())
    except urllib.error.URLError as exc:
        raise SystemExit(f"Microservice {url} failed: {exc}") from exc


def run(query: str) -> dict:
    satr = post(SATR_URL, {"query": query, "top_k": 5, "record_success": True})
    aprr = post(APRR_URL, {"query": query, "update": {"success": True, "latency_ms": 80}})
    ranks = [
        {
            "agent": f"A{i}",
            "ranking": [[row["uid"], float(row["score_total"])] for row in satr.get("results", [])],
        }
        for i in range(3)
    ]
    mncd = post(MNCD_URL, {"ranks": ranks, "agent_weights": {"A0": 1.0, "A1": 0.9, "A2": 0.8}, "consensus": "score_sum"})
    elements = [
        {"id": row["uid"], "text": f"{row['name']} {row['category']}", "importance": 0.5}
        for row in satr.get("results", [])
    ]
    fcnp = post(FCNP_URL, {"query": query, "elements": elements})
    return {"query": query, "satr": satr, "aprr": aprr, "mncd": mncd, "fcnp": fcnp}


def main() -> None:
    query = " ".join(sys.argv[1:]) or "tomato mandi price in Karnataka"
    print(json.dumps(run(query), indent=2))


if __name__ == "__main__":
    main()
