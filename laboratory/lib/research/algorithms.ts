/**
 * Pseudocode, mermaid, and journal captions for the four implemented modules.
 * Source of truth is satr.ts / aprr.ts / mncd.ts / fcnp.ts / pipeline.ts.
 * Archived matplotlib PNGs under github.com/joyjeni/phd-agentic-ai-master/diagrams
 * (SessionRerank+, NDCG pills, Borda-as-default, CDR/PDR) are not this laboratory.
 */

import {
  APRR_MERMAID,
  FCNP_MERMAID,
  INTEGRATION_MERMAID,
  MNCD_MERMAID,
  SATR_MERMAID,
} from "./implemented-diagrams";
import {
  APRR_FORMULA,
  FCNP_FORMULA,
  MNCD_FORMULA,
  SATR_FORMULA,
} from "./formulas";
import { OBJECTIVES, SATR } from "./objectives";
import { TOOLBENCH_SOIL } from "./walkthrough";

export type AlgorithmSpec = {
  id: "satr" | "aprr" | "mncd" | "fcnp";
  code: string;
  title: string;
  file: string;
  figure: string;
  caption: string;
  formula: string;
  extras: string[];
  pseudocode: string[];
  mermaid: string;
  logic: string[];
  diagram: "satr" | "aprr" | "mncd" | "fcnp";
  output: string;
};

