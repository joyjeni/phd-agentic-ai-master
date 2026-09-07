"use client";

import { useEffect, useState } from "react";
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
    lines.push(`Limitations: ${item.limitations}`, "");
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
  const [index, setIndex] = useState(0);
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

      <CollegeSlideFrame section={slide.section} index={index + 1} total={SLIDES.length}>
        <h2 className="font-serif text-3xl leading-tight text-[#1a1214]">{slide.title}</h2>
        {slide.body ? (
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5c4a4e]">{slide.body}</p>
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
                className="rounded-md border border-[#7C1D2E]/35 bg-white/70 p-3"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7C1D2E]">
                  Evidence {item.n}
                </p>
                <dl className="mt-2 space-y-1.5 text-[12px] leading-snug text-[#1a1214]">
                  <div>
                    <dt className="font-semibold text-[#7C1D2E]">Author(s)</dt>
                    <dd>{item.authors}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#7C1D2E]">Year</dt>
                    <dd>{item.year}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#7C1D2E]">Title</dt>
                    <dd>{item.title}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#7C1D2E]">Publication</dt>
                    <dd>{item.venue}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#7C1D2E]">Objective</dt>
                    <dd>{item.objective}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#7C1D2E]">Methodology</dt>
                    <dd>{item.methodology}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#7C1D2E]">Findings</dt>
                    <dd>{item.findings}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#7C1D2E]">Limitations</dt>
                    <dd>{item.limitations}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : null}
        {diagram ? (
          <div className="mt-5 rounded-md border border-[#c4a35a] bg-[#1a1214] p-3">
            <ArchitectureSvg variant={diagram} />
          </div>
        ) : null}
        {slide.kind === "contents" ? (
          <ol className="mt-5 grid gap-1 sm:grid-cols-2">
            {CONTENTS.map((item) => (
              <li key={item.slideId}>
                <button
                  className="w-full rounded-md px-2 py-1 text-left text-sm text-[#5c4a4e] hover:bg-[#7C1D2E]/10 hover:text-[#7C1D2E]"
                  onClick={() =>
                    setIndex(SLIDES.findIndex((entry) => entry.id === item.slideId))
                  }
                >
                  <span className="mr-2 text-[#7C1D2E]">{item.n}</span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
        ) : slide.table ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-[#7C1D2E] text-[#7C1D2E]">
                  {slide.table.headers.map((header) => (
                    <th key={header} className="px-2 py-2 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slide.table.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-[#c4a35a]/50">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`${row[0]}-${cellIndex}`}
                        className={
                          cellIndex === 0
                            ? "w-[34%] px-2 py-2 align-top font-medium text-[#7C1D2E]"
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
          <div className="mt-8 space-y-1 text-center">
            <p className="text-lg text-[#5c4a4e]">
              Presented By:{" "}
              <span className="font-semibold text-[#6B4C9A]">{COLLEGE.scholar}</span>
            </p>
            <p className="text-sm text-[#5c4a4e]">(Reg. No. {COLLEGE.registerNo})</p>
            <p className="mt-4 text-lg font-semibold text-[#6B4C9A]">
              Supervisor: {COLLEGE.supervisor}
            </p>
            <p className="text-sm text-[#5c4a4e]">{COLLEGE.departmentLine}</p>
            <p className="text-sm text-[#5c4a4e]">{COLLEGE.facultyLine}</p>
          </div>
        ) : slide.bullets?.length ? (
          <ul className="mt-5 space-y-2">
            {slide.bullets.map((bullet) => (
              <li
                key={bullet}
                className="border-l-2 border-[#7C1D2E] pl-3 text-sm leading-relaxed text-[#1a1214]"
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
