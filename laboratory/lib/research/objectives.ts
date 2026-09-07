import { COLLEGE } from "./college";

export const RESEARCH = {
  scholar: COLLEGE.scholar,
  email: COLLEGE.email,
  registerNo: COLLEGE.registerNo,
  supervisor: COLLEGE.supervisor,
  affiliation: `${COLLEGE.kicker} · ${COLLEGE.programme} · ${COLLEGE.university}`,
  title: COLLEGE.title,
  shortTitle: COLLEGE.shortTitle,
};

export const OVERALL_OBJECTIVE = {
  id: "overall",
  title: "Overall objective",
  statement:
    "Design, implement, and critically evaluate ACRS — a structural orchestration layer in which session-aware tool retrieval (SATR), training-free specialist routing (APRR), mesh consensus over tool identifiers (MNCD), and flow-coupled context pruning with write-back (FCNP) form a closed loop on live Indian Open Government Data. The proposal-stage claim is architectural completeness and live-pipeline integrity, not a leaderboard number.",
  questions: [
    "Can tool retrieval be conditioned on a co-activation cache and session memory rather than a single query embedding (Qin et al., ToolLLM, ICLR 2024; Zheng et al., ToolRerank, LREC-COLING 2024)?",
    "Can routing sample a training-free posterior over tool-specialist agents instead of a trained neural controller or an authored SOP (Yue et al., MasRouter, ACL 2025; Hong et al., MetaGPT, ICLR 2024; Ong et al., RouteLLM, ICLR 2025)?",
    "Can execution proceed as gossiped (toolId, score) plus score-sum consensus, then a live data.gov.in GET, instead of a central chat orchestrator (Wu et al., AutoGen, COLM 2024)?",
    "Can Kirchhoff/Physarum pruning pin live citations back into retrieval rather than only shortening the prompt (Jiang et al., LLMLingua, EMNLP 2023; Tero et al., Science 2010)?",
  ],
};

