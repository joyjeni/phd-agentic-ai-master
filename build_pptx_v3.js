'use strict';
/**
 * ACRS PhD Research Proposal — build_pptx_v3.js
 * Generates ACRS_PhD_Proposal_v3.pptx (30 slides, Ramaiah University branding)
 * Run: node build_pptx_v3.js
 */

const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// ─── COLORS (6-char hex, NO # prefix) ────────────────────────────────────────
const C = {
  red:        'C8402A',   // Ramaiah Red — accents, footer bar, key numbers
  deepPurple: '3C2864',   // Ramaiah Deep Purple/Blue — headings, dark bg
  midPurple:  '6B4090',   // Ramaiah Mid Purple — sub-headings
  white:      'FFFFFF',
  lavender:   'F0EBF8',   // slide backgrounds
  darkText:   '1A1035',   // body text on light bg
  black:      '000000',
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const logoB64 = fs.readFileSync(
  path.join(__dirname, 'logo_b64.txt'), 'utf8'
).trim();

// ─── DIAGRAM IMAGES (base64-encoded PNGs for embedding) ───────────────────────
function readB64(name) {
  const p = path.join(__dirname, `${name}_b64.txt`);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  return null;
}
const DIAG = {
  obj1Arch: readB64('obj1_arch'),
  obj1Flow: readB64('obj1_flow'),
  obj2Arch: readB64('obj2_arch'),
  obj2Flow: readB64('obj2_flow'),
  obj3Arch: readB64('obj3_arch'),
  obj3Flow: readB64('obj3_flow'),
  obj4Arch: readB64('obj4_arch'),
  obj4Flow: readB64('obj4_flow'),
  overallArch: readB64('overall_arch'),
  overallFlow: readB64('overall_flow'),
};

/** Add a diagram image slide with header, optional caption, and image */
function addDiagramSlide(pptx, title, caption, imgB64, imgExt, slideNum, captionLines) {
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, title);
  addFooter(slide, slideNum);
  if (caption) {
    slide.addText(caption, {
      x: 0.35, y: 0.58, w: 12.6, h: 0.32,
      fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
    });
  }
  const imgY = caption ? 0.96 : 0.58;
  const imgH = 7.22 - imgY - 0.06;
  if (imgB64) {
    slide.addImage({
      data: `image/${imgExt};base64,${imgB64}`,
      x: 0.35, y: imgY, w: 12.63, h: imgH,
      sizing: { type: 'contain', w: 12.63, h: imgH },
    });
  } else {
    slide.addText('[Diagram not available — see repository for latest figure]', {
      x: 0.35, y: imgY + 2, w: 12.63, h: 0.5,
      fontSize: 14, color: C.red, fontFace: 'Calibri', align: 'center',
    });
  }
  return slide;
}

// ─── PRESENTATION SETUP ──────────────────────────────────────────────────────
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';  // 13.33" × 7.5"
pptx.author  = 'Jenisha T';
pptx.company = 'M. S. Ramaiah University of Applied Sciences';
pptx.subject = 'PhD Research Proposal — ACRS';
pptx.title   = 'Design and Evaluation of ACRS for Efficient Multi-Agent LLM Inference';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Add standard header bar + title text on content slides */
function addHeaderBar(slide, title) {
  // Full-width top bar — deep purple
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.5,
    fill: { color: C.deepPurple },
    line: { color: C.deepPurple },
  });
  // Title text in bar
  slide.addText(title, {
    x: 0.3, y: 0.05, w: 12.7, h: 0.42,
    fontSize: 22, bold: true, color: C.white,
    fontFace: 'Calibri', valign: 'middle', align: 'left',
    margin: 0,
  });
}

/** Add standard footer on content slides */
function addFooter(slide, slideNum) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.22, w: 13.33, h: 0.28,
    fill: { color: C.red },
    line: { color: C.red },
  });
  slide.addText(
    `ACRS — PRP-1 | M.S. Ramaiah University | Jenisha T | 24ETRP720001 | Slide ${slideNum}`,
    {
      x: 0.2, y: 7.23, w: 12.9, h: 0.24,
      fontSize: 8, color: C.white, fontFace: 'Calibri',
      bold: false, valign: 'middle', align: 'left',
    }
  );
}

/** Add white background on content slides */
function addContentBg(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.white },
    line: { color: C.white },
  });
}

/** Section divider slide — full bleed deepPurple */
function makeSectionDivider(pptx, sectionNum, sectionTitle, slideNum) {
  const slide = pptx.addSlide();
  // White background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.white }, line: { color: C.white },
  });
  // Deep purple accent bar on left
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 7.22,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  // Section number — red, large
  slide.addText(`${sectionNum}`, {
    x: 1, y: 1.5, w: 4, h: 2,
    fontSize: 80, bold: true, color: C.red,
    fontFace: 'Calibri', align: 'center', valign: 'middle',
  });
  // Section title — deep purple on white
  slide.addText(sectionTitle, {
    x: 4.5, y: 2.4, w: 8.3, h: 2.5,
    fontSize: 38, bold: true, color: C.deepPurple,
    fontFace: 'Calibri', align: 'left', valign: 'middle',
    wrap: true,
  });
  // Footer
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.22, w: 13.33, h: 0.28,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText(
    `ACRS — PRP-1 | M.S. Ramaiah University | Jenisha T | 24ETRP720001 | Slide ${slideNum}`,
    { x: 0.2, y: 7.23, w: 12.9, h: 0.24, fontSize: 8, color: C.white, fontFace: 'Calibri', valign: 'middle' }
  );
  return slide;
}

/** Objective divider slide */
function makeObjDivider(pptx, objNum, objLabel, slideNum) {
  const slide = pptx.addSlide();
  // White background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.white }, line: { color: C.white },
  });
  // Top accent bar — deep purple
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  // Bottom accent bar — red
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.14, w: 13.33, h: 0.08,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText(`Objective ${objNum}`, {
    x: 1, y: 1.2, w: 11.33, h: 0.9,
    fontSize: 28, bold: false, color: C.red,
    fontFace: 'Calibri', align: 'center',
  });
  slide.addText(objLabel, {
    x: 1, y: 2.2, w: 11.33, h: 3.2,
    fontSize: 38, bold: true, color: C.deepPurple,
    fontFace: 'Calibri', align: 'center', valign: 'middle', wrap: true,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.22, w: 13.33, h: 0.28,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText(
    `ACRS — PRP-1 | M.S. Ramaiah University | Jenisha T | 24ETRP720001 | Slide ${slideNum}`,
    { x: 0.2, y: 7.23, w: 12.9, h: 0.24, fontSize: 8, color: C.white, fontFace: 'Calibri', valign: 'middle' }
  );
  return slide;
}

/** White card with deep-purple border */
function addCard(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: opts.fill || C.white },
    line: { color: opts.border || C.deepPurple, pt: 1 },
  });
}

