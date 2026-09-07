import { COLLEGE, STUDENT_DETAILS } from "./college";
import {
  INTEGRATED_METHODOLOGY,
  OBJECTIVES,
  OVERALL_OBJECTIVE,
} from "./objectives";

export type SlideDiagram =
  | "none"
  | "sota"
  | "e2e"
  | "satr"
  | "aprr"
  | "mncd"
  | "fcnp"
  | "integrated"
  | "compare-satr"
  | "compare-aprr"
  | "compare-mncd"
  | "compare-fcnp";

export type Slide = {
  id: string;
  section: string;
  title: string;
  kind?: "contents" | "standard";
  /** Short lead-in shown under the title. */
  body?: string;
  /** Additional paragraphs (literature / definition). */
  paragraphs?: string[];
  bullets?: string[];
  footnote?: string;
  diagram?: SlideDiagram;
  table?: { headers: string[]; rows: string[][] };
};

export type ContentsItem = { n: string; title: string; slideId: string };

const REQUIRED_SECTIONS = [
  "Introduction",
  "Literature Review",
  "Summary of Literature Review",
  "Identified Research Problem",
  "Research Title & Aim",
  "Research Objectives",
  "Research Questions",
  "Research Methodology",
  "Conclusion",
] as const;

/**
 * MSRUAS / FET research-proposal deck for Jenisha T.
 * Required academic outline: Introduction → Literature Review → Summary of
 * Literature Review → Identified Research Problem → Research Title & Aim →
 * Research Objectives → Research Questions → Research Methodology (per
 * objective) → Conclusion.
 *
 * Proposal-stage discipline: no NDCG, latency, token, or accuracy targets.
 */
