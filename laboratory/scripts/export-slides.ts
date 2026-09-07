import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { COLLEGE, PDF_FILENAME, PPTX_FILENAME, PPTX_TEMPLATE_COPY, STUDENT_DETAILS, ZIP_FILENAME } from "../lib/research/college.ts";
import { literatureSurveyMarkdown, linkDoisMarkdown, parseDoi, doiHref } from "../lib/research/literature.ts";
import { allSlidesMarkdown, CONTENTS, SLIDES } from "../lib/research/slides.ts";

const dir = join(import.meta.dirname, "../docs/slides");
mkdirSync(dir, { recursive: true });

const keep = new Set(["README.md"]);
for (const file of readdirSync(dir)) {
  if (file.endsWith(".md") && !keep.has(file)) unlinkSync(join(dir, file));
}

function slug(slide: (typeof SLIDES)[number], index: number): string {
  const base = slide.id.replace(/[^a-z0-9-]/gi, "-");
  return `${String(index + 1).padStart(2, "0")}-${base}.md`;
}

function render(slide: (typeof SLIDES)[number], index: number): string {
  const lines = [
    `# ${String(index + 1).padStart(2, "0")} ${slide.title}`,
    "",
    `*${slide.section}*`,
    "",
  ];
  if (slide.body) lines.push(linkDoisMarkdown(slide.body), "");
  if (slide.evidence?.length) {
    for (const item of slide.evidence) {
      lines.push(`**Evidence ${item.n}**`, "");
      lines.push(`- Author(s): ${item.authors}`);
      lines.push(`- Year: ${item.year}`);
      lines.push(`- Title: ${item.title}`);
      lines.push(`- Publication: ${linkDoisMarkdown(item.venue)}`);
      const doi = parseDoi(item.venue);
      if (doi) lines.push(`- DOI: ${doiHref(doi)}`);
      lines.push(`- Objective: ${item.objective}`);
      lines.push(`- Methodology: ${item.methodology}`);
      lines.push(`- Findings: ${item.findings}`);
      lines.push(`- Limitations: ${item.limitations}`);
      lines.push(`- To solve the research gap: ${item.toSolve}`, "");
    }
  }
  for (const paragraph of slide.paragraphs ?? []) lines.push(paragraph, "");
  if (slide.kind === "contents") {
    lines.push("Paste into the university Google Slides template in this order.", "");
    for (const item of CONTENTS) {
      lines.push(`${item.n}  ${item.title}`);
    }
    lines.push("");
  }
  if (slide.table) {
    lines.push(`| ${slide.table.headers.join(" | ")} |`);
    lines.push(`| ${slide.table.headers.map(() => "---").join(" | ")} |`);
    for (const row of slide.table.rows) lines.push(`| ${row.join(" | ")} |`);
    lines.push("");
  }
  if (!slide.evidence?.length) {
    for (const bullet of slide.bullets ?? []) lines.push(`- ${linkDoisMarkdown(bullet)}`);
    if (slide.bullets?.length) lines.push("");
  }
  if (slide.diagram && slide.diagram !== "none") {
    lines.push(`Diagram: \`${slide.diagram}\` — open /architecture in the laboratory.`, "");
  }
  if (slide.footnote) lines.push(`_${slide.footnote}_`, "");
  lines.push(
    "Source of truth: `lib/research/literature.ts` (Evidence 1…N) and `lib/research/slides.ts`. Paste into the MSRUAS Google Slides template in Contents order.",
    "",
  );
  return lines.join("\n");
}

const readmeRows = SLIDES.map((slide, index) => {
  const file = slug(slide, index);
  writeFileSync(join(dir, file), render(slide, index));
  return `| ${String(index + 1).padStart(2, "0")} | [\`${file}\`](./${file}) | ${slide.title} |`;
});

writeFileSync(
  join(dir, "README.md"),
  [
    "# Where the updated slides are",
    "",
    "**This is the file:**",
    "",
    "[`docs/slides/ACRS_PhD_Proposal_JenishaT_24ETRP720001.pptx`](./ACRS_PhD_Proposal_JenishaT_24ETRP720001.pptx)",
    "",
    "College-template PowerPoint for **Jenisha T** (Register No. **24ETRP720001**). White-background Gowrishankar PRP2 chrome with the official Ramaiah logo on every slide. Same deck is also saved as `Gowrishankar_PPT_PRP2_ACRS_JenishaT.pptx` (PRP copy with automatic date + slide numbers).",
    "In the lab: **Download PPTX** in the nav, `/download`, `/ACRS_PhD_Proposal_JenishaT_24ETRP720001.pptx`, or the `.zip`.",
    "",
    "MSRUAS / FET research-proposal template. Required outline: Introduction, Literature Review, Summary of Literature Review, To Solve the Research Gap, Identified Research Problem, Research Title & Aim, Research Objectives, Research Questions, Research Methodology (per objective), Conclusion.",
    "Do not open a `.pptx` in Cursor — it is binary. Edit `lib/research/slides.ts` (canonical) or these `.md` files, preview at `/proposal`, then paste into Google Slides.",
    "",
    "Proposal-stage: no NDCG, latency, token, or accuracy commitments.",
    "",
    "| # | File | Title |",
    "|---|---|---|",
    ...readmeRows,
    "",
  ].join("\n"),
);

writeFileSync(join(import.meta.dirname, "../docs/PROPOSAL_SLIDES.md"), allSlidesMarkdown());
writeFileSync(join(import.meta.dirname, "../docs/LITERATURE_SURVEY.md"), literatureSurveyMarkdown());

writeFileSync(
  join(dir, "slides.json"),
  JSON.stringify(
    {
      college: COLLEGE,
      studentDetails: STUDENT_DETAILS,
      filenames: {
        pptx: PPTX_FILENAME,
        templateCopy: PPTX_TEMPLATE_COPY,
        zip: ZIP_FILENAME,
        pdf: PDF_FILENAME,
      },
      contents: CONTENTS,
      slides: SLIDES,
    },
    null,
    2,
  ),
);
console.log(`wrote ${SLIDES.length} slides`);
