import type { Tool } from "./types";

function params(
  items: Array<[string, string, boolean, string, string?]>,
): Tool["parameters"] {
  return items.map(([name, type, required, description, def]) => ({
    name,
    type,
    required,
    description,
    default: def,
  }));
}

function tool(
  partial: Omit<Tool, "seen" | "schemaSignature" | "endpointPattern" | "liveExecutable"> & {
    seen?: boolean;
    schemaSignature?: string;
    endpointPattern?: string;
    liveExecutable?: boolean;
  },
): Tool {
  const joined = [...partial.parameters]
    .map((parameter) => parameter.name)
    .sort()
    .join("|");
  const schemaSignature = partial.schemaSignature ?? (joined || "none");
  const endpointPattern =
    partial.endpointPattern ??
    (partial.resourceId
      ? `resource/${partial.resourceId}`
      : `${partial.method} ${partial.collection}`);
  return {
    seen: false,
    ...partial,
    liveExecutable: Boolean(partial.liveExecutable),
    schemaSignature,
    endpointPattern,
  };
}

export const AGRICULTURE_SECTOR = "Agriculture";

const COMMON_FILTERS = params([
  ["state", "string", false, "Indian state name"],
  ["district", "string", false, "District name"],
  ["limit", "integer", false, "Maximum records to return"],
]);

