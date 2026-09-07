/**
 * Worked traces for the Ph.D. pipeline walkthrough.
 *
 * Numbers below were produced by the same functions the lab runs
 * (satrRerank → aprrRoute → mncdExecute → fcnpPrune) on 07 September 2026.
 * They are lab traces, not proposal performance claims.
 *
 * Two evidence regimes:
 *   1. ToolBench-schema ranking (Qin et al., ICLR 2024 library) — never GET RapidAPI.
 *   2. Live data.gov.in Agriculture (AGMARKNET UUID 9ef84268-d588-465a-a308-a864a43d0070).
 */

export const TOOLBENCH_G1_ROW = {
  file: "data/toolbench/queries.test.jsonl",
  qid: "6491",
  goldDocIds: ["4308", "4309", "4310", "4311", "4312", "4313", "4314", "4315", "4316", "4317"],
  query:
    "I am organizing a trip for my family and we want to track live aircraft during our journey. Can you provide the total number of live tracked aircraft at the moment? Additionally, we would like to know if there are any emergency aircraft currently flying.",
  whatQinShipped:
    "ToolBench G1 instruction with gold RapidAPI document ids. Live RapidAPI keys are not redistributable. This lab never GET those endpoints.",
  whatTheLabDoes:
    "Off-sector tools (flights, cricket, movies) are stripped from the catalog. The query is still scored against Agriculture-only tools. MNCD then refuses RapidAPI and, if a live Agriculture UUID wins or is forced, reads data.gov.in instead.",
} as const;

export const TOOLBENCH_SOIL = {
  id: "toolbench-soil",
  regime: "ToolBench-schema ranking library (not live RapidAPI)",
  toolId: "tb.agri.soil_health",
  toolName: "Soil Health Card Lookup",
  source: "toolbench",
  collection: "RapidAPI-Agriculture",
  liveExecutable: false,
  query: "What is the soil pH and recommended fertilizer dose for a farm village?",
  capturedAt: "07 September 2026",
  whyThisDatum:
    "The bundled G1 jsonl is RapidAPI (flights, recipes, odds). The ranking library this Agriculture lab actually scores is the ToolBench-schema agri tool tb.agri.soil_health. Same ToolLLM-style (query, tool schema) pair; different execution contract.",
} as const;

export const DATAGOV_MANDI = {
  id: "datagov-agmarknet",
  regime: "Live Indian Open Government Data",
  toolId: "datagov.mandi_prices",
  resourceId: "9ef84268-d588-465a-a308-a864a43d0070",
  citation:
    "Current Daily Price of Various Commodities from Various Markets (Mandi), Ministry of Agriculture and Farmers Welfare, data.gov.in",
  query: "What is the current mandi price of wheat in Punjab?",
  capturedAt: "07 September 2026",
  elasticCap: 10000,
} as const;

export type StageStep = {
  title: string;
  equation?: string;
  algo: string[];
  numbers: string[];
};

