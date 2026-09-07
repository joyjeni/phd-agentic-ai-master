# 13 Objective 3 — MNCD

*Research Objectives*

The consensus-and-execution chapter: gossip (toolId, score), score-sum consensus, live data.gov.in GET on verified UUIDs. The unit of publication is the protocol plus the citation contract.

SOTA. Wu et al., AutoGen (COLM 2024; ICLR 2024 LLM Agents Workshop Best Paper, arXiv:2308.08155): multi-agent conversation. Hong et al., MetaGPT (ICLR 2024): SOP pipeline. Qian et al., ChatDev (ACL 2024): organisational chat-chain. Li et al., CAMEL (NeurIPS 2023): communicative role-playing agents. Pipeline: manager LLM → sequential or star-topology agent messages → tool calls

Gap. Star and chat topologies coordinate over natural-language messages. They do not vote over tool identifiers backed by a ministry API.

Novelty. First-class vote object is a tool ID, not a chat utterance. consensus_pick is score-sum; consensus_pick_borda is a non-default variant. Live Indian OGD only. Catalog-only tools stay ranking-only; prices are never invented. HTTP 5xx/429 are retried; empty filters show other live rows from the same resource.

Diagram: `compare-mncd` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/mncd-mesh-agents_

Source of truth: `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
