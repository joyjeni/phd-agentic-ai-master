/**
 * FET / PRP literature-survey template.
 *
 * Each paper is one numbered Evidence block with the fields the college
 * template uses: Author(s), Year, Title, Publication, Objective,
 * Methodology, Findings, Limitations, To solve the research gap.
 *
 * Citations are peer-reviewed journals or top international conference
 * proceedings. Preprints are not cited. No NDCG,
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
  /** FET line: how ACRS closes this paper's limitation. */
  toSolve: string;
};

export const LITERATURE_EVIDENCE: LiteratureEvidence[] = [
  {
    n: 1,
    authors:
      "Wang, L., Ma, C., Feng, X., Zhang, Z., Yang, H., Zhang, J., Chen, Z., Tang, J., Chen, X., Lin, Y., Zhao, W. X., Wei, Z., and Wen, J.",
    year: "2024",
    title: "A survey on large language model based autonomous agents",
    venue: "Frontiers of Computer Science, 18, article 186345 (2024). doi:10.1007/s11704-024-40231-1",
    objective: "Unify how LLM-based autonomous agents are constructed, applied, and evaluated.",
    methodology:
      "Journal survey of agent construction: a profile–memory–planning–action framework covering social science, natural science, and engineering applications.",
    findings:
      "Most published agents share a construction template, but coordination remains an open systems problem rather than a solved runtime.",
    limitations:
      "The survey organises single- and multi-agent construction. It does not specify a closed SATR → APRR → MNCD → FCNP contract over live Indian Open Government Data.",
    toSolve:
      "Integrated ACRS — four named modules on one turn, with O3 MNCD citing a verified data.gov.in UUID.",
  },
  {
    n: 2,
    authors: "He, J., Treude, C., and Lo, D.",
    year: "2025",
    title:
      "LLM-Based Multi-Agent Systems for Software Engineering: Literature Review, Vision, and the Road Ahead",
    venue:
      "ACM Transactions on Software Engineering and Methodology, 34(5), May 2025. doi:10.1145/3712003",
    objective: "Map LLM-based multi-agent (LMA) systems across the software development lifecycle.",
    methodology:
      "Systematic review of primary LMA studies in software engineering, plus case studies of current frameworks and a two-phase research agenda.",
    findings:
      "Role-specialised LMA systems can divide software work, but agent synergy and trustworthiness remain research gaps.",
    limitations:
      "The environment is a software project, not a ministry API. Orchestration is reviewed as chat/SOP collaboration, not a live (toolId, score, citation).",
    toSolve:
      "O3 MNCD — the vote object is a live tool identifier on data.gov.in, not a software-engineering role in a chat chain.",
  },
  {
    n: 3,
    authors:
      "Guo, T., Chen, X., Wang, Y., Chang, R., Pei, S., Chawla, N. V., Wiest, O., and Zhang, X.",
    year: "2024",
    title: "Large Language Model based Multi-Agents: A Survey of Progress and Challenges",
    venue:
      "Proceedings of the Thirty-Third International Joint Conference on Artificial Intelligence (IJCAI-24), Survey Track, pages 8048–8057. doi:10.24963/ijcai.2024/890",
    objective: "Survey how LLM-based multi-agent systems are profiled, how they communicate, and how their capacities grow.",
    methodology:
      "IJCAI survey track: domains and environments, agent profiling, communication mechanisms, and capacity-growth methods.",
    findings:
      "Published MAS work clusters on conversation, role profiles, and simulated worlds; live tool-identifier consensus is not the unit of analysis.",
    limitations:
      "Communication is reviewed as natural-language exchange. There is no fail-loud live Open Government Data GET as the coordination object.",
    toSolve:
      "O3 MNCD — gossip (toolId, score), score-sum consensus, then a fail-loud live data.gov.in GET.",
  },
  {
    n: 4,
    authors: "Chang, E. Y., and Geng, L.",
    year: "2025",
    title:
      "SagaLLM: Context Management, Validation, and Transaction Guarantees for Multi-Agent LLM Planning",
    venue:
      "Proceedings of the VLDB Endowment (PVLDB), 18(12):4874–4886, 2025. doi:10.14778/3750601.3750611",
    objective: "Give multi-agent LLM planners persistent context, validation, and compensable transactions.",
    methodology:
      "Saga-style checkpointing and compensation around multi-LLM planning, with independent validators and state tracking.",
    findings:
      "Transactional context management can recover multi-agent plans from disruption better than unconstrained chat loops.",
    limitations:
      "Orchestration is a planning/transaction runtime. It does not maintain a training-free specialist posterior over Indian OGD tool families, nor cite a ministry UUID.",
    toSolve:
      "O2 APRR plus O3 MNCD — training-free specialist hops, then a verified Agriculture UUID rather than a compensable software saga.",
  },
  {
    n: 5,
    authors: "Wu, Q., Bansal, G., Zhang, J., Wu, Y., Li, B., Zhu, E., Jiang, L., Zhang, X., Zhang, S., Liu, J., Awadallah, A. H., White, R. W., Burger, D., and Wang, C.",
    year: "2024",
    title: "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversations",
    venue: "Proceedings of the First Conference on Language Modeling (COLM 2024)",
    objective: "Program LLM applications by composing multiple conversable agents.",
    methodology: "Agents exchange natural-language messages until a stopping condition; modes mix LLMs, humans, and tools.",
    findings: "Conversation is a working programming model for multi-agent LLM applications.",
    limitations:
      "The unit of coordination is a chat message, not a live (toolId, score, citation) on Indian Open Government Data.",
    toSolve:
      "O3 MNCD — gossip (toolId, score), score-sum consensus, then a fail-loud live data.gov.in GET.",
  },
  {
    n: 6,
    authors: "Hong, S., Zhuge, M., Chen, J., Zheng, X., Cheng, Y., Wang, J., Zhang, C., Wang, Z., Yau, S. K. S., Lin, Z., Zhou, L., Ran, C., Xiao, L., Wu, C., and Schmidhuber, J.",
    year: "2024",
    title: "MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework",
    venue: "Proceedings of the Twelfth International Conference on Learning Representations (ICLR 2024)",
    objective: "Reduce role drift in multi-agent software workflows by encoding human SOPs.",
    methodology: "Standard Operating Procedures are written into prompt sequences; an assembly-line assigns roles.",
    findings: "Authored SOPs produce more coherent software artefacts than unconstrained chat agents.",
    limitations:
      "Who speaks next is designed in advance. The graph is not updated from session-local affinity after a live tool call.",
    toSolve:
      "O2 APRR — training-free specialist posterior updated after live outcomes, not an authored SOP graph.",
  },
  {
    n: 7,
    authors: "Qian, C., Liu, W., Liu, H., Chen, N., Dang, Y., Li, J., Yang, C., Chen, W., Su, Y., Cong, X., Xu, J., Li, D., Liu, Z., and Sun, M.",
    year: "2024",
    title: "ChatDev: Communicative Agents for Software Development",
    venue:
      "Proceedings of the 62nd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15174–15186. doi:10.18653/v1/2024.acl-long.810",
    objective: "Organise specialised LLM agents as a chat-chain for software design, coding, and testing.",
    methodology: "Chat chain (what to communicate) plus communicative dehallucination (how to communicate).",
    findings: "Natural-language design talk and code-level debug talk can be unified in one multi-agent loop.",
    limitations: "The environment is a codebase, not a ministry API with a fail-loud live GET.",
    toSolve:
      "O3 MNCD — the environment is a verified ministry UUID; empty filters fail loud instead of inventing rows.",
  },
  {
    n: 8,
    authors: "Li, G., Hammoud, H. A. A. K., Itani, H., Khizbullin, D., and Ghanem, B.",
    year: "2023",
    title: "CAMEL: Communicative Agents for “Mind” Exploration of Large Language Model Society",
    venue: "Advances in Neural Information Processing Systems 36 (NeurIPS 2023)",
    objective: "Enable autonomous cooperation among communicative agents with minimal human steering.",
    methodology: "Role-playing with inception prompting to keep agents on a human-specified task.",
    findings: "Inception prompting yields scalable multi-agent conversational data and cooperative behaviour.",
    limitations: "No first-class vote over tool identifiers backed by Open Government Data.",
    toSolve:
      "O3 MNCD — the vote object is a tool identifier backed by Open Government Data, not a role-play utterance.",
  },
  {
    n: 9,
    authors: "Qin, Y., Liang, S., Ye, Y., Zhu, K., Yan, L., Lu, Y., Lin, Y., Cong, X., Tang, X., Qian, B., Zhao, S., Hong, L., Tian, R., Xie, R., Zhou, J., Gerstein, M., Li, D., Liu, Z., and Sun, M.",
    year: "2024",
    title: "ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs",
    venue: "Proceedings of the Twelfth International Conference on Learning Representations (ICLR 2024)",
    objective: "Give open LLMs general tool-use over a large real-world API catalogue.",
    methodology:
      "ToolBench: 16,464 RapidAPI REST endpoints; SBERT retriever; DFSDT planner; ToolEval protocol.",
    findings: "A public ranking library and planner exist for large-scale tool use.",
    limitations:
      "Retrieval is turn-amnesic. RapidAPI keys are not redistributable, so this lab cannot execute ToolBench endpoints live.",
    toSolve:
      "O1 SATR uses ToolBench as a ranking library only. O3 MNCD executes live Indian OGD, never RapidAPI replay.",
  },
  {
    n: 10,
    authors: "Zheng, Y., Li, P., Liu, W., Liu, Y., Luan, J., and Wang, B.",
    year: "2024",
    title: "ToolRerank: Adaptive and Hierarchy-Aware Reranking for Tool Retrieval",
    venue:
      "Proceedings of the 2024 Joint International Conference on Computational Linguistics, Language Resources and Evaluation (LREC-COLING 2024), pages 16263–16273. ACL Anthology 2024.lrec-main.1413",
    objective: "Refine ToolLLM-style retrieval for seen versus unseen APIs and for tool-library hierarchy.",
    methodology: "Adaptive truncation of seen/unseen APIs plus hierarchy-aware concentration or diversity.",
    findings: "Reranking the SBERT shortlist improves downstream tool execution quality.",
    limitations:
      "Still query-only. Session co-activation and later write-back from a pruned mesh are unused.",
    toSolve:
      "O1 SATR — fuse co-activation after ToolRerank-style truncation. O4 FCNP writes the residue back.",
  },
  {
    n: 11,
    authors: "Ong, I., Almahairi, A., Wu, V., Chiang, W.-L., Wu, T., Gonzalez, J. E., Kadous, M. W., and Stoica, I.",
    year: "2025",
    title: "RouteLLM: Learning to Route LLMs from Preference Data",
    venue: "Proceedings of the Thirteenth International Conference on Learning Representations (ICLR 2025)",
    objective: "Route each query between a stronger and a weaker LLM from human preference data.",
    methodology: "Trained router plus data augmentation; deployed as a frozen policy at inference.",
    findings: "Preference-trained routers can cut cost while holding response quality on public benchmarks.",
    limitations:
      "The object of routing is an LLM SKU, not a named Indian-OGD specialist with a training-free posterior.",
    toSolve:
      "O2 APRR — route named mandi / crop / rainfall specialists, not foundation-model SKUs.",
  },
  {
    n: 12,
    authors: "Yue, Y., Zhang, G., Liu, B., Wan, G., Wang, K., Cheng, D., and Qi, Y.",
    year: "2025",
    title: "MasRouter: Learning to Route LLMs for Multi-Agent Systems",
    venue:
      "Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (Volume 1: Long Papers), pages 15549–15572. doi:10.18653/v1/2025.acl-long.757",
    objective: "Unify collaboration mode, role allocation, and LLM choice as one MAS routing problem.",
    methodology: "Cascaded neural controller trained over multi-agent topologies.",
    findings: "A learned controller can assemble a cheaper MAS than a static multi-agent template.",
    limitations:
      "Requires training. It does not maintain a training-free affinity matrix over named tool-specialist agents.",
    toSolve:
      "O2 APRR — training-free hop sampling over named specialists; learned routers stay a later comparison class.",
  },
  {
    n: 13,
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
    toSolve:
      "O2 APRR — specialist hops after SATR, updated from live MNCD outcomes, not SKU bandits under a dollar budget.",
  },
  {
    n: 14,
    authors: "Jiang, H., Wu, Q., Lin, C.-Y., Yang, Y., and Qiu, L.",
    year: "2023",
    title: "LLMLingua: Compressing Prompts for Accelerated Inference of Large Language Models",
    venue:
      "Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing, pages 13358–13376. doi:10.18653/v1/2023.emnlp-main.825",
    objective: "Shorten long prompts while keeping task performance.",
    methodology: "Budget controller plus token-level iterative compression aligned to the target LLM.",
    findings: "Token-importance compression can reduce prompt length with limited quality loss.",
    limitations:
      "Deletes tokens before the LLM. It does not prune a mesh by conductance or write live citations back into retrieval.",
    toSolve:
      "O4 FCNP — prune the mesh by conductance and pin live citations into SATR, not token deletion.",
  },
  {
    n: 15,
    authors: "Park, J. S., O’Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., and Bernstein, M. S.",
    year: "2023",
    title: "Generative Agents: Interactive Simulacra of Human Behavior",
    venue:
      "Proceedings of the 36th Annual ACM Symposium on User Interface Software and Technology (UIST 2023), Best Paper. doi:10.1145/3586183.3606763",
    objective: "Give LLM agents a long-term memory stream for believable behaviour in a sandbox.",
    methodology: "Natural-language memory, reflection, and retrieval (recency, relevance, importance) inside a Sims-like town.",
    findings: "A memory stream supports individual plans and emergent social coordination among agents.",
    limitations:
      "Memory lives in a sandbox simulation. It is not written back into a tool retriever over ministry APIs.",
    toSolve:
      "O4 FCNP — pin live ministry citations into the next SATR prior, not a sandbox memory stream.",
  },
  {
    n: 16,
    authors: "Tero, A., Takagi, S., Saigusa, T., Ito, K., Bebber, D. P., Fricker, M. D., Yumiki, K., Kobayashi, R., and Nakagaki, T.",
    year: "2010",
    title: "Rules for Biologically Inspired Adaptive Network Design",
    venue: "Science 327(5964):439–442. doi:10.1126/science.1177894",
    objective: "Capture how Physarum polycephalum grows efficient, fault-tolerant transport networks.",
    methodology: "Feedback between tube conductance and protoplasmic flux; compared with the Tokyo rail system.",
    findings: "A local conductance update can yield globally efficient adaptive networks without a central planner.",
    limitations:
      "A biological transport model, not an LLM context pruner. ACRS uses it as a design heuristic, not as a claim that the mesh is an organism.",
    toSolve:
      "O4 FCNP — Physarum-inspired conductance as a design heuristic, with write-back into SATR.",
  },
  {
    n: 17,
    authors: "Guo, H., Woodruff, A., and Yadav, A.",
    year: "2020",
    title:
      "Improving Lives of Indebted Farmers Using Deep Learning: Predicting Agricultural Produce Prices Using Convolutional Neural Networks (PECAD)",
    venue:
      "Proceedings of the AAAI Conference on Artificial Intelligence, 34(08):13294–13299. doi:10.1609/aaai.v34i08.7039",
    objective: "Use AGMARKNET price series as decision-support input for indebted farmers.",
    methodology: "Convolutional networks over scraped agricultural produce prices.",
    findings: "AGMARKNET is a real Indian decision-support corpus, not a toy table.",
    limitations:
      "A crop-price CNN is not a multi-agent live-OGD loop. Cited as domain precedent, not as a baseline to beat.",
    toSolve:
      "O3 MNCD — live AGMARKNET UUID as a citation. PECAD is domain precedent, not a baseline to beat.",
  },
  {
    n: 18,
    authors: "Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., and Cao, Y.",
    year: "2023",
    title: "ReAct: Synergizing Reasoning and Acting in Language Models",
    venue: "Proceedings of the Eleventh International Conference on Learning Representations (ICLR 2023)",
    objective: "Interleave reasoning traces with actions so a language model can use tools.",
    methodology: "Thought–action–observation cycles on the already-chosen tool set.",
    findings: "Reasoning-and-acting beats reason-only or act-only prompting on several agent tasks.",
    limitations:
      "Assumes the tool set is already determined. It does not fuse session co-activation into the next rank, nor cite a live data.gov.in UUID.",
    toSolve:
      "O1 SATR — choose the tool set from session memory before any ReAct-style acting. O3 MNCD cites the UUID.",
  },
];