export const SOIL_STAGES: StageStep[] = [
  {
    title: "Stage 0 — intake (ToolBench schema, not RapidAPI)",
    algo: [
      "Read tool id tb.agri.soil_health from lib/research/catalog.ts (source=toolbench, liveExecutable=false).",
      "Tokenize the farmer query. Do not call RapidAPI soil_health_card.",
      "Load the Agriculture-only catalog (data.gov.in + Karnataka + ToolBench-schema agri tools).",
    ],
    numbers: [
      "Query tokens include soil, ph, recommended, fertilizer, dose, farm, village.",
      "Tool document mixes name, description, tags {soil, ph, nutrient, fertilizer, card}.",
      "G1 jsonl qid=6491 (aircraft) is the actual ToolBench test row on disk; it is not executed here.",
    ],
  },
  {
    title: "O1 SATR — Session-Aware Tool Retrieval",
    equation:
      "s(a|q,H)=1·s_base + 0.45 cat + 0.25 sch + 0.3 ept + 0.35 Σ γ^{n-i} log(1+w_{h_i,a}) + 0.25 rec − 0.35 fails",
    algo: [
      "s_base = 0.7 BM25 + 0.3 TFIDF-cosine + 0.08 memory-cosine. BM25 k1=1.5, b=0.75.",
      "Z-score s_base across the catalog. Session priors are 0 on a cold start (H empty).",
      "Sort descending. ToolRerank-style seen/unseen truncation (all unseen on turn 1). Keep top K=8.",
    ],
    numbers: [
      "Cold start: cat=sch=ept=cooc=rec=0, so s(a)=z(s_base).",
      "tb.agri.soil_health: s_base=18.0753 → s=5.3978 (rank 1). Ranking-only.",
      "karnataka::shc_karnataka: s_base=6.0728 → s=1.3985 (rank 2).",
      "tb.map.geocode_village: s=0.8738 (village overlap).",
      "datagov.fertilizer: s=0.6042 (liveExecutable=true, rank 4).",
      "looksMultiTool=true (and + fertilizer + village) so category concentration is not applied.",
    ],
  },
  {
    title: "O2 APRR — hop path over specialists",
    equation: "P(a_j|a_i,q) ∝ W_{ij}^2 · η_{ij}^1 · ψ_j(q)^{2.5},   W_{ij}=W0=0.1, ε=0",
    algo: [
      "Start at agriculture_analyst. Sample up to maxHops=4. Stop early if a terminal agent is reached and |path|≥3.",
      "η=cosine(agent embeddings), ψ=cosine(query, agent). 32-d hashed embeddings.",
      "assignTools: pref=1 if category in agent.categories else 0.12. Filter pref>0.2, else fall back to SATR #1.",
    ],
    numbers: [
      "Sampled path: agriculture_analyst → schema_planner (p=0.7263) → retrieval_specialist (p=0.9481).",
      "Hop 0 agriculture_analyst (Agriculture match): tb.agri.soil_health, karnataka::shc_karnataka, tb.map.geocode_village.",
      "schema_planner categories are Data/Mapping/Government, not Agriculture, so pref=0.12<0.2 → fallback SATR #1 = soil_health.",
      "retrieval_specialist likewise falls back to soil_health. No RapidAPI call is prepared.",
    ],
  },
  {
    title: "O3 MNCD — score-sum then live gate",
    equation:
      "s=0.45 score/(|score|+2)+0.35 overlap+liveBoost−0.05 index;   tally=Σ w_a s_a;   w=0.8/(1+80/1000)=0.7407",
    algo: [
      "Each agent publishes rank.update. Gossip fanout=3, R=2.",
      "Score-sum (not Borda). Distress if confidence < τ=0.55.",
      "Keep only liveExecutable winners. If none, force preferredLiveToolId(q).",
      "preferredLiveToolId matches fertilizer|urea|npk|subsidy → datagov.fertilizer.",
      "executeTool: ToolBench soil_health is catalog-only; fertilizer has UUID 2e0e6c04-97f2-456b-9309-bf605650cb11.",
    ],
    numbers: [
      "agriculture_analyst ranking: soil_health 0.5995, shc 0.4063, geocode 0.2896.",
      "Check: 0.45·5.3978/(5.3978+2) = 0.3284; plus overlap on soil/fertilizer tokens yields 0.5995. liveBoost=0 (not live).",
      "tally(soil_health)=3·0.7407·0.5995 = 1.332 (unanimous ranking winner).",
      "No liveExecutable vote survived the gate. Forced live tool = datagov.fertilizer.",
      "Live GET returned 44/44 rows. Example: 2002-2003 Indigenous Urea subsidy = 7790 Rs crore. Not a RapidAPI soil card.",
    ],
  },
  {
    title: "O4 FCNP — Kirchhoff prune and write-back",
    equation: "D_{ij}(t+1)=(1−0.1)D_{ij}+0.5 |Q_{ij}|^{1.2};   L p = I;   keep 35% / summarize 20% / drop rest",
    algo: [
      "Trace nodes: query (pinned), proposals, live observation, live citation (pinned), consensus notes.",
      "Edge if cosine≥0.12. Iterate ≤40 times. Grounded sink.",
      "Persistent citations cannot be dropped. session.memory ← retained[:24].",
    ],
    numbers: [
      "10 context elements → retained 6, evicted 4, pinned 3, 40 iterations (not fully converged at ε=1e-4).",
      "Pinned: query_1, obs_datagov.fertilizer_0, cite_datagov.fertilizer_0.",
      "Dropped: four consensus notes. Proposals kept or summarized.",
      "Next SATR turn mixes this memory into s_base (0.08 memory-cosine).",
    ],
  },
];

