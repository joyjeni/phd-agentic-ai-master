# Literature Survey

FET / PRP template form for Jenisha T (24ETRP720001). Each numbered block is one published paper.
Proposal-stage: no NDCG, latency, token, or accuracy commitments.

## Evidence 1

**Author(s):** Wu, Q., Bansal, G., Zhang, J., Wu, Y., Li, B., Zhu, E., Jiang, L., Zhang, X., Zhang, S., Liu, J., Awadallah, A. H., White, R. W., Burger, D., and Wang, C.

**Year:** 2024

**Title:** AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversations

**Publication:** Conference on Language Modeling (COLM) 2024; ICLR 2024 Workshop on LLM Agents (Best Paper). arXiv:2308.08155

**Objective:** Program LLM applications by composing multiple conversable agents.

**Methodology:** Agents exchange natural-language messages until a stopping condition; modes mix LLMs, humans, and tools.

**Findings:** Conversation is a working programming model for multi-agent LLM applications.

**Limitations:** The unit of coordination is a chat message, not a live (toolId, score, citation) on Indian Open Government Data.

**To solve the research gap:** O3 MNCD — gossip (toolId, score), score-sum consensus, then a fail-loud live data.gov.in GET.

## Evidence 2

**Author(s):** Hong, S., Zhuge, M., Chen, J., Zheng, X., Cheng, Y., Wang, J., Zhang, C., Wang, Z., Yau, S. K. S., Lin, Z., Zhou, L., Ran, C., Xiao, L., Wu, C., and Schmidhuber, J.

**Year:** 2024

**Title:** MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework

**Publication:** ICLR 2024

**Objective:** Reduce role drift in multi-agent software workflows by encoding human SOPs.

**Methodology:** Standard Operating Procedures are written into prompt sequences; an assembly-line assigns roles.

**Findings:** Authored SOPs produce more coherent software artefacts than unconstrained chat agents.

**Limitations:** Who speaks next is designed in advance. The graph is not updated from session-local affinity after a live tool call.

**To solve the research gap:** O2 APRR — training-free specialist posterior updated after live outcomes, not an authored SOP graph.

## Evidence 3

**Author(s):** Qian, C., Liu, W., Liu, H., Chen, N., Dang, Y., Li, J., Yang, C., Chen, W., Su, Y., Cong, X., Xu, J., Li, D., Liu, Z., and Sun, M.

**Year:** 2024

**Title:** ChatDev: Communicative Agents for Software Development

**Publication:** ACL 2024 (long), pages 15174–15186. doi:10.18653/v1/2024.acl-long.810

**Objective:** Organise specialised LLM agents as a chat-chain for software design, coding, and testing.

**Methodology:** Chat chain (what to communicate) plus communicative dehallucination (how to communicate).

**Findings:** Natural-language design talk and code-level debug talk can be unified in one multi-agent loop.

**Limitations:** The environment is a codebase, not a ministry API with a fail-loud live GET.

**To solve the research gap:** O3 MNCD — the environment is a verified ministry UUID; empty filters fail loud instead of inventing rows.

## Evidence 4

**Author(s):** Li, G., Hammoud, H. A. A. K., Itani, H., Khizbullin, D., and Ghanem, B.

**Year:** 2023

**Title:** CAMEL: Communicative Agents for “Mind” Exploration of Large Language Model Society

**Publication:** NeurIPS 2023

**Objective:** Enable autonomous cooperation among communicative agents with minimal human steering.

**Methodology:** Role-playing with inception prompting to keep agents on a human-specified task.

**Findings:** Inception prompting yields scalable multi-agent conversational data and cooperative behaviour.

**Limitations:** No first-class vote over tool identifiers backed by Open Government Data.

**To solve the research gap:** O3 MNCD — the vote object is a tool identifier backed by Open Government Data, not a role-play utterance.

## Evidence 5

**Author(s):** Qin, Y., Liang, S., Ye, Y., Zhu, K., Yan, L., Lu, Y., Lin, Y., Cong, X., Tang, X., Qian, B., Zhao, S., Hong, L., Tian, R., Xie, R., Zhou, J., Gerstein, M., Li, D., Liu, Z., and Sun, M.

**Year:** 2024

**Title:** ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs

**Publication:** ICLR 2024

**Objective:** Give open LLMs general tool-use over a large real-world API catalogue.

**Methodology:** ToolBench: 16,464 RapidAPI REST endpoints; SBERT retriever; DFSDT planner; ToolEval protocol.

**Findings:** A public ranking library and planner exist for large-scale tool use.

