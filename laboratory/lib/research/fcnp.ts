import { hashedEmbedding, solveLinear } from "./math";
import { mean, tokenize } from "./text";
import type { ContextElement, FcnpResult, FcnpStats, MncdResult, SessionState } from "./types";

/** FCNPConfig from joyjeni/fcnp-context-pruning. */
export const FCNP_CONFIG = {
  similarityThreshold: 0.12,
  epsilon: 1e-4,
  maxIterations: 40,
  mu: 0.1,
  alpha: 0.5,
  gamma: 1.2,
  keepTopKFraction: 0.35,
  summarizeTopKFraction: 0.2,
  currentInjection: 1.0,
  laplacianRegularization: 1e-9,
  enableHybridTiering: true,
};

function extractiveSummarize(text: string, query: string | undefined, maxTokens: number): string {
  const words = text.split(/\s+/);
  if (words.length <= maxTokens) return text;
  const q = new Set(tokenize(query ?? ""));
  const scored = text.split(/(?<=[.!?])\s+/).map((sentence, i) => {
    const tokens = tokenize(sentence);
    const overlap = tokens.filter((t) => q.has(t)).length;
    return { sentence, score: overlap + 0.05 * (1 / (i + 1)), tokens: tokens.length };
  });
  scored.sort((a, b) => b.score - a.score);
  const kept: string[] = [];
  let n = 0;
  for (const row of scored) {
    if (n + row.tokens > maxTokens && kept.length) break;
    kept.push(row.sentence);
    n += row.tokens;
  }
  return kept.join(" ");
}

export function buildTraceContext(
  query: string,
  mncd: MncdResult,
  session: SessionState | undefined,
  now: number,
): ContextElement[] {
  const elements: ContextElement[] = [
    {
      id: `query_${now}`,
      text: query,
      source: "user",
      timestamp: now,
      accessCount: 2,
      importance: 0.9,
      pinned: true,
      feedback: 1,
      kind: "query",
      embedding: hashedEmbedding(query),
    },
  ];

  (session?.memory ?? []).forEach((element, index) => {
    elements.push({
      ...element,
      embedding: element.embedding?.length ? element.embedding : hashedEmbedding(element.text),
      accessCount: element.accessCount + (index < 4 ? 1 : 0),
    });
  });

  mncd.proposals.forEach((proposal, index) => {
    const text = `${proposal.agentId} proposed ${proposal.toolId} ${JSON.stringify(proposal.arguments)} — ${proposal.rationale}`;
    elements.push({
      id: `proposal_${proposal.agentId}_${index}`,
      text,
      source: proposal.agentId,
      timestamp: now,
      accessCount: 1,
      importance: 0.55,
      pinned: false,
      feedback: 0,
      kind: "tool",
      embedding: hashedEmbedding(text),
    });
  });

  mncd.executed.forEach((call, index) => {
    const pinned = call.ok && call.source === "live";
    elements.push({
      id: `obs_${call.toolId}_${index}`,
      text: call.summary,
      source: call.toolId,
      timestamp: now,
      accessCount: call.ok ? 3 : 1,
      importance: call.ok ? 0.88 : 0.2,
      pinned,
      feedback: call.ok ? 1 : -0.6,
      kind: "observation",
      embedding: hashedEmbedding(call.summary),
    });
    if (call.ok) {
      const cite = `citation:${call.toolId} args=${JSON.stringify(call.arguments)} source=${call.source}`;
      elements.push({
        id: `cite_${call.toolId}_${index}`,
        text: cite,
        source: call.toolId,
        timestamp: now,
        accessCount: 2,
        importance: 0.8,
        pinned: true,
        feedback: 1,
        kind: "citation",
        embedding: hashedEmbedding(cite),
      });
    }
  });

  mncd.consensusNotes.forEach((note, index) => {
    elements.push({
      id: `consensus_${index}`,
      text: note,
      source: "mncd",
      timestamp: now,
      accessCount: 1,
      importance: 0.4,
      pinned: false,
      feedback: 0.2,
      kind: "consensus",
      embedding: hashedEmbedding(note),
    });
  });

  return elements;
}

function cosineAt(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / Math.sqrt(na * nb);
}

