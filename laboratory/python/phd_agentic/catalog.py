"""Agriculture-sector catalog: live data.gov.in adapters + agri ranking-only schemas."""

from __future__ import annotations

TOOLS = [
    {
        "id": "datagov.mandi_prices",
        "name": "AGMARKNET Daily Mandi Prices",
        "description": "Current daily wholesale min/max/modal prices of agricultural commodities from Indian mandis.",
        "category": "Agriculture",
        "collection": "data.gov.in",
        "source": "datagov",
        "tags": "mandi price wheat rice onion market agmarknet",
        "seen": False,
        "liveExecutable": True,
        "resourceId": "9ef84268-d588-465a-a308-a864a43d0070",
    },
    {
        "id": "datagov.crop_production",
        "name": "District Season Crop Production",
        "description": "District-wise season-wise crop area and production statistics from data.gov.in.",
        "category": "Agriculture",
        "collection": "data.gov.in",
        "source": "datagov",
        "tags": "production yield area kharif rabi rice wheat",
        "seen": False,
        "liveExecutable": True,
        "resourceId": "35be999b-0208-4354-b557-f6ca9a5355de",
    },
    {
        "id": "datagov.horticulture",
        "name": "Horticulture Production",
        "description": "State-wise horticulture area and production from data.gov.in.",
        "category": "Agriculture",
        "collection": "data.gov.in",
        "source": "datagov",
        "tags": "horticulture tomato onion fruit vegetable",
        "seen": False,
        "liveExecutable": True,
        "resourceId": "a2b43dcc-9cd2-4601-b183-3e859624dea4",
    },
    {
        "id": "datagov.fertilizer",
        "name": "Fertilizer Subsidy Statistics",
        "description": "Year-wise subsidy on fertilizer products from data.gov.in.",
        "category": "Agriculture",
        "collection": "data.gov.in",
        "source": "datagov",
        "tags": "fertilizer npk urea subsidy",
        "seen": False,
        "liveExecutable": True,
        "resourceId": "2e0e6c04-97f2-456b-9309-bf605650cb11",
    },
    {
        "id": "datagov.rainfall",
        "name": "All-India IMD Rainfall",
        "description": "All-India area-weighted monthly, seasonal and annual rainfall from IMD on data.gov.in.",
        "category": "Agriculture",
        "collection": "data.gov.in",
        "source": "datagov",
        "tags": "rain monsoon weather drought irrigation imd",
        "seen": False,
        "liveExecutable": True,
        "resourceId": "8196f6cc-83ff-4b56-8581-2630de9d4a5e",
    },
    {
        "id": "datagov.land_use",
        "name": "Land Use Statistics",
        "description": "Classified area under land-use statistics from data.gov.in.",
        "category": "Agriculture",
        "collection": "data.gov.in",
        "source": "datagov",
        "tags": "land lus area district agriculture",
        "seen": False,
        "liveExecutable": True,
        "resourceId": "8a3761be-1b0b-423d-a907-1f99870b365a",
    },
    {
        "id": "datagov.msp",
        "name": "Minimum Support Prices",
        "description": "Ranking-only MSP lookup until a verified data.gov.in MSP UUID is confirmed.",
        "category": "Agriculture",
        "collection": "data.gov.in",
        "source": "datagov",
        "tags": "msp procurement price policy wheat paddy",
        "seen": False,
        "liveExecutable": False,
    },
    {
        "id": "tb.agri.soil_health",
        "name": "Soil Health Card Lookup",
        "description": "Soil nutrient status and fertilizer dose for a village.",
        "category": "Agriculture",
        "collection": "RapidAPI-Agriculture",
        "source": "toolbench",
        "tags": "soil ph nutrient fertilizer",
        "seen": False,
        "liveExecutable": False,
    },
    {
        "id": "tb.agri.crop_calendar",
        "name": "Crop Sowing Calendar",
        "description": "Sowing windows for Kharif and Rabi crops.",
        "category": "Agriculture",
        "collection": "RapidAPI-Agriculture",
        "source": "toolbench",
        "tags": "sowing calendar kharif rabi",
        "seen": False,
        "liveExecutable": False,
    },
    {
        "id": "tb.agri.pest_advisory",
        "name": "Pest and Disease Advisory",
        "description": "Integrated pest-management advice for a crop.",
        "category": "Agriculture",
        "collection": "RapidAPI-Agriculture",
        "source": "toolbench",
        "tags": "pest disease ipm advisory crop",
        "seen": False,
        "liveExecutable": False,
    },
]


def get_catalog() -> list[dict]:
    return [dict(tool) for tool in TOOLS]


def get_tool(tool_id: str) -> dict | None:
    for tool in TOOLS:
        if tool["id"] == tool_id:
            return dict(tool)
    return None
