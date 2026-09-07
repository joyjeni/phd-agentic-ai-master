# 11 Literature Review — Evidence 11 & Evidence 12

*Literature Review*

Continuation. Evidence 11 & Evidence 12 in the same Evidence template.

**Evidence 11**

- Author(s): Ong, I., Almahairi, A., Wu, V., Chiang, W.-L., Wu, T., Gonzalez, J. E., Kadous, M. W., and Stoica, I.
- Year: 2025
- Title: RouteLLM: Learning to Route LLMs from Preference Data
- Publication: Proceedings of the Thirteenth International Conference on Learning Representations (ICLR 2025)
- URL: https://proceedings.iclr.cc/paper_files/paper/2025/hash/5503a7c69d48a2f86fc00b3dc09de686-Abstract-Conference.html
- Objective: Route each query between a stronger and a weaker LLM from human preference data.
- Methodology: Trained router plus data augmentation; deployed as a frozen policy at inference.
- Findings: Preference-trained routers can cut cost while holding response quality on public benchmarks.
- Limitations: The object of routing is an LLM SKU, not a named Indian-OGD specialist with a training-free posterior.
- To solve the research gap: O2 APRR — route named mandi / crop / rainfall specialists, not foundation-model SKUs.

**Evidence 12**

- Author(s): Yue, Y., Zhang, G., Liu, B., Wan, G., Wang, K., Cheng, D., and Qi, Y.
- Year: 2025
- Title: MasRouter: Learning to Route LLMs for Multi-Agent Systems
- Publication: Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15549–15572. [doi:10.18653/v1/2025.acl-long.757](https://doi.org/10.18653/v1/2025.acl-long.757)
- DOI: https://doi.org/10.18653/v1/2025.acl-long.757
- URL: https://doi.org/10.18653/v1/2025.acl-long.757
- Objective: Unify collaboration mode, role allocation, and LLM choice as one MAS routing problem.
- Methodology: Cascaded neural controller trained over multi-agent topologies.
- Findings: A learned controller can assemble a cheaper MAS than a static multi-agent template.
- Limitations: Requires training. It does not maintain a training-free affinity matrix over named tool-specialist agents.
- To solve the research gap: O2 APRR — training-free hop sampling over named specialists; learned routers stay a later comparison class.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
