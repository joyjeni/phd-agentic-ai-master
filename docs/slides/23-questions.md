# 23 Research Questions

*Research Questions*

Each question is paired with one objective. Answers will be empirical after a protocol is frozen; this slide does not pre-commit scores.

- RQ1. Can tool retrieval be conditioned on a co-activation cache and session memory rather than a single query embedding (Qin et al., ToolLLM, ICLR 2024; Zheng et al., ToolRerank, LREC-COLING 2024)?  →  addressed by O1 (SessionRerank+ (SATR)).
- RQ2. Can routing sample a training-free posterior over tool-specialist agents instead of a trained neural controller or an authored SOP (Yue et al., MasRouter, ACL 2025; Hong et al., MetaGPT, ICLR 2024; Ong et al., RouteLLM, ICLR 2025)?  →  addressed by O2 (Adaptive Probabilistic Routing Reinforcement (APRR)).
- RQ3. Can execution proceed as gossiped (toolId, score) plus score-sum consensus, then a live data.gov.in GET, instead of a central chat orchestrator (Wu et al., AutoGen, COLM 2024)?  →  addressed by O3 (Mesh Network Context Diffusion (MNCD)).
- RQ4. Can Kirchhoff/Physarum pruning pin live citations back into retrieval rather than only shortening the prompt (Jiang et al., LLMLingua, EMNLP 2023; Tero et al., Science 2010)?  →  addressed by O4 (Flow-Coupled Network Pruning (FCNP)).

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
