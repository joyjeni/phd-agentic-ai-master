# 24 Research Methodology — O3 MNCD

*Research Methodology*

How live Indian OGD and score-sum consensus will be executed. PECAD is a domain precedent, not a baseline to beat.

- Design method. Specialists selected by APRR gossip partial beliefs. Aggregate with score-sum (not Borda). Every live claim must cite a verified data.gov.in resource UUID.
- Corpus / API. Agriculture-only Open Government Data: AGMARKNET (9ef84268-d588-465a-a308-a864a43d0070) and other UUIDs that pass verification.
- Fail-loud contract. HTTP 5xx/429 are retried with backoff; missing API key, unverified UUID, or empty filtered universe hard-fail. No dummy mandi prices.
- Platform constraint. data.gov.in Elastic max_result_window is 10 000; limit is capped. Pagination is sequential, not a fabricated parallel harvest.
- Related work used correctly. Guo, Woodruff & Yadav, PECAD (AAAI 2020) shows AGMARKNET as a real DSS input. MNCD does not re-implement crop-yield prediction.
- Future evaluation protocol (not a result). Measure citation completeness, fail-loud rate on injected faults, and qualitative agreement of score-sum vs majority vote.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
