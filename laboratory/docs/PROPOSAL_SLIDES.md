# Adaptive Context Reasoning System (ACRS)

Research proposal slides for Jenisha T (24ETRP720001), Ph.D. CSE, MSRUAS / FET.
Supervisor: Dr. Jyothi A P. Date of registration: 04 September 2024.

Required outline: Introduction, Literature Review, Summary of Literature Review, Identified Research Problem, Research Title & Aim, Research Objectives, Research Questions, Research Methodology (per objective, formulas, two worked traces), Conclusion.
Paste into the university Google Slides template in Contents order.
Do not treat older `.pptx` binaries as the source of truth.
Proposal-stage: no NDCG, latency, token, or accuracy commitments.
## 01 Adaptive Context Reasoning System (ACRS)

*Title*

A Structural Orchestration Layer for Multi-Agent LLM Ecosystems

- Presented By: Jenisha T
- (Reg. No. 24ETRP720001)
- Supervisor: Dr. Jyothi A P
- Department of Computer Science and Engineering
- Faculty of Engineering and Technology, MSRUAS

_Proposal stage. No empirical performance claims. Live Indian Open Government Data is a methodological constraint, not a result._

## 02 Research student details

*Research student details*

Attribute and Details as recorded for the FET research-proposal template.

| Attribute | Details |
| --- | --- |
| Full Name | Jenisha T |
| Registration Number | 24ETRP720001 |
| Date of Registration | 04-Sept-2024 |
| Department | Computer Science and Engineering |
| Faculty/School | FET (Faculty of Engineering and Technology) |
| Course Type | Part Time |
| Contact Address | #123, MSR Nagar, Bangalore. Phone: +91-XXXXXXXXXX |
| Email Address | jenisha.t@msruas.ac.in |
| Research Topic | Adaptive Context Reasoning System (ACRS) |
| Supervisor | Dr. Jyothi A P |

## 03 Contents

*Contents*

Nine required sections. Literature Review follows the FET Evidence 1, Evidence 2, … template. Research Methodology is expanded for each objective (O1 SATR, O2 APRR, O3 MNCD, O4 FCNP), the integrated loop, the exact repository formulas, and two worked traces (ToolBench-schema ranking; live data.gov.in). Objective order is SATR → APRR → MNCD → FCNP (not SMART).

01  Introduction
02  Literature Review
03  Summary of Literature Review
04  Identified Research Problem
05  Research Title & Aim
06  Research Objectives
07  Research Questions
08  Research Methodology
08a  Methodology — O1 SATR
08b  Methodology — O2 APRR
08c  Methodology — O3 MNCD
08d  Methodology — O4 FCNP
08e  Methodology — integrated loop
08f  Methodology — implementation formulas
08g  Methodology — ToolBench walkthrough
08h  Methodology — data.gov.in walkthrough
09  Conclusion

## 04 Introduction

*Introduction*

This proposal treats multi-agent LLM systems as a computer-science systems problem: not a new foundation model, but a missing orchestration layer between session memory, specialist routing, live tools, and context growth.

Wu et al. introduce AutoGen as a conversation-driven programming framework in which agents exchange messages until a stopping condition (ICLR 2024 LLM Agents Workshop; COLM 2024, arXiv:2308.08155). Hong et al. encode Standard Operating Procedures into MetaGPT so that a software-company metaphor produces structured artefacts (ICLR 2024). Qian et al. organise ChatDev as a chat-chain of organisational roles (ACL 2024). Li et al. study communicative agents in CAMEL (NeurIPS 2023).

Tool use is a parallel line. Qin et al. release ToolLLM / ToolBench: 16k+ REST APIs, a DFSDT planner, and ToolEval (ICLR 2024). Zheng et al. add ToolRerank over ToolLLM candidates (LREC-COLING 2024). Learned routers (RouteLLM, MasRouter, PILOT) pick models or collaboration modes. LLMLingua shortens prompts by token importance (EMNLP 2023).

Those stacks still leave four operational surfaces underspecified as one contract: session–tool fusion, a training-free specialist posterior, fail-loud live Indian Open Government Data, and a mesh prune that writes a residue back into retrieval. The next slides record that literature as Evidence 1, Evidence 2, … in the FET template.

ACRS is proposed as that missing layer. The integration order is SATR → APRR → MNCD → FCNP. The live demonstration corpus is Agriculture on data.gov.in. This deck does not claim a leaderboard number.

## 05 Literature Review

*Literature Review*

FET template. Each paper is one Evidence block: Author(s), Year, Title, Publication, Objective, Methodology, Findings, Limitations.

**Evidence 1**

- Author(s): Wu, Q., Bansal, G., Zhang, J., Wu, Y., Li, B., Zhu, E., Jiang, L., Zhang, X., Zhang, S., Liu, J., Awadallah, A. H., White, R. W., Burger, D., and Wang, C.
- Year: 2024
- Title: AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversations
- Publication: Conference on Language Modeling (COLM) 2024; ICLR 2024 Workshop on LLM Agents (Best Paper). arXiv:2308.08155
- Objective: Program LLM applications by composing multiple conversable agents.
- Methodology: Agents exchange natural-language messages until a stopping condition; modes mix LLMs, humans, and tools.
- Findings: Conversation is a working programming model for multi-agent LLM applications.
- Limitations: The unit of coordination is a chat message, not a live (toolId, score, citation) on Indian Open Government Data.

**Evidence 2**