export const TOOLBENCH_CATALOG: Tool[] = [
  tool({
    id: "datagov.mandi_prices",
    name: "AGMARKNET Daily Mandi Prices",
    apiName: "current_daily_mandi_prices",
    description:
      "Current daily wholesale minimum, maximum and modal prices of agricultural commodities from Indian mandis via data.gov.in AGMARKNET.",
    toolDescription: "Live agriculture market prices for crops across Indian states.",
    category: "Agriculture",
    collection: "data.gov.in",
    method: "GET",
    endpoint: "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
    resourceId: "9ef84268-d588-465a-a308-a864a43d0070",
    parameters: params([
      ["state", "string", false, "Indian state"],
      ["commodity", "string", false, "Crop or commodity name"],
      ["district", "string", false, "District or market district"],
      ["limit", "integer", false, "Number of records"],
    ]),
    source: "datagov",
    liveExecutable: true,
    tags: ["mandi", "price", "wheat", "rice", "onion", "market", "agmarknet"],
  }),
  tool({
    id: "datagov.crop_production",
    name: "District Season Crop Production",
    apiName: "district_season_crop_production",
    description:
      "District-wise, season-wise, crop-wise area and production from data.gov.in (Directorate of Economics and Statistics), resource 35be999b-0208-4354-b557-f6ca9a5355de.",
    toolDescription: "Official crop area and production statistics for Indian agriculture.",
    category: "Agriculture",
    collection: "data.gov.in",
    method: "GET",
    endpoint: "https://api.data.gov.in/resource/35be999b-0208-4354-b557-f6ca9a5355de",
    resourceId: "35be999b-0208-4354-b557-f6ca9a5355de",
    parameters: params([
      ["state", "string", false, "Indian state"],
      ["crop", "string", false, "Crop name"],
      ["season", "string", false, "Kharif, Rabi, or Whole Year"],
      ["year", "string", false, "Agricultural year"],
    ]),
    source: "datagov",
    liveExecutable: true,
    tags: ["production", "yield", "area", "kharif", "rabi", "rice", "wheat"],
  }),
  tool({
    id: "datagov.rainfall",
    name: "All-India IMD Rainfall",
    apiName: "imd_all_india_rainfall",
    description:
      "All-India area-weighted monthly, seasonal and annual rainfall (mm) from IMD via data.gov.in, resource 8196f6cc-83ff-4b56-8581-2630de9d4a5e. Used in Indian agri-climate papers alongside crop statistics.",
    toolDescription: "Live all-India rainfall series for monsoon and irrigation context.",
    category: "Agriculture",
    collection: "data.gov.in",
    method: "GET",
    endpoint: "https://api.data.gov.in/resource/8196f6cc-83ff-4b56-8581-2630de9d4a5e",
    resourceId: "8196f6cc-83ff-4b56-8581-2630de9d4a5e",
    parameters: params([
      ["year", "string", false, "Calendar year"],
      ["month", "string", false, "Month name"],
    ]),
    source: "datagov",
    liveExecutable: true,
    tags: ["rain", "monsoon", "weather", "drought", "irrigation", "imd"],
  }),
  tool({
    id: "datagov.msp",
    name: "Minimum Support Prices",
    apiName: "minimum_support_prices",
    description:
      "Ranking-only MSP lookup. No verified MSP resource UUID is executed; live prices come from AGMARKNET, not invented MSP tables.",
    toolDescription: "MSP is ranking-only until a live data.gov.in MSP resource is confirmed.",
    category: "Agriculture",
    collection: "data.gov.in",
    method: "GET",
    parameters: params([
      ["commodity", "string", true, "Crop with an MSP"],
      ["year", "string", false, "Marketing year"],
    ]),
    source: "datagov",
    tags: ["msp", "procurement", "price", "policy", "wheat", "paddy"],
  }),
  tool({
    id: "datagov.fertilizer",
    name: "Fertilizer Subsidy Statistics",
    apiName: "fertilizer_subsidy",
    description:
      "Year-wise subsidy on fertilizer products from data.gov.in, resource 2e0e6c04-97f2-456b-9309-bf605650cb11.",
    toolDescription: "Live fertilizer subsidy statistics for Indian agriculture.",
    category: "Agriculture",
    collection: "data.gov.in",
    method: "GET",
    endpoint: "https://api.data.gov.in/resource/2e0e6c04-97f2-456b-9309-bf605650cb11",
    resourceId: "2e0e6c04-97f2-456b-9309-bf605650cb11",
    parameters: COMMON_FILTERS,
    source: "datagov",
    liveExecutable: true,
    tags: ["fertilizer", "npk", "urea", "input", "subsidy"],
  }),
  tool({
    id: "datagov.horticulture",
    name: "Horticulture Production",
    apiName: "horticulture_production",
    description:
      "State-wise area and production of horticulture crops from data.gov.in, resource a2b43dcc-9cd2-4601-b183-3e859624dea4.",
    toolDescription: "Live horticulture area and production by state.",
    category: "Agriculture",
    collection: "data.gov.in",
    method: "GET",
    endpoint: "https://api.data.gov.in/resource/a2b43dcc-9cd2-4601-b183-3e859624dea4",
    resourceId: "a2b43dcc-9cd2-4601-b183-3e859624dea4",
    parameters: params([
      ["state", "string", false, "Indian state"],
      ["crop", "string", false, "Horticulture crop"],
    ]),
    source: "datagov",
    liveExecutable: true,
    tags: ["horticulture", "tomato", "onion", "fruit", "vegetable"],
  }),
  tool({
    id: "datagov.land_use",
    name: "Land Use Statistics",
    apiName: "classified_land_use",
    description:
      "Classified area under land-use statistics from data.gov.in, resource 8a3761be-1b0b-423d-a907-1f99870b365a.",
    toolDescription: "Live district-year agricultural and non-agricultural land area.",
    category: "Agriculture",
    collection: "data.gov.in",
    method: "GET",
    endpoint: "https://api.data.gov.in/resource/8a3761be-1b0b-423d-a907-1f99870b365a",
    resourceId: "8a3761be-1b0b-423d-a907-1f99870b365a",
    parameters: params([
      ["state", "string", false, "Indian state"],
      ["year", "string", false, "Year"],
    ]),
    source: "datagov",
    liveExecutable: true,
    tags: ["land", "lus", "area", "district", "agriculture"],
  }),
];

