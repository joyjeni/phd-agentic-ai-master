import { getCatalog } from "./catalog";
import { meanStd, zscore } from "./math";
import { bm25, looksMultiTool, tokenize, cosine, bag, tfidf } from "./text";
import type {
  CoactivationEdges,
  RankedTool,
  SatrResult,
  SessionState,
  Tool,
} from "./types";

/** SATR (Session-Aware Tool Retrieval) weights from joyjeni/session-aware-toolbench-rerank. */
export const SATR_WEIGHTS = {
  w_base: 1.0,
  w_cat: 0.45,
  w_sch: 0.25,
  w_ept: 0.3,
  w_cooc: 0.35,
  w_rec: 0.25,
};

const DECAY = 0.85;
const RECENCY_K = 3;
const RECENCY_DECAY = 0.5;
const RHO = 0.02;
const DELTA = 1.0;
const GAMMA = 0.7;

function documentText(tool: Tool): string {
  return [
    tool.name,
    tool.apiName,
    tool.description,
    tool.toolDescription,
    tool.category,
    tool.collection,
    tool.tags.join(" "),
  ].join(" ");
}

function indexCatalog(catalog: Tool[]) {
  const docs = catalog.map((tool) => tokenize(documentText(tool)));
  const df = new Map<string, number>();
  let totalLen = 0;
  for (const tokens of docs) {
    totalLen += tokens.length;
    for (const token of new Set(tokens)) {
      df.set(token, (df.get(token) ?? 0) + 1);
    }
  }
  return {
    docs,
    df,
    nDocs: catalog.length,
    avgdl: totalLen / Math.max(catalog.length, 1),
  };
}

function historyTools(session: SessionState | undefined, catalog: Tool[]): Tool[] {
  if (!session?.history.length) return [];
  const byId = new Map(catalog.map((tool) => [tool.id, tool]));
  const out: Tool[] = [];
  for (const turn of session.history) {
    const failed = new Set(turn.failedToolIds);
    for (const id of turn.selectedToolIds) {
      if (failed.has(id)) continue;
      const tool = byId.get(id);
      if (tool) out.push(tool);
    }
  }
  return out;
}

function sessionPrior(apis: Tool[]) {
  const cat: Record<string, number> = {};
  const sch: Record<string, number> = {};
  const ept: Record<string, number> = {};
  const rec: Record<string, number> = {};
  apis.forEach((api, i) => {
    const w = DECAY ** (apis.length - 1 - i);
    cat[api.category] = (cat[api.category] ?? 0) + w;
    sch[api.schemaSignature] = (sch[api.schemaSignature] ?? 0) + w;
    ept[api.endpointPattern] = (ept[api.endpointPattern] ?? 0) + w;
  });
  const recent = apis.slice(-RECENCY_K);
  recent.forEach((api, i) => {
    const w = RECENCY_DECAY ** (recent.length - 1 - i);
    rec[api.category] = (rec[api.category] ?? 0) + w;
  });
  for (const d of [cat, sch, ept, rec]) {
    const tot = Object.values(d).reduce((s, v) => s + v, 0) || 1;
    for (const k of Object.keys(d)) d[k] /= tot;
  }
  return { cat, sch, ept, rec, n: apis.length, historyUids: apis.map((a) => a.id) };
}

function log1p10(x: number): number {
  return Math.log1p(x * 10);
}

function failCount(session: SessionState | undefined, toolId: string): number {
  if (!session) return 0;
  return session.history.reduce(
    (sum, turn) => sum + (turn.failedToolIds.includes(toolId) ? 1 : 0),
    0,
  );
}

export function emptyCoactivation(): CoactivationEdges {
  return {};
}

export function coactivationScore(
  edges: CoactivationEdges | undefined,
  historyUids: string[],
  candUid: string,
): number {
  if (!edges || !historyUids.length) return 0;
  const n = historyUids.length;
  let s = 0;
  historyUids.forEach((h, i) => {
    const w = edges[h]?.[candUid] ?? 0;
    if (w > 0) s += GAMMA ** (n - 1 - i) * Math.log1p(w);
  });
  return s;
}