export const ALGORITHMS: AlgorithmSpec[] = [
  {
    id: "satr",
    code: "O1",
    title: SATR.title,
    file: SATR_FORMULA.file,
    figure: "Figure 3",
    caption:
      "Implemented SATR (Session-Aware Tool Retrieval). Input is q + session history H + FCNP memory M. Output is a ToolBench-schema shortlist for APRR. Redrawn from satr.ts. Not a scanned publisher figure. No NDCG is drawn.",
    formula: SATR_FORMULA.latex,
    extras: [
      SATR_FORMULA.sBase,
      SATR_FORMULA.bm25,
      SATR_FORMULA.coactivationUpdate,
      SATR_FORMULA.seenUnseen,
    ],
    pseudocode: [
      "Algorithm SATR(q, S, C, K ← 8)",
      "Input: query q; session S = (H, W_cooc, M); Agriculture catalog C",
      "Output: truncated RankedTool shortlist for APRR",
      "1. Index C: tokenize each tool document; compute DF and avgdl.",
      "2. For each tool a ∈ C:",
      "     s_base[a] ← 0.7 BM25(q,a) + 0.3 TFIDF-cos(q,a) + 0.08 cos(bag(M), bag(a))",
      "3. z ← z-score(s_base) across C.",
      "4. Build session priors from successful history tools with decay 0.85:",
      "     cat, sch, ept over category / schemaSignature / endpointPattern;",
      "     rec over the last 3 successful categories with decay 0.5.",
      "5. cooc[a] ← Σ_i γ^{n−i} log(1 + W_cooc[h_i, a]), γ = 0.7.",
      "6. If H is nonempty: transform priors by log(1+10x) then z-score.",
      "7. s[a] ← 1·z[a] + 0.45 cat + 0.25 sch + 0.3 ept + 0.35 cooc + 0.25 rec − 0.35·fails(a).",
      "8. Sort C by s descending. Mark seen vs unseen from H.",
      "9. ToolRerank-style truncate: keep max(2, ⌈0.45 K⌉) seen and the rest unseen.",
      "10. Unless looksMultiTool(q), cap three tools per category.",
      "11. Return top-K as truncated. SATR does not GET RapidAPI or data.gov.in.",
    ],
    mermaid: SATR_MERMAID,
    logic: [
      "Left boxes are the three inputs the code actually reads: the query, session history (including co-activation), and FCNP memory mixed into s_base as a bag-of-words cosine.",
      "The index / s_base / z-score chain is satrRerank: BM25 k1=1.5 b=0.75, then catalog-wide z-score so session priors can be added on a common scale.",
      "The prior and co-activation boxes are empty on a cold start (ToolBench soil turn 1). They become nonzero after FCNP write-back and live success.",
      "The truncate box is Zheng-style seen/unseen kept after session scoring, not instead of it. The shortlist is the only object APRR is allowed to see.",
    ],
    diagram: "satr",
    output: OBJECTIVES[0].outputs,
  },
  {
    id: "aprr",
    code: "O2",
    title: OBJECTIVES[1].title,
    file: APRR_FORMULA.file,
    figure: "Figure 4",
    caption:
      "Implemented APRR. Training-free hop sampling over specialist agents, not LLM SKUs. Redrawn from aprr.ts. No latency or win-rate is drawn.",
    formula: APRR_FORMULA.latex,
    extras: [APRR_FORMULA.heuristic, APRR_FORMULA.queryFit, APRR_FORMULA.update, APRR_FORMULA.assign],
    pseudocode: [
      "Algorithm APRR(q, shortlist, S)",
      "Input: query q; SATR truncated shortlist; session affinity W (or W0 = 0.1)",
      "Output: hop path and per-hop tool assignments for MNCD",
      "1. Agents A = {agriculture_analyst, schema_planner, tool_executor, mesh_critic, retrieval_specialist}.",
      "2. e_q ← hashedEmbedding(q); η_ij ← cosine(e_i, e_j); ψ_j ← cosine(e_q, e_j).",
      "3. Start at agriculture_analyst. ε = 0 in this laboratory.",
      "4. For hop = 1 … maxHops−1:",
      "     For each unvisited j: p_j ∝ W_ij^α · η_ij^β · ψ_j^γ   (α=2, β=1, γ=2.5).",
      "     Sample j from p. Stop early if j is terminal and |path| ≥ 3.",
      "5. assignTools(agent, shortlist):",
      "     pref ← 1[category match] else 0.12;",
      "     pref += 0.35 if tool_executor ∧ liveExecutable;",
      "     pref += 0.2 if agriculture_analyst ∧ Agriculture.",
      "     Keep pref > 0.2, else fall back to SATR #1. At most 3 tools per hop.",
      "6. After MNCD returns: W ← (1−λ)W + κ · reward · 1/L² · 1/lat_norm, reward ∈ {+1, −0.05}.",
      "7. APRR never trains a neural controller and never picks a foundation-model SKU.",
    ],
    mermaid: APRR_MERMAID,
    logic: [
      "The start box is hardcoded hop 0 = agriculture_analyst, matching aprrRoute.",
      "Sampling is a categorical draw from the normalised product W^α η^β ψ^γ. Lab ε=0 so the path is deterministic given the session seed.",
      "assignTools is a category gate, not a second ranker: schema_planner often falls back to SATR #1 on an Agriculture ToolBench tool.",
      "The dashed W update is not inside the forward hop; pipeline.ts calls updateAgentRewards after MNCD live success or failure.",
    ],
    diagram: "aprr",
    output: OBJECTIVES[1].outputs,
  },
  {
    id: "mncd",
    code: "O3",
    title: OBJECTIVES[2].title,
    file: MNCD_FORMULA.file,
    figure: "Figure 5",
    caption:
      "Implemented MNCD. Gossip of (toolId, score), score-sum consensus, live data.gov.in GET. Redrawn from mncd.ts. Borda exists in the GitHub repo and is not the laboratory default. No accuracy percentage is drawn.",
    formula: MNCD_FORMULA.consensus,
    extras: [
      MNCD_FORMULA.agentScore,
      MNCD_FORMULA.liveBoost,
      MNCD_FORMULA.peerWeight,
      MNCD_FORMULA.executeGate,
    ],
    pseudocode: [
      "Algorithm MNCD(q, APRR, S)",
      "Input: query q; APRR assignments; peerStats",
      "Output: votes, executed live observations for FCNP",
      "1. nodes ← agents on the APRR path. Mesh edges get w = success / (1 + lat_ms/1000).",
      "2. Each agent publishes rank.update: for its assigned tools,",
      "     s ← 0.45·score/(|score|+2) + 0.35·overlap(q, tool⊕args) + liveBoost − 0.05·index.",
      "     liveBoost ← 0.25·1[liveExecutable] + 0.20·1[id = preferredLiveToolId(q)].",
      "3. Gossip fanout = 3, rounds = 2. Distress if confidence < τ = 0.55.",
      "4. Score-sum (not Borda): tally[tool] ← Σ_a w_a · s_a(tool). Winner = argmax tally.",
      "5. Execution gate: keep only liveExecutable Agriculture UUIDs.",
      "     If none survive, force preferredLiveToolId(q).",
      "     Catalog-only ToolBench tools (liveExecutable=false) are never GET.",
      "6. executeTool: GET api.data.gov.in with verified UUID; cap limit at 10000; fail loud.",
      "7. Update peerStats EMA α=0.3. Pass observations and consensus notes to FCNP.",
    ],
    mermaid: MNCD_MERMAID,
    logic: [
      "The vote object is a toolId, which is the increment versus AutoGen/ChatDev message passing.",
      "On the ToolBench soil query, SATR #1 is tb.agri.soil_health (not live). The gate therefore forces datagov.fertilizer because the query matches fertilizer|urea|npk|subsidy.",
      "That forced live GET is the honest response: ranking-library analogue in SATR, ministry rows only in MNCD. RapidAPI soil_health_card is never called.",
      "Score-sum is consensus_pick in mncd.ts. Borda is documented as a non-default GitHub variant and is not drawn here.",
    ],
    diagram: "mncd",
    output: OBJECTIVES[2].outputs,
  },
  {
    id: "fcnp",
    code: "O4",
    title: OBJECTIVES[3].title,
    file: FCNP_FORMULA.file,
    figure: "Figure 6",
    caption:
      "Implemented FCNP. Kirchhoff / Physarum prune of the MNCD trace with pinned live citations written back into SATR. Redrawn from fcnp.ts. No token-reduction ratio is drawn.",
    formula: FCNP_FORMULA.physarum,
    extras: [FCNP_FORMULA.kirchhoff, FCNP_FORMULA.edge, FCNP_FORMULA.tiers, FCNP_FORMULA.writeback],
    pseudocode: [
      "Algorithm FCNP(q, MNCD, S, t)",
      "Input: query q; MNCD proposals, executions, notes; prior memory",
      "Output: retained context M_t written into S for SATR at t+1",
      "1. Build nodes: pinned query; prior memory; proposals; live observations; pinned citations; notes.",
      "2. D_ij ← cosine(e_i, e_j) if cosine ≥ 0.12 else 0. Couple a grounded sink by query mass.",
      "3. Repeat ≤ 40 iterations:",
      "     Solve L p = I on the grounded Laplacian (sink potential 0).",
      "     Q_ij ← |D_ij (p_i − p_j)|.",
      "     D_ij ← (1−μ) D_ij + α |Q_ij|^γ    (μ=0.1, α=0.5, γ=1.2).",
      "     Stop if ΔD < ε ΣD, ε=1e-4.",
      "4. Rank nodes by flow. Keep top 35% verbatim, next 20% extractive-summarize (≤40 tokens), drop the rest.",
      "5. Persistent: pinned live citations and the user query are never evicted.",
      "6. S.memory ← retained[:24]. Next SATR mixes this memory into s_base (step 2 of SATR).",
    ],
    mermaid: FCNP_MERMAID,
    logic: [
      "buildTraceContext is the left box: query and live citations are pinned before the solver runs, so pruning cannot delete the ministry evidence.",
      "The Kirchhoff / Physarum loop is fcnpPrune, matching Tero et al. as a design heuristic, not a biological claim.",
      "Hybrid tiers are the laboratory policy: keep / summarize / drop. LLMLingua token deletion is the SOTA contrast, not the implementation.",
      "Write-back is the integration hinge: without M_t in the next SATR s_base, FCNP would be prompt compression by another name.",
    ],
    diagram: "fcnp",
    output: OBJECTIVES[3].outputs,
  },
];

