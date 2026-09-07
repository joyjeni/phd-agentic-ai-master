# 22 Research Objectives — individual

*Research Objectives*

Four thesis-sized design objectives follow from the overall aim. Each is a To-design statement. Computational scores are not part of these objectives.

| ID | Name | Design objective |
| --- | --- | --- |
| O1 | SATR (Session-Aware Tool Retrieval) | To design SATR so that tool ranking is conditioned on the current query together with session history and a co-activation cache of tools that succeeded together, and so that SATR never executes live ministry APIs. |
| O2 | Adaptive Probabilistic Routing Reinforcement (APRR) | To design APRR so that routing samples a training-free path among tool-specialist agents (agriculture_analyst, schema_planner, tool_executor, mesh_critic, retrieval_specialist) rather than choosing a foundation-model SKU or following an authored SOP. |
| O3 | Mesh Network Context Diffusion (MNCD) | To design MNCD so that APRR agents publish (toolId, score), aggregate by score-sum rather than by chat, and execute only liveExecutable Agriculture resources on data.gov.in, failing loud when the live call cannot be completed. |
| O4 | Flow-Coupled Network Pruning (FCNP) | To design FCNP so that the post-MNCD context graph is pruned by a grounded conductance update, live citations and the user query are never evicted, and the retained residue is written back as the next SATR prior. |

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