export const MANDI_STAGES: StageStep[] = [
  {
    title: "Stage 0 — intake (live AGMARKNET)",
    algo: [
      "Slot-fill extractToolArguments: state←Punjab, commodity←Wheat. No schema defaults invented.",
      "preferredLiveToolId matches price|mandi|modal|agmarknet|wholesale → datagov.mandi_prices.",
      "Resource UUID 9ef84268-d588-465a-a308-a864a43d0070. Elastic limit capped at 10000.",
    ],
    numbers: [
      "Query: “What is the current mandi price of wheat in Punjab?”",
      "karnataka::agmarknet_ka shares the same UUID and is liveExecutable (Karnataka-first view).",
    ],
  },
  {
    title: "O1 SATR — Session-Aware Tool Retrieval",
    equation: "s(a)=z(0.7 BM25 + 0.3 TFIDF-cosine)  on a cold start",
    algo: [
      "Score the Agriculture catalog. Single-tool query (no “and”/multi-tool cue) → category concentration after truncation.",
      "Mandi lexical field (mandi, price, wheat) lifts AGMARKNET tools and MSP; distractors stay low.",
    ],
    numbers: [
      "karnataka::agmarknet_ka: s_base=9.2617 → s=3.7284 (rank 1, live).",
      "datagov.mandi_prices: s_base=7.7776 → s=3.0453 (rank 2, live, preferred).",
      "datagov.msp: s=2.3101 (ranking-only; no MSP UUID is executed).",
      "tb.data.search_catalog: s=0.7433 (ToolBench-schema, not executed).",
      "tb.travel.flights is not in the catalog (off-sector strip).",
    ],
  },
  {
    title: "O2 APRR — hop path",
    equation: "P(a_j|a_i,q) ∝ W_{ij}^2 η_{ij} ψ_j^{2.5}",
    algo: [
      "Start agriculture_analyst. tool_executor is terminal: stop when it appears and |path|≥3.",
      "tool_executor gets +0.35 pref on liveExecutable tools, so it prefers ministry UUIDs over ranking-only schemas.",
    ],
    numbers: [
      "Path: agriculture_analyst → schema_planner (p=0.5382) → tool_executor (p=0.6580), then stop.",
      "Hop 0: karnataka::agmarknet_ka, datagov.mandi_prices, datagov.msp.",
      "Hop 1 schema_planner fallback SATR #1 (already used) still carries karnataka::agmarknet_ka.",
      "Hop 2 tool_executor: remaining live tool datagov.crop_production (karnataka and mandi already taken).",
    ],
  },
  {
    title: "O3 MNCD — score-sum + live GET",
    equation:
      "s=0.45 score/(|score|+2)+0.35 overlap+liveBoost−0.05 index;  tally=Σ w_a s_a",
    algo: [
      "liveBoost = 0.25 if live + 0.20 if preferred (datagov.mandi_prices for this query).",
      "Score-sum over default peer weights 0.7407.",
      "Execute liveExecutable winners (single-tool query → one winner). GET /resource/{uuid}?limit=10000.",
      "Client filter: Karnataka-first with fallback. If Wheat∩Punjab is empty, show other live Punjab rows and live Wheat from other states. Never invent a Punjab-wheat modal.",
    ],
    numbers: [
      "agriculture_analyst: mandi_prices 0.7870 (preferred liveBoost 0.45), karnataka 0.7789, msp 0.1895.",
      "schema_planner: karnataka 0.7789. tool_executor: crop_production 0.4393.",
      "tally karnataka::agmarknet_ka = 2·0.7407·0.7789 = 1.154 (winner).",
      "tally datagov.mandi_prices = 0.583. Same UUID family is executed.",
      "Live feed: 10000 AGMARKNET arrivals. 0 Wheat rows in Punjab today. 479 other live Punjab rows. Live Wheat in 133 rows from Madhya Pradesh, Rajasthan, Uttar Pradesh, Gujarat, Maharashtra, West Bengal, Chhattisgarh.",
      "Shown mean modal Rs 2593/quintal. Example live Punjab row: Bhindi at Dera Baba Nanak APMC, Gurdaspur, modal Rs 828/quintal (07/09/2026).",
    ],
  },
  {
    title: "O4 FCNP — pin the ministry citation",
    equation: "D(t+1)=(1−μ)D+α|Q|^γ;  persistent citations force-included",
    algo: [
      "Observation + citation of the live GET are pinned.",
      "Gossip notes are low-mass and usually drop.",
      "W update: reward=+1, λ=0.005, κ=5, deposit=κ/L²/lat_norm on path edges.",
    ],
    numbers: [
      "10 elements → retained 7, evicted 3, pinned 3.",
      "Pinned: query, cite_karnataka::agmarknet_ka_0, obs_karnataka::agmarknet_ka_0.",
      "Write-back ids include the AGMARKNET citation so turn t+1 SATR is not turn-amnesic.",
    ],
  },
];

export const AIRCRAFT_HONESTY: StageStep[] = [
  {
    title: "What happens if the literal ToolBench G1 row is piped in",
    algo: [
      "qid=6491 asks for live aircraft counts. Gold RapidAPI docs 4308–4317 are not fetched.",
      "SATR still ranks the Agriculture catalog. Lexical “live” lifts AGMARKNET tools.",
      "MNCD executes live data.gov.in, not RapidAPI. That is the sector lock, not a pretend aircraft API.",
    ],
    numbers: [
      "SATR rank 1: karnataka::agmarknet_ka s=3.1030. Rank 2: tb.data.search_catalog s=1.7804 (ranking-only).",
      "Score-sum winner karnataka::agmarknet_ka tally=2.444. Multi-tool cue also executed horticulture UUID a2b43dcc-9cd2-4601-b183-3e859624dea4.",
      "Answer is live Karnataka mandi rows (e.g. Sunflower at Hungund APMC, modal Rs 7900/quintal on 07/09/2026) plus a Karnataka horticulture row — never an aircraft count.",
    ],
  },
];

export const WALKTHROUGH_QUERIES = {
  soil: TOOLBENCH_SOIL.query,
  mandi: DATAGOV_MANDI.query,
  aircraft: TOOLBENCH_G1_ROW.query,
} as const;