export type BibliographyEntry = {
  n: number;
  authors: string;
  year: string;
  title: string;
  venue: string;
  doi?: string;
  note?: string;
};

export type TextRun = { text: string; href?: string };

export function parseDoi(text: string): string | undefined {
  const match = text.match(/doi:\s*(10\.\d{4,9}\/\S+)/i);
  if (!match?.[1]) return undefined;
  return match[1].replace(/[).,;]+$/g, "");
}

export function doiHref(doi: string): string {
  const id = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:/i, "");
  return `https://doi.org/${id}`;
}

export function splitDois(text: string): TextRun[] {
  const re = /doi:\s*(10\.\d{4,9}\/\S+)/gi;
  const runs: TextRun[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) runs.push({ text: text.slice(last, match.index) });
    const doi = match[1].replace(/[).,;]+$/g, "");
    const consumed = match[0].length - (match[1].length - doi.length);
    runs.push({ text: `doi:${doi}`, href: doiHref(doi) });
    last = match.index + consumed;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  return runs.length ? runs : [{ text }];
}

export function linkDoisMarkdown(text: string): string {
  return splitDois(text)
    .map((part) => (part.href ? `[${part.text}](${part.href})` : part.text))
    .join("");
}

const EXTRA_REFERENCES: Omit<BibliographyEntry, "n">[] = [
  {
    authors:
      "Wei, J., Wang, X., Schuurmans, D., Bosma, M., Ichter, B., Xia, F., Chi, E., Le, Q., and Zhou, D.",
    year: "2022",
    title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models",
    venue: "Advances in Neural Information Processing Systems 35 (NeurIPS 2022)",
  },
  {
    authors:
      "Yao, S., Yu, D., Zhao, J., Shafran, I., Griffiths, T. L., Cao, Y., and Narasimhan, K.",
    year: "2023",
    title: "Tree of Thoughts: Deliberate Problem Solving with Large Language Models",
    venue: "Advances in Neural Information Processing Systems 36 (NeurIPS 2023)",
  },
  {
    authors: "Shinn, N., Cassano, F., Gopinath, A., Narasimhan, K., and Yao, S.",
    year: "2023",
    title: "Reflexion: Language Agents with Verbal Reinforcement Learning",
    venue: "Advances in Neural Information Processing Systems 36 (NeurIPS 2023)",
  },
  {
    authors:
      "Shen, Y., Song, K., Tan, X., Li, D., Lu, W., and Zhuang, Y.",
    year: "2023",
    title: "HuggingGPT: Solving AI Tasks with ChatGPT and its Friends in Hugging Face",
    venue: "Advances in Neural Information Processing Systems 36 (NeurIPS 2023)",
  },
  {
    authors:
      "Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Hambro, E., Zettlemoyer, L., Cancedda, N., and Scialom, T.",
    year: "2023",
    title: "Toolformer: Language Models Can Teach Themselves to Use Tools",
    venue: "Advances in Neural Information Processing Systems 36 (NeurIPS 2023)",
  },
  {
    authors: "Government of India",
    year: "2026",
    title: "Open Government Data Platform India",
    venue:
      "data.gov.in; AGMARKNET resource 9ef84268-d588-465a-a308-a864a43d0070; Directorate of Economics and Statistics crop production; IMD rainfall series; Government Open Data License — India (GODL-India)",
    note: "Live execution corpus, not a journal article.",
  },
];

