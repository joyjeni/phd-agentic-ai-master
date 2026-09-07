/**
 * Exact formulas as implemented in this repository.
 * Source files: satr.ts, aprr.ts, mncd.ts, fcnp.ts, datagov.ts, pipeline.ts, text.ts.
 * These constants must stay in lock-step with the runtime. Tests assert that.
 */

import { APRR_CONFIG } from "./aprr";
import { FCNP_CONFIG } from "./fcnp";
import { SATR_WEIGHTS } from "./satr";

export { APRR_CONFIG, FCNP_CONFIG, SATR_WEIGHTS };

/** SATR SessionRerank+ — lib/research/satr.ts */
export const SATR_FORMULA = {
  latex:
    "s(a|q,H)= w_base s_base + w_cat cat + w_sch sch + w_ept ept + w_cooc Σ_i γ^{n-i} log(1+w_{h_i,a}) + w_rec rec − 0.35·fails",
  sBase: "s_base = 0.7 BM25(q,a) + 0.3 TFIDF-cosine(q,a) + 0.08 memory-cosine(M,a)",
  bm25: "BM25: k1=1.5, b=0.75, IDF=log((N−df+0.5)/(df+0.5)+1)",
  weights: SATR_WEIGHTS,
  decay: 0.85,
  recencyK: 3,
  recencyDecay: 0.5,
  rho: 0.02,
  delta: 1.0,
  gamma: 0.7,
  failPenalty: 0.35,
  feature: "session features: log(1+10x) then z-score; s_base z-scored across the catalog",
  coactivationUpdate: "w_{u,v} ← (1−ρ) w_{u,v} + δ · 1[success], ρ=0.02, δ=1",
  seenUnseen: "after scoring: keep max(2, ceil(0.45 K)) seen and the rest unseen (ToolRerank-style truncation)",
  file: "lib/research/satr.ts",
} as const;

/** APRR — lib/research/aprr.ts */
export const APRR_FORMULA = {
  latex: "P(a_j | a_i, q) ∝ W_{ij}^α · η_{ij}^β · ψ_j(q)^γ",
  heuristic: "η_{ij} = cosine(e_i, e_j)  (hashed 32-d embeddings)",
  queryFit: "ψ_j(q) = cosine(e_q, e_j)",
  update: "W ← (1−λ)W + κ · reward · 1/L² · 1/lat_norm,  W ∈ [10^{-3}, 20],  W0=0.1",
  reward: "reward = +1 on live success, −0.05 on failure",
  config: APRR_CONFIG,
  start: "hop 0 is always agriculture_analyst; ε=0 in this lab (GitHub default ε=0.15)",
  assign:
    "pref = 1[category match] else 0.12; +0.35 if tool_executor∧live; +0.2 if agriculture_analyst∧Agriculture. Keep pref>0.2, else fall back to SATR #1.",
  file: "lib/research/aprr.ts",
} as const;

/** MNCD — lib/research/mncd.ts */
export const MNCD_FORMULA = {
  agentScore:
    "s = 0.45 · score/(|score|+2) + 0.35 · overlap(q, tool⊕args) + liveBoost − 0.05 · rankIndex",
  liveBoost: "liveBoost = 0.25·1[liveExecutable] + 0.20·1[id = preferredLiveToolId(q)]",
  consensus: "tally(tool) = Σ_a w_a · s_a(tool)   (score-sum, not Borda)",
  peerWeight: "w = success / (1 + latencyMs/1000),  EMA α=0.3,  cold-start success=0.8, lat=80 ms",
  gossip: "fanout=3, rounds=2, distress τ=0.55",
  executeGate:
    "Execute only liveExecutable Agriculture UUIDs. Catalog-only ToolBench tools are ranking-only. If no live winner, force preferredLiveToolId(q).",
  preferredRule:
    "preferredLiveToolId: rainfall→datagov.rainfall; land-use→land_use; horticulture→horticulture; fertilizer|urea|npk|subsidy→fertilizer; production|yield|kharif|rabi→crop_production; else mandi_prices.",
  file: "lib/research/mncd.ts",
} as const;

/** FCNP — lib/research/fcnp.ts */
export const FCNP_FORMULA = {
  edge: "D_{ij} = cosine(e_i,e_j) if cosine ≥ 0.12 else 0",
  physarum: "D_{ij}(t+1) = (1−μ) D_{ij} + α |Q_{ij}|^γ",
  kirchhoff: "L p = I  (grounded sink);  Q_{ij} = |D_{ij} (p_i − p_j)|",
  config: FCNP_CONFIG,
  tiers: "hybrid: keep top 35% verbatim, next 20% extractive-summarize (≤40 tokens), rest drop",
  pin: "pinned live citations and the user query are never evicted",
  writeback: "session.memory = fcnp.retained.slice(0, 24) → mixed into next SATR s_base",
  file: "lib/research/fcnp.ts",
} as const;

export const PIPELINE_ALGO = [
  "Input: query q, session S (history, co-activation W_cooc, affinity W, FCNP memory, peerStats).",
  "O1 SATR: score every Agriculture catalog tool with s(a|q,H); truncate seen/unseen to top-K.",
  "O2 APRR: sample hops with P∝W^α η^β ψ^γ from agriculture_analyst; assign up to 3 tools per hop.",
  "O3 MNCD: each agent publishes a ranking; score-sum tally; GET only live data.gov.in UUIDs; fail loud.",
  "O4 FCNP: build trace graph; Kirchhoff/Physarum iterate; keep/summarize/drop; pin live citations.",
  "Write-back: update W with κ·reward/L²/lat; update co-activation on live success; memory ← retained.",
] as const;
