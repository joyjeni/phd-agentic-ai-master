# 24 Objective 3 — MNCD

*Research Objectives*

The consensus-and-execution chapter: gossip (toolId, score), score-sum consensus, live data.gov.in GET on verified UUIDs. The unit of publication is the protocol plus the citation contract.

SOTA. Wang et al., A survey on large language model based autonomous agents (Frontiers of Computer Science, 2024, doi:10.1007/s11704-024-40231-1): construction of LLM agents. He, Treude and Lo, LLM-Based Multi-Agent Systems for Software Engineering (ACM TOSEM, 2025, doi:10.1145/3712003): LMA systems across the SDLC. Guo et al., Large Language Model based Multi-Agents (IJCAI-24, doi:10.24963/ijcai.2024/890): profiling and communication. Chang and Geng, SagaLLM (PVLDB 2025, doi:10.14778/3750601.3750611): transactional context for multi-agent LLM planning. Wu et al., AutoGen (COLM 2024): multi-agent conversation. Hong et al., MetaGPT (ICLR 2024): SOP pipeline. Qian et al., ChatDev (ACL 2024): organisational chat-chain. Li et al., CAMEL (NeurIPS 2023): communicative role-playing agents. Pipeline: manager LLM → sequential or star-topology agent messages → tool calls

Gap. Star and chat topologies coordinate over natural-language messages. They do not vote over tool identifiers backed by a ministry API.

Novelty. First-class vote object is a tool ID, not a chat utterance. consensus_pick is score-sum; consensus_pick_borda is a non-default variant. Live Indian OGD only. Catalog-only tools stay ranking-only; prices are never invented. HTTP 5xx/429 are retried; empty filters show other live rows from the same resource.

Diagram: `compare-mncd` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/mncd-mesh-agents_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
