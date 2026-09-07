import { COLLEGE } from "@/lib/research/college";
import { SLIDES } from "@/lib/research/slides";
import Link from "next/link";

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
        {COLLEGE.university}
      </p>
      <h1 className="font-serif text-4xl">Slides for {COLLEGE.scholar}</h1>
      <div className="rounded-xl border border-[var(--gold)] bg-[var(--panel)] p-5 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          The in-chat preview <strong className="text-[var(--paper)]">cannot save
          files</strong>. That is why Download did nothing — it is not a broken
          deck. {SLIDES.length} slides are below as a PDF.
        </p>
        <p className="mt-3">
          To get a PowerPoint onto your computer: use the{" "}
          <strong className="text-[var(--paper)]">files attached to this chat</strong>
          , click <strong className="text-[var(--paper)]">Create repo</strong> and
          download from the repository in Chrome/Edge, or open{" "}
          <code className="text-[var(--paper)]">/api/slides/pptx?raw=1</code> in a
          normal browser tab (not this preview).
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/proposal"
            className="inline-flex h-11 items-center rounded-md bg-[var(--gold)] px-5 text-sm font-semibold text-[var(--ink)]"
          >
            Flip through slides
          </Link>
          <a
            href="/api/slides/pdf"
            className="inline-flex h-11 items-center rounded-md border border-[var(--gold)] px-5 text-sm font-semibold text-[var(--gold)]"
          >
            Open PDF only
          </a>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--gold)] bg-[#fffaf3]">
        <p className="bg-[#7C1D2E] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#e8c97a]">
          All {SLIDES.length} slides as PDF
        </p>
        <iframe
          title="ACRS proposal PDF"
          src="/api/slides/pdf"
          className="h-[min(80vh,54rem)] w-full bg-[#fffaf3]"
        />
      </div>
    </div>
  );
}