export const OBJECTIVES = [
  {
    id: "satr",
    code: "O1",
    repo: "session-aware-toolbench-rerank",
    title: "SessionRerank+ (SATR)",
    journalDefinition:
      "The retrieval chapter of the thesis: given query q and session history H, return a ranked list of ToolBench-schema tools fused with a co-activation cache. The unit of publication is the fusion rule, not an NDCG target.",
    objective:
      "Rank ToolBench-schema and data.gov.in Agriculture APIs with a session-aware score that mixes semantic similarity, category/schema/endpoint affinity, recency, and a co-activation cache w_{u,v}←(1-ρ)w_{u,v}+δ·1[success]. Live ministry rows are never invented at this stage.",
    sota: {
      papers: [
        "Qin et al., ToolLLM / ToolBench (ICLR 2024): Sentence-BERT API retriever over 16,464 RapidAPI tools, then ToolLLaMA + DFSDT.",
        "Zheng et al., ToolRerank (LREC-COLING 2024): adaptive truncation of seen vs unseen APIs and hierarchy-aware concentration/diversity.",
      ],
      pipeline:
        "instruction → SBERT retrieve top-k APIs → (optional ToolRerank truncate/rerank) → LLM DFSDT/ReAct planner",
      gap: "SOTA retrievers are turn-amnesic. They do not maintain a success-conditioned co-activation graph or ingest pruned memory from later stages.",
    },
    novelty: [
      "Session co-activation cache as a first-class prior over tool pairs.",
      "Convex fusion of semantic and session scores; λ may grow with session length.",
      "ToolRerank-style seen/unseen truncation kept, then applied after session scoring.",
      "FCNP memory mixed into the next SATR prior so retrieval is closed-loop.",
    ],
    outputs: "Ranked shortlist consumed by APRR. No NDCG commitment at proposal stage.",
    methodology: [
      "Design method. Specify a fused session object: query + dialogue turns + last tool traces + co-activation counts. Rank tools with that object, not with the raw utterance alone.",
      "Ranking library (not live prices). Use ToolBench / ToolLLM artefacts as a public tool-ranking library and protocol family. RapidAPI-style traces are ranking evidence only.",
      "Live Indian OGD is out of SATR’s ranking path. Mandi and weather rows enter at MNCD. SATR must not invent or cache dummy AGMARKNET prices.",
      "Implementation path. Persist co-activation in a session store; expose a rank(query, session) API that APRR can call. Fail loud if the session schema is incomplete.",
      "Future evaluation protocol (not a result). When the protocol is frozen, compare session-fused ranking against query-only ranking on the same ToolBench-style split. Report the protocol, not a pre-committed score.",
      "Deliverable for the thesis chapter. Algorithm, schema, and ablation plan (with vs without tool-trace fusion).",
    ],
  },
  {
    id: "aprr",
    code: "O2",
    repo: "aprr-multi-agent-routing",
    title: "Adaptive Probabilistic Routing Reinforcement (APRR)",
    journalDefinition:
      "The routing chapter: a training-free posterior over tool-specialist agents, updated from SATR scores and from live MNCD observations. The unit of publication is the Bayesian controller, not a Pareto chart.",
    objective:
      "Sample a specialist-agent hop path with P(a_j|a_i,q) ∝ W_ij^α · η_ij^β · ψ_j(q)^γ, then decay-regularise W after MNCD outcomes. Agents are mandi / crop-production / rainfall / horticulture specialists, not foundation-model SKUs.",
    sota: {
      papers: [
        "Yue et al., MasRouter (ACL 2025, doi:10.18653/v1/2025.acl-long.757): trained neural controller over multi-agent topologies.",
        "Ong et al., RouteLLM (ICLR 2025): routers among LLMs.",
        "Panda et al., Adaptive LLM Routing under Budget Constraints (PILOT; Findings of EMNLP 2025, doi:10.18653/v1/2025.findings-emnlp.1301): preference-prior LinUCB for budget-constrained LLM routing.",
        "Hong et al., MetaGPT (ICLR 2024): authored SOP workflows.",
      ],
      pipeline: "query → trained controller or difficulty model → choose one LLM/agent → execute",
      gap: "SOTA either trains a neural router, picks a model, or follows an authored SOP. It does not maintain a training-free affinity matrix over Indian OGD tool families.",
    },
    novelty: [
      "Training-free online W versus MasRouter's learned controller.",
      "Implemented update is κ·reward·1/L²·1/lat_norm with negative reward on failure.",
      "CTGR and FTDR remain in the GitHub repo; this lab runs core APRR hops.",
      "W is session state, so routing can adapt across farmer turns.",
    ],
    outputs: "Hop path and agent-tool assignments consumed by MNCD. No latency target.",
    methodology: [
      "Design method. Maintain a Dirichlet–Thompson posterior over named specialists. Sample or take the MAP specialist given SATR’s fused session.",
      "Allocation rule (proposal form). P(agent | context) ∝ W^α · η^β · ψ^γ, with W = session-matched specialist weight, η = reliability, ψ = cost/risk. Exponents are design knobs, not fitted claims.",
      "Training-free stance. Do not train a MasRouter- or RouteLLM-style classifier as the primary method. Learned routers remain a future bake-off class, not the implementation.",
      "What is being routed. Specialists in the ACRS mesh — not LLM SKUs (GPT-4 vs Mixtral) and not AutoGen conversation modes as the object of routing.",
      "Update rule. After MNCD returns verified or failed evidence, update η (and optionally W) so the next turn’s posterior is not identical to a cold start.",
      "Future evaluation protocol (not a result). Log specialist choice vs task type on held-out session traces; compare against a static role graph. No pre-committed accuracy.",
    ],
  },
  {
    id: "mncd",
    code: "O3",
    repo: "mncd-mesh-agents",
    title: "Mesh Network Context Diffusion (MNCD)",
    journalDefinition:
      "The consensus-and-execution chapter: gossip (toolId, score), score-sum consensus, live data.gov.in GET on verified UUIDs. The unit of publication is the protocol plus the citation contract.",
    objective:
      "Run routed agents as a gossip mesh: publish rank.update, fanout=3, R=3 last-write-wins replicate, score-sum consensus (Borda exists in the repo but is not the eval default), then execute only live data.gov.in Agriculture resources.",
    sota: {
      papers: [
        "Wang et al., A survey on large language model based autonomous agents (Frontiers of Computer Science, 2024, doi:10.1007/s11704-024-40231-1): construction of LLM agents.",
        "He, Treude and Lo, LLM-Based Multi-Agent Systems for Software Engineering (ACM TOSEM, 2025, doi:10.1145/3712003): LMA systems across the SDLC.",
        "Guo et al., Large Language Model based Multi-Agents (IJCAI-24, doi:10.24963/ijcai.2024/890): profiling and communication.",
        "Chang and Geng, SagaLLM (PVLDB 2025, doi:10.14778/3750601.3750611): transactional context for multi-agent LLM planning.",
        "Wu et al., AutoGen (COLM 2024): multi-agent conversation.",
        "Hong et al., MetaGPT (ICLR 2024): SOP pipeline.",
        "Qian et al., ChatDev (ACL 2024): organisational chat-chain.",
        "Li et al., CAMEL (NeurIPS 2023): communicative role-playing agents.",
      ],
      pipeline: "manager LLM → sequential or star-topology agent messages → tool calls",
      gap: "Star and chat topologies coordinate over natural-language messages. They do not vote over tool identifiers backed by a ministry API.",
    },
    novelty: [
      "First-class vote object is a tool ID, not a chat utterance.",
      "consensus_pick is score-sum; consensus_pick_borda is a non-default variant.",
      "Live Indian OGD only. Catalog-only tools stay ranking-only; prices are never invented.",
      "HTTP 5xx/429 are retried; empty filters show other live rows from the same resource.",
    ],
    outputs: "Consensus tally plus live observations consumed by FCNP.",
    methodology: [
      "Design method. Specialists selected by APRR gossip partial beliefs. Aggregate with score-sum (not Borda). Every live claim must cite a verified data.gov.in resource UUID.",
      "Corpus / API. Agriculture-only Open Government Data: AGMARKNET (9ef84268-d588-465a-a308-a864a43d0070) and other UUIDs that pass verification.",
      "Fail-loud contract. HTTP 5xx/429 are retried with backoff; missing API key, unverified UUID, or empty filtered universe hard-fail. No dummy mandi prices.",
      "Platform constraint. data.gov.in Elastic max_result_window is 10 000; limit is capped. Pagination is sequential, not a fabricated parallel harvest.",
      "Related work used correctly. Guo, Woodruff & Yadav, PECAD (AAAI 2020) shows AGMARKNET as a real DSS input. MNCD does not re-implement crop-yield prediction.",
      "Future evaluation protocol (not a result). Measure citation completeness, fail-loud rate on injected faults, and qualitative agreement of score-sum vs majority vote.",
    ],
  },
  {
    id: "fcnp",
    code: "O4",
    repo: "fcnp-context-pruning",
    title: "Flow-Coupled Network Pruning (FCNP)",
    journalDefinition:
      "The memory chapter: Kirchhoff/Physarum conductances prune the mesh trace and write surviving live citations back into SATR. The unit of publication is the coupling, not a token-percentage.",
    objective:
      "Prune the mesh trace with a Kirchhoff/Physarum loop D_ij(t+1)=(1-μ)D_ij+α|Q_ij|^γ, hybrid keep/summarize/drop tiers, and persistent citations written back to SATR.",
    sota: {
      papers: [
        "Jiang et al., LLMLingua (EMNLP 2023): token-level prompt compression.",
        "Tero et al., Science 2010 (doi:10.1126/science.1177894): Physarum adaptive network.",
        "Park et al., Generative Agents (UIST 2023): language memory stream in a sandbox.",
      ],
      pipeline: "long prompt → compressor → LLM. Memory is not written back into a tool retriever.",
      gap: "Token compressors are not current-reinforced over a context graph and do not pin live government citations into the next retrieval turn.",
    },
    novelty: [
      "Laplacian solve with grounded sink, matching the published Python pruner.",
      "Hybrid tiering and persistent high-flow citations.",
      "If a requested crop/state has no AGMARKNET rows today, other live rows are shown; nothing is invented.",
      "Closed loop: retained spans become SATR session memory.",
    ],
    outputs: "Compact session memory for SATR at turn t+1. No compression-ratio commitment.",
    methodology: [
      "Design method. Treat the post-MNCD mesh as a flow network. Apply a Kirchhoff / Physarum-inspired conductance update; drop low-conductance specialist edges; keep a residue.",
      "Write-back (the integration hinge). The residue is written into SATR’s next fused session. Without write-back, FCNP would be prompt compression by another name.",
      "Contrast with LLMLingua. LLMLingua shortens tokens before the LLM. FCNP prunes who remains in the mesh. Tokenisers are not the primary artefact.",
      "Heuristic honesty. Discrete conductance is a design heuristic inspired by Tero et al. (Science, 2010), not a proof that the mesh is a Physarum organism.",
      "Safety. Pruning must not delete the last live-data specialist if MNCD still has an open verified query. Fail loud rather than silently drop evidence.",
      "Future evaluation protocol (not a result). Compare mesh size and downstream SATR rank stability with vs without pruning on the same session traces.",
    ],
  },
] as const;

