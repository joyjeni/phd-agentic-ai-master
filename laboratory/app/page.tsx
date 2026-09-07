import { PipelineLab } from "@/components/pipeline-lab";
import { DownloadSlides } from "@/components/download-slides";
import { CATALOG_STATS } from "@/lib/research/catalog";
import { RESEARCH } from "@/lib/research/objectives";
import { COLLEGE } from "@/lib/research/college";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-[var(--gold)] bg-[var(--panel)] p-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          Updated slides
        </p>
        <h2 className="mt-1 font-serif text-2xl">
          {COLLEGE.scholar} · {COLLEGE.registerNo}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Download the college-template PowerPoint, ZIP, PDF, or Markdown from the
          buttons below. Same files are also on the{" "}
          <Link className="text-[var(--gold)] underline" href="/download">
            download page
          </Link>
          .
        </p>
        <div className="mt-4">
          <DownloadSlides />
        </div>
      </section>
      <section className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          {RESEARCH.affiliation}
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-[var(--paper)] sm:text-5xl">
          {RESEARCH.title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          {RESEARCH.scholar} · {RESEARCH.email}. Four GitHub algorithms run as
          microservices: SATR — Session-Aware Tool Retrieval (O1; not a new LLM),
          Adaptive Probabilistic Routing Reinforcement (O2), Mesh Network Context
          Diffusion (O3), Flow-Coupled Network Pruning (O4). Catalog:{" "}
          {CATALOG_STATS.nTools} Agriculture tools, {CATALOG_STATS.nLive} live
          data.gov.in resources.
        </p>
        <p className="mt-3 text-sm">
          <Link className="text-[var(--gold)] underline" href="/walkthrough">
            Full formula walkthrough
          </Link>
          {" · "}
          <Link className="text-[var(--gold)] underline" href="/algorithms">
            Pseudocode, mermaid, animated ToolBench dataflow
          </Link>
          {" · "}
          <Link className="text-[var(--gold)] underline" href="/literature">
            Literature survey (Evidence 1–18)
          </Link>{" "}
          — FET template, including how ACRS solves each gap.
        </p>
      </section>
      <PipelineLab />
    </div>
  );
}
