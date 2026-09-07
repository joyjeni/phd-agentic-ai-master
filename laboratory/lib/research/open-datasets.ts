/**
 * What Indian researchers actually use next to ToolBench-style tool ranking.
 *
 * ToolBench (Qin et al., ICLR 2024) is RapidAPI schemas + trajectories.
 * Those keys are not redistributable, so "real inference" cannot mean
 * executing ToolBench's 16k endpoints. Indian agri / GovTech papers instead
 * execute Ministry APIs on data.gov.in and treat ToolBench as the ranking
 * library. This file records that split. Nothing here is a dummy table.
 */

export type DatasetRole = "live-tool" | "query-corpus" | "eval-only" | "do-not-use";

export type SurveyedDataset = {
  id: string;
  name: string;
  role: DatasetRole;
  usedBy: string;
  how: string;
  resourceId?: string;
  url: string;
  wired: boolean;
  notes: string;
};

export const TOOLBENCH_REALITY = {
  title: "ToolBench cannot supply live RapidAPI inference",
  body:
    "Qin et al. (ToolLLM / ToolBench, ICLR 2024) collected 16,464 RapidAPI endpoints. Live keys are not redistributable. The common follow-on benchmark, StableToolBench (Guo, Zhicheng et al., Findings of ACL 2024), replaces those calls with a cache or an LLM simulator. That is useful for ranking experiments and the opposite of this lab's rule: Agriculture answers must come from live official APIs.",
};

export const SURVEYED_DATASETS: SurveyedDataset[] = [
  {
    id: "agmarknet",
    name: "AGMARKNET daily mandi prices",
    role: "live-tool",
    usedBy:
      "Guo, Woodruff & Yadav, AAAI 2020 (PECAD, doi:10.1609/aaai.v34i08.7039); Ladhar et al., ACM JCSS 2023 (farmer-collective market intelligence, doi:10.1145/3609262); Smart-Kheti and related Indian agri-ML systems.",
    how: "Daily wholesale min/max/modal prices at Indian APMCs. This is the standard live market-price API on data.gov.in.",
    resourceId: "9ef84268-d588-465a-a308-a864a43d0070",
    url: "https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi",
    wired: true,
    notes: "Executed live in this lab. No snapshot fallback.",
  },
  {
    id: "crop-production",
    name: "District-wise, season-wise crop production (from 1997)",
    role: "live-tool",
    usedBy:
      "Smart-Kheti and many Indian crop-yield papers (~246k district-season-crop rows, 1997–).",
    how: "Area and production by state, district, season, crop, year. Filterable on data.gov.in.",
    resourceId: "35be999b-0208-4354-b557-f6ca9a5355de",
    url: "https://www.data.gov.in/resource/district-wise-season-wise-crop-production-statistics-1997",
    wired: true,
    notes: "Executed live. Historical series, not today's arrivals.",
  },
  {
    id: "horticulture",
    name: "State-wise horticulture area and production",
    role: "live-tool",
    usedBy: "Indian horticulture statistics papers using MoA/NHB tables republished on data.gov.in.",
    how: "State/UT fruit area and production time slices.",
    resourceId: "a2b43dcc-9cd2-4601-b183-3e859624dea4",
    url: "https://data.gov.in",
    wired: true,
    notes: "Executed live (38 rows).",
  },
  {
    id: "fertilizer-subsidy",
    name: "Year-wise fertilizer product subsidy",
    role: "live-tool",
    usedBy: "Input-policy and agri-economics work on the fertilizer subsidy bill.",
    how: "Annual subsidy (Rs crore) by product such as indigenous urea.",
    resourceId: "2e0e6c04-97f2-456b-9309-bf605650cb11",
    url: "https://data.gov.in",
    wired: true,
    notes: "Executed live. This is subsidy, not plot-level NPK tests.",
  },
  {
    id: "imd-rainfall",
    name: "All-India area-weighted monthly/seasonal/annual rainfall",
    role: "live-tool",
    usedBy:
      "Samarth-style agri+climate Q&A; yield papers that join production with IMD rainfall from data.gov.in (not RapidAPI weather).",
    how: "IMD all-India rainfall (mm) by year and month, 1901 onward, on the OGD platform.",
    resourceId: "8196f6cc-83ff-4b56-8581-2630de9d4a5e",
    url: "https://www.data.gov.in/catalog/rainfall-india",
    wired: true,
    notes:
      "Executed live. District nowcast lives on api.imd.gov.in and timed out from this environment, so it is not wired.",
  },
  {
    id: "land-use",
    name: "Classified area under land-use statistics (LUS)",
    role: "live-tool",
    usedBy: "Agricultural census / land-use change studies on data.gov.in LUS tables.",
    how: "District-year land classification including non-agricultural use, area in hectares.",
    resourceId: "8a3761be-1b0b-423d-a907-1f99870b365a",
    url: "https://data.gov.in",
    wired: true,
    notes: "Executed live (~61k rows; fetched with filters, never dumped wholesale).",
  },
  {
    id: "kcc",
    name: "Kisan Call Centre farmer queries",
    role: "query-corpus",
    usedBy:
      "Indic-KCC-Agri-Advisory-Benchmark (sthanika-ai, 2026); KisanSLM and other Indian agri-NLP work. Source: MoA KCC transcripts under GODL-India.",
    how: "Real farmer questions and FTA answers. Use as the instruction distribution for ToolBench-style ranking, then dispatch live data.gov.in tools. Do not treat 2012 district-month OGD slices as a national live advisory API.",
    url: "https://huggingface.co/datasets/sthanika-ai/Indic-KCC-Agri-Advisory-Benchmark",
    wired: false,
    notes:
      "data.gov.in publishes thousands of district-month KCC files, not one transcript API. The HF benchmark is gated (privacy + leakage). This lab does not ingest those transcripts.",
  },
  {
    id: "bhashabench-krishi",
    name: "BharatGen BhashaBench-Krishi",
    role: "eval-only",
    usedBy: "BharatGen (DST-supported Indian foundation-model programme), Oct 2025.",
    how: "15,405 English/Hindi agri exam questions. Knowledge eval, not a callable market API.",
    url: "https://bharatgen.com/datasets/",
    wired: false,
    notes: "Use later for SATR/QA eval. Not a live tool.",
  },
  {
    id: "msp",
    name: "Minimum support prices",
    role: "eval-only",
    usedBy: "Policy papers; often cited, rarely a single stable OGD UUID.",
    how: "No verified live MSP resource UUID was found on data.gov.in in this pass.",
    url: "https://data.gov.in",
    wired: false,
    notes: "Ranking-only in the catalog. Live prices come from AGMARKNET, not invented MSP rows.",
  },
  {
    id: "stabletoolbench",
    name: "StableToolBench / MirrorAPI",
    role: "do-not-use",
    usedBy: "Tool-learning papers that need a replayable RapidAPI stand-in.",
    how: "Local cache or LLM-simulated tool responses.",
    url: "https://github.com/THUNLP-MT/StableToolBench",
    wired: false,
    notes: "Explicitly simulated. Rejected for this Agriculture lab.",
  },
  {
    id: "kaggle-npk",
    name: "Kaggle crop-recommendation / NPK tables",
    role: "do-not-use",
    usedBy: "Many Indian student agri-ML reports; not an official MoA feed.",
    how: "Static CSVs, often synthetic NPK/pH.",
    url: "https://www.kaggle.com",
    wired: false,
    notes: "Not wired. Would violate the live data.gov.in-only rule.",
  },
];

export function datasetsByRole(role: DatasetRole): SurveyedDataset[] {
  return SURVEYED_DATASETS.filter((item) => item.role === role);
}
