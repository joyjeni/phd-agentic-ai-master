/**
 * Journal-style mermaid redraws of github.com/joyjeni/phd-agentic-ai-master/diagrams.
 * Source of truth is satr.ts / aprr.ts / mncd.ts / fcnp.ts / pipeline.ts.
 * Archived matplotlib PNGs still name SessionRerank+, NDCG, CDR/PDR, and Borda-as-default.
 * Those labels are not drawn here.
 */

export type JournalFigure = {
  id: string;
  figure: string;
  kind: "architecture" | "algorithm";
  title: string;
  source: string;
  archived: string;
  archivedDrops: string[];
  caption: string;
  mermaid: string;
};

const OVERALL_ARCH = `flowchart TB
  q["q_t farmer query"] --> satr
  M["M t-1 FCNP memory"] --> satr
  H["H session history"] --> satr
  C["Catalog C Agriculture only"] --> satr
  subgraph o1["O1 SATR Session-Aware Tool Retrieval"]
    satr["satrRerank in satr.ts"]
    satr --> short["truncated RankedTool K=8"]
  end
  short --> aprr
  subgraph o2["O2 APRR specialist hops"]
    aprr["aprrRoute in aprr.ts"]
    aprr --> path["hop path A_t plus assignTools"]
  end
  path --> mncd
  subgraph o3["O3 MNCD mesh"]
    mncd["mncdExecute in mncd.ts"]
    live["GET api.data.gov.in UUID"] --> mncd
    mncd --> obs["score-sum plus live observations"]
  end
  tb["ToolBench schema ranking-only"] -.->|never GET RapidAPI| mncd
  obs --> fcnp
  subgraph o4["O4 FCNP Kirchhoff prune"]
    fcnp["fcnpPrune in fcnp.ts"]
    fcnp --> ans["a_t plus pinned citations"]
    fcnp --> Mt["M_t retained[:24]"]
  end
  Mt --> satr`;

const OVERALL_FLOW = `flowchart TB
  in["INPUT q plus session S"] --> s1
  s1["SATR score every tool in C"] --> s2
  s2["SATR truncate seen/unseen top-K"] --> s3
  s3["APRR start agriculture_analyst"] --> s4
  s4["APRR sample P proportional to W^a eta^b psi^g"] --> s5
  s5["APRR assignTools pref greater than 0.2"] --> s6
  s6["MNCD rank.update plus gossip fanout 3"] --> s7
  s7["MNCD score-sum tally"] --> s8
  s8{"liveExecutable Agriculture UUID?"}
  s8 -->|yes| s9["GET data.gov.in cap limit 10000"]
  s8 -->|no| s8b["force preferredLiveToolId"]
  s8b --> s9
  s9 --> s10["FCNP buildTraceContext pin query and citations"]
  s10 --> s11["FCNP L p = I then D update"]
  s11 --> s12["keep 35 percent / summarize 20 percent / drop"]
  s12 --> s13["write-back memory W_cooc affinity W"]
  s13 --> in`;

const SATR_ARCH = `flowchart LR
  subgraph inputs["Inputs actually read"]
    q["q"]
    H["H successful tool ids"]
    M["M FCNP memory bag"]
    C["C Agriculture catalog"]
    W["W_cooc co-activation"]
  end
  subgraph satr["satr.ts satrRerank"]
    idx["indexCatalog tokenize DF avgdl"]
    sbase["s_base = 0.7 BM25 + 0.3 TFIDF + 0.08 mem"]
    z["z-score across C"]
    prior["cat / sch / ept / rec decay 0.85"]
    cooc["cooc = sum gamma n-i log(1+W)"]
    fuse["s = z + 0.45 cat + 0.25 sch + 0.3 ept + 0.35 cooc + 0.25 rec - 0.35 fails"]
    cut["seen/unseen truncate then category cap"]
  end
  q --> idx
  C --> idx
  M --> sbase
  idx --> sbase --> z --> fuse
  H --> prior --> fuse
  W --> cooc --> fuse
  fuse --> cut --> short["truncated shortlist to APRR"]`;