const KARNATAKA_APIS: Array<{
  id: string;
  name: string;
  api: string;
  desc: string;
  category: string;
  tags: string[];
  live?: boolean;
}> = [
  {
    id: "karnataka::ksndmc_weather",
    name: "KSNDMC Weather Forecast",
    api: "ksndmc_weather",
    desc: "Taluk-level Karnataka weather forecast and rainfall nowcast from telemetric rain gauges.",
    category: "weather",
    tags: ["weather", "karnataka", "rainfall", "ksndmc"],
  },
  {
    id: "karnataka::ksndmc_drought_monitor",
    name: "KSNDMC Drought Monitor",
    api: "ksndmc_drought_monitor",
    desc: "Karnataka drought and dry-spell monitoring for kharif advisory.",
    category: "weather",
    tags: ["drought", "karnataka", "kharif"],
  },
  {
    id: "karnataka::bhoomi_rtc",
    name: "Bhoomi RTC Land Records",
    api: "bhoomi_rtc",
    desc: "Karnataka Record of Rights, Tenancy and Crops (RTC) land-record lookup.",
    category: "land_records",
    tags: ["bhoomi", "rtc", "land", "karnataka"],
  },
  {
    id: "karnataka::raitha_mitra_advisory",
    name: "Raitha Mitra Crop Advisory",
    api: "raitha_mitra_advisory",
    desc: "Karnataka crop advisory for pests, sowing, and nutrient management.",
    category: "crop_advisory",
    tags: ["advisory", "pest", "crop", "karnataka"],
  },
  {
    id: "karnataka::ksda_pest_alert",
    name: "KSDA Pest Alert",
    api: "ksda_pest_alert",
    desc: "Karnataka pest and disease outbreak alerts for extension officers.",
    category: "pest_disease",
    tags: ["pest", "disease", "alert", "karnataka"],
  },
  {
    id: "karnataka::shc_karnataka",
    name: "Soil Health Card Karnataka",
    api: "shc_karnataka",
    desc: "District soil health card nutrients and fertilizer recommendations.",
    category: "soil",
    tags: ["soil", "npk", "karnataka"],
  },
  {
    id: "karnataka::agmarknet_ka",
    name: "AGMARKNET Karnataka Mandi",
    api: "agmarknet_ka",
    desc: "Karnataka-first view of the national AGMARKNET daily mandi price resource on data.gov.in.",
    category: "market",
    tags: ["mandi", "price", "agmarknet", "karnataka", "market"],
    live: true,
  },
  {
    id: "karnataka::pm_kisan_status",
    name: "PM-KISAN Status",
    api: "pm_kisan_status",
    desc: "PM-KISAN installment status for Karnataka farmers.",
    category: "schemes",
    tags: ["pmkisan", "scheme", "karnataka"],
  },
  {
    id: "karnataka::pmfby_karnataka",
    name: "PMFBY Karnataka",
    api: "pmfby_karnataka",
    desc: "Pradhan Mantri Fasal Bima Yojana crop-insurance enrolment for Karnataka.",
    category: "schemes",
    tags: ["insurance", "pmfby", "karnataka"],
  },
  {
    id: "karnataka::kmf_milk_price",
    name: "KMF Milk Price",
    api: "kmf_milk_price",
    desc: "Karnataka Milk Federation procurement price bulletin.",
    category: "dairy",
    tags: ["milk", "dairy", "kmf", "karnataka"],
  },
];

const karnatakaTools: Tool[] = KARNATAKA_APIS.map((item) =>
  tool({
    id: item.id,
    name: item.name,
    apiName: item.api,
    description: item.desc,
    toolDescription: item.desc,
    category: "Agriculture",
    collection: "karnataka.gov.in",
    method: "GET",
    resourceId: item.live ? "9ef84268-d588-465a-a308-a864a43d0070" : undefined,
    parameters: params([
      ["state", "string", false, "Indian state", "Karnataka"],
      ["district", "string", false, "District"],
      ["commodity", "string", false, "Crop or commodity"],
      ["query", "string", true, "Farmer query"],
    ]),
    source: "karnataka",
    liveExecutable: Boolean(item.live),
    tags: item.tags,
  }),
);

