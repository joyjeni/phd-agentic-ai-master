import { DownloadSlides } from "@/components/download-slides";
import { SlideDeck } from "@/components/slide-deck";
import { COLLEGE } from "@/lib/research/college";

export default function ProposalPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          {COLLEGE.university} · {COLLEGE.facultyHeader}
        </p>
        <h1 className="mt-2 font-serif text-4xl">{COLLEGE.kicker}</h1>
        <p className="mt-3 max-w-3xl text-sm text-[var(--muted)]">
          Research scholar <strong className="text-[var(--paper)]">{COLLEGE.scholar}</strong>
          ({COLLEGE.registerNo}), {COLLEGE.mode}, {COLLEGE.department}. Supervisor:{" "}
          {COLLEGE.supervisor}. University email: {COLLEGE.email}. Use the
          download buttons for PowerPoint, ZIP, PDF, or Markdown.
        </p>
        <div className="mt-4">
          <DownloadSlides />
        </div>
      </header>
      <SlideDeck />
    </div>
  );
}