export const INTEGRATION = {
  figure: "Figure 7",
  caption:
    "Implemented ACRS integration. One user turn must traverse SATR → APRR → MNCD → FCNP. Live Indian OGD enters only at MNCD. FCNP writes M_t back into SATR. Redrawn from pipeline.ts. Archived github.com/joyjeni/phd-agentic-ai-master/diagrams PNGs that still say SessionRerank+, NDCG, or Borda-as-default are not this figure.",
  mermaid: INTEGRATION_MERMAID,
  steps: [
    "Intake. Tokenize q. Load Agriculture catalog. Do not call RapidAPI.",
    "SATR. Score every catalog tool; truncate; hand shortlist to APRR.",
    "APRR. Sample specialist hops; assign tools; hand path to MNCD.",
    "MNCD. Score-sum tool IDs; GET only live data.gov.in; fail loud.",
    "FCNP. Prune the trace; pin citations; write M_t into the session.",
    "Write-back. Next turn SATR reads M_t and updated W_cooc / W.",
  ],
} as const;

export const TOOLBENCH_FLOW = {
  datum: TOOLBENCH_SOIL,
  honesty:
    "ToolBench G1 jsonl on disk is RapidAPI (qid 6491, aircraft). This laboratory never GET those endpoints. The ranking-library analogue actually scored is tb.agri.soil_health.",
  stages: [
    {
      id: "intake",
      title: "Intake",
      payload:
        "Query: “What is the soil pH and recommended fertilizer dose for a farm village?” Tool schema tb.agri.soil_health is ranking-only (liveExecutable=false).",
    },
    {
      id: "satr",
      title: "O1 SATR response",
      payload:
        "Cold start: s = z(s_base). tb.agri.soil_health s=5.3978 (rank 1). karnataka::shc_karnataka 1.3985. tb.map.geocode_village 0.8738. datagov.fertilizer 0.6042 (live, rank 4). RapidAPI is not called.",
    },
    {
      id: "aprr",
      title: "O2 APRR response",
      payload:
        "Path agriculture_analyst → schema_planner (p=0.7263) → retrieval_specialist (p=0.9481). Hop 0 keeps soil_health, SHC, geocode. Later hops fall back to SATR #1 because pref<0.2.",
    },
    {
      id: "mncd",
      title: "O3 MNCD response",
      payload:
        "Score-sum winner tb.agri.soil_health (tally 1.332) is catalog-only. Gate forces datagov.fertilizer (UUID 2e0e6c04-97f2-456b-9309-bf605650cb11). Live GET: Indigenous Urea subsidy rows. Not a RapidAPI soil card.",
    },
    {
      id: "fcnp",
      title: "O4 FCNP response",
      payload:
        "10 context nodes → retain 6, evict 4, pin 3 (query + fertilizer observation + citation). M_t mixes into the next SATR s_base.",
    },
    {
      id: "writeback",
      title: "Write-back",
      payload:
        "Session memory ← retained[:24]. Co-activation and affinity W update only if a live tool succeeded. Next SATR is no longer turn-amnesic.",
    },
  ],
} as const;