- Author(s): Hong, S., Zhuge, M., Chen, J., Zheng, X., Cheng, Y., Wang, J., Zhang, C., Wang, Z., Yau, S. K. S., Lin, Z., Zhou, L., Ran, C., Xiao, L., Wu, C., and Schmidhuber, J.
- Year: 2024
- Title: MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework
- Publication: ICLR 2024
- Objective: Reduce role drift in multi-agent software workflows by encoding human SOPs.
- Methodology: Standard Operating Procedures are written into prompt sequences; an assembly-line assigns roles.
- Findings: Authored SOPs produce more coherent software artefacts than unconstrained chat agents.
- Limitations: Who speaks next is designed in advance. The graph is not updated from session-local affinity after a live tool call.

## 06 Literature Review — Evidence 3 & Evidence 4

*Literature Review*

Continuation. Evidence 3 & Evidence 4 in the same Evidence template.

**Evidence 3**

- Author(s): Qian, C., Liu, W., Liu, H., Chen, N., Dang, Y., Li, J., Yang, C., Chen, W., Su, Y., Cong, X., Xu, J., Li, D., Liu, Z., and Sun, M.
- Year: 2024
- Title: ChatDev: Communicative Agents for Software Development
- Publication: ACL 2024 (long), pages 15174–15186. doi:10.18653/v1/2024.acl-long.810
- Objective: Organise specialised LLM agents as a chat-chain for software design, coding, and testing.
- Methodology: Chat chain (what to communicate) plus communicative dehallucination (how to communicate).
- Findings: Natural-language design talk and code-level debug talk can be unified in one multi-agent loop.
- Limitations: The environment is a codebase, not a ministry API with a fail-loud live GET.

**Evidence 4**

- Author(s): Li, G., Hammoud, H. A. A. K., Itani, H., Khizbullin, D., and Ghanem, B.
- Year: 2023
- Title: CAMEL: Communicative Agents for “Mind” Exploration of Large Language Model Society
- Publication: NeurIPS 2023
- Objective: Enable autonomous cooperation among communicative agents with minimal human steering.
- Methodology: Role-playing with inception prompting to keep agents on a human-specified task.
- Findings: Inception prompting yields scalable multi-agent conversational data and cooperative behaviour.
- Limitations: No first-class vote over tool identifiers backed by Open Government Data.

## 07 Literature Review — Evidence 5 & Evidence 6

*Literature Review*

Continuation. Evidence 5 & Evidence 6 in the same Evidence template.

**Evidence 5**

- Author(s): Qin, Y., Liang, S., Ye, Y., Zhu, K., Yan, L., Lu, Y., Lin, Y., Cong, X., Tang, X., Qian, B., Zhao, S., Hong, L., Tian, R., Xie, R., Zhou, J., Gerstein, M., Li, D., Liu, Z., and Sun, M.
- Year: 2024
- Title: ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs
- Publication: ICLR 2024
- Objective: Give open LLMs general tool-use over a large real-world API catalogue.
- Methodology: ToolBench: 16,464 RapidAPI REST endpoints; SBERT retriever; DFSDT planner; ToolEval protocol.
- Findings: A public ranking library and planner exist for large-scale tool use.
- Limitations: Retrieval is turn-amnesic. RapidAPI keys are not redistributable, so this lab cannot execute ToolBench endpoints live.

**Evidence 6**

- Author(s): Zheng, Y., Li, P., Liu, W., Liu, Y., Luan, J., and Wang, B.
- Year: 2024
- Title: ToolRerank: Adaptive and Hierarchy-Aware Reranking for Tool Retrieval
- Publication: LREC-COLING 2024, pages 16263–16273. ACL Anthology 2024.lrec-main.1413
- Objective: Refine ToolLLM-style retrieval for seen versus unseen APIs and for tool-library hierarchy.
- Methodology: Adaptive truncation of seen/unseen APIs plus hierarchy-aware concentration or diversity.
- Findings: Reranking the SBERT shortlist improves downstream tool execution quality.
- Limitations: Still query-only. Session co-activation and later write-back from a pruned mesh are unused.

## 08 Literature Review — Evidence 7 & Evidence 8

*Literature Review*

Continuation. Evidence 7 & Evidence 8 in the same Evidence template.

**Evidence 7**

- Author(s): Ong, I., Almahairi, A., Wu, V., Chiang, W.-L., Wu, T., Gonzalez, J. E., Kadous, M. W., and Stoica, I.
- Year: 2025
- Title: RouteLLM: Learning to Route LLMs from Preference Data
- Publication: ICLR 2025. arXiv:2406.18665
- Objective: Route each query between a stronger and a weaker LLM from human preference data.
- Methodology: Trained router plus data augmentation; deployed as a frozen policy at inference.
- Findings: Preference-trained routers can cut cost while holding response quality on public benchmarks.
- Limitations: The object of routing is an LLM SKU, not a named Indian-OGD specialist with a training-free posterior.

**Evidence 8**

- Author(s): Yue, Y., Zhang, G., Liu, B., Wan, G., Wang, K., Cheng, D., and Qi, Y.
- Year: 2025
- Title: MasRouter: Learning to Route LLMs for Multi-Agent Systems
- Publication: ACL 2025 (long), pages 15549–15572. doi:10.18653/v1/2025.acl-long.757
- Objective: Unify collaboration mode, role allocation, and LLM choice as one MAS routing problem.
- Methodology: Cascaded neural controller trained over multi-agent topologies.
- Findings: A learned controller can assemble a cheaper MAS than a static multi-agent template.
- Limitations: Requires training. It does not maintain a Dirichlet–Thompson matrix over mandi / crop / rainfall specialists.

## 09 Literature Review — Evidence 9 & Evidence 10

*Literature Review*

Continuation. Evidence 9 & Evidence 10 in the same Evidence template.

**Evidence 9**

