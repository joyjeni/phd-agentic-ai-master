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

/**
 * Proposal-stage non-claim. Evaluation protocols, if frozen later, are not
 * part of these objectives.
 */
export const NON_CLAIMS = {
  title: "What these objectives do not claim",
  statement:
    "Motivation and objectives in this proposal are design statements. They specify what will be built, in what order, on which corpus, and with which fail-loud rules. They do not commit a retrieval score, a routing win-rate, a consensus percentage, a latency bound, a token-reduction ratio, or any other computational metric. Later experimental chapters may name a protocol; that protocol is outside these objectives.",
} as const;

export const MOTIVATION = {
  title: "Motivation",
  paragraphs: [
    "Large-language-model agents already retrieve tools, choose among models or workflows, coordinate over messages, and shorten prompts. In the published literature those four operations remain four families. A farmer query against Indian Open Government Data needs them as one turn: the next tool list must remember which tools succeeded together; the next hop must be a named specialist rather than a foundation-model SKU; the object that is voted on must be a tool identifier backed by a verified ministry UUID; and whatever is kept after pruning must re-enter retrieval rather than disappear as deleted tokens.",
    "Wang et al. organise LLM agents as Profiling, Memory, Planning, and Action (Frontiers of Computer Science, 2024). That template does not name a session co-activation cache, a training-free hop sampler over tool specialists, a mesh whose consensus object is a live tool ID, or a conductance prune that writes citations back into retrieval. ToolLLM and ToolRerank retrieve from the current query. RouteLLM, PILOT, MasRouter, and MetaGPT pick models or follow authored SOPs. AutoGen, ChatDev, and CAMEL coordinate over chat. LLMLingua shortens the prompt. Taken together, those papers are not a live Agriculture loop on data.gov.in.",
    "This research is therefore motivated to specify Adaptive Context Reasoning System (ACRS) as the missing structural orchestration layer: one fail-loud contract in which session retrieval, specialist routing, live Indian OGD execution, and citation write-back occur in a fixed order. The motivation is architectural completeness — that the four surfaces are named, ordered, and closed — not a leaderboard comparison.",
  ],
  bullets: [
    "Published stacks retrieve, route, chat, or compress as separate families.",
    "A live Indian OGD turn needs all four as one fail-loud contract, with write-back into retrieval.",
    "The motivation is to specify that contract, not to pre-commit a computational score.",
  ],
} as const;

export const OVERALL_OBJECTIVE = {
  id: "overall",
  title: "Overall research objective",
  statement:
    "To design and implement Adaptive Context Reasoning System (ACRS) as a closed structural orchestration layer in which SATR (Session-Aware Tool Retrieval), training-free specialist routing (APRR), mesh consensus over tool identifiers (MNCD), and flow-coupled context pruning with write-back (FCNP) execute in that order on one user turn, using live Indian Open Government Data as the only execution corpus. The proposal-stage claim is architectural completeness and live-pipeline integrity — that the four modules form one fail-loud loop — not a retrieval, routing, consensus, or compression score.",
  scope: [
    "Live execution is Agriculture on verified data.gov.in resource UUIDs only.",
    "ToolBench / ToolLLM artefacts are a ranking library and protocol family, not an execution corpus. RapidAPI endpoints are never GET.",
    "SATR is not a new language model. MNCD is not a crop-yield predictor. FCNP is not a tokeniser.",
    "Skipping MNCD (no live UUID) or FCNP (no write-back) is an incomplete run, not a successful demonstration.",
  ],
  questions: [
    "Can tool retrieval be conditioned on a co-activation cache and session memory rather than a single query embedding (Qin et al., ToolLLM, ICLR 2024; Zheng et al., ToolRerank, LREC-COLING 2024)?",
    "Can routing sample a training-free posterior over tool-specialist agents instead of a trained neural controller or an authored SOP (Yue et al., MasRouter, ACL 2025; Hong et al., MetaGPT, ICLR 2024; Ong et al., RouteLLM, ICLR 2025)?",
    "Can execution proceed as gossiped (toolId, score) plus score-sum consensus, then a live data.gov.in GET, instead of a central chat orchestrator (Wu et al., AutoGen, COLM 2024)?",
    "Can Kirchhoff/Physarum pruning pin live citations back into retrieval rather than only shortening the prompt (Jiang et al., LLMLingua, EMNLP 2023; Tero et al., Science 2010)?",
  ],
};

