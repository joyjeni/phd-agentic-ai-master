from __future__ import annotations


def fcnp_prune(elements: list[dict], prune_ratio: float = 0.42) -> dict:
    if not elements:
        return {"retained": [], "evicted": [], "stats": {"original": 0, "retained": 0, "evicted": 0, "pinned": 0}, "notes": ["empty"]}
    pinned = [item for item in elements if item.get("pinned")]
    free = sorted(
        [item for item in elements if not item.get("pinned")],
        key=lambda item: item.get("feedback", 0) + item.get("accessCount", 0) + item.get("importance", 0),
        reverse=True,
    )
    budget = max(len(pinned) + 1, int(round(len(elements) * (1 - prune_ratio))))
    keep_free = max(0, budget - len(pinned))
    retained = pinned + free[:keep_free]
    evicted = free[keep_free:]
    return {
        "retained": retained,
        "evicted": evicted,
        "stats": {
            "original": len(elements),
            "retained": len(retained),
            "evicted": len(evicted),
            "pinned": len(pinned),
        },
        "notes": ["FCNP preserves pinned citations and writes memory back to SATR."],
    }


def build_trace(query: str, mncd: dict) -> list[dict]:
    elements = [
        {"id": "query", "text": query, "pinned": True, "kind": "query", "feedback": 1, "accessCount": 2, "importance": 0.9}
    ]
    for index, call in enumerate(mncd.get("executed") or []):
        elements.append(
            {
                "id": f"obs_{index}",
                "text": call.get("summary", ""),
                "pinned": True,
                "kind": "observation",
                "feedback": 1 if call.get("ok") else -0.5,
                "accessCount": 3,
                "importance": 0.8,
            }
        )
        elements.append(
            {
                "id": f"cite_{index}",
                "text": f"citation:{call.get('toolId')}",
                "pinned": True,
                "kind": "citation",
                "feedback": 1,
                "accessCount": 2,
                "importance": 0.8,
            }
        )
    for index, note in enumerate(mncd.get("consensusNotes") or []):
        elements.append(
            {
                "id": f"note_{index}",
                "text": note,
                "pinned": False,
                "kind": "consensus",
                "feedback": 0.2,
                "accessCount": 1,
                "importance": 0.3,
            }
        )
    return elements