**Limitations:** Retrieval is turn-amnesic. RapidAPI keys are not redistributable, so this lab cannot execute ToolBench endpoints live.

**To solve the research gap:** O1 SATR uses ToolBench as a ranking library only. O3 MNCD executes live Indian OGD, never RapidAPI replay.

## Evidence 6

**Author(s):** Zheng, Y., Li, P., Liu, W., Liu, Y., Luan, J., and Wang, B.

**Year:** 2024

**Title:** ToolRerank: Adaptive and Hierarchy-Aware Reranking for Tool Retrieval

**Publication:** LREC-COLING 2024, pages 16263–16273. ACL Anthology 2024.lrec-main.1413

**Objective:** Refine ToolLLM-style retrieval for seen versus unseen APIs and for tool-library hierarchy.

**Methodology:** Adaptive truncation of seen/unseen APIs plus hierarchy-aware concentration or diversity.

**Findings:** Reranking the SBERT shortlist improves downstream tool execution quality.

**Limitations:** Still query-only. Session co-activation and later write-back from a pruned mesh are unused.

**To solve the research gap:** O1 SATR — fuse co-activation after ToolRerank-style truncation. O4 FCNP writes the residue back.

## Evidence 7

**Author(s):** Ong, I., Almahairi, A., Wu, V., Chiang, W.-L., Wu, T., Gonzalez, J. E., Kadous, M. W., and Stoica, I.

**Year:** 2025

**Title:** RouteLLM: Learning to Route LLMs from Preference Data

**Publication:** ICLR 2025. arXiv:2406.18665

**Objective:** Route each query between a stronger and a weaker LLM from human preference data.

**Methodology:** Trained router plus data augmentation; deployed as a frozen policy at inference.

**Findings:** Preference-trained routers can cut cost while holding response quality on public benchmarks.

**Limitations:** The object of routing is an LLM SKU, not a named Indian-OGD specialist with a training-free posterior.

**To solve the research gap:** O2 APRR — route named mandi / crop / rainfall specialists, not foundation-model SKUs.

## Evidence 8

**Author(s):** Yue, Y., Zhang, G., Liu, B., Wan, G., Wang, K., Cheng, D., and Qi, Y.

**Year:** 2025

**Title:** MasRouter: Learning to Route LLMs for Multi-Agent Systems

**Publication:** ACL 2025 (long), pages 15549–15572. doi:10.18653/v1/2025.acl-long.757

**Objective:** Unify collaboration mode, role allocation, and LLM choice as one MAS routing problem.

**Methodology:** Cascaded neural controller trained over multi-agent topologies.

**Findings:** A learned controller can assemble a cheaper MAS than a static multi-agent template.

**Limitations:** Requires training. It does not maintain a Dirichlet–Thompson matrix over mandi / crop / rainfall specialists.

**To solve the research gap:** O2 APRR — Dirichlet–Thompson posterior over named specialists; learned routers stay a future bake-off.

## Evidence 9

**Author(s):** Panda, P., Magazine, R., Devaguptapu, C., Takemori, S., and Sharma, V.

**Year:** 2025

**Title:** Adaptive LLM Routing under Budget Constraints

**Publication:** Findings of the Association for Computational Linguistics: EMNLP 2025, pages 23934–23949. doi:10.18653/v1/2025.findings-emnlp.1301. Method name: PILOT (Preference-prior Informed LinUCB).

**Objective:** Treat LLM routing as a contextual bandit under a user budget.

**Methodology:** Preference-prior LinUCB in a shared query–LLM embedding space, plus an online cost policy.

**Findings:** Bandit routing can adapt without exhaustive inference of every LLM on every query.

**Limitations:** Routes foundation-model SKUs under a dollar budget, not tool-specialist agents after a live data.gov.in GET.

**To solve the research gap:** O2 APRR — specialist hops after SATR, updated from live MNCD outcomes, not SKU bandits under a dollar budget.

## Evidence 10

**Author(s):** Jiang, H., Wu, Q., Lin, C.-Y., Yang, Y., and Qiu, L.

**Year:** 2023

**Title:** LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models

**Publication:** EMNLP 2023, pages 13358–13376. doi:10.18653/v1/2023.emnlp-main.825

**Objective:** Shorten long prompts while keeping task performance.

**Methodology:** Budget controller plus token-level iterative compression aligned to the target LLM.

**Findings:** Token-importance compression can reduce prompt length with limited quality loss.

**Limitations:** Deletes tokens before the LLM. It does not prune a mesh by conductance or write live citations back into retrieval.

