"use client";

import { useState } from "react";
import {
  MD_FILENAME,
  PDF_FILENAME,
  PPTX_FILENAME,
  PPTX_TEMPLATE_COPY,
  ZIP_FILENAME,
} from "@/lib/research/college";

type Offer = {
  label: string;
  href: string;
  filename: string;
  primary?: boolean;
};

const OFFERS: Offer[] = [
  {
    label: "Download PowerPoint",
    href: "/api/slides/pptx?download=1",
    filename: PPTX_FILENAME,
    primary: true,
  },
  {
    label: "Download PRP copy",
    href: `/${PPTX_TEMPLATE_COPY}`,
    filename: PPTX_TEMPLATE_COPY,
  },
  {
    label: "Download ZIP",
    href: "/api/slides/zip?download=1",
    filename: ZIP_FILENAME,
  },
  {
    label: "Download PDF",
    href: "/api/slides/pdf?download=1",
    filename: PDF_FILENAME,
  },
  {
    label: "Download Markdown",
    href: "/api/slides",
    filename: MD_FILENAME,
  },
];

async function saveFile(href: string, filename: string) {
  const response = await fetch(href, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not download ${filename} (${response.status})`);
  }
  const blob = await response.blob();
  if (blob.type.includes("text/html")) {
    throw new Error("The preview returned a web page instead of a file.");
  }
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

export function FileDownloadButtons() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  async function onDownload(offer: Offer) {
    setError(null);
    setSaved(null);
    setBusy(offer.filename);
    try {
      await saveFile(offer.href, offer.filename);
      setSaved(offer.filename);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Download failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--muted)]">
        Save the college-template deck to this computer. PowerPoint is the file
        to submit; PDF and Markdown are extras.
      </p>
      <div className="flex flex-wrap gap-2">
        {OFFERS.map((offer) => (
          <button
            key={offer.filename}
            type="button"
            disabled={busy !== null}
            onClick={() => void onDownload(offer)}
            className={
              offer.primary
                ? "inline-flex h-11 items-center rounded-md bg-[var(--gold)] px-5 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
                : "inline-flex h-11 items-center rounded-md border border-[var(--gold)] px-5 text-sm font-semibold text-[var(--gold)] disabled:opacity-60"
            }
          >
            {busy === offer.filename ? "Saving…" : offer.label}
          </button>
        ))}
      </div>
      {saved ? (
        <p className="text-sm text-[var(--gold)]">Saved {saved}.</p>
      ) : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <p className="text-xs text-[var(--muted)]">
        If a button is blocked in this preview, use the direct links:
        {OFFERS.map((offer) => (
          <span key={offer.filename}>
            {" "}
            <a
              className="underline text-[var(--gold)]"
              href={offer.href}
              download={offer.filename}
            >
              {offer.label.replace("Download ", "")}
            </a>
          </span>
        ))}
        .
      </p>
    </div>
  );
}