export function fcnpPrune(
  elements: ContextElement[],
  now = 1,
  pruneRatio = 0.42,
  queryText?: string,
): FcnpResult {
  const formula = "D_ij(t+1)=(1-μ)D_ij + α|Q_ij|^γ ; L p = I (grounded sink); keep top flow";
  const unique = new Map<string, ContextElement>();
  for (const element of elements) {
    const prior = unique.get(element.id);
    if (!prior) unique.set(element.id, { ...element, embedding: element.embedding?.length ? element.embedding : hashedEmbedding(element.text) });
    else {
      unique.set(element.id, {
        ...prior,
        accessCount: prior.accessCount + element.accessCount,
        feedback: Math.max(prior.feedback, element.feedback),
        pinned: prior.pinned || element.pinned,
        importance: Math.max(prior.importance, element.importance),
      });
    }
  }
  const items = [...unique.values()];
  if (!items.length) {
    const stats: FcnpStats = {
      original: 0,
      retained: 0,
      evicted: 0,
      pinned: 0,
      evictionRatio: 0,
      avgRetained: 0,
      avgEvicted: 0,
      iterations: 0,
      converged: true,
    };
    return { retained: [], evicted: [], stats, notes: ["FCNP received an empty trace."], formula };
  }

  const n = items.length;
  const D = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      const sim = cosineAt(items[i].embedding, items[j].embedding);
      const w = sim >= FCNP_CONFIG.similarityThreshold ? Math.max(sim, 0) : 0;
      D[i][j] = w;
      D[j][i] = w;
    }
  }

  const queryEmb = hashedEmbedding(queryText ?? items.find((e) => e.kind === "query")?.text ?? "");
  let mass = items.map((el) => Math.max(0, cosineAt(el.embedding, queryEmb)) || el.importance);
  const massSum = mass.reduce((s, v) => s + v, 0) || n;
  mass = mass.map((v) => v / massSum);

  const N = n + 1;
  let Daug = Array.from({ length: N }, () => Array.from({ length: N }, () => 0));
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) Daug[i][j] = D[i][j];
    Daug[i][n] = mass[i];
    Daug[n][i] = mass[i];
  }
  const I = [...mass.map((v) => v * FCNP_CONFIG.currentInjection), -FCNP_CONFIG.currentInjection];

  let converged = false;
  let iterations = 0;
  let prevTotal = Daug.flat().reduce((s, v) => s + v, 0);
  for (let it = 0; it < FCNP_CONFIG.maxIterations; it += 1) {
    const deg = Daug.map((row) => row.reduce((s, v) => s + v, 0));
    const L = Array.from({ length: N }, (_, i) =>
      Array.from({ length: N }, (_, j) => (i === j ? deg[i] : -Daug[i][j])),
    );
    const Lred = L.slice(0, n).map((row) => row.slice(0, n));
    for (let i = 0; i < n; i += 1) Lred[i][i] += FCNP_CONFIG.laplacianRegularization;
    const Ired = I.slice(0, n);
    const pRed = solveLinear(Lred, Ired);
    const p = [...pRed, 0];
    const Q = Array.from({ length: N }, () => Array.from({ length: N }, () => 0));
    for (let i = 0; i < N; i += 1) {
      for (let j = 0; j < N; j += 1) {
        Q[i][j] = Math.abs(Daug[i][j] * (p[i] - p[j]));
      }
    }
    const Dnew = Array.from({ length: N }, () => Array.from({ length: N }, () => 0));
    for (let i = 0; i < N; i += 1) {
      for (let j = 0; j < N; j += 1) {
        if (i === j) continue;
        Dnew[i][j] = (1 - FCNP_CONFIG.mu) * Daug[i][j] + FCNP_CONFIG.alpha * Q[i][j] ** FCNP_CONFIG.gamma;
      }
    }
    const delta = Dnew.flat().reduce((s, v, idx) => s + Math.abs(v - Daug.flat()[idx]), 0);
    Daug = Dnew;
    iterations = it + 1;
    if (delta < FCNP_CONFIG.epsilon * Math.max(prevTotal, 1)) {
      converged = true;
      break;
    }
    prevTotal = Daug.flat().reduce((s, v) => s + v, 0);
  }

  const nodeFlow = items.map((_, i) => Daug[i].reduce((s, v) => s + v, 0));
  const order = items.map((_, i) => i).sort((a, b) => nodeFlow[b] - nodeFlow[a]);
  const keepK = Math.max(1, Math.ceil(FCNP_CONFIG.keepTopKFraction * n));
  const summarizeK = FCNP_CONFIG.enableHybridTiering
    ? Math.ceil(FCNP_CONFIG.summarizeTopKFraction * n)
    : 0;
  const keepIdx = new Set(order.slice(0, keepK));
  const summarizeIdx = new Set(order.slice(keepK, keepK + summarizeK));
  const persistent = new Set(items.filter((el) => el.pinned).map((el) => el.id));

  const retained: ContextElement[] = [];
  const evicted: ContextElement[] = [];
  for (const idx of order) {
    const el = { ...items[idx] };
    if (persistent.has(el.id)) {
      el.tier = "persistent";
      retained.push(el);
    } else if (keepIdx.has(idx)) {
      el.tier = "keep_verbatim";
      retained.push(el);
    } else if (summarizeIdx.has(idx)) {
      el.tier = "summarize";
      el.summaryText = extractiveSummarize(el.text, queryText, 40);
      el.text = el.summaryText;
      retained.push(el);
    } else {
      el.tier = "drop";
      evicted.push(el);
    }
  }

  const extraDrop = Math.max(0, retained.length - Math.ceil(items.length * (1 - pruneRatio)) - persistent.size);
  if (extraDrop > 0) {
    const droppable = retained.filter((el) => el.tier !== "persistent" && el.kind !== "citation");
    droppable.slice(-extraDrop).forEach((el) => {
      const i = retained.indexOf(el);
      if (i >= 0) {
        retained.splice(i, 1);
        el.tier = "drop";
        evicted.push(el);
      }
    });
  }

  const stats: FcnpStats = {
    original: items.length,
    retained: retained.length,
    evicted: evicted.length,
    pinned: persistent.size,
    evictionRatio: items.length ? evicted.length / items.length : 0,
    avgRetained: mean(retained.map((el) => nodeFlow[items.findIndex((x) => x.id === el.id)] ?? 0)),
    avgEvicted: mean(evicted.map((el) => nodeFlow[items.findIndex((x) => x.id === el.id)] ?? 0)),
    iterations,
    converged,
  };

  return {
    retained,
    evicted,
    stats,
    notes: [
      "Faithful FCNP from fcnp-context-pruning: Kirchhoff / Physarum conductance, not LFU/ACPA.",
      `Converged=${converged} after ${iterations} iterations. Persistent citations force-included (improvement #3).`,
      `Hybrid tiers: keep ${keepK}, summarize ${summarizeK}, drop ${evicted.length}.`,
    ],
    formula,
  };
}
