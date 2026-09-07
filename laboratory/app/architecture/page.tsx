import { ArchitectureSvg } from "@/components/architecture-svg";
import { SATR } from "@/lib/research/objectives";

const PANELS = [
  {
    title: "Figure 1 — SOTA architecture (cited journal)",
    caption:
      "Redrawn after Wang et al., Frontiers of Computer Science 18:186345 (2024), doi:10.1007/s11704-024-40231-1. Canonical LLM agent: Profiling, Memory, Planning, Action. Tool-use instantiation: Qin et al., ToolLLM (ICLR 2024) and Zheng et al., ToolRerank (LREC-COLING 2024). Related surveys: He et al., ACM TOSEM 2025; Guo et al., IJCAI-24. Figure 1 is redrawn; it is not a scanned publisher PDF.",
    variant: "sota" as const,
  },
  {
    title: "Figure 2 — Proposed ACRS architecture (drawn)",
    caption: SATR.what,
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
      "SATR is Session-Aware Tool Retrieval. Hierarchy-aware truncation is kept. Session priors, co-activation cache, and FCNP memory are the increment. No NDCG is promised.",
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
          Figure 1 is the cited journal SOTA (Wang et al., FCS 2024). Figure 2 is
          the proposed ACRS loop drawn for this work. Diagrams are qualitative.
          They do not encode NDCG, latency, token, or accuracy targets.
        </p>
      </header>
      <section className="rounded-xl border border-[var(--gold)] bg-[var(--panel)] p-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          What {SATR.acronym} is
        </p>
        <h2 className="mt-2 font-serif text-2xl">
          {SATR.acronym} = {SATR.expansion}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          {SATR.what}
        </p>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Formerly labelled SessionRerank+. The GitHub ranking library remains{" "}
          <code className="text-[var(--paper)]">{SATR.repo}</code>. That folder
          name is historical; the module in this proposal is SATR.
        </p>
      </section>
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