const RAPID_TOOLS: Array<{
  id: string;
  name: string;
  api: string;
  desc: string;
  category: string;
  collection: string;
  tags: string[];
  parameters?: Tool["parameters"];
}> = [
  {
    id: "tb.agri.soil_health",
    name: "Soil Health Card Lookup",
    api: "soil_health_card",
    desc: "Retrieve soil nutrient status, pH, and recommended fertilizer dose for a farm village.",
    category: "Agriculture",
    collection: "RapidAPI-Agriculture",
    tags: ["soil", "ph", "nutrient", "fertilizer", "card"],
  },
  {
    id: "tb.agri.crop_calendar",
    name: "Crop Sowing Calendar",
    api: "crop_sowing_calendar",
    desc: "Recommended sowing windows for Kharif and Rabi crops given state and rainfall.",
    category: "Agriculture",
    collection: "RapidAPI-Agriculture",
    tags: ["sowing", "calendar", "kharif", "rabi", "season"],
  },
  {
    id: "tb.agri.pest_advisory",
    name: "Pest and Disease Advisory",
    api: "pest_disease_advisory",
    desc: "Identify likely pests and issue integrated pest-management advice for a crop.",
    category: "Agriculture",
    collection: "RapidAPI-Agriculture",
    tags: ["pest", "disease", "ipm", "advisory", "crop"],
  },
  {
    id: "tb.agri.irrigation_schedule",
    name: "Irrigation Scheduler",
    api: "irrigation_schedule",
    desc: "Compute irrigation interval from crop stage, soil type, and recent rainfall.",
    category: "Agriculture",
    collection: "RapidAPI-Agriculture",
    tags: ["irrigation", "water", "schedule", "et0"],
  },
  {
    id: "tb.agri.seed_variety",
    name: "Seed Variety Recommender",
    api: "seed_variety_recommend",
    desc: "Recommend certified seed varieties for a district and season.",
    category: "Agriculture",
    collection: "RapidAPI-Agriculture",
    tags: ["seed", "variety", "certified", "yield"],
  },
  {
    id: "tb.weather.forecast",
    name: "Agro Weather Forecast",
    api: "agro_weather_forecast",
    desc: "7-day temperature, rainfall, and humidity forecast tailored to farm operations.",
    category: "Weather",
    collection: "RapidAPI-Weather",
    tags: ["forecast", "temperature", "rain", "humidity"],
  },
  {
    id: "tb.weather.alerts",
    name: "Weather Hazard Alerts",
    api: "weather_hazard_alerts",
    desc: "Heatwave, heavy rain, hail, and cyclone alerts affecting agricultural markets.",
    category: "Weather",
    collection: "RapidAPI-Weather",
    tags: ["alert", "heatwave", "cyclone", "hail"],
  },
  {
    id: "tb.finance.kisan_credit",
    name: "Kisan Credit Eligibility",
    api: "kisan_credit_eligibility",
    desc: "Estimate Kisan Credit Card eligibility and indicative limit from land holding.",
    category: "Finance",
    collection: "RapidAPI-Finance",
    tags: ["credit", "loan", "kcc", "bank"],
  },
  {
    id: "tb.finance.crop_insurance",
    name: "PMFBY Crop Insurance Quote",
    api: "pmfby_quote",
    desc: "Quote Pradhan Mantri Fasal Bima Yojana premium for a crop and notified area.",
    category: "Finance",
    collection: "RapidAPI-Finance",
    tags: ["insurance", "pmfby", "premium", "risk"],
  },
  {
    id: "tb.data.search_catalog",
    name: "Open Data Catalog Search",
    api: "ogd_catalog_search",
    desc: "Search the data.gov.in catalog by keyword, sector, and organization.",
    category: "Data",
    collection: "RapidAPI-Data",
    tags: ["catalog", "search", "dataset", "ogd", "api"],
  },
  {
    id: "tb.data.schema_inspect",
    name: "Dataset Schema Inspector",
    api: "dataset_schema_inspect",
    desc: "Inspect field names, types, and sample rows for an OGD resource id.",
    category: "Data",
    collection: "RapidAPI-Data",
    tags: ["schema", "fields", "resource", "metadata"],
  },
  {
    id: "tb.map.geocode_village",
    name: "Village Geocoder",
    api: "village_geocode",
    desc: "Resolve an Indian village or mandi name to lat/long and district.",
    category: "Mapping",
    collection: "RapidAPI-Maps",
    tags: ["geocode", "village", "mandi", "coordinates"],
  },
  {
    id: "tb.food.nutrition",
    name: "Crop Nutrition Facts",
    api: "crop_nutrition_facts",
    desc: "Nutrition composition for food grains and horticulture produce.",
    category: "Food",
    collection: "RapidAPI-Food",
    tags: ["nutrition", "calorie", "protein", "food"],
  },
  {
    id: "tb.commerce.export_price",
    name: "Agri Export Reference Price",
    api: "agri_export_price",
    desc: "Indicative FOB export prices for spices, rice, and cotton.",
    category: "Commerce",
    collection: "RapidAPI-Commerce",
    tags: ["export", "fob", "trade", "spice", "cotton"],
  },
  {
    id: "tb.energy.pumpset",
    name: "Farm Pumpset Load",
    api: "farm_pumpset_load",
    desc: "Estimate irrigation pump electricity load and hours of operation.",
    category: "Energy",
    collection: "RapidAPI-Energy",
    tags: ["pump", "electricity", "irrigation", "load"],
  },
  {
    id: "tb.transport.logistics",
    name: "Mandi Logistics Cost",
    api: "mandi_logistics_cost",
    desc: "Estimate transport cost from farm gate to a selected mandi.",
    category: "Transportation",
    collection: "RapidAPI-Transport",
    tags: ["transport", "logistics", "freight", "mandi"],
  },
  {
    id: "tb.media.news_agri",
    name: "Agriculture News Digest",
    api: "agriculture_news_digest",
    desc: "Recent policy, weather, and market headlines relevant to farmers.",
    category: "News",
    collection: "RapidAPI-News",
    tags: ["news", "policy", "headline", "market"],
  },
  {
    id: "tb.science.ndvi",
    name: "NDVI Crop Vigor",
    api: "ndvi_crop_vigor",
    desc: "Satellite NDVI summary for a district used as a crop-health proxy.",
    category: "Science",
    collection: "RapidAPI-Science",
    tags: ["ndvi", "satellite", "vigor", "remote-sensing"],
  },
  {
    id: "tb.storage.warehouse",
    name: "WDRA Warehouse Availability",
    api: "wdra_warehouse_availability",
    desc: "Look up accredited warehouse capacity near a district.",
    category: "Storage",
    collection: "RapidAPI-Storage",
    tags: ["warehouse", "storage", "wdra", "capacity"],
  },
  {
    id: "tb.policy.scheme_match",
    name: "Farmer Scheme Matcher",
    api: "farmer_scheme_matcher",
    desc: "Match a farmer profile to PM-KISAN, PMFBY, and state top-up schemes.",
    category: "Government",
    collection: "RapidAPI-Government",
    tags: ["scheme", "pm-kisan", "subsidy", "eligibility"],
  },
  {
    id: "tb.email.notify",
    name: "Sector Brief Emailer",
    api: "sector_brief_email",
    desc: "Compose an agriculture sector brief for a registered researcher email.",
    category: "Communication",
    collection: "RapidAPI-Email",
    tags: ["email", "brief", "notify", "report"],
  },
  {
    id: "tb.search.web",
    name: "Web Search",
    api: "web_search",
    desc: "General web search. Often a distractor when a domain API is more appropriate.",
    category: "Search",
    collection: "RapidAPI-Search",
    tags: ["search", "web", "general"],
  },
  {
    id: "tb.social.twitter",
    name: "Social Mention Tracker",
    api: "social_mentions",
    desc: "Track social mentions. Rarely the correct tool for official agriculture statistics.",
    category: "Social",
    collection: "RapidAPI-Social",
    tags: ["twitter", "social", "mentions"],
  },
  {
    id: "tb.entertainment.movies",
    name: "Movie Showtimes",
    api: "movie_showtimes",
    desc: "Cinema listings. Negative distractor unrelated to agriculture queries.",
    category: "Entertainment",
    collection: "RapidAPI-Entertainment",
    tags: ["movie", "showtime", "cinema"],
  },
  {
    id: "tb.sports.cricket",
    name: "Live Cricket Scores",
    api: "live_cricket_scores",
    desc: "Cricket scores. Negative distractor for ToolBench hard-negative training.",
    category: "Sports",
    collection: "RapidAPI-Sports",
    tags: ["cricket", "score", "sports"],
  },
  {
    id: "tb.travel.flights",
    name: "Flight Status",
    api: "flight_status",
    desc: "Airline flight status. Negative distractor for agricultural tool retrieval.",
    category: "Travel",
    collection: "RapidAPI-Travel",
    tags: ["flight", "airport", "status"],
  },
  {
    id: "tb.health.covid",
    name: "Health Facility Locator",
    api: "health_facility_locator",
    desc: "Locate hospitals. Off-domain distractor unless the query is about rural health.",
    category: "Health",
    collection: "RapidAPI-Health",
    tags: ["hospital", "health", "facility"],
  },
  {
    id: "tb.commerce.amazon",
    name: "Product Price Search",
    api: "product_price_search",
    desc: "E-commerce product prices. Confusable with mandi prices if ranking is only lexical.",
    category: "eCommerce",
    collection: "RapidAPI-Commerce",
    tags: ["amazon", "product", "price", "shop"],
  },
  {
    id: "tb.finance.stock",
    name: "Equity Quote",
    api: "equity_quote",
    desc: "Stock market quotes. Confusable with commodity prices without session context.",
    category: "Finance",
    collection: "RapidAPI-Finance",
    tags: ["stock", "equity", "nse", "quote"],
  },
  {
    id: "tb.weather.astronomy",
    name: "Moon Phase",
    api: "moon_phase",
    desc: "Astronomical moon phase. Weakly related to agriculture folklore, usually a distractor.",
    category: "Weather",
    collection: "RapidAPI-Weather",
    tags: ["moon", "phase", "astronomy"],
  },
];

