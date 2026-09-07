# 24 Objective 3 — MNCD

*Research Objectives*

To design a gossip mesh whose vote object is a tool identifier, whose consensus is score-sum, and whose execution is a GET of a verified data.gov.in Agriculture UUID.

SOTA. Wang et al., A survey on large language model based autonomous agents (Frontiers of Computer Science, 2024, doi:10.1007/s11704-024-40231-1): construction of LLM agents. He, Treude and Lo, LLM-Based Multi-Agent Systems for Software Engineering (ACM TOSEM, 2025, doi:10.1145/3712003): LMA systems across the SDLC. Guo et al., Large Language Model based Multi-Agents (IJCAI-24, doi:10.24963/ijcai.2024/890): profiling and communication. Chang and Geng, SagaLLM (PVLDB 2025, doi:10.14778/3750601.3750611): transactional context for multi-agent LLM planning. Wu et al., AutoGen (COLM 2024): multi-agent conversation. Hong et al., MetaGPT (ICLR 2024): SOP pipeline. Qian et al., ChatDev (ACL 2024): organisational chat-chain. Li et al., CAMEL (NeurIPS 2023): communicative role-playing agents. Pipeline: manager LLM → sequential or star-topology agent messages → tool calls

Gap. Star and chat topologies coordinate over natural-language messages. They do not vote over tool identifiers backed by a ministry API.

Novelty. First-class vote object is a tool ID, not a chat utterance. Laboratory consensus is score-sum. A Borda variant exists in the ranking-library repository and is not this objective’s default. Live Indian OGD only. Catalog-only ToolBench tools stay ranking-only; records are never invented. HTTP 5xx/429 are retried; missing key, unverified UUID, or empty live universe fail loud.

Diagram: `compare-mncd` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/mncd-mesh-agents_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