export const SLIDES: Slide[] = [
  {
    id: "title",
    section: "Title",
    title: "Adaptive Context Reasoning System (ACRS)",
    body: COLLEGE.subtitle,
    bullets: [
      `Presented By: ${COLLEGE.scholar}`,
      `(Reg. No. ${COLLEGE.registerNo})`,
      `Supervisor: ${COLLEGE.supervisor}`,
      COLLEGE.departmentLine,
      COLLEGE.facultyLine,
    ],
    footnote:
      "Proposal stage. No empirical performance claims. Live Indian Open Government Data is a methodological constraint, not a result.",
  },
  {
    id: "student",
    section: "Research student details",
    title: "Research student details",
    body: "Attribute and Details as recorded for the FET research-proposal template.",
    table: {
      headers: ["Attribute", "Details"],
      rows: STUDENT_DETAILS.map((row) => [row.field, row.record]),
    },
  },
  {
    id: "contents",
    section: "Contents",
    title: "Contents",
    kind: "contents",
    body: "Nine required sections. Research Methodology is expanded for each objective (O1 SATR, O2 APRR, O3 MNCD, O4 FCNP) plus the integrated SATR → APRR → MNCD → FCNP loop. Objective order is SATR → APRR → MNCD → FCNP (not SMART).",
  },
  {
    id: "introduction",
    section: "Introduction",
    title: "Introduction",
    body: "This proposal treats multi-agent LLM systems as a computer-science systems problem: not a new foundation model, but a missing orchestration layer between session memory, specialist routing, live tools, and context growth.",
    paragraphs: [
      "Wu et al. introduce AutoGen as a conversation-driven programming framework in which agents exchange messages until a stopping condition (ICLR 2024 LLM Agents Workshop; COLM 2024, arXiv:2308.08155). Hong et al. encode Standard Operating Procedures into MetaGPT so that a software-company metaphor produces structured artefacts (ICLR 2024). Qian et al. organise ChatDev as a chat-chain of organisational roles (ACL 2024). Li et al. study communicative agents in CAMEL (NeurIPS 2023).",
      "Tool use is a parallel line. Qin et al. release ToolLLM / ToolBench: 16k+ REST APIs, a DFSDT planner, and ToolEval (ICLR 2024). Zheng et al. add ToolRerank over ToolLLM candidates (LREC-COLING 2024). Learned routers (RouteLLM, MasRouter, PILOT) pick models or collaboration modes. LLMLingua shortens prompts by token importance (EMNLP 2023).",
      "Those stacks still leave four operational surfaces underspecified as one contract: session–tool fusion, a training-free specialist posterior, fail-loud live Indian Open Government Data, and a mesh prune that writes a residue back into retrieval.",
      "ACRS is proposed as that missing layer. The integration order is SATR → APRR → MNCD → FCNP. The live demonstration corpus is Agriculture on data.gov.in. This deck does not claim a leaderboard number.",
    ],
  },
  {
    id: "literature-mas",
    section: "Literature Review",
    title: "Literature Review",
    body: "Multi-agent systems literature. What the cited papers actually contribute, and what they leave open for a structural orchestration layer.",
    paragraphs: [
      "Wu et al., AutoGen (COLM 2024 / ICLR 2024 workshop): conversation as the programming model. Gap: messages, not (toolId, score, live citation), are the unit of coordination.",
      "Hong et al., MetaGPT (ICLR 2024): authored SOPs reduce role drift. Gap: the graph of who speaks next is written by the designer, not updated from session-local affinity after a live tool call.",
      "Qian et al., ChatDev (ACL 2024): organisational chat-chain for software artefacts. Gap: the environment is a codebase, not a ministry API.",
      "Li et al., CAMEL (NeurIPS 2023): inception prompting and communicative role-play. Gap: no first-class vote over tool identifiers backed by Open Government Data.",
      "Taken together, these systems prove conversation, SOPs, software roles, and inception prompting. None of them is a session–route–mesh–prune loop over live Indian OGD.",
    ],
  },
  {
    id: "literature-tools",
    section: "Literature Review",
    title: "Literature Review — tools, routing, and compression",
    body: "Tool learning, learned routers, and prompt compression are real literatures. They are not substitutes for the four ACRS modules.",
    paragraphs: [
      "Qin et al., ToolLLM / ToolBench (ICLR 2024): SBERT API retriever, DFSDT planner, ToolEval. Zheng et al., ToolRerank (LREC-COLING 2024): contrastive rerank of ToolLLM candidates. Gap: both are turn-amnesic; they do not fuse which tools actually fired into the next rank.",
      "Ong et al., RouteLLM (2024); Yue et al., MasRouter (ACL 2025); Panda et al., PILOT (Findings of EMNLP 2025): learned or bandit routers over LLM SKUs or collaboration modes. Gap: they do not maintain a training-free Dirichlet–Thompson posterior over named tool specialists.",
      "Jiang et al., LLMLingua (EMNLP 2023): token-importance prompt compression. Gap: compression does not prune a mesh by conductance or write a residue back into retrieval.",
      "Guo, Woodruff & Yadav, PECAD (AAAI 2020): AGMARKNET as a decision-support input for price prediction. Gap: a crop-yield / price CNN is not a multi-agent live-OGD loop. Cited as domain precedent, not as a baseline to beat.",
    ],
  },
  {
    id: "literature-summary",
    section: "Summary of Literature Review",
    title: "Summary of Literature Review",
    body: "Qualitative map only. This table names the gap each family leaves for ACRS; it does not claim a percentage improvement over any baseline.",
    table: {
      headers: ["Literature family", "What it already does", "What ACRS still has to add"],
      rows: [
        [
          "MAS frameworks (AutoGen, MetaGPT, ChatDev, CAMEL)",
          "Conversation, SOPs, software roles, inception prompting",
          "A closed session–route–mesh–prune contract, not another chat runtime",
        ],
        [
          "Tool learning (ToolLLM / ToolBench / ToolRerank)",
          "Large-scale tool-use corpus and ToolEval-style ranking protocol",
          "Session-fused ranking plus live Indian OGD execution (not RapidAPI replay)",
        ],
        [
          "Learned routers (RouteLLM, MasRouter, PILOT)",
          "Train or bandit-route over model SKUs or collaboration modes",
          "Training-free Dirichlet–Thompson posterior over named specialists",
        ],
        [
          "Prompt compression (LLMLingua)",
          "Shorten tokens before the LLM",
          "Prune a mesh by conductance and write the residue back into SATR",
        ],
        [
          "Indian agriculture DSS (PECAD)",
          "Shows AGMARKNET as a real decision-support input",
          "Live, fail-loud OGD inside a multi-agent loop — not a crop-yield model to beat",
        ],
      ],
    },
  },
  {
    id: "problem",
    section: "Identified Research Problem",
    title: "Identified Research Problem",
    body: "Five architectural gaps. Four named objectives. One integration contract. Closing a gap is evidenced by a runnable loop and citable equations, not by a promised leaderboard number.",
    bullets: [
      "G1 — Turn-amnesic retrieval. ToolLLM SBERT (Qin et al., ICLR 2024) and ToolRerank (Zheng et al., LREC-COLING 2024) score each query independently. Session co-activation is unused. → Objective 1 SATR.",
      "G2 — Routers pick models or authored SOPs, not tool-specialist agents with a training-free posterior. RouteLLM / PILOT / MasRouter / MetaGPT. → Objective 2 APRR.",
      "G3 — MAS communication is star, SOP, or chat. No mesh vote whose object is a live tool identifier. AutoGen, MetaGPT, ChatDev, CAMEL. → Objective 3 MNCD.",
      "G4 — Prompt compressors (LLMLingua, EMNLP 2023) do not write live citations back into retrieval. → Objective 4 FCNP.",
      "G5 — No closed four-stage contract executed on journal-publishable Indian OGD (data.gov.in / AGMARKNET / IMD / DES), with ToolBench used only as a ranking library. → Integrated ACRS.",
    ],
    footnote:
      "Gaps are architectural. This deck does not convert them into NDCG, latency, or accuracy targets.",
  },
  {
    id: "title-aim",
    section: "Research Title & Aim",
    title: "Research Title & Aim",
    body: COLLEGE.title,
    bullets: [
      `Aim. ${OVERALL_OBJECTIVE.statement}`,
      "Scope of the title. Adaptive = session-conditioned ranking and routing. Context = fused session memory plus mesh residue. Reasoning = specialist posterior plus score-sum consensus. System = four named modules on one contract.",
      "What the title is not. It is not a new LLM, not a crop-yield model, and not a claim that ACRS already outperforms ToolLLM, MasRouter, or LLMLingua on a published leaderboard.",
      "Domain lock for the live loop. Agriculture on data.gov.in (AGMARKNET and related verified UUIDs). Other sectors stay out of the inference path in this proposal.",
      "Integration order that the aim implies. SATR (memory) → APRR (who acts) → MNCD (live evidence) → FCNP (prune and write back).",
    ],
  },
  {
    id: "objectives",
    section: "Research Objectives",
    title: "Research Objectives",
    body: "Four named modules. Each row is a thesis-sized design claim. Metric targets are deferred until a protocol is frozen.",
    table: {
      headers: ["ID", "Objective", "What will be designed"],
      rows: OBJECTIVES.map((o) => [o.code, o.title, o.journalDefinition]),
    },
  },
  {
    id: "o1-satr",
    section: "Research Objectives",
    title: "Objective 1 — SATR",
    body: OBJECTIVES[0].journalDefinition,
    paragraphs: [
      `SOTA. ${OBJECTIVES[0].sota.papers.join(" ")} Pipeline: ${OBJECTIVES[0].sota.pipeline}`,
      `Gap. ${OBJECTIVES[0].sota.gap}`,
      `Novelty. ${OBJECTIVES[0].novelty.join(" ")}`,
    ],
    diagram: "compare-satr",
    footnote: "Repository: github.com/joyjeni/session-aware-toolbench-rerank",
  },
  {
    id: "o2-aprr",
    section: "Research Objectives",
    title: "Objective 2 — APRR",
    body: OBJECTIVES[1].journalDefinition,
    paragraphs: [
      `SOTA. ${OBJECTIVES[1].sota.papers.join(" ")} Pipeline: ${OBJECTIVES[1].sota.pipeline}`,
      `Gap. ${OBJECTIVES[1].sota.gap}`,
      `Novelty. ${OBJECTIVES[1].novelty.join(" ")}`,
    ],
    diagram: "compare-aprr",
    footnote: "Repository: github.com/joyjeni/aprr-multi-agent-routing",
  },
  {
    id: "o3-mncd",
    section: "Research Objectives",
    title: "Objective 3 — MNCD",
    body: OBJECTIVES[2].journalDefinition,
    paragraphs: [
      `SOTA. ${OBJECTIVES[2].sota.papers.join(" ")} Pipeline: ${OBJECTIVES[2].sota.pipeline}`,
      `Gap. ${OBJECTIVES[2].sota.gap}`,
      `Novelty. ${OBJECTIVES[2].novelty.join(" ")}`,
    ],
    diagram: "compare-mncd",
    footnote: "Repository: github.com/joyjeni/mncd-mesh-agents",
  },
  {
    id: "o4-fcnp",
    section: "Research Objectives",
    title: "Objective 4 — FCNP",
    body: OBJECTIVES[3].journalDefinition,
    paragraphs: [
      `SOTA. ${OBJECTIVES[3].sota.papers.join(" ")} Pipeline: ${OBJECTIVES[3].sota.pipeline}`,
      `Gap. ${OBJECTIVES[3].sota.gap}`,
      `Novelty. ${OBJECTIVES[3].novelty.join(" ")}`,
    ],
    diagram: "compare-fcnp",
    footnote: "Repository: github.com/joyjeni/fcnp-context-pruning",
  },
  {
    id: "questions",
    section: "Research Questions",
    title: "Research Questions",
    body: "Each question is paired with one objective. Answers will be empirical after a protocol is frozen; this slide does not pre-commit scores.",
    bullets: OVERALL_OBJECTIVE.questions.map((q, i) => {
      const obj = OBJECTIVES[i];
      return `RQ${i + 1}. ${q}  →  addressed by ${obj.code} (${obj.title}).`;
    }),
  },
  {
    id: "method-overview",
    section: "Research Methodology",
    title: "Research Methodology",
    body: "One methodology per objective, then one integrated protocol. Proposal-stage: design the loop and freeze the protocol; do not pre-commit a leaderboard.",
    bullets: [
      "O1 SATR — fused session ranking against a ToolBench-style library. Live mandi rows are not SATR’s job.",
      "O2 APRR — training-free Dirichlet–Thompson posterior over named specialists. Learned routers are a future bake-off, not the implementation.",
      "O3 MNCD — gossip + score-sum consensus, then live data.gov.in GET on verified Agriculture UUIDs. Fail loud. No dummy prices.",
      "O4 FCNP — Kirchhoff / Physarum-inspired conductance prune with write-back into SATR. Not LLMLingua token deletion.",
      "Integrated contract. SATR → APRR → MNCD → FCNP must run in that order on one user turn. Skipping MNCD or FCNP is an incomplete run.",
      "What will not appear in this proposal. Promised retrieval scores, latency targets, consensus percentages, or token-reduction ratios.",
    ],
    diagram: "e2e",
  },
  {
    id: "method-satr",
    section: "Research Methodology",
    title: "Research Methodology — O1 SATR",
    body: "How session-aware ranking will be designed and later evaluated.",
    bullets: [...OBJECTIVES[0].methodology],
  },
  {
    id: "method-aprr",
    section: "Research Methodology",
    title: "Research Methodology — O2 APRR",
    body: "How the specialist posterior will be designed. No win-rate or millisecond target is claimed at proposal stage.",
    bullets: [...OBJECTIVES[1].methodology],
  },
  {
    id: "method-mncd",
    section: "Research Methodology",
    title: "Research Methodology — O3 MNCD",
    body: "How live Indian OGD and score-sum consensus will be executed. PECAD is a domain precedent, not a baseline to beat.",
    bullets: [...OBJECTIVES[2].methodology],
  },
  {
    id: "method-fcnp",
    section: "Research Methodology",
    title: "Research Methodology — O4 FCNP",
    body: "How mesh pruning will be designed. No token-reduction ratio is claimed at proposal stage.",
    bullets: [...OBJECTIVES[3].methodology],
  },
  {
    id: "method-integrated",
    section: "Research Methodology",
    title: "Research Methodology — integrated loop",
    body: "Closed contract SATR → APRR → MNCD → FCNP → SATR. The novelty is the loop and the data contract, not a claimed accuracy.",
    bullets: [...INTEGRATED_METHODOLOGY],
    diagram: "integrated",
    footnote: "Master repository: github.com/joyjeni/phd-agentic-ai-master",
  },
  {
    id: "conclusion",
    section: "Conclusion",
    title: "Conclusion",
    body: "ACRS is proposed as a structural orchestration layer. The contribution is the closed loop and the four named gaps — not a pre-committed leaderboard.",
    bullets: [
      "The literature (AutoGen, MetaGPT, ChatDev, CAMEL, ToolLLM, MasRouter, RouteLLM, PILOT, LLMLingua, PECAD) establishes conversation, tools, learned routing, and prompt compression. It does not establish SATR → APRR → MNCD → FCNP as one contract over live Indian OGD.",
      "The identified problem is five gaps: G1 session–tool fusion, G2 training-free specialist posterior, G3 live fail-loud Indian OGD, G4 conductance prune with write-back, G5 missing integration layer.",
      "The aim is to design that layer. Four objectives (SATR, APRR, MNCD, FCNP) and four research questions map onto it.",
      "Methodology is specified per objective: ToolBench as ranking library; Dirichlet–Thompson routing; verified data.gov.in UUIDs with score-sum; Physarum-inspired prune with SATR write-back. Metric numbers are deferred.",
      "Next step after approval. Freeze evaluation protocols, implement the closed loop, and report whatever the measurements show — including negative results.",
    ],
  },
  {
    id: "refs-1",
    section: "References 1/3",
    title: "References (1/3) — multi-agent systems and tool learning",
    bullets: [
      "Wu, Q., Bansal, G., Zhang, J., Wu, Y., Li, B., Zhu, E., Jiang, L., Zhang, X., Zhang, S., Liu, J., Awadallah, A. H., White, R. W., Burger, D., and Wang, C. AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation. ICLR 2024 Workshop on Large Language Model (LLM) Agents; also COLM 2024. arXiv:2308.08155.",
      "Hong, S., Zhuge, M., Chen, J., Zheng, X., Cheng, Y., Wang, J., Zhang, C., Wang, Z., Yau, S. K. S., Lin, Z., Zhou, L., Ran, C., Xiao, L., Wu, C., and Schmidhuber, J. MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework. ICLR 2024.",
      "Li, G., Hammoud, H. A. A. K., Itani, H., Khizbullin, D., and Ghanem, B. CAMEL: Communicative Agents for “Mind” Exploration of Large Language Model Society. NeurIPS 2023.",
      "Qian, C., Liu, W., Liu, H., Chen, N., Dang, Y., Li, J., Yang, C., Chen, W., Su, Y., Cong, X., Xu, J., Li, D., Liu, Z., and Sun, M. ChatDev: Communicative Agents for Software Development. ACL 2024. arXiv:2307.07924.",
      "Qin, Y., Liang, S., Ye, Y., Zhu, K., Yan, L., Lu, Y., Lin, Y., Cong, X., Tang, X., Qian, B., Zhao, S., Hong, L., Tian, R., Xie, R., Zhou, J., Gerstein, M., Li, D., Liu, Z., and Sun, M. ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs. ICLR 2024.",
      "Zheng, Y., Li, P., Liu, W., Liu, Y., Luan, J., and Wang, B. ToolRerank: Adaptive and Hierarchy-Aware Reranking for Tool Retrieval. LREC-COLING 2024.",
    ],
  },
  {
    id: "refs-2",
    section: "References 2/3",
    title: "References (2/3) — routing, compression, reasoning, biology",
    bullets: [
      "Ong, I., Almahairi, A., Wu, V., Chiang, W.-L., Wu, T., Gonzalez, J. E., Kadous, M. W., and Stoica, I. RouteLLM: Learning to Route LLMs with Preference Data. arXiv:2406.18665, 2024.",
      "Panda, S., and co-authors. PILOT: Preference-informed LinUCB for routing among language models. Findings of EMNLP 2025.",
      "Yue, Y., Zhang, G., Liu, B., Wan, G., Wang, K., Cheng, D., and Qi, Y. MasRouter: Learning to Route LLMs for Multi-Agent Systems. ACL 2025 (long). doi:10.18653/v1/2025.acl-long.757.",
      "Jiang, H., Wu, Q., Lin, C.-Y., Yang, Y., and Qiu, L. LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models. EMNLP 2023.",
      "Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., Chi, E., Le, Q., and Zhou, D. Chain-of-Thought Prompting Elicits Reasoning in Large Language Models. NeurIPS 2022.",
      "Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., and Cao, Y. ReAct: Synergizing Reasoning and Acting in Language Models. ICLR 2023.",
      "Yao, S., Yu, D., Zhao, J., Shafran, I., Griffiths, T. L., Cao, Y., and Narasimhan, K. Tree of Thoughts: Deliberate Problem Solving with Large Language Models. NeurIPS 2023.",
      "Tero, A., Takagi, S., Saigusa, T., Ito, K., Bebber, D. P., Fricker, M. D., Yumiki, K., Kobayashi, R., and Nakagaki, T. Rules for Biologically Inspired Adaptive Network Design. Science, 2010. doi:10.1126/science.1177894.",
    ],
  },
  {
    id: "refs-3",
    section: "References 3/3",
    title: "References (3/3) — memory, tools, Indian agricultural data",
    bullets: [
      "Park, J. S., O’Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., and Bernstein, M. S. Generative Agents: Interactive Simulacra of Human Behavior. CHI 2023.",
      "Shinn, N., Cassano, F., Berman, E., Gopinath, A., Narasimhan, K., and Yao, S. Reflexion: Language Agents with Verbal Reinforcement Learning. NeurIPS 2023.",
      "Shen, Y., Song, K., Tan, X., Li, D., Lu, W., and Zhuang, Y. HuggingGPT: Solving AI Tasks with ChatGPT and its Friends in Hugging Face. NeurIPS 2023.",
      "Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., Cancedda, N., and Scialom, T. Toolformer: Language Models Can Teach Themselves to Use Tools. NeurIPS 2023.",
      "Guo, H., Woodruff, A., and Yadav, A. Improving Lives of Indebted Farmers Using Deep Learning: Predicting Agricultural Produce Prices Using Convolutional Neural Networks (PECAD). AAAI 2020. doi:10.1609/aaai.v34i08.7039. AGMARKNET scrape for price prediction; cited here as Indian OGD precedent, not as a baseline this proposal claims to beat.",
      "Government of India. Open Government Data Platform India (data.gov.in); AGMARKNET resource 9ef84268-d588-465a-a308-a864a43d0070; Directorate of Economics and Statistics crop production; IMD rainfall series; Government Open Data License — India (GODL-India).",
    ],
    footnote:
      "CrewAI is an engineering framework without a flagship peer-reviewed paper in this list; AutoGen and MetaGPT are the MAS citations.",
  },
  {
    id: "thanks",
    section: "Thank you",
    title: "Thank you",
    body: "Adaptive Context Reasoning System — a research programme, not a performance number.",
    bullets: [
      `Presented By: ${COLLEGE.scholar}`,
      `(Reg. No. ${COLLEGE.registerNo})`,
      `Supervisor: ${COLLEGE.supervisor}`,
      COLLEGE.departmentLine,
      COLLEGE.facultyLine,
      `${COLLEGE.email}`,
    ],
  },
];

