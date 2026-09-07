# ACRS pipeline walkthrough — exact formulas and two worked traces

Research proposal laboratory for **Jenisha T** (24ETRP720001), Ph.D. CSE,
MSRUAS / FET. Supervisor: Dr. Jyothi A P.

This note states **how the proposal is implemented**: the equations in
`lib/research/satr.ts`, `aprr.ts`, `mncd.ts`, `fcnp.ts`, then a complete
SATR → APRR → MNCD → FCNP pass on **one ToolBench-schema datum** and on
**one live data.gov.in AGMARKNET query**.

Numbers dated **07 September 2026** are lab traces, not NDCG, latency, or
accuracy commitments.

Interactive copy: `/walkthrough`.

---

## Closed-loop algorithm

1. Input: query \(q\), session \(S\) (history, co-activation, affinity \(W\), FCNP memory, peerStats).
2. **O1 SATR:** score every Agriculture catalog tool with \(s(a|q,H)\); ToolRerank-style seen/unseen truncation to top-\(K\).
3. **O2 APRR:** sample hops with \(P \propto W^\alpha \eta^\beta \psi^\gamma\) from `agriculture_analyst`; assign up to 3 tools per hop.
4. **O3 MNCD:** each agent publishes a ranking; **score-sum** tally; GET only live `data.gov.in` Agriculture UUIDs; fail loud.
5. **O4 FCNP:** build a trace graph; Kirchhoff / Physarum iterate; keep / summarize / drop; pin live citations.
6. Write-back: update \(W\) with \(\kappa \cdot \mathrm{reward}/L^2/\mathrm{lat}\); update co-activation on live success; `session.memory ← retained`.

---

## Exact formulas as coded

### O1 SATR (`lib/research/satr.ts`)

\[
s(a|q,H)= w_{\mathrm{base}} s_{\mathrm{base}} + w_{\mathrm{cat}}\mathrm{cat} + w_{\mathrm{sch}}\mathrm{sch} + w_{\mathrm{ept}}\mathrm{ept} + w_{\mathrm{cooc}}\sum_i \gamma^{n-i}\log(1+w_{h_i,a}) + w_{\mathrm{rec}}\mathrm{rec} - 0.35\cdot\mathrm{fails}
\]

\[
s_{\mathrm{base}} = 0.7\,\mathrm{BM25}(q,a) + 0.3\,\mathrm{TFIDF\text{-}cosine}(q,a) + 0.08\,\mathrm{memory\text{-}cosine}(M,a)
\]

BM25: \(k_1=1.5\), \(b=0.75\), \(\mathrm{IDF}=\log\frac{N-\mathrm{df}+0.5}{\mathrm{df}+0.5}+1\).

Weights: \(w_{\mathrm{base}}=1\), \(w_{\mathrm{cat}}=0.45\), \(w_{\mathrm{sch}}=0.25\), \(w_{\mathrm{ept}}=0.3\), \(w_{\mathrm{cooc}}=0.35\), \(w_{\mathrm{rec}}=0.25\).

Session priors: decay \(0.85\); recency last 3 with \(0.5^k\); features \(\log(1+10x)\) then z-score; \(s_{\mathrm{base}}\) z-scored across the catalog.

Co-activation: \(w_{u,v}\leftarrow (1-\rho)w_{u,v}+\delta\cdot 1[\mathrm{success}]\), \(\rho=0.02\), \(\delta=1\), \(\gamma=0.7\).

After scoring: keep \(\max(2,\lceil 0.45 K\rceil)\) seen and the rest unseen.

### O2 APRR (`lib/research/aprr.ts`)

\[
P(a_j|a_i,q)\propto W_{ij}^{\alpha}\,\eta_{ij}^{\beta}\,\psi_j(q)^{\gamma}
\]

\(\eta_{ij}=\mathrm{cosine}(e_i,e_j)\), \(\psi_j=\mathrm{cosine}(e_q,e_j)\) (hashed 32-d embeddings).

\[
W\leftarrow (1-\lambda)W + \kappa\cdot\mathrm{reward}\cdot\frac{1}{L^2}\cdot\frac{1}{\mathrm{lat_{norm}}},\quad W\in[10^{-3},20],\ W_0=0.1
\]

