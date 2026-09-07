import { Suspense } from "react";
import { CONTENTS, SLIDES } from "@/lib/research/slides";
import { ArchitectureSvg, type DiagramKind } from "@/components/architecture-svg";
import { CollegeSlideFrame } from "@/components/college-slide";
import { PrintActions } from "@/components/print-actions";
import { COLLEGE } from "@/lib/research/college";

function diagramFor(diagram: (typeof SLIDES)[number]["diagram"]): DiagramKind | null {
  if (!diagram || diagram === "none") return null;
  if (diagram === "e2e") return "proposed";
  return diagram;
}

export default function PrintSlidesPage() {
  return (
    <div className="space-y-6 print:space-y-0">
      <header className="print:hidden">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          {COLLEGE.university}
        </p>
        <h1 className="mt-2 font-serif text-4xl">
          {COLLEGE.kicker} — all {SLIDES.length} slides
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
          College template for {COLLEGE.scholar} ({COLLEGE.registerNo}). Use Print /
          Save PDF for a PDF, or Download PowerPoint for the `.pptx` file.
        </p>
        <div className="mt-4">
          <Suspense fallback={null}>
            <PrintActions />
          </Suspense>
        </div>
      </header>
      {SLIDES.map((slide, index) => {
        const diagram = diagramFor(slide.diagram);
        return (
          <div key={slide.id} className="college-print-page">
            <CollegeSlideFrame section={slide.section} index={index + 1} total={SLIDES.length}>
              <h2 className="font-serif text-2xl text-[#1a1214]">{slide.title}</h2>
              {slide.body ? (
                <p className="mt-3 text-sm leading-relaxed text-[#5c4a4e]">{slide.body}</p>
              ) : null}
              {(slide.paragraphs ?? []).map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-2 text-sm leading-relaxed text-[#1a1214]"
                >
                  {paragraph}
                </p>
              ))}
              {diagram ? (
                <div className="mt-4 rounded-md border border-[#c4a35a] bg-[#1a1214] p-3">
                  <ArchitectureSvg variant={diagram} />
                </div>
              ) : null}
              {slide.table ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm text-[#1a1214]">
                    <thead>
                      <tr>
                        {slide.table.headers.map((header) => (
                          <th
                            key={header}
                            className="border-b border-[#7C1D2E] px-2 py-1 text-[#7C1D2E]"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {slide.table.rows.map((row) => (
                        <tr key={row[0]}>
                          {row.map((cell) => (
                            <td
                              key={cell}
                              className="border-b border-[#c4a35a]/40 px-2 py-1 align-top"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <ul className="mt-4 space-y-2 text-sm text-[#1a1214]">
                {(slide.kind === "contents"
                  ? CONTENTS.map((item) => `${item.n}  ${item.title}`)
                  : slide.bullets ?? []
                ).map((bullet) => (
                  <li key={bullet} className="border-l-2 border-[#7C1D2E] pl-3">
                    {bullet}
                  </li>
                ))}
              </ul>
              {slide.footnote ? (
                <p className="mt-4 text-xs text-[#5c4a4e]">{slide.footnote}</p>
              ) : null}
            </CollegeSlideFrame>
          </div>
        );
      })}
    </div>
  );
}
