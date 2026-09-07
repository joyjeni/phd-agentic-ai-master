from __future__ import annotations

import math

AGENTS = [
    {
        "id": "agriculture_analyst",
        "name": "Agriculture Analyst",
        "categories": ["Agriculture", "Weather", "Food"],
        "cost": 0.35,
    },
    {
        "id": "schema_planner",
        "name": "Schema Planner",
        "categories": ["Data", "Mapping", "Government"],
        "cost": 0.25,
    },
    {
        "id": "tool_executor",
        "name": "Tool Executor",
        "categories": ["Agriculture", "Data", "Finance", "Weather"],
        "cost": 0.4,
    },
    {
        "id": "mesh_critic",
        "name": "Mesh Critic",
        "categories": ["Data", "News", "Communication"],
        "cost": 0.2,
    },
]


def aprr_route(query: str, ranked: list[dict], session: dict | None = None) -> dict:
    if not ranked:
        return {"assignments": [], "notes": ["empty SATR shortlist"]}
    t = 1 + len((session or {}).get("history") or [])
    rewards = (session or {}).get("agentRewards") or (session or {}).get("agent_rewards") or {}
    counts = (session or {}).get("agentCounts") or (session or {}).get("agent_counts") or {}
    scored = []
    for agent in AGENTS:
        n = counts.get(agent["id"], 2)
        mean = rewards.get(agent["id"], 1.2) / max(n, 1)
        chosen = []
        for item in ranked:
            datagov_exec = item["tool"]["source"] == "datagov" and agent["id"] in {
                "agriculture_analyst",
                "tool_executor",
            }
            hit = 1.0 if item["tool"]["category"] in agent["categories"] or datagov_exec else 0.15
            if hit > 0.22:
                chosen.append(item)
        chosen = chosen[:3]
        pref = sum(item["score"] for item in chosen) / max(len(chosen), 1) if chosen else 0
        explore = 0.35 * math.sqrt(math.log(t + 1) / (n + 0.5))
        utility = 0.7 * mean + 0.3 * pref + explore - 0.08 * agent["cost"]
        scored.append(
            {
                "agent": agent,
                "tools": chosen,
                "utility": utility,
                "preference": pref,
                "exploration": explore,
            }
        )
    scored.sort(key=lambda row: row["utility"], reverse=True)
    return {
        "assignments": [row for row in scored[:4] if row["tools"]],
        "notes": ["APRR routes agents, not models, using preference + reward posterior."],
    }