- Author(s): Panda, P., Magazine, R., Devaguptapu, C., Takemori, S., and Sharma, V.
- Year: 2025
- Title: Adaptive LLM Routing under Budget Constraints
- Publication: Findings of the Association for Computational Linguistics: EMNLP 2025, pages 23934–23949. doi:10.18653/v1/2025.findings-emnlp.1301. Method name: PILOT (Preference-prior Informed LinUCB).
- Objective: Treat LLM routing as a contextual bandit under a user budget.
- Methodology: Preference-prior LinUCB in a shared query–LLM embedding space, plus an online cost policy.
- Findings: Bandit routing can adapt without exhaustive inference of every LLM on every query.
- Limitations: Routes foundation-model SKUs under a dollar budget, not tool-specialist agents after a live data.gov.in GET.

**Evidence 10**

- Author(s): Jiang, H., Wu, Q., Lin, C.-Y., Yang, Y., and Qiu, L.
- Year: 2023
- Title: LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models
- Publication: EMNLP 2023, pages 13358–13376. doi:10.18653/v1/2023.emnlp-main.825
- Objective: Shorten long prompts while keeping task performance.
- Methodology: Budget controller plus token-level iterative compression aligned to the target LLM.
- Findings: Token-importance compression can reduce prompt length with limited quality loss.
- Limitations: Deletes tokens before the LLM. It does not prune a mesh by conductance or write live citations back into retrieval.

## 10 Literature Review — Evidence 11 & Evidence 12

*Literature Review*

Continuation. Evidence 11 & Evidence 12 in the same Evidence template.

**Evidence 11**

- Author(s): Park, J. S., O’Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., and Bernstein, M. S.
- Year: 2023
- Title: Generative Agents: Interactive Simulacra of Human Behavior
- Publication: UIST 2023 (Best Paper). doi:10.1145/3586183.3606763
- Objective: Give LLM agents a long-term memory stream for believable behaviour in a sandbox.
- Methodology: Natural-language memory, reflection, and retrieval (recency, relevance, importance) inside a Sims-like town.
- Findings: A memory stream supports individual plans and emergent social coordination among agents.
- Limitations: Memory lives in a sandbox simulation. It is not written back into a tool retriever over ministry APIs.

**Evidence 12**

- Author(s): Tero, A., Takagi, S., Saigusa, T., Ito, K., Bebber, D. P., Fricker, M. D., Yumiki, K., Kobayashi, R., and Nakagaki, T.
- Year: 2010
- Title: Rules for Biologically Inspired Adaptive Network Design
- Publication: Science 327(5964):439–442. doi:10.1126/science.1177894
- Objective: Capture how Physarum polycephalum grows efficient, fault-tolerant transport networks.
- Methodology: Feedback between tube conductance and protoplasmic flux; compared with the Tokyo rail system.
- Findings: A local conductance update can yield globally efficient adaptive networks without a central planner.
- Limitations: A biological transport model, not an LLM context pruner. ACRS uses it as a design heuristic, not as a claim that the mesh is an organism.

## 11 Literature Review — Evidence 13 & Evidence 14

*Literature Review*

Continuation. Evidence 13 & Evidence 14 in the same Evidence template.

**Evidence 13**

- Author(s): Guo, H., Woodruff, A., and Yadav, A.
- Year: 2020
- Title: Improving Lives of Indebted Farmers Using Deep Learning: Predicting Agricultural Produce Prices Using Convolutional Neural Networks (PECAD)
- Publication: AAAI 2020. doi:10.1609/aaai.v34i08.7039
- Objective: Use AGMARKNET price series as decision-support input for indebted farmers.
- Methodology: Convolutional networks over scraped agricultural produce prices.
- Findings: AGMARKNET is a real Indian decision-support corpus, not a toy table.
- Limitations: A crop-price CNN is not a multi-agent live-OGD loop. Cited as domain precedent, not as a baseline to beat.

**Evidence 14**

- Author(s): Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., and Cao, Y.
- Year: 2023
- Title: ReAct: Synergizing Reasoning and Acting in Language Models
- Publication: ICLR 2023
- Objective: Interleave reasoning traces with actions so a language model can use tools.
- Methodology: Thought–action–observation cycles on the already-chosen tool set.
- Findings: Reasoning-and-acting beats reason-only or act-only prompting on several agent tasks.
- Limitations: Assumes the tool set is already determined. It does not fuse session co-activation into the next rank, nor cite a live data.gov.in UUID.

## 12 Summary of Literature Review

*Summary of Literature Review*

Qualitative map only. This table names the gap each family leaves for ACRS; it does not claim a percentage improvement over any baseline.

| Literature family | What it already does | What ACRS still has to add |
| --- | --- | --- |
| MAS frameworks (AutoGen, MetaGPT, ChatDev, CAMEL) | Conversation, SOPs, software roles, inception prompting | A closed session–route–mesh–prune contract, not another chat runtime |
| Tool learning (ToolLLM / ToolBench / ToolRerank) | Large-scale tool-use corpus and ToolEval-style ranking protocol | Session-fused ranking plus live Indian OGD execution (not RapidAPI replay) |
| Learned routers (RouteLLM, MasRouter, PILOT) | Train or bandit-route over model SKUs or collaboration modes | Training-free Dirichlet–Thompson posterior over named specialists |
| Prompt compression (LLMLingua) | Shorten tokens before the LLM | Prune a mesh by conductance and write the residue back into SATR |
| Indian agriculture DSS (PECAD) | Shows AGMARKNET as a real decision-support input | Live, fail-loud OGD inside a multi-agent loop — not a crop-yield model to beat |

## 13 Identified Research Problem

*Identified Research Problem*

Five architectural gaps. Four named objectives. One integration contract. Closing a gap is evidenced by a runnable loop and citable equations, not by a promised leaderboard number.