export const SATR = {
  acronym: "SATR",
  expansion: "Session-Aware Tool Retrieval",
  title: "SATR (Session-Aware Tool Retrieval)",
  formerly: "SessionRerank+",
  repo: "session-aware-toolbench-rerank",
  what:
    "SATR is Session-Aware Tool Retrieval — Objective 1 of ACRS. Given the current query q and the session history H (dialogue turns, last successful tool traces, and a co-activation cache of tools that succeeded together), SATR returns a ranked shortlist of ToolBench-schema tools. Semantic rank is fused with session priors. SATR is not a new language model. Live mandi and weather rows are not SATR’s job; they enter at MNCD. The shortlist is the input to APRR. FCNP writes surviving live citations back into the next SATR prior, so retrieval is closed-loop.",
} as const;

export const OBJECTIVES = [
  {
    id: "satr",
    code: "O1",
    repo: SATR.repo,
    title: SATR.title,
    journalDefinition:
      "To design Session-Aware Tool Retrieval: a fused ranker that, given query q, session history H, co-activation cache W_cooc, FCNP memory M, and an Agriculture catalog C, returns a truncated ToolBench-schema shortlist for APRR.",
    objective:
      "To design SATR so that tool ranking is conditioned on the current query together with session history and a co-activation cache of tools that succeeded together, and so that SATR never executes live ministry APIs.",
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
      "Fusion of a BM25/TFIDF base with category, schema, endpoint, recency, and co-activation priors.",
      "ToolRerank-style seen/unseen truncation kept, applied after session scoring.",
      "FCNP memory mixed into the next SATR prior so retrieval is closed-loop.",
    ],
    outputs: "Truncated RankedTool shortlist consumed by APRR.",
    methodology: [
      "Design method. Specify a fused session object: query + dialogue turns + last successful tool traces + co-activation counts. Rank tools with that object, not with the raw utterance alone.",
      "Ranking library. Use ToolBench / ToolLLM artefacts as a public tool-ranking library. RapidAPI-style traces are ranking evidence only and are never GET.",
      "Live Indian OGD is out of SATR’s path. Mandi and weather rows enter at MNCD. SATR must not invent or cache dummy AGMARKNET prices.",
      "Implementation path. Persist co-activation in a session store; expose a rank(query, session) API that APRR can call. Fail loud if the session schema is incomplete.",
      "Deliverable for the thesis chapter. Algorithm, schema, and the fusion rule. Comparison protocols, if any, are named later and are not this objective.",
    ],
  },
  {
    id: "aprr",
    code: "O2",
    repo: "aprr-multi-agent-routing",
    title: "Adaptive Probabilistic Routing Reinforcement (APRR)",
    journalDefinition:
      "To design training-free hop sampling over named tool-specialist agents that takes the SATR shortlist and produces a hop path and per-hop tool assignments for MNCD.",
    objective:
      "To design APRR so that routing samples a training-free path among tool-specialist agents (agriculture_analyst, schema_planner, tool_executor, mesh_critic, retrieval_specialist) rather than choosing a foundation-model SKU or following an authored SOP.",
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
      "Training-free online affinity W versus a learned controller.",
      "Hop 0 is agriculture_analyst; later hops are sampled from P(a_j|a_i,q) ∝ W_ij^α · η_ij^β · ψ_j(q)^γ.",
      "assignTools is a category gate with fallback to SATR rank 1, not a second ranker.",
      "W is updated after MNCD returns, so the next turn is not a cold start.",
    ],
    outputs: "Hop path A_t and per-hop tool assignments consumed by MNCD.",
    methodology: [
      "Design method. Maintain an affinity matrix W over named specialists. Sample the next hop from the normalised product of affinity, pairwise similarity, and query fit.",
      "Allocation rule. P(a_j | a_i, q) ∝ W_ij^α · η_ij^β · ψ_j(q)^γ. Exponents are design knobs, not fitted claims.",
      "Training-free stance. Do not train a MasRouter- or RouteLLM-style classifier as the primary method. Learned routers remain a later comparison class, not this objective.",
      "What is being routed. Specialists in the ACRS mesh — not LLM SKUs and not AutoGen conversation modes.",
      "Update rule. After MNCD returns verified or failed evidence, update W so the next turn’s path is not identical to a cold start.",
      "Deliverable for the thesis chapter. Sampling rule, agent set, assignment gate, and the delayed W update. No routing score is part of this objective.",
    ],
  },
  {
    id: "mncd",
    code: "O3",
    repo: "mncd-mesh-agents",
    title: "Mesh Network Context Diffusion (MNCD)",
    journalDefinition:
      "To design a gossip mesh whose vote object is a tool identifier, whose consensus is score-sum, and whose execution is a GET of a verified data.gov.in Agriculture UUID.",
    objective:
      "To design MNCD so that APRR agents publish (toolId, score), aggregate by score-sum rather than by chat, and execute only liveExecutable Agriculture resources on data.gov.in, failing loud when the live call cannot be completed.",
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
      "Laboratory consensus is score-sum. A Borda variant exists in the ranking-library repository and is not this objective’s default.",
      "Live Indian OGD only. Catalog-only ToolBench tools stay ranking-only; records are never invented.",
      "HTTP 5xx/429 are retried; missing key, unverified UUID, or empty live universe fail loud.",
    ],
    outputs: "Consensus tally plus live observations consumed by FCNP.",
    methodology: [
      "Design method. Specialists selected by APRR gossip partial beliefs. Aggregate with score-sum. Every live claim must cite a verified data.gov.in resource UUID.",
      "Corpus / API. Agriculture-only Open Government Data, including AGMARKNET 9ef84268-d588-465a-a308-a864a43d0070 and other UUIDs that pass verification.",
      "Fail-loud contract. HTTP 5xx/429 are retried with backoff. Missing API key, unverified UUID, or empty filtered universe hard-fail. No dummy mandi prices.",
      "Platform constraint. data.gov.in Elastic max_result_window is 10 000; limit is capped. Pagination is sequential.",
      "Related work used correctly. Guo, Woodruff & Yadav, PECAD (AAAI 2020) shows AGMARKNET as a real DSS input. MNCD does not re-implement crop-yield prediction.",
      "Deliverable for the thesis chapter. Gossip, score-sum, live gate, and the citation contract. No consensus percentage is part of this objective.",
    ],
  },
  {
    id: "fcnp",
    code: "O4",
    repo: "fcnp-context-pruning",
    title: "Flow-Coupled Network Pruning (FCNP)",
    journalDefinition:
      "To design Kirchhoff/Physarum pruning of the MNCD trace so that a residue of pinned live citations is written back into SATR as session memory.",
    objective:
      "To design FCNP so that the post-MNCD context graph is pruned by a grounded conductance update, live citations and the user query are never evicted, and the retained residue is written back as the next SATR prior.",
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
      "Laplacian solve with a grounded sink, matching the laboratory pruner.",
      "Hybrid keep / extractive-summarize / drop tiers, with pinned query and live citations.",
      "If a requested crop or state has no rows today, other live rows from the same resource are shown; nothing is invented.",
      "Closed loop: retained spans become SATR session memory. Without write-back, FCNP would be prompt compression by another name.",
    ],
    outputs: "Retained session memory M_t written into SATR at turn t+1.",
    methodology: [
      "Design method. Treat the post-MNCD mesh as a flow network. Apply a Kirchhoff / Physarum-inspired conductance update; drop low-conductance nodes; keep a residue.",
      "Write-back. The residue is written into SATR’s next fused session. That coupling is the integration hinge of Objective 4.",
      "Contrast with LLMLingua. LLMLingua shortens tokens before the LLM. FCNP prunes who remains in the mesh.",
      "Heuristic honesty. Discrete conductance is a design heuristic inspired by Tero et al. (Science, 2010), not a claim that the mesh is a Physarum organism.",
      "Safety. Pruning must not delete the last pinned live citation. Fail loud rather than silently drop ministry evidence.",
      "Deliverable for the thesis chapter. Graph construction, conductance update, pinning rule, and write-back. No compression ratio is part of this objective.",
    ],
  },
] as const;

export const INTEGRATED_METHODOLOGY = [
  "Closed-loop protocol. One user turn must traverse SATR → APRR → MNCD → FCNP in that order.",
  "Two evidence regimes. (1) ToolBench-style ranking traces for SATR. (2) Live data.gov.in Agriculture rows for MNCD. Do not mix dummy prices into (1) or RapidAPI tools into (2).",
  "Independent design switches (for later experiments, not for these objectives). Session fusion on/off; sampled hops vs a static role graph; score-sum vs majority; FCNP write-back on/off.",
  "Domain lock. Agriculture on Indian OGD for the live path. Other sectors are out of scope until a later amendment.",
  "Ethics / data. Public government catalogues only; no personal data; API keys stay in the environment, never in the thesis text.",
  "Proposal-stage claim. Architectural completeness and live-pipeline integrity. Computational scores are not objectives.",
] as const;

export const PIPELINE_EDGES = [
  { from: "User query + session", to: "SATR" },
  { from: "SATR shortlist", to: "APRR" },
  { from: "APRR hop path", to: "MNCD" },
  { from: "MNCD live observations", to: "FCNP" },
  { from: "FCNP memory", to: "SATR (next turn)" },
];
