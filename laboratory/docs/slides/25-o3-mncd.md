# 25 Objective 3 — MNCD

*Research Objectives*

To design MNCD so that APRR agents publish (toolId, score), aggregate by score-sum rather than by chat, and execute only liveExecutable Agriculture resources on data.gov.in, failing loud when the live call cannot be completed.

- Artefact. Consensus tally plus live observations consumed by FCNP.
- What will be designed. To design a gossip mesh whose vote object is a tool identifier, whose consensus is score-sum, and whose execution is a GET of a verified data.gov.in Agriculture UUID.
- Gap. Star and chat topologies coordinate over natural-language messages. They do not vote over tool identifiers backed by a ministry API.

Diagram: `compare-mncd` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/mncd-mesh-agents_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
