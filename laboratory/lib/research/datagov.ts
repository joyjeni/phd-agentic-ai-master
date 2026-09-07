import { extractSlot, extractYear, INDIAN_STATES, COMMODITIES } from "./text";
import type { Tool } from "./types";

export const MANDI_RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070";
export const MANDI_URL = `https://api.data.gov.in/resource/${MANDI_RESOURCE}`;
export const MANDI_PAGE =
  "https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi";
export const PREFERRED_STATE = "Karnataka";
export const RESOURCE_CITATION =
  "Current Daily Price of Various Commodities from Various Markets (Mandi), Ministry of Agriculture and Farmers Welfare, data.gov.in";

/**
 * Visualization key published on the public data.gov.in resource page
 * (`field_datafile_url`). Not a fabricated dataset and not a personal secret.
 * A user/env key always wins; this is only used so the lab can read live rows
 * without blocking on registration.
 *
 * data.gov.in Elastic windows reject `limit=all` once the resource exceeds
 * 10,000 rows (`index.max_result_window`). We therefore cap at 10000 live
 * rows — still live OGD, never a snapshot file.
 */
const PORTAL_VISUALIZATION_KEY =
  "579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645";

export type MandiRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
};

export type AgriSnapshot = {
  records: MandiRecord[];
  fetchedAt: string;
  totalRecordsScanned: number;
  statesSeen: string[];
  usedNationalFallback: boolean;
  notes: string;
  sourceUrl: string;
  keySource: "user" | "env" | "portal";
};

export class LiveDataGovError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiveDataGovError";
  }
}