/** High-level academic outline shown on the Contents slide (the nine required headings, with methodology expanded). */
export const OUTLINE: ContentsItem[] = [
  { n: "01", title: "Introduction", slideId: "introduction" },
  { n: "02", title: "Literature Review", slideId: "literature-mas" },
  { n: "03", title: "Summary of Literature Review", slideId: "literature-summary" },
  { n: "04", title: "Identified Research Problem", slideId: "problem" },
  { n: "05", title: "Research Title & Aim", slideId: "title-aim" },
  { n: "06", title: "Research Objectives", slideId: "objectives" },
  { n: "07", title: "Research Questions", slideId: "questions" },
  { n: "08", title: "Research Methodology", slideId: "method-overview" },
  { n: "08a", title: "Methodology — O1 SATR", slideId: "method-satr" },
  { n: "08b", title: "Methodology — O2 APRR", slideId: "method-aprr" },
  { n: "08c", title: "Methodology — O3 MNCD", slideId: "method-mncd" },
  { n: "08d", title: "Methodology — O4 FCNP", slideId: "method-fcnp" },
  { n: "08e", title: "Methodology — integrated loop", slideId: "method-integrated" },
  { n: "09", title: "Conclusion", slideId: "conclusion" },
];

export const REQUIRED_SECTION_TITLES: readonly string[] = REQUIRED_SECTIONS;