export function decayCoactivation(edges: CoactivationEdges): CoactivationEdges {
  const next: CoactivationEdges = {};
  for (const [a, row] of Object.entries(edges)) {
    const kept: Record<string, number> = {};
    for (const [b, w] of Object.entries(row)) {
      const nw = w * (1 - RHO);
      if (nw >= 1e-4) kept[b] = nw;
    }
    if (Object.keys(kept).length) next[a] = kept;
  }
  return next;
}

export function updateCoactivation(
  edges: CoactivationEdges,
  historyUids: string[],
  chosenUid: string,
): CoactivationEdges {
  const next = decayCoactivation(edges);
  for (const a of historyUids) {
    if (a === chosenUid) continue;
    next[a] ??= {};
    next[a][chosenUid] = (next[a][chosenUid] ?? 0) + DELTA;
  }
  return next;
}

function intentDrift(session: SessionState | undefined, query: string): number {
  if (!session?.history.length) return 0;
  const prev = bag(tokenize(session.history[session.history.length - 1].query));
  const curr = bag(tokenize(query));
  return 1 - cosine(prev, curr);
}

export function satrRerank(
  query: string,
  session?: SessionState,
  catalog: Tool[] = getCatalog(),
  topK = 8,
): SatrResult {
  const formula =
    "s(a|q,H)=w_base s_base + w_cat cat + w_sch sch + w_ept ept + w_cooc Σ γ^{n-i} log(1+w_{h_i,a}) + w_rec rec";
  if (!query.trim()) {
    return {
      query,
      ranked: [],
      truncated: [],
      intentDrift: 0,
      queryMode: "single-tool",
      notes: ["Empty query: SATR returned no candidates."],
      formula,
    };
  }

  const index = indexCatalog(catalog);
  const queryTokens = tokenize(query);
  const queryVec = tfidf(queryTokens, index.df, index.nDocs);
  const prior = sessionPrior(historyTools(session, catalog));
  const multi = looksMultiTool(query);
  const drift = intentDrift(session, query);
  const seenIds = new Set((session?.history ?? []).flatMap((turn) => turn.selectedToolIds));
  const memoryHint = (session?.memory ?? [])
    .slice(0, 8)
    .map((el) => el.text)
    .join(" ");
  const memoryBag = bag(tokenize(memoryHint));

  const rawBase = catalog.map((tool, i) => {
    const docTokens = index.docs[i];
    return (
      0.7 * bm25(queryTokens, docTokens, index.df, index.nDocs, index.avgdl) +
      0.3 * cosine(queryVec, tfidf(docTokens, index.df, index.nDocs)) +
      0.08 * cosine(memoryBag, bag(docTokens))
    );
  });
  const baseZ = zscore(rawBase);

  const catRaw = catalog.map((tool) => prior.cat[tool.category] ?? 0);
  const schRaw = catalog.map((tool) => prior.sch[tool.schemaSignature] ?? 0);
  const eptRaw = catalog.map((tool) => prior.ept[tool.endpointPattern] ?? 0);
  const recRaw = catalog.map((tool) => prior.rec[tool.category] ?? 0);
  const coocRaw = catalog.map((tool) =>
    coactivationScore(session?.coactivation, prior.historyUids, tool.id),
  );

  const feat = (raw: number[]) => {
    const transformed = raw.map(log1p10);
    const { mean, std } = meanStd(transformed);
    return transformed.map((v) => (v - mean) / (std + 1e-6));
  };
  const cat = prior.n ? feat(catRaw) : catalog.map(() => 0);
  const sch = prior.n ? feat(schRaw) : catalog.map(() => 0);
  const ept = prior.n ? feat(eptRaw) : catalog.map(() => 0);
  const rec = prior.n ? feat(recRaw) : catalog.map(() => 0);
  const cooc = prior.n && SATR_WEIGHTS.w_cooc ? feat(coocRaw) : catalog.map(() => 0);

  const scored: RankedTool[] = catalog.map((tool, i) => {
    const fails = failCount(session, tool.id);
    const failPenalty = fails * 0.35;
    const score =
      SATR_WEIGHTS.w_base * baseZ[i] +
      SATR_WEIGHTS.w_cat * cat[i] +
      SATR_WEIGHTS.w_sch * sch[i] +
      SATR_WEIGHTS.w_ept * ept[i] +
      SATR_WEIGHTS.w_cooc * cooc[i] +
      SATR_WEIGHTS.w_rec * rec[i] -
      failPenalty;
    const seen = seenIds.has(tool.id) || tool.seen;
    return {
      tool: { ...tool, seen },
      score,
      semantic: rawBase[i],
      session: catRaw[i],
      hierarchy: eptRaw[i],
      failPenalty,
      recency: recRaw[i],
      cat: catRaw[i],
      sch: schRaw[i],
      ept: eptRaw[i],
      cooc: coocRaw[i],
      seenUnseen: seen ? "seen" : "unseen",
      reasons: [
        `s_base ${baseZ[i].toFixed(3)}`,
        `cat ${catRaw[i].toFixed(3)}`,
        `sch ${schRaw[i].toFixed(3)}`,
        `ept ${eptRaw[i].toFixed(3)}`,
        `cooc ${coocRaw[i].toFixed(3)}`,
        seen ? "seen-in-session" : "unseen",
        fails ? `fail-history x${fails}` : "no-fail-history",
      ],
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const seen = scored.filter((item) => item.seenUnseen === "seen");
  const unseen = scored.filter((item) => item.seenUnseen === "unseen");
  const seenK = Math.max(2, Math.ceil(topK * 0.45));
  const unseenK = Math.max(3, topK - Math.min(seenK, seen.length));
  const truncated = [...seen.slice(0, seenK), ...unseen.slice(0, unseenK)].sort(
    (a, b) => b.score - a.score,
  );

  const final: RankedTool[] = [];
  const cats = new Map<string, number>();
  for (const item of truncated) {
    const count = cats.get(item.tool.category) ?? 0;
    if (!multi && count >= 3) continue;
    cats.set(item.tool.category, count + 1);
    final.push(item);
    if (final.length >= topK) break;
  }
  if (final.length < Math.min(topK, truncated.length)) {
    for (const item of truncated) {
      if (final.includes(item)) continue;
      final.push(item);
      if (final.length >= topK) break;
    }
  }

  const notes = [
    "Faithful SATR (Session-Aware Tool Retrieval) from session-aware-toolbench-rerank: z-scored BM25 base plus log1p category / schema / endpoint / recency priors.",
    "Co-activation cache: w_{u,v}←(1-ρ)w_{u,v}+δ·1[success]; score Σ γ^{n-i} log(1+w_{h_i,v}).",
    "Catalog is locked to Agriculture: data.gov.in resources plus agri ranking-only schemas. Off-sector distractors are not loaded.",
    multi
      ? "Multi-tool query: ToolRerank-style diversity kept after session scoring."
      : "Single-tool query: category concentration applied after session scoring.",
  ];
  if (session?.memory.length) {
    notes.push(
      `FCNP memory (${session.memory.length} spans) mixed into s_base so retrieval is not turn-amnesic.`,
    );
  }
  if (prior.n) {
    notes.push(`Session prior built from ${prior.n} successful tool calls (decay=${DECAY}).`);
  }
  if (drift > 0.55) {
    notes.push(`Intent drift ${drift.toFixed(2)}: unseen tail retained.`);
  }

  return {
    query,
    ranked: scored,
    truncated: final,
    intentDrift: drift,
    queryMode: multi ? "multi-tool" : "single-tool",
    notes,
    formula,
  };
}