const OFF_SECTOR_TOOL_IDS = new Set([
  "tb.search.web",
  "tb.social.twitter",
  "tb.entertainment.movies",
  "tb.sports.cricket",
  "tb.travel.flights",
  "tb.health.covid",
  "tb.commerce.amazon",
  "tb.finance.stock",
  "tb.weather.astronomy",
]);

const generated: Tool[] = RAPID_TOOLS.filter((item) => !OFF_SECTOR_TOOL_IDS.has(item.id)).map((item) =>
  tool({
    id: item.id,
    name: item.name,
    apiName: item.api,
    description: item.desc,
    toolDescription: item.desc,
    category: AGRICULTURE_SECTOR,
    collection: item.collection,
    method: "GET",
    parameters:
      item.parameters ??
      params([
        ["query", "string", true, "Free-text query"],
        ["state", "string", false, "Indian state if relevant"],
        ["limit", "integer", false, "Result limit"],
      ]),
    source: "toolbench",
    tags: item.tags,
  }),
);

export const FULL_CATALOG: Tool[] = [...TOOLBENCH_CATALOG, ...karnatakaTools, ...generated];

export function getCatalog(_sector: string = AGRICULTURE_SECTOR): Tool[] {
  return FULL_CATALOG.filter((tool) => tool.category === AGRICULTURE_SECTOR);
}

export function getTool(id: string): Tool | undefined {
  return FULL_CATALOG.find((item) => item.id === id);
}

export const CATALOG_STATS = {
  sector: AGRICULTURE_SECTOR,
  nTools: getCatalog().length,
  nCategories: new Set(getCatalog().map((tool) => tool.category)).size,
  nDatagov: getCatalog().filter((tool) => tool.source === "datagov").length,
  nLive: getCatalog().filter((tool) => tool.liveExecutable).length,
  nToolbench: getCatalog().filter((tool) => tool.source === "toolbench").length,
};
