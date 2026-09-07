# 05 Literature Review

*Literature Review*

Multi-agent systems literature. What the cited papers actually contribute, and what they leave open for a structural orchestration layer.

Wu et al., AutoGen (COLM 2024 / ICLR 2024 workshop): conversation as the programming model. Gap: messages, not (toolId, score, live citation), are the unit of coordination.

Hong et al., MetaGPT (ICLR 2024): authored SOPs reduce role drift. Gap: the graph of who speaks next is written by the designer, not updated from session-local affinity after a live tool call.

Qian et al., ChatDev (ACL 2024): organisational chat-chain for software artefacts. Gap: the environment is a codebase, not a ministry API.

Li et al., CAMEL (NeurIPS 2023): inception prompting and communicative role-play. Gap: no first-class vote over tool identifiers backed by Open Government Data.

Taken together, these systems prove conversation, SOPs, software roles, and inception prompting. None of them is a session–route–mesh–prune loop over live Indian OGD.

Source of truth: `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
