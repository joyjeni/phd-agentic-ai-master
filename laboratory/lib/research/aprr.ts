import { cosineVec, fillMatrix, hashedEmbedding, mulberry32, seedFrom } from "./math";
import type {
  AgentId,
  AgentSpec,
  AprrResult,
  RankedTool,
  RouteAssignment,
  SessionState,
} from "./types";

/** APRR RouterConfig defaults from joyjeni/aprr-multi-agent-routing. */
export const APRR_CONFIG = {
  alpha: 2.0,
  beta: 1.0,
  gamma: 2.5,
  lam: 0.005,
  kappa: 5.0,
  W0: 0.1,
  W_min: 1e-3,
  W_max: 20.0,
  maxHops: 4,
  epsilon: 0,
  epsilonDecay: 0.98,
  epsilonMin: 0.01,
};

const AGENT_DEFS: Array<Omit<AgentSpec, "embedding">> = [
  {
    id: "agriculture_analyst",
    name: "Agriculture Analyst",
    role: "Interpret crop mandi rainfall MSP fertilizer and Karnataka agri evidence.",
    categories: ["Agriculture", "Weather", "Food", "Science", "market", "crop_advisory", "soil"],
    cost: 0.35,
    latencyMs: 90,
    terminal: false,
  },
  {
    id: "schema_planner",
    name: "Schema Planner",
    role: "Fill API parameters and keep calls on schema for government resources.",
    categories: ["Data", "Mapping", "Government", "land_records", "schemes"],
    cost: 0.25,
    latencyMs: 60,
    terminal: false,
  },
  {
    id: "tool_executor",
    name: "Tool Executor",
    role: "Issue live data.gov.in AGMARKNET mandi calls and other executable tools.",
    categories: ["Agriculture", "Data", "Finance", "Weather", "market"],
    cost: 0.4,
    latencyMs: 120,
    terminal: true,
  },
  {
    id: "mesh_critic",
    name: "Mesh Critic",
    role: "Vote against off-domain tools and merge mesh observations.",
    categories: ["Data", "News", "Communication"],
    cost: 0.2,
    latencyMs: 50,
    terminal: false,
  },
  {
    id: "retrieval_specialist",
    name: "Retrieval Specialist",
    role: "Recover if SATR under-recalled; expand related APIs.",
    categories: ["Search", "Data", "News", "pest_disease", "weather"],
    cost: 0.3,
    latencyMs: 70,
    terminal: true,
  },
];

export const AGENTS: AgentSpec[] = AGENT_DEFS.map((agent) => ({
  ...agent,
  embedding: hashedEmbedding(`${agent.id} ${agent.role} ${agent.categories.join(" ")}`),
}));

export function defaultAffinity(): number[][] {
  return fillMatrix(AGENTS.length, APRR_CONFIG.W0, 0);
}

function heuristic(i: number, j: number): number {
  return Math.max(1e-3, Math.min(1, cosineVec(AGENTS[i].embedding, AGENTS[j].embedding)));
}

function psi(queryEmb: number[], j: number): number {
  return Math.max(1e-3, Math.min(1, cosineVec(queryEmb, AGENTS[j].embedding)));
}

function selectNext(
  W: number[][],
  current: number,
  visited: Set<number>,
  queryEmb: number[],
  rng: () => number,
  epsilon: number,
): { index: number; probability: number } {
  const candidates = AGENTS.map((_, j) => j).filter((j) => j !== current && !visited.has(j));
  const pool = candidates.length ? candidates : AGENTS.map((_, j) => j).filter((j) => j !== current);
  if (rng() < epsilon) {
    const pick = pool[Math.floor(rng() * pool.length)] ?? current;
    return { index: pick, probability: 1 / Math.max(pool.length, 1) };
  }
  const weights = pool.map((j) => {
    const wij = Math.max(W[current][j], APRR_CONFIG.W_min);
    return wij ** APRR_CONFIG.alpha * heuristic(current, j) ** APRR_CONFIG.beta * psi(queryEmb, j) ** APRR_CONFIG.gamma;
  });
  const sum = weights.reduce((s, v) => s + v, 0);
  if (!Number.isFinite(sum) || sum <= 0) {
    return { index: pool[0] ?? current, probability: 1 };
  }
  const probs = weights.map((w) => w / sum);
  let r = rng();
  let idx = pool.length - 1;
  for (let i = 0; i < probs.length; i += 1) {
    r -= probs[i];
    if (r <= 0) {
      idx = i;
      break;
    }
  }
  return { index: pool[idx] ?? current, probability: probs[idx] ?? 0 };
}

function assignTools(agent: AgentSpec, ranked: RankedTool[]): RankedTool[] {
  return ranked
    .map((item) => ({
      item,
      pref:
        (agent.categories.includes(item.tool.category) ? 1 : 0.12) +
        (agent.id === "tool_executor" && item.tool.liveExecutable ? 0.35 : 0) +
        (agent.id === "agriculture_analyst" &&
        (item.tool.category === "Agriculture" || item.tool.source !== "toolbench")
          ? 0.2
          : 0),
    }))
    .sort((a, b) => b.pref - a.pref)
    .filter((row) => row.pref > 0.2)
    .slice(0, 3)
    .map((row) => row.item);
}

