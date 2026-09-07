# 05 Motivation

*Motivation*

Large-language-model agents already retrieve tools, choose among models or workflows, coordinate over messages, and shorten prompts. In the published literature those four operations remain four families. A farmer query against Indian Open Government Data needs them as one turn: the next tool list must remember which tools succeeded together; the next hop must be a named specialist rather than a foundation-model SKU; the object that is voted on must be a tool identifier backed by a verified ministry UUID; and whatever is kept after pruning must re-enter retrieval rather than disappear as deleted tokens.

Wang et al. organise LLM agents as Profiling, Memory, Planning, and Action (Frontiers of Computer Science, 2024). That template does not name a session co-activation cache, a training-free hop sampler over tool specialists, a mesh whose consensus object is a live tool ID, or a conductance prune that writes citations back into retrieval. ToolLLM and ToolRerank retrieve from the current query. RouteLLM, PILOT, MasRouter, and MetaGPT pick models or follow authored SOPs. AutoGen, ChatDev, and CAMEL coordinate over chat. LLMLingua shortens the prompt. Taken together, those papers are not a live Agriculture loop on data.gov.in.

This research is therefore motivated to specify Adaptive Context Reasoning System (ACRS) as the missing structural orchestration layer: one fail-loud contract in which session retrieval, specialist routing, live Indian OGD execution, and citation write-back occur in a fixed order. The motivation is architectural completeness — that the four surfaces are named, ordered, and closed — not a leaderboard comparison.

- Published stacks retrieve, route, chat, or compress as separate families.
- A live Indian OGD turn needs all four as one fail-loud contract, with write-back into retrieval.
- The motivation is to specify that contract, not to pre-commit a computational score.

Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.