export const BIBLIOGRAPHY: BibliographyEntry[] = [
  ...LITERATURE_EVIDENCE.map((item) => ({
    n: item.n,
    authors: item.authors,
    year: item.year,
    title: item.title,
    venue: item.venue,
    doi: parseDoi(item.venue),
  })),
  ...EXTRA_REFERENCES.map((item, index) => ({
    ...item,
    n: LITERATURE_EVIDENCE.length + 1 + index,
    doi: item.doi ?? parseDoi(item.venue),
  })),
];

export function bibliographyLine(entry: BibliographyEntry): string {
  const venue = entry.venue.endsWith(".") ? entry.venue : `${entry.venue}.`;
  const line = `[${entry.n}] ${entry.authors} ${entry.title}. ${venue}`;
  return entry.note ? `${line} ${entry.note}` : line;
}

export function evidenceTemplateLines(item: LiteratureEvidence): string[] {
  const doi = parseDoi(item.venue);
  const lines = [
    `Evidence ${item.n}  ·  Citation [${item.n}]`,
    `Author(s): ${item.authors}`,
    `Year: ${item.year}`,
    `Title: ${item.title}`,
    `Publication: ${item.venue}`,
  ];
  if (doi) lines.push(`DOI: ${doiHref(doi)}`);
  lines.push(
    `Objective: ${item.objective}`,
    `Methodology: ${item.methodology}`,
    `Findings: ${item.findings}`,
    `Limitations: ${item.limitations}`,
    `To solve the research gap: ${item.toSolve}`,
  );
  return lines;
}