const SATR_FLOW = `flowchart TB
  i["INPUT q, S = H W_cooc M, catalog C"] --> a1
  a1["1 indexCatalog: tokenize each tool; DF; avgdl"] --> a2
  a2["2 s_base = 0.7 BM25 k1=1.5 b=0.75 + 0.3 TFIDF cosine + 0.08 cosine(M,a)"] --> a3
  a3["3 z-score s_base across C"] --> a4
  a4["4 session priors from successful history: cat sch ept rec"] --> a5
  a5["5 co-activation score from W_cooc gamma=0.7"] --> a6
  a6["6 if H nonempty: log(1+10x) then z-score priors"] --> a7
  a7["7 fuse with SATR_WEIGHTS; subtract 0.35 times failCount"] --> a8
  a8["8 sort descending; mark seen vs unseen from H"] --> a9
  a9["9 keep max(2, ceil 0.45 K) seen and the rest unseen"] --> a10
  a10["10 unless looksMultiTool, cap three tools per category"] --> a11
  a11["11 return top-K truncated. SATR does not GET."] --> out["OUTPUT RankedTool shortlist for APRR"]`;

const APRR_ARCH = `flowchart LR
  subgraph in2["Inputs"]
    S["SATR truncated shortlist"]
    q2["query q"]
    Waff["affinity W or W0=0.1"]
  end
  subgraph aprr["aprr.ts aprrRoute"]
    agents["A = analyst planner executor critic retrieval"]
    start["hop 0 = agriculture_analyst"]
    sample["P(a_j|a_i,q) proportional to W^a eta^b psi^g"]
    assign["assignTools: category pref else SATR hash 1"]
  end
  subgraph out2["Output then delayed update"]
    hops["path A_t plus per-hop tools"]
    upd["after MNCD: W leftarrow (1-lambda)W + kappa reward / L^2 lat"]
  end
  S --> start
  q2 --> sample
  Waff --> sample
  agents --> start --> sample --> assign --> hops
  hops --> mncd2["to MNCD"]
  live2["MNCD live success or fail"] --> upd --> Waff`;

const APRR_FLOW = `flowchart TB
  b0["INPUT SATR shortlist, session W, query q"] --> b1
  b1["1 Agents: agriculture_analyst, schema_planner, tool_executor, mesh_critic, retrieval_specialist"] --> b2
  b2["2 hashedEmbedding 32-d; eta = cosine(e_i,e_j); psi = cosine(e_q,e_j)"] --> b3
  b3["3 start at agriculture_analyst; lab epsilon = 0"] --> b4
  b4["4 for hop 1 to maxHops-1: sample unvisited j from P proportional to W^2 eta^1 psi^2.5"] --> b5
  b5["5 stop early if sampled agent is terminal and path length at least 3"] --> b6
  b6["6 assignTools: pref = 1 if category match else 0.12; +0.35 executor and live; +0.2 analyst and Agriculture"] --> b7
  b7["7 keep pref greater than 0.2 else SATR rank 1; at most 3 tools per hop"] --> b8
  b8["8 return path and assignments. APRR does not pick an LLM SKU."] --> bout["OUTPUT hop path for MNCD"]
  bout -.->|after live result| b9["9 updateAgentRewards: reward +1 live ok else -0.05"]`;

const MNCD_ARCH = `flowchart TB
  hops3["APRR hop path"] --> mesh
  subgraph mesh["mncd.ts mncdExecute"]
    pub["each agent rank.update on assigned tools"]
    gossip["gossip fanout=3 rounds=2"]
    sum["consensus_pick score-sum tally"]
    gate{"tool.liveExecutable?"}
  end
  hops3 --> pub --> gossip --> sum --> gate
  gate -->|yes| get["executeTool GET data.gov.in"]
  gate -->|no| force["force preferredLiveToolId"]
  force --> get
  rankonly["tb.agri.* liveExecutable false"] -.->|never RapidAPI| gate
  get --> obs3["observations plus consensusNotes to FCNP"]
  get --> ema["peerStats EMA alpha=0.3"]`;

const MNCD_FLOW = `flowchart TB
  c0["INPUT q, APRR assignments, peerStats"] --> c1
  c1["1 nodes = agents on the APRR path; mesh edge w = success / (1 + lat_ms/1000)"] --> c2
  c2["2 s = 0.45 score/(|score|+2) + 0.35 overlap + liveBoost - 0.05 index"] --> c3
  c3["3 liveBoost = 0.25 liveExecutable + 0.20 preferredLiveToolId"] --> c4
  c4["4 gossip fanout 3, rounds 2; distress if confidence less than 0.55"] --> c5
  c5["5 score-sum: tally[tool] = sum_a w_a s_a(tool); winner = argmax"] --> c6
  c6["6 execution gate: keep liveExecutable Agriculture UUIDs only"] --> c7
  c7["7 if none survive, force preferredLiveToolId(q)"] --> c8
  c8["8 GET api.data.gov.in with verified UUID; cap limit 10000; fail loud"] --> c9
  c9["9 update peerStats EMA; pass votes and executed rows to FCNP"] --> cout["OUTPUT observations for FCNP"]`;

