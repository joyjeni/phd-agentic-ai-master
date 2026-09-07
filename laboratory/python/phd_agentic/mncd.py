from __future__ import annotations

import json
import os
import re
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .catalog import get_tool
from .text import COMMODITIES, STATES, extract_slot

MANDI = "9ef84268-d588-465a-a308-a864a43d0070"
UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.I,
)
LIVE_TOOL_IDS = {
    "datagov.mandi_prices",
    "karnataka::agmarknet_ka",
    "datagov.crop_production",
    "datagov.horticulture",
    "datagov.fertilizer",
    "datagov.rainfall",
    "datagov.land_use",
}


def _args(query: str) -> dict[str, str]:
    args: dict[str, str] = {}
    state = extract_slot(query, STATES)
    crop = extract_slot(query, COMMODITIES)
    if state:
        args["state"] = state
    if crop:
        args["commodity"] = crop
        args["crop"] = crop
    return args


PORTAL_KEY = "579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645"
_MANDI_CACHE: dict[str, object] = {"at": 0.0, "records": [], "payload": {}}
_CACHE_S = 15 * 60


def _preferred_live_id(query: str) -> str:
    q = query.lower()
    price = any(word in q for word in ("price", "mandi", "modal", "agmarknet", "wholesale"))
    if any(word in q for word in ("rain", "rainfall", "monsoon", "imd")) and not price:
        return "datagov.rainfall"
    if "horticulture" in q and not price:
        return "datagov.horticulture"
    if any(word in q for word in ("fertilizer", "urea", "npk", "subsidy")) and not price:
        return "datagov.fertilizer"
    if any(word in q for word in ("land use", "land-use", "lus")) and not price:
        return "datagov.land_use"
    if any(word in q for word in ("production", "yield", "hectare", "kharif", "rabi")) and not price:
        return "datagov.crop_production"
    return "datagov.mandi_prices"


def _open_with_retry(url: str, timeout: int = 90, attempts: int = 3):
    delays = (0, 0.8, 2.0)
    last: Exception | None = None
    headers = {
        "Accept": "application/json",
        "User-Agent": "ACRS-PhD-lab/1.0 (research; data.gov.in live only)",
    }
    for i in range(attempts):
        if delays[i]:
            time.sleep(delays[i])
        try:
            return urlopen(Request(url, headers=headers), timeout=timeout)
        except HTTPError as exc:
            last = exc
            if exc.code == 429 or exc.code >= 500:
                continue
            raise
        except URLError as exc:
            last = exc
            continue
    raise last or URLError("data.gov.in request failed after retries")


def _load_resource(resource_id: str, key: str, filters: dict[str, str] | None = None, limit: str = "all"):
    use_cache = resource_id == MANDI and not filters and str(limit) in {"all", "10000"}
    now = time.time()
    if use_cache and _MANDI_CACHE["records"] and now - float(_MANDI_CACHE["at"]) < _CACHE_S:
        return list(_MANDI_CACHE["records"]), dict(_MANDI_CACHE["payload"])
    params: dict[str, object] = {
        "api-key": key,
        "format": "json",
        "limit": "10000" if str(limit) in {"all", "10000"} else limit,
        "offset": 0,
    }
    for field, value in (filters or {}).items():
        if value:
            params[f"filters[{field}]"] = value
    qs = urlencode(params)
    with _open_with_retry(f"https://api.data.gov.in/resource/{resource_id}?{qs}", timeout=90) as response:
        payload = json.loads(response.read().decode("utf-8", "ignore"))
    records = payload.get("records") or []
    if use_cache and records:
        _MANDI_CACHE["at"] = now
        _MANDI_CACHE["records"] = records
        _MANDI_CACHE["payload"] = payload
    return records, payload


def _select_mandi(records: list[dict], args: dict[str, str]) -> tuple[list[dict], str]:
    crop = (args.get("commodity") or "").lower()
    state = (args.get("state") or "").lower()
    notes: list[str] = []

    def by_state(rows: list[dict]) -> list[dict]:
        return [row for row in rows if str(row.get("state", "")).lower() == state] if state else []

    def by_crop(rows: list[dict]) -> list[dict]:
        return [row for row in rows if crop in str(row.get("commodity", "")).lower()] if crop else []

    both = [row for row in by_state(records) if crop in str(row.get("commodity", "")).lower()] if crop and state else []
    if both:
        return both[:8], (
            f"Live AGMARKNET: {len(both)} {args.get('commodity')} row(s) in {args.get('state')} "
            f"from {len(records)} arrivals dated {both[0].get('arrival_date')}."
        )
    shown: list[dict] = []
    if state:
        state_rows = by_state(records)
        if state_rows:
            shown.extend(state_rows[:8])
            notes.append(
                f"No live {args.get('commodity') or 'requested crop'} in {args.get('state')} among {len(records)} "
                f"AGMARKNET rows today. Showing other live {args.get('state')} arrivals instead of inventing prices."
                if crop
                else f"Live {args.get('state')} arrivals from {len(records)} AGMARKNET rows."
            )
    if crop:
        crop_rows = by_crop(records)
        if crop_rows:
            for row in crop_rows[:8]:
                if row not in shown:
                    shown.append(row)
            states = ", ".join(sorted({str(row.get("state")) for row in crop_rows})[:8])
            notes.append(f"Live {args.get('commodity')} is reported in {len(crop_rows)} row(s) from: {states}.")
    if not shown:
        shown = records[:8]
        notes.append(
            f"No requested-state/crop match in {len(records)} live records. National live sample shown — not simulated."
        )
    first = shown[0]
    notes.append(
        f"{first.get('commodity')} at {first.get('market')}, {first.get('state')} "
        f"modal Rs {first.get('modal_price')}/quintal on {first.get('arrival_date')}."
    )
    return shown[:8], " ".join(notes)


