# Motivation and research objectives

Jenisha T · Register No. `24ETRP720001` · Ph.D. CSE, M S Ramaiah University of
Applied Sciences, FET. Supervisor: Dr. Jyothi A P. Date of registration:
04-Sept-2024. Part Time.

Canonical source: `lib/research/objectives.ts`. Lab page: `/objectives`.
Proposal slides tell this document in story order: Motivation (01a) → Research
Objectives — overall (05a) → Research Objectives — individual, then O1–O4
(06–06d) → What these objectives do not claim (06e) → Research questions (07).

These statements are **design objectives**. They do not commit a retrieval
score, routing win-rate, consensus percentage, latency bound, token-reduction
ratio, or any other computational metric.

## Motivation

Large-language-model agents already retrieve tools, choose among models or
workflows, coordinate over messages, and shorten prompts. In the published
literature those four operations remain four families. A farmer query against
Indian Open Government Data needs them as one turn: the next tool list must
remember which tools succeeded together; the next hop must be a named specialist
rather than a foundation-model SKU; the object that is voted on must be a tool
identifier backed by a verified ministry UUID; and whatever is kept after
pruning must re-enter retrieval rather than disappear as deleted tokens.

Wang et al. organise LLM agents as Profiling, Memory, Planning, and Action
(*Frontiers of Computer Science*, 2024). That template does not name a session
co-activation cache, a training-free hop sampler over tool specialists, a mesh
whose consensus object is a live tool ID, or a conductance prune that writes
citations back into retrieval. ToolLLM and ToolRerank retrieve from the current
query. RouteLLM, PILOT, MasRouter, and MetaGPT pick models or follow authored
SOPs. AutoGen, ChatDev, and CAMEL coordinate over chat. LLMLingua shortens the
prompt. Taken together, those papers are not a live Agriculture loop on
data.gov.in.

This research is therefore motivated to specify Adaptive Context Reasoning
System (ACRS) as the missing structural orchestration layer: one fail-loud
contract in which session retrieval, specialist routing, live Indian OGD
execution, and citation write-back occur in a fixed order. The motivation is
architectural completeness — that the four surfaces are named, ordered, and
closed — not a leaderboard comparison.

## Overall research objective

To design and implement Adaptive Context Reasoning System (ACRS) as a closed
structural orchestration layer in which SATR (Session-Aware Tool Retrieval),
training-free specialist routing (APRR), mesh consensus over tool identifiers
(MNCD), and flow-coupled context pruning with write-back (FCNP) execute in that
order on one user turn, using live Indian Open Government Data as the only
execution corpus. The proposal-stage claim is architectural completeness and
live-pipeline integrity — that the four modules form one fail-loud loop — not a
retrieval, routing, consensus, or compression score.

## Individual research objectives

### O1 — SATR (Session-Aware Tool Retrieval)

To design SATR so that tool ranking is conditioned on the current query together
with session history and a co-activation cache of tools that succeeded together,
and so that SATR never executes live ministry APIs.

Artefact: truncated RankedTool shortlist consumed by APRR.

### O2 — Adaptive Probabilistic Routing Reinforcement (APRR)

To design APRR so that routing samples a training-free path among
tool-specialist agents (agriculture_analyst, schema_planner, tool_executor,
mesh_critic, retrieval_specialist) rather than choosing a foundation-model SKU
or following an authored SOP.

Artefact: hop path and per-hop tool assignments consumed by MNCD.

### O3 — Mesh Network Context Diffusion (MNCD)

To design MNCD so that APRR agents publish (toolId, score), aggregate by
score-sum rather than by chat, and execute only liveExecutable Agriculture
resources on data.gov.in, failing loud when the live call cannot be completed.

Artefact: consensus tally plus live observations consumed by FCNP.

### O4 — Flow-Coupled Network Pruning (FCNP)

To design FCNP so that the post-MNCD context graph is pruned by a grounded
conductance update, live citations and the user query are never evicted, and
the retained residue is written back as the next SATR prior.

Artefact: retained session memory M_t written into SATR at turn t+1.

## What these objectives do not claim

Motivation and objectives in this proposal are design statements. They specify
what will be built, in what order, on which corpus, and with which fail-loud
rules. They do not commit a retrieval score, a routing win-rate, a consensus
percentage, a latency bound, a token-reduction ratio, or any other computational
metric. Later experimental chapters may name a protocol; that protocol is
outside these objectives.
