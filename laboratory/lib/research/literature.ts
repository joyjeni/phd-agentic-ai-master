/**
 * FET / PRP literature-survey template.
 *
 * Each paper is one numbered Evidence block with the fields the college
 * template uses: Author(s), Year, Title, Publication, Objective,
 * Methodology, Findings, Limitations.
 *
 * Citations match the verified bibliography in slides.ts. No NDCG,
 * latency, or accuracy targets.
 */

export type LiteratureEvidence = {
  n: number;
  authors: string;
  year: string;
  title: string;
  venue: string;
  objective: string;
  methodology: string;
  findings: string;
  limitations: string;
};

export const LITERATURE_EVIDENCE: LiteratureEvidence[] = [
  {
    n: 1,
    authors: "Wu, Q., Bansal, G., Zhang, J., Wu, Y., Li, B., Zhu, E., Jiang, L., Zhang, X., Zhang, S., Liu, J., Awadallah, A. H., White, R. W., Burger, D., and Wang, C.",
    year: "2024",
    title: "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversations",
    venue: "Conference on Language Modeling (COLM) 2024; ICLR 2024 Workshop on LLM Agents (Best Paper). arXiv:2308.08155",
    objective: "Program LLM applications by composing multiple conversable agents.",
    methodology: "Agents exchange natural-language messages until a stopping condition; modes mix LLMs, humans, and tools.",
    findings: "Conversation is a working programming model for multi-agent LLM applications.",
    limitations:
      "The unit of coordination is a chat message, not a live (toolId, score, citation) on Indian Open Government Data.",
  },
  {
    n: 2,
    authors: "Hong, S., Zhuge, M., Chen, J., Zheng, X., Cheng, Y., Wang, J., Zhang, C., Wang, Z., Yau, S. K. S., Lin, Z., Zhou, L., Ran, C., Xiao, L., Wu, C., and Schmidhuber, J.",
    year: "2024",
    title: "MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework",
    venue: "ICLR 2024",
    objective: "Reduce role drift in multi-agent software workflows by encoding human SOPs.",
    methodology: "Standard Operating Procedures are written into prompt sequences; an assembly-line assigns roles.",
    findings: "Authored SOPs produce more coherent software artefacts than unconstrained chat agents.",
    limitations:
      "Who speaks next is designed in advance. The graph is not updated from session-local affinity after a live tool call.",
  },
  {
    n: 3,
    authors: "Qian, C., Liu, W., Liu, H., Chen, N., Dang, Y., Li, J., Yang, C., Chen, W., Su, Y., Cong, X., Xu, J., Li, D., Liu, Z., and Sun, M.",
    year: "2024",
    title: "ChatDev: Communicative Agents for Software Development",
    venue: "ACL 2024 (long), pages 15174–15186. doi:10.18653/v1/2024.acl-long.810",
    objective: "Organise specialised LLM agents as a chat-chain for software design, coding, and testing.",
    methodology: "Chat chain (what to communicate) plus communicative dehallucination (how to communicate).",
    findings: "Natural-language design talk and code-level debug talk can be unified in one multi-agent loop.",
    limitations: "The environment is a codebase, not a ministry API with a fail-loud live GET.",
  },
  {
    n: 4,
    authors: "Li, G., Hammoud, H. A. A. K., Itani, H., Khizbullin, D., and Ghanem, B.",
    year: "2023",
    title: "CAMEL: Communicative Agents for “Mind” Exploration of Large Language Model Society",
    venue: "NeurIPS 2023",
    objective: "Enable autonomous cooperation among communicative agents with minimal human steering.",
    methodology: "Role-playing with inception prompting to keep agents on a human-specified task.",
    findings: "Inception prompting yields scalable multi-agent conversational data and cooperative behaviour.",
    limitations: "No first-class vote over tool identifiers backed by Open Government Data.",
  },
  {
    n: 5,
    authors: "Qin, Y., Liang, S., Ye, Y., Zhu, K., Yan, L., Lu, Y., Lin, Y., Cong, X., Tang, X., Qian, B., Zhao, S., Hong, L., Tian, R., Xie, R., Zhou, J., Gerstein, M., Li, D., Liu, Z., and Sun, M.",
    year: "2024",
    title: "ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs",
    venue: "ICLR 2024",
    objective: "Give open LLMs general tool-use over a large real-world API catalogue.",
    methodology:
      "ToolBench: 16,464 RapidAPI REST endpoints; SBERT retriever; DFSDT planner; ToolEval protocol.",
    findings: "A public ranking library and planner exist for large-scale tool use.",
    limitations:
      "Retrieval is turn-amnesic. RapidAPI keys are not redistributable, so this lab cannot execute ToolBench endpoints live.",
  },
  {
    n: 6,
    authors: "Zheng, Y., Li, P., Liu, W., Liu, Y., Luan, J., and Wang, B.",
    year: "2024",
    title: "ToolRerank: Adaptive and Hierarchy-Aware Reranking for Tool Retrieval",
    venue: "LREC-COLING 2024, pages 16263–16273. ACL Anthology 2024.lrec-main.1413",
    objective: "Refine ToolLLM-style retrieval for seen versus unseen APIs and for tool-library hierarchy.",
    methodology: "Adaptive truncation of seen/unseen APIs plus hierarchy-aware concentration or diversity.",
    findings: "Reranking the SBERT shortlist improves downstream tool execution quality.",
    limitations:
      "Still query-only. Session co-activation and later write-back from a pruned mesh are unused.",
  },
  {
    n: 7,
    authors: "Ong, I., Almahairi, A., Wu, V., Chiang, W.-L., Wu, T., Gonzalez, J. E., Kadous, M. W., and Stoica, I.",
    year: "2025",
    title: "RouteLLM: Learning to Route LLMs from Preference Data",
    venue: "ICLR 2025. arXiv:2406.18665",
    objective: "Route each query between a stronger and a weaker LLM from human preference data.",
    methodology: "Trained router plus data augmentation; deployed as a frozen policy at inference.",
    findings: "Preference-trained routers can cut cost while holding response quality on public benchmarks.",
    limitations:
      "The object of routing is an LLM SKU, not a named Indian-OGD specialist with a training-free posterior.",
  },
  {
    n: 8,
    authors: "Yue, Y., Zhang, G., Liu, B., Wan, G., Wang, K., Cheng, D., and Qi, Y.",
    year: "2025",
    title: "MasRouter: Learning to Route LLMs for Multi-Agent Systems",
    venue: "ACL 2025 (long), pages 15549–15572. doi:10.18653/v1/2025.acl-long.757",
    objective: "Unify collaboration mode, role allocation, and LLM choice as one MAS routing problem.",
    methodology: "Cascaded neural controller trained over multi-agent topologies.",
    findings: "A learned controller can assemble a cheaper MAS than a static multi-agent template.",
    limitations:
      "Requires training. It does not maintain a Dirichlet–Thompson matrix over mandi / crop / rainfall specialists.",
  },
  {
    n: 9,
    authors: "Panda, P., Magazine, R., Devaguptapu, C., Takemori, S., and Sharma, V.",
    year: "2025",
    title: "Adaptive LLM Routing under Budget Constraints",
    venue:
      "Findings of the Association for Computational Linguistics: EMNLP 2025, pages 23934–23949. doi:10.18653/v1/2025.findings-emnlp.1301. Method name: PILOT (Preference-prior Informed LinUCB).",
    objective: "Treat LLM routing as a contextual bandit under a user budget.",
    methodology: "Preference-prior LinUCB in a shared query–LLM embedding space, plus an online cost policy.",
    findings: "Bandit routing can adapt without exhaustive inference of every LLM on every query.",
    limitations:
      "Routes foundation-model SKUs under a dollar budget, not tool-specialist agents after a live data.gov.in GET.",
  },
  {
    n: 10,
    authors: "Jiang, H., Wu, Q., Lin, C.-Y., Yang, Y., and Qiu, L.",
    year: "2023",
    title: "LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models",
    venue: "EMNLP 2023, pages 13358–13376. doi:10.18653/v1/2023.emnlp-main.825",
    objective: "Shorten long prompts while keeping task performance.",
    methodology: "Budget controller plus token-level iterative compression aligned to the target LLM.",
    findings: "Token-importance compression can reduce prompt length with limited quality loss.",
    limitations:
      "Deletes tokens before the LLM. It does not prune a mesh by conductance or write live citations back into retrieval.",
  },
  {
    n: 11,
    authors: "Park, J. S., O’Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., and Bernstein, M. S.",
    year: "2023",
    title: "Generative Agents: Interactive Simulacra of Human Behavior",
    venue: "UIST 2023 (Best Paper). doi:10.1145/3586183.3606763",
    objective: "Give LLM agents a long-term memory stream for believable behaviour in a sandbox.",
    methodology: "Natural-language memory, reflection, and retrieval (recency, relevance, importance) inside a Sims-like town.",
    findings: "A memory stream supports individual plans and emergent social coordination among agents.",
    limitations:
      "Memory lives in a sandbox simulation. It is not written back into a tool retriever over ministry APIs.",
  },
  {
    n: 12,
    authors: "Tero, A., Takagi, S., Saigusa, T., Ito, K., Bebber, D. P., Fricker, M. D., Yumiki, K., Kobayashi, R., and Nakagaki, T.",
    year: "2010",
    title: "Rules for Biologically Inspired Adaptive Network Design",
    venue: "Science 327(5964):439–442. doi:10.1126/science.1177894",
    objective: "Capture how Physarum polycephalum grows efficient, fault-tolerant transport networks.",
    methodology: "Feedback between tube conductance and protoplasmic flux; compared with the Tokyo rail system.",
    findings: "A local conductance update can yield globally efficient adaptive networks without a central planner.",
    limitations:
      "A biological transport model, not an LLM context pruner. ACRS uses it as a design heuristic, not as a claim that the mesh is an organism.",
  },
  {
    n: 13,
    authors: "Guo, H., Woodruff, A., and Yadav, A.",
    year: "2020",
    title:
      "Improving Lives of Indebted Farmers Using Deep Learning: Predicting Agricultural Produce Prices Using Convolutional Neural Networks (PECAD)",
    venue: "AAAI 2020. doi:10.1609/aaai.v34i08.7039",
    objective: "Use AGMARKNET price series as decision-support input for indebted farmers.",
    methodology: "Convolutional networks over scraped agricultural produce prices.",
    findings: "AGMARKNET is a real Indian decision-support corpus, not a toy table.",
    limitations:
      "A crop-price CNN is not a multi-agent live-OGD loop. Cited as domain precedent, not as a baseline to beat.",
  },
  {
    n: 14,
    authors: "Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., and Cao, Y.",
    year: "2023",
    title: "ReAct: Synergizing Reasoning and Acting in Language Models",
    venue: "ICLR 2023",
    objective: "Interleave reasoning traces with actions so a language model can use tools.",
    methodology: "Thought–action–observation cycles on the already-chosen tool set.",
    findings: "Reasoning-and-acting beats reason-only or act-only prompting on several agent tasks.",
    limitations:
      "Assumes the tool set is already determined. It does not fuse session co-activation into the next rank, nor cite a live data.gov.in UUID.",
  },
];

