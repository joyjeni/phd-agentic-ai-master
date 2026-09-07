# 27 Research Methodology — implementation formulas

*Research Methodology*

How the proposal will be implemented: the equations copied from the laboratory, not a promised leaderboard. Constants are the repository defaults.

| Module | Formula as coded | Constants |
| --- | --- | --- |
| O1 SATR | s(a|q,H)=w_base s_base + w_cat cat + w_sch sch + w_ept ept + w_cooc Σ γ^{n-i} log(1+w_{h_i,a}) + w_rec rec − 0.35 fails;  s_base=0.7 BM25+0.3 TFIDF-cos+0.08 mem-cos | w=(1, 0.45, 0.25, 0.3, 0.35, 0.25); γ=0.7; ρ=0.02; δ=1; decay=0.85; BM25 k1=1.5 b=0.75 |
| O2 APRR | P(a_j|a_i,q) ∝ W_ij^α η_ij^β ψ_j(q)^γ ;  W←(1-λ)W + κ·reward·1/L²·1/lat | α=2, β=1, γ=2.5, λ=0.005, κ=5, W0=0.1, ε=0 (lab), maxHops=4; reward +1 / −0.05 |
| O3 MNCD | s=0.45 score/(|score|+2)+0.35 overlap+liveBoost−0.05 idx;  tally=Σ w_a s_a;  w=success/(1+lat/1000) | liveBoost 0.25+0.20 preferred; fanout=3; R=2; τ=0.55; score-sum not Borda; live UUID only |
| O4 FCNP | D_ij(t+1)=(1-μ)D_ij+α|Q_ij|^γ ;  L p = I ;  Q=|D(p_i-p_j)|;  keep 35% / summarize 20% / drop | μ=0.1, α=0.5, γ=1.2, sim≥0.12; pinned live citations never evicted; memory→SATR |

_Source: lib/research/satr.ts, aprr.ts, mncd.ts, fcnp.ts. Full walkthrough: /walkthrough._

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