def execute_tool(tool: dict, query: str) -> dict:
    args = _args(query)
    resource_id = tool.get("resourceId") or (MANDI if tool["id"] in {"datagov.mandi_prices", "karnataka::agmarknet_ka"} else "")
    if tool["id"] in {"datagov.mandi_prices", "karnataka::agmarknet_ka"}:
        resource_id = MANDI
    if not resource_id or not tool.get("liveExecutable"):
        return {
            "ok": False,
            "source": "catalog-only",
            "summary": f"{tool['name']} is Agriculture ranking-only; no simulated payload.",
            "toolId": tool["id"],
            "arguments": args,
            "payload": {},
        }
    if not UUID_RE.match(str(resource_id)):
        return {
            "ok": False,
            "source": "error",
            "summary": f"Refusing non-UUID data.gov.in resource id ({resource_id}). Records were not invented.",
            "toolId": tool["id"],
            "arguments": args,
            "payload": {},
        }
    key = os.environ.get("DATA_GOV_API_KEY", "") or PORTAL_KEY
    try:
        filters: dict[str, str] = {}
        limit = "10000" if resource_id == MANDI else "50"
        if resource_id == "35be999b-0208-4354-b557-f6ca9a5355de":
            if args.get("state"):
                filters["state_name"] = args["state"]
            if args.get("crop"):
                filters["crop"] = args["crop"]
        records, payload = _load_resource(resource_id, key, filters or None, limit)
        if not records:
            return {
                "ok": False,
                "source": "error",
                "summary": f"Live data.gov.in returned zero rows for {tool['name']}. Records were not invented.",
                "toolId": tool["id"],
                "arguments": args,
                "payload": payload,
            }
        if resource_id == MANDI:
            shown, summary = _select_mandi(records, args)
        else:
            shown = records[:8]
            summary = (
                f"Live data.gov.in Agriculture ({tool['name']}, {len(records)} of "
                f"{payload.get('total', len(records))} rows): {shown[0]}."
            )
        return {
            "ok": True,
            "source": "live",
            "summary": summary,
            "toolId": tool["id"],
            "arguments": args,
            "payload": {"records": shown, "scanned": len(records), "resourceId": resource_id},
        }
    except Exception as exc:
        return {
            "ok": False,
            "source": "error",
            "summary": f"Live Agriculture fetch failed ({exc}). Records were not invented.",
            "toolId": tool["id"],
            "arguments": args,
            "payload": {},
        }


def mncd_execute(query: str, aprr: dict) -> dict:
    nodes = [row["agent"]["id"] for row in aprr.get("assignments", [])]
    if not nodes:
        return {"nodes": [], "votes": [], "executed": [], "consensusNotes": ["no agents"], "edges": []}
    proposals = []
    for row in aprr["assignments"]:
        if not row["tools"]:
            continue
        tool = row["tools"][0]["tool"]
        proposals.append({"agentId": row["agent"]["id"], "toolId": tool["id"], "tool": tool})
    votes: dict[str, float] = {}
    for proposal in proposals:
        votes[proposal["toolId"]] = votes.get(proposal["toolId"], 0) + 1.0
        if proposal["tool"].get("source") == "datagov":
            votes[proposal["toolId"]] += 0.6
    ranked = sorted(votes.items(), key=lambda item: item[1], reverse=True)
    live_ranked = [(tool_id, weight) for tool_id, weight in ranked if tool_id in LIVE_TOOL_IDS]
    pick_id = live_ranked[0][0] if live_ranked else _preferred_live_id(query)
    tool = get_tool(pick_id)
    executed = [execute_tool(tool, query)] if tool else []
    return {
        "nodes": nodes,
        "edges": [{"from": nodes[i], "to": nodes[(i + 1) % len(nodes)], "weight": 0.5} for i in range(len(nodes))],
        "votes": [{"toolId": tool_id, "weight": weight} for tool_id, weight in ranked],
        "executed": executed,
        "proposals": proposals,
        "consensusNotes": [
            "MNCD mesh vote over SATR tool IDs, not a manager chat.",
            "Execution is live data.gov.in Agriculture only; ranking-only tools never receive dummy payloads.",
            f"Live tool {pick_id}" if tool else "no live tool",
        ],
    }
