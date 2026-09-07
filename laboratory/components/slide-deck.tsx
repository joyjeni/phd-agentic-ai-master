"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CONTENTS, SLIDES, type Slide } from "@/lib/research/slides";
import { ArchitectureSvg, type DiagramKind } from "@/components/architecture-svg";
import { Button } from "@/components/ui/button";
import { CollegeSlideFrame } from "@/components/college-slide";
import { DownloadSlides } from "@/components/download-slides";
import { COLLEGE } from "@/lib/research/college";

function diagramFor(slide: Slide): DiagramKind | null {
  if (!slide.diagram || slide.diagram === "none") return null;
  if (slide.diagram === "e2e") return "proposed";
  return slide.diagram;
}

function initialSlideIndex(raw: string | null): number {
  if (!raw) return 0;
  const byId = SLIDES.findIndex((slide) => slide.id === raw);
  if (byId >= 0) return byId;
  const n = Number.parseInt(raw, 10);
  if (Number.isFinite(n) && n >= 1 && n <= SLIDES.length) return n - 1;
  return 0;
}

function slidePlainText(slide: Slide): string {
  const lines = [
    COLLEGE.university,
    COLLEGE.kicker,
    `${COLLEGE.scholar} · ${COLLEGE.registerNo}`,
    slide.section,
    slide.title,
    "",
  ];
  if (slide.body) lines.push(slide.body, "");
  for (const item of slide.evidence ?? []) {
    lines.push(`Evidence ${item.n}`);
    lines.push(`Author(s): ${item.authors}`);
    lines.push(`Year: ${item.year}`);
    lines.push(`Title: ${item.title}`);
    lines.push(`Publication: ${item.venue}`);
    lines.push(`Objective: ${item.objective}`);
    lines.push(`Methodology: ${item.methodology}`);
    lines.push(`Findings: ${item.findings}`);
    lines.push(`Limitations: ${item.limitations}`);
    lines.push(`To solve the research gap: ${item.toSolve}`, "");
  }
  for (const paragraph of slide.paragraphs ?? []) lines.push(paragraph, "");
  if (slide.kind === "contents") {
    for (const item of CONTENTS) lines.push(`${item.n}  ${item.title}`);
  } else if (slide.table) {
    lines.push(slide.table.headers.join(" | "));
    for (const row of slide.table.rows) lines.push(row.join(" | "));
  }
  for (const bullet of slide.bullets ?? []) lines.push(`• ${bullet}`);
  if (slide.footnote) lines.push("", slide.footnote);
  return lines.join("\n");
}

export function SlideDeck() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--muted)]">Loading slides…</p>}>
      <SlideDeckInner />
    </Suspense>
  );
}

