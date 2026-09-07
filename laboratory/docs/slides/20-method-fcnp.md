# 20 Research Methodology — O4 FCNP

*Research Methodology*

How mesh pruning will be designed. No token-reduction ratio is claimed at proposal stage.

- Design method. Treat the post-MNCD mesh as a flow network. Apply a Kirchhoff / Physarum-inspired conductance update; drop low-conductance specialist edges; keep a residue.
- Write-back (the integration hinge). The residue is written into SATR’s next fused session. Without write-back, FCNP would be prompt compression by another name.
- Contrast with LLMLingua. LLMLingua shortens tokens before the LLM. FCNP prunes who remains in the mesh. Tokenisers are not the primary artefact.
- Heuristic honesty. Discrete conductance is a design heuristic inspired by Tero et al. (Science, 2010), not a proof that the mesh is a Physarum organism.
- Safety. Pruning must not delete the last live-data specialist if MNCD still has an open verified query. Fail loud rather than silently drop evidence.
- Future evaluation protocol (not a result). Compare mesh size and downstream SATR rank stability with vs without pruning on the same session traces.

Source of truth: `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