- G1 — Turn-amnesic retrieval. ToolLLM SBERT (Qin et al., ICLR 2024) and ToolRerank (Zheng et al., LREC-COLING 2024) score each query independently. Session co-activation is unused. → Objective 1 SATR.
- G2 — Routers pick models or authored SOPs, not tool-specialist agents with a training-free posterior. RouteLLM / PILOT / MasRouter / MetaGPT. → Objective 2 APRR.
- G3 — MAS communication is star, SOP, or chat. No mesh vote whose object is a live tool identifier. AutoGen, MetaGPT, ChatDev, CAMEL. → Objective 3 MNCD.
- G4 — Prompt compressors (LLMLingua, EMNLP 2023) do not write live citations back into retrieval. → Objective 4 FCNP.
- G5 — No closed four-stage contract executed on journal-publishable Indian OGD (data.gov.in / AGMARKNET / IMD / DES), with ToolBench used only as a ranking library. → Integrated ACRS.

_Gaps are architectural. This deck does not convert them into NDCG, latency, or accuracy targets._

## 14 Research Title & Aim

*Research Title & Aim*

Adaptive Context Reasoning System (ACRS): A Structural Orchestration Layer for Multi-Agent LLM Ecosystems

- Aim. Design, implement, and critically evaluate ACRS — a structural orchestration layer in which session-aware tool retrieval (SATR), training-free specialist routing (APRR), mesh consensus over tool identifiers (MNCD), and flow-coupled context pruning with write-back (FCNP) form a closed loop on live Indian Open Government Data. The proposal-stage claim is architectural completeness and live-pipeline integrity, not a leaderboard number.
- Scope of the title. Adaptive = session-conditioned ranking and routing. Context = fused session memory plus mesh residue. Reasoning = specialist posterior plus score-sum consensus. System = four named modules on one contract.
- What the title is not. It is not a new LLM, not a crop-yield model, and not a claim that ACRS already outperforms ToolLLM, MasRouter, or LLMLingua on a published leaderboard.
- Domain lock for the live loop. Agriculture on data.gov.in (AGMARKNET and related verified UUIDs). Other sectors stay out of the inference path in this proposal.
- Integration order that the aim implies. SATR (memory) → APRR (who acts) → MNCD (live evidence) → FCNP (prune and write back).

## 15 Research Objectives

*Research Objectives*

Four named modules. Each row is a thesis-sized design claim. Metric targets are deferred until a protocol is frozen.

| ID | Objective | What will be designed |
| --- | --- | --- |
| O1 | SessionRerank+ (SATR) | The retrieval chapter of the thesis: given query q and session history H, return a ranked list of ToolBench-schema tools fused with a co-activation cache. The unit of publication is the fusion rule, not an NDCG target. |
| O2 | Adaptive Probabilistic Routing Reinforcement (APRR) | The routing chapter: a training-free posterior over tool-specialist agents, updated from SATR scores and from live MNCD observations. The unit of publication is the Bayesian controller, not a Pareto chart. |
| O3 | Mesh Network Context Diffusion (MNCD) | The consensus-and-execution chapter: gossip (toolId, score), score-sum consensus, live data.gov.in GET on verified UUIDs. The unit of publication is the protocol plus the citation contract. |
| O4 | Flow-Coupled Network Pruning (FCNP) | The memory chapter: Kirchhoff/Physarum conductances prune the mesh trace and write surviving live citations back into SATR. The unit of publication is the coupling, not a token-percentage. |

## 16 Objective 1 — SATR

*Research Objectives*

The retrieval chapter of the thesis: given query q and session history H, return a ranked list of ToolBench-schema tools fused with a co-activation cache. The unit of publication is the fusion rule, not an NDCG target.

SOTA. Qin et al., ToolLLM / ToolBench (ICLR 2024): Sentence-BERT API retriever over 16,464 RapidAPI tools, then ToolLLaMA + DFSDT. Zheng et al., ToolRerank (LREC-COLING 2024): adaptive truncation of seen vs unseen APIs and hierarchy-aware concentration/diversity. Pipeline: instruction → SBERT retrieve top-k APIs → (optional ToolRerank truncate/rerank) → LLM DFSDT/ReAct planner

Gap. SOTA retrievers are turn-amnesic. They do not maintain a success-conditioned co-activation graph or ingest pruned memory from later stages.

Novelty. Session co-activation cache as a first-class prior over tool pairs. Convex fusion of semantic and session scores; λ may grow with session length. ToolRerank-style seen/unseen truncation kept, then applied after session scoring. FCNP memory mixed into the next SATR prior so retrieval is closed-loop.

Diagram: compare-satr (see /architecture in the laboratory).

_Repository: github.com/joyjeni/session-aware-toolbench-rerank_

## 17 Objective 2 — APRR

*Research Objectives*

The routing chapter: a training-free posterior over tool-specialist agents, updated from SATR scores and from live MNCD observations. The unit of publication is the Bayesian controller, not a Pareto chart.

SOTA. Yue et al., MasRouter (ACL 2025, doi:10.18653/v1/2025.acl-long.757): trained neural controller over multi-agent topologies. Ong et al., RouteLLM (ICLR 2025, arXiv:2406.18665): routers among LLMs. Panda et al., Adaptive LLM Routing under Budget Constraints (PILOT; Findings of EMNLP 2025, doi:10.18653/v1/2025.findings-emnlp.1301): preference-prior LinUCB for budget-constrained LLM routing. Hong et al., MetaGPT (ICLR 2024): authored SOP workflows. Pipeline: query → trained controller or difficulty model → choose one LLM/agent → execute

Gap. SOTA either trains a neural router, picks a model, or follows an authored SOP. It does not maintain a training-free affinity matrix over Indian OGD tool families.