const FCNP_ARCH = `flowchart LR
  subgraph in4["Inputs"]
    tr["MNCD proposals executions notes"]
    q4["pinned query"]
    old["prior session.memory"]
  end
  subgraph fcnp["fcnp.ts"]
    build["buildTraceContext"]
    D["D_ij = cosine if ge 0.12 else 0"]
    k["solve grounded L p = I"]
    Q["Q_ij = |D (p_i - p_j)|"]
    phy["D leftarrow (1-mu)D + alpha |Q|^gamma"]
    tier["keep 35% / summarize 20% / drop"]
    pin["never evict query or live citations"]
  end
  tr --> build
  q4 --> build
  old --> build
  build --> D --> k --> Q --> phy
  phy --> tier --> pin --> mem["M_t = retained[:24] into SATR s_base"]`;

const FCNP_FLOW = `flowchart TB
  d0["INPUT q, MNCD result, prior memory, turn t"] --> d1
  d1["1 nodes: pinned query, prior memory, proposals, live observations, pinned citations, notes"] --> d2
  d2["2 D_ij = cosine(e_i,e_j) if cosine ge 0.12 else 0; ground a sink by query mass"] --> d3
  d3["3 repeat at most 40: solve L p = I; Q = |D(p_i-p_j)|; D = (1-0.1)D + 0.5 |Q|^1.2"] --> d4
  d4["4 stop if Delta D less than 1e-4 times sum D"] --> d5
  d5["5 rank nodes by flow; keep top 35% verbatim; next 20% extractive summarize le 40 tokens"] --> d6
  d6["6 pinned live citations and the user query are never evicted"] --> d7
  d7["7 session.memory = retained[:24]; next SATR mixes M into s_base"] --> dout["OUTPUT M_t write-back"]`;

