import { ArchitectureSvg } from "@/components/architecture-svg";

const PANELS = [
  {
    title: "SOTA composition",
    caption:
      "Qin et al. (ToolLLM, ICLR 2024) retrieve from the current query; Zheng et al. (ToolRerank, LREC-COLING 2024) truncate; a single planner calls tools. Session memory never returns.",
    variant: "sota" as const,
  },
  {
    title: "Proposed ACRS composition",
    caption:
      "Four named artefacts move along the loop. FCNP memory is an input to SATR. The claim is the contract, not a metric.",
    variant: "proposed" as const,
  },
  {
    title: "Integrated: four objectives versus SOTA",
    caption:
      "Top: star / SOP / chat / one-shot retrieve. Bottom: SATR → APRR → MNCD → FCNP with write-back into SATR and live Indian OGD at MNCD.",
    variant: "integrated" as const,
  },
  {
    title: "O1 SATR vs ToolLLM / ToolRerank",
    caption:
      "Hierarchy-aware truncation is kept. Session priors, co-activation cache, and FCNP memory are the increment. No NDCG is promised.",
    variant: "compare-satr" as const,
  },
  {
    title: "O2 APRR vs RouteLLM / PILOT / MasRouter / MetaGPT",
    caption:
      "SOTA routes models or follows authored SOPs. APRR samples a training-free posterior over tool-specialist agents.",
    variant: "compare-aprr" as const,
  },
  {
    title: "O3 MNCD vs AutoGen / MetaGPT / ChatDev / CAMEL",
    caption:
      "SOTA coordinates over natural-language messages. MNCD gossips (toolId, score) and executes a verified data.gov.in UUID.",
    variant: "compare-mncd" as const,
  },
  {
    title: "O4 FCNP vs LLMLingua",
    caption:
      "Jiang et al. (EMNLP 2023) shorten tokens. FCNP solves a Kirchhoff/Physarum graph (Tero et al., Science 2010) and writes M_t for the next retrieval.",
    variant: "compare-fcnp" as const,
  },
];

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          Architecture
        </p>
        <h1 className="mt-2 font-serif text-4xl">SOTA versus proposed novelty</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Each diagram names a published system on the grey path and the ACRS
          increment on the green path. Diagrams are qualitative. They do not
          encode NDCG, latency, token, or accuracy targets.
        </p>
      </header>
      <div className="space-y-6">
        {PANELS.map((panel) => (
          <section
            key={panel.title}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5"
          >
            <h2 className="font-serif text-2xl">{panel.title}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{panel.caption}</p>
            <div className="mt-4">
              <ArchitectureSvg variant={panel.variant} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
