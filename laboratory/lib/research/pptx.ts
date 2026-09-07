import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import PptxGenJS from "pptxgenjs";
import { COLLEGE, PPTX_FILENAME } from "./college";
import { CONTENTS, SLIDES, type Slide } from "./slides";

const W = 13.33;
const H = 7.5;

function chrome(pptx: PptxGenJS, slide: PptxGenJS.Slide, index: number) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: 0.78,
    fill: { color: COLLEGE.maroon },
    line: { color: COLLEGE.maroon },
  });
  slide.addText(COLLEGE.university.toUpperCase(), {
    x: 0.35,
    y: 0.1,
    w: 10.4,
    h: 0.32,
    fontFace: "Calibri",
    fontSize: 13,
    bold: true,
    color: "FFFFFF",
    margin: 0,
  });
  slide.addText(`${COLLEGE.facultyHeader}  ·  ${COLLEGE.kicker}`, {
    x: 0.35,
    y: 0.4,
    w: 10.4,
    h: 0.28,
    fontFace: "Calibri",
    fontSize: 11,
    color: COLLEGE.gold,
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0.78,
    w: W,
    h: 0.06,
    fill: { color: COLLEGE.gold },
    line: { color: COLLEGE.gold },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 7.18,
    w: W,
    h: 0.32,
    fill: { color: COLLEGE.maroon },
    line: { color: COLLEGE.maroon },
  });
  slide.addText(
    `${COLLEGE.scholar}  |  ${COLLEGE.registerNo}  |  ${COLLEGE.mode}  |  Supervisor: ${COLLEGE.supervisor}`,
    {
      x: 0.3,
      y: 7.2,
      w: 10.6,
      h: 0.26,
      fontFace: "Calibri",
      fontSize: 10,
      color: "FFFFFF",
      margin: 0,
    },
  );
  slide.addText(`${index} / ${SLIDES.length}`, {
    x: 11.1,
    y: 7.2,
    w: 1.9,
    h: 0.26,
    fontFace: "Calibri",
    fontSize: 10,
    color: COLLEGE.gold,
    align: "right",
    margin: 0,
  });
}

function addBody(slide: PptxGenJS.Slide, text: string, y: number, h = 0.7) {
  slide.addText(text, {
    x: 0.4,
    y,
    w: 12.5,
    h,
    fontFace: "Calibri",
    fontSize: 14,
    color: COLLEGE.ink,
    valign: "top",
  });
}

function flowRow(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  labels: string[],
  y: number,
  fill: string,
) {
  const gap = 0.12;
  const w = (12.4 - gap * (labels.length - 1)) / labels.length;
  labels.forEach((label, i) => {
    const x = 0.45 + i * (w + gap);
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w,
      h: 0.55,
      fill: { color: fill },
      line: { color: COLLEGE.gold },
      rectRadius: 0.06,
    });
    slide.addText(label, {
      x,
      y,
      w,
      h: 0.55,
      fontFace: "Calibri",
      fontSize: 10,
      color: "FFFFFF",
      align: "center",
      valign: "middle",
      margin: 0,
    });
  });
}

