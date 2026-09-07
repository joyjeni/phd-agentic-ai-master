#!/usr/bin/env python3
"""Kaggle / local runner for the four-objective pipeline."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "python"))

from phd_agentic.pipeline import run_pipeline  # noqa: E402


def main() -> None:
    query = " ".join(sys.argv[1:]) or "What is the current mandi price of wheat in Punjab?"
    first = run_pipeline(query, email="joyjeni@gmail.com", sector="Agriculture")
    second = run_pipeline("Now compare that with the MSP for wheat.", session=first["session"])
    payload = {
        "turn1_ok": first["pipeline_ok"],
        "turn2_ok": second["pipeline_ok"],
        "turn1_top": first["satr"]["truncated"][0]["tool"]["id"] if first["satr"]["truncated"] else None,
        "turn1_answer": first["answer"],
        "turn2_answer": second["answer"],
        "memory": len(second["session"]["memory"]),
    }
    print(json.dumps(payload, indent=2))
    if not (first["pipeline_ok"] and second["pipeline_ok"]):
        raise SystemExit("Pipeline integrity failed.")


if __name__ == "__main__":
    main()