Novelty. Training-free online W versus MasRouter's learned controller. Implemented update is κ·reward·1/L²·1/lat_norm with negative reward on failure. CTGR and FTDR remain in the GitHub repo; this lab runs core APRR hops. W is session state, so routing can adapt across farmer turns.

Diagram: compare-aprr (see /architecture in the laboratory).

_Repository: github.com/joyjeni/aprr-multi-agent-routing_

## 18 Objective 3 — MNCD

*Research Objectives*

The consensus-and-execution chapter: gossip (toolId, score), score-sum consensus, live data.gov.in GET on verified UUIDs. The unit of publication is the protocol plus the citation contract.

SOTA. Wu et al., AutoGen (COLM 2024; ICLR 2024 LLM Agents Workshop Best Paper, arXiv:2308.08155): multi-agent conversation. Hong et al., MetaGPT (ICLR 2024): SOP pipeline. Qian et al., ChatDev (ACL 2024): organisational chat-chain. Li et al., CAMEL (NeurIPS 2023): communicative role-playing agents. Pipeline: manager LLM → sequential or star-topology agent messages → tool calls

Gap. Star and chat topologies coordinate over natural-language messages. They do not vote over tool identifiers backed by a ministry API.

Novelty. First-class vote object is a tool ID, not a chat utterance. consensus_pick is score-sum; consensus_pick_borda is a non-default variant. Live Indian OGD only. Catalog-only tools stay ranking-only; prices are never invented. HTTP 5xx/429 are retried; empty filters show other live rows from the same resource.

Diagram: compare-mncd (see /architecture in the laboratory).

_Repository: github.com/joyjeni/mncd-mesh-agents_

## 19 Objective 4 — FCNP

*Research Objectives*

The memory chapter: Kirchhoff/Physarum conductances prune the mesh trace and write surviving live citations back into SATR. The unit of publication is the coupling, not a token-percentage.

SOTA. Jiang et al., LLMLingua (EMNLP 2023): token-level prompt compression. Tero et al., Science 2010 (doi:10.1126/science.1177894): Physarum adaptive network. Park et al., Generative Agents (UIST 2023): language memory stream in a sandbox. Pipeline: long prompt → compressor → LLM. Memory is not written back into a tool retriever.

Gap. Token compressors are not current-reinforced over a context graph and do not pin live government citations into the next retrieval turn.

Novelty. Laplacian solve with grounded sink, matching the published Python pruner. Hybrid tiering and persistent high-flow citations. If a requested crop/state has no AGMARKNET rows today, other live rows are shown; nothing is invented. Closed loop: retained spans become SATR session memory.

Diagram: compare-fcnp (see /architecture in the laboratory).

_Repository: github.com/joyjeni/fcnp-context-pruning_

## 20 Research Questions

*Research Questions*

Each question is paired with one objective. Answers will be empirical after a protocol is frozen; this slide does not pre-commit scores.

- RQ1. Can tool retrieval be conditioned on a co-activation cache and session memory rather than a single query embedding (Qin et al., ToolLLM, ICLR 2024; Zheng et al., ToolRerank, LREC-COLING 2024)?  →  addressed by O1 (SessionRerank+ (SATR)).
- RQ2. Can routing sample a training-free posterior over tool-specialist agents instead of a trained neural controller or an authored SOP (Yue et al., MasRouter, ACL 2025; Hong et al., MetaGPT, ICLR 2024; Ong et al., RouteLLM, ICLR 2025)?  →  addressed by O2 (Adaptive Probabilistic Routing Reinforcement (APRR)).
- RQ3. Can execution proceed as gossiped (toolId, score) plus score-sum consensus, then a live data.gov.in GET, instead of a central chat orchestrator (Wu et al., AutoGen, COLM 2024)?  →  addressed by O3 (Mesh Network Context Diffusion (MNCD)).
- RQ4. Can Kirchhoff/Physarum pruning pin live citations back into retrieval rather than only shortening the prompt (Jiang et al., LLMLingua, EMNLP 2023; Tero et al., Science 2010)?  →  addressed by O4 (Flow-Coupled Network Pruning (FCNP)).

## 21 Research Methodology

*Research Methodology*

One methodology per objective, then one integrated protocol. Proposal-stage: design the loop and freeze the protocol; do not pre-commit a leaderboard.

- O1 SATR — fused session ranking against a ToolBench-style library. Live mandi rows are not SATR’s job.
- O2 APRR — training-free Dirichlet–Thompson posterior over named specialists. Learned routers are a future bake-off, not the implementation.
- O3 MNCD — gossip + score-sum consensus, then live data.gov.in GET on verified Agriculture UUIDs. Fail loud. No dummy prices.
- O4 FCNP — Kirchhoff / Physarum-inspired conductance prune with write-back into SATR. Not LLMLingua token deletion.
- Integrated contract. SATR → APRR → MNCD → FCNP must run in that order on one user turn. Skipping MNCD or FCNP is an incomplete run.
- Implementation. The four modules are the functions in satr.ts, aprr.ts, mncd.ts, fcnp.ts — formulas on the next slides, full traces on /walkthrough.
- What will not appear in this proposal. Promised retrieval scores, latency targets, consensus percentages, or token-reduction ratios.

Diagram: e2e (see /architecture in the laboratory).

## 22 Research Methodology — O1 SATR

*Research Methodology*

How session-aware ranking will be designed and later evaluated.