function addDiagram(pptx: PptxGenJS, slide: PptxGenJS.Slide, kind: Slide["diagram"], y: number) {
  if (!kind || kind === "none") return;
  if (kind === "sota") {
    slide.addText("SOTA (grey): ToolLLM + ToolRerank + one planner — turn-amnesic, no write-back.", {
      x: 0.4,
      y,
      w: 12.5,
      h: 0.28,
      fontSize: 11,
      fontFace: "Calibri",
      color: COLLEGE.muted,
    });
    flowRow(pptx, slide, ["Query only", "SBERT", "ToolRerank", "One LLM", "Answer"], y + 0.32, "4A2A32");
    return;
  }
  if (kind === "e2e" || kind === "integrated") {
    slide.addText("ACRS loop (maroon): typed artefacts. Green path is the increment, not a metric.", {
      x: 0.4,
      y,
      w: 12.5,
      h: 0.28,
      fontSize: 11,
      fontFace: "Calibri",
      color: COLLEGE.muted,
    });
    flowRow(
      pptx,
      slide,
      ["q + M", "SATR", "APRR", "MNCD", "FCNP", "a + M"],
      y + 0.32,
      COLLEGE.maroon,
    );
    return;
  }
  const rows: Record<string, [string[], string[]]> = {
    "compare-satr": [
      ["Query embed", "SBERT (Qin ICLR 2024)", "ToolRerank (Zheng)", "Planner"],
      ["q + H + M_t", "Session fusion", "Hierarchy cut", "Shortlist → APRR"],
    ],
    satr: [
      ["Query embed", "SBERT (Qin ICLR 2024)", "ToolRerank (Zheng)", "Planner"],
      ["q + H + M_t", "Session fusion", "Hierarchy cut", "Shortlist → APRR"],
    ],
    "compare-aprr": [
      ["Query", "MasRouter / RouteLLM / SOP", "Pick an LLM"],
      ["SATR shortlist", "Dirichlet–Thompson", "Specialist path → MNCD"],
    ],
    aprr: [
      ["Query", "MasRouter / RouteLLM / SOP", "Pick an LLM"],
      ["SATR shortlist", "Dirichlet–Thompson", "Specialist path → MNCD"],
    ],
    "compare-mncd": [
      ["Manager LLM", "Star / chat messages"],
      ["Mesh gossip", "Score-sum over tool IDs", "Live data.gov.in"],
    ],
    mncd: [
      ["Manager LLM", "Star / chat messages"],
      ["Mesh gossip", "Score-sum over tool IDs", "Live data.gov.in"],
    ],
    "compare-fcnp": [
      ["Long prompt", "LLMLingua tokens", "No write-back"],
      ["MNCD citations", "Kirchhoff / Physarum", "M_t → SATR"],
    ],
    fcnp: [
      ["Long prompt", "LLMLingua tokens", "No write-back"],
      ["MNCD citations", "Kirchhoff / Physarum", "M_t → SATR"],
    ],
  };
  const pair = rows[kind];
  if (!pair) return;
  slide.addText("Top: published SOTA. Bottom: this proposal. No numerical targets.", {
    x: 0.4,
    y,
    w: 12.5,
    h: 0.26,
    fontSize: 11,
    fontFace: "Calibri",
    color: COLLEGE.muted,
  });
  flowRow(pptx, slide, pair[0], y + 0.3, "4A2A32");
  flowRow(pptx, slide, pair[1], y + 0.95, COLLEGE.maroon);
}

