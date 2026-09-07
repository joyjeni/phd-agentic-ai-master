import Link from "next/link";

export function DownloadSlides() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        This preview cannot save a <code>.pptx</code>. Open the PDF, or take the
        PowerPoint from the files attached to the chat.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/download"
          className="inline-flex h-11 items-center rounded-md bg-[var(--gold)] px-5 text-sm font-semibold text-[var(--ink)]"
        >
          View PDF
        </Link>
        <Link
          href="/proposal"
          className="inline-flex h-11 items-center rounded-md border border-[var(--gold)] px-5 text-sm font-semibold text-[var(--gold)]"
        >
          Flip through slides
        </Link>
      </div>
    </div>
  );
}
