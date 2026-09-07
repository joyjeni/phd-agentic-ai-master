# 18 Proposed ACRS architecture

*Proposed architecture*

Figure 2 is drawn for this proposal. SATR means Session-Aware Tool Retrieval — not a new LLM and not a live price cache.

- SATR (Session-Aware Tool Retrieval) ranks tools from q + session memory H + FCNP residue M, then hands a shortlist to APRR.
- APRR samples a specialist hop path from that shortlist (training-free P ∝ W^α η^β ψ^γ).
- MNCD score-sums tool IDs and GETs a live data.gov.in UUID. Fail loud. No dummy prices.
- FCNP prunes the mesh by conductance and writes M_t back into SATR — that is the closed loop drawn in Figure 2.

Diagram: `proposed` — open /architecture in the laboratory.

_Figure 2 is drawn for this proposal. Contrast with Figure 1 (Wang et al., FCS 2024). No NDCG is drawn._

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