export function aprrRoute(
  query: string,
  ranked: RankedTool[],
  session?: SessionState,
  maxAgents = 4,
): AprrResult {
  const formula = "P(a_j|a_i,q) ∝ W_ij^α · η_ij^β · ψ_j(q)^γ ; W ← (1-λ)W + κ·reward·1/L²·1/lat";
  if (!ranked.length) {
    return {
      assignments: [],
      unassigned: [],
      notes: ["APRR received an empty SATR shortlist."],
      path: [],
      formula,
      W: session?.affinityW?.length ? session.affinityW : defaultAffinity(),
    };
  }

  const W = session?.affinityW?.length === AGENTS.length ? session.affinityW.map((r) => r.slice()) : defaultAffinity();
  const queryEmb = hashedEmbedding(query);
  const rng = mulberry32(seedFrom(`${session?.id ?? "lab"}:${query}`));
  const epsilon = session?.epsilon ?? APRR_CONFIG.epsilon;
  const start = 0;
  const pathIdx = [start];
  const visited = new Set([start]);
  const hopProb = [1];
  for (let hop = 0; hop < APRR_CONFIG.maxHops - 1; hop += 1) {
    const next = selectNext(W, pathIdx[pathIdx.length - 1], visited, queryEmb, rng, epsilon);
    pathIdx.push(next.index);
    hopProb.push(next.probability);
    visited.add(next.index);
    if (AGENTS[next.index].terminal && pathIdx.length >= 3) break;
  }

  const assignments: RouteAssignment[] = [];
  const used = new Set<string>();
  pathIdx.forEach((idx, hop) => {
    if (assignments.length >= maxAgents) return;
    const agent = AGENTS[idx];
    const tools = assignTools(agent, ranked).filter((item) => !used.has(item.tool.id));
    tools.forEach((item) => used.add(item.tool.id));
    const preference = tools.length
      ? tools.reduce((s, item) => s + 0.5 + item.score / 20, 0) / tools.length
      : 0;
    assignments.push({
      agent,
      tools: tools.length ? tools : ranked.slice(0, 1),
      utility: hopProb[hop] * (1 + preference),
      exploration: epsilon,
      preference,
      expectedReward: W[pathIdx[Math.max(0, hop - 1)]]?.[idx] ?? APRR_CONFIG.W0,
      hop,
      probability: hopProb[hop],
      reasons: [
        `APRR hop ${hop}: P∝ W^α η^β ψ^γ`,
        `p=${hopProb[hop].toFixed(3)}`,
        `W_in=${(W[pathIdx[Math.max(0, hop - 1)]]?.[idx] ?? 0).toFixed(3)}`,
      ],
    });
  });

  const assignedIds = new Set(assignments.flatMap((row) => row.tools.map((item) => item.tool.id)));
  const unassigned = ranked.filter((item) => !assignedIds.has(item.tool.id));

  return {
    assignments,
    unassigned,
    notes: [
      "Faithful APRR from aprr-multi-agent-routing: sampled hop path over specialist agents, not LinUCB model routing.",
      "Contrast with MasRouter (ACL 2025): APRR is training-free online W, not a trained neural controller.",
      "Lab uses ε=0 for a reproducible demo; the GitHub RouterConfig default is ε=0.15 with decay.",
      session?.history.length
        ? "Affinity W was decay-regularised from prior MNCD success/latency."
        : "W initialised uniformly to W0=0.1.",
    ],
    path: pathIdx.map((i) => AGENTS[i].id),
    formula,
    W,
  };
}

export function updateAgentRewards(
  session: SessionState,
  agentIds: AgentId[],
  success: boolean,
  latencyNorm: number,
): SessionState {
  const n = AGENTS.length;
  const W = session.affinityW?.length === n ? session.affinityW.map((r) => r.slice()) : defaultAffinity();
  for (let i = 0; i < n; i += 1) {
    for (let j = 0; j < n; j += 1) {
      if (i === j) {
        W[i][j] = 0;
        continue;
      }
      W[i][j] *= 1 - APRR_CONFIG.lam;
    }
  }
  const path = agentIds
    .map((id) => AGENTS.findIndex((agent) => agent.id === id))
    .filter((idx) => idx >= 0);
  if (path.length >= 2) {
    const L = path.length - 1;
    const latNorm = Math.max(latencyNorm * 200, 1) / 200;
    const reward = success ? 1 : -0.05;
    const deposit = APRR_CONFIG.kappa * reward * (1 / (L * L)) * (1 / latNorm);
    for (let k = 0; k < path.length - 1; k += 1) {
      const i = path[k];
      const j = path[k + 1];
      W[i][j] = Math.min(APRR_CONFIG.W_max, Math.max(APRR_CONFIG.W_min, W[i][j] + deposit));
    }
  }
  const next = {
    ...session,
    affinityW: W,
    epsilon: Math.max(APRR_CONFIG.epsilonMin, (session.epsilon ?? APRR_CONFIG.epsilon) * APRR_CONFIG.epsilonDecay),
    agentRewards: { ...session.agentRewards },
    agentCounts: { ...session.agentCounts },
  };
  const r = (success ? 1 : 0.15) * (1 - 0.25 * latencyNorm);
  for (const id of agentIds) {
    next.agentRewards[id] = (next.agentRewards[id] ?? 1) + r;
    next.agentCounts[id] = (next.agentCounts[id] ?? 1) + 1;
  }
  return next;
}
