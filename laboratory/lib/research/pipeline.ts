import { aprrRoute, defaultAffinity, updateAgentRewards } from "./aprr";
import { CATALOG_STATS, getCatalog } from "./catalog";
import { summarizeRecordsForAnswer } from "./datagov";
import { buildTraceContext, fcnpPrune } from "./fcnp";
import { mncdExecute } from "./mncd";
import { emptyCoactivation, satrRerank, updateCoactivation } from "./satr";
import { nowId } from "./text";
import type {
  AprrResult,
  FcnpResult,
  MncdResult,
  PipelineRequest,
  PipelineTrace,
  SatrResult,
  SessionState,
} from "./types";

export const DEFAULT_EMAIL = "joyjeni@gmail.com";
export const DEFAULT_SECTOR = "Agriculture";

export function normalizeSector(_sector?: string): string {
  return DEFAULT_SECTOR;
}

export function createSession(
  email = DEFAULT_EMAIL,
  _sector = DEFAULT_SECTOR,
): SessionState {
  return {
    id: nowId("session"),
    email,
    sector: DEFAULT_SECTOR,
    history: [],
    memory: [],
    agentRewards: {},
    agentCounts: {},
    coactivation: emptyCoactivation(),
    affinityW: defaultAffinity(),
    epsilon: 0,
    peerStats: {},
  };
}

function stageStatus(ok: boolean, empty: boolean): "ok" | "degraded" | "empty" {
  if (empty) return "empty";
  return ok ? "ok" : "degraded";
}

export type PipelineInvoke = {
  mode?: "local" | "http";
  origin?: string;
  fetchImpl?: typeof fetch;
};