export function evidenceTemplateLines(item: LiteratureEvidence): string[] {
  return [
    `Evidence ${item.n}`,
    `Author(s): ${item.authors}`,
    `Year: ${item.year}`,
    `Title: ${item.title}`,
    `Publication: ${item.venue}`,
    `Objective: ${item.objective}`,
    `Methodology: ${item.methodology}`,
    `Findings: ${item.findings}`,
    `Limitations: ${item.limitations}`,
  ];
}

export function chunkEvidence(size = 2): LiteratureEvidence[][] {
  const chunks: LiteratureEvidence[][] = [];
  for (let i = 0; i < LITERATURE_EVIDENCE.length; i += size) {
    chunks.push(LITERATURE_EVIDENCE.slice(i, i + size));
  }
  return chunks;
}

export function literatureSurveyMarkdown(): string {
  const blocks = LITERATURE_EVIDENCE.map((item) =>
    [
      `## Evidence ${item.n}`,
      "",
      `**Author(s):** ${item.authors}`,
      "",
      `**Year:** ${item.year}`,
      "",
      `**Title:** ${item.title}`,
      "",
      `**Publication:** ${item.venue}`,
      "",
      `**Objective:** ${item.objective}`,
      "",
      `**Methodology:** ${item.methodology}`,
      "",
      `**Findings:** ${item.findings}`,
      "",
      `**Limitations:** ${item.limitations}`,
      "",
    ].join("\n"),
  );
  return [
    "# Literature Survey",
    "",
    "FET / PRP template form for Jenisha T (24ETRP720001). Each numbered block is one published paper.",
    "Proposal-stage: no NDCG, latency, token, or accuracy commitments.",
    "",
    ...blocks,
  ].join("\n");
}
