# 26 Objective 4 — FCNP

*Research Objectives*

To design FCNP so that the post-MNCD context graph is pruned by a grounded conductance update, live citations and the user query are never evicted, and the retained residue is written back as the next SATR prior.

- Artefact. Retained session memory M_t written into SATR at turn t+1.
- What will be designed. To design Kirchhoff/Physarum pruning of the MNCD trace so that a residue of pinned live citations is written back into SATR as session memory.
- Gap. Token compressors are not current-reinforced over a context graph and do not pin live government citations into the next retrieval turn.

Diagram: `compare-fcnp` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/fcnp-context-pruning_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
