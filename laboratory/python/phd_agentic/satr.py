from __future__ import annotations

from .catalog import get_catalog
from .text import bag, bm25, cosine, looks_multi, tokenize


def _doc(tool: dict) -> str:
    return " ".join(
        [
            tool["name"],
            tool["description"],
            tool["category"],
            tool["collection"],
            tool.get("tags", ""),
        ]
    )


def satr_rerank(query: str, session: dict | None = None, top_k: int = 8) -> dict:
    catalog = get_catalog()
    if not query.strip():
        return {"query": query, "truncated": [], "ranked": [], "notes": ["empty query"], "query_mode": "single-tool", "intent_drift": 0.0}

    docs = [tokenize(_doc(tool)) for tool in catalog]
    df: dict[str, int] = {}
    total = 0
    for tokens in docs:
        total += len(tokens)
        for token in set(tokens):
            df[token] = df.get(token, 0) + 1
    avgdl = total / max(len(catalog), 1)
    q_tokens = tokenize(query)
    q_bag = bag(q_tokens)
    history = (session or {}).get("history") or []
    memory = (session or {}).get("memory") or []
    intent = dict(q_bag)
    for turn in history[-4:]:
        for token, weight in bag(tokenize(turn.get("query", ""))).items():
            intent[token] = intent.get(token, 0) + 0.5 * weight
    for element in memory[:12]:
        for token, weight in bag(tokenize(element.get("text", ""))).items():
            intent[token] = intent.get(token, 0) + 0.25 * weight

    failed = {tool_id: 0 for tool_id in []}
    for turn in history:
        for tool_id in turn.get("failedToolIds") or turn.get("failed_tool_ids") or []:
            failed[tool_id] = failed.get(tool_id, 0) + 1

    ranked = []
    for tool, tokens in zip(catalog, docs):
        semantic = bm25(q_tokens, tokens, df, len(catalog), avgdl)
        session_score = cosine(intent, bag(tokens))
        fail_penalty = 0.18 * failed.get(tool["id"], 0)
        hierarchy = 0.3 if tool["category"] == "Agriculture" or tool["source"] == "datagov" else 0.05
        score = 0.45 * semantic + 0.3 * session_score + 0.15 * hierarchy - fail_penalty
        ranked.append({"tool": tool, "score": score, "semantic": semantic, "session": session_score})
    ranked.sort(key=lambda item: item["score"], reverse=True)
    truncated = ranked[:top_k]
    notes = ["SATR session bag mixed prior queries and FCNP memory."]
    if memory:
        notes.append(f"Session memory ({len(memory)} FCNP elements) mixed into the intent vector.")
    return {
        "query": query,
        "ranked": ranked,
        "truncated": truncated,
        "query_mode": "multi-tool" if looks_multi(query) else "single-tool",
        "intent_drift": 0.0 if not history else 1 - cosine(q_bag, bag(tokenize(history[-1].get("query", "")))),
        "notes": notes,
    }
