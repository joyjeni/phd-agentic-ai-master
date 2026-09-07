"""Shared text utilities for the Kaggle-side engines."""

from __future__ import annotations

import math
import re
from collections import Counter

TOKEN_RE = re.compile(r"[A-Za-z0-9_#@./:-]+")
STATES = [
    "Andhra Pradesh",
    "Bihar",
    "Gujarat",
    "Haryana",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Tamil Nadu",
    "Telangana",
    "Uttar Pradesh",
    "West Bengal",
]
COMMODITIES = [
    "Wheat",
    "Rice",
    "Paddy",
    "Maize",
    "Onion",
    "Tomato",
    "Potato",
    "Cotton",
    "Sugarcane",
    "Soyabean",
    "Groundnut",
    "Turmeric",
    "Chilli",
    "Mustard",
    "Bajra",
]


def tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_RE.findall(text or "") if len(token) > 1]


def bag(tokens: list[str], weight: float = 1.0) -> dict[str, float]:
    counts: dict[str, float] = {}
    for token in tokens:
        counts[token] = counts.get(token, 0.0) + weight
    return counts


def cosine(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0.0
    dot = sum(weight * right.get(token, 0.0) for token, weight in left.items())
    ln = math.sqrt(sum(weight * weight for weight in left.values()))
    rn = math.sqrt(sum(weight * weight for weight in right.values()))
    if not ln or not rn:
        return 0.0
    return dot / (ln * rn)


def bm25(query: list[str], doc: list[str], df: dict[str, int], n_docs: int, avgdl: float, k1: float = 1.5, b: float = 0.75) -> float:
    tf = Counter(doc)
    dl = max(len(doc), 1)
    score = 0.0
    for token in set(query):
        freq = tf.get(token, 0)
        if not freq:
            continue
        idf = math.log((n_docs - df.get(token, 1) + 0.5) / (df.get(token, 1) + 0.5) + 1)
        denom = freq + k1 * (1 - b + b * (dl / max(avgdl, 1)))
        score += idf * ((freq * (k1 + 1)) / denom)
    return score


def extract_slot(query: str, options: list[str]) -> str | None:
    lowered = query.lower()
    for option in sorted(options, key=len, reverse=True):
        token = re.escape(option.lower())
        if re.search(rf"(^|[^a-z0-9]){token}([^a-z0-9]|$)", lowered):
            return option
    return None


def looks_multi(query: str) -> bool:
    return bool(re.search(r"\b(and|then|compare|versus|vs|also|plus|both)\b", query, re.I))