export const INTEGRATED_METHODOLOGY = [
  "Closed-loop protocol. One user turn must traverse all four modules in order. Skipping MNCD (no live UUID) or FCNP (no write-back) is treated as an incomplete run, not a successful demo.",
  "Two evidence regimes. (1) ToolBench-style ranking traces for SATR. (2) Live data.gov.in Agriculture rows for MNCD. Do not mix dummy prices into (1) or RapidAPI tools into (2).",
  "Independent variables (future experiments). Session fusion on/off; Dirichlet routing vs static roles; score-sum vs majority; FCNP write-back on/off.",
  "Dependent measures (to be frozen later). Citation completeness, fail-loud correctness, rank stability across turns, qualitative specialist-choice logs.",
  "Domain lock. Agriculture on Indian OGD for the live path. Other sectors are out of scope until a later amendment.",
  "Ethics / data. Public government catalogues only; no personal data; API keys stay in the environment, never in the thesis text.",
] as const;

export const PIPELINE_EDGES = [
  { from: "User query + session", to: "SATR" },
  { from: "SATR shortlist", to: "APRR" },
  { from: "APRR hop path", to: "MNCD" },
  { from: "MNCD live observations", to: "FCNP" },
  { from: "FCNP memory", to: "SATR (next turn)" },
];