export const RESOURCE_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function assertResourceId(resourceId: string): string {
  const id = resourceId.trim();
  if (!RESOURCE_UUID.test(id)) {
    throw new LiveDataGovError(
      `Refusing to call data.gov.in with a non-UUID resource id (${resourceId}).`,
    );
  }
  return id;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retry transient network / 5xx / 429. Do not retry ordinary 4xx. Never fall back to snapshot files. */
export async function fetchWithRetry(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  attempts = 4,
  delays: number[] = [0, 400, 1200, 2800],
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    if (delays[i]) await sleep(delays[i]);
    try {
      const response = await fetchImpl(url, init);
      if (response.ok || (response.status < 500 && response.status !== 429)) {
        return response;
      }
      lastError = new LiveDataGovError(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError instanceof Error) throw lastError;
  throw new LiveDataGovError("data.gov.in request failed after retries. Records were not invented.");
}

type CacheEntry = { at: number; snapshot: AgriSnapshot };
let snapshotCache: CacheEntry | null = null;
const CACHE_MS = 15 * 60 * 1000;

export function clearMandiCache() {
  snapshotCache = null;
}

function asText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function parseRecords(payload: { records?: Array<Record<string, unknown>> }): MandiRecord[] {
  return (payload.records ?? []).map((rec) => ({
    state: asText(rec.state),
    district: asText(rec.district),
    market: asText(rec.market),
    commodity: asText(rec.commodity),
    variety: asText(rec.variety),
    grade: asText(rec.grade),
    arrival_date: asText(rec.arrival_date),
    min_price: asText(rec.min_price),
    max_price: asText(rec.max_price),
    modal_price: asText(rec.modal_price),
  }));
}

function byState(records: MandiRecord[], state: string): MandiRecord[] {
  const key = state.trim().toLowerCase();
  return records.filter((row) => row.state.trim().toLowerCase() === key);
}

function byCommodity(records: MandiRecord[], commodity: string): MandiRecord[] {
  const key = commodity.trim().toLowerCase();
  return records.filter((row) => row.commodity.toLowerCase().includes(key));
}

function nationalSample(records: MandiRecord[], nKeep: number): MandiRecord[] {
  const buckets = new Map<string, MandiRecord[]>();
  for (const row of records) {
    const list = buckets.get(row.commodity) ?? [];
    list.push(row);
    buckets.set(row.commodity, list);
  }
  const sample: MandiRecord[] = [];
  for (const recs of [...buckets.values()].sort((a, b) => b.length - a.length)) {
    sample.push(...recs.slice(0, 3));
    if (sample.length >= nKeep) break;
  }
  return sample.slice(0, nKeep);
}

function uniquePush(target: MandiRecord[], extra: MandiRecord[]) {
  const seen = new Set(target.map((row) => `${row.state}|${row.market}|${row.commodity}|${row.arrival_date}`));
  for (const row of extra) {
    const id = `${row.state}|${row.market}|${row.commodity}|${row.arrival_date}`;
    if (seen.has(id)) continue;
    seen.add(id);
    target.push(row);
  }
}

export function selectKarnatakaFirstWithFallback(
  allRecords: MandiRecord[],
  args: Record<string, string>,
  nKeep = 25,
): { records: MandiRecord[]; usedNationalFallback: boolean; notes: string } {
  const requestedState = args.state?.trim();
  const commodity = args.commodity?.trim();
  const notes: string[] = [];
  const selected: MandiRecord[] = [];
  let usedNationalFallback = false;

  const stateRows = requestedState ? byState(allRecords, requestedState) : [];
  const cropRows = commodity ? byCommodity(allRecords, commodity) : [];
  const both =
    requestedState && commodity
      ? stateRows.filter((row) => row.commodity.toLowerCase().includes(commodity.toLowerCase()))
      : [];

  if (both.length) {
    return {
      records: both.slice(0, nKeep),
      usedNationalFallback: false,
      notes: `Live AGMARKNET: ${both.length} ${commodity} row(s) in ${requestedState} from ${allRecords.length} arrivals dated ${allRecords[0]?.arrival_date || "today"}.`,
    };
  }

  if (stateRows.length) {
    uniquePush(selected, stateRows.slice(0, 12));
    notes.push(
      commodity
        ? `No live ${commodity} in ${requestedState} among ${allRecords.length} AGMARKNET rows today. Showing other live ${requestedState} arrivals (${stateRows.length} rows) instead of inventing ${commodity} prices.`
        : `Client-side filter kept ${stateRows.length} live ${requestedState} rows.`,
    );
  } else if (requestedState) {
    const karnataka = byState(allRecords, PREFERRED_STATE);
    if (karnataka.length) {
      uniquePush(selected, karnataka.slice(0, 12));
      usedNationalFallback = true;
      notes.push(
        `No ${requestedState} rows in today's feed. Karnataka-first live records used; prices are still from data.gov.in.`,
      );
    }
  }

  if (commodity && cropRows.length) {
    uniquePush(selected, cropRows.slice(0, 10));
    const states = [...new Set(cropRows.map((row) => row.state))].slice(0, 8).join(", ");
    notes.push(
      `Live ${commodity} is reported in ${cropRows.length} row(s) from: ${states}.`,
    );
    if (requestedState && !both.length) usedNationalFallback = true;
  }

  if (!selected.length) {
    uniquePush(selected, nationalSample(allRecords, nKeep));
    usedNationalFallback = true;
    notes.push(
      `No Karnataka rows and no requested-state match in ${allRecords.length} live records. National live sample shown — not simulated.`,
    );
  }

  return {
    records: selected.slice(0, nKeep),
    usedNationalFallback,
    notes: notes.join(" "),
  };
}

function resolveKey(userKey?: string): { key: string; source: AgriSnapshot["keySource"] } {
  const trimmed = userKey?.trim();
  if (trimmed) return { key: trimmed, source: "user" };
  const envKey = process.env.DATA_GOV_API_KEY?.trim();
  if (envKey) return { key: envKey, source: "env" };
  return { key: PORTAL_VISUALIZATION_KEY, source: "portal" };
}

async function scrapePortalKey(fetchImpl: typeof fetch): Promise<string | null> {
  try {
    const response = await fetchWithRetry(fetchImpl, MANDI_PAGE, {
      cache: "no-store",
      headers: { Accept: "text/html" },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) return null;
    const html = await response.text();
    const match = html.match(/api-key=([0-9a-f]{40,64})/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function fetchPage(
  fetchImpl: typeof fetch,
  apiKey: string,
  limit: string,
): Promise<{ records: MandiRecord[]; total: number; status: number; error?: string }> {
  const url = new URL(`https://api.data.gov.in/resource/${assertResourceId(MANDI_RESOURCE)}`);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("offset", "0");
  url.searchParams.set("limit", limit === "all" ? "10000" : limit);
  const response = await fetchWithRetry(fetchImpl, url.toString(), {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { error?: string };
      detail = body.error ? `: ${body.error}` : "";
    } catch {
      detail = "";
    }
    return { records: [], total: 0, status: response.status, error: `HTTP ${response.status}${detail}` };
  }
  const payload = (await response.json()) as {
    records?: Array<Record<string, unknown>>;
    total?: number;
    error?: string;
    status?: string;
  };
  if (payload.error && !payload.records?.length) {
    return { records: [], total: 0, status: 403, error: payload.error };
  }
  const records = parseRecords(payload);
  return { records, total: Number(payload.total || records.length), status: 200 };
}

export async function fetchMandiSnapshot(options: {
  apiKey?: string;
  maxPages?: number;
  pageSize?: number;
  fetchImpl?: typeof fetch;
  bypassCache?: boolean;
}): Promise<AgriSnapshot> {
  const fetchImpl = options.fetchImpl ?? fetch;
  if (!options.bypassCache && snapshotCache && Date.now() - snapshotCache.at < CACHE_MS) {
    return snapshotCache.snapshot;
  }

  let { key, source } = resolveKey(options.apiKey);
  let page = await fetchPage(fetchImpl, key, "all");
  if (page.status === 403 || page.status === 401 || page.status === 400) {
    const scraped = await scrapePortalKey(fetchImpl);
    if (scraped && scraped !== key) {
      key = scraped;
      source = "portal";
      page = await fetchPage(fetchImpl, key, "all");
    }
  }
  if (page.error || !page.records.length) {
    throw new LiveDataGovError(
      page.error
        ? `data.gov.in mandi resource failed (${page.error}). Live path only — prices were not invented.`
        : "data.gov.in returned zero mandi records today. Refusing to fabricate prices.",
    );
  }

  const states = [...new Set(page.records.map((row) => row.state).filter(Boolean))].sort();
  const snapshot: AgriSnapshot = {
    records: page.records,
    fetchedAt: new Date().toISOString(),
    totalRecordsScanned: page.records.length,
    statesSeen: states,
    usedNationalFallback: false,
    notes: `Live data.gov.in AGMARKNET: ${page.records.length} of ${page.total} arrivals across ${states.length} states (key source: ${source}).`,
    sourceUrl: MANDI_URL,
    keySource: source,
  };
  snapshotCache = { at: Date.now(), snapshot };
  return snapshot;
}

export function extractToolArguments(query: string, tool: Tool): Record<string, string> {
  const args: Record<string, string> = {};
  const state = extractSlot(query, INDIAN_STATES);
  const commodity = extractSlot(query, COMMODITIES);
  const year = extractYear(query);
  for (const parameter of tool.parameters) {
    if (parameter.name === "state" && state) args.state = state;
    else if (parameter.name === "commodity" && commodity) args.commodity = commodity;
    else if (parameter.name === "crop" && commodity) args.crop = commodity;
    else if (parameter.name === "year" && year) args.year = year;
    else if (parameter.name === "query") args.query = query;
    // Do not inject schema defaults (e.g. Wheat/Punjab) — that would fabricate a query the user did not ask.
  }
  if (tool.source === "karnataka" && !args.state) args.state = "Karnataka";
  return args;
}

function isMandiTool(tool: Tool): boolean {
  return (
    tool.liveExecutable === true &&
    (tool.resourceId === MANDI_RESOURCE ||
      tool.id === "datagov.mandi_prices" ||
      tool.id === "karnataka::agmarknet_ka")
  );
}

const RESOURCE_FILTERS: Record<string, { state?: string; crop?: string; year?: string; season?: string }> = {
  "35be999b-0208-4354-b557-f6ca9a5355de": {
    state: "state_name",
    crop: "crop",
    year: "crop_year",
    season: "season",
  },
  "a2b43dcc-9cd2-4601-b183-3e859624dea4": { state: "state__ut_name" },
  "8196f6cc-83ff-4b56-8581-2630de9d4a5e": { year: "year" },
  "8a3761be-1b0b-423d-a907-1f99870b365a": { state: "state", year: "year" },
};

export function preferredLiveToolId(query: string): string {
  const q = query.toLowerCase();
  const price = /\b(price|mandi|modal|agmarknet|wholesale)\b/.test(q);
  if (/\b(rain|rainfall|monsoon|imd)\b/.test(q) && !price) return "datagov.rainfall";
  if (/\b(land use|land-use|lus)\b/.test(q) && !price) return "datagov.land_use";
  if (/\b(horticulture|fruit)\b/.test(q) && !price) return "datagov.horticulture";
  if (/\b(fertilizer|urea|npk|subsidy)\b/.test(q) && !price) return "datagov.fertilizer";
  if (/\b(production|yield|hectare|tonne|kharif|rabi)\b/.test(q) && !price) {
    return "datagov.crop_production";
  }
  return "datagov.mandi_prices";
}

async function fetchResourceRecords(
  resourceId: string,
  options: {
    apiKey?: string;
    fetchImpl?: typeof fetch;
    limit?: string;
    filters?: Record<string, string>;
  },
): Promise<{ records: Array<Record<string, unknown>>; total: number; keySource: AgriSnapshot["keySource"] }> {
  const fetchImpl = options.fetchImpl ?? fetch;
  let { key, source } = resolveKey(options.apiKey);
  const id = assertResourceId(resourceId);
  const buildUrl = (apiKey: string) => {
    const url = new URL(`https://api.data.gov.in/resource/${id}`);
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("offset", "0");
    url.searchParams.set(
      "limit",
      options.limit === "all" ? "10000" : (options.limit ?? "50"),
    );
    for (const [field, value] of Object.entries(options.filters ?? {})) {
      if (value) url.searchParams.set(`filters[${field}]`, value);
    }
    return url.toString();
  };
  const load = async (apiKey: string) => {
    const response = await fetchWithRetry(fetchImpl, buildUrl(apiKey), {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) return { records: [] as Array<Record<string, unknown>>, total: 0, status: response.status };
    const payload = (await response.json()) as {
      records?: Array<Record<string, unknown>>;
      total?: number;
      error?: string;
    };
    if (payload.error && !payload.records?.length) {
      return { records: [], total: 0, status: 403 };
    }
    const records = payload.records ?? [];
    return { records, total: Number(payload.total || records.length), status: 200 };
  };
  let page = await load(key);
  if (page.status === 403 || page.status === 401 || page.status === 400) {
    const scraped = await scrapePortalKey(fetchImpl);
    if (scraped && scraped !== key) {
      key = scraped;
      source = "portal";
      page = await load(key);
    }
  }
  if (!page.records.length) {
    throw new LiveDataGovError(
      `data.gov.in resource ${resourceId} returned no live rows. Records were not invented.`,
    );
  }
  return { records: page.records, total: page.total, keySource: source };
}

function summarizeGenericRecords(
  tool: Tool,
  records: Array<Record<string, unknown>>,
  scanned: number,
): string {
  const preview = records.slice(0, 5).map((row) =>
    Object.entries(row)
      .slice(0, 6)
      .map(([key, value]) => `${key}=${value}`)
      .join(", "),
  );
  return `Live data.gov.in Agriculture resource ${tool.resourceId} (${tool.name}): ${records.length} of ${scanned} rows. ${preview.join(" | ")}`;
}

async function executeCatalogResource(
  tool: Tool,
  args: Record<string, string>,
  options: { apiKey?: string; fetchImpl?: typeof fetch },
): Promise<{
  ok: boolean;
  source: "live" | "catalog-only" | "error";
  payload: unknown;
  summary: string;
}> {
  if (!tool.resourceId) {
    return {
      ok: false,
      source: "catalog-only",
      payload: { tool: tool.id },
      summary: `${tool.name} is Agriculture ranking-only; no live data.gov.in UUID is executed.`,
    };
  }
  const mapping = RESOURCE_FILTERS[tool.resourceId] ?? {};
  const filters: Record<string, string> = {};
  if (mapping.state && args.state) filters[mapping.state] = args.state;
  if (mapping.crop && (args.crop || args.commodity)) filters[mapping.crop] = args.crop || args.commodity;
  if (mapping.year && args.year) filters[mapping.year] = args.year;
  if (mapping.season && args.season) filters[mapping.season] = args.season;
  try {
    const page = await fetchResourceRecords(tool.resourceId, {
      ...options,
      limit:
        tool.resourceId === "a2b43dcc-9cd2-4601-b183-3e859624dea4" ||
        tool.resourceId === "8196f6cc-83ff-4b56-8581-2630de9d4a5e" ||
        tool.resourceId === "2e0e6c04-97f2-456b-9309-bf605650cb11"
          ? "all"
          : "50",
      filters,
    });
    let records = page.records;
    if (args.state && mapping.state) {
      const key = args.state.toLowerCase();
      const matched = records.filter((row) => String(row[mapping.state!] ?? "").toLowerCase().includes(key));
      if (matched.length) records = matched;
    }
    const summary = summarizeGenericRecords(tool, records, page.total);
    return {
      ok: true,
      source: "live",
      payload: {
        resourceId: tool.resourceId,
        records: records.slice(0, 12),
        scanned: page.total,
        keySource: page.keySource,
        filters,
      },
      summary,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Live Agriculture fetch failed.";
    return { ok: false, source: "error", payload: { error: message }, summary: message };
  }
}

function modalNumber(row: MandiRecord): number | null {
  const value = Number(row.modal_price);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function formatLiveAnswer(
  records: MandiRecord[],
  notes: string,
  scanned: number,
): string {
  if (!records.length) {
    return `Live data.gov.in returned ${scanned} AGMARKNET rows but none passed the client-side filter. ${notes}`;
  }
  const lines = records.slice(0, 6).map((row) => {
    const modal = modalNumber(row);
    const price = modal == null ? "price n/a" : `Rs ${modal}/quintal`;
    return `${row.commodity} at ${row.market}, ${row.district}, ${row.state}: modal ${price} (${row.arrival_date}).`;
  });
  return `${notes} ${lines.join(" ")} Source: ${RESOURCE_CITATION} (${MANDI_RESOURCE}).`;
}

export async function executeTool(
  tool: Tool,
  args: Record<string, string>,
  options: { apiKey?: string; fetchImpl?: typeof fetch } = {},
): Promise<{
  ok: boolean;
  source: "live" | "catalog-only" | "error";
  payload: unknown;
  summary: string;
}> {
  if (!isMandiTool(tool)) {
    if (tool.liveExecutable && tool.resourceId && tool.resourceId !== MANDI_RESOURCE) {
      return executeCatalogResource(tool, args, options);
    }
    return {
      ok: false,
      source: "catalog-only",
      payload: { tool: tool.id, note: "Not a live data.gov.in Agriculture resource" },
      summary: `${tool.name} is not executed. This lab reads only live data.gov.in Agriculture rows.`,
    };
  }

  try {
    const snapshot = await fetchMandiSnapshot(options);
    const selected = selectKarnatakaFirstWithFallback(snapshot.records, args);
    const records = selected.records;
    const modals = records.map(modalNumber).filter((value): value is number => value != null);
    if (!records.length) {
      return {
        ok: false,
        source: "error",
        payload: { scanned: snapshot.totalRecordsScanned, notes: selected.notes },
        summary: `Live AGMARKNET returned no rows after client-side filters. ${selected.notes}`,
      };
    }
    const avg = modals.length
      ? Math.round(modals.reduce((a, b) => a + b, 0) / modals.length)
      : null;
    const summary = formatLiveAnswer(
      records,
      `${selected.notes}${avg != null ? ` Mean modal of shown rows: Rs ${avg}/quintal.` : ""}`,
      snapshot.totalRecordsScanned,
    );
    return {
      ok: true,
      source: "live",
      payload: {
        resourceId: MANDI_RESOURCE,
        citation: RESOURCE_CITATION,
        records: records.slice(0, 12),
        average_modal: avg,
        usedNationalFallback: selected.usedNationalFallback,
        statesSeen: snapshot.statesSeen,
        scanned: snapshot.totalRecordsScanned,
        fetchedAt: snapshot.fetchedAt,
        keySource: snapshot.keySource,
        notes: selected.notes,
      },
      summary,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Live mandi fetch failed.";
    return {
      ok: false,
      source: "error",
      payload: { error: message },
      summary: message,
    };
  }
}

export function summarizeRecordsForAnswer(summaries: string[]): string {
  if (!summaries.length) {
    return "The mesh did not obtain live data.gov.in records. No simulated mandi prices were substituted.";
  }
  return summaries.join(" ");
}
