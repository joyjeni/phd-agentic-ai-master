# 33 Research Methodology — O4 FCNP

*Research Methodology*

How mesh pruning will be designed. Computational compression ratios are not part of this objective.

- Design method. Treat the post-MNCD mesh as a flow network. Apply a Kirchhoff / Physarum-inspired conductance update; drop low-conductance nodes; keep a residue.
- Write-back. The residue is written into SATR’s next fused session. That coupling is the integration hinge of Objective 4.
- Contrast with LLMLingua. LLMLingua shortens tokens before the LLM. FCNP prunes who remains in the mesh.
- Heuristic honesty. Discrete conductance is a design heuristic inspired by Tero et al. (Science, 2010), not a claim that the mesh is a Physarum organism.
- Safety. Pruning must not delete the last pinned live citation. Fail loud rather than silently drop ministry evidence.
- Deliverable for the thesis chapter. Graph construction, conductance update, pinning rule, and write-back. No compression ratio is part of this objective.

Diagram: `fcnp` — open /architecture in the laboratory.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