/** Clickable contents list = academic outline, not a 1:1 dump of every slide. */
export const CONTENTS: ContentsItem[] = OUTLINE;

export function slideById(id: string): Slide | undefined {
  return SLIDES.find((s) => s.id === id);
}

function slideToMarkdown(slide: Slide, index: number): string {
  const lines: string[] = [
    `## ${String(index + 1).padStart(2, "0")} ${slide.title}`,
    "",
    `*${slide.section}*`,
    "",
  ];
  if (slide.body) lines.push(slide.body, "");
  for (const paragraph of slide.paragraphs ?? []) {
    lines.push(paragraph, "");
  }
  if (slide.kind === "contents") {
    for (const item of CONTENTS) lines.push(`${item.n}  ${item.title}`);
    lines.push("");
  } else if (slide.table) {
    lines.push(`| ${slide.table.headers.join(" | ")} |`);
    lines.push(`| ${slide.table.headers.map(() => "---").join(" | ")} |`);
    for (const row of slide.table.rows) {
      lines.push(`| ${row.join(" | ")} |`);
    }
    lines.push("");
  }
  for (const bullet of slide.bullets ?? []) {
    lines.push(`- ${bullet}`);
  }
  if (slide.bullets?.length) lines.push("");
  if (slide.diagram && slide.diagram !== "none") {
    lines.push(`Diagram: ${slide.diagram} (see /architecture in the laboratory).`, "");
  }
  if (slide.footnote) lines.push(`_${slide.footnote}_`, "");
  return lines.join("\n");
}

export function allSlidesMarkdown(): string {
  const header = [
    "# Adaptive Context Reasoning System (ACRS)",
    "",
    "Research proposal slides for Jenisha T (24ETRP720001), Ph.D. CSE, MSRUAS / FET.",
    "Supervisor: Dr. Jyothi A P. Date of registration: 04 September 2024.",
    "",
    "Required outline: Introduction, Literature Review, Summary of Literature Review, Identified Research Problem, Research Title & Aim, Research Objectives, Research Questions, Research Methodology (per objective), Conclusion.",
    "Paste into the university Google Slides template in Contents order.",
    "Do not treat older `.pptx` binaries as the source of truth.",
    "Proposal-stage: no NDCG, latency, token, or accuracy commitments.",
    "",
  ].join("\n");
  return `${header}${SLIDES.map((slide, index) => slideToMarkdown(slide, index)).join("\n")}`;
}