function SlideDeckInner() {
  const searchParams = useSearchParams();
  const [index, setIndex] = useState(() => initialSlideIndex(searchParams.get("slide")));
  const [copied, setCopied] = useState(false);
  const slide = SLIDES[index];
  const diagram = diagramFor(slide);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        setIndex((value) => Math.min(SLIDES.length - 1, value + 1));
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        setIndex((value) => Math.max(0, value - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
          {COLLEGE.scholar} · {COLLEGE.registerNo} · {index + 1}/{SLIDES.length}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={index === 0}
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => setIndex((value) => Math.min(SLIDES.length - 1, value + 1))}
            disabled={index === SLIDES.length - 1}
          >
            Next
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await navigator.clipboard.writeText(slidePlainText(slide));
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            }}
          >
            {copied ? "Copied" : "Copy this slide"}
          </Button>
        </div>
      </div>
      <DownloadSlides />

      <CollegeSlideFrame
        heading={slide.title}
        variant={slide.id === "title" ? "title" : slide.id === "student" ? "student" : "content"}
        index={index + 1}
        total={SLIDES.length}
      >
        {slide.body && slide.id !== "title" ? (
          <p className="mt-1 max-w-4xl text-sm leading-relaxed text-[#5a5a5a]">{slide.body}</p>
        ) : null}
        {(slide.paragraphs ?? []).map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="mt-3 max-w-3xl text-sm leading-relaxed text-[#1a1214]/90"
          >
            {paragraph}
          </p>
        ))}
        {slide.evidence?.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {slide.evidence.map((item) => (
              <article
                key={item.n}
                className="rounded-md border border-[#3A1C64]/25 bg-white p-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#3A1C64]">
                  Evidence {item.n}
                </p>
                <dl className="mt-2 space-y-1.5 text-[12px] leading-snug text-[#1a1214]">
                  <div>
                    <dt className="font-semibold text-[#3A1C64]">Author(s)</dt>
                    <dd>{item.authors}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#3A1C64]">Year</dt>
                    <dd>{item.year}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#3A1C64]">Title</dt>
                    <dd>{item.title}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#3A1C64]">Publication</dt>
                    <dd>{item.venue}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#3A1C64]">Objective</dt>
                    <dd>{item.objective}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#3A1C64]">Methodology</dt>
                    <dd>{item.methodology}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#3A1C64]">Findings</dt>
                    <dd>{item.findings}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#3A1C64]">Limitations</dt>
                    <dd>{item.limitations}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#3A1C64]">To solve the research gap</dt>
                    <dd>{item.toSolve}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : null}
        {diagram ? (
          <div className="mt-3 overflow-visible rounded-md border border-[#5B9BD5] bg-[#0f1c2a] p-2">
            <ArchitectureSvg variant={diagram} />
          </div>
        ) : null}
        {slide.kind === "contents" ? (
          <ol className="mt-5 grid gap-1 sm:grid-cols-2">
            {CONTENTS.map((item) => (
              <li key={item.slideId}>
                <button
                  className="w-full rounded-md px-2 py-1 text-left text-sm text-[#5a5a5a] hover:bg-[#3A1C64]/10 hover:text-[#3A1C64]"
                  onClick={() =>
                    setIndex(SLIDES.findIndex((entry) => entry.id === item.slideId))
                  }
                >
                  <span className="mr-2 text-[#3A1C64]">{item.n}</span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        ) : slide.table ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#3A1C64] text-[#3A1C64]">
                  {slide.table.headers.map((header) => (
                    <th key={header} className="px-2 py-2 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slide.table.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-[#5B9BD5]/40 bg-[#E9EFF7]/40">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${row[0]}-${cellIndex}`}
                        className={
                          cellIndex === 0
                            ? "w-[34%] px-2 py-2 align-top font-medium text-[#3A1C64]"
                            : "px-2 py-2 align-top text-[#1a1214]"
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : slide.evidence?.length ? null : slide.id === "title" ? (
          <div className="mt-4 space-y-1 text-center">
            <p className="text-lg font-semibold text-[#1B1464]">{slide.bullets?.[0]}</p>
            <p className="text-sm text-[#5a5a5a]">{slide.bullets?.[1]}</p>
            <p className="mt-3 text-lg font-semibold text-[#3A1C64]">{slide.bullets?.[2]}</p>
            <p className="text-sm text-[#5a5a5a]">{COLLEGE.departmentLine}</p>
            <p className="text-sm text-[#5a5a5a]">{COLLEGE.facultyLine}</p>
          </div>
        ) : slide.bullets?.length ? (
          <ul className={`mt-4 ${diagram ? "grid gap-2 sm:grid-cols-2" : "space-y-2"}`}>
            {slide.bullets.map((bullet) => (
              <li
                key={bullet}
                className="border-l-2 border-[#3A1C64] pl-3 text-sm leading-relaxed text-[#1a1a1a]"
              >
                {bullet}
              </li>
            ))}
          </ul>
        ) : null}
        {slide.footnote ? (
          <p className="mt-5 text-xs text-[#5c4a4e]">{slide.footnote}</p>
        ) : null}
      </CollegeSlideFrame>
    </div>
  );
}