export const RESEARCH_GAP_SOLUTIONS: {
  gap: string;
  evidence: string;
  solves: string;
}[] = [
  {
    gap: "G1 — Turn-amnesic retrieval",
    evidence: "Evidence 9, 10, 18",
    solves:
      "O1 SATR. Fuse session co-activation with semantic rank; write FCNP residue into the next prior.",
  },
  {
    gap: "G2 — Model / SOP routers",
    evidence: "Evidence 6, 11, 12, 13",
    solves:
      "O2 APRR. Training-free hop sampling over named tool-specialist agents, not LLM SKUs.",
  },
  {
    gap: "G3 — Chat / star coordination",
    evidence: "Evidence 1–5, 7, 8",
    solves:
      "O3 MNCD. Score-sum over live tool identifiers, then a fail-loud data.gov.in GET.",
  },
  {
    gap: "G4 — Token compression, no write-back",
    evidence: "Evidence 14, 15, 16",
    solves:
      "O4 FCNP. Conductance prune of the mesh; pin live citations back into SATR.",
  },
  {
    gap: "G5 — No live Indian OGD loop",
    evidence: "Evidence 9, 17",
    solves:
      "Integrated ACRS on verified Agriculture UUIDs. ToolBench is ranking-only; prices are never invented.",
  },
];