- Design method. Specify a fused session object: query + dialogue turns + last tool traces + co-activation counts. Rank tools with that object, not with the raw utterance alone.
- Ranking library (not live prices). Use ToolBench / ToolLLM artefacts as a public tool-ranking library and protocol family. RapidAPI-style traces are ranking evidence only.
- Live Indian OGD is out of SATR’s ranking path. Mandi and weather rows enter at MNCD. SATR must not invent or cache dummy AGMARKNET prices.
- Implementation path. Persist co-activation in a session store; expose a rank(query, session) API that APRR can call. Fail loud if the session schema is incomplete.
- Future evaluation protocol (not a result). When the protocol is frozen, compare session-fused ranking against query-only ranking on the same ToolBench-style split. Report the protocol, not a pre-committed score.
- Deliverable for the thesis chapter. Algorithm, schema, and ablation plan (with vs without tool-trace fusion).

## 23 Research Methodology — O2 APRR

*Research Methodology*

How the specialist posterior will be designed. No win-rate or millisecond target is claimed at proposal stage.

- Design method. Maintain a Dirichlet–Thompson posterior over named specialists. Sample or take the MAP specialist given SATR’s fused session.
- Allocation rule (proposal form). P(agent | context) ∝ W^α · η^β · ψ^γ, with W = session-matched specialist weight, η = reliability, ψ = cost/risk. Exponents are design knobs, not fitted claims.
- Training-free stance. Do not train a MasRouter- or RouteLLM-style classifier as the primary method. Learned routers remain a future bake-off class, not the implementation.
- What is being routed. Specialists in the ACRS mesh — not LLM SKUs (GPT-4 vs Mixtral) and not AutoGen conversation modes as the object of routing.
- Update rule. After MNCD returns verified or failed evidence, update η (and optionally W) so the next turn’s posterior is not identical to a cold start.
- Future evaluation protocol (not a result). Log specialist choice vs task type on held-out session traces; compare against a static role graph. No pre-committed accuracy.

## 24 Research Methodology — O3 MNCD

*Research Methodology*

How live Indian OGD and score-sum consensus will be executed. PECAD is a domain precedent, not a baseline to beat.

- Design method. Specialists selected by APRR gossip partial beliefs. Aggregate with score-sum (not Borda). Every live claim must cite a verified data.gov.in resource UUID.
- Corpus / API. Agriculture-only Open Government Data: AGMARKNET (9ef84268-d588-465a-a308-a864a43d0070) and other UUIDs that pass verification.
- Fail-loud contract. HTTP 5xx/429 are retried with backoff; missing API key, unverified UUID, or empty filtered universe hard-fail. No dummy mandi prices.
- Platform constraint. data.gov.in Elastic max_result_window is 10 000; limit is capped. Pagination is sequential, not a fabricated parallel harvest.
- Related work used correctly. Guo, Woodruff & Yadav, PECAD (AAAI 2020) shows AGMARKNET as a real DSS input. MNCD does not re-implement crop-yield prediction.
- Future evaluation protocol (not a result). Measure citation completeness, fail-loud rate on injected faults, and qualitative agreement of score-sum vs majority vote.

## 25 Research Methodology — O4 FCNP

*Research Methodology*

How mesh pruning will be designed. No token-reduction ratio is claimed at proposal stage.

- Design method. Treat the post-MNCD mesh as a flow network. Apply a Kirchhoff / Physarum-inspired conductance update; drop low-conductance specialist edges; keep a residue.
- Write-back (the integration hinge). The residue is written into SATR’s next fused session. Without write-back, FCNP would be prompt compression by another name.
- Contrast with LLMLingua. LLMLingua shortens tokens before the LLM. FCNP prunes who remains in the mesh. Tokenisers are not the primary artefact.
- Heuristic honesty. Discrete conductance is a design heuristic inspired by Tero et al. (Science, 2010), not a proof that the mesh is a Physarum organism.
- Safety. Pruning must not delete the last live-data specialist if MNCD still has an open verified query. Fail loud rather than silently drop evidence.
- Future evaluation protocol (not a result). Compare mesh size and downstream SATR rank stability with vs without pruning on the same session traces.

## 26 Research Methodology — integrated loop

*Research Methodology*

Closed contract SATR → APRR → MNCD → FCNP → SATR. The novelty is the loop and the data contract, not a claimed accuracy.

- Closed-loop protocol. One user turn must traverse all four modules in order. Skipping MNCD (no live UUID) or FCNP (no write-back) is treated as an incomplete run, not a successful demo.
- Two evidence regimes. (1) ToolBench-style ranking traces for SATR. (2) Live data.gov.in Agriculture rows for MNCD. Do not mix dummy prices into (1) or RapidAPI tools into (2).
- Independent variables (future experiments). Session fusion on/off; Dirichlet routing vs static roles; score-sum vs majority; FCNP write-back on/off.
- Dependent measures (to be frozen later). Citation completeness, fail-loud correctness, rank stability across turns, qualitative specialist-choice logs.
- Domain lock. Agriculture on Indian OGD for the live path. Other sectors are out of scope until a later amendment.
- Ethics / data. Public government catalogues only; no personal data; API keys stay in the environment, never in the thesis text.

Diagram: integrated (see /architecture in the laboratory).

_Master repository: github.com/joyjeni/phd-agentic-ai-master_

## 27 Research Methodology — implementation formulas

*Research Methodology*

How the proposal will be implemented: the equations copied from the laboratory, not a promised leaderboard. Constants are the repository defaults.

