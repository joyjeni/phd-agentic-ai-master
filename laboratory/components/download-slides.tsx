import { FileDownloadButtons } from "@/components/file-download-buttons";
import Link from "next/link";

export function DownloadSlides() {
  return (
    <div className="space-y-3">
      <FileDownloadButtons />
      <div className="flex flex-wrap gap-2">
        <Link
          href="/download"
          className="inline-flex h-11 items-center rounded-md border border-[var(--line)] px-5 text-sm font-semibold text-[var(--paper)]"
        >
          Open download page
        </Link>
        <Link
          href="/proposal"
          className="inline-flex h-11 items-center rounded-md border border-[var(--line)] px-5 text-sm font-semibold text-[var(--paper)]"
        >
          Flip through slides
        </Link>
      </div>
    </div>
  );
}
