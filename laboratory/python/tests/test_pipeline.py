from phd_agentic.pipeline import run_pipeline
from phd_agentic.fcnp import fcnp_prune
from phd_agentic.mncd import _args


def test_two_turn_agriculture_loop():
    first = run_pipeline(
        "What is the current mandi price of wheat in Punjab?",
        email="joyjeni@gmail.com",
        sector="Agriculture",
    )
    assert first["pipeline_ok"]
    assert first["satr"]["truncated"]
    assert first["aprr"]["assignments"]
    assert first["mncd"]["executed"]
    second = run_pipeline(
        "Now compare that with the MSP for wheat.",
        session=first["session"],
    )
    assert second["pipeline_ok"]
    assert len(second["session"]["history"]) == 2
    assert second["session"]["memory"]


def test_args_do_not_invent_wheat_punjab():
    args = _args("What arrivals are on the live AGMARKNET feed today?")
    assert "commodity" not in args
    assert "state" not in args


def test_pinned_citation_survives():
    elements = [{"id": "cite", "text": "citation:x", "pinned": True, "feedback": 1, "accessCount": 1, "importance": 0.1, "kind": "citation"}]
    elements += [
        {"id": f"n{i}", "text": "noise", "pinned": False, "feedback": -1, "accessCount": 0, "importance": 0, "kind": "consensus"}
        for i in range(12)
    ]
    result = fcnp_prune(elements, prune_ratio=0.8)
    assert any(item["id"] == "cite" for item in result["retained"])