| Module | Formula as coded | Constants |
| --- | --- | --- |
| O1 SATR | s(a|q,H)=w_base s_base + w_cat cat + w_sch sch + w_ept ept + w_cooc Σ γ^{n-i} log(1+w_{h_i,a}) + w_rec rec − 0.35 fails;  s_base=0.7 BM25+0.3 TFIDF-cos+0.08 mem-cos | w=(1, 0.45, 0.25, 0.3, 0.35, 0.25); γ=0.7; ρ=0.02; δ=1; decay=0.85; BM25 k1=1.5 b=0.75 |
| O2 APRR | P(a_j|a_i,q) ∝ W_ij^α η_ij^β ψ_j(q)^γ ;  W←(1-λ)W + κ·reward·1/L²·1/lat | α=2, β=1, γ=2.5, λ=0.005, κ=5, W0=0.1, ε=0 (lab), maxHops=4; reward +1 / −0.05 |
| O3 MNCD | s=0.45 score/(|score|+2)+0.35 overlap+liveBoost−0.05 idx;  tally=Σ w_a s_a;  w=success/(1+lat/1000) | liveBoost 0.25+0.20 preferred; fanout=3; R=2; τ=0.55; score-sum not Borda; live UUID only |
| O4 FCNP | D_ij(t+1)=(1-μ)D_ij+α|Q_ij|^γ ;  L p = I ;  Q=|D(p_i-p_j)|;  keep 35% / summarize 20% / drop | μ=0.1, α=0.5, γ=1.2, sim≥0.12; pinned live citations never evicted; memory→SATR |

_Source: lib/research/satr.ts, aprr.ts, mncd.ts, fcnp.ts. Full walkthrough: /walkthrough._

## 28 Research Methodology — ToolBench walkthrough

*Research Methodology*

One ToolBench-schema datum, processed by all four objectives. RapidAPI is never GET. Numbers are a 07 September 2026 lab trace, not a metric claim.

- Intake. Bundled G1 jsonl qid=6491 is a RapidAPI aircraft query (gold docs 4308–4317). Off-sector flights are stripped. The ranking-library analogue walked here is tb.agri.soil_health with q = “What is the soil pH and recommended fertilizer dose for a farm village?”
- O1 SATR. Cold start so s=z(s_base). tb.agri.soil_health s_base=18.08 → s=5.40 (rank 1, ranking-only). karnataka::shc_karnataka s=1.40. datagov.fertilizer s=0.60 (live, rank 4).
- O2 APRR. Path agriculture_analyst → schema_planner (p=0.73) → retrieval_specialist (p=0.95). Non-Agriculture specialists fall back to SATR #1 = soil_health.
- O3 MNCD. Agent score s=0.45 score/(|score|+2)+0.35 overlap. soil_health 0.5995; tally=3·0.7407·0.5995=1.332. Not liveExecutable. preferredLiveToolId matches fertilizer → GET UUID 2e0e6c04-97f2-456b-9309-bf605650cb11 (44 live subsidy rows, e.g. 2002-03 Indigenous Urea 7790 Rs crore).
- O4 FCNP. 10 spans → keep 6 / drop 4; pin query + live fertilizer observation + citation. Memory written back to SATR.

_ToolBench = ranking library. Live evidence is always a verified data.gov.in Agriculture UUID._

## 29 Research Methodology — data.gov.in walkthrough

*Research Methodology*

The same four objectives on live AGMARKNET. Query: “What is the current mandi price of wheat in Punjab?” Fail-loud: no invented Punjab-wheat modal.

- Intake. extractToolArguments → state=Punjab, commodity=Wheat. preferredLiveToolId → datagov.mandi_prices (UUID 9ef84268-d588-465a-a308-a864a43d0070). Limit capped at 10 000.
- O1 SATR. karnataka::agmarknet_ka s=3.73 (rank 1, same UUID); datagov.mandi_prices s=3.05 (rank 2, preferred); datagov.msp s=2.31 (ranking-only).
- O2 APRR. Path agriculture_analyst → schema_planner (p=0.54) → tool_executor (p=0.66, terminal stop). Hop 0: Karnataka mandi, national mandi, MSP. Hop 2 live leftover: crop_production.
- O3 MNCD. mandi_prices agent-score 0.787 (liveBoost 0.45); karnataka 0.7789. Score-sum winner karnataka::agmarknet_ka tally=1.154. Live GET: 10 000 arrivals; 0 Wheat in Punjab today; 479 other live Punjab rows; Wheat in 133 live rows from MP, Rajasthan, UP, Gujarat, Maharashtra, West Bengal, Chhattisgarh. Shown mean modal Rs 2593/quintal (e.g. Bhindi, Dera Baba Nanak APMC, Rs 828, 07/09/2026).
- O4 FCNP. 10 spans → keep 7; pin the AGMARKNET citation. W ← (1-λ)W + κ·1/L²/lat on the hop path. Next SATR is session-conditioned.

_Lab trace 07 September 2026. Re-run on /walkthrough; rows change daily. No dummy prices._

## 30 Conclusion

*Conclusion*

ACRS is proposed as a structural orchestration layer. The contribution is the closed loop and the four named gaps — not a pre-committed leaderboard.

- The literature (AutoGen, MetaGPT, ChatDev, CAMEL, ToolLLM, MasRouter, RouteLLM, PILOT, LLMLingua, PECAD) establishes conversation, tools, learned routing, and prompt compression. It does not establish SATR → APRR → MNCD → FCNP as one contract over live Indian OGD.
- The identified problem is five gaps: G1 session–tool fusion, G2 training-free specialist posterior, G3 live fail-loud Indian OGD, G4 conductance prune with write-back, G5 missing integration layer.
- The aim is to design that layer. Four objectives (SATR, APRR, MNCD, FCNP) and four research questions map onto it.
- Methodology is specified per objective: ToolBench as ranking library; Dirichlet–Thompson routing; verified data.gov.in UUIDs with score-sum; Physarum-inspired prune with SATR write-back. Metric numbers are deferred.
- Next step after approval. Freeze evaluation protocols, implement the closed loop, and report whatever the measurements show — including negative results.

## 31 References (1/3) — multi-agent systems and tool learning

*References 1/3*