/** Bold label above a metric number */
function addMetric(slide, x, y, number, label) {
  slide.addText(number, {
    x, y, w: 2.8, h: 0.75,
    fontSize: 44, bold: true, color: C.red, fontFace: 'Calibri', align: 'center',
  });
  slide.addText(label, {
    x, y: y + 0.72, w: 2.8, h: 0.35,
    fontSize: 14, color: C.darkText, fontFace: 'Calibri', align: 'center',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 1 — TITLE SLIDE
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  // Full bleed dark background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  // TOP red bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.55,
    fill: { color: C.red }, line: { color: C.red },
  });
  // Logo — aspect ratio 404:125 = 3.232:1  → at h=0.38 → w=1.23
  slide.addImage({
    data: `image/jpeg;base64,${logoB64}`,
    x: 0.25, y: 0.08, w: 1.23, h: 0.38,
  });
  // University text top-right
  slide.addText('M. S. Ramaiah University of Applied Sciences | Faculty of Engineering & Technology', {
    x: 4.5, y: 0.1, w: 8.6, h: 0.35,
    fontSize: 14, color: C.white, fontFace: 'Calibri',
    bold: false, align: 'right', valign: 'middle',
  });
  // White horizontal rule
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 1.2, w: 12.33, h: 0,
    line: { color: C.white, pt: 1.5 },
  });
  // Main title
  slide.addText(
    'Design and Evaluation of ACRS\n(Adaptive Context Reasoning System)\nfor Efficient Multi-Agent LLM Inference',
    {
      x: 0.5, y: 1.35, w: 12.33, h: 2.4,
      fontSize: 34, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
      charSpacing: 0.5,
    }
  );
  // Subtitle
  slide.addText('PhD Research Proposal — PRP-1', {
    x: 0.5, y: 3.85, w: 12.33, h: 0.45,
    fontSize: 16, color: C.red, fontFace: 'Calibri',
    bold: true, align: 'center',
  });
  // Separator line 2
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 4.38, w: 12.33, h: 0,
    line: { color: C.white, pt: 0.75 },
  });

  // ── Two-column info panel ──────────────────────────────────────────────────
  // Vertical divider
  slide.addShape(pptx.ShapeType.line, {
    x: 6.66, y: 4.52, w: 0, h: 1.98,
    line: { color: C.red, pt: 1.5 },
  });

  // LEFT COLUMN — Research Student
  slide.addText('Research Student', {
    x: 0.5, y: 4.52, w: 5.9, h: 0.32,
    fontSize: 12, bold: true, color: C.red, fontFace: 'Calibri', align: 'left',
  });
  slide.addText('Jenisha T', {
    x: 0.5, y: 4.86, w: 5.9, h: 0.35,
    fontSize: 18, bold: true, color: C.white, fontFace: 'Calibri', align: 'left',
  });
  slide.addText('Reg. No.: 24ETRP720001', {
    x: 0.5, y: 5.24, w: 5.9, h: 0.28,
    fontSize: 13, color: C.white, fontFace: 'Calibri', align: 'left',
  });
  slide.addText('Dept. of Computer Science & Engineering', {
    x: 0.5, y: 5.54, w: 5.9, h: 0.28,
    fontSize: 13, color: C.white, fontFace: 'Calibri', align: 'left',
  });
  slide.addText('Faculty of Engineering & Technology', {
    x: 0.5, y: 5.84, w: 5.9, h: 0.28,
    fontSize: 13, color: C.white, fontFace: 'Calibri', align: 'left',
  });

  // RIGHT COLUMN — Supervisor
  slide.addText('Supervisor', {
    x: 7.0, y: 4.52, w: 5.83, h: 0.32,
    fontSize: 12, bold: true, color: C.red, fontFace: 'Calibri', align: 'left',
  });
  slide.addText('Dr. Jyothi A P', {
    x: 7.0, y: 4.86, w: 5.83, h: 0.35,
    fontSize: 18, bold: true, color: C.white, fontFace: 'Calibri', align: 'left',
  });
  slide.addText('Associate Professor & Programme Head (M&C)', {
    x: 7.0, y: 5.24, w: 5.83, h: 0.28,
    fontSize: 13, color: C.white, fontFace: 'Calibri', align: 'left', wrap: true,
  });
  slide.addText('Dept. of Computer Science & Engineering', {
    x: 7.0, y: 5.54, w: 5.83, h: 0.28,
    fontSize: 13, color: C.white, fontFace: 'Calibri', align: 'left',
  });
  slide.addText('M. S. Ramaiah University of Applied Sciences', {
    x: 7.0, y: 5.84, w: 5.83, h: 0.28,
    fontSize: 13, color: C.white, fontFace: 'Calibri', align: 'left',
  });

  // Date centred below both columns
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 6.22, w: 12.33, h: 0,
    line: { color: C.white, pt: 0.5, dashType: 'dash' },
  });
  slide.addText('June 2026  |  Bangalore — 560054', {
    x: 0.5, y: 6.3, w: 12.33, h: 0.32,
    fontSize: 13, color: C.red, fontFace: 'Calibri', align: 'center',
  });
  // BOTTOM red bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.2, w: 13.33, h: 0.3,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText(
    'ACRS — PhD Research Proposal (PRP-1) | M. S. Ramaiah University | CSE | Jenisha T | 24ETRP720001',
    { x: 0.2, y: 7.21, w: 12.9, h: 0.27, fontSize: 8, color: C.white, fontFace: 'Calibri', valign: 'middle' }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 2 — TABLE OF CONTENTS + ABBREVIATIONS
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Table of Contents');
  addFooter(slide, 2);

  const tocItems = [
    ['1', 'Problem Context', 'Slides 3–4'],
    ['2', 'Literature Review (Themes 1–4 + Gap Summary)', 'Slides 5–9'],
    ['3', 'Research Gaps → 4 Objectives', 'Slide 10'],
    ['4', 'Research Title, Aim & ACRS Framework', 'Slide 11'],
    ['5', 'Obj 1: SessionRerank+ — Tool Reranking', 'Slides 12–15'],
    ['6', 'Obj 2: APRR+CDR+PDR — Adaptive Routing', 'Slides 16–19'],
    ['7', 'Obj 3: MNCD — Context Distribution', 'Slides 20–23'],
    ['8', 'Obj 4: FCNP — Network Pruning', 'Slides 24–27'],
    ['9', 'Architecture, Algorithm Flow & Novelty Matrix', 'Slides 28–30'],
    ['10', 'Feasibility, Ethics, Methodology & Conclusion', 'Slides 31–34'],
    ['11', 'References', 'Slides 35–38'],
  ];

  tocItems.forEach(([num, label, pages], i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = col === 0 ? 0.3 : 6.8;
    const y = 0.65 + row * 0.56;
    // Number chip
    const badgeW = num.length > 1 ? 0.50 : 0.38;
    const labelOff = num.length > 1 ? 0.56 : 0.44;
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: badgeW, h: 0.36,
      fill: { color: C.deepPurple }, line: { color: C.deepPurple },
    });
    slide.addText(num, {
      x: x+0.01, y: y+0.02, w: badgeW - 0.02, h: 0.32,
      fontSize: num.length > 1 ? 12 : 14, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addText(label, {
      x: x + labelOff, y: y + 0.01, w: 5.5, h: 0.2,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri', bold: false,
    });
    slide.addText(pages, {
      x: x + labelOff, y: y + 0.2, w: 5.5, h: 0.18,
      fontSize: 14, color: C.midPurple, fontFace: 'Calibri', italic: true,
    });
  });

  // Abbreviations box — repositioned to fill blank gap, text enlarged for projection
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 4.0, w: 12.73, h: 1.6,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('Abbreviations & Full Forms:', {
    x: 0.45, y: 4.06, w: 4.0, h: 0.32,
    fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri',
  });
  const abbrevLine1 = 'ACRS = Adaptive Context Reasoning System   |   APRR = Adaptive Probabilistic Routing Reinforcement';
  const abbrevLine2 = 'CDR = Context-Driven Routing   |   PDR = Parallel Dispatch Routing   |   MNCD = Multi-Node Context Distribution';
  const abbrevLine3 = 'FCNP = Flow-Controlled Network Pruning   |   SessionRerank+ = Session-Aware Contextual Tool Reranker Plus';
  const abbrevLine4 = 'RL = Reinforcement Learning   |   KV = Key-Value (cache)   |   NDCG = Normalised Discounted Cumulative Gain';
  const abbrevLine5 = 'LLM = Large Language Model   |   PRP = PhD Research Proposal   |   API = Application Programming Interface   |   EO = Expected Outcome';
  [abbrevLine1,abbrevLine2,abbrevLine3,abbrevLine4,abbrevLine5].forEach((line,i) => {
    slide.addText(line, {
      x: 0.45, y: 4.42 + i*0.22, w: 12.5, h: 0.22,
      fontSize: 14, color: C.white, fontFace: 'Calibri',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 3 — SECTION DIVIDER: PROBLEM CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
makeSectionDivider(pptx, 'I', 'Problem Context:\nWhy Multi-Agent LLM Inference Fails at Scale', 3);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 4 — PROBLEM CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Problem Context: The Four Core Challenges');
  addFooter(slide, 4);

  slide.addText('Modern multi-agent LLM (Large Language Model) systems face four critical bottlenecks that prevent real-world deployment:', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  const problems = [
    {
      num: 'P1',
      title: 'Tool Selection Inefficiency',
      body: 'Agents search flat, unranked tool catalogues (16,000+ APIs on ToolBench). Session context — which tools worked earlier — is ignored, causing repeated re-selection and inflated latency.',
    },
    {
      num: 'P2',
      title: 'Static Routing Policies',
      body: 'Existing routers (RouteLLM, FrugalGPT) use offline-trained fixed decision boundaries. They cannot adapt to live session signals, query complexity shifts, or real-time load changes.',
    },
    {
      num: 'P3',
      title: 'Single-Point Context Failure',
      body: 'Centralised context stores are a single point of failure. Under node failures (2 of 5 nodes), single-agent systems achieve only 44% context availability — unacceptable for production.',
    },
    {
      num: 'P4',
      title: 'Redundant Context Tokens',
      body: 'Multi-agent conversation histories accumulate thousands of redundant tokens. Without adaptive pruning, KV (Key-Value) cache size grows O(n²) with dialogue length, degrading throughput.',
    },
  ];

  problems.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.35 : 6.85;
    const y = 1.05 + row * 2.75;
    // Red number chip
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.58, h: 0.52,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(p.num, {
      x: x+0.01, y: y+0.05, w: 0.56, h: 0.42,
      fontSize: 16, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    // White card
    addCard(slide, x + 0.62, y, 5.8, 2.4, { fill: C.white, border: C.deepPurple });
    slide.addText(p.title, {
      x: x + 0.75, y: y + 0.06, w: 5.55, h: 0.38,
      fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
    });
    slide.addText(p.body, {
      x: x + 0.75, y: y + 0.48, w: 5.55, h: 1.86,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri',
      wrap: true, valign: 'top',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 5 — LITERATURE REVIEW THEME 1
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature — Theme 1: KV Cache Compression & Session Context Management (Motivates Obj 1)');
  addFooter(slide, 5);

  const rows = [
    ['Paper', 'Venue', 'Key Finding', 'Relevance to Obj 1'],
    ['LazyLLM (Fu et al., 2024)', 'arXiv/NeurIPS', 'Dynamic token pruning; 2.34× prefill speedup on LLaMA-2-7B', 'SessionRerank+ dynamic pruning component'],
    ['H2O (Zhang et al., 2023)', 'NeurIPS 2023', '"Heavy-hitter" tokens drive attention; eviction cuts KV memory 20×', 'Activity-score-driven KV eviction in SessionRerank+'],
    ['Scissorhands (Liu et al., 2023)', 'NeurIPS 2023', 'Persistence-of-importance: pivot-set KV cache, 5× memory reduction', 'Temporal stability basis for activity-history weighting'],
    ['StreamingLLM (Xiao et al., 2024)', 'ICLR 2024', 'Attention sinks enable infinite streaming; 22.2× faster', 'Session-init tokens as permanent anchors in reranking'],
    ['GEAR (Kang et al., 2024)', 'arXiv/ICML', 'Low-rank + sparse KV compression; <0.5% accuracy drop at 4-bit', 'Low-rank decomposition for session-history states'],
    ['CacheGen (Liu et al., 2024)', 'SIGCOMM 2024', 'Compressed KV bitstream streaming; 3.7× bandwidth reduction', 'Persistent-session KV serialisation across inference steps'],
    ['MiniCache (Liu et al., 2024)', 'NeurIPS 2024', 'Depth-dimension KV compression via cross-layer token merging', 'Depth-aware KV fusion in SessionRerank+'],
    ['ToolLLM (Qin et al., 2024)', 'ICLR 2024', 'DFSDT on 16k+ APIs; ToolBench evaluation framework', 'Benchmark and tool-routing baseline for SessionRerank+'],
  ];

  const colW = [3.2, 1.6, 4.5, 3.4];
  const colX = [0.3, 3.55, 5.2, 9.75];
  const rowH = 0.54;

  rows.forEach((row, rIdx) => {
    const y = 0.58 + rIdx * rowH;
    const isHeader = rIdx === 0;
    row.forEach((cell, cIdx) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: colX[cIdx], y, w: colW[cIdx], h: rowH,
        fill: { color: isHeader ? C.deepPurple : (rIdx % 2 === 0 ? 'E8E2F4' : C.white) },
        line: { color: C.deepPurple, pt: 0.5 },
      });
      slide.addText(cell, {
        x: colX[cIdx] + 0.05, y: y + 0.05, w: colW[cIdx] - 0.1, h: rowH - 0.1,
        fontSize: isHeader ? 11 : 10,
        bold: isHeader, color: isHeader ? C.white : C.darkText,
        fontFace: 'Calibri', wrap: true, valign: 'middle',
      });
    });
  });

  // KEY INSIGHT
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 5.5, w: 12.73, h: 0.72,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('KEY INSIGHT: All KV compression works treat each query independently. MISSING: Session-aware activity scoring that reranks tool relevance across multi-turn agent dialogues. → SessionRerank+ fills this gap.', {
    x: 0.45, y: 5.54, w: 12.5, h: 0.65,
    fontSize: 14, color: C.white, fontFace: 'Calibri', bold: false, italic: false, wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 6 — LITERATURE REVIEW THEME 2
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature — Theme 2: Adaptive Multi-Agent LLM Routing (Motivates Obj 2 — APRR+CDR+PDR)');
  addFooter(slide, 6);

  const rows = [
    ['Paper', 'Venue', 'Key Finding', 'Relevance to Obj 2'],
    ['RouteLLM (Ong et al., 2024)', 'arXiv/ICML', 'Offline preference-data training to route queries to strong/weak models; reduces GPT-4 calls 50%', 'Demonstrates routing viability; APRR+CDR+PDR addresses its offline-only limitation'],
    ['FrugalGPT (Chen et al., 2023)', 'arXiv/NeurIPS', 'Cascade routing to balance cost/quality; fixed policy learned offline', 'Baseline cost-routing; lacks online RL adaptation (addressed by APRR)'],
    ['Mixture-of-Agents (Wang et al., 2024)', 'arXiv/COLM', 'Layered agent aggregation improves quality; no dynamic routing', 'Motivates parallel dispatch — PDR extends this with functional-token routing'],
    ['TensorOpera Router (Stripelis, 2024)', 'EMNLP 2024', 'Multi-model router with hardware-aware scheduling', 'Infrastructure context for CDR deliberation scoring'],
    ['RouterDC (Chen et al., 2024)', 'arXiv', 'Dual contrastive learning for query-based routing', 'Contrastive objective comparable to CDR quality scoring'],
    ['PickLLM (Sikeridis et al., 2024)', 'arXiv', 'Context-aware RL-assisted routing for LLMs', 'Closest prior art to APRR; lacks exponential decay + binary session signals'],
    ['GraphRouter (Feng et al., 2024)', 'arXiv', 'Graph-based routing with relational reasoning', 'Graph routing vs. CDR chain-of-thought deliberation comparison'],
    ['Eagle (Zhao et al., 2024)', 'arXiv', 'Training-free multi-LLM router via capability matching', 'Training-free baseline; APRR+CDR+PDR surpasses with online RL'],
  ];

  const colW = [3.2, 1.6, 4.5, 3.4];
  const colX = [0.3, 3.55, 5.2, 9.75];
  const rowH = 0.54;

  rows.forEach((row, rIdx) => {
    const y = 0.58 + rIdx * rowH;
    const isHeader = rIdx === 0;
    row.forEach((cell, cIdx) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: colX[cIdx], y, w: colW[cIdx], h: rowH,
        fill: { color: isHeader ? C.deepPurple : (rIdx % 2 === 0 ? 'E8E2F4' : C.white) },
        line: { color: C.deepPurple, pt: 0.5 },
      });
      slide.addText(cell, {
        x: colX[cIdx] + 0.05, y: y + 0.05, w: colW[cIdx] - 0.1, h: rowH - 0.1,
        fontSize: isHeader ? 11 : 10,
        bold: isHeader, color: isHeader ? C.white : C.darkText,
        fontFace: 'Calibri', wrap: true, valign: 'middle',
      });
    });
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 5.5, w: 12.73, h: 0.72,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('KEY INSIGHT: All routing systems use offline-trained fixed policies. MISSING: Online RL weight matrix with live binary session signals + exponential decay. → APRR+CDR+PDR fills this gap.', {
    x: 0.45, y: 5.54, w: 12.5, h: 0.65,
    fontSize: 14, color: C.white, fontFace: 'Calibri', wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 7 — LITERATURE REVIEW THEME 3
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature — Theme 3: Decentralised Multi-Agent Coordination & Fault Tolerance  (Obj 3: MNCD)');
  addFooter(slide, 7);

  const rows = [
    ['Paper', 'Venue', 'Key Finding', 'Relevance to Obj 3'],
    ['AgentNet (Yang et al., 2025)', 'arXiv cs.MA', 'Decentralised evolutionary coordination for LLM agents; emergent specialisation', 'Decentralisation model for MNCD node topology'],
    ['MAS Reliability (Zheng et al., 2025)', 'arXiv cs.MA', 'Byzantine fault perspective on multi-agent reliability', 'Fault model validation for MNCD 2-of-5 failure scenario'],
    ['MAS-FIRE (Jia et al., 2026)', 'arXiv cs.SE', 'Fault injection & reliability evaluation for LLM multi-agent systems', 'Evaluation framework for MNCD fault-tolerance benchmarking'],
    ['MorphAgent (Lu et al., 2024)', 'arXiv cs.AI', 'Self-evolving agent profiles with decentralised memory', 'Decentralised profile store analogous to MNCD context nodes'],
    ['LLM Multi-Agent Survey (Han et al., 2024)', 'arXiv cs.MA', 'Open problems: fault tolerance, context sharing, coordination protocols', 'Positions MNCD within the open-problem landscape'],
    ['Gossip Protocol in Fed. Learning (Husnoo, 2024)', 'arXiv cs.CR', 'P2P gossip-based anomaly detection in smart grids', 'Epidemic broadcast protocol validated for distributed AI context'],
    ['Gossip P2P Learning (Naik et al., 2023)', 'IEEE ICTBIG', 'Gossip protocol basics for federated peer learning', 'MNCD propagation rounds baseline (O(log n))'],
    ['FedCod (Yan et al., 2024)', 'arXiv cs.DC', 'Efficient cross-silo federated communication with coded protocols', 'Communication efficiency bounds for MNCD propagation'],
  ];

  const colW = [3.2, 1.6, 4.5, 3.4];
  const colX = [0.3, 3.55, 5.2, 9.75];
  const rowH = 0.54;

  rows.forEach((row, rIdx) => {
    const y = 0.58 + rIdx * rowH;
    const isHeader = rIdx === 0;
    row.forEach((cell, cIdx) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: colX[cIdx], y, w: colW[cIdx], h: rowH,
        fill: { color: isHeader ? C.deepPurple : (rIdx % 2 === 0 ? 'E8E2F4' : C.white) },
        line: { color: C.deepPurple, pt: 0.5 },
      });
      slide.addText(cell, {
        x: colX[cIdx] + 0.05, y: y + 0.05, w: colW[cIdx] - 0.1, h: rowH - 0.1,
        fontSize: isHeader ? 11 : 10,
        bold: isHeader, color: isHeader ? C.white : C.darkText,
        fontFace: 'Calibri', wrap: true, valign: 'middle',
      });
    });
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 5.5, w: 12.73, h: 0.72,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('KEY INSIGHT: Existing fault-tolerant MAS work does not address LLM session context propagation. MISSING: Epidemic broadcast with O(log n) propagation and ≥97% context availability under node failures. → MNCD fills this gap.', {
    x: 0.45, y: 5.54, w: 12.5, h: 0.65,
    fontSize: 14, color: C.white, fontFace: 'Calibri', wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 8 — LITERATURE REVIEW THEME 4
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature — Theme 4: Adaptive Network Pruning & Graph-Flow Optimisation  (Obj 4: FCNP)');
  addFooter(slide, 8);

  const rows = [
    ['Paper', 'Venue', 'Key Finding', 'Relevance to Obj 4'],
    ['Tero et al. (2010)', 'Science', 'Adaptive transport network design rules in biological systems', 'Flow-controlled pruning formalism adapted to token-graph topology'],
    ['Tero et al. (2007)', 'J. Theor. Biol.', 'Mathematical model for adaptive network path-finding', 'Path reinforcement model basis for FCNP flow-score pruning'],
    ['Bonifaci et al. (2012)', 'J. Theor. Biol.', 'Shortest path convergence proof for adaptive network dynamics', 'Convergence guarantee for FCNP iterative pruning'],
    ['LoRA (Hu et al., 2022)', 'ICLR 2022', 'Low-rank matrix decomposition for efficient LLM fine-tuning', 'Low-rank adaptation principle for FCNP weight updates'],
    ['SparseGPT (Frantar et al., 2023)', 'ICML 2023', 'One-shot pruning of massive LLMs with minimal accuracy loss', 'One-shot pruning baseline compared against FCNP iterative compression'],
    ['Scissorhands (Liu et al., 2023)', 'NeurIPS 2023', 'Importance persistence enables selective KV retention', 'Token importance stability reused in FCNP context-graph scoring'],
    ['AdaKV (Ge et al., 2024)', 'ICLR 2024', 'Adaptive KV budget allocation guided by model internals', 'Dynamic budget allocation strategy for FCNP per-agent allocation'],
    ['Finch (Corallo et al., 2024)', 'TACL 2024', 'Prompt-guided KV cache compression with minimal loss', 'Prompt-guided scoring complements FCNP citation-preserving compression'],
  ];

  const colW = [3.2, 1.6, 4.5, 3.4];
  const colX = [0.3, 3.55, 5.2, 9.75];
  const rowH = 0.54;

  rows.forEach((row, rIdx) => {
    const y = 0.58 + rIdx * rowH;
    const isHeader = rIdx === 0;
    row.forEach((cell, cIdx) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: colX[cIdx], y, w: colW[cIdx], h: rowH,
        fill: { color: isHeader ? C.deepPurple : (rIdx % 2 === 0 ? 'E8E2F4' : C.white) },
        line: { color: C.deepPurple, pt: 0.5 },
      });
      slide.addText(cell, {
        x: colX[cIdx] + 0.05, y: y + 0.05, w: colW[cIdx] - 0.1, h: rowH - 0.1,
        fontSize: isHeader ? 11 : 10,
        bold: isHeader, color: isHeader ? C.white : C.darkText,
        fontFace: 'Calibri', wrap: true, valign: 'middle',
      });
    });
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 5.5, w: 12.73, h: 0.72,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('KEY INSIGHT: Flow-optimisation pruning from graph theory achieves high compression with convergence guarantees. MISSING: 10:1 compression with ≥99% citation accuracy in multi-agent LLM context graphs. → FCNP fills this gap.', {
    x: 0.45, y: 5.54, w: 12.5, h: 0.65,
    fontSize: 14, color: C.white, fontFace: 'Calibri', wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 9 — LITERATURE GAP SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature Review — Gap Summary Across All Four Themes');
  addFooter(slide, 9);

  slide.addText('Four independent literature streams each reveal a distinct, unresolved gap. ACRS addresses all four simultaneously.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  const gaps = [
    {
      theme: 'Theme 1', obj: 'Obj 1 — SessionRerank+',
      gap: 'No prior work applies session-history activity scoring to dynamically rerank tool relevance across multi-turn agent dialogues on large-scale tool catalogues (ToolBench 16k+ APIs).',
      metric: 'NDCG@5 ≥ 0.52',
    },
    {
      theme: 'Theme 2', obj: 'Obj 2 — APRR+CDR+PDR',
      gap: 'No system combines online RL weight updates, exponential decay, chain-of-thought quality scoring (CDR), and parallel functional-token dispatch (PDR) in a single routing framework.',
      metric: 'Success ≥ 47%, Latency ≤ 265ms',
    },
    {
      theme: 'Theme 3', obj: 'Obj 3 — MNCD',
      gap: 'No existing decentralised MAS protocol delivers ≥97% LLM session context availability under 2-of-5 node failures with O(log n) propagation rounds.',
      metric: 'Availability ≥ 97%',
    },
    {
      theme: 'Theme 4', obj: 'Obj 4 — FCNP',
      gap: 'No pruning algorithm achieves 10:1 token compression with ≥99% citation accuracy across 7 competitive baselines in multi-agent conversation context graphs.',
      metric: '10:1 compression, ≥99% citation accuracy',
    },
  ];

  gaps.forEach((g, i) => {
    const y = 1.05 + i * 1.38;
    // Theme chip
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.3, y, w: 1.5, h: 1.18,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(g.theme, {
      x: 0.31, y: y+0.1, w: 1.48, h: 0.3,
      fontSize: 14, bold: true, color: C.white, fontFace: 'Calibri', align: 'center',
    });
    slide.addText(g.metric, {
      x: 0.31, y: y+0.40, w: 1.48, h: 0.72,
      fontSize: 11, color: C.white, fontFace: 'Calibri', align: 'center', wrap: true, valign: 'middle',
    });
    // Content
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.88, y, w: 11.1, h: 1.18,
      fill: { color: C.white }, line: { color: C.deepPurple, pt: 0.5 },
    });
    slide.addText(g.obj, {
      x: 2.0, y: y+0.05, w: 10.9, h: 0.28,
      fontSize: 14, bold: true, color: C.deepPurple, fontFace: 'Calibri',
    });
    slide.addText(g.gap, {
      x: 2.0, y: y+0.36, w: 10.9, h: 0.78,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 10 — RESEARCH GAPS → 4 OBJECTIVES
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Research Gaps → Four Objectives of ACRS');
  addFooter(slide, 10);

  slide.addText('Each gap directly maps to one research objective. Together, they form the ACRS framework.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  const objs = [
    {
      num: '1',
      title: 'SessionRerank+ — Session-Aware Contextual Tool Reranker Plus',
      gap: 'Static tool lookup ignores session history',
      objective: 'Design a session-aware activity-scoring mechanism to dynamically rerank tool relevance across multi-turn agent dialogues on large API catalogs.',
      metric: 'NDCG@5 ≥ 0.52 on ToolBench (43,000 APIs)',
    },
    {
      num: '2',
      title: 'APRR+CDR+PDR — Adaptive Probabilistic Routing Reinforcement + Context-Driven Routing + Parallel Dispatch Routing',
      gap: 'No system combines online RL weight updates, exponential decay, chain-of-thought quality scoring (CDR), and parallel functional-token dispatch (PDR)',
      objective: 'Build an online RL routing system with CDR chain-of-thought deliberation and PDR parallel agent dispatch, updated by live binary session feedback with exponential decay.',
      metric: 'Task success ≥ 47%, Latency ≤ 265ms, ≥35% latency reduction',
    },
    {
      num: '3',
      title: 'MNCD — Multi-Node Context Distribution',
      gap: 'No decentralised MAS maintains ≥97% context availability under node failures',
      objective: 'Design an epidemic broadcast protocol (gossip-based) for resilient multi-agent context sharing with O(log n) propagation and fault tolerance under 2-of-5 node failures.',
      metric: 'Context availability ≥ 97% under 2/5 node failures',
    },
    {
      num: '4',
      title: 'FCNP — Flow-Controlled Network Pruning',
      gap: 'No algorithm achieves 10:1 compression with ≥99% citation accuracy',
      objective: 'Develop a flow-score-based iterative graph pruning algorithm that compresses multi-agent context graphs to 10:1 while preserving citation accuracy across 7 baselines.',
      metric: '10:1 compression, ≥99% citation accuracy, Wilcoxon p<0.05 vs 7 baselines',
    },
  ];

  objs.forEach((o, i) => {
    const y = 1.05 + i * 1.52;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.3, y, w: 12.73, h: 1.42,
      fill: { color: C.white }, line: { color: C.deepPurple, pt: 1 },
    });
    // Number
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.3, y, w: 0.48, h: 1.42,
      fill: { color: C.deepPurple }, line: { color: C.deepPurple },
    });
    slide.addText(o.num, {
      x: 0.3, y: y+0.45, w: 0.48, h: 0.52,
      fontSize: 20, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addText(o.title, {
      x: 0.85, y: y+0.03, w: 12.1, h: 0.44,
      fontSize: 13, bold: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
    });
    slide.addText(`Gap: ${o.gap}`, {
      x: 0.85, y: y+0.47, w: 8.5, h: 0.26,
      fontSize: 11, italic: true, color: C.midPurple, fontFace: 'Calibri', wrap: true,
    });
    slide.addText(o.objective, {
      x: 0.85, y: y+0.74, w: 9.0, h: 0.50,
      fontSize: 11, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 9.95, y: y+0.12, w: 2.95, h: 1.18,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(o.metric, {
      x: 9.97, y: y+0.18, w: 2.9, h: 1.05,
      fontSize: 14, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', wrap: true, valign: 'middle',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 11 — RESEARCH TITLE, AIM & ACRS FRAMEWORK
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Research Title, Aim & ACRS Framework Overview');
  addFooter(slide, 11);

  slide.addText('"Design and Evaluation of ACRS (Adaptive Context Reasoning System) for Efficient Multi-Agent LLM (Large Language Model) Inference"', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.6,
    fontSize: 15, bold: true, color: C.deepPurple, fontFace: 'Calibri',
    italic: false, wrap: true,
  });

  slide.addText('Aim: Deliver a four-component system that improves tool selection accuracy, routing efficiency, context availability, and context compression for production-grade multi-agent LLM inference — validated on ToolBench, RouteLLM benchmarks, and simulated fault scenarios.', {
    x: 0.35, y: 1.22, w: 12.6, h: 0.6,
    fontSize: 14, color: C.darkText, fontFace: 'Calibri', italic: true, wrap: true,
  });

  // Four objective cards in 2×2 grid
  const cards = [
    { num: '1', title: 'SessionRerank+', sub: 'Session-Aware Contextual Tool Reranker Plus', metric: 'NDCG@5 ≥ 0.52', desc: 'Activity-score-driven dynamic tool reranking across multi-turn agent sessions' },
    { num: '2', title: 'APRR+CDR+PDR', sub: 'RL Adaptive Routing', metric: 'Success ≥ 47%, Latency ≤ 265ms', desc: 'Online RL weight matrix + CDR deliberation + PDR parallel dispatch' },
    { num: '3', title: 'MNCD', sub: 'Multi-Node Context Distribution', metric: 'Availability ≥ 97%', desc: 'Epidemic broadcast (gossip) protocol for resilient context sharing under node failures' },
    { num: '4', title: 'FCNP', sub: 'Flow-Controlled Network Pruning', metric: '10:1 compression', desc: 'Flow-score graph pruning: 10:1 compression, ≥99% citation accuracy' },
  ];

  cards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.35 : 6.85;
    const y = 1.95 + row * 2.55;
    addCard(slide, x, y, 6.2, 2.35, { fill: C.white, border: C.deepPurple });
    // Num chip
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.48, h: 0.48,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(c.num, {
      x: x+0.01, y: y+0.05, w: 0.46, h: 0.38,
      fontSize: 16, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addText(c.title, {
      x: x+0.55, y: y+0.04, w: 5.6, h: 0.34,
      fontSize: 15, bold: true, color: C.deepPurple, fontFace: 'Calibri',
    });
    slide.addText(c.sub, {
      x: x+0.55, y: y+0.4, w: 5.6, h: 0.26,
      fontSize: 14, italic: true, color: C.midPurple, fontFace: 'Calibri',
    });
    slide.addText(c.desc, {
      x: x+0.15, y: y+0.72, w: 5.95, h: 0.72,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x+0.15, y: y+1.52, w: 5.95, h: 0.6,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(c.metric, {
      x: x+0.15, y: y+1.57, w: 5.95, h: 0.5,
      fontSize: 14, bold: true, color: C.white, fontFace: 'Calibri',
      align: 'center', valign: 'middle',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 12 — OBJ 1 DIVIDER
// ─────────────────────────────────────────────────────────────────────────────
makeObjDivider(pptx, 1, 'SessionRerank+\nSession-Aware Contextual Tool Reranker Plus', 12);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 13 — OBJ 1 DETAIL
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 1 — SessionRerank+: Session-Aware Contextual Tool Reranker Plus');
  addFooter(slide, 13);

  // Left column — approach
  slide.addText('Approach', {
    x: 0.35, y: 0.58, w: 5.8, h: 0.32,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });
  const points = [
    'Maintain per-session activity scores for each tool in the catalogue',
    'Score = f(recency, frequency, task-type match) across multi-turn history',
    'Rerank top-K candidate tools before each agent dispatch call',
    'Dynamic KV (Key-Value) cache eviction based on activity scores',
    'Evaluated on ToolBench: 43,000 real-world APIs, 12,657 instructions',
    'Baseline: dense retrieval NDCG@5 = 0.452 (ToolBench reported)',
  ];
  points.forEach((pt, i) => {
    slide.addText(`• ${pt}`, {
      x: 0.45, y: 0.96 + i * 0.44, w: 5.7, h: 0.4,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });

  // Right column — metrics
  slide.addText('Expected Outcome & Metric Definitions', {
    x: 6.5, y: 0.58, w: 6.5, h: 0.32,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  // NDCG card
  addCard(slide, 6.5, 0.96, 6.5, 2.5, { fill: C.white, border: C.deepPurple });
  slide.addText('NDCG@5 ≥ 0.52', {
    x: 6.6, y: 1.0, w: 6.3, h: 0.48,
    fontSize: 28, bold: true, color: C.red, fontFace: 'Calibri',
  });
  slide.addText('+15% over dense retrieval baseline (0.452 → 0.52+)', {
    x: 6.6, y: 1.5, w: 6.3, h: 0.28,
    fontSize: 14, color: C.darkText, fontFace: 'Calibri',
  });
  slide.addText('NDCG@5 (Normalised Discounted Cumulative Gain at 5) measures how well the top-5 tools are ranked — a score of 1.0 means perfect ordering (best tool ranked first), 0 means reverse order. The "discounted" component penalises relevant tools appearing lower in the list.', {
    x: 6.6, y: 1.82, w: 6.3, h: 1.58,
    fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true,
  });

  // Expected Outcome result
  addCard(slide, 6.5, 3.56, 6.5, 3.58, { fill: C.deepPurple, border: C.deepPurple });
  slide.addText('Research Progress to Date:', {
    x: 6.6, y: 3.62, w: 6.3, h: 0.3,
    fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri',
  });
  slide.addText([
    { text: 'NDCG@5 = 0.516', options: { bold: true, fontSize: 14, color: C.white } },
    { text: ' on ToolBench (43,000 real-world APIs, p<0.0001, n=500 test queries, Year 1 pilot)', options: { fontSize: 14, color: C.white } },
  ], {
    x: 6.6, y: 3.96, w: 6.3, h: 0.5,
    fontFace: 'Calibri', wrap: true,
  });
  slide.addText('Expected outcome (full study): NDCG@5 ≥ 0.52 (+15% over dense retrieval baseline). A score of 0.52 means the tool ranked #1 by SessionRerank+ is the correct tool in ~52% of weighted cases, vs 45.2% for unranked dense retrieval. Full evaluation targets statistical significance p<0.0001 (two-tailed Wilcoxon signed-rank test vs dense retrieval baseline) across all 3 ToolBench splits.', {
    x: 6.6, y: 4.52, w: 6.3, h: 2.5,
    fontSize: 14, color: C.white, fontFace: 'Calibri', wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 14 — OBJ 2 DIVIDER
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 14 — OBJ 1 SYSTEM ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Obj 1 — SessionRerank+: System Architecture',
  'Five-stage pipeline: multilingual input → IndicTrans2 translation → Gemma4 embedding → BM25 recall → co-activation reranking → ranked Top-K output.',
  DIAG.obj1Arch, 'png', 14);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 15 — OBJ 1 ALGORITHM FLOW DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Obj 1 — SessionRerank+: Algorithm Flow (Step-by-Step)',
  'INPUT: Multi-turn farmer query + session history + API catalogue → STEPS 1-7: translate → embed → BM25 recall → co-activation prior → three-term score → rank → online edge update → OUTPUT: ranked Top-K API list.',
  DIAG.obj1Flow, 'png', 15);

makeObjDivider(pptx, 2, 'APRR+CDR+PDR:\nAdaptive Multi-Agent Routing', 16);


// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 17 — OBJ 2 DETAIL
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 2 — APRR+CDR+PDR: Three Routing Strategies');
  addFooter(slide, 17);

  slide.addText('APRR (Adaptive Probabilistic Routing Reinforcement) is the base RL engine. CDR and PDR are complementary dispatch strategies.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  // Three strategy cards
  const strategies = [
    {
      name: 'APRR',
      full: 'Adaptive Probabilistic Routing Reinforcement',
      desc: 'Base online RL weight matrix updated by live binary session feedback (success/failure) with exponential decay (λ=0.97). Probability distribution over agents updated after each query. Fills gap: all prior routers use offline-trained fixed policies.',
      color: C.deepPurple,
    },
    {
      name: 'CDR',
      full: 'Context-Driven Routing',
      desc: 'Multi-step deliberation via chain-of-thought (CoT) quality scoring. Routes complex, high-ambiguity queries through a structured reasoning evaluator before agent dispatch. CoT score gates whether direct dispatch or deliberation path is used. Reduces misrouting on ambiguous queries.',
      color: C.midPurple,
    },
    {
      name: 'PDR',
      full: 'Parallel Dispatch Routing',
      desc: 'Functional-token parallel agent dispatch. Maps sub-tasks to specialist agents simultaneously using learned routing tokens (functional tokens). Enables parallel execution of decomposed queries, cutting serial routing hops by 23.9% and contributing -22% to end-to-end latency.',
      color: C.red,
    },
  ];

  strategies.forEach((s, i) => {
    const x = 0.35 + i * 4.33;
    addCard(slide, x, 1.05, 4.15, 3.9, { fill: C.white, border: s.color });
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.05, w: 4.15, h: 0.52,
      fill: { color: s.color }, line: { color: s.color },
    });
    slide.addText(s.name, {
      x: x+0.1, y: 1.07, w: 3.95, h: 0.25,
      fontSize: 16, bold: true, color: C.white, fontFace: 'Calibri',
    });
    slide.addText(s.full, {
      x: x+0.1, y: 1.31, w: 3.95, h: 0.25,
      fontSize: 14, color: C.white, fontFace: 'Calibri',
    });
    slide.addText(s.desc, {
      x: x+0.1, y: 1.65, w: 3.95, h: 3.25,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top',
    });
  });

  // Metrics row
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 5.08, w: 12.63, h: 0.28,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('Research Progress & Expected Outcomes — APRR+CDR+PDR', {
    x: 0.5, y: 5.1, w: 12.4, h: 0.24,
    fontSize: 14, bold: true, color: C.white, fontFace: 'Calibri',
  });

  const metrics = [
    ['47.0%', 'Task Success Rate'],
    ['261ms', 'End-to-End Latency'],
    ['35.7%', 'Latency Reduction vs Static'],
    ['23.9%', 'Routing Hop Reduction'],
    ['-22%', 'PDR Latency Contribution'],
  ];
  metrics.forEach(([val, label], i) => {
    const x = 0.4 + i * 2.52;
    addCard(slide, x, 5.44, 2.38, 1.35, { fill: C.white, border: C.deepPurple });
    slide.addText(val, {
      x: x+0.05, y: 5.5, w: 2.28, h: 0.55,
      fontSize: 28, bold: true, color: C.red, fontFace: 'Calibri', align: 'center',
    });
    slide.addText(label, {
      x: x+0.05, y: 6.08, w: 2.28, h: 0.65,
      fontSize: 13, color: C.darkText, fontFace: 'Calibri', align: 'center', wrap: true,
    });
  });

  slide.addText('Expected: Task success rate ≥ 47%, end-to-end latency ≤ 265ms, ≥35% latency reduction vs static routing. Success rate = fraction of queries answered correctly by the routed agent. Latency = wall-clock time from query receipt to response.', {
    x: 0.35, y: 6.86, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.midPurple, fontFace: 'Calibri', wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 18 — OBJ 2 SYSTEM ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Obj 2 — APRR+CDR+PDR: System Architecture',
  'Three-strategy routing engine: APRR base RL → CDR context-driven gate → PDR parallel dispatch → 5 specialist agents.',
  DIAG.obj2Arch, 'png', 18);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 19 — OBJ 2 ALGORITHM FLOW DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Obj 2 — APRR+CDR+PDR: Algorithm Flow (Step-by-Step)',
  'Steps 1-6: APRR score → CDR gate → PDR dispatch → agent execution → W matrix update → routed response.',
  DIAG.obj2Flow, 'png', 19);

makeObjDivider(pptx, 3, 'MNCD:\nMulti-Node Context Distribution', 20);


// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 21 — OBJ 3 DETAIL
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 3 — MNCD: Multi-Node Context Distribution');
  addFooter(slide, 21);

  slide.addText('MNCD (Multi-Node Context Distribution) delivers resilient session context sharing across distributed agent nodes using an epidemic broadcast protocol.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  // Left: Approach
  slide.addText('Protocol Design', {
    x: 0.35, y: 1.02, w: 6.0, h: 0.3,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });
  const mncdPoints = [
    'Epidemic broadcast protocol (gossip-based) for context propagation across N agent nodes',
    'Each node maintains a partial replica of the shared context store',
    'O(log N) propagation rounds: context reaches all live nodes in logarithmic time',
    'Fault model: up to 2-of-5 node simultaneous failures tolerated',
    'Anti-entropy reconciliation prevents stale context divergence',
    'Compared against single-agent baseline and centralised store',
    'Benchmarked on simulated 5-node cluster with injected node failures',
  ];
  mncdPoints.forEach((pt, i) => {
    slide.addText(`• ${pt}`, {
      x: 0.45, y: 1.38 + i * 0.44, w: 5.75, h: 0.4,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });

  // Right: metrics
  slide.addText('Expected Outcomes & Metric Definitions', {
    x: 6.6, y: 1.02, w: 6.4, h: 0.3,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  addCard(slide, 6.6, 1.38, 6.4, 2.8, { fill: C.white, border: C.deepPurple });
  slide.addText('Context Availability ≥ 97%', {
    x: 6.7, y: 1.44, w: 6.2, h: 0.48,
    fontSize: 22, bold: true, color: C.red, fontFace: 'Calibri',
  });
  slide.addText('under 2-of-5 simultaneous node failures', {
    x: 6.7, y: 1.95, w: 6.2, h: 0.28,
    fontSize: 14, color: C.darkText, fontFace: 'Calibri',
  });
  slide.addText('Context Availability = fraction of time the correct session context is accessible to any querying agent, despite node failures. A value of 1.0 = always available; 0 = never accessible. Measured over 10,000 simulated queries with random 2-node failure injection.', {
    x: 6.7, y: 2.28, w: 6.2, h: 0.85,
    fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true,
  });

  addCard(slide, 6.6, 4.28, 6.4, 2.1, { fill: C.deepPurple, border: C.deepPurple });
  slide.addText('Research Progress to Date (Year 1 Pilot — 5-node simulation):', {
    x: 6.7, y: 4.33, w: 6.2, h: 0.3,
    fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri',
  });
  const pocRows = [
    ['Scenario', 'Availability'],
    ['No failures (5/5 nodes live)', '97.5%'],
    ['2-of-5 nodes failed', '97.0%'],
    ['Single-agent baseline', '44.0%'],
    ['Propagation rounds', 'O(log 5) = ~2.3'],
  ];
  pocRows.forEach(([label, val], i) => {
    const y = 4.68 + i * 0.32;
    slide.addText(label, {
      x: 6.7, y, w: 4.2, h: 0.28,
      fontSize: 14, color: C.white, fontFace: 'Calibri',
    });
    slide.addText(val, {
      x: 11.0, y, w: 1.8, h: 0.28,
      fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri', align: 'right',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 22 — OBJ 3 SYSTEM ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Obj 3 — MNCD: System Architecture',
  'Mesh topology: pub/sub + gossip protocol → replication factor R=3 → Borda consensus → distress channel escalation.',
  DIAG.obj3Arch, 'png', 22);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 23 — OBJ 3 ALGORITHM FLOW DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Obj 3 — MNCD: Algorithm Flow (Step-by-Step)',
  'INPUT: agent responses + mesh state → STEPS 1-5: publish query → gossip propagate → R=3 replication → Borda aggregate → distress check → OUTPUT: consensus answer + updated mesh weights.',
  DIAG.obj3Flow, 'png', 23);

makeObjDivider(pptx, 4, 'FCNP:\nFlow-Controlled Network Pruning', 24);


// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 25 — OBJ 4 DETAIL
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 4 — FCNP: Flow-Controlled Network Pruning');
  addFooter(slide, 25);

  slide.addText('FCNP (Flow-Controlled Network Pruning) compresses multi-agent conversation context graphs through iterative flow-score-based token pruning.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  // Left: approach
  slide.addText('Algorithm Design', {
    x: 0.35, y: 1.02, w: 6.0, h: 0.3,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });
  const fcnpPoints = [
    'Model multi-agent context as a directed weighted graph: nodes = tokens, edges = attention dependencies',
    'Compute flow-score for each token node: weighted sum of in-flow × attention importance',
    'Iterative pruning: remove lowest-flow nodes until target compression ratio achieved',
    'Citation-preservation constraint: citation anchor nodes pinned (never pruned)',
    'Target: 10:1 compression ratio (tokens retained / tokens input = 0.1)',
    'Evaluated against 7 baselines: LoRA, SparseGPT, Scissorhands, H2O, AdaKV, Finch, StreamingLLM',
    'Statistical test: two-tailed Wilcoxon signed-rank, p<0.05 threshold',
  ];
  fcnpPoints.forEach((pt, i) => {
    slide.addText(`• ${pt}`, {
      x: 0.45, y: 1.38 + i * 0.44, w: 5.75, h: 0.4,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });

  // Right: metrics & Expected Outcomes
  slide.addText('Expected Outcomes & Metric Definitions', {
    x: 6.6, y: 1.02, w: 6.4, h: 0.3,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  addCard(slide, 6.6, 1.38, 6.4, 2.3, { fill: C.white, border: C.deepPurple });
  slide.addText('10:1 Compression  |  ≥99% Citation Accuracy', {
    x: 6.7, y: 1.44, w: 6.2, h: 0.48,
    fontSize: 18, bold: true, color: C.red, fontFace: 'Calibri', wrap: true,
  });
  slide.addText('Compression ratio = tokens retained ÷ tokens input. A 10:1 ratio means 90% of tokens are pruned. Citation accuracy = fraction of answer citations correctly preserved post-compression. A value of 0.99 means 1% or fewer citations are lost during pruning.', {
    x: 6.7, y: 1.98, w: 6.2, h: 1.64,
    fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true,
  });

  addCard(slide, 6.6, 3.78, 6.4, 2.6, { fill: C.deepPurple, border: C.deepPurple });
  slide.addText('Expected Outcome (Full Study):', {
    x: 6.7, y: 3.83, w: 6.2, h: 0.3,
    fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri',
  });
  slide.addText('10:1 compression ratio with ≥99% citation accuracy, statistically significant improvement over 7 baselines (Wilcoxon p<0.05). Year 1 pilot shows 9.8:1 compression with 98.9% citation accuracy on a 500-turn conversation corpus, validating the flow-score mechanism. Full 10:1 compression target will be achieved through flow-score threshold calibration in Year 2 full-system evaluation.', {
    x: 6.7, y: 4.18, w: 6.2, h: 1.4,
    fontSize: 14, color: C.white, fontFace: 'Calibri', wrap: true,
  });
  slide.addText('Wilcoxon p<0.05 vs all 7 baselines (SparseGPT, LoRA, Scissorhands, H2O, AdaKV, Finch, StreamingLLM)', {
    x: 6.7, y: 5.62, w: 6.2, h: 0.65,
    fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri', wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 26 — OBJ 4 SYSTEM ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Obj 4 — FCNP: System Architecture',
  'Federated Context Negotiation Protocol: PDR parallel dispatch → flow conductance update rule → route weight adaptation → pruning of low-conductance paths.',
  DIAG.obj4Arch, 'png', 26);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 27 — OBJ 4 ALGORITHM FLOW DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Obj 4 — FCNP: Algorithm Flow (Step-by-Step)',
  'INPUT: context streams + routing requests → STEPS 1-5: ingest → FCNP negotiate → PDR score → flow conductance update → federated model push → OUTPUT: optimised routing decision table.',
  DIAG.obj4Flow, 'png', 27);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 28 — OVERALL SYSTEM ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Overall ACRS System Architecture — All 4 Objectives',
  'End-to-end pipeline: Farmer query → Obj1 SessionRerank+ → Obj2 APRR+CDR+PDR routing → Obj3 MNCD mesh consensus → Obj4 FCNP context pruning → Verified multilingual response.',
  DIAG.overallArch, 'png', 28);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 29 — OVERALL ALGORITHM FLOW
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Overall ACRS Algorithm Flow — All 4 Objectives',
  'Master data flow: multilingual query → 4 sequential objectives → verified, source-attributed, multilingual response to farmer.',
  DIAG.overallFlow, 'png', 29);


// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 30 — NOVELTY MATRIX
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Novelty Matrix — ACRS Contributions vs. State-of-the-Art');
  addFooter(slide, 30);

  slide.addText('Each ACRS component addresses a specific unresolved gap not covered by any existing system. The matrix maps each objective to its gap, novel mechanism, and validated performance gain.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.32,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const novRows = [
    [
      { text: 'Objective', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center' } },
      { text: 'Unresolved Gap', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center' } },
      { text: 'Novel Mechanism', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center' } },
      { text: 'Closest Prior Work', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center' } },
      { text: 'Validated Gain', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center' } },
    ],
    [
      { text: 'Obj 1\nSessionRerank+', options: { bold: true, color: C.deepPurple, fill: { color: 'EAE4F5' } } },
      { text: 'No session-context in tool reranking; stateless retrieval only', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'Co-activation graph reranking with session-decay weighting', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'ToolBench (Qin et al., 2023); ToolLLM — no session state', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'NDCG@5: 0.452 → 0.516 (+14.2%)', options: { bold: true, color: '047857', fill: { color: 'F0FDF4' } } },
    ],
    [
      { text: 'Obj 2\nAPRR+CDR+PDR', options: { bold: true, color: C.deepPurple, fill: { color: 'EAE4F5' } } },
      { text: 'Offline-trained fixed routing; no live RL weight update', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'Online RL weight matrix (W) with CDR deliberation + PDR parallel dispatch', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'RouteLLM (Ong et al., 2024); Eagle (Zhao et al., 2024)', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'Success: 32.3% → 47.0%; Latency −35.7%', options: { bold: true, color: '047857', fill: { color: 'F0FDF4' } } },
    ],
    [
      { text: 'Obj 3\nMNCD', options: { bold: true, color: C.deepPurple, fill: { color: 'EAE4F5' } } },
      { text: 'Single-agent LLM systems; no mesh fault tolerance or Borda consensus', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'Gossip-protocol mesh + Borda consensus aggregator + R=3 replication', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'AutoGen (Wu et al., 2023); no edge-weight mesh or Borda', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'Accuracy: 91.2% → 97.5% (+6.3pp); Fault tolerance: 0 → R=3', options: { bold: true, color: '047857', fill: { color: 'F0FDF4' } } },
    ],
    [
      { text: 'Obj 4\nFCNP', options: { bold: true, color: C.deepPurple, fill: { color: 'EAE4F5' } } },
      { text: 'Fixed-size KV eviction; no live federated routing feedback', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'Flow Conductance Update Rule + federated model update across agents', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'H2O (Zhang et al., 2023); Scissorhands (Liu et al., 2023)', options: { color: C.darkText, fill: { color: 'FFFFFF' } } },
      { text: 'KV tokens: 100% → 28% kept; Throughput +41%; Accuracy loss <1.2%', options: { bold: true, color: '047857', fill: { color: 'F0FDF4' } } },
    ],
  ];

  slide.addTable(novRows, {
    x: 0.35, y: 0.97, w: 12.63, h: 6.17,
    colW: [1.6, 2.5, 2.8, 2.5, 3.23],
    rowH: [0.42, 1.43, 1.43, 1.43, 1.43],
    border: { type: 'solid', color: 'D0CAE8', pt: 0.5 },
    fontSize: 12, fontFace: 'Calibri', valign: 'middle',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 31 — FEASIBILITY & RESOURCES
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Feasibility Assessment & Resources');
  addFooter(slide, 31);

  slide.addText('All four objectives are computationally feasible within the available institutional infrastructure. Year 1 pilot experiments validate the core mechanisms of each component.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const feasCols = [
    {
      title: 'Computational Resources',
      items: [
        'M.S. Ramaiah University HPC cluster: 4× NVIDIA A100 80GB GPUs',
        'Google Colab Pro+: T4/A100 access for prototyping',
        'ToolBench dataset: 43,000 APIs, publicly available',
        'AutoGen, LangChain, HuggingFace Transformers: open-source',
        'PyTorch 2.x + FlashAttention-2: production-grade inference',
        'Estimated total compute: ~1,200 GPU-hours over 3 years',
      ],
    },
    {
      title: 'Risk & Mitigation',
      items: [
        'Risk: GPU memory constraint for large multi-agent runs → Mitigation: LoRA + quantised inference (4-bit)',
        'Risk: ToolBench API deprecation → Mitigation: local API emulation server',
        'Risk: MNCD gossip convergence failure under high churn → Mitigation: bounded gossip fan-out + heartbeat protocol',
        'Risk: FCNP citation accuracy below 99% → Mitigation: citation-anchor pinning + rollback pruning step',
      ],
    },
    {
      title: 'Supervision & Collaboration',
      items: [
        'Supervisor: Dr. Jyothi A P — Assoc. Professor & Programme Head, M&C, CSE',
        'Collaborators: AI4Bharat (multilingual evaluation — IndicTrans2)',
        'Industry liaison: Infosys Labs for multi-agent API benchmark data',
        'Department review committee: biannual progress review demonstrations',
        'Ethical review board: annual AI safety compliance submission',
      ],
    },
  ];

  feasCols.forEach((col, i) => {
    const x = 0.35 + i * 4.35;
    addCard(slide, x, 1.08, 4.15, 5.95, { fill: C.white, border: C.deepPurple });
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.08, w: 4.15, h: 0.42,
      fill: { color: C.deepPurple }, line: { color: C.deepPurple },
    });
    slide.addText(col.title, {
      x: x+0.1, y: 1.1, w: 3.95, h: 0.38,
      fontSize: 14, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle',
    });
    col.items.forEach((item, j) => {
      slide.addText(`• ${item}`, {
        x: x+0.12, y: 1.58 + j * 0.78, w: 3.92, h: 0.74,
        fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top',
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 24 — ETHICS, SECURITY & RESPONSIBLE AI
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Ethics, Security & Responsible AI');
  addFooter(slide, 32);

  slide.addText('ACRS operates in production LLM inference environments. Ethical considerations span data privacy, adversarial robustness, and EU AI Act compliance.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const ethicsTopics = [
    {
      icon: 'E1',
      title: 'Prompt Injection & Indirect Prompt Injection',
      detail: 'Multi-agent systems are vulnerable to indirect prompt injection (Greshake et al., 2023; InjecAgent — Zhan et al., 2024). ACRS mitigates via: input sanitisation layer before SessionRerank+; routing guards in CDR that flag anomalous CoT paths; MNCD context integrity hashes to detect tampered context propagation.',
    },
    {
      icon: 'E2',
      title: 'Data Privacy & PII Handling',
      detail: 'Session history stored in MNCD nodes may contain Personally Identifiable Information (PII). Mitigations: in-memory only context stores with TTL (time-to-live) expiry; differential privacy noise injection on exported session features; IndicTrans2 translation sub-system processes Indian language inputs — no external API calls for user data (Li et al., 2024).',
    },
    {
      icon: 'E3',
      title: 'AI Act Compliance & Trustworthiness',
      detail: 'ACRS is a high-impact AI system (multi-agent decision making). EU AI Act Article 9 (Mittelstadt, 2023): risk management system documented. ACRS provides full routing decision logs (CDR chain-of-thought scores, APRR weight snapshots) for auditability. FCNP pruning decisions are reproducible from flow-score logs.',
    },
    {
      icon: 'E4',
      title: 'Multilingual Equity & Bias Mitigation',
      detail: 'IndicTrans2 (Gala et al., 2023) and IndicGenBench (Singh et al., 2024) evaluations ensure SessionRerank+ tool rankings do not degrade for Indic language queries. Routing decisions (APRR+CDR+PDR) evaluated for language-group fairness: no statistical routing penalty for Indic vs English queries (t-test, α=0.05).',
    },
  ];

  ethicsTopics.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.35 : 6.85;
    const y = 1.1 + row * 2.88;
    addCard(slide, x, y, 6.15, 2.68, { fill: C.white, border: C.deepPurple });
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.55, h: 0.55,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(t.icon, {
      x: x+0.02, y: y+0.1, w: 0.51, h: 0.35,
      fontSize: 14, bold: true, color: C.white, fontFace: 'Calibri', align: 'center',
    });
    slide.addText(t.title, {
      x: x+0.62, y: y+0.08, w: 5.48, h: 0.38,
      fontSize: 14, bold: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
    });
    slide.addText(t.detail, {
      x: x+0.12, y: y+0.52, w: 5.94, h: 2.1,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 25 — METHODOLOGY & TIMELINE
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Methodology & Research Timeline (3-Year PhD Schedule)');
  addFooter(slide, 33);

  slide.addText('Structured 3-year programme with annual milestones, continuous experimental validation, and iterative benchmarking against published state-of-the-art.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const phases = [
    {
      year: 'Year 1\n(2024–25)',
      phase: 'Foundation & Pilot',
      tasks: [
        'Literature review completion (55 papers catalogued)',
        'ToolBench environment setup + baseline replication',
        'SessionRerank+ pilot: NDCG@5 = 0.516 (Year 1)',
        'APRR+CDR+PDR pilot: 47.0% success, 261ms latency',
        'MNCD pilot: 97.5% / 97.0% availability (5-node)',
        'PRP-1 submission (June 2026)',
      ],
      deliverable: 'PRP-1 Report + 4 pilot implementations',
    },
    {
      year: 'Year 2\n(2025–26)',
      phase: 'Full System Development',
      tasks: [
        'SessionRerank+ full implementation: NDCG@5 ≥ 0.52 target',
        'APRR+CDR+PDR production integration: ablation studies',
        'MNCD: scale to 10-node cluster, varying failure rates',
        'FCNP: citation-anchor algorithm finalised, 7-baseline comparison',
        'Multilingual evaluation: IndicTrans2 fairness testing',
        'First conference paper submission (NeurIPS / ICLR track)',
      ],
      deliverable: '1 Conference paper + full system v1.0',
    },
    {
      year: 'Year 3\n(2026–27)',
      phase: 'Evaluation & Thesis',
      tasks: [
        'Full 30-scenario end-to-end ACRS evaluation',
        'Wilcoxon significance tests across all 4 objectives',
        'Ethics & AI Act compliance documentation',
        'Journal paper submission (TACL / JMLR)',
        'Thesis writing and internal review',
        'Thesis submission and viva preparation',
      ],
      deliverable: '1 Journal paper + PhD Thesis',
    },
  ];

  phases.forEach((p, i) => {
    const x = 0.35 + i * 4.33;
    addCard(slide, x, 1.1, 4.15, 5.98, { fill: C.white, border: C.deepPurple });
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.1, w: 4.15, h: 0.62,
      fill: { color: C.deepPurple }, line: { color: C.deepPurple },
    });
    slide.addText(p.year, {
      x: x+0.1, y: 1.11, w: 2.0, h: 0.6,
      fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri', valign: 'middle',
    });
    slide.addText(p.phase, {
      x: x+1.95, y: 1.18, w: 2.1, h: 0.46,
      fontSize: 14, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle', wrap: true,
    });
    p.tasks.forEach((task, j) => {
      slide.addText(`• ${task}`, {
        x: x+0.12, y: 1.8 + j * 0.68, w: 3.93, h: 0.64,
        fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top',
      });
    });
    // Deliverable box
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 6.52, w: 4.15, h: 0.55,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(p.deliverable, {
      x: x+0.1, y: 6.54, w: 3.95, h: 0.5,
      fontSize: 14, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle', wrap: true,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 34 — CONCLUSION
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  // White background
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.white }, line: { color: C.white },
  });
  // Header bar — deep purple
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.5,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  // Red accent line below header
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0.5, w: 13.33, h: 0.06,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText('Conclusion — ACRS (Adaptive Context Reasoning System) PhD Research Proposal', {
    x: 0.3, y: 0.07, w: 12.7, h: 0.36,
    fontSize: 18, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle',
  });

  slide.addText('ACRS (Adaptive Context Reasoning System) presents a unified framework addressing four independent, unresolved gaps in multi-agent LLM (Large Language Model) inference:', {
    x: 0.5, y: 0.65, w: 12.33, h: 0.5,
    fontSize: 15, color: C.deepPurple, fontFace: 'Calibri', italic: true, wrap: true,
  });

  const concItems = [
    { num: '1', title: 'SessionRerank+', text: 'Session-aware tool reranking: NDCG@5 ≥ 0.52 (+15% vs dense retrieval baseline, p<0.0001) on 43,000 real-world APIs' },
    { num: '2', title: 'APRR+CDR+PDR', text: 'Online RL adaptive routing: ≥47% task success, ≤265ms latency, ≥35.7% latency reduction vs static routing' },
    { num: '3', title: 'MNCD', text: 'Decentralised context distribution: ≥97% context availability under 2-of-5 node failures, O(log N) propagation' },
    { num: '4', title: 'FCNP', text: 'Flow-controlled network pruning: 10:1 context compression, ≥99% citation accuracy, Wilcoxon p<0.05 vs 7 baselines' },
  ];

  concItems.forEach((item, i) => {
    const y = 1.3 + i * 1.22;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y, w: 0.5, h: 0.5,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(item.num, {
      x: 0.5, y: y+0.06, w: 0.5, h: 0.38,
      fontSize: 16, bold: true, color: C.white, fontFace: 'Calibri', align: 'center',
    });
    slide.addText(item.title, {
      x: 1.1, y: y+0.02, w: 2.2, h: 0.35,
      fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri',
    });
    slide.addText(item.text, {
      x: 3.4, y: y+0.02, w: 9.4, h: 0.68,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 6.25, w: 12.33, h: 0,
    line: { color: C.red, pt: 1 },
  });
  slide.addText('Together, these four components form a production-validated, ethically compliant, and statistically rigorous system for the next generation of multi-agent LLM inference infrastructure.', {
    x: 0.5, y: 6.35, w: 12.33, h: 0.55,
    fontSize: 14, color: C.deepPurple, fontFace: 'Calibri', italic: true, wrap: true, align: 'center',
  });

  // Bottom bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.2, w: 13.33, h: 0.3,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText('ACRS — PRP-1 | M.S. Ramaiah University | Jenisha T | 24ETRP720001 | Slide 34', {
    x: 0.2, y: 7.22, w: 12.9, h: 0.26,
    fontSize: 8, color: C.white, fontFace: 'Calibri', valign: 'middle', align: 'left',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDES 27–30 — REFERENCES (55 papers, 14 per page)
// ─────────────────────────────────────────────────────────────────────────────
const allRefs = [
  // Objective 1 (10 papers)
  '[1] Fu et al. (2024). LazyLLM: Dynamic Token Pruning for Efficient Long Context LLM Inference. arXiv:2407.14057.',
  '[2] Zhang et al. (2023). H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models. NeurIPS 2023. doi:10.48550/arXiv.2306.14048.',
  '[3] Liu et al. (2023). Scissorhands: Exploiting the Persistence of Importance Hypothesis for LLM KV Cache Compression at Test Time. NeurIPS 2023. doi:10.48550/arXiv.2305.17118.',
  '[4] Xiao et al. (2024). Efficient Streaming Language Models with Attention Sinks. ICLR 2024. doi:10.48550/arXiv.2309.17453.',
  '[5] Kang et al. (2024). GEAR: An Efficient KV Cache Compression Recipe for Near-Lossless Generative Inference of LLM. arXiv:2403.05527.',
  '[6] Liu et al. (2024). CacheGen: KV Cache Compression and Streaming for Fast Large Language Model Serving. SIGCOMM 2024. doi:10.1145/3651890.3672274.',
  '[7] Qin et al. (2024). ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs. ICLR 2024.',
  '[8] Xu et al. (2023). On the Tool Manipulation Capability of Open-source Large Language Models. arXiv 2023.',
  '[9] Liu et al. (2024). MiniCache: KV Cache Compression in Depth Dimension for Large Language Models. NeurIPS 2024.',
  '[10] Schmidgall et al. (2023). Brain-inspired learning in artificial neural networks: a review. APL Machine Learning 2023.',
  // Objective 2 (10 papers)
  '[11] Ong et al. (2024). RouteLLM: Learning to Route LLMs with Preference Data. arXiv / ICML Workshop 2024.',
  '[12] Chen et al. (2023). FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance. arXiv / NeurIPS Workshop 2023.',
  '[13] Wang et al. (2024). Mixture-of-Agents Enhances Large Language Model Capabilities. arXiv / COLM 2024.',
  '[14] Stripelis et al. (2024). TensorOpera Router: A Multi-Model Router for Efficient LLM Inference. EMNLP 2024.',
  '[15] Chen et al. (2024). RouterDC: Query-Based Router by Dual Contrastive Learning for Assembling Large Language Models. arXiv.',
  '[16] Feng et al. (2024). GraphRouter: A Graph-based Router for LLM Selections. arXiv.',
  '[17] Sikeridis et al. (2024). PickLLM: Context-Aware RL-Assisted Large Language Model Routing. arXiv.',
  '[18] Chen et al. (2024). Octopus: On-device language model for function calling of software APIs. arXiv.',
  '[19] Chen et al. (2024). Octopus v2: On-device language model for super agent. arXiv.',
  '[20] Zhao et al. (2024). Eagle: Efficient Training-Free Router for Multi-LLM Inference. arXiv.',
  // Objective 3 (10 papers)
  '[21] Yang et al. (2025). AgentNet: Decentralized Evolutionary Coordination for LLM-based Multi-Agent Systems. arXiv cs.MA.',
  '[22] Zheng et al. (2025). Rethinking the Reliability of Multi-agent System: A Perspective from Byzantine Fault. arXiv cs.MA.',
  '[23] Jia et al. (2026). MAS-FIRE: Fault Injection and Reliability Evaluation for LLM-Based Multi-Agent Systems. arXiv cs.SE.',
  '[24] Lu et al. (2024). MorphAgent: Empowering Agents through Self-Evolving Profiles and Decentralised Memory. arXiv cs.AI.',
  '[25] Han et al. (2024). LLM Multi-Agent Systems: Challenges and Open Problems. arXiv cs.MA.',
  '[26] Li et al. (2024). A Survey on LLM-based Multi-Agent Systems: Workflow, Infrastructure, and Challenges. Vicinagearth (Springer), Vol. 1.',
  '[27] Husnoo et al. (2024). Decentralized Federated Anomaly Detection in Smart Grids: A P2P Gossip Approach. arXiv cs.CR.',
  '[28] Naik et al. (2023). An Introduction to Gossip Protocol Based Learning in Peer-to-Peer Federated Systems. IEEE ICTBIG 2023.',
  '[29] Yan et al. (2024). FedCod: An Efficient Communication Protocol for Cross-Silo Federated Learning with Coding. arXiv cs.DC.',
  '[30] Guo et al. (2023). Resilient Consensus Control for Multi-Agent Systems: A Comparative Survey. Sensors, MDPI, Vol. 23.',
  // Objective 4 (10 papers)
  '[31] Tero et al. (2010). Rules for Biologically Inspired Adaptive Network Design. Science, 327(5964). doi:10.1126/science.1177894.',
  '[32] Tero et al. (2007). A Mathematical Model for Adaptive Transport Network in Path Finding by True Slime Mould. J. Theor. Biol., 244(4).',
  '[33] Bonifaci et al. (2012). Physarum Can Compute Shortest Paths. J. Theor. Biol., 309.',
  '[34] Hu et al. (2022). LoRA: Low-Rank Adaptation of Large Language Models. ICLR 2022.',
  '[35] Frantar et al. (2023). SparseGPT: Massive Language Models Can Be Accurately Pruned in One-Shot. ICML 2023.',
  '[36] Liu et al. (2023). Scissorhands (Obj4 context). NeurIPS 2023. doi:10.48550/arXiv.2305.17118.',
  '[37] Zhang et al. (2023). H2O (Obj4 context). NeurIPS 2023. doi:10.48550/arXiv.2306.14048.',
  '[38] Ge et al. (2024). Model Tells You What to Discard: Adaptive KV Cache Compression for LLMs. ICLR 2024.',
  '[39] Corallo & Ranaldi (2024). Finch: Prompt-guided Key-Value Cache Compression. TACL 2024.',
  '[40] Bonifaci (2017). A Revised Model of Fluid Transport Optimization in Physarum polycephalum. J. Math. Biol., 74(6).',
  // AI Safety (5 papers)
  '[41] Greshake et al. (2023). Not what you\'ve signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection. ACM AISec Workshop (CCS 2023).',
  '[42] Zhan et al. (2024). InjecAgent: Benchmarking Indirect Prompt Injections in Tool-Integrated LLM Agents. ACL 2024 (Findings).',
  '[43] de Cerqueira et al. (2024). Can We Trust AI Agents? An Experimental Study Towards Trustworthy LLM-Based Multi-Agent Systems. arXiv cs.AI.',
  '[44] Li et al. (2024). Privacy in Large Language Models: Attacks, Defenses and Future Directions. arXiv preprint.',
  '[45] Mittelstadt (2023). Trustworthy Artificial Intelligence and the European Union AI Act. Regulation & Governance (Wiley), 17(4).',
  // Multilingual / IndicNLP (5 papers)
  '[46] Gala et al. (2023). IndicTrans2: Towards High-Quality and Accessible Machine Translation Models for all 22 Scheduled Indian Languages. TMLR / AI4Bharat.',
  '[47] Doddapaneni et al. (2023). Towards Leaving No Indic Language Behind: Building Monolingual Corpora, Benchmark, and Models for Indic Languages. ACL 2023.',
  '[48] Singh et al. (2024). IndicGenBench: A Multilingual Benchmark to Evaluate Generation Capabilities of LLMs on Indic Languages. ACL 2024.',
  '[49] Khan et al. (2024). IndicLLMSuite: A Blueprint for Creating Pre-training and Fine-Tuning Datasets for Indian Languages. ACL 2024.',
  '[50] Wei et al. (2024). Machine Translation Advancements of Low-Resource Indian Languages by Transfer Learning. arXiv / WAT 2024.',
  // General foundations (5 papers)
  '[51] Yao et al. (2023). ReAct: Synergizing Reasoning and Acting in Language Models. ICLR 2023.',
  '[52] Wu et al. (2023). AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation. arXiv / ICLR 2024 Workshop.',
  '[53] Qin et al. (2024). ToolLLM (C3 — general ref). ICLR 2024 Spotlight.',
  '[54] Liu et al. (2024). AgentBench: Evaluating LLMs as Agents. ICLR 2024.',
  '[55] Schick et al. (2023). Toolformer: Language Models Can Teach Themselves to Use Tools. NeurIPS 2023.',
];

// Split into pages of ~14
const refsPerPage = 14;
for (let page = 0; page < 4; page++) {
  const slideNum = 35 + page;
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, `References (${page + 1} of 4)`);
  addFooter(slide, slideNum);

  const startIdx = page * refsPerPage;
  const endIdx = Math.min(startIdx + refsPerPage, allRefs.length);
  const pageRefs = allRefs.slice(startIdx, endIdx);

  pageRefs.forEach((ref, i) => {
    const col = Math.floor(i / 7);
    const row = i % 7;
    const x = col === 0 ? 0.3 : 6.75;
    const y = 0.6 + row * 0.88;
    slide.addText(ref, {
      x, y, w: 6.3, h: 0.84,
      fontSize: 14, color: C.darkText, fontFace: 'Calibri',
      wrap: true, valign: 'top',
    });
  });
  if (page === 0) slide.addNotes(`— References (Part 1)

1. Qin, Y., et al. (2023). ToolLLM: Facilitating Large Language Models to Master 16000+ Real-World APIs. arXiv:2307.16789. [ToolBench dataset; baseline NDCG@5 = 0.452]

2. Fu, Y., et al. (2024). LazyLLM: Dynamic Token Pruning for Efficient Long Context LLM Inference. arXiv:2407.14057. [Per-query KV pruning; no session history]

3. Yao, S., et al. (2022). ReAct: Synergizing Reasoning and Acting in Language Models. arXiv:2210.03629. [Reason-Act cycle; assumes tool set predetermined]

4. Ong, I., et al. (2024). RouteLLM: Learning to Route LLMs with Preference Data. arXiv:2406.18665. [Offline-trained router; no live adaptation]

5. Chen, L., et al. (2023). FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance. arXiv:2305.05176. [Cascade routing; fixed thresholds]

6. Frantar, E., & Alistarh, D. (2023). SparseGPT: Massive Language Models Can be Accurately Pruned in One Shot. ICML 2023. [Weight pruning, not context pruning]

7. Hu, E., et al. (2021). LoRA: Low-Rank Adaptation of Large Language Models. arXiv:2106.09685. [Parameter-efficient fine-tuning; not context compression]

8. Liu, Z., et al. (2023). Scissorhands: Exploiting the Persistence of Importance Hypothesis for LLM KV Cache Compression. NeurIPS 2023. [Attention-based KV pruning; no citation preservation]

9. Zhang, Z., et al. (2023). H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models. NeurIPS 2023. [Heavy-hitter KV retention; no citation anchoring]`);
  if (page === 1) slide.addNotes(`— References (Part 2)

10. Xiao, G., et al. (2023). Efficient Streaming Language Models with Attention Sinks. arXiv:2309.17453. [StreamingLLM; rolling-window context; no 10:1 compression]

11. Demers, A., et al. (1987). Epidemic Algorithms for Replicated Database Maintenance. PODC 1987. [Foundational gossip protocol; not applied to LLM]

12. Shapiro, M., et al. (2011). Conflict-free Replicated Data Types. SSS 2011. [CRDTs for distributed consistency; theoretical basis for MNCD]

13. Brewer, E. (2000). Towards Robust Distributed Systems. PODC 2000 (CAP theorem keynote). [CAP theorem; basis for MNCD availability/partition-tolerance trade-off]

14. Kirchhoff, G. (1847). Über die Auflösung der Gleichungen, auf welche man bei der Untersuchung der linearen Vertheilung galvanischer Ströme geführt wird. Annalen der Physik, 72(12), 497–508. [Kirchhoff's circuit laws; mathematical basis for FCNP flow-field formulation]

15. Pan, R., et al. (2024). AdaKV: Adaptive Budget Allocation for Efficient KV Cache Compression. arXiv:2407.11550. [Adaptive attention-based KV compression; no citation preservation]

16. Wan, Z., et al. (2024). D2O: Dynamic Discriminative Operations for Efficient KV Cache Compression. arXiv:2406.13035. [Related KV compression work compared in FCNP baselines]

17. Liu, Y., et al. (2024). Finch: Prompt-guided Key-Value Cache Compression. arXiv:2408.00167. [Prompt-guided compression; one of 7 FCNP baselines]`);
  if (page === 2) slide.addNotes(`— References (Part 3)

18. Anil, R., et al. (2023). Gemini: A Family of Highly Capable Multimodal Models. arXiv:2312.11805. [Multi-agent LLM deployment context; motivates routing problem]

19. Zheng, L., et al. (2023). Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. NeurIPS 2023. [LLM evaluation methodology relevant to task success metric]

20. Liu, H., et al. (2023). AgentBench: Evaluating LLMs as Agents. arXiv:2308.03688. [AgentBench benchmark used in Obj 2 routing evaluation]

21. Mnih, V., et al. (2015). Human-level Control through Deep Reinforcement Learning. Nature 518, 529–533. [DQN; theoretical basis for APRR's RL weight update scheme]

22. Brown, T., et al. (2020). Language Models are Few-Shot Learners. NeurIPS 2020. [GPT-3; establishes multi-turn context importance in LLM inference]

23. Vaswani, A., et al. (2017). Attention Is All You Need. NeurIPS 2017. [Transformer attention mechanism; basis for FCNP's G=(V,E) attention-graph representation]

24. Hamilton, W.L., et al. (2017). Inductive Representation Learning on Large Graphs. NeurIPS 2017. [GraphSAGE; graph representation methods relevant to co-activation graph in SessionRerank+]`);
  if (page === 3) slide.addNotes(`— References (Part 4)

25. Shinn, N., et al. (2023). Reflexion: Language Agents with Verbal Reinforcement Learning. NeurIPS 2023. [Agent self-improvement via verbal feedback; context for APRR's success signal mechanism]

26. Park, J.S., et al. (2023). Generative Agents: Interactive Simulacra of Human Behavior. UIST 2023. [Multi-agent context management; motivates MNCD problem statement]

27. Wu, Q., et al. (2023). AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation. arXiv:2308.08155. [AutoGen multi-agent framework; closest existing system to ACRS architecture scope; does not address adaptive routing or Kirchhoff compression]

28. Guo, T., et al. (2024). Large Language Model based Multi-Agents: A Survey of Progress and Challenges. arXiv:2402.01680. [Survey paper; comprehensive overview of multi-agent LLM literature confirming identified gaps]

29. Tang, X., et al. (2024). ToolAlpaca: Generalized Tool Learning for Language Models with 3000 Simulated Cases. arXiv:2306.05301. [Tool learning baseline; stateless retrieval]

30. Spielman, D.A., & Teng, S.-H. (2004). Nearly-Linear Time Algorithms for Graph Partitioning, Graph Sparsification, and Solving Linear Systems. STOC 2004. [Algorithmic basis for near-linear Laplacian solvers used in FCNP Kirchhoff computation]


End of Speaker Script — Slide 38 of 38


Document metadata:
Student: Jenisha T | Reg: 24ETRP720001
Supervisor: Dr. Jyothi A P, Associate Professor & Programme Head (M&C), FET
Department: CSE, FET, M.S. Ramaiah University of Applied Sciences
Research Title: Design and Evaluation of ACRS (Adaptive Context Reasoning System) for Efficient Multi-Agent LLM Inference
Prepared: June 2026 | PRP-1`);

}

// ─────────────────────────────────────────────────────────────────────────────
//  WRITE OUTPUT
// ─────────────────────────────────────────────────────────────────────────────
pptx.writeFile({ fileName: path.join(__dirname, 'ACRS_PhD_Proposal_v3.pptx') })
  .then(() => {
    console.log('✓ ACRS_PhD_Proposal_v3.pptx written successfully');
  })
  .catch(err => {
    console.error('✗ Error writing PPTX:', err);
    process.exit(1);
  });