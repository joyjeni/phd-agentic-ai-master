# 25 Objective 4 — FCNP

*Research Objectives*

To design Kirchhoff/Physarum pruning of the MNCD trace so that a residue of pinned live citations is written back into SATR as session memory.

SOTA. Jiang et al., LLMLingua (EMNLP 2023): token-level prompt compression. Tero et al., Science 2010 (doi:10.1126/science.1177894): Physarum adaptive network. Park et al., Generative Agents (UIST 2023): language memory stream in a sandbox. Pipeline: long prompt → compressor → LLM. Memory is not written back into a tool retriever.

Gap. Token compressors are not current-reinforced over a context graph and do not pin live government citations into the next retrieval turn.

Novelty. Laplacian solve with a grounded sink, matching the laboratory pruner. Hybrid keep / extractive-summarize / drop tiers, with pinned query and live citations. If a requested crop or state has no rows today, other live rows from the same resource are shown; nothing is invented. Closed loop: retained spans become SATR session memory. Without write-back, FCNP would be prompt compression by another name.

Diagram: `compare-fcnp` — open /architecture in the laboratory.

_Repository: github.com/joyjeni/fcnp-context-pruning_

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