- Wu, Q., Bansal, G., Zhang, J., Wu, Y., Li, B., Zhu, E., Jiang, L., Zhang, X., Zhang, S., Liu, J., Awadallah, A. H., White, R. W., Burger, D., and Wang, C. AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversations. Conference on Language Modeling (COLM) 2024. Also ICLR 2024 Workshop on Large Language Model (LLM) Agents (Best Paper). arXiv:2308.08155.
- Hong, S., Zhuge, M., Chen, J., Zheng, X., Cheng, Y., Wang, J., Zhang, C., Wang, Z., Yau, S. K. S., Lin, Z., Zhou, L., Ran, C., Xiao, L., Wu, C., and Schmidhuber, J. MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework. ICLR 2024.
- Li, G., Hammoud, H. A. A. K., Itani, H., Khizbullin, D., and Ghanem, B. CAMEL: Communicative Agents for “Mind” Exploration of Large Language Model Society. NeurIPS 2023.
- Qian, C., Liu, W., Liu, H., Chen, N., Dang, Y., Li, J., Yang, C., Chen, W., Su, Y., Cong, X., Xu, J., Li, D., Liu, Z., and Sun, M. ChatDev: Communicative Agents for Software Development. ACL 2024 (long), pages 15174–15186. doi:10.18653/v1/2024.acl-long.810.
- Qin, Y., Liang, S., Ye, Y., Zhu, K., Yan, L., Lu, Y., Lin, Y., Cong, X., Tang, X., Qian, B., Zhao, S., Hong, L., Tian, R., Xie, R., Zhou, J., Gerstein, M., Li, D., Liu, Z., and Sun, M. ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs. ICLR 2024.
- Zheng, Y., Li, P., Liu, W., Liu, Y., Luan, J., and Wang, B. ToolRerank: Adaptive and Hierarchy-Aware Reranking for Tool Retrieval. LREC-COLING 2024, pages 16263–16273. ACL Anthology 2024.lrec-main.1413.

## 32 References (2/3) — routing, compression, reasoning, biology

*References 2/3*

- Ong, I., Almahairi, A., Wu, V., Chiang, W.-L., Wu, T., Gonzalez, J. E., Kadous, M. W., and Stoica, I. RouteLLM: Learning to Route LLMs from Preference Data. ICLR 2025. arXiv:2406.18665.
- Panda, P., Magazine, R., Devaguptapu, C., Takemori, S., and Sharma, V. Adaptive LLM Routing under Budget Constraints. Findings of the Association for Computational Linguistics: EMNLP 2025, pages 23934–23949. doi:10.18653/v1/2025.findings-emnlp.1301.
- Yue, Y., Zhang, G., Liu, B., Wan, G., Wang, K., Cheng, D., and Qi, Y. MasRouter: Learning to Route LLMs for Multi-Agent Systems. ACL 2025 (long), pages 15549–15572. doi:10.18653/v1/2025.acl-long.757.
- Jiang, H., Wu, Q., Lin, C.-Y., Yang, Y., and Qiu, L. LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models. EMNLP 2023, pages 13358–13376. doi:10.18653/v1/2023.emnlp-main.825.
- Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., Chi, E., Le, Q., and Zhou, D. Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. NeurIPS 2022.
- Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., and Cao, Y. ReAct: Synergizing Reasoning and Acting in Language Models. ICLR 2023.
- Yao, S., Yu, D., Zhao, J., Shafran, I., Griffiths, T. L., Cao, Y., and Narasimhan, K. Tree of Thoughts: Deliberate Problem Solving with Large Language Models. NeurIPS 2023.
- Tero, A., Takagi, S., Saigusa, T., Ito, K., Bebber, D. P., Fricker, M. D., Yumiki, K., Kobayashi, R., and Nakagaki, T. Rules for Biologically Inspired Adaptive Network Design. Science 327(5964):439–442, 2010. doi:10.1126/science.1177894.

## 33 References (3/3) — memory, tools, Indian agricultural data

*References 3/3*

- Park, J. S., O’Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., and Bernstein, M. S. Generative Agents: Interactive Simulacra of Human Behavior. UIST 2023 (Best Paper). doi:10.1145/3586183.3606763.
- Shinn, N., Cassano, F., Gopinath, A., Narasimhan, K., and Yao, S. Reflexion: Language Agents with Verbal Reinforcement Learning. NeurIPS 2023.
- Shen, Y., Song, K., Tan, X., Li, D., Lu, W., and Zhuang, Y. HuggingGPT: Solving AI Tasks with ChatGPT and its Friends in Hugging Face. NeurIPS 2023.
- Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Hambro, E., Zettlemoyer, L., Cancedda, N., and Scialom, T. Toolformer: Language Models Can Teach Themselves to Use Tools. NeurIPS 2023.
- Guo, H., Woodruff, A., and Yadav, A. Improving Lives of Indebted Farmers Using Deep Learning: Predicting Agricultural Produce Prices Using Convolutional Neural Networks (PECAD). AAAI 2020. doi:10.1609/aaai.v34i08.7039. AGMARKNET scrape for price prediction; cited here as Indian OGD precedent, not as a baseline this proposal claims to beat.
- Government of India. Open Government Data Platform India (data.gov.in); AGMARKNET resource 9ef84268-d588-465a-a308-a864a43d0070; Directorate of Economics and Statistics crop production; IMD rainfall series; Government Open Data License — India (GODL-India).

_CrewAI is an engineering framework without a flagship peer-reviewed paper in this list; AutoGen and MetaGPT are the MAS citations._

## 34 Thank you

*Thank you*

Adaptive Context Reasoning System — a research programme, not a performance number.

- Presented By: Jenisha T
- (Reg. No. 24ETRP720001)
- Supervisor: Dr. Jyothi A P
- Department of Computer Science and Engineering
- Faculty of Engineering and Technology, MSRUAS
- jenisha.t@msruas.ac.in
