import { FileDownloadButtons } from "@/components/file-download-buttons";
import { COLLEGE, PDF_FILENAME, PPTX_FILENAME } from "@/lib/research/college";
import { SLIDES } from "@/lib/research/slides";
import Link from "next/link";

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
        {COLLEGE.university}
      </p>
      <h1 className="font-serif text-4xl">Download slides — {COLLEGE.scholar}</h1>
      <div className="rounded-xl border border-[var(--gold)] bg-[var(--panel)] p-5 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          {SLIDES.length} slides in the white Gowrishankar college template.
          Use <strong className="text-[var(--paper)]">Download PowerPoint</strong>{" "}
          for the FET file ({PPTX_FILENAME}). PDF is {PDF_FILENAME}.
        </p>
        <div className="mt-4">
          <FileDownloadButtons />
        </div>
        <p className="mt-4">
          <Link className="text-[var(--gold)] underline" href="/proposal">
            Flip through slides
          </Link>
          {" · "}
          <Link className="text-[var(--gold)] underline" href="/proposal/print">
            Printable view
          </Link>
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-[var(--gold)] bg-white">
        <p className="bg-[#3A1C64] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          PDF preview — all {SLIDES.length} slides
        </p>
        <iframe
          title="ACRS proposal PDF"
          src="/api/slides/pdf"
          className="h-[min(80vh,54rem)] w-full bg-white"
        />
      </div>
    </div>
  );
}
