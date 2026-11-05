# Product brief: governed farm-advisory copilot (built on ACRS)

## Is this a problem someone pays for now?

| Test | Evidence |
|---|---|
| Somebody pays for it now | Government of India runs Kisan Call Centres: 35.22 lakh calls received in 2022-23 (Lok Sabha reply). The Ministry announced chatbot and AI/ML decision-support upgrades. Kisan e-Mitra (PM-KISAN) handles about 13k queries a day and is being extended to PMFBY, Kisan Credit Card and Soil Health Card. Agri-input companies, FPOs and crop insurers also run farmer helplines. |
| The answer's shape is unknown | Which queries are safe to auto-answer, at what error, in which language, is exactly what ACRS measures (certified θ\*, coverage, review rate). |
| A named person benefits | the Farm Tele Advisor (fewer repetitive informational calls, every answer pre-researched with evidence) and the farmer (faster, sourced answers) |
| Weeks, not quarters | shadow mode on historical KCC queues needs no integration: replay, compare with the expert answer, write nothing |

## What is sold

A copilot for helpline and advisory desks, not a replacement for advisors:
- **auto-answers** only informational, read-only, certified queries (weather, mandi price, varieties, seeds), each with cited government data;
- **prepares and recommends** dose and entitlement answers (pest control, fertilizer, schemes), which a named advisor approves, keeping accountability with the advisor;
- **proves afterwards** who decided what, under which policy version (hash-chained log), with a kill switch and a pinned release.

## Buyers and route

| Buyer | Route | Pitch in their terms |
|---|---|---|
| State agriculture departments / KCC operators | GeM listing; state innovation challenges; IndiaAI and Bhashini partnerships | call-handling capacity, answer consistency, audit trail |
| FPOs and agri-input companies | direct SaaS per advisor seat or per answered query | fewer repeat calls; advisor time on hard cases |
| Crop insurers (PMFBY intermediaries) | integration project | claim-query deflection with an evidence trail |

## Pilot (staged, each stage earns the next)

1. **Shadow (2–4 weeks):** replay a district's historical KCC queues. Report agreement with `KccAns` for auto-eligible queries, certified θ\* and coverage. Write nothing.
2. **Live with approval:** every answer goes to an advisor. Measure the approval rate per query type.
3. **Narrow auto-execution:** only for query types whose measured error is under α. Any new query type takes the separately reviewed path.

## Compliance to design in

- **DPDP Act 2023:** farmer phone numbers and locations are personal data. Minimise them, and log decisions without the phone number.
- **Government data licence (GODL-India)** for data.gov.in sources.
- Advisory answers on pesticides must follow label-approved uses (Insecticides Act, CIB&RC). This is why dose answers are recommend-only.

Commercialisation can run through Abigail Creations. Check the university's IP policy on PhD outputs with the supervisor before any licence is signed.