async function postJson<T>(origin: string, path: string, body: unknown, fetchImpl: typeof fetch): Promise<T> {
  const response = await fetchImpl(`${origin}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `${path} failed (${response.status})`);
  }
  return payload;
}

export async function runSatrService(input: {
  query: string;
  session?: SessionState;
  topK?: number;
}): Promise<SatrResult> {
  return satrRerank(input.query, input.session, getCatalog(), input.topK ?? 8);
}

export async function runAprrService(input: {
  query: string;
  satr: SatrResult;
  session?: SessionState;
}): Promise<AprrResult> {
  return aprrRoute(input.query, input.satr.truncated, input.session);
}

export async function runMncdService(input: {
  query: string;
  aprr: AprrResult;
  session?: SessionState;
  apiKey?: string;
  fetchImpl?: typeof fetch;
}): Promise<MncdResult> {
  return mncdExecute(input.query, input.aprr, input.session, {
    apiKey: input.apiKey,
    fetchImpl: input.fetchImpl,
  });
}

export async function runFcnpService(input: {
  query: string;
  mncd: MncdResult;
  session?: SessionState;
  turnIndex: number;
}): Promise<FcnpResult> {
  const elements = buildTraceContext(input.query, input.mncd, input.session, input.turnIndex);
  return fcnpPrune(elements, input.turnIndex, 0.42, input.query);
}

export async function runPipeline(
  request: PipelineRequest,
  invoke: PipelineInvoke = {},
): Promise<PipelineTrace> {
  const timings: Record<string, number> = {};
  const query = request.query.trim();
  const session = request.session ?? createSession(request.email, request.sector);
  session.email = request.email || session.email || DEFAULT_EMAIL;
  session.sector = DEFAULT_SECTOR;
  session.coactivation ??= emptyCoactivation();
  session.affinityW ??= defaultAffinity();
  session.peerStats ??= {};
  const apiKey = request.apiKey || process.env.DATA_GOV_API_KEY || "";
  const fetchImpl = invoke.fetchImpl ?? fetch;
  const http = invoke.mode === "http" && invoke.origin;

  let t0 = Date.now();
  const satr = http
    ? await postJson<SatrResult>(invoke.origin!, "/api/services/satr", { query, session, topK: request.topK }, fetchImpl)
    : await runSatrService({ query, session, topK: request.topK });
  timings.satr = Date.now() - t0;

  t0 = Date.now();
  const aprr = http
    ? await postJson<AprrResult>(invoke.origin!, "/api/services/aprr", { query, satr, session }, fetchImpl)
    : await runAprrService({ query, satr, session });
  timings.aprr = Date.now() - t0;

  t0 = Date.now();
  const mncd = http
    ? await postJson<MncdResult>(
        invoke.origin!,
        "/api/services/mncd",
        { query, aprr, session, apiKey },
        fetchImpl,
      )
    : await runMncdService({ query, aprr, session, apiKey, fetchImpl });
  timings.mncd = Date.now() - t0;

  const turnIndex = session.history.length + 1;
  t0 = Date.now();
  const fcnp = http
    ? await postJson<FcnpResult>(
        invoke.origin!,
        "/api/services/fcnp",
        { query, mncd, session, turnIndex },
        fetchImpl,
      )
    : await runFcnpService({ query, mncd, session, turnIndex });
  timings.fcnp = Date.now() - t0;

  const executedOk = mncd.executed.filter((item) => item.ok);
  const failed = mncd.executed.filter((item) => !item.ok).map((item) => item.toolId);
  const liveOk = executedOk.some((item) => item.source === "live");
  const answer = query
    ? summarizeRecordsForAnswer(executedOk.map((item) => item.summary))
    : "Provide an agricultural query to start the four-objective pipeline.";

  const latencyNorm = Math.min(
    1,
    (mncd.executed.reduce((sum, item) => sum + item.latencyMs, 0) || 80) / 400,
  );
  const success = liveOk;
  let nextSession = updateAgentRewards(session, mncd.nodes, success, latencyNorm);
  const chosen = executedOk[0]?.toolId;
  if (chosen) {
    const historyUids = session.history.flatMap((turn) => turn.selectedToolIds);
    nextSession = {
      ...nextSession,
      coactivation: updateCoactivation(nextSession.coactivation ?? {}, historyUids, chosen),
    };
  }
  nextSession = {
    ...nextSession,
    peerStats: nextSession.peerStats ?? {},
    memory: fcnp.retained.slice(0, 24),
    history: [
      ...session.history,
      {
        turn: turnIndex,
        query,
        selectedToolIds: executedOk.map((item) => item.toolId),
        failedToolIds: failed,
        observations: executedOk.map((item) => item.summary),
        answer,
      },
    ],
  };

  const pipelineOk =
    Boolean(query) &&
    satr.truncated.length > 0 &&
    aprr.assignments.length > 0 &&
    mncd.votes.length > 0 &&
    fcnp.retained.length > 0;

  return {
    requestId: nowId("pipe"),
    query,
    satr,
    aprr,
    mncd,
    fcnp,
    session: nextSession,
    answer,
    timingsMs: timings,
    pipelineOk,
    liveOk,
    stages: [
      {
        id: "satr",
        title: "O1 SATR · Session-Aware Tool Retrieval",
        status: stageStatus(satr.truncated.length > 0, !satr.truncated.length),
        summary: satr.truncated.length
          ? `Shortlisted ${satr.truncated.length} tools. Top: ${satr.truncated[0].tool.name}.`
          : "No tools retrieved.",
      },
      {
        id: "aprr",
        title: "O2 APRR · Adaptive Probabilistic Routing Reinforcement",
        status: stageStatus(aprr.assignments.length > 0, !aprr.assignments.length),
        summary: aprr.path.length
          ? `Hop path ${aprr.path.join(" → ")}.`
          : "No agents routed.",
      },
      {
        id: "mncd",
        title: "O3 MNCD · Mesh Network Context Diffusion",
        status: stageStatus(mncd.votes.length > 0, !mncd.votes.length),
        summary: liveOk
          ? `Score-sum consensus executed live ${executedOk.map((item) => item.toolId).join(", ")}.`
          : mncd.votes.length
            ? `Consensus ${mncd.votes[0].toolId} (live fetch ${liveOk ? "ok" : "not obtained"}).`
            : "Mesh did not reach consensus.",
      },
      {
        id: "fcnp",
        title: "O4 FCNP · Flow-Coupled Network Pruning",
        status: stageStatus(fcnp.retained.length > 0, !fcnp.retained.length),
        summary: `Kirchhoff prune retained ${fcnp.stats.retained}/${fcnp.stats.original} (iter ${fcnp.stats.iterations}, conv ${fcnp.stats.converged}).`,
      },
    ],
  };
}

export function pipelineContract() {
  return {
    catalog: CATALOG_STATS,
    loop: [
      "User query + co-activation cache + FCNP memory",
      "SATR fused rank: s_base + cat/sch/ept/cooc/rec",
      "APRR samples P∝W^α η^β ψ^γ over specialist agents",
      "MNCD gossip + score-sum consensus; live AGMARKNET only",
      "FCNP Kirchhoff/Physarum prune writes memory back to SATR",
    ],
    defaults: { email: DEFAULT_EMAIL, sector: DEFAULT_SECTOR, catalog: "Agriculture only" },
    services: ["/api/services/satr", "/api/services/aprr", "/api/services/mncd", "/api/services/fcnp"],
  };
}