export function chunkEvidence(size = 2): LiteratureEvidence[][] {
  const chunks: LiteratureEvidence[][] = [];
  for (let i = 0; i < LITERATURE_EVIDENCE.length; i += size) {
    chunks.push(LITERATURE_EVIDENCE.slice(i, i + size));
  }
  return chunks;
}

export function literatureSurveyMarkdown(): string {
  const blocks = LITERATURE_EVIDENCE.map((item) => {
    const doi = parseDoi(item.venue);
    return [
      `## Evidence ${item.n}`,
      "",
      `**Author(s):** ${item.authors}`,
      "",
      `**Year:** ${item.year}`,
      "",
      `**Title:** ${item.title}`,
      "",
      `**Publication:** ${linkDoisMarkdown(item.venue)}`,
      "",
      ...(doi ? [`**DOI:** [${doiHref(doi)}](${doiHref(doi)})`, ""] : []),
      `**Objective:** ${item.objective}`,
      "",
      `**Methodology:** ${item.methodology}`,
      "",
      `**Findings:** ${item.findings}`,
      "",
      `**Limitations:** ${item.limitations}`,
      "",
      `**To solve the research gap:** ${item.toSolve}`,
      "",
    ].join("\n");
  });
  return [
    "# Literature Survey",
    "",
    "FET / PRP template form for Jenisha T (24ETRP720001). Each numbered block is one published journal article or a top international conference proceedings paper. Preprints are not cited. Conference Publication fields use the full proceedings title.",
    "Proposal-stage: no NDCG, latency, token, or accuracy commitments.",
    "",
    ...blocks,
    "## To solve the research gap",
    "",
    "The limitations in Evidence 1–18 collapse into five architectural gaps. This proposal solves them as follows. Closing a gap is a named module on a closed loop, not a promised leaderboard number.",
    "",
    "| Research gap | Left open by | To solve the research gap |",
    "|---|---|---|",
    ...RESEARCH_GAP_SOLUTIONS.map(
      (row) => `| ${row.gap} | ${row.evidence} | ${row.solves} |`,
    ),
    "",
    "Integration order: SATR → APRR → MNCD → FCNP on one user turn.",
    "",
  ].join("\n");
}
