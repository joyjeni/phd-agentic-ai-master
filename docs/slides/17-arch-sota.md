# 17 SOTA architecture (Wang et al., 2024)

*SOTA architecture*

Figure 1 after Wang et al., Frontiers of Computer Science 18:186345 (2024), [doi:10.1007/s11704-024-40231-1](https://doi.org/10.1007/s11704-024-40231-1). Four modules: Profiling, Memory, Planning, Action. Tool instantiation: Qin ToolLLM + Zheng ToolRerank (query only).

- Journal source of Figure 1. Wang et al., Front. Comput. Sci. 18:186345 (2024). Four modules: Profiling, Memory, Planning, Action.
- Related surveys. He, Treude and Lo, ACM TOSEM 34(5) (2025); Guo et al., IJCAI-24, 8048–8057.
- Tool instantiation. Qin/Zheng: turn-amnesic API retrieval. That is the grey path under Figure 1.
- What SOTA does not draw. A co-activation cache, a specialist posterior, a live data.gov.in GET, or write-back into retrieval.

Diagram: `sota` — open /architecture in the laboratory.

_Wang L. et al. Front. Comput. Sci. 18:186345 (2024). Figure 1 is redrawn for this proposal; it is not a scanned publisher PDF._

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