**To solve the research gap:** O4 FCNP — prune the mesh by conductance and pin live citations into SATR, not token deletion.

## Evidence 11

**Author(s):** Park, J. S., O’Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., and Bernstein, M. S.

**Year:** 2023

**Title:** Generative Agents: Interactive Simulacra of Human Behavior

**Publication:** UIST 2023 (Best Paper). doi:10.1145/3586183.3606763

**Objective:** Give LLM agents a long-term memory stream for believable behaviour in a sandbox.

**Methodology:** Natural-language memory, reflection, and retrieval (recency, relevance, importance) inside a Sims-like town.

**Findings:** A memory stream supports individual plans and emergent social coordination among agents.

**Limitations:** Memory lives in a sandbox simulation. It is not written back into a tool retriever over ministry APIs.

**To solve the research gap:** O4 FCNP — pin live ministry citations into the next SATR prior, not a sandbox memory stream.

## Evidence 12

**Author(s):** Tero, A., Takagi, S., Saigusa, T., Ito, K., Bebber, D. P., Fricker, M. D., Yumiki, K., Kobayashi, R., and Nakagaki, T.

**Year:** 2010

**Title:** Rules for Biologically Inspired Adaptive Network Design

**Publication:** Science 327(5964):439–442. doi:10.1126/science.1177894

**Objective:** Capture how Physarum polycephalum grows efficient, fault-tolerant transport networks.

**Methodology:** Feedback between tube conductance and protoplasmic flux; compared with the Tokyo rail system.

**Findings:** A local conductance update can yield globally efficient adaptive networks without a central planner.

**Limitations:** A biological transport model, not an LLM context pruner. ACRS uses it as a design heuristic, not as a claim that the mesh is an organism.

**To solve the research gap:** O4 FCNP — Physarum-inspired conductance as a design heuristic, with write-back into SATR.

## Evidence 13

**Author(s):** Guo, H., Woodruff, A., and Yadav, A.

**Year:** 2020

**Title:** Improving Lives of Indebted Farmers Using Deep Learning: Predicting Agricultural Produce Prices Using Convolutional Neural Networks (PECAD)

**Publication:** AAAI 2020. doi:10.1609/aaai.v34i08.7039

**Objective:** Use AGMARKNET price series as decision-support input for indebted farmers.

**Methodology:** Convolutional networks over scraped agricultural produce prices.

**Findings:** AGMARKNET is a real Indian decision-support corpus, not a toy table.

**Limitations:** A crop-price CNN is not a multi-agent live-OGD loop. Cited as domain precedent, not as a baseline to beat.

**To solve the research gap:** O3 MNCD — live AGMARKNET UUID as a citation. PECAD is domain precedent, not a baseline to beat.

## Evidence 14

**Author(s):** Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., and Cao, Y.

**Year:** 2023

**Title:** ReAct: Synergizing Reasoning and Acting in Language Models

**Publication:** ICLR 2023

**Objective:** Interleave reasoning traces with actions so a language model can use tools.

**Methodology:** Thought–action–observation cycles on the already-chosen tool set.

**Findings:** Reasoning-and-acting beats reason-only or act-only prompting on several agent tasks.

**Limitations:** Assumes the tool set is already determined. It does not fuse session co-activation into the next rank, nor cite a live data.gov.in UUID.

**To solve the research gap:** O1 SATR — choose the tool set from session memory before any ReAct-style acting. O3 MNCD cites the UUID.

## To solve the research gap

The limitations in Evidence 1–14 collapse into five architectural gaps. This proposal solves them as follows. Closing a gap is a named module on a closed loop, not a promised leaderboard number.

| Research gap | Left open by | To solve the research gap |
|---|---|---|
| G1 — Turn-amnesic retrieval | Evidence 5, 6, 14 | O1 SATR. Fuse session co-activation with semantic rank; write FCNP residue into the next prior. |
| G2 — Model / SOP routers | Evidence 2, 7, 8, 9 | O2 APRR. Training-free Dirichlet–Thompson posterior over named specialists, not LLM SKUs. |
| G3 — Chat / star coordination | Evidence 1, 2, 3, 4 | O3 MNCD. Score-sum over live tool identifiers, then a fail-loud data.gov.in GET. |
| G4 — Token compression, no write-back | Evidence 10, 11, 12 | O4 FCNP. Conductance prune of the mesh; pin live citations back into SATR. |
| G5 — No live Indian OGD loop | Evidence 5, 13 | Integrated ACRS on verified Agriculture UUIDs. ToolBench is ranking-only; prices are never invented. |

Integration order: SATR → APRR → MNCD → FCNP on one user turn.