export const JOURNAL_FIGURES: JournalFigure[] = [
  {
    id: "overall-architecture",
    figure: "Figure 8",
    kind: "architecture",
    title: "Implemented ACRS system architecture",
    source: "lib/research/pipeline.ts",
    archived: "diagrams/overall_architecture.png",
    archivedDrops: [
      "SessionRerank+ wordmark",
      "Gemma 4 / embeddinggemma-300m",
      "NDCG@5 / Hit@5 pills",
      "CDR and PDR blocks",
      "Borda consensus",
      "97.5% accuracy / 10:1 compression",
      "Tamil Nadu CM demo strip",
    ],
    caption:
      "Figure 8. Implemented Adaptive Context Reasoning System (ACRS). One user turn traverses SATR → APRR → MNCD → FCNP. Live Indian Open Government Data enters only at MNCD. FCNP writes M_t back into SATR. Redrawn from pipeline.ts. The archived file diagrams/overall_architecture.png is a matplotlib composite and is not this figure.",
    mermaid: OVERALL_ARCH,
  },
  {
    id: "overall-algorithm",
    figure: "Figure 9",
    kind: "algorithm",
    title: "Implemented ACRS algorithmic flow",
    source: "lib/research/pipeline.ts",
    archived: "diagrams/algorithm_flow.png",
    archivedDrops: [
      "IndicTrans2 six-language banner",
      "NDCG@5 +14.7% and Hit@5 pills",
      "APRR + CDR + PDR title",
      "Borda consensus label on the MNCD arrow",
      "10:1 compression and F1@K pills",
      "invented mandi prices in the output box",
    ],
    caption:
      "Figure 9. Implemented closed-loop algorithm. SATR ranks; APRR samples specialist hops; MNCD score-sums tool identifiers and GETs a verified data.gov.in UUID; FCNP prunes and writes memory back. Redrawn from runPipeline. The archived diagrams/algorithm_flow.png still encodes metric pills and is not this figure.",
    mermaid: OVERALL_FLOW,
  },
  {
    id: "overall-pipeline-gif",
    figure: "Figure 8 (companion)",
    kind: "architecture",
    title: "Implemented pipeline (companion to the archived GIF)",
    source: "lib/research/pipeline.ts",
    archived: "diagrams/acrs_overall_pipeline.gif",
    archivedDrops: ["Animated GIF still titled with the archived objective stack"],
    caption:
      "Figure 8 companion. Same implemented loop as Figure 8. The archived diagrams/acrs_overall_pipeline.gif is retained on GitHub as a historical animation; this mermaid is the laboratory contract.",
    mermaid: OVERALL_ARCH,
  },
  {
    id: "satr-architecture",
    figure: "Figure 3A",
    kind: "architecture",
    title: "Implemented SATR architecture",
    source: "lib/research/satr.ts",
    archived: "diagrams/obj1_architecture.png",
    archivedDrops: [
      "SessionRerank+ title",
      "Gemma-4 encoder / FAISS",
      "IndicTrans2",
      "43,000 RapidAPI catalogue as an execution corpus",
    ],
    caption:
      "Figure 3A. Implemented Session-Aware Tool Retrieval (SATR). Inputs are q, successful history H, co-activation W_cooc, FCNP memory M, and the Agriculture catalog C. Output is a truncated RankedTool shortlist. SATR does not GET RapidAPI or data.gov.in. Redrawn from satrRerank. Archived diagrams/obj1_architecture.png is not this figure.",
    mermaid: SATR_ARCH,
  },
  {
    id: "satr-algorithm",
    figure: "Figure 3B",
    kind: "algorithm",
    title: "Implemented SATR algorithm flow",
    source: "lib/research/satr.ts",
    archived: "diagrams/obj1_algorithm_flow.png",
    archivedDrops: [
      "Language normalisation IndicTrans2",
      "Gemma-4 dense recall",
      "NDCG@5 ≥ 0.52 target",
      "Agent dispatch inside Objective 1",
    ],
    caption:
      "Figure 3B. Implemented SATR control flow, numbered as satr.ts runs. BM25+TFIDF base, session priors, co-activation, ToolRerank-style seen/unseen truncation after fusion, category cap, top-K to APRR. No NDCG is drawn. Archived diagrams/obj1_algorithm_flow.png is not this figure.",
    mermaid: SATR_FLOW,
  },
  {
    id: "aprr-architecture",
    figure: "Figure 4A",
    kind: "architecture",
    title: "Implemented APRR architecture",
    source: "lib/research/aprr.ts",
    archived: "diagrams/obj2_architecture.png",
    archivedDrops: [
      "CDR Context-Driven Routing block",
      "PDR Parallel Dispatch / octopus tokens",
      "WeatherAgent / MarketAgent / CropAgent SKUs",
      "265 ms SLA gate",
    ],
    caption:
      "Figure 4A. Implemented Adaptive Probabilistic Routing Reinforcement. Agents are tool specialists (agriculture_analyst, schema_planner, tool_executor, mesh_critic, retrieval_specialist), not foundation-model SKUs. Sampling is P ∝ W^α η^β ψ^γ with lab ε=0. The W update is applied after MNCD, not inside the forward hop. Redrawn from aprrRoute. Archived diagrams/obj2_architecture.png is not this figure.",
    mermaid: APRR_ARCH,
  },
  {
    id: "aprr-algorithm",
    figure: "Figure 4B",
    kind: "algorithm",
    title: "Implemented APRR algorithm flow",
    source: "lib/research/aprr.ts",
    archived: "diagrams/obj2_algorithm_flow.png",
    archivedDrops: [
      "CDR threshold θ_CDR = 0.72",
      "PDR parallel fan-out M=3",
      "Borda consensus aggregation inside Objective 2",
      "Latency SLA ≤ 265 ms",
    ],
    caption:
      "Figure 4B. Implemented APRR control flow. Hop 0 is agriculture_analyst. Subsequent hops are a categorical draw from the normalised product W^α η^β ψ^γ. assignTools is a category gate with fallback to SATR #1. CDR and PDR are not functions in aprr.ts. Archived diagrams/obj2_algorithm_flow.png is not this figure.",
    mermaid: APRR_FLOW,
  },
  {
    id: "mncd-architecture",
    figure: "Figure 5A",
    kind: "architecture",
    title: "Implemented MNCD architecture",
    source: "lib/research/mncd.ts",
    archived: "diagrams/obj3_architecture.png",
    archivedDrops: [
      "Borda as the drawn consensus",
      "97.5% accuracy / 100% uptime pills",
      "phi-accrual failure detector as a required box",
      "HF model SKUs (gemma-2-2b-it, Qwen, Llama) as mesh nodes",
    ],
    caption:
      "Figure 5A. Implemented Mesh Network Context Diffusion. Vote object is a toolId. Consensus is score-sum (consensus_pick). Borda exists in the GitHub ranking library and is not the laboratory default. Live GET is restricted to verified data.gov.in Agriculture UUIDs. Catalog-only ToolBench tools are ranking-only. Redrawn from mncdExecute. Archived diagrams/obj3_architecture.png is not this figure.",
    mermaid: MNCD_ARCH,
  },
  {
    id: "mncd-algorithm",
    figure: "Figure 5B",
    kind: "algorithm",
    title: "Implemented MNCD algorithm flow",
    source: "lib/research/mncd.ts",
    archived: "diagrams/obj3_algorithm_flow.png",
    archivedDrops: [
      "Borda formula t̂(q) = argmax Σ c_i (m_i − rank_i + 1) as the default",
      "Accuracy percentages",
      "Packet-loss robustness claims",
    ],
    caption:
      "Figure 5B. Implemented MNCD control flow. Agents publish rank.update; gossip fanout=3, rounds=2; tally is Σ w_a s_a; the execution gate drops non-live tools and may force preferredLiveToolId. Fail loud: no snapshot prices. Archived diagrams/obj3_algorithm_flow.png is not this figure.",
    mermaid: MNCD_FLOW,
  },
  {
    id: "fcnp-architecture",
    figure: "Figure 6A",
    kind: "architecture",
    title: "Implemented FCNP architecture",
    source: "lib/research/fcnp.ts",
    archived: "diagrams/obj4_architecture.png",
    archivedDrops: [
      "10:1 compression pill",
      "F1@K p<0.05",
      "≥99% citation accuracy",
      "PDR route label as a pruning gate",
    ],
    caption:
      "Figure 6A. Implemented Flow-Coupled Network Pruning. The graph is built from the MNCD trace; D_ij is cosine above 0.12; a grounded Kirchhoff solve yields Q; Physarum updates D. Hybrid tiers keep / summarize / drop. Live citations and the query are pinned. M_t is written into the next SATR s_base. No token-reduction ratio is drawn. Redrawn from fcnpPrune. Archived diagrams/obj4_architecture.png is not this figure.",
    mermaid: FCNP_ARCH,
  },
  {
    id: "fcnp-algorithm",
    figure: "Figure 6B",
    kind: "algorithm",
    title: "Implemented FCNP algorithm flow",
    source: "lib/research/fcnp.ts",
    archived: "diagrams/obj4_algorithm_flow.png",
    archivedDrops: [
      "max_iter=200 (laboratory maxIterations=40)",
      "cosine threshold τ=0.30 (laboratory 0.12)",
      "7-baseline leaderboard band",
      "mandi table 50→5 as a claimed compression result",
    ],
    caption:
      "Figure 6B. Implemented FCNP control flow as fcnp.ts runs: buildTraceContext, grounded Laplacian, Physarum D update (μ=0.1, α=0.5, γ=1.2, ≤40 iterations), hybrid keep/summarize/drop, pin, write-back. Archived diagrams/obj4_algorithm_flow.png is not this figure.",
    mermaid: FCNP_FLOW,
  },
];

export const GITHUB_DIAGRAM_FILES = [
  "acrs_overall_pipeline.gif",
  "algorithm_flow.png",
  "obj1_algorithm_flow.png",
  "obj1_architecture.png",
  "obj2_algorithm_flow.png",
  "obj2_architecture.png",
  "obj3_algorithm_flow.png",
  "obj3_architecture.png",
  "obj4_algorithm_flow.png",
  "obj4_architecture.png",
  "overall_architecture.png",
] as const;

export const FIGURE_BY_ID = Object.fromEntries(JOURNAL_FIGURES.map((row) => [row.id, row])) as Record<
  string,
  JournalFigure
>;

export const SATR_MERMAID = SATR_FLOW;
export const APRR_MERMAID = APRR_FLOW;
export const MNCD_MERMAID = MNCD_FLOW;
export const FCNP_MERMAID = FCNP_FLOW;
export const INTEGRATION_MERMAID = OVERALL_ARCH;