\(\alpha=2\), \(\beta=1\), \(\gamma=2.5\), \(\lambda=0.005\), \(\kappa=5\), \(\varepsilon=0\) in this lab (GitHub default \(0.15\)), \(\mathrm{maxHops}=4\). Reward \(+1\) live success / \(-0.05\) failure.

Assignment: \(\mathrm{pref}=1\) if category matches else \(0.12\); \(+0.35\) if `tool_executor` and live; \(+0.2\) if `agriculture_analyst` and Agriculture. Keep \(\mathrm{pref}>0.2\), else fall back to SATR #1. Hop 0 is always `agriculture_analyst`.

### O3 MNCD (`lib/research/mncd.ts`)

\[
s = 0.45\frac{\mathrm{score}}{|\mathrm{score}|+2} + 0.35\,\mathrm{overlap}(q,\mathrm{tool}\oplus\mathrm{args}) + \mathrm{liveBoost} - 0.05\cdot\mathrm{rankIndex}
\]

\(\mathrm{liveBoost}=0.25\cdot 1[\mathrm{liveExecutable}]+0.20\cdot 1[\mathrm{id}=\mathrm{preferredLiveToolId}(q)]\).

\[
\mathrm{tally}(\mathrm{tool})=\sum_a w_a s_a(\mathrm{tool})\qquad\text{(score-sum, not Borda)}
\]

\(w=\mathrm{success}/(1+\mathrm{latencyMs}/1000)\), EMA \(\alpha=0.3\), cold-start success \(0.8\), lat \(80\) ms so \(w=0.7407\). Gossip fanout \(=3\), rounds \(=2\), distress \(\tau=0.55\).

Execute **only** live Agriculture UUIDs. Catalog-only ToolBench tools are ranking-only. If no live winner, force `preferredLiveToolId(q)` (rainfall / land-use / horticulture / fertilizer / production / else mandi).

### O4 FCNP (`lib/research/fcnp.ts`)

Edge if cosine \(\ge 0.12\). Kirchhoff: \(Lp=I\) (grounded sink), \(Q_{ij}=|D_{ij}(p_i-p_j)|\).

\[
D_{ij}(t+1)=(1-\mu)D_{ij}+\alpha |Q_{ij}|^{\gamma}
\]

\(\mu=0.1\), \(\alpha=0.5\), \(\gamma=1.2\). Hybrid tiers: keep top 35% verbatim, next 20% extractive-summarize (\(\le 40\) tokens), rest drop. **Pinned live citations and the user query are never evicted.** `session.memory = retained[:24]` mixes into the next SATR \(s_{\mathrm{base}}\).

---

## Worked example A — one ToolBench datum

### What is on disk vs what is ranked

`data/toolbench/queries.test.jsonl` qid **6491** is a RapidAPI aircraft-tracking instruction (gold docs 4308–4317). This lab never GET those endpoints. Off-sector tools (flights, cricket, movies) are stripped from the catalog.

The ranking-library analogue actually scored here is the ToolBench-schema Agriculture tool:

| Field | Value |
|---|---|
| Tool id | `tb.agri.soil_health` |
| Name | Soil Health Card Lookup |
| Source | `toolbench` (RapidAPI-Agriculture schema) |
| liveExecutable | **false** |
| Query | What is the soil pH and recommended fertilizer dose for a farm village? |

Same ToolLLM-style (query, tool schema) pair; different execution contract.

### O1 SATR

Cold start: all session terms are 0, so \(s(a)=z(s_{\mathrm{base}})\).

| Rank | Tool | \(s_{\mathrm{base}}\) | \(s\) | Live? |
|---|---|---|---|---|
| 1 | `tb.agri.soil_health` | 18.0753 | **5.3978** | no |
| 2 | `karnataka::shc_karnataka` | 6.0728 | 1.3985 | no |
| 3 | `tb.map.geocode_village` | 4.4982 | 0.8738 | no |
| 4 | `datagov.fertilizer` | 3.6891 | 0.6042 | **yes** |

### O2 APRR

\(W_{ij}=0.1\), \(\varepsilon=0\). Sampled path:

`agriculture_analyst` → `schema_planner` (\(p=0.7263\)) → `retrieval_specialist` (\(p=0.9481\)).