export async function buildProposalPptx(): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "LAYOUT_WIDE", width: W, height: H });
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = COLLEGE.scholar;
  pptx.title = COLLEGE.title;
  pptx.subject = `${COLLEGE.kicker} · ${COLLEGE.programme} · ${COLLEGE.university}`;
  pptx.company = COLLEGE.university;

  SLIDES.forEach((entry, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: COLLEGE.cream };
    chrome(pptx, slide, index + 1);

    slide.addText(COLLEGE.kicker, {
      x: 0.4,
      y: 0.95,
      w: 12.5,
      h: 0.28,
      fontFace: "Calibri",
      fontSize: 11,
      bold: true,
      color: COLLEGE.maroon,
      charSpacing: 3,
    });
    slide.addText(entry.title, {
      x: 0.4,
      y: 1.2,
      w: 12.5,
      h: 0.55,
      fontFace: "Calibri",
      fontSize: 22,
      bold: true,
      color: COLLEGE.ink,
      valign: "top",
    });

    let y = 1.8;
    if (entry.body) {
      addBody(slide, entry.body, y, 0.7);
      y += 0.72;
    }

    if (entry.kind === "contents") {
      const items = CONTENTS.map((item) => ({
        text: `${item.n}   ${item.title}`,
        options: { breakLine: true as const, fontSize: 13, fontFace: "Calibri", color: COLLEGE.ink },
      }));
      slide.addText(items, { x: 0.5, y, w: 12.3, h: 4.9, valign: "top" });
      return;
    }

    if (entry.table) {
      slide.addTable(
        [
          entry.table.headers.map((h) => ({
            text: h,
            options: { fill: { color: COLLEGE.maroon }, color: "FFFFFF", bold: true, align: "left" as const },
          })),
          ...entry.table.rows.map((row) =>
            row.map((cell) => ({
              text: cell,
              options: { color: COLLEGE.ink, align: "left" as const, valign: "top" as const },
            })),
          ),
        ],
        {
          x: 0.4,
          y,
          w: 12.5,
          colW:
            entry.id === "solve-gap"
              ? [3.3, 2.5, 6.7]
              : entry.table.headers.length === 2
                ? [3.8, 8.7]
                : entry.table.headers.length === 3
                  ? [1.8, 4.2, 6.5]
                  : [2.4, 3.3, 2.6, 4.2],
          fontSize: entry.id === "student" ? 13 : 11,
          border: [
            { pt: 0.5, color: COLLEGE.gold },
            { pt: 0.5, color: COLLEGE.gold },
            { pt: 0.5, color: COLLEGE.gold },
            { pt: 0.5, color: COLLEGE.gold },
          ],
          fontFace: "Calibri",
          valign: "top",
        },
      );
      return;
    }

    if (entry.evidence?.length) {
      const n = entry.evidence.length;
      const gap = 0.18;
      const total = 12.5;
      const width = (total - gap * (n - 1)) / n;
      for (let i = 0; i < n; i += 1) {
        const ev = entry.evidence[i];
        if (!ev) continue;
        const x = 0.4 + i * (width + gap);
        slide.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w: width,
          h: 4.55,
          fill: { color: "FFFFFF" },
          line: { color: COLLEGE.maroon, pt: 1.25 },
          rectRadius: 0.08,
        });
        slide.addText(
          [
            {
              text: `Evidence ${ev.n}`,
              options: { bold: true, color: COLLEGE.maroon, fontSize: 13, breakLine: true },
            },
            { text: "Author(s): ", options: { bold: true, color: COLLEGE.maroon, fontSize: 10 } },
            { text: ev.authors, options: { color: COLLEGE.ink, fontSize: 10, breakLine: true } },
            { text: "Year: ", options: { bold: true, color: COLLEGE.maroon, fontSize: 10 } },
            { text: ev.year, options: { color: COLLEGE.ink, fontSize: 10, breakLine: true } },
            { text: "Title: ", options: { bold: true, color: COLLEGE.maroon, fontSize: 10 } },
            { text: ev.title, options: { color: COLLEGE.ink, fontSize: 10, breakLine: true } },
            { text: "Publication: ", options: { bold: true, color: COLLEGE.maroon, fontSize: 10 } },
            { text: ev.venue, options: { color: COLLEGE.ink, fontSize: 10, breakLine: true } },
            { text: "Objective: ", options: { bold: true, color: COLLEGE.maroon, fontSize: 10 } },
            { text: ev.objective, options: { color: COLLEGE.ink, fontSize: 10, breakLine: true } },
            { text: "Methodology: ", options: { bold: true, color: COLLEGE.maroon, fontSize: 10 } },
            { text: ev.methodology, options: { color: COLLEGE.ink, fontSize: 10, breakLine: true } },
            { text: "Findings: ", options: { bold: true, color: COLLEGE.maroon, fontSize: 10 } },
            { text: ev.findings, options: { color: COLLEGE.ink, fontSize: 10, breakLine: true } },
            { text: "Limitations: ", options: { bold: true, color: COLLEGE.maroon, fontSize: 10 } },
            { text: ev.limitations, options: { color: COLLEGE.ink, fontSize: 10, breakLine: true } },
          ],
          { x: x + 0.1, y: y + 0.08, w: width - 0.2, h: 4.35, valign: "top", fontFace: "Calibri" },
        );
      }
      return;
    }

    const paras = entry.paragraphs ?? [];
    if (paras.length) {
      const leftover = entry.diagram ? 2.2 : 4.8;
      slide.addText(
        paras.map((p) => ({
          text: p,
          options: { breakLine: true, fontSize: 13, fontFace: "Calibri", color: COLLEGE.ink },
        })),
        { x: 0.4, y, w: 12.5, h: leftover, valign: "top" },
      );
      y += leftover + 0.08;
    }

    const bullets = entry.bullets ?? [];
    if (bullets.length) {
      slide.addText(
        bullets.map((b) => ({
          text: b,
          options: { bullet: true, breakLine: true, fontSize: 14, fontFace: "Calibri", color: COLLEGE.ink },
        })),
        { x: 0.45, y, w: 12.4, h: entry.diagram ? 2.0 : 4.6, valign: "top" },
      );
      y += entry.diagram ? 2.05 : 0;
    }

    if (entry.diagram && entry.diagram !== "none") {
      addDiagram(pptx, slide, entry.diagram, Math.min(y, 5.15));
    }

    if (entry.footnote) {
      slide.addText(entry.footnote, {
        x: 0.4,
        y: 6.85,
        w: 12.5,
        h: 0.28,
        fontFace: "Calibri",
        fontSize: 10,
        italic: true,
        color: COLLEGE.muted,
      });
    }
  });

  const out = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(out as ArrayBuffer);
}

export { PPTX_FILENAME };

/** Prefer the PRP-built deck (auto date + slide numbers) when present. */
export function readBuiltPptx(): Buffer | null {
  for (const relative of [
    join("public", PPTX_FILENAME),
    join("docs/slides", PPTX_FILENAME),
  ]) {
    const absolute = join(process.cwd(), relative);
    if (existsSync(absolute)) {
      return readFileSync(absolute);
    }
  }
  return null;
}