Hop 0 (Agriculture match) gets soil_health, SHC Karnataka, village geocoder. `schema_planner` and `retrieval_specialist` categories are not Agriculture, so \(\mathrm{pref}=0.12<0.2\) and both fall back to SATR #1 = soil_health.

### O3 MNCD

Agent score for soil_health:

\[
0.45\cdot\frac{5.3978}{5.3978+2}=0.3284
\]

plus overlap on soil/fertilizer tokens → \(s=0.5995\). `liveBoost=0`.

Default peer \(w=0.8/(1+80/1000)=0.7407\). Unanimous tally:

\[
\mathrm{tally}(\texttt{tb.agri.soil\_health})=3\cdot 0.7407\cdot 0.5995=1.332
\]

Not liveExecutable. `preferredLiveToolId` matches `fertilizer` → force

`GET https://api.data.gov.in/resource/2e0e6c04-97f2-456b-9309-bf605650cb11`

**Live result (not RapidAPI):** 44/44 fertilizer-subsidy rows. Example: 2002–2003 Indigenous Urea subsidy = 7790 Rs crore.

### O4 FCNP

10 context elements → retained 6, evicted 4, pinned 3 (query, live observation, live citation). Consensus notes dropped. Memory written back to SATR.

### If the literal qid=6491 aircraft row is piped in

SATR still ranks Agriculture tools (`karnataka::agmarknet_ka` \(s=3.103\)). MNCD executes live mandi / horticulture UUIDs, **never RapidAPI aircraft**. That is the sector lock.

---

## Worked example B — data.gov.in AGMARKNET

Query: **What is the current mandi price of wheat in Punjab?**

Citation: Current Daily Price of Various Commodities from Various Markets (Mandi), Ministry of Agriculture and Farmers Welfare, data.gov.in.

UUID: `9ef84268-d588-465a-a308-a864a43d0070`. Elastic `limit` capped at 10 000.

Slot-fill: `state=Punjab`, `commodity=Wheat`. `preferredLiveToolId` → `datagov.mandi_prices`.

### O1 SATR

| Rank | Tool | \(s\) | Live? |
|---|---|---|---|
| 1 | `karnataka::agmarknet_ka` | 3.7284 | yes (same UUID) |
| 2 | `datagov.mandi_prices` | 3.0453 | yes, preferred |
| 3 | `datagov.msp` | 2.3101 | ranking-only |
| 4 | `tb.data.search_catalog` | 0.7433 | ranking-only |

### O2 APRR

Path: `agriculture_analyst` → `schema_planner` (\(p=0.5382\)) → `tool_executor` (\(p=0.6580\), terminal stop).

Hop 0: Karnataka mandi, national mandi, MSP. Hop 2 leftover live tool: `datagov.crop_production`.

### O3 MNCD

`datagov.mandi_prices` agent-score \(0.787\) (liveBoost \(0.45\)). `karnataka::agmarknet_ka` \(0.7789\).

Score-sum winner: `karnataka::agmarknet_ka` tally \(=2\cdot 0.7407\cdot 0.7789=1.154\).

**Live GET (07 September 2026):** 10 000 AGMARKNET arrivals. **0 Wheat rows in Punjab today.** 479 other live Punjab rows. Live Wheat in 133 rows from Madhya Pradesh, Rajasthan, Uttar Pradesh, Gujarat, Maharashtra, West Bengal, Chhattisgarh. Shown mean modal **Rs 2593/quintal**. Example live Punjab row: Bhindi at Dera Baba Nanak APMC, Gurdaspur, modal Rs 828/quintal (07/09/2026). **No dummy Punjab-wheat price.**

### O4 FCNP

10 spans → keep 7, drop 3, pin the AGMARKNET citation. \(W\) updated with \(\kappa\cdot 1/L^2/\mathrm{lat}\) on the hop path. Next SATR is session-conditioned.

---

## Files

- Formulas: `lib/research/formulas.ts`
- Runtime: `lib/research/satr.ts`, `aprr.ts`, `mncd.ts`, `fcnp.ts`, `pipeline.ts`, `datagov.ts`
- Traces: `lib/research/walkthrough.ts`
- UI: `/walkthrough`
- Slides: methodology 08f–08h in `lib/research/slides.ts`
