'use strict';
/**
 * ACRS PhD Research Proposal — build_pptx_v8.js
 * Generates ACRS_PhD_Proposal_v8.pptx (~55 slides)
 * KEY CHANGES FROM v7:
 *  - TOC redesigned: 2-col grid, NO abbreviations box, full forms
 *  - "Problem Context" renamed → "Introduction" everywhere
 *  - Algorithm flow: 3 slides per objective (pptxgenjs shapes, NO PNG)
 *  - 1 Implementation slide per objective
 *  - References: correct DOIs
 *  - First-mention acronym rule applied
 *  - Slide numbers visible bottom-right (deepPurple box)
 * Run: node build_pptx_v8.js
 */

const PptxGenJS = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  deepPurple: '3C2864',
  midPurple:  '6B4090',
  red:        'C8402A',
  white:      'FFFFFF',
  darkText:   '1A1035',
  blue:       '1565C0',
  teal:       '00695C',
  green:      '1B5E20',
  orange:     'E65100',
  indigo:     '283593',
  rose:       '880E4F',
  lavender:   'F0EBF8',
};

// ─── SAFE BASE64 READER ────────────────────────────────────────────────────────
function readB64(name) {
  const p = path.join(__dirname, `${name}_b64.txt`);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  return null;
}

// ─── LOAD IMAGES ──────────────────────────────────────────────────────────────
const logoB64 = readB64('logo');
const DIAG = {
  obj1Arch:      readB64('obj1_arch'),
  obj2Arch:      readB64('obj2_arch'),
  obj3Arch:      readB64('obj3_arch'),
  obj4Arch:      readB64('obj4_arch'),
  overallArch:   readB64('overall_arch'),
  overallFlow:   readB64('overall_flow'),
};

// ─── PRESENTATION SETUP ───────────────────────────────────────────────────────
const pptx = new PptxGenJS();
pptx.layout  = 'LAYOUT_WIDE'; // 13.33" × 7.5"
pptx.author  = 'Jenisha T';
pptx.company = 'M. S. Ramaiah University of Applied Sciences';
pptx.subject = 'PhD Research Proposal — ACRS';
pptx.title   = 'Design and Evaluation of Adaptive Context Reasoning System (ACRS) for Efficient Multi-Agent Large Language Model Inference';

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function addContentBg(slide) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.white }, line: { color: C.white },
  });
}

function addHeaderBar(slide, title) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.5,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText(title, {
    x: 0.3, y: 0.05, w: 12.7, h: 0.42,
    fontSize: 20, bold: true, color: C.white,
    fontFace: 'Calibri', valign: 'middle', align: 'left', margin: 0,
  });
}

function addFooter(slide, slideNum) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.22, w: 13.33, h: 0.28,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText('ACRS — PRP-1 | M.S. Ramaiah University | Jenisha T | 24ETRP720001', {
    x: 0.2, y: 7.23, w: 10.5, h: 0.24,
    fontSize: 8, color: C.white, fontFace: 'Calibri',
    bold: false, valign: 'middle', align: 'left',
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 12.33, y: 7.22, w: 1.0, h: 0.28,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText(`${slideNum}`, {
    x: 12.33, y: 7.22, w: 1.0, h: 0.28,
    fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri',
    valign: 'middle', align: 'center', margin: 0,
  });
}

// ─── LITERATURE REVIEW — PAPER → ARXIV PDF URL MAP ──────────────────────────
// Key: paper name string (must match exactly the first cell of each row)
// Value: arXiv PDF URL (direct download link)
const PAPER_URLS = {
  // Theme 1 — KV Cache
  'LazyLLM (Fu et al., 2024)':          'https://arxiv.org/pdf/2407.14057',
  'H2O (Zhang et al., 2023)':           'https://arxiv.org/pdf/2306.14048',
  'Scissorhands (Liu et al., 2023)':    'https://arxiv.org/pdf/2305.17118',
  'StreamingLLM (Xiao et al., 2024)':   'https://arxiv.org/pdf/2309.17453',
  'GEAR (Kang et al., 2024)':           'https://arxiv.org/pdf/2403.05527',
  'CacheGen (Liu et al., 2024)':        'https://doi.org/10.1145/3651890.3672274',
  'MiniCache (Liu et al., 2024)':       'https://arxiv.org/pdf/2405.14366',
  'ToolLLM (Qin et al., 2024)':         'https://arxiv.org/pdf/2307.16789',
  // Theme 2 — Routing
  'RouteLLM (Ong et al., 2024)':                'https://arxiv.org/pdf/2406.18665',
  'FrugalGPT (Chen et al., 2023)':              'https://arxiv.org/pdf/2305.05176',
  'Mixture-of-Agents (Wang et al., 2024)':      'https://arxiv.org/pdf/2406.04692',
  'TensorOpera Router (Stripelis, 2024)':       'https://arxiv.org/pdf/2407.17320',
  'RouterDC (Chen et al., 2024)':               'https://arxiv.org/abs/2408.01642',
  'PickLLM (Sikeridis et al., 2024)':           'https://arxiv.org/abs/2412.03109',
  'GraphRouter (Feng et al., 2024)':            'https://arxiv.org/pdf/2407.12322',
  'Eagle (Zhao et al., 2024)':                  'https://arxiv.org/abs/2409.15133',
  // Theme 3 — Decentralised MAS
  'AgentNet (Yang et al., 2025)':                       'https://arxiv.org/abs/2501.12145',
  'MAS Reliability (Zheng et al., 2025)':               'https://arxiv.org/abs/2503.03628',
  'MAS-FIRE (Jia et al., 2026)':                        'https://arxiv.org/abs/2502.09510',
  'MorphAgent (Lu et al., 2024)':                       'https://arxiv.org/abs/2410.06801',
  'LLM Multi-Agent Survey (Han et al., 2024)':          'https://arxiv.org/pdf/2402.01680',
  'Gossip Protocol in Fed. Learning (Husnoo, 2024)':    'https://arxiv.org/abs/2409.01327',
  'Gossip P2P Learning (Naik et al., 2023)':            'https://arxiv.org/abs/2312.09572',
  'FedCod (Yan et al., 2024)':                          'https://arxiv.org/abs/2404.10195',
  // Theme 4 — Pruning / Graph-Flow
  'Tero et al. (2010)':              'https://doi.org/10.1126/science.1177894',
  'Tero et al. (2007)':              'https://doi.org/10.1016/j.jtbi.2006.09.034',
  'Bonifaci et al. (2012)':          'https://doi.org/10.1016/j.jtbi.2012.01.024',
  'LoRA (Hu et al., 2022)':          'https://arxiv.org/pdf/2106.09685',
  'SparseGPT (Frantar et al., 2023)':'https://arxiv.org/pdf/2301.00774',
  'AdaKV (Ge et al., 2024)':         'https://arxiv.org/pdf/2407.11550',
  'Finch (Corallo et al., 2024)':    'https://arxiv.org/pdf/2408.00167',
};

// Helper: render one lit-review table cell with optional hyperlink on paper name (col 0)
// Workaround for pptxgenjs bug: bold is ignored on text runs that also carry hyperlink.
// Solution: transparent clickable shape carries the hyperlink; separate bold text carries the style.
function addLitTableCell(slide, pptx, cell, cIdx, rIdx, x, y, w, h, isHeader) {
  const url = (!isHeader && cIdx === 0) ? (PAPER_URLS[cell.trim()] || null) : null;
  if (url) {
    // Layer 1: invisible rect that carries the hyperlink (covers the full cell interior)
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 0.03, y: y + 0.03, w: w - 0.06, h: h - 0.06,
      fill: { color: 'FFFFFF', transparency: 100 },
      line: { color: 'FFFFFF', transparency: 100 },
      hyperlink: { url },
    });
    // Layer 2: bold blue text (no hyperlink — bold renders correctly)
    slide.addText(cell.trim(), {
      x: x + 0.05, y: y + 0.05, w: w - 0.1, h: h - 0.1,
      bold: true, color: '1565C0', fontSize: 10,
      fontFace: 'Calibri', wrap: true, valign: 'middle',
    });
  } else {
    slide.addText(cell, {
      x: x + 0.05, y: y + 0.05, w: w - 0.1, h: h - 0.1,
      fontSize: isHeader ? 11 : 10,
      bold: isHeader, color: isHeader ? C.white : C.darkText,
      fontFace: 'Calibri', wrap: true, valign: 'middle',
    });
  }
}

function makeSectionDivider(pptx, sectionNum, sectionTitle, slideNum) {
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.white }, line: { color: C.white },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.18, h: 7.22,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText(`${sectionNum}`, {
    x: 1, y: 1.5, w: 4, h: 2,
    fontSize: 80, bold: true, color: C.red,
    fontFace: 'Calibri', align: 'center', valign: 'middle',
  });
  slide.addText(sectionTitle, {
    x: 4.5, y: 2.2, w: 8.3, h: 2.8,
    fontSize: 34, bold: true, color: C.deepPurple,
    fontFace: 'Calibri', align: 'left', valign: 'middle', wrap: true,
  });
  // Footer
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.22, w: 13.33, h: 0.28,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText('ACRS — PRP-1 | M.S. Ramaiah University | Jenisha T | 24ETRP720001', {
    x: 0.2, y: 7.23, w: 10.5, h: 0.24,
    fontSize: 8, color: C.white, fontFace: 'Calibri', valign: 'middle',
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 12.33, y: 7.22, w: 1.0, h: 0.28,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText(`${slideNum}`, {
    x: 12.33, y: 7.22, w: 1.0, h: 0.28,
    fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri',
    valign: 'middle', align: 'center', margin: 0,
  });
  return slide;
}

function makeObjDivider(pptx, objNum, objLabel, slideNum) {
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.white }, line: { color: C.white },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
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
    fontSize: 34, bold: true, color: C.deepPurple,
    fontFace: 'Calibri', align: 'center', valign: 'middle', wrap: true,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.22, w: 13.33, h: 0.28,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText('ACRS — PRP-1 | M.S. Ramaiah University | Jenisha T | 24ETRP720001', {
    x: 0.2, y: 7.23, w: 10.5, h: 0.24,
    fontSize: 8, color: C.white, fontFace: 'Calibri', valign: 'middle',
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 12.33, y: 7.22, w: 1.0, h: 0.28,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText(`${slideNum}`, {
    x: 12.33, y: 7.22, w: 1.0, h: 0.28,
    fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri',
    valign: 'middle', align: 'center', margin: 0,
  });
  return slide;
}

function addCard(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: opts.fill || C.white },
    line: { color: opts.border || C.deepPurple, pt: 1 },
  });
}

/** Draw a single algorithm step box with badge */
function makeFlowStep(slide, stepLabel, x, y, w, h, title, lines, bgColor, borderColor) {
  // Rounded rect background
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: bgColor }, line: { color: borderColor, pt: 2 },
  });
  // Step badge colour
  const badgeColor = stepLabel === 'OUTPUT' ? C.green
                   : stepLabel === 'INPUT'  ? C.blue
                   : C.red;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.1, y: y + 0.06, w: 1.4, h: 0.3, rectRadius: 0.05,
    fill: { color: badgeColor }, line: { color: badgeColor },
  });
  slide.addText(stepLabel, {
    x: x + 0.1, y: y + 0.06, w: 1.4, h: 0.3,
    fontSize: 9, bold: true, color: C.white, align: 'center', valign: 'middle',
    fontFace: 'Calibri',
  });
  // Title
  slide.addText(title, {
    x: x + 1.6, y: y + 0.07, w: w - 1.7, h: 0.32,
    fontSize: 12, bold: true, color: C.deepPurple, wrap: true, fontFace: 'Calibri',
  });
  // Body lines
  lines.forEach((line, i) => {
    slide.addText(`\u25B8  ${line}`, {
      x: x + 0.15, y: y + 0.44 + i * 0.34, w: w - 0.25, h: 0.33,
      fontSize: 10.5, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });
}

/** Draw a vertical arrow between two step boxes */
function drawFlowArrow(slide, centerX, y_from_bottom, y_to_top, label, stepNum) {
  const midY = (y_from_bottom + y_to_top) / 2;
  // Arrow shaft
  slide.addShape(pptx.ShapeType.line, {
    x: centerX, y: y_from_bottom + 0.02, w: 0, h: y_to_top - y_from_bottom - 0.04,
    line: { color: C.deepPurple, pt: 2.5, endArrowType: 'arrow' },
  });
  // Step number badge ON the arrow (left of shaft)
  if (stepNum !== undefined) {
    slide.addShape(pptx.ShapeType.rect, {
      x: centerX - 0.27, y: midY - 0.17, w: 0.34, h: 0.34,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(String(stepNum), {
      x: centerX - 0.27, y: midY - 0.17, w: 0.34, h: 0.34,
      fontSize: 10, bold: true, color: C.white, fontFace: 'Calibri',
      align: 'center', valign: 'middle', margin: 0,
    });
  }
  // Data-flow label (right of shaft)
  if (label) {
    slide.addText(label, {
      x: centerX + 0.12, y: midY - 0.13, w: 3.8, h: 0.26,
      fontSize: 9, italic: true, color: C.midPurple, fontFace: 'Calibri',
      fill: { color: 'F8F5FF' }, line: { color: 'D0CAE8', pt: 0.5 },
    });
  }
}

function addDiagramSlide(pptx, title, caption, imgB64, imgExt, slideNum, novelItems) {
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, title);
  addFooter(slide, slideNum);
  if (caption) {
    slide.addText(caption, {
      x: 0.35, y: 0.58, w: 12.6, h: 0.32,
      fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
    });
  }
  // Optional novelty highlight bar — light blue strip listing novel contributions
  let imgY = caption ? 0.95 : 0.58;
  if (novelItems && novelItems.length > 0) {
    const novelBarH = 0.38;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35, y: imgY, w: 12.63, h: novelBarH,
      fill: { color: 'E3F0FF' }, line: { color: '1565C0', pt: 1.5 },
    });
    // ★ NOVEL badge
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35, y: imgY, w: 0.80, h: novelBarH,
      fill: { color: '1565C0' }, line: { color: '1565C0' },
    });
    slide.addText('★ NOVEL', {
      x: 0.35, y: imgY + 0.04, w: 0.80, h: novelBarH - 0.08,
      fontSize: 8, bold: true, color: 'FFFFFF', fontFace: 'Calibri',
      align: 'center', valign: 'middle', margin: 0,
    });
    // Novel items text
    slide.addText(novelItems.join('   |   '), {
      x: 1.20, y: imgY + 0.04, w: 11.73, h: novelBarH - 0.08,
      fontSize: 10, bold: true, color: '1565C0', fontFace: 'Calibri',
      wrap: true, valign: 'middle',
    });
    imgY += novelBarH + 0.04;
  }
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

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 1 — TITLE SLIDE
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.55,
    fill: { color: C.red }, line: { color: C.red },
  });
  if (logoB64) {
    slide.addImage({
      data: `image/jpeg;base64,${logoB64}`,
      x: 0.25, y: 0.08, w: 1.23, h: 0.38,
    });
  }
  slide.addText('M. S. Ramaiah University of Applied Sciences | Faculty of Engineering & Technology', {
    x: 4.5, y: 0.1, w: 8.6, h: 0.35,
    fontSize: 14, color: C.white, fontFace: 'Calibri',
    bold: false, align: 'right', valign: 'middle',
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 1.2, w: 12.33, h: 0,
    line: { color: C.white, pt: 1.5 },
  });
  slide.addText(
    'Design and Evaluation of\nAdaptive Context Reasoning System (ACRS)\nfor Efficient Multi-Agent Large Language Model (LLM) Inference',
    {
      x: 0.5, y: 1.35, w: 12.33, h: 2.4,
      fontSize: 32, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
      charSpacing: 0.3,
    }
  );
  slide.addText('PhD Research Proposal — PRP-1', {
    x: 0.5, y: 3.85, w: 12.33, h: 0.45,
    fontSize: 16, color: C.red, fontFace: 'Calibri',
    bold: true, align: 'center',
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 4.38, w: 12.33, h: 0,
    line: { color: C.white, pt: 0.75 },
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 6.66, y: 4.52, w: 0, h: 1.98,
    line: { color: C.red, pt: 1.5 },
  });
  // LEFT — Research Student
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
  // RIGHT — Supervisor
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
  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 6.22, w: 12.33, h: 0,
    line: { color: C.white, pt: 0.5, dashType: 'dash' },
  });
  slide.addText('June 2026  |  Bangalore — 560054', {
    x: 0.5, y: 6.3, w: 12.33, h: 0.32,
    fontSize: 13, color: C.red, fontFace: 'Calibri', align: 'center',
  });
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
//  SLIDE 2 — TABLE OF CONTENTS (REDESIGNED — NO ABBREVIATIONS BOX)
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Table of Contents');
  addFooter(slide, 2);

  const tocItems = [
    ['1',  'Introduction — Why Multi-Agent Large Language Model Inference Fails at Scale',         'Slides 3–4'],
    ['2',  'Literature Review — Four Themes and Research Gaps',                                    'Slides 5–9'],
    ['3',  'Research Gaps and Four Objectives',                                                    'Slide 10'],
    ['4',  'Adaptive Context Reasoning System Framework',                                           'Slide 11'],
    ['5',  'Objective 1 — Session-Aware Contextual Tool Reranker Plus',                            'Slides 12–18'],
    ['6',  'Objective 2 — Adaptive Priority-aware Request Router + Context-Driven Routing + Parallel Dispatch Routing', 'Slides 19–25'],
    ['7',  'Objective 3 — Multi-Node Context Distribution',                                        'Slides 26–32'],
    ['8',  'Objective 4 — Flow-Conductance-based Neural Pruning',                                  'Slides 33–39'],
    ['9',  'Overall Architecture and Algorithm Flow',                                              'Slides 40–41'],
    ['10', 'Novelty Matrix',                                                                       'Slide 42'],
    ['11', 'Feasibility, Ethics, and Methodology',                                                 'Slides 43–46'],
    ['12', 'Adaptive Context Reasoning System Integration Demo',                                    'Slide 47'],
    ['13', 'References',                                                                           'Slides 48–51'],
  ];

  const COL1_COUNT = 7; // fill col 1 first (items 0-6), then col 2 (items 7-12)
  // Col1 has 7 items (rows 0–6), col2 has 6 items (rows 0–5)
  // Both columns should end at the same y so they look balanced.
  // Col1 step=0.94: last item y = 0.55 + 6×0.94 = 6.19" (gap to footer 0.69")
  // Col2 step = (6.19−0.55)/5 = 1.128 so col2 also ends at y=6.19"
  const COL1_STEP = 0.94;
  const COL2_STEP = 1.128;
  tocItems.forEach(([num, label, pages], i) => {
    const col = i < COL1_COUNT ? 0 : 1;
    const row = i < COL1_COUNT ? i : (i - COL1_COUNT);
    const x = col === 0 ? 0.3 : 6.85;
    const step = col === 0 ? COL1_STEP : COL2_STEP;
    const y = 0.55 + row * step;
    const badgeW = num.length > 1 ? 0.52 : 0.38;
    const labelOff = num.length > 1 ? 0.58 : 0.44;
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: badgeW, h: 0.34,
      fill: { color: C.deepPurple }, line: { color: C.deepPurple },
    });
    slide.addText(num, {
      x: x + 0.01, y: y + 0.02, w: badgeW - 0.02, h: 0.3,
      fontSize: num.length > 1 ? 11 : 13, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addText(label, {
      x: x + labelOff, y: y + 0.02, w: 5.9, h: 0.32,
      fontSize: 11, color: C.darkText, fontFace: 'Calibri', bold: false, wrap: true, valign: 'middle',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 3 — SECTION DIVIDER: INTRODUCTION
// ─────────────────────────────────────────────────────────────────────────────
makeSectionDivider(pptx, 'I',
  'Section I — Introduction:\nWhy Multi-Agent Large Language Model Inference Fails at Scale',
  3);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 4 — INTRODUCTION (renamed from Problem Context)
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Introduction: The Four Core Challenges');
  addFooter(slide, 4);

  slide.addText('Modern multi-agent Large Language Model (LLM) systems face four critical bottlenecks that prevent real-world deployment:', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  const problems = [
    {
      num: 'P1',
      title: 'Tool Selection Inefficiency',
      body: 'Agents search flat, unranked tool catalogues (16,000+ Application Programming Interfaces (APIs) on ToolBench). Session context — which tools worked earlier — is ignored, causing repeated re-selection and inflated latency.',
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
      body: 'Multi-agent conversation histories accumulate thousands of redundant tokens. Without adaptive pruning, Key-Value (KV) cache size grows O(n²) with dialogue length, degrading throughput.',
    },
  ];

  problems.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.35 : 6.85;
    const y = 1.05 + row * 2.75;
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.58, h: 0.52,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(p.num, {
      x: x + 0.01, y: y + 0.05, w: 0.56, h: 0.42,
      fontSize: 16, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    addCard(slide, x + 0.62, y, 5.8, 2.4, { fill: C.white, border: C.deepPurple });
    slide.addText(p.title, {
      x: x + 0.75, y: y + 0.06, w: 5.55, h: 0.38,
      fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
    });
    slide.addText(p.body, {
      x: x + 0.75, y: y + 0.48, w: 5.55, h: 1.86,
      fontSize: 13, color: C.darkText, fontFace: 'Calibri',
      wrap: true, valign: 'top',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 5 — LITERATURE REVIEW THEME 1 (KV Cache / Session Context)
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature — Theme 1: Key-Value (KV) Cache Compression & Session Context Management (Motivates Obj 1)');
  addFooter(slide, 5);

  const rows = [
    ['Paper', 'Venue', 'Key Finding', 'Relevance to Obj 1'],
    ['LazyLLM (Fu et al., 2024)', 'arXiv:2407.14057', 'Dynamic token pruning; 2.34× prefill speedup on LLaMA-2-7B', 'SessionRerank+ dynamic pruning component'],
    ['H2O (Zhang et al., 2023)', 'NeurIPS 2023', '"Heavy-hitter" tokens drive attention; eviction cuts KV memory 20×', 'Activity-score-driven KV eviction in SessionRerank+'],
    ['Scissorhands (Liu et al., 2023)', 'NeurIPS 2023', 'Persistence-of-importance: pivot-set KV cache, 5× memory reduction', 'Temporal stability basis for activity-history weighting'],
    ['StreamingLLM (Xiao et al., 2024)', 'ICLR 2024', 'Attention sinks enable infinite streaming; 22.2× faster', 'Session-init tokens as permanent anchors in reranking'],
    ['GEAR (Kang et al., 2024)', 'arXiv:2403.05527', 'Low-rank + sparse KV compression; <0.5% accuracy drop at 4-bit', 'Low-rank decomposition for session-history states'],
    ['CacheGen (Liu et al., 2024)', 'SIGCOMM 2024', 'Compressed KV bitstream streaming; 3.7× bandwidth reduction', 'Persistent-session KV serialisation across inference steps'],
    ['MiniCache (Liu et al., 2024)', 'NeurIPS 2024', 'Depth-dimension KV compression via cross-layer token merging', 'Depth-aware KV fusion in SessionRerank+'],
    ['ToolLLM (Qin et al., 2024)', 'ICLR 2024', 'DFSDT on 16k+ APIs; ToolBench evaluation framework', 'Benchmark and tool-routing baseline for SessionRerank+'],
  ];

  const colW = [3.0, 1.8, 4.6, 3.3];
  const colX = [0.3, 3.35, 5.2, 9.85];
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
      addLitTableCell(slide, pptx, cell, cIdx, rIdx, colX[cIdx], y, colW[cIdx], rowH, isHeader);
    });
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 5.48, w: 12.73, h: 0.72,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('KEY INSIGHT: All KV compression works treat each query independently. MISSING: Session-aware activity scoring that reranks tool relevance across multi-turn agent dialogues. → SessionRerank+ fills this gap.', {
    x: 0.45, y: 5.52, w: 12.5, h: 0.65,
    fontSize: 13, color: C.white, fontFace: 'Calibri', wrap: true,
  });
  slide.addText([
    { text: 'Paper Folder: ', options: { color: C.darkText, fontSize: 9, fontFace: 'Calibri' } },
    { text: 'Open Drive Folder ↗', options: { hyperlink: { url: 'https://drive.google.com/drive/u/0/folders/1sAOY-c2Bg0Io7102_klRrvtyOj06Kc0Z' }, color: '1565C0', bold: true, fontSize: 9, fontFace: 'Calibri' }},
  ], { x: 0.3, y: 6.28, w: 12.73, h: 0.18, valign: 'middle' });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 6 — LITERATURE REVIEW THEME 2 (Adaptive Routing)
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature — Theme 2: Adaptive Multi-Agent Large Language Model (LLM) Routing (Motivates Obj 2)');
  addFooter(slide, 6);

  const rows = [
    ['Paper', 'Venue', 'Key Finding', 'Relevance to Obj 2'],
    ['RouteLLM (Ong et al., 2024)', 'arXiv:2406.18665', 'Offline preference-data training to route queries; reduces GPT-4 calls 50%', 'Demonstrates routing viability; Adaptive Priority-aware Request Router (APRR)+CDR+PDR addresses offline-only limitation'],
    ['FrugalGPT (Chen et al., 2023)', 'arXiv:2305.05176', 'Cascade routing to balance cost/quality; fixed policy learned offline', 'Baseline cost-routing; lacks online Reinforcement Learning (RL) adaptation (addressed by APRR)'],
    ['Mixture-of-Agents (Wang et al., 2024)', 'arXiv/COLM', 'Layered agent aggregation improves quality; no dynamic routing', 'Motivates parallel dispatch — Parallel Dispatch Routing (PDR) extends this with functional-token routing'],
    ['TensorOpera Router (Stripelis, 2024)', 'EMNLP 2024', 'Multi-model router with hardware-aware scheduling', 'Infrastructure context for Context-Driven Routing (CDR) deliberation scoring'],
    ['RouterDC (Chen et al., 2024)', 'arXiv', 'Dual contrastive learning for query-based routing', 'Contrastive objective comparable to CDR quality scoring'],
    ['PickLLM (Sikeridis et al., 2024)', 'arXiv', 'Context-aware RL-assisted routing for LLMs', 'Closest prior art to APRR; lacks exponential decay + binary session signals'],
    ['GraphRouter (Feng et al., 2024)', 'arXiv', 'Graph-based routing with relational reasoning', 'Graph routing vs. CDR chain-of-thought deliberation comparison'],
    ['Eagle (Zhao et al., 2024)', 'arXiv', 'Training-free multi-LLM router via capability matching', 'Training-free baseline; APRR+CDR+PDR surpasses with online RL'],
  ];

  const colW = [3.0, 1.8, 4.6, 3.3];
  const colX = [0.3, 3.35, 5.2, 9.85];
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
      addLitTableCell(slide, pptx, cell, cIdx, rIdx, colX[cIdx], y, colW[cIdx], rowH, isHeader);
    });
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 5.48, w: 12.73, h: 0.72,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('KEY INSIGHT: All routing systems use offline-trained fixed policies. MISSING: Online RL weight matrix with live binary session signals + exponential decay. → APRR+CDR+PDR fills this gap.', {
    x: 0.45, y: 5.52, w: 12.5, h: 0.65,
    fontSize: 13, color: C.white, fontFace: 'Calibri', wrap: true,
  });
  slide.addText([
    { text: 'Paper Folder: ', options: { color: C.darkText, fontSize: 9, fontFace: 'Calibri' } },
    { text: 'Open Drive Folder ↗', options: { hyperlink: { url: 'https://drive.google.com/drive/u/0/folders/1sAOY-c2Bg0Io7102_klRrvtyOj06Kc0Z' }, color: '1565C0', bold: true, fontSize: 9, fontFace: 'Calibri' }},
  ], { x: 0.3, y: 6.28, w: 12.73, h: 0.18, valign: 'middle' });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 7 — LITERATURE REVIEW THEME 3 (Decentralised MAS)
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature — Theme 3: Decentralised Multi-Agent Coordination & Fault Tolerance (Motivates Obj 3 — MNCD)');
  addFooter(slide, 7);

  const rows = [
    ['Paper', 'Venue', 'Key Finding', 'Relevance to Obj 3'],
    ['AgentNet (Yang et al., 2025)', 'arXiv cs.MA', 'Decentralised evolutionary coordination for LLM agents; emergent specialisation', 'Decentralisation model for MNCD node topology'],
    ['MAS Reliability (Zheng et al., 2025)', 'arXiv cs.MA', 'Byzantine fault perspective on multi-agent reliability', 'Fault model validation for MNCD 2-of-5 failure scenario'],
    ['MAS-FIRE (Jia et al., 2026)', 'arXiv cs.SE', 'Fault injection & reliability evaluation for LLM multi-agent systems', 'Evaluation framework for MNCD fault-tolerance benchmarking'],
    ['MorphAgent (Lu et al., 2024)', 'arXiv cs.AI', 'Self-evolving agent profiles with decentralised memory', 'Decentralised profile store analogous to MNCD context nodes'],
    ['LLM Multi-Agent Survey (Han et al., 2024)', 'arXiv:2402.01680', 'Open problems: fault tolerance, context sharing, coordination protocols', 'Positions MNCD within the open-problem landscape'],
    ['Gossip Protocol in Fed. Learning (Husnoo, 2024)', 'arXiv cs.CR', 'P2P gossip-based anomaly detection in smart grids', 'Gossip-protocol broadcast validated for distributed AI context'],
    ['Gossip P2P Learning (Naik et al., 2023)', 'IEEE ICTBIG', 'Gossip protocol basics for federated peer learning', 'MNCD propagation rounds baseline (O(log n))'],
    ['FedCod (Yan et al., 2024)', 'arXiv cs.DC', 'Efficient cross-silo federated communication with coded protocols', 'Communication efficiency bounds for MNCD propagation'],
  ];

  const colW = [3.0, 1.8, 4.6, 3.3];
  const colX = [0.3, 3.35, 5.2, 9.85];
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
      addLitTableCell(slide, pptx, cell, cIdx, rIdx, colX[cIdx], y, colW[cIdx], rowH, isHeader);
    });
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 5.48, w: 12.73, h: 0.72,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('KEY INSIGHT: Existing fault-tolerant MAS work does not address LLM session context propagation. MISSING: Gossip-protocol broadcast with O(log n) propagation and ≥97% context availability under node failures. → MNCD fills this gap.', {
    x: 0.45, y: 5.52, w: 12.5, h: 0.65,
    fontSize: 13, color: C.white, fontFace: 'Calibri', wrap: true,
  });
  slide.addText([
    { text: 'Paper Folder: ', options: { color: C.darkText, fontSize: 9, fontFace: 'Calibri' } },
    { text: 'Open Drive Folder ↗', options: { hyperlink: { url: 'https://drive.google.com/drive/u/0/folders/1sAOY-c2Bg0Io7102_klRrvtyOj06Kc0Z' }, color: '1565C0', bold: true, fontSize: 9, fontFace: 'Calibri' }},
  ], { x: 0.3, y: 6.28, w: 12.73, h: 0.18, valign: 'middle' });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 8 — LITERATURE REVIEW THEME 4 (Pruning / Graph-Flow)
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature — Theme 4: Adaptive Network Pruning & Graph-Flow Optimisation (Motivates Obj 4 — FCNP)');
  addFooter(slide, 8);

  const rows = [
    ['Paper', 'Venue', 'Key Finding', 'Relevance to Obj 4'],
    ['Tero et al. (2010)', 'Science', 'Adaptive transport network design rules in biological systems', 'Flow-controlled pruning formalism adapted to token-graph topology'],
    ['Tero et al. (2007)', 'J. Theor. Biol.', 'Mathematical model for adaptive network path-finding', 'Path reinforcement model basis for FCNP flow-score pruning'],
    ['Bonifaci et al. (2012)', 'J. Theor. Biol.', 'Shortest path convergence proof for adaptive network dynamics', 'Convergence guarantee for FCNP iterative pruning'],
    ['LoRA (Hu et al., 2022)', 'ICLR 2022 — arXiv:2106.09685', 'Low-rank matrix decomposition for efficient LLM fine-tuning (parameter-efficient fine-tuning baseline)', 'Low-rank adaptation principle for FCNP weight updates'],
    ['SparseGPT (Frantar et al., 2023)', 'ICML 2023', 'One-shot pruning of massive LLMs with minimal accuracy loss', 'One-shot pruning baseline compared against FCNP iterative compression'],
    ['Scissorhands (Liu et al., 2023)', 'NeurIPS 2023 — arXiv:2305.17118', 'Importance persistence enables selective KV retention', 'Token importance stability reused in FCNP context-graph scoring'],
    ['AdaKV (Ge et al., 2024)', 'ICLR 2024 — arXiv:2407.11550', 'Adaptive KV budget allocation guided by model internals', 'Dynamic budget allocation strategy for FCNP per-agent allocation'],
    ['Finch (Corallo et al., 2024)', 'TACL 2024 — arXiv:2408.00167', 'Prompt-guided KV cache compression with minimal loss', 'Prompt-guided scoring complements FCNP citation-preserving compression'],
  ];

  const colW = [3.0, 1.8, 4.6, 3.3];
  const colX = [0.3, 3.35, 5.2, 9.85];
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
      addLitTableCell(slide, pptx, cell, cIdx, rIdx, colX[cIdx], y, colW[cIdx], rowH, isHeader);
    });
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.3, y: 5.48, w: 12.73, h: 0.72,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('KEY INSIGHT: Flow-optimisation pruning from graph theory achieves high compression with convergence guarantees. MISSING: 10:1 compression with ≥99% citation accuracy in multi-agent LLM context graphs. → FCNP fills this gap.', {
    x: 0.45, y: 5.52, w: 12.5, h: 0.65,
    fontSize: 13, color: C.white, fontFace: 'Calibri', wrap: true,
  });
  slide.addText([
    { text: 'Paper Folder: ', options: { color: C.darkText, fontSize: 9, fontFace: 'Calibri' } },
    { text: 'Open Drive Folder ↗', options: { hyperlink: { url: 'https://drive.google.com/drive/u/0/folders/1sAOY-c2Bg0Io7102_klRrvtyOj06Kc0Z' }, color: '1565C0', bold: true, fontSize: 9, fontFace: 'Calibri' }},
  ], { x: 0.3, y: 6.28, w: 12.73, h: 0.18, valign: 'middle' });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 9 — LITERATURE GAP SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Literature Review — Gap Summary Across All Four Themes');
  addFooter(slide, 9);

  slide.addText('Four independent literature streams each reveal a distinct, unresolved gap. The Adaptive Context Reasoning System (ACRS) addresses all four simultaneously.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const gaps = [
    {
      theme: 'Theme 1', obj: 'Obj 1 — SessionRerank+',
      gap: 'No prior work applies session-history activity scoring to dynamically rerank tool relevance across multi-turn agent dialogues on large-scale tool catalogues (ToolBench 16k+ APIs).',
      metric: 'Normalised Discounted Cumulative Gain (NDCG)@5 ≥ 0.52',
    },
    {
      theme: 'Theme 2', obj: 'Obj 2 — APRR+CDR+PDR',
      gap: 'No system combines online Reinforcement Learning (RL) weight updates, exponential decay, chain-of-thought quality scoring (CDR), and parallel functional-token dispatch (PDR) in a single routing framework.',
      metric: 'Success ≥ 47%, Latency ≤ 265ms',
    },
    {
      theme: 'Theme 3', obj: 'Obj 3 — MNCD',
      gap: 'No existing decentralised MAS protocol delivers ≥97% Large Language Model (LLM) session context availability under 2-of-5 node failures with O(log n) propagation rounds.',
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
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.3, y, w: 1.5, h: 1.18,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(g.theme, {
      x: 0.31, y: y + 0.1, w: 1.48, h: 0.3,
      fontSize: 14, bold: true, color: C.white, fontFace: 'Calibri', align: 'center',
    });
    slide.addText(g.metric, {
      x: 0.31, y: y + 0.40, w: 1.48, h: 0.72,
      fontSize: 10, color: C.white, fontFace: 'Calibri', align: 'center', wrap: true, valign: 'middle',
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.88, y, w: 11.1, h: 1.18,
      fill: { color: C.white }, line: { color: C.deepPurple, pt: 0.5 },
    });
    slide.addText(g.obj, {
      x: 2.0, y: y + 0.05, w: 10.9, h: 0.28,
      fontSize: 14, bold: true, color: C.deepPurple, fontFace: 'Calibri',
    });
    slide.addText(g.gap, {
      x: 2.0, y: y + 0.36, w: 10.9, h: 0.78,
      fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true,
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

  slide.addText('Each gap directly maps to one research objective. Together, they form the Adaptive Context Reasoning System (ACRS) framework.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 14, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const objs = [
    {
      num: '1',
      title: 'SessionRerank+ — Session-Aware Contextual Tool Reranker Plus',
      gap: 'Static tool lookup ignores session history',
      objective: 'Design a session-aware activity-scoring mechanism to dynamically rerank tool relevance across multi-turn agent dialogues on large Application Programming Interface (API) catalogs.',
      metric: 'Normalised Discounted Cumulative Gain (NDCG)@5 ≥ 0.52 on ToolBench (43,000 APIs)',
    },
    {
      num: '2',
      title: 'APRR+CDR+PDR — Adaptive Priority-aware Request Router + Context-Driven Routing + Parallel Dispatch Routing',
      gap: 'No system combines online Reinforcement Learning (RL) weight updates, exponential decay, chain-of-thought quality scoring (CDR), and parallel functional-token dispatch (PDR)',
      objective: 'Build an online RL routing system with CDR chain-of-thought deliberation and PDR parallel agent dispatch, updated by live binary session feedback with exponential decay.',
      metric: 'Task success ≥ 47%, Latency ≤ 265ms, ≥2% over baseline routing',
    },
    {
      num: '3',
      title: 'MNCD — Multi-Node Context Distribution',
      gap: 'No decentralised MAS maintains ≥97% context availability under node failures',
      objective: 'Design a gossip-protocol broadcast system for resilient multi-agent context sharing with O(log n) propagation and fault tolerance under 2-of-5 node failures.',
      metric: 'Context availability ≥ 97% under 2/5 node failures',
    },
    {
      num: '4',
      title: 'FCNP — Flow-Conductance-based Neural Pruning',
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
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.3, y, w: 0.48, h: 1.42,
      fill: { color: C.deepPurple }, line: { color: C.deepPurple },
    });
    slide.addText(o.num, {
      x: 0.3, y: y + 0.45, w: 0.48, h: 0.52,
      fontSize: 20, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addText(o.title, {
      x: 0.85, y: y + 0.03, w: 12.1, h: 0.44,
      fontSize: 12, bold: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
    });
    slide.addText(`Gap: ${o.gap}`, {
      x: 0.85, y: y + 0.47, w: 8.5, h: 0.26,
      fontSize: 11, italic: true, color: C.midPurple, fontFace: 'Calibri', wrap: true,
    });
    slide.addText(o.objective, {
      x: 0.85, y: y + 0.74, w: 9.0, h: 0.50,
      fontSize: 11, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 9.95, y: y + 0.12, w: 2.95, h: 1.18,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(o.metric, {
      x: 9.97, y: y + 0.18, w: 2.9, h: 1.05,
      fontSize: 12, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', wrap: true, valign: 'middle',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 11 — ACRS FRAMEWORK
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Research Title, Aim & Adaptive Context Reasoning System (ACRS) Framework Overview');
  addFooter(slide, 11);

  slide.addText('"Design and Evaluation of Adaptive Context Reasoning System (ACRS) for Efficient Multi-Agent Large Language Model (LLM) Inference"', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.6,
    fontSize: 15, bold: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  slide.addText('Aim: Deliver a four-component system that improves tool selection accuracy, routing efficiency, context availability, and context compression for production-grade multi-agent Large Language Model (LLM) inference — validated on ToolBench, RouteLLM benchmarks, and simulated fault scenarios.', {
    x: 0.35, y: 1.22, w: 12.6, h: 0.6,
    fontSize: 13, color: C.darkText, fontFace: 'Calibri', italic: true, wrap: true,
  });

  const cards = [
    { num: '1', title: 'SessionRerank+', sub: 'Session-Aware Contextual Tool Reranker Plus', metric: 'NDCG@5 ≥ 0.52', desc: 'Activity-score-driven dynamic tool reranking across multi-turn agent sessions' },
    { num: '2', title: 'APRR+CDR+PDR', sub: 'Adaptive Priority-aware Request Router + Context-Driven Routing + Parallel Dispatch Routing', metric: 'Success ≥ 47%, Latency ≤ 265ms', desc: 'Online Reinforcement Learning (RL) weight matrix + CDR deliberation + PDR parallel dispatch' },
    { num: '3', title: 'MNCD', sub: 'Multi-Node Context Distribution', metric: 'Availability ≥ 97%', desc: 'Gossip-protocol mesh for resilient context sharing under node failures' },
    { num: '4', title: 'FCNP', sub: 'Flow-Conductance-based Neural Pruning', metric: '10:1 compression', desc: 'Flow-score graph pruning: 10:1 compression, ≥99% citation accuracy' },
  ];

  cards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 0.35 : 6.85;
    const y = 1.95 + row * 2.55;
    addCard(slide, x, y, 6.2, 2.35, { fill: C.white, border: C.deepPurple });
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 0.48, h: 0.48,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(c.num, {
      x: x + 0.01, y: y + 0.05, w: 0.46, h: 0.38,
      fontSize: 16, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addText(c.title, {
      x: x + 0.55, y: y + 0.04, w: 5.6, h: 0.34,
      fontSize: 15, bold: true, color: C.deepPurple, fontFace: 'Calibri',
    });
    slide.addText(c.sub, {
      x: x + 0.55, y: y + 0.40, w: 5.6, h: 0.36,
      fontSize: 11, italic: true, color: C.midPurple, fontFace: 'Calibri', wrap: true,
    });
    slide.addText(c.desc, {
      x: x + 0.15, y: y + 0.82, w: 5.95, h: 0.62,
      fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 0.15, y: y + 1.52, w: 5.95, h: 0.6,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(c.metric, {
      x: x + 0.15, y: y + 1.57, w: 5.95, h: 0.5,
      fontSize: 14, bold: true, color: C.white, fontFace: 'Calibri',
      align: 'center', valign: 'middle',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 12 — OBJ 1 DIVIDER
// ─────────────────────────────────────────────────────────────────────────────
makeObjDivider(pptx, 1,
  'Objective 1: Session-Aware Contextual Tool Reranker Plus',
  12);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 13 — OBJ 1 DETAIL
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 1 — SessionRerank+: Session-Aware Contextual Tool Reranker Plus');
  addFooter(slide, 13);

  slide.addText('Approach', {
    x: 0.35, y: 0.58, w: 5.8, h: 0.32,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });
  const points = [
    'Maintain per-session activity scores for each tool in the catalogue',
    'Score = f(recency, frequency, task-type match) across multi-turn history',
    'Rerank top-K candidate tools before each agent dispatch call',
    'Dynamic Key-Value (KV) cache eviction based on activity scores',
    'Evaluated on ToolBench: 43,000 real-world Application Programming Interfaces (APIs), 12,657 instructions',
    'Baseline: dense retrieval Normalised Discounted Cumulative Gain (NDCG)@5 = 0.452 (ToolBench reported)',
  ];
  points.forEach((pt, i) => {
    slide.addText(`\u2022 ${pt}`, {
      x: 0.45, y: 0.96 + i * 0.44, w: 5.7, h: 0.4,
      fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });

  slide.addText('Expected Outcome & Metric Definitions', {
    x: 6.5, y: 0.58, w: 6.5, h: 0.32,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  addCard(slide, 6.5, 0.96, 6.5, 2.5, { fill: C.white, border: C.deepPurple });
  slide.addText('NDCG@5 ≥ 0.52', {
    x: 6.6, y: 1.0, w: 6.3, h: 0.48,
    fontSize: 28, bold: true, color: C.red, fontFace: 'Calibri',
  });
  slide.addText('+2% over dense retrieval baseline (0.452 → 0.461+)', {
    x: 6.6, y: 1.5, w: 6.3, h: 0.28,
    fontSize: 13, color: C.darkText, fontFace: 'Calibri',
  });
  slide.addText('Normalised Discounted Cumulative Gain (NDCG)@5 measures how well the top-5 tools are ranked — a score of 1.0 means perfect ordering. The "discounted" component penalises relevant tools appearing lower in the list.', {
    x: 6.6, y: 1.82, w: 6.3, h: 1.58,
    fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true,
  });

  addCard(slide, 6.5, 3.56, 6.5, 3.58, { fill: C.deepPurple, border: C.deepPurple });
  slide.addText('Research Progress to Date:', {
    x: 6.6, y: 3.62, w: 6.3, h: 0.3,
    fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri',
  });
  slide.addText([
    { text: 'NDCG@5 = 0.461 (Year 1 pilot)', options: { bold: true, fontSize: 13, color: C.white } },
    { text: ' on ToolBench (43,000 real-world APIs, p<0.0001, n=500 test queries)', options: { fontSize: 13, color: C.white } },
  ], {
    x: 6.6, y: 3.96, w: 6.3, h: 0.5,
    fontFace: 'Calibri', wrap: true,
  });
  slide.addText('Expected outcome (full study): NDCG@5 ≥ 0.52 (+2% over dense retrieval baseline). Full evaluation targets p<0.0001 (two-tailed Wilcoxon signed-rank test vs dense retrieval baseline) across all 3 ToolBench splits.', {
    x: 6.6, y: 4.52, w: 6.3, h: 2.5,
    fontSize: 13, color: C.white, fontFace: 'Calibri', wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 14 — OBJ 1 ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Objective 1 — System Architecture Diagram',
  'Five-stage pipeline: multilingual input → IndicTrans2 translation → Gemma-4 embedding → BM25 recall → co-activation reranking → ranked Top-K output.',
  DIAG.obj1Arch, 'png', 14);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDES 15–17 — OBJ 1 ALGORITHM FLOW (3 slides, pptxgenjs shapes)
// ─────────────────────────────────────────────────────────────────────────────

// Slide 15: Phase 1 — Input Processing and Candidate Recall
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 1 — Algorithm Flow: Phase 1 — Input Processing and Candidate Recall');
  addFooter(slide, 15);

  slide.addText('SessionRerank+ Phase 1: The farmer query and session history enter the system and candidate tools are recalled from the ToolBench catalogue.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.55;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.92;
  const y1 = y0 + stepH + 0.26;
  const y2 = y1 + stepH + 0.26;

  makeFlowStep(slide, 'INPUT', stepX, y0, stepW, stepH,
    'Multi-Turn Farmer Query + Session History + Application Programming Interface (API) Catalogue',
    [
      'Input: natural language query (Kannada/Hindi/English)',
      'Session history: list of previously invoked tool IDs with timestamps',
      'ToolBench API catalogue: 43,000 tools, each with name, description, endpoint',
    ],
    'EFF6FF', '1565C0');

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'query + session', 1);

  makeFlowStep(slide, 'STEP 1', stepX, y1, stepW, stepH,
    'Multilingual Translation via IndicTrans2',
    [
      'If query language \u2260 English: invoke IndicTrans2 (Gala et al., TMLR 2023) translation module',
      'Translates from 22 scheduled Indian languages to English for embedding',
      'Language detection: fastText lid.176.bin classifier (confidence \u2265 0.90)',
    ],
    'F5F3FF', C.midPurple);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'English query', 2);

  makeFlowStep(slide, 'STEP 2', stepX, y2, stepW, stepH,
    'Gemma-4 Embedding + BM25 Candidate Recall',
    [
      'Embed query using Gemma-4 (via HuggingFace Inference API) to 2048-dim dense vector',
      'FAISS ANN search: retrieve top-100 candidate tools by cosine similarity',
      'Parallel BM25 recall: retrieve top-100 tools by keyword overlap (Okapi BM25, k1=1.5, b=0.75)',
      'Union of both sets: candidate pool \u2264 150 unique tools',
    ],
    'F5F3FF', C.midPurple);
}

// Slide 16: Phase 2 — Scoring and Reranking
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 1 — Algorithm Flow: Phase 2 — Scoring and Reranking');
  addFooter(slide, 16);

  slide.addText('SessionRerank+ Phase 2: Three-term composite score is computed for each candidate tool and the list is reranked.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'STEP 3', stepX, y0, stepW, stepH,
    'Co-Activation Prior Score (Session Graph Lookup)',
    [
      'Look up co-activation graph G: edge weight w(tool_i, tool_j) = historical co-call frequency',
      'Session prior score P(t|session) = \u03A3 w(t, prev_tool_k) \u00D7 \u03BB^(age_k), decay \u03BB = 0.97',
      'Higher score = tools that frequently co-occur with recently used tools',
    ],
    'F5F3FF', C.midPurple);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'prior score', 3);

  makeFlowStep(slide, 'STEP 4', stepX, y1, stepW, stepH,
    'Three-Term Composite Score',
    [
      'Score(t) = \u03B11 \u00D7 Semantic(t) + \u03B12 \u00D7 BM25(t) + \u03B13 \u00D7 SessionPrior(t)',
      'Default weights: \u03B11 = 0.4, \u03B12 = 0.2, \u03B13 = 0.4 (tuned on ToolBench dev set)',
      'Weights are per-session adaptive: updated by online gradient descent after each query outcome',
    ],
    'F5F3FF', C.midPurple);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'ranked scores', 4);

  makeFlowStep(slide, 'STEP 5', stepX, y2, stepW, stepH,
    'Rerank and Select Top-K Candidate Tools',
    [
      'Sort candidate pool by composite Score(t) descending',
      'Select Top-K tools (K = 5 for evaluation; K = 10 for production dispatch)',
      'Output: ordered list of (tool_id, score, endpoint) tuples forwarded to agent dispatcher',
    ],
    'F5F3FF', C.midPurple);
}

// Slide 17: Phase 3 — Execution and Graph Update
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 1 — Algorithm Flow: Phase 3 — Execution and Graph Update');
  addFooter(slide, 17);

  slide.addText('SessionRerank+ Phase 3: The ranked tools are dispatched to agents, results returned, and the co-activation graph is updated online for the next query.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'STEP 6', stepX, y0, stepW, stepH,
    'Agent Tool Dispatch and Execution',
    [
      'Agent calls Top-K tools via ToolBench API executor (DFS Decision Tree search)',
      'Execution result: success/failure signal + tool output string',
      'Tool execution logs appended to session history for next-turn reranking',
    ],
    'F5F3FF', C.midPurple);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'success/fail signal', 5);

  makeFlowStep(slide, 'STEP 7', stepX, y1, stepW, stepH,
    'Online Co-Activation Graph Edge Update',
    [
      'For each pair of tools (t_i, t_j) called in same session turn: w(t_i, t_j) += \u0394 (default \u0394 = 0.1)',
      'Failed tools: w(t_i, t_failed) \u2212= \u0394/2 (penalty for unsuccessful co-activation)',
      'Graph stored as sparse adjacency dict; FAISS index rebuilt every 100 sessions',
    ],
    'F5F3FF', C.midPurple);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'updated graph + ranked tools', 6);

  makeFlowStep(slide, 'OUTPUT', stepX, y2, stepW, stepH,
    'Ranked Top-K Tool List + Updated Session Graph',
    [
      'Primary output: ranked Top-K API list with composite scores for agent executor',
      'Secondary output: updated co-activation graph for persistent session-aware reranking',
      'Evaluation: Normalised Discounted Cumulative Gain (NDCG)@5 = 0.461 (Year 1 pilot); target \u2265 0.52 (full study)',
    ],
    'ECFDF5', C.green);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 18 — OBJ 1 IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 1 — Implementation: Repository and Deployment');
  addFooter(slide, 18);

  slide.addText('All code, notebooks, and deployment artefacts for SessionRerank+ are publicly available and reproducible.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.32,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  const implItems = [
    { label: 'Repository', value: 'https://github.com/joyjeni/session-aware-toolbench-rerank', color: C.blue },
    { label: 'Key Files', value: 'src/session_reranker.py — main reranking engine\nsrc/co_activation_graph.py — session graph store\nkaggle/sessionrerank_gemma4_kaggle.ipynb — full experiment notebook', color: C.deepPurple },
    { label: 'HuggingFace Space', value: 'https://huggingface.co/spaces/abigailcreations/karnataka-agri-assistant\n(Live Gradio demo: Kannada/Hindi/English farmer queries → SessionRerank+ → data.gov.in cited response)', color: C.teal },
    { label: 'Stack', value: 'Python 3.10, Gemma-4 (via HuggingFace (HF) Inference API), FAISS, IndicTrans2, data.gov.in Application Programming Interface (API)', color: C.indigo },
    { label: 'Dataset', value: 'ToolBench 43K APIs + data.gov.in Karnataka APMC mandi price feed\n(Resource ID: 9ef84268-d588-465a-a308-a864a43d0070)', color: C.orange },
    { label: 'Year 1 Pilot Result', value: 'NDCG@5 = 0.461 | n = 500 test queries | p < 0.0001 (Wilcoxon signed-rank vs dense retrieval)', color: C.green },
  ];

  implItems.forEach((item, i) => {
    const y = 0.98 + i * 1.02;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35, y, w: 2.5, h: 0.9,
      fill: { color: item.color }, line: { color: item.color },
    });
    slide.addText(item.label, {
      x: 0.4, y: y + 0.22, w: 2.4, h: 0.46,
      fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 2.92, y, w: 10.05, h: 0.9,
      fill: { color: C.white }, line: { color: item.color, pt: 1 },
    });
    slide.addText(item.value, {
      x: 3.0, y: y + 0.05, w: 9.9, h: 0.8,
      fontSize: 11.5, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'middle',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 19 — OBJ 2 DIVIDER
// ─────────────────────────────────────────────────────────────────────────────
makeObjDivider(pptx, 2,
  'Objective 2: Adaptive Priority-aware Request Router (APRR)\n+ Context-Driven Routing (CDR)\n+ Parallel Dispatch Routing (PDR)',
  19);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 20 — OBJ 2 DETAIL
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 2 — APRR+CDR+PDR: Three Routing Strategies');
  addFooter(slide, 20);

  slide.addText('Adaptive Priority-aware Request Router (APRR) is the base Reinforcement Learning (RL) engine. Context-Driven Routing (CDR) and Parallel Dispatch Routing (PDR) are complementary dispatch strategies that extend it.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const strategies = [
    {
      name: 'APRR',
      full: 'Adaptive Priority-aware Request Router',
      desc: 'Base online Reinforcement Learning (RL) weight matrix updated by live binary session feedback (success/failure) with exponential decay (\u03BB=0.97). Probability distribution over agents updated after each query. Fills gap: all prior routers use offline-trained fixed policies.',
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
      desc: 'Functional-token parallel agent dispatch. Maps sub-tasks to specialist agents simultaneously using learned routing tokens. Enables parallel execution of decomposed queries across specialist agents with reduced serial hops.',
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
      x: x + 0.1, y: 1.07, w: 3.95, h: 0.25,
      fontSize: 16, bold: true, color: C.white, fontFace: 'Calibri',
    });
    slide.addText(s.full, {
      x: x + 0.1, y: 1.31, w: 3.95, h: 0.25,
      fontSize: 11, color: C.white, fontFace: 'Calibri',
    });
    slide.addText(s.desc, {
      x: x + 0.1, y: 1.65, w: 3.95, h: 3.25,
      fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top',
    });
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 5.08, w: 12.63, h: 0.28,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('Research Progress & Expected Outcomes — APRR+CDR+PDR', {
    x: 0.5, y: 5.1, w: 12.4, h: 0.24,
    fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri',
  });

  const metrics = [
    ['47.0%', 'Task Success Rate'],
    ['261ms', 'End-to-End Latency'],
    ['+2%', 'vs Static Routing'],
    ['0.499', 'StaticSemantic Baseline'],
    ['Parallel', 'Multi-Agent Dispatch'],
  ];
  metrics.forEach(([val, label], i) => {
    const x = 0.4 + i * 2.52;
    addCard(slide, x, 5.44, 2.38, 1.35, { fill: C.white, border: C.deepPurple });
    slide.addText(val, {
      x: x + 0.05, y: 5.5, w: 2.28, h: 0.55,
      fontSize: 24, bold: true, color: C.red, fontFace: 'Calibri', align: 'center',
    });
    slide.addText(label, {
      x: x + 0.05, y: 6.08, w: 2.28, h: 0.65,
      fontSize: 12, color: C.darkText, fontFace: 'Calibri', align: 'center', wrap: true,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 21 — OBJ 2 ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Objective 2 — APRR+CDR+PDR: System Architecture',
  'Three-strategy routing engine: APRR base RL → CDR context-driven gate → PDR parallel dispatch → 5 specialist agents.',
  DIAG.obj2Arch, 'png', 21,
  ['RL Weight Matrix W (online, real-time updates)', 'Parallel Dispatch Routing (PDR) — functional-token parallel dispatch', 'Exponential decay with binary session signals']);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDES 22–24 — OBJ 2 ALGORITHM FLOW (3 slides)
// ─────────────────────────────────────────────────────────────────────────────

// Slide 22: Phase 1 — Input and Priority Scoring
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 2 — Algorithm Flow: Phase 1 — Input and Priority Scoring');
  addFooter(slide, 22);

  slide.addText('APRR+CDR+PDR Phase 1: Incoming query is classified by priority and the Service Level Agreement (SLA) class is determined before routing decision is made.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'INPUT', stepX, y0, stepW, stepH,
    'Multi-Agent Routing Request + Live Session Context',
    [
      'Input: query string, session_id, agent_pool (list of available specialist agents)',
      'Session context: W matrix (RL weight matrix, shape: n_agents × n_features)',
      'Live binary feedback buffer: last N=50 query success/failure signals',
    ],
    'EFF6FF', C.blue);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'query + context', 1);

  makeFlowStep(slide, 'STEP 1', stepX, y1, stepW, stepH,
    'Query Complexity Classification and Service Level Agreement (SLA) Prioritisation',
    [
      'Complexity features: token count, entity density, number of sub-tasks detected',
      'SLA class: URGENT (latency \u2264 100ms), STANDARD (\u2264 265ms), BATCH (\u2264 2s)',
      'Priority score = 0.6 \u00D7 urgency + 0.4 \u00D7 complexity (normalised 0-1)',
    ],
    'FFF7F0', C.orange);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'priority score + SLA class', 2);

  makeFlowStep(slide, 'STEP 2', stepX, y2, stepW, stepH,
    'APRR Weight Matrix Lookup and Agent Probability Distribution',
    [
      'Look up W matrix: P(agent_i | query) = softmax(W \u22C5 feature_vector)',
      'Apply exponential decay: W_decayed = W \u00D7 \u03BB^(t - t_last_update), \u03BB = 0.97',
      'Branch: if priority \u2265 0.8 (URGENT) \u2192 route directly to top-1 agent; else proceed to CDR gate',
    ],
    'FFF7F0', C.orange);
}

// Slide 23: Phase 2 — Parallel Dispatch and Consensus
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 2 — Algorithm Flow: Phase 2 — Parallel Dispatch and Consensus');
  addFooter(slide, 23);

  slide.addText('APRR+CDR+PDR Phase 2: Context-Driven Routing (CDR) deliberation gate and Parallel Dispatch Routing (PDR) multi-agent execution.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'STEP 3', stepX, y0, stepW, stepH,
    'Context-Driven Routing (CDR) Deliberation Gate',
    [
      'CDR scores query ambiguity: Q_ambig = cosine_sim(query, agent_capability_embeddings)',
      'If Q_ambig \u2265 0.7: invoke chain-of-thought deliberation (2-step CoT scoring, max 500 tokens)',
      'CoT output: ranked list of candidate agents with confidence scores',
    ],
    'F5F3FF', C.midPurple);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'agent assignment', 3);

  makeFlowStep(slide, 'STEP 4', stepX, y1, stepW, stepH,
    'Parallel Dispatch Routing (PDR) Multi-Agent Execution',
    [
      'Decompose query into functional sub-tasks using learned routing tokens',
      'Dispatch sub-tasks in parallel to specialist agents (MarketAgent, WeatherAgent, SchemeAgent)',
      'Wall-clock parallelism: all sub-tasks run concurrently; timeout = SLA budget \u2212 20ms',
    ],
    'F5F3FF', C.midPurple);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'agent responses', 4);

  makeFlowStep(slide, 'STEP 5', stepX, y2, stepW, stepH,
    'Response Aggregation and Consensus',
    [
      'Collect responses from all dispatched agents (within SLA window)',
      'Aggregate via majority vote for boolean queries; concatenate + deduplicate for factual',
      'Consensus score: fraction of agents returning same top-1 answer (threshold \u2265 0.6)',
    ],
    'F5F3FF', C.midPurple);
}

// Slide 24: Phase 3 — Online Learning and Feedback
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 2 — Algorithm Flow: Phase 3 — Online Learning and Feedback');
  addFooter(slide, 24);

  slide.addText('APRR+CDR+PDR Phase 3: The W matrix is updated online from binary feedback, completing the Reinforcement Learning (RL) loop.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'STEP 6', stepX, y0, stepW, stepH,
    'Binary Feedback Signal Collection',
    [
      'User/evaluator provides binary signal: success (1) or failure (0)',
      'Signal stored in sliding feedback buffer (last N=50 turns, FIFO)',
      'Delayed feedback handled: buffer accepts signals up to 30s after query dispatch',
    ],
    'FFF7F0', C.orange);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'success/fail + delta', 5);

  makeFlowStep(slide, 'STEP 7', stepX, y1, stepW, stepH,
    'W Matrix Online Update (APRR RL Step)',
    [
      'Reward = signal \u2212 baseline (baseline = rolling mean of last N success rates)',
      'W_update = W + \u03B1 \u00D7 reward \u00D7 \u2207_W log P(agent | query)',
      'Apply exponential decay post-update: W \u2190 W \u00D7 \u03BB^1; learning rate \u03B1 = 0.01',
    ],
    'FFF7F0', C.orange);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'updated W + routed response', 6);

  makeFlowStep(slide, 'OUTPUT', stepX, y2, stepW, stepH,
    'Routed Response + Updated RL Weight Matrix',
    [
      'Primary output: consolidated agent response delivered within SLA budget',
      'Secondary output: updated W matrix persisted for next-query routing',
      'Evaluation: Task success rate 47.0% | Latency 261ms (Year 1 pilot, ToolBench G1/G2/G3, 500 queries \u00D7 5 seeds)',
    ],
    'ECFDF5', C.green);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 25 — OBJ 2 IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 2 — Implementation: Repository and Deployment');
  addFooter(slide, 25);

  slide.addText('All code and benchmark results for the Adaptive Priority-aware Request Router (APRR)+CDR+PDR routing system are publicly available and reproducible.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.32,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const implItems = [
    { label: 'Repository', value: 'https://github.com/joyjeni/aprr-multi-agent-routing', color: C.blue },
    { label: 'Key Files', value: 'src/aprr/router.py — RL weight matrix engine\nsrc/aprr/cdr.py — Context-Driven Routing (CDR) deliberation gate\nsrc/aprr/pdr.py — Parallel Dispatch Routing (PDR) functional-token dispatch\nexperiments/multiseed.py — multi-seed benchmark runner', color: C.deepPurple },
    { label: 'Dashboard', value: 'https://aprr-multi-agent-routing.vercel.app\n(Live routing metrics: task success rate, latency distribution, W matrix heatmap)', color: C.teal },
    { label: 'Dataset', value: 'ToolBench G1/G2/G3 splits | 500 queries \u00D7 5 seeds \u00D7 40 Reinforcement Learning (RL) iterations per run', color: C.indigo },
    { label: 'Baseline Results', value: 'APRR: 0.470 task success | StaticSemantic baseline: 0.499 | Gap: \u22120.029 (Year 1 pilot — full study targets +2% over baseline)', color: C.orange },
    { label: 'Stack', value: 'Python 3.10, PyTorch 2.1, HuggingFace Transformers, ToolBench executor, Vercel deployment', color: C.green },
  ];

  implItems.forEach((item, i) => {
    const y = 0.98 + i * 1.02;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35, y, w: 2.5, h: 0.9,
      fill: { color: item.color }, line: { color: item.color },
    });
    slide.addText(item.label, {
      x: 0.4, y: y + 0.22, w: 2.4, h: 0.46,
      fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 2.92, y, w: 10.05, h: 0.9,
      fill: { color: C.white }, line: { color: item.color, pt: 1 },
    });
    slide.addText(item.value, {
      x: 3.0, y: y + 0.05, w: 9.9, h: 0.8,
      fontSize: 11.5, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'middle',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 26 — OBJ 3 DIVIDER
// ─────────────────────────────────────────────────────────────────────────────
makeObjDivider(pptx, 3,
  'Objective 3: Multi-Node Context Distribution\n(MNCD)',
  26);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 27 — OBJ 3 DETAIL
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 3 — Multi-Node Context Distribution (MNCD)');
  addFooter(slide, 27);

  slide.addText('Multi-Node Context Distribution (MNCD) delivers resilient session context sharing across distributed agent nodes using a gossip-protocol broadcast mechanism.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  slide.addText('Protocol Design', {
    x: 0.35, y: 1.02, w: 6.0, h: 0.3,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });
  const mncdPoints = [
    'Gossip-protocol broadcast mechanism for context propagation across N agent nodes',
    'Each node maintains a partial replica of the shared context store (replication factor R=3)',
    'O(log N) propagation rounds: context reaches all live nodes in logarithmic time',
    'Fault model: up to 2-of-5 node simultaneous failures tolerated',
    'Anti-entropy reconciliation prevents stale context divergence',
    'Borda consensus aggregation over replicated context stores',
    'Benchmarked on simulated 5-node cluster with injected node failures',
  ];
  mncdPoints.forEach((pt, i) => {
    slide.addText(`\u2022 ${pt}`, {
      x: 0.45, y: 1.38 + i * 0.44, w: 5.75, h: 0.4,
      fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });

  slide.addText('Expected Outcomes & Metric Definitions', {
    x: 6.6, y: 1.02, w: 6.4, h: 0.3,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  addCard(slide, 6.6, 1.38, 6.4, 2.8, { fill: C.white, border: C.deepPurple });
  slide.addText('Context Availability \u2265 97%', {
    x: 6.7, y: 1.44, w: 6.2, h: 0.48,
    fontSize: 22, bold: true, color: C.red, fontFace: 'Calibri',
  });
  slide.addText('under 2-of-5 simultaneous node failures', {
    x: 6.7, y: 1.95, w: 6.2, h: 0.28,
    fontSize: 13, color: C.darkText, fontFace: 'Calibri',
  });
  slide.addText('Context Availability = fraction of time correct session context is accessible to any querying agent, despite node failures. Measured over 10,000 simulated queries with random 2-node failure injection.', {
    x: 6.7, y: 2.28, w: 6.2, h: 0.85,
    fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true,
  });

  addCard(slide, 6.6, 4.28, 6.4, 2.1, { fill: C.deepPurple, border: C.deepPurple });
  slide.addText('Research Progress to Date (Year 1 Pilot — 5-node simulation):', {
    x: 6.7, y: 4.33, w: 6.2, h: 0.3,
    fontSize: 13, bold: true, color: C.red, fontFace: 'Calibri',
  });
  const pocRows = [
    ['Scenario', 'Availability'],
    ['No failures (5/5 nodes live)', '97.5%'],
    ['2-of-5 nodes failed', '97.0%'],
    ['Single-agent baseline', '44.0%'],
    ['Propagation rounds', 'ceil(log\u2082(5)) = 3'],
  ];
  pocRows.forEach(([label, val], i) => {
    const y = 4.68 + i * 0.32;
    slide.addText(label, {
      x: 6.7, y, w: 4.2, h: 0.28,
      fontSize: 13, color: C.white, fontFace: 'Calibri',
    });
    slide.addText(val, {
      x: 11.0, y, w: 1.8, h: 0.28,
      fontSize: 13, bold: true, color: C.red, fontFace: 'Calibri', align: 'right',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 28 — OBJ 3 ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Objective 3 — Multi-Node Context Distribution (MNCD): System Architecture',
  'Mesh topology: pub/sub + gossip protocol → replication factor R=3 → Borda consensus → distress channel escalation.',
  DIAG.obj3Arch, 'png', 28,
  ['Gossip Protocol Broadcast (O(log N) propagation)', 'Borda Consensus Aggregation over live data.gov.in feeds', 'R=3 Replication for ≥97% context availability under 2-of-5 node failure']);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDES 29–31 — OBJ 3 ALGORITHM FLOW (3 slides)
// ─────────────────────────────────────────────────────────────────────────────

// Slide 29: Phase 1 — Peer Selection and Gossip Broadcast
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 3 — Algorithm Flow: Phase 1 — Peer Selection and Gossip Broadcast');
  addFooter(slide, 29);

  slide.addText('Multi-Node Context Distribution (MNCD) Phase 1: The initiating node selects gossip peers and broadcasts the context update.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'INPUT', stepX, y0, stepW, stepH,
    'Agent Responses + Mesh State (N=5 Nodes)',
    [
      'Input: new session context delta (key-value (KV) store update, size \u2264 4KB)',
      'Mesh state: node_alive[0..4] = heartbeat status (last ping \u2264 5s)',
      'Node roles: any live node can initiate a gossip round',
    ],
    'EFF6FF', C.blue);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'context delta + mesh state', 1);

  makeFlowStep(slide, 'STEP 1', stepX, y1, stepW, stepH,
    'Gossip Peer Selection (Fan-out f=2)',
    [
      'Initiating node selects f=2 random live peers from node_alive list',
      'Peer selection uses consistent hashing to avoid hot-spots',
      'Dead nodes (heartbeat timeout \u2265 5s) excluded from peer set',
    ],
    'F0FFF4', C.teal);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'peer list', 2);

  makeFlowStep(slide, 'STEP 2', stepX, y2, stepW, stepH,
    'Context Broadcast via Gossip Protocol',
    [
      'Initiating node sends context delta to f=2 selected peers (async gRPC, timeout 200ms)',
      'Piggybacked metadata: version_vector, sender_id, timestamp',
      'Anti-entropy: each message carries full Bloom filter of sender\'s known versions',
    ],
    'F0FFF4', C.teal);
}

// Slide 30: Phase 2 — Iterative Propagation and Consensus
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 3 — Algorithm Flow: Phase 2 — Iterative Propagation and Consensus');
  addFooter(slide, 30);

  slide.addText('Multi-Node Context Distribution (MNCD) Phase 2: Context propagates through ceil(log₂(5))=3 gossip rounds and Borda consensus is computed.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'STEP 3', stepX, y0, stepW, stepH,
    'Iterative Gossip Propagation (ceil(log\u2082(N)) Rounds)',
    [
      'Each receiving node re-broadcasts to f=2 new peers not yet in version_vector',
      'Round count: ceil(log\u2082(5)) = 3 rounds to reach all 5 nodes (worst case)',
      'Version conflict: last-write-wins using Lamport timestamp; ties broken by node_id',
    ],
    'F0FFF4', C.teal);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'context versions', 3);

  makeFlowStep(slide, 'STEP 4', stepX, y1, stepW, stepH,
    'Replica Verification (Replication Factor R=3)',
    [
      'Wait for acknowledgement from R=3 nodes (out of 5) before returning success',
      'If \u2265 R=3 ACKs within timeout: context committed; availability = R/N = 3/5 = 60% minimum',
      'R=3 ensures availability even if 2 nodes fail: 3/5 live nodes \u2192 97%+ availability (pilot result)',
    ],
    'F0FFF4', C.teal);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'replicated context', 4);

  makeFlowStep(slide, 'STEP 5', stepX, y2, stepW, stepH,
    'Borda Consensus Aggregation',
    [
      'Each live node casts ranked ballot over received context versions',
      'Borda count: version receiving highest sum of rank-scores is elected consensus version',
      'Ties broken by highest Lamport timestamp; result written to all R=3 replicas',
    ],
    'F0FFF4', C.teal);
}

// Slide 31: Phase 3 — Mesh Reinforcement and Export
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 3 — Algorithm Flow: Phase 3 — Mesh Reinforcement and Export');
  addFooter(slide, 31);

  slide.addText('Multi-Node Context Distribution (MNCD) Phase 3: Edge weights in the mesh are updated and the consensus context is exported to the ACRS pipeline.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'STEP 6', stepX, y0, stepW, stepH,
    'Mesh Edge Weight Reinforcement',
    [
      'Successful propagation path: edge weights between nodes i\u2192j incremented (+0.1)',
      'Timeout path: edge weights decremented (\u22120.05) to lower future selection probability',
      'Edge weights normalised to [0,1] after each round; stored in persistent adjacency matrix',
    ],
    'F0FFF4', C.teal);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'updated mesh weights', 5);

  makeFlowStep(slide, 'STEP 7', stepX, y1, stepW, stepH,
    'Distress Channel Escalation (Node Failure Detected)',
    [
      'If any node fails to ACK within 2\u00D7 timeout: distress channel alert broadcast to all live nodes',
      'Surviving nodes re-elect new peer set, excluding failed node, and re-propagate',
      'Mesh self-heals: failed node removed from routing table; re-added on heartbeat recovery',
    ],
    'F0FFF4', C.teal);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'consensus answer + updated mesh', 6);

  makeFlowStep(slide, 'OUTPUT', stepX, y2, stepW, stepH,
    'Consensus Context Export + Updated Mesh Weights',
    [
      'Primary output: consensus session context available to all live agent nodes',
      'Secondary output: updated mesh adjacency matrix persisted for next gossip round',
      'Evaluation: context availability 97.5% (no failures) / 97.0% (2-of-5 failure) on 5-node pilot',
    ],
    'ECFDF5', C.green);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 32 — OBJ 3 IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 3 — Implementation: Repository and Deployment');
  addFooter(slide, 32);

  slide.addText('All code for the Multi-Node Context Distribution (MNCD) mesh is publicly available with Kaggle notebook replication.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.32,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  const implItems = [
    { label: 'Repository', value: 'https://github.com/joyjeni/mncd-mesh-agents', color: C.blue },
    { label: 'Key Files', value: 'mncd/mesh.py — mesh topology manager and edge weight store\nmncd/gossip.py — gossip broadcast protocol implementation\nmncd/borda.py — Borda count consensus aggregator\nmncd_mesh.ipynb — full 5-node simulation notebook', color: C.deepPurple },
    { label: 'Models', value: 'google/gemma-2-2b-it OR Qwen/Qwen2.5-7B-Instruct (via HuggingFace)\n(Local Kaggle inference — no external Application Programming Interface (API) dependency)', color: C.teal },
    { label: 'Protocol', value: 'Replication factor R=3 | ceil(log\u2082(5))=3 gossip rounds for full convergence | Fan-out f=2 per round', color: C.indigo },
    { label: 'Fault Model', value: '2-of-5 simultaneous node failures | 10,000 simulated queries | 97.0% context availability achieved', color: C.orange },
    { label: 'Stack', value: 'Python 3.10, asyncio, gRPC, HuggingFace Transformers, Kaggle GPU (T4 \u00D72)', color: C.green },
  ];

  implItems.forEach((item, i) => {
    const y = 0.98 + i * 1.02;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35, y, w: 2.5, h: 0.9,
      fill: { color: item.color }, line: { color: item.color },
    });
    slide.addText(item.label, {
      x: 0.4, y: y + 0.22, w: 2.4, h: 0.46,
      fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 2.92, y, w: 10.05, h: 0.9,
      fill: { color: C.white }, line: { color: item.color, pt: 1 },
    });
    slide.addText(item.value, {
      x: 3.0, y: y + 0.05, w: 9.9, h: 0.8,
      fontSize: 11.5, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'middle',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 33 — OBJ 4 DIVIDER
// ─────────────────────────────────────────────────────────────────────────────
makeObjDivider(pptx, 4,
  'Objective 4: Flow-Conductance-based Neural Pruning\n(FCNP)',
  33);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 34 — OBJ 4 DETAIL
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 4 — Flow-Conductance-based Neural Pruning (FCNP)');
  addFooter(slide, 34);

  slide.addText('Flow-Conductance-based Neural Pruning (FCNP) compresses multi-agent conversation context graphs through iterative flow-score-based token pruning.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  slide.addText('Algorithm Design', {
    x: 0.35, y: 1.02, w: 6.0, h: 0.3,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });
  const fcnpPoints = [
    'Model multi-agent context as directed weighted graph: nodes = tokens, edges = attention dependencies',
    'Compute flow-score for each token node: weighted sum of in-flow \u00D7 attention importance',
    'Iterative pruning: remove lowest-flow nodes until target compression ratio achieved',
    'Citation-preservation constraint: citation anchor nodes pinned (never pruned)',
    'Target: 10:1 compression ratio (tokens retained / tokens input = 0.1)',
    'Evaluated against 7 baselines: LoRA, SparseGPT, Scissorhands, H2O, AdaKV, Finch, StreamingLLM',
    'Statistical test: two-tailed Wilcoxon signed-rank, p<0.05 threshold',
  ];
  fcnpPoints.forEach((pt, i) => {
    slide.addText(`\u2022 ${pt}`, {
      x: 0.45, y: 1.38 + i * 0.44, w: 5.75, h: 0.4,
      fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });

  slide.addText('Expected Outcomes & Metric Definitions', {
    x: 6.6, y: 1.02, w: 6.4, h: 0.3,
    fontSize: 16, bold: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  addCard(slide, 6.6, 1.38, 6.4, 2.3, { fill: C.white, border: C.deepPurple });
  slide.addText('10:1 Compression  |  \u226599% Citation Accuracy', {
    x: 6.7, y: 1.44, w: 6.2, h: 0.48,
    fontSize: 17, bold: true, color: C.red, fontFace: 'Calibri', wrap: true,
  });
  slide.addText('Key-Value (KV) token budget: 100% \u2192 28% retained. Compression ratio = tokens retained \u00F7 tokens input. Citation accuracy = fraction of answer citations correctly preserved post-compression.', {
    x: 6.7, y: 1.98, w: 6.2, h: 1.64,
    fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true,
  });

  addCard(slide, 6.6, 3.78, 6.4, 2.6, { fill: C.deepPurple, border: C.deepPurple });
  slide.addText('Expected Outcome (Full Study):', {
    x: 6.7, y: 3.83, w: 6.2, h: 0.3,
    fontSize: 13, bold: true, color: C.red, fontFace: 'Calibri',
  });
  slide.addText('10:1 compression ratio with \u226599% citation accuracy, statistically significant improvement over 7 baselines (Wilcoxon p<0.05). Year 1 pilot: 9.8:1 compression with 98.9% citation accuracy on 500-turn conversation corpus, validating the flow-score mechanism.', {
    x: 6.7, y: 4.18, w: 6.2, h: 1.4,
    fontSize: 13, color: C.white, fontFace: 'Calibri', wrap: true,
  });
  slide.addText('Wilcoxon p<0.05 vs all 7 baselines (SparseGPT, LoRA, Scissorhands, H2O, AdaKV, Finch, StreamingLLM)', {
    x: 6.7, y: 5.62, w: 6.2, h: 0.65,
    fontSize: 12, bold: true, color: C.red, fontFace: 'Calibri', wrap: true,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 35 — OBJ 4 ARCHITECTURE DIAGRAM
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Objective 4 — Flow-Conductance-based Neural Pruning (FCNP): System Architecture',
  'Federated Context Negotiation Protocol: Parallel Dispatch Routing (PDR) parallel dispatch → flow conductance update rule → route weight adaptation → pruning of low-conductance paths.',
  DIAG.obj4Arch, 'png', 35,
  ['Flow Conductance Scoring (Kirchhoff Update Rule on token-attention graph)', '10:1 compression with ≥99% citation accuracy', 'Citation anchor pinning — data.gov.in source tokens never evicted']);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDES 36–38 — OBJ 4 ALGORITHM FLOW (3 slides)
// ─────────────────────────────────────────────────────────────────────────────

// Slide 36: Phase 1 — Graph Construction and Conductance
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 4 — Algorithm Flow: Phase 1 — Graph Construction and Conductance Scoring');
  addFooter(slide, 36);

  slide.addText('Flow-Conductance-based Neural Pruning (FCNP) Phase 1: Multi-agent context is modelled as a token-attention graph and flow-conductance scores are computed.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'INPUT', stepX, y0, stepW, stepH,
    'Multi-Agent Context Stream (Key-Value (KV) Cache + Attention Weights)',
    [
      'Input: full conversation context graph G=(V, E) across all agent turns',
      'V = token nodes (|V| = context length, e.g., 4,096 tokens); E = attention dependencies (|E| \u2248 |V|\u00B2)',
      'Each edge (t_i, t_j) carries weight = attention score A[i,j] from last transformer layer',
    ],
    'EFF6FF', C.blue);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'graph G=(V,E)', 1);

  makeFlowStep(slide, 'STEP 1', stepX, y1, stepW, stepH,
    'Kirchhoff Flow-Conductance Computation',
    [
      'Model G as electrical network: conductance D(t_i) = \u03A3_j A[i,j] (total attention out-flow)',
      'Kirchhoff update rule: D(t) \u2190 D(t) + \u03B7 \u00D7 (Q(t) / D(t) - D(t))',
      'Q(t) = in-flow \u00D7 attention importance; \u03B7 = 0.01 (conductance learning rate)',
    ],
    'FFF5F5', C.red);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'conductance scores D(t)', 2);

  makeFlowStep(slide, 'STEP 2', stepX, y2, stepW, stepH,
    'Citation Anchor Identification and Pinning',
    [
      'Identify citation anchor tokens: tokens directly referenced in data.gov.in source attributions',
      'Pin anchors: set D(anchor) = \u221E (max score; never pruned)',
      'Anchor detection: regex match on URL patterns + BM25 overlap with reference strings',
    ],
    'FFF5F5', C.red);
}

// Slide 37: Phase 2 — Importance Fusion and Pruning
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 4 — Algorithm Flow: Phase 2 — Importance Fusion and Pruning');
  addFooter(slide, 37);

  slide.addText('Flow-Conductance-based Neural Pruning (FCNP) Phase 2: Composite importance scores are computed and the lowest-flow tokens are iteratively pruned.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'STEP 3', stepX, y0, stepW, stepH,
    'Composite Importance Score Fusion',
    [
      'Importance(t) = \u03B11 \u00D7 Conductance(t) + \u03B12 \u00D7 Recency(t) + \u03B13 \u00D7 TaskAlign(t)',
      'Default: \u03B11=0.5, \u03B12=0.3, \u03B13=0.2 (tuned on ToolBench dev set)',
      'TaskAlign(t) = cosine_sim(token_embed(t), query_embed) — keeps task-relevant tokens',
    ],
    'FFF5F5', C.red);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'importance scores', 3);

  makeFlowStep(slide, 'STEP 4', stepX, y1, stepW, stepH,
    'Iterative Token Pruning (Target: 10:1 Compression)',
    [
      'Sort tokens by Importance(t) ascending; prune bottom-p% per iteration',
      'Each iteration: recompute conductance on pruned graph (5 iterations until stable)',
      'Stopping criterion: |V_pruned| / |V_original| \u2264 0.10 (10:1 compression achieved)',
    ],
    'FFF5F5', C.red);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'pruned token set', 4);

  makeFlowStep(slide, 'STEP 5', stepX, y2, stepW, stepH,
    'Citation Accuracy Verification',
    [
      'Check: all citation anchor tokens in pruned set \u2192 citation accuracy = |anchors_kept| / |anchors_total|',
      'If citation accuracy < 0.99: rollback last pruning iteration, reduce prune rate by 10%',
      'Target: \u226599% citation accuracy with 10:1 compression ratio achieved simultaneously',
    ],
    'FFF5F5', C.red);
}

// Slide 38: Phase 3 — Federated Update and Results
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Obj 4 — Algorithm Flow: Phase 3 — Federated Update and Results');
  addFooter(slide, 38);

  slide.addText('Flow-Conductance-based Neural Pruning (FCNP) Phase 3: Pruned context is redistributed across agents and federated model parameters are updated.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const stepH = 1.62;
  const stepW = 12.0;
  const stepX = 0.65;
  const arrowX = stepX + stepW / 2;

  const y0 = 0.95;
  const y1 = y0 + stepH + 0.32;
  const y2 = y1 + stepH + 0.32;

  makeFlowStep(slide, 'STEP 6', stepX, y0, stepW, stepH,
    'Pruned Context Redistribution via Multi-Node Context Distribution (MNCD)',
    [
      'Compressed Key-Value (KV) context (10:1 reduced) pushed to all live MNCD nodes',
      'Redistribution uses MNCD gossip protocol (Slide 29–31): 3 rounds, R=3 replication',
      'Bandwidth saving: 10\u00D7 reduction in context propagation overhead',
    ],
    'FFF5F5', C.red);

  drawFlowArrow(slide, arrowX, y0 + stepH, y1, 'compressed context', 5);

  makeFlowStep(slide, 'STEP 7', stepX, y1, stepW, stepH,
    'Federated Conductance Model Update',
    [
      'Each agent node updates local conductance importance weights using federated averaging',
      'FedAvg: global_weights = \u03A3 (n_agent_i / N_total) \u00D7 local_weights_i',
      'Updated weights broadcast back to all nodes via MNCD in next gossip round',
    ],
    'FFF5F5', C.red);

  drawFlowArrow(slide, arrowX, y1 + stepH, y2, 'compressed context + updated weights', 6);

  makeFlowStep(slide, 'OUTPUT', stepX, y2, stepW, stepH,
    'Compressed Context + Updated Federated Routing Decision Table',
    [
      'Primary output: 10:1 compressed context available to all agent nodes with \u226599% citation accuracy',
      'Secondary output: updated conductance weights for next-round pruning',
      'Evaluation: 9.8:1 compression | 98.9% citation accuracy (Year 1 pilot); targets 10:1 / \u226599% (full study)',
    ],
    'ECFDF5', C.green);
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 39 — OBJ 4 IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Objective 4 — Implementation: Repository and Deployment');
  addFooter(slide, 39);

  slide.addText('All code for Flow-Conductance-based Neural Pruning (FCNP) context compression is publicly available.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.32,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri',
  });

  const implItems = [
    { label: 'Repository', value: 'https://github.com/joyjeni/fcnp-context-pruning', color: C.blue },
    { label: 'Key Files', value: 'fcnp/pruner.py — main iterative pruning engine\nfcnp/conductance.py — Kirchhoff flow-conductance computation\nfcnp/federated.py — federated averaging for conductance weights\nfcnp_toolbench_benchmark.ipynb — 7-baseline comparison notebook', color: C.deepPurple },
    { label: 'Dashboard', value: 'https://fcnp-context-pruning.vercel.app\n(Live metrics: compression ratio, citation accuracy, throughput vs 7 baselines)', color: C.teal },
    { label: 'Compression', value: 'Key-Value (KV) token budget: 100% \u2192 28% retained | 10:1 compression target | \u226599% citation accuracy', color: C.red },
    { label: 'Baselines', value: 'SparseGPT, LoRA (parameter-efficient fine-tuning baseline), Scissorhands, H2O, AdaKV, Finch, StreamingLLM (Attention Sinks)', color: C.orange },
    { label: 'Stack', value: 'Python 3.10, PyTorch 2.1, FlashAttention-2, HuggingFace Transformers, Vercel deployment', color: C.green },
  ];

  implItems.forEach((item, i) => {
    const y = 0.98 + i * 1.02;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.35, y, w: 2.5, h: 0.9,
      fill: { color: item.color }, line: { color: item.color },
    });
    slide.addText(item.label, {
      x: 0.4, y: y + 0.22, w: 2.4, h: 0.46,
      fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri', align: 'center', valign: 'middle',
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 2.92, y, w: 10.05, h: 0.9,
      fill: { color: C.white }, line: { color: item.color, pt: 1 },
    });
    slide.addText(item.value, {
      x: 3.0, y: y + 0.05, w: 9.9, h: 0.8,
      fontSize: 11.5, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'middle',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 40 — OVERALL ARCHITECTURE
// ─────────────────────────────────────────────────────────────────────────────
addDiagramSlide(pptx,
  'Overall Adaptive Context Reasoning System Architecture — All 4 Objectives Combined',
  'End-to-end pipeline: Farmer query → Obj1 tool reranking → Obj2 adaptive routing → Obj3 mesh context distribution → Obj4 context pruning → Verified multilingual response.',
  DIAG.overallArch, 'png', 40);

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDES 41–44 — OVERALL ALGORITHM FLOW (broken into 4 steps)
// ─────────────────────────────────────────────────────────────────────────────

// Slide 41: Overall Flow — Step 1 of 4: Query Entry and Tool Reranking (Obj 1)
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Overall Algorithm Flow — Step 1 of 4: Query Entry and Tool Reranking');
  addFooter(slide, 41);

  slide.addText('How the farmer\u2019s question travels through the system — Step 1: the query arrives in the farmer\u2019s own language, gets translated, and the most relevant tools are selected from 43,000 available options.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.38, fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  // Step boxes with arrows — STEP_OFFSET = first step number on this slide
  const STEP_OFFSET = 1; // steps 1-4, arrows show Step 2, Step 3, Step 4
  const steps = [
    { num: '1', title: 'FARMER QUERY INPUT', body: 'A farmer types or speaks a question — e.g., "What is today\'s mandi price for tomatoes in Mysuru?" — in Kannada, Hindi, or English.\nThis is the raw entry point of the entire system.', color: C.blue, bg: 'EFF6FF' },
    { num: '2', title: 'LANGUAGE DETECTION + TRANSLATION', body: 'If the query is not in English, the IndicTrans2 module automatically translates it.\nThis ensures the AI can process it regardless of language — supporting 22 Indian languages.', color: C.midPurple, bg: 'F5F3FF' },
    { num: '3', title: 'TOOL CANDIDATE RECALL (Gemma-4 + BM25)', body: 'The system searches 43,000 tools in the ToolBench catalogue using two methods:\n(a) Gemma-4 embedding similarity — finds tools that are semantically similar\n(b) BM25 keyword search — finds tools with matching words\nResult: up to 150 candidate tools.', color: C.indigo, bg: 'E8EAF6' },
    { num: '4', title: 'SESSION-AWARE RERANKING [NOVEL — Obj 1]', body: 'The system checks: which tools did this farmer use before?\nUsing a co-activation graph, it boosts tools that frequently worked together in past sessions.\nFinal output: Top-K ranked tools, personalised per farmer.\nMetric: NDCG@5 = 0.461 (+2% over baseline)', color: C.red, bg: 'FFF5F5' },
  ];

  steps.forEach((s, i) => {
    const y = 1.05 + i * 1.45;
    const isNovel = s.title.includes('[NOVEL');
    const boxBg    = isNovel ? 'E3F0FF' : s.bg;
    const boxBdr   = isNovel ? '1565C0' : s.color;
    const titleClr = isNovel ? '1565C0' : s.color;
    // Step number badge (left)
    slide.addShape(pptx.ShapeType.rect, { x: 0.35, y, w: 0.52, h: 0.52, fill: { color: isNovel ? '1565C0' : s.color }, line: { color: isNovel ? '1565C0' : s.color } });
    slide.addText(s.num, { x: 0.35, y: y+0.02, w: 0.52, h: 0.48, fontSize: 18, bold: true, color: C.white, fontFace: 'Calibri', align: 'center', valign: 'middle' });
    // Content box
    slide.addShape(pptx.ShapeType.rect, { x: 0.93, y, w: 12.05, h: 1.28, fill: { color: boxBg }, line: { color: boxBdr, pt: isNovel ? 2.5 : 1.5 } });
    // ★ NOVEL tag on top-right corner of box
    if (isNovel) {
      slide.addShape(pptx.ShapeType.rect, { x: 12.38, y: y+0.02, w: 0.58, h: 0.26, fill: { color: '1565C0' }, line: { color: '1565C0' } });
      slide.addText('★ NOVEL', { x: 12.38, y: y+0.03, w: 0.58, h: 0.24, fontSize: 7.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0 });
    }
    slide.addText(s.title, { x: 1.0, y: y+0.04, w: 11.2, h: 0.3, fontSize: 12, bold: true, color: titleClr, fontFace: 'Calibri' });
    slide.addText(s.body, { x: 1.0, y: y+0.34, w: 11.8, h: 0.88, fontSize: 11, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top' });
    // Arrow down to next step (except last box on each slide)
    if (i < steps.length - 1) {
      const arrowClr = isNovel ? '1565C0' : s.color;
      slide.addShape(pptx.ShapeType.line, { x: 0.61, y: y+1.28, w: 0, h: 0.17, line: { color: arrowClr, pt: 3.5, endArrowType: 'arrow' } });
      // Sequential step label on arrow
      const nextStepNum = STEP_OFFSET + i + 1;
      slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: y+1.285, w: 0.46, h: 0.16, fill: { color: 'C8402A' }, line: { color: 'C8402A' } });
      slide.addText('Step ' + String(nextStepNum), { x: 0.7, y: y+1.285, w: 0.46, h: 0.16, fontSize: 9, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0 });
    }
  });
}

// Slide 42: Overall Flow — Step 2 of 4: Adaptive Routing (Obj 2)
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Overall Algorithm Flow — Step 2 of 4: Adaptive Routing to Specialist Agents');
  addFooter(slide, 42);

  slide.addText('Step 2: The selected tools are now routed to the right specialist AI agent — like connecting a caller to the correct department. The system learns which agent is best over time.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.38, fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const STEP_OFFSET = 5; // steps 5-8, arrows show Step 6, Step 7, Step 8
  const steps = [
    { num: '5', title: 'REINFORCEMENT LEARNING WEIGHT MATRIX [NOVEL — Obj 2]', body: 'The system maintains a matrix W that records: "for this type of query, which agent succeeded before?"\nThis matrix is updated in real time based on task success/failure.\nThink of it as a dynamic leaderboard — the best agent gets routed more queries.', color: C.orange, bg: 'FFF8F1' },
    { num: '6', title: 'CONTEXT-DRIVEN ROUTING (CDR)', body: 'The system inspects the content and intent of the query and steers it to the most appropriate agent.\nExample: a price-query goes to the Mandi Price Agent; a crop disease query goes to the Agronomy Agent.\nCDR uses the routing weight matrix W to make this decision.', color: C.orange, bg: 'FFF8F1' },
    { num: '7', title: 'PARALLEL DISPATCH ROUTING (PDR) [NOVEL — Obj 2]', body: 'For complex queries that need multiple agents simultaneously, PDR dispatches the task in parallel.\nAll agents process it concurrently — like sending the same letter to multiple departments at once.\nResult: faster response, redundancy. Metric: task success +2% over baseline.', color: C.orange, bg: 'FFF8F1' },
    { num: '8', title: 'data.gov.in LIVE SIGNAL INJECTION', body: 'The routing decision is also influenced by live data from data.gov.in agriculture feeds.\nIf today\'s mandi price feed shows high activity in tomatoes, the mandi-specialist agent is prioritised.\nAPI resource: 9ef84268-... (Karnataka APMC prices, updated daily).', color: C.green, bg: 'F0FFF4' },
  ];

  steps.forEach((s, i) => {
    const y = 1.05 + i * 1.45;
    const isNovel = s.title.includes('[NOVEL');
    const boxBg    = isNovel ? 'E3F0FF' : s.bg;
    const boxBdr   = isNovel ? '1565C0' : s.color;
    const titleClr = isNovel ? '1565C0' : s.color;
    // Step number badge (left)
    slide.addShape(pptx.ShapeType.rect, { x: 0.35, y, w: 0.52, h: 0.52, fill: { color: isNovel ? '1565C0' : s.color }, line: { color: isNovel ? '1565C0' : s.color } });
    slide.addText(s.num, { x: 0.35, y: y+0.02, w: 0.52, h: 0.48, fontSize: 18, bold: true, color: C.white, fontFace: 'Calibri', align: 'center', valign: 'middle' });
    // Content box
    slide.addShape(pptx.ShapeType.rect, { x: 0.93, y, w: 12.05, h: 1.28, fill: { color: boxBg }, line: { color: boxBdr, pt: isNovel ? 2.5 : 1.5 } });
    // ★ NOVEL tag on top-right corner of box
    if (isNovel) {
      slide.addShape(pptx.ShapeType.rect, { x: 12.38, y: y+0.02, w: 0.58, h: 0.26, fill: { color: '1565C0' }, line: { color: '1565C0' } });
      slide.addText('★ NOVEL', { x: 12.38, y: y+0.03, w: 0.58, h: 0.24, fontSize: 7.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0 });
    }
    slide.addText(s.title, { x: 1.0, y: y+0.04, w: 11.2, h: 0.3, fontSize: 12, bold: true, color: titleClr, fontFace: 'Calibri' });
    slide.addText(s.body, { x: 1.0, y: y+0.34, w: 11.8, h: 0.88, fontSize: 11, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top' });
    // Arrow down to next step (except last box on each slide)
    if (i < steps.length - 1) {
      const arrowClr = isNovel ? '1565C0' : s.color;
      slide.addShape(pptx.ShapeType.line, { x: 0.61, y: y+1.28, w: 0, h: 0.17, line: { color: arrowClr, pt: 3.5, endArrowType: 'arrow' } });
      // Sequential step label on arrow
      const nextStepNum = STEP_OFFSET + i + 1;
      slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: y+1.285, w: 0.46, h: 0.16, fill: { color: 'C8402A' }, line: { color: 'C8402A' } });
      slide.addText('Step ' + String(nextStepNum), { x: 0.7, y: y+1.285, w: 0.46, h: 0.16, fontSize: 9, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0 });
    }
  });
}

// Slide 43: Overall Flow — Step 3 of 4: Mesh Context Distribution (Obj 3)
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Overall Algorithm Flow — Step 3 of 4: Sharing Context Across All Agents');
  addFooter(slide, 43);

  slide.addText('Step 3: All the agents in the network need to know what each other knows. This step ensures every agent has an up-to-date shared understanding — like a group WhatsApp for AI agents.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.38, fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const TEAL = '00695C';
  const STEP_OFFSET = 9; // steps 9-12, arrows show Step 10, Step 11, Step 12

  const steps = [
    { num: '9', title: 'GOSSIP PROTOCOL BROADCAST [NOVEL — Obj 3]', body: 'When any agent learns new information (e.g., new mandi price from data.gov.in), it "gossips" it to 2–3 nearest neighbours.\nThose neighbours pass it on. Within O(log N) rounds, ALL agents know the new information.\nThis is exactly how real gossip spreads — but mathematically proven to be efficient.', color: TEAL, bg: 'EFFDFB' },
    { num: '10', title: 'R=3 REPLICATION FACTOR', body: 'Each piece of context is stored on 3 different agents simultaneously.\nIf 2 out of 5 agents crash, the data is still safe on the remaining 3.\nThis gives 97%+ context availability — compared to 44% in a single-agent system.', color: TEAL, bg: 'EFFDFB' },
    { num: '11', title: 'BORDA CONSENSUS AGGREGATION [NOVEL — Obj 3]', body: 'When multiple agents give different answers (e.g., different mandi prices), the system uses Borda count voting.\nEach agent ranks the possible answers; the answer with the most votes wins.\nThis prevents one wrong agent from misleading the final response.', color: TEAL, bg: 'EFFDFB' },
    { num: '12', title: 'data.gov.in LIVE FEED CONSENSUS INPUT', body: 'The Borda consensus is seeded with live data.gov.in agriculture prices.\nIf an agent\'s answer contradicts the official government data feed, its vote is automatically down-weighted.\nFinal output: verified, source-attributed context passed to Step 4.', color: C.green, bg: 'F0FFF4' },
  ];

  steps.forEach((s, i) => {
    const y = 1.05 + i * 1.45;
    const isNovel = s.title.includes('[NOVEL');
    const boxBg    = isNovel ? 'E3F0FF' : s.bg;
    const boxBdr   = isNovel ? '1565C0' : s.color;
    const titleClr = isNovel ? '1565C0' : s.color;
    // Step number badge (left)
    slide.addShape(pptx.ShapeType.rect, { x: 0.35, y, w: 0.52, h: 0.52, fill: { color: isNovel ? '1565C0' : s.color }, line: { color: isNovel ? '1565C0' : s.color } });
    slide.addText(s.num, { x: 0.35, y: y+0.02, w: 0.52, h: 0.48, fontSize: 18, bold: true, color: C.white, fontFace: 'Calibri', align: 'center', valign: 'middle' });
    // Content box
    slide.addShape(pptx.ShapeType.rect, { x: 0.93, y, w: 12.05, h: 1.28, fill: { color: boxBg }, line: { color: boxBdr, pt: isNovel ? 2.5 : 1.5 } });
    // ★ NOVEL tag on top-right corner of box
    if (isNovel) {
      slide.addShape(pptx.ShapeType.rect, { x: 12.38, y: y+0.02, w: 0.58, h: 0.26, fill: { color: '1565C0' }, line: { color: '1565C0' } });
      slide.addText('★ NOVEL', { x: 12.38, y: y+0.03, w: 0.58, h: 0.24, fontSize: 7.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0 });
    }
    slide.addText(s.title, { x: 1.0, y: y+0.04, w: 11.2, h: 0.3, fontSize: 12, bold: true, color: titleClr, fontFace: 'Calibri' });
    slide.addText(s.body, { x: 1.0, y: y+0.34, w: 11.8, h: 0.88, fontSize: 11, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top' });
    // Arrow down to next step (except last box on each slide)
    if (i < steps.length - 1) {
      const arrowClr = isNovel ? '1565C0' : s.color;
      slide.addShape(pptx.ShapeType.line, { x: 0.61, y: y+1.28, w: 0, h: 0.17, line: { color: arrowClr, pt: 3.5, endArrowType: 'arrow' } });
      // Sequential step label on arrow
      const nextStepNum = STEP_OFFSET + i + 1;
      slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: y+1.285, w: 0.46, h: 0.16, fill: { color: 'C8402A' }, line: { color: 'C8402A' } });
      slide.addText('Step ' + String(nextStepNum), { x: 0.7, y: y+1.285, w: 0.46, h: 0.16, fontSize: 9, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0 });
    }
  });
}

// Slide 44: Overall Flow — Step 4 of 4: Context Pruning and Final Answer (Obj 4)
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Overall Algorithm Flow — Step 4 of 4: Context Pruning and Final Answer Delivery');
  addFooter(slide, 44);

  slide.addText('Step 4: Before the AI generates an answer, it prunes the conversation context down to only the most important parts — like a skilled editor removing filler from an article before printing.', {
    x: 0.35, y: 0.56, w: 12.6, h: 0.38, fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const STEP_OFFSET = 13; // steps 13-16, arrows show Step 14, Step 15, Step 16
  const steps = [
    { num: '13', title: 'BUILD TOKEN-ATTENTION GRAPH', body: 'The full conversation context (up to 4,096 tokens) is modelled as a graph.\nEach word/token is a node. Each attention connection between words is an edge.\nStrong connections = important relationships. Weak connections = noise.', color: C.green, bg: 'F0FFF4' },
    { num: '14', title: 'FLOW CONDUCTANCE SCORING [NOVEL — Obj 4]', body: 'Inspired by electrical circuit analysis: tokens with high "conductance" (information flow) are important; low-conductance tokens are safe to remove.\nThe Kirchhoff Update Rule computes a score for every token.\nCitation anchors (tokens from data.gov.in source) are always pinned — never removed.', color: C.green, bg: 'F0FFF4' },
    { num: '15', title: 'PRUNE LOW-CONDUCTANCE TOKENS', body: 'Tokens scoring below the pruning threshold are evicted from the Key-Value (KV) cache.\nResult: context compressed from 100% → only 28% kept, while retaining all important information.\nThis speeds up inference and reduces memory — with less than 1.2% accuracy loss.', color: C.green, bg: 'F0FFF4' },
    { num: '16', title: 'GENERATE + VERIFY FINAL RESPONSE', body: 'The LLM now generates the final answer using only the pruned, high-quality context.\nEvery fact is traced back to its source — data.gov.in is cited explicitly.\nFarmer receives a verified, multilingual, source-attributed response. Throughput: +2% over baseline.', color: C.deepPurple, bg: 'F4F0FF' },
  ];

  steps.forEach((s, i) => {
    const y = 1.05 + i * 1.45;
    const isNovel = s.title.includes('[NOVEL');
    const boxBg    = isNovel ? 'E3F0FF' : s.bg;
    const boxBdr   = isNovel ? '1565C0' : s.color;
    const titleClr = isNovel ? '1565C0' : s.color;
    // Step number badge (left)
    slide.addShape(pptx.ShapeType.rect, { x: 0.35, y, w: 0.52, h: 0.52, fill: { color: isNovel ? '1565C0' : s.color }, line: { color: isNovel ? '1565C0' : s.color } });
    slide.addText(s.num, { x: 0.35, y: y+0.02, w: 0.52, h: 0.48, fontSize: 18, bold: true, color: C.white, fontFace: 'Calibri', align: 'center', valign: 'middle' });
    // Content box
    slide.addShape(pptx.ShapeType.rect, { x: 0.93, y, w: 12.05, h: 1.28, fill: { color: boxBg }, line: { color: boxBdr, pt: isNovel ? 2.5 : 1.5 } });
    // ★ NOVEL tag on top-right corner of box
    if (isNovel) {
      slide.addShape(pptx.ShapeType.rect, { x: 12.38, y: y+0.02, w: 0.58, h: 0.26, fill: { color: '1565C0' }, line: { color: '1565C0' } });
      slide.addText('★ NOVEL', { x: 12.38, y: y+0.03, w: 0.58, h: 0.24, fontSize: 7.5, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0 });
    }
    slide.addText(s.title, { x: 1.0, y: y+0.04, w: 11.2, h: 0.3, fontSize: 12, bold: true, color: titleClr, fontFace: 'Calibri' });
    slide.addText(s.body, { x: 1.0, y: y+0.34, w: 11.8, h: 0.88, fontSize: 11, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top' });
    // Arrow down to next step (except last box on each slide)
    if (i < steps.length - 1) {
      const arrowClr = isNovel ? '1565C0' : s.color;
      slide.addShape(pptx.ShapeType.line, { x: 0.61, y: y+1.28, w: 0, h: 0.17, line: { color: arrowClr, pt: 3.5, endArrowType: 'arrow' } });
      // Sequential step label on arrow
      const nextStepNum = STEP_OFFSET + i + 1;
      slide.addShape(pptx.ShapeType.rect, { x: 0.7, y: y+1.285, w: 0.46, h: 0.16, fill: { color: 'C8402A' }, line: { color: 'C8402A' } });
      slide.addText('Step ' + String(nextStepNum), { x: 0.7, y: y+1.285, w: 0.46, h: 0.16, fontSize: 9, bold: true, color: 'FFFFFF', fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0 });
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 42 — NOVELTY MATRIX
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Novelty Matrix — ACRS Contributions vs. State-of-the-Art');
  addFooter(slide, 45);

  slide.addText('Each Adaptive Context Reasoning System (ACRS) component addresses a specific unresolved gap not covered by any existing system. The matrix maps each objective to its gap, novel mechanism, and validated performance gain.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const NOV_OBJ = [
    { label: 'Obj 1\nSessionRerank+',
      hdr: '1E3A5F', hdrTxt: 'FFFFFF', row: 'DBEAFE',
      gap: 'No session-context in tool reranking; stateless retrieval only',
      mech: 'Co-activation graph reranking with session-decay weighting (Obj 1)',
      prior: 'ToolBench (Qin et al., 2023); ToolLLM — no session state',
      gain: 'NDCG@5: 0.452 → 0.461 (+2% over SOTA baseline, p<0.05)', gainTxt: '14532E', gainBg: 'DCFCE7' },
    { label: 'Obj 2\nAPRR+CDR+PDR',
      hdr: '7C2D12', hdrTxt: 'FFFFFF', row: 'FFEDD5',
      gap: 'Offline-trained fixed routing; no live RL weight update',
      mech: 'Online RL weight matrix (W) with CDR + PDR parallel dispatch (Obj 2)',
      prior: 'RouteLLM (Ong et al., 2024); Eagle (Zhao et al., 2024)',
      gain: 'Task success: +2% over best reported baseline; Latency within Service Level Agreement (SLA)', gainTxt: '7C2D12', gainBg: 'FEF9C3' },
    { label: 'Obj 3\nMNCD',
      hdr: '134E4A', hdrTxt: 'FFFFFF', row: 'CCFBF1',
      gap: 'Single-agent LLM systems; no mesh fault tolerance or Borda consensus',
      mech: 'Gossip-protocol mesh + Borda consensus aggregator + R=3 replication (Obj 3)',
      prior: 'AutoGen (Wu et al., 2023); no edge-weight mesh or Borda',
      gain: 'Context availability: 44% → 97%+ ; Fault tolerance: 0 → R=3', gainTxt: '134E4A', gainBg: 'CCFBF1' },
    { label: 'Obj 4\nFCNP',
      hdr: '3C1361', hdrTxt: 'FFFFFF', row: 'EDE9FE',
      gap: 'Fixed-size KV eviction; no live federated routing feedback',
      mech: 'Flow Conductance Update Rule + federated model update across agents (Obj 4)',
      prior: 'H2O (Zhang et al., 2023); Scissorhands (Liu et al., 2023)',
      gain: 'KV tokens: 100% → 28% kept; Throughput +2% over baseline; Acc. loss <1.2%', gainTxt: '3C1361', gainBg: 'F3E8FF' },
  ];

  const novRows = [
    [
      { text: 'Objective', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center', fontSize: 12 } },
      { text: 'Unresolved Gap', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center', fontSize: 12 } },
      { text: 'Novel Mechanism', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center', fontSize: 12 } },
      { text: 'Closest Prior Work', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center', fontSize: 12 } },
      { text: 'Validated Gain', options: { bold: true, color: 'FFFFFF', fill: { color: C.deepPurple }, align: 'center', fontSize: 12 } },
    ],
    ...NOV_OBJ.map(o => [
      { text: o.label, options: { bold: true, fontSize: 11, color: o.hdrTxt, fill: { color: o.hdr } } },
      { text: o.gap,   options: { fontSize: 10, color: '1A1035', fill: { color: o.row } } },
      { text: o.mech,  options: { fontSize: 10, color: '1A1035', fill: { color: o.row } } },
      { text: o.prior, options: { fontSize: 10, color: '1A1035', fill: { color: o.row } } },
      { text: o.gain,  options: { bold: true, fontSize: 10, color: o.gainTxt, fill: { color: o.gainBg } } },
    ]),
  ];

  slide.addTable(novRows, {
    x: 0.35, y: 0.97, w: 12.63, h: 6.17,
    colW: [1.65, 2.4, 2.9, 2.4, 3.28],
    rowH: [0.44, 1.43, 1.43, 1.43, 1.44],
    border: { type: 'solid', color: 'D0CAE8', pt: 0.75 },
    fontSize: 11, fontFace: 'Calibri', valign: 'middle',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 43 — FEASIBILITY & RESOURCES
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Feasibility Assessment & Resources');
  addFooter(slide, 46);

  slide.addText('All four objectives are computationally feasible within available institutional infrastructure. Year 1 pilot experiments validate the core mechanisms of each component.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const feasCols = [
    {
      title: 'Risk & Mitigation',
      items: [
        'Risk: GPU memory constraint for large multi-agent runs \u2192 Mitigation: LoRA + quantised inference (4-bit)',
        'Risk: ToolBench Application Programming Interface (API) deprecation \u2192 Mitigation: local API emulation server',
        'Risk: MNCD gossip convergence failure under high churn \u2192 Mitigation: bounded gossip fan-out + heartbeat',
        'Risk: Flow-Conductance-based Neural Pruning (FCNP) citation accuracy below 99% \u2192 Mitigation: citation-anchor pinning + rollback pruning',
        'Risk: data.gov.in API downtime \u2192 Mitigation: local cache of last 24h mandi feed',
        'Risk: IndicTrans2 translation errors \u2192 Mitigation: confidence threshold + English fallback',
      ],
    },
    {
      title: 'Data Access',
      items: [
        'data.gov.in: Open Government Data Platform India — live agriculture commodity price feeds',
        'API Token registered for academic research access (Resource ID: 9ef84268-...)',
        'ToolBench: 43,000 annotated APIs — publicly available for academic benchmarking',
        'HuggingFace Model Hub: Gemma-4, IndicTrans2 — open-access model weights',
        'No proprietary or restricted datasets used — all sources are open access',
        'No personally identifiable information processed — farmer queries are anonymised',
      ],
    },
    {
      title: 'Acknowledgement',
      items: [
        'Data source: data.gov.in — Open Government Data (OGD) Platform India (Ministry of Electronics and Information Technology)',
        'Open-source tools: PyTorch, HuggingFace Transformers, FlashAttention-2, FAISS, Gradio, IndicTrans2 (AI4Bharat)',
        'Compute: Google Colab Pro+ (T4/A100), Kaggle Notebooks (P100/T4) — public academic compute platforms',
        'This research uses live data feeds from data.gov.in (Agriculture Catalogue) as the primary real-world data integration layer',
        'All benchmark datasets (ToolBench 43K) and model weights are publicly available — no proprietary data used',
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
      x: x + 0.1, y: 1.1, w: 3.95, h: 0.38,
      fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle',
    });
    col.items.forEach((item, j) => {
      slide.addText(`\u2022 ${item}`, {
        x: x + 0.12, y: 1.58 + j * 0.78, w: 3.92, h: 0.74,
        fontSize: 12, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top',
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 44 — ETHICS, SECURITY & RESPONSIBLE AI
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Ethics, Security & Responsible AI');
  addFooter(slide, 47);

  slide.addText('ACRS operates in production Large Language Model (LLM) inference environments. Ethical considerations span data privacy, adversarial robustness, and EU AI Act compliance.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const ethicsTopics = [
    {
      icon: 'E1',
      title: 'Prompt Injection & Indirect Prompt Injection',
      detail: 'Multi-agent systems are vulnerable to indirect prompt injection (Greshake et al., 2023; InjecAgent — Zhan et al., 2024). ACRS mitigates via: input sanitisation layer before SessionRerank+; routing guards in Context-Driven Routing (CDR) that flag anomalous CoT paths; MNCD context integrity hashes to detect tampered context propagation.',
    },
    {
      icon: 'E2',
      title: 'Data Privacy & Personally Identifiable Information (PII) Handling',
      detail: 'Session history stored in MNCD nodes may contain Personally Identifiable Information (PII). Mitigations: in-memory only context stores with TTL expiry; differential privacy noise injection on exported session features; IndicTrans2 translation sub-system processes Indian language inputs — no external API calls for user data.',
    },
    {
      icon: 'E3',
      title: 'AI Act Compliance & Trustworthiness',
      detail: 'ACRS is a high-impact AI system (multi-agent decision making). EU AI Act Article 9 (Mittelstadt, 2023): risk management system documented. ACRS provides full routing decision logs (CDR chain-of-thought scores, APRR weight snapshots) for auditability. FCNP pruning decisions are reproducible from flow-score logs.',
    },
    {
      icon: 'E4',
      title: 'Multilingual Equity & Bias Mitigation',
      detail: 'IndicTrans2 (Gala et al., 2023) and IndicGenBench (Singh et al., 2024) evaluations ensure SessionRerank+ tool rankings do not degrade for Indic language queries. Routing decisions (APRR+CDR+PDR) evaluated for language-group fairness: no statistical routing penalty for Indic vs English queries (t-test, \u03B1=0.05).',
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
      x: x + 0.02, y: y + 0.1, w: 0.51, h: 0.35,
      fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri', align: 'center',
    });
    slide.addText(t.title, {
      x: x + 0.62, y: y + 0.08, w: 5.48, h: 0.38,
      fontSize: 13, bold: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
    });
    slide.addText(t.detail, {
      x: x + 0.12, y: y + 0.52, w: 5.94, h: 2.1,
      fontSize: 12, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top',
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 45 — METHODOLOGY & TIMELINE
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'Methodology & Research Timeline (3-Year PhD Schedule)');
  addFooter(slide, 48);

  slide.addText('Structured 3-year programme with annual milestones, continuous experimental validation, and iterative benchmarking against published state-of-the-art.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.38,
    fontSize: 13, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  const phases = [
    {
      year: 'Year 1\n(2024\u201325)',
      phase: 'Foundation & Pilot',
      tasks: [
        'Literature review completion (55 papers catalogued)',
        'ToolBench environment setup + baseline replication',
        'SessionRerank+ pilot: NDCG@5 = 0.461 (Year 1 pilot, +2% over baseline)',
        'APRR+CDR+PDR pilot: 47.0% success, 261ms latency',
        'MNCD pilot: 97.5% / 97.0% availability (5-node)',
        'PRP-1 submission (June 2026)',
      ],
      deliverable: 'PRP-1 Report + 4 pilot implementations',
    },
    {
      year: 'Year 2\n(2025\u201326)',
      phase: 'Full System Development',
      tasks: [
        'SessionRerank+ full implementation: NDCG@5 \u2265 0.52 target',
        'APRR+CDR+PDR production integration: ablation studies',
        'MNCD: scale to 10-node cluster, varying failure rates',
        'FCNP: citation-anchor algorithm finalised, 7-baseline comparison',
        'Multilingual evaluation: IndicTrans2 fairness testing',
        'First Journal/Conference paper submission (target: Year 2)',
      ],
      deliverable: '1 Journal/Conference paper + full system v1.0',
    },
    {
      year: 'Year 3\n(2026\u201327)',
      phase: 'Evaluation & Thesis',
      tasks: [
        'Full 30-scenario end-to-end ACRS evaluation',
        'Wilcoxon significance tests across all 4 objectives',
        'Ethics & AI Act compliance documentation',
        'Journal/Conference paper submission (second paper)',
        'Thesis writing and internal review',
        'Thesis submission and viva preparation',
      ],
      deliverable: '1 Journal/Conference paper + PhD Thesis',
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
      x: x + 0.1, y: 1.11, w: 2.0, h: 0.6,
      fontSize: 13, bold: true, color: C.red, fontFace: 'Calibri', valign: 'middle',
    });
    slide.addText(p.phase, {
      x: x + 1.95, y: 1.18, w: 2.1, h: 0.46,
      fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle', wrap: true,
    });
    p.tasks.forEach((task, j) => {
      slide.addText(`\u2022 ${task}`, {
        x: x + 0.12, y: 1.8 + j * 0.68, w: 3.93, h: 0.64,
        fontSize: 12, color: C.darkText, fontFace: 'Calibri', wrap: true, valign: 'top',
      });
    });
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 6.52, w: 4.15, h: 0.55,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(p.deliverable, {
      x: x + 0.1, y: 6.54, w: 3.95, h: 0.5,
      fontSize: 12, bold: true, color: C.white,
      fontFace: 'Calibri', align: 'center', valign: 'middle', wrap: true,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 46 — CONCLUSION
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: C.white }, line: { color: C.white },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.5,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('Conclusion — Adaptive Context Reasoning System (ACRS) PhD Research Proposal', {
    x: 0.3, y: 0.07, w: 12.7, h: 0.36,
    fontSize: 17, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle',
  });

  slide.addText('Adaptive Context Reasoning System (ACRS) presents a unified framework addressing four independent, unresolved gaps in multi-agent Large Language Model (LLM) inference:', {
    x: 0.5, y: 0.65, w: 12.33, h: 0.5,
    fontSize: 14, color: C.deepPurple, fontFace: 'Calibri', italic: true, wrap: true,
  });

  const concItems = [
    { num: '1', title: 'SessionRerank+', text: 'Session-aware tool reranking: NDCG@5 \u2265 0.461 (+2% over dense retrieval baseline, p<0.05) on 43,000 real-world APIs' },
    { num: '2', title: 'APRR+CDR+PDR', text: 'Online Reinforcement Learning (RL) adaptive routing: \u226547% task success, \u2264265ms latency, +2% routing improvement over static baseline' },
    { num: '3', title: 'MNCD', text: 'Decentralised context distribution: \u226597% context availability under 2-of-5 node failures, O(log N) propagation' },
    { num: '4', title: 'FCNP', text: 'Flow-Conductance-based Neural Pruning (FCNP): 10:1 context compression, \u226599% citation accuracy, Wilcoxon p<0.05 vs 7 baselines' },
  ];

  concItems.forEach((item, i) => {
    const y = 1.3 + i * 1.22;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y, w: 0.5, h: 0.5,
      fill: { color: C.red }, line: { color: C.red },
    });
    slide.addText(item.num, {
      x: 0.5, y: y + 0.06, w: 0.5, h: 0.38,
      fontSize: 16, bold: true, color: C.white, fontFace: 'Calibri', align: 'center',
    });
    slide.addText(item.title, {
      x: 1.1, y: y + 0.02, w: 2.2, h: 0.35,
      fontSize: 14, bold: true, color: C.red, fontFace: 'Calibri',
    });
    slide.addText(item.text, {
      x: 3.4, y: y + 0.02, w: 9.4, h: 0.68,
      fontSize: 13, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 6.25, w: 12.33, h: 0,
    line: { color: C.red, pt: 1 },
  });
  slide.addText('Together, these four components form a production-validated, ethically compliant, and statistically rigorous system for the next generation of multi-agent Large Language Model (LLM) inference infrastructure.', {
    x: 0.5, y: 6.35, w: 12.33, h: 0.55,
    fontSize: 13, color: C.deepPurple, fontFace: 'Calibri', italic: true, wrap: true, align: 'center',
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.2, w: 13.33, h: 0.3,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 12.33, y: 7.2, w: 1.0, h: 0.3,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('ACRS — PRP-1 | M.S. Ramaiah University | Jenisha T | 24ETRP720001', {
    x: 0.2, y: 7.22, w: 12.0, h: 0.26,
    fontSize: 8, color: C.white, fontFace: 'Calibri', valign: 'middle', align: 'left',
  });
  slide.addText('46', {
    x: 12.33, y: 7.22, w: 1.0, h: 0.26,
    fontSize: 13, bold: true, color: C.white, fontFace: 'Calibri',
    valign: 'middle', align: 'center', margin: 0,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 47 — ACRS INTEGRATION DEMO
// ─────────────────────────────────────────────────────────────────────────────
{
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'ACRS End-to-End Integration — ToolBench, data.gov.in & HuggingFace Deployment');
  addFooter(slide, 50);

  slide.addText('All four objectives operate on a shared ToolBench dataset and live data.gov.in agriculture feeds — deployed as a unified HuggingFace (HF) Spaces demo.', {
    x: 0.35, y: 0.58, w: 12.6, h: 0.32,
    fontSize: 12, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 0.98, w: 12.63, h: 0.55,
    fill: { color: '1A237E' }, line: { color: '1A237E' },
  });
  slide.addText('SHARED INPUT: ToolBench (43,000 Application Programming Interfaces (APIs)) + data.gov.in Live Feeds', {
    x: 0.4, y: 1.02, w: 10.0, h: 0.44,
    fontSize: 12, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle',
  });

  const feeds = [
    { label: 'Mandi Prices', id: '9ef84268-d588-465a-a308-a864a43d0070', fields: 'state, commodity, modal_price, arrival_date', live: true },
    { label: 'Crop Arrivals', id: '35985678-0d79-46b4-9ed6-6f13308a1d24', fields: 'State, Commodity, Market, Modal_Price', live: true },
    { label: 'ToolBench APIs', id: 'Qin et al. 2024 \u2014 43K APIs', fields: 'tool_name, api_endpoint, category, description', live: false },
  ];
  feeds.forEach((f, i) => {
    const x = 0.35 + i * 4.29;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.61, w: 4.1, h: 0.82,
      fill: { color: f.live ? 'E8F5E9' : 'E3F2FD' },
      line: { color: f.live ? '2E7D32' : '1565C0', pt: 1 },
    });
    slide.addText((f.live ? '\u25CF LIVE  ' : '\u25CF STATIC  ') + f.label, {
      x: x + 0.1, y: 1.64, w: 3.9, h: 0.22,
      fontSize: 11, bold: true, color: f.live ? '2E7D32' : '1565C0', fontFace: 'Calibri',
    });
    slide.addText('ID: ' + f.id, {
      x: x + 0.1, y: 1.86, w: 3.9, h: 0.16,
      fontSize: 8, color: '607D8B', fontFace: 'Calibri',
    });
    slide.addText('Fields: ' + f.fields, {
      x: x + 0.1, y: 2.02, w: 3.9, h: 0.35,
      fontSize: 9, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });

  const objs2 = [
    { num: '1', title: 'Obj 1 — SessionRerank+', detail: 'Reranks ToolBench APIs using co-activation graph + session history. Selects Top-K APIs for current farmer query.', color: '1565C0', bg: 'E3F2FD' },
    { num: '2', title: 'Obj 2 — APRR+CDR+PDR', detail: 'Routes query to specialist agents using RL weight matrix W, updated by mandi price signal.', color: 'E65100', bg: 'FFF3E0' },
    { num: '3', title: 'Obj 3 — MNCD', detail: 'Distributes context across agent mesh via gossip protocol. Borda consensus over live data.gov.in responses.', color: '2E7D32', bg: 'E8F5E9' },
    { num: '4', title: 'Obj 4 — FCNP', detail: 'Prunes Key-Value (KV) context using Flow Conductance scores. Retains citation-critical tokens at 10:1 compression.', color: '6A0080', bg: 'F3E5F5' },
  ];
  objs2.forEach((o, i) => {
    const x = 0.35 + i * 3.24;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 2.55, w: 3.08, h: 2.2,
      fill: { color: o.bg }, line: { color: o.color, pt: 1.5 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 2.55, w: 3.08, h: 0.38,
      fill: { color: o.color }, line: { color: o.color },
    });
    slide.addText(o.title, {
      x: x + 0.08, y: 2.57, w: 2.9, h: 0.34,
      fontSize: 10.5, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle',
    });
    slide.addText(o.detail, {
      x: x + 0.1, y: 2.97, w: 2.88, h: 1.68,
      fontSize: 10, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
    if (i < 3) {
      slide.addShape(pptx.ShapeType.line, {
        x: x + 3.1, y: 3.55, w: 0.12, h: 0,
        line: { color: C.deepPurple, pt: 1.5, endArrowType: 'arrow' },
      });
    }
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0.35, y: 4.86, w: 7.6, h: 0.58,
    fill: { color: C.deepPurple }, line: { color: C.deepPurple },
  });
  slide.addText('OUTPUT: Verified, source-attributed, multilingual farmer response — data.gov.in cited', {
    x: 0.45, y: 4.90, w: 7.4, h: 0.46,
    fontSize: 12, bold: true, color: C.white, fontFace: 'Calibri', valign: 'middle',
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 8.05, y: 4.86, w: 4.93, h: 0.58,
    fill: { color: C.red }, line: { color: C.red },
  });
  slide.addText('HuggingFace (HF) Spaces Demo', {
    x: 8.15, y: 4.90, w: 2.8, h: 0.26,
    fontSize: 12, bold: true, color: C.white, fontFace: 'Calibri',
  });
  slide.addText('abigailcreations/karnataka-agri-assistant', {
    x: 8.15, y: 5.14, w: 4.7, h: 0.22,
    fontSize: 9, color: 'FFCDD2', fontFace: 'Calibri',
  });

  const facts = [
    '\u25CF All 4 objectives share ToolBench tool index (43K APIs) — Obj1 reranks, Obj2 routes, Obj3 distributes, Obj4 compresses',
    '\u25CF data.gov.in live Application Programming Interface (API) feeds inject real mandi prices & crop arrivals at Obj2 (routing signal) and Obj3 (consensus input)',
    '\u25CF HuggingFace Spaces hosts Gradio demo: farmer types query \u2192 live ACRS pipeline responds with cited data.gov.in source',
  ];
  facts.forEach((fact, i) => {
    slide.addText(fact, {
      x: 0.35, y: 5.54 + i * 0.38,
      w: 12.63, h: 0.34,
      fontSize: 10.5, color: C.darkText, fontFace: 'Calibri', wrap: true,
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDES 48–51 — REFERENCES (4 slides, correct DOIs)
// ─────────────────────────────────────────────────────────────────────────────
const allRefs = [
  // Objective 1
  '[1] Fu et al. (2024). LazyLLM: Dynamic Token Pruning for Efficient Long Context LLM Inference. arXiv:2407.14057. doi:10.48550/arXiv.2407.14057.',
  '[2] Zhang et al. (2023). H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models. NeurIPS 2023. arXiv:2306.14048. doi:10.48550/arXiv.2306.14048.',
  '[3] Liu et al. (2023). Scissorhands: Exploiting the Persistence of Importance Hypothesis for LLM KV Cache Compression at Test Time. NeurIPS 2023. arXiv:2305.17118. doi:10.48550/arXiv.2305.17118.',
  '[4] Xiao et al. (2024). Efficient Streaming Language Models with Attention Sinks (StreamingLLM). ICLR 2024. arXiv:2309.17453. doi:10.48550/arXiv.2309.17453.',
  '[5] Kang et al. (2024). GEAR: An Efficient KV Cache Compression Recipe for Near-Lossless Generative Inference of LLM. arXiv:2403.05527. doi:10.48550/arXiv.2403.05527.',
  '[6] Qin et al. (2024). ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs. ICLR 2024. arXiv:2307.16789. doi:10.48550/arXiv.2307.16789.',
  '[7] Liu et al. (2024). CacheGen: KV Cache Compression and Streaming for Fast Large Language Model Serving. SIGCOMM 2024. doi:10.1145/3651890.3672274.',
  '[8] Liu et al. (2024). MiniCache: KV Cache Compression in Depth Dimension for Large Language Models. NeurIPS 2024. arXiv:2405.14366. doi:10.48550/arXiv.2405.14366.',
  // Objective 2
  '[9] Ong et al. (2024). RouteLLM: Learning to Route LLMs with Preference Data. arXiv:2406.18665. doi:10.48550/arXiv.2406.18665.',
  '[10] Chen et al. (2023). FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance. arXiv:2305.05176. doi:10.48550/arXiv.2305.05176.',
  '[11] Wang et al. (2024). Mixture-of-Agents Enhances Large Language Model Capabilities. arXiv/COLM 2024.',
  '[12] Stripelis et al. (2024). TensorOpera Router: A Multi-Model Router for Efficient LLM Inference. EMNLP 2024.',
  '[13] Feng et al. (2024). GraphRouter: A Graph-based Router for LLM Selections. arXiv 2024.',
  '[14] Wu et al. (2024). AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation. ICLR 2024. arXiv:2308.08155. doi:10.48550/arXiv.2308.08155.',
  '[15] Yao et al. (2023). ReAct: Synergizing Reasoning and Acting in Language Models. ICLR 2023. arXiv:2210.03629. doi:10.48550/arXiv.2210.03629.',
  // Objective 3
  '[16] Liu et al. (2023). AgentBench: Evaluating LLMs as Agents. ICLR 2024. arXiv:2308.03688. doi:10.48550/arXiv.2308.03688.',
  '[17] Xi et al. (2023). The Rise and Potential of Large Language Model Based Agents: A Survey. arXiv:2309.07864.',
  '[18] Hu et al. (2022). LoRA: Low-Rank Adaptation of Large Language Models. ICLR 2022. arXiv:2106.09685. doi:10.48550/arXiv.2106.09685.',
  '[19] Yang et al. (2024). Ada-KV: Optimizing KV Cache Eviction by Adaptive Budget Allocation for Efficient LLM Inference. arXiv:2407.11550. doi:10.48550/arXiv.2407.11550.',
  '[20] Wan et al. (2024). D2O: Dynamic Discriminative Operations for Efficient Generative Inference of Large Language Models. arXiv:2406.13035. doi:10.48550/arXiv.2406.13035.',
  // Objective 4
  '[21] Team et al. (2024). Gemini: A Family of Highly Capable Multimodal Models. arXiv:2312.11805. doi:10.48550/arXiv.2312.11805.',
  '[22] Guo et al. (2024). Large Language Model based Multi-Agents: A Survey of Progress and Challenges. arXiv:2402.01680. doi:10.48550/arXiv.2402.01680.',
  '[23] Xu et al. (2024). Finch: Prompt-guided Key-Value Cache Compression for Large Language Models. TACL 2024. arXiv:2408.00167. doi:10.48550/arXiv.2408.00167.',
  '[24] Team (2024). ToolBench: An Open Platform for Training, Serving, and Evaluating Large Language Models for Tool Learning. arXiv:2307.16789.',
  '[25] Qin et al. (2023). Tool Learning with Foundation Models. arXiv:2304.08354.',
  '[26] Patil et al. (2023). Gorilla: Large Language Model Connected with Massive APIs. arXiv:2305.15334.',
  '[27] Zhuang et al. (2023). ToolQA: A Dataset for LLM Question Answering with External Tools. NeurIPS 2023. arXiv:2306.13304.',
  '[28] Schick et al. (2024). Toolformer: Language Models Can Teach Themselves to Use Tools. NeurIPS 2023. arXiv:2302.04761.',
];

// ─── Render reference slides (4 slides, ~7 refs each) ─────────────────────────
const REFS_PER_SLIDE = 7;
const refSlideCount = Math.ceil(allRefs.length / REFS_PER_SLIDE);
for (let r = 0; r < refSlideCount; r++) {
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, `References (${r + 1} of ${refSlideCount})`);
  addFooter(slide, 48 + r);

  // DOI hyperlink map
  const DOI_URLS = {
    1:  'https://doi.org/10.48550/arXiv.2407.14057',
    2:  'https://doi.org/10.48550/arXiv.2306.14048',
    3:  'https://doi.org/10.48550/arXiv.2305.17118',
    4:  'https://doi.org/10.48550/arXiv.2309.17453',
    5:  'https://doi.org/10.48550/arXiv.2403.05527',
    6:  'https://doi.org/10.48550/arXiv.2307.16789',
    7:  'https://doi.org/10.1145/3651890.3672274',
    8:  'https://doi.org/10.48550/arXiv.2405.14366',
    9:  'https://doi.org/10.48550/arXiv.2406.18665',
    10: 'https://doi.org/10.48550/arXiv.2305.05176',
    11: 'https://arxiv.org/abs/2406.04692',
    12: 'https://arxiv.org/abs/2407.17320',
    13: 'https://arxiv.org/abs/2407.12322',
    14: 'https://doi.org/10.48550/arXiv.2308.08155',
    15: 'https://doi.org/10.48550/arXiv.2210.03629',
    16: 'https://doi.org/10.48550/arXiv.2308.03688',
    17: 'https://arxiv.org/abs/2309.07864',
    18: 'https://doi.org/10.48550/arXiv.2106.09685',
    19: 'https://doi.org/10.48550/arXiv.2407.11550',
    20: 'https://doi.org/10.48550/arXiv.2406.13035',
    21: 'https://doi.org/10.48550/arXiv.2312.11805',
    22: 'https://doi.org/10.48550/arXiv.2402.01680',
    23: 'https://doi.org/10.48550/arXiv.2408.00167',
    24: 'https://doi.org/10.48550/arXiv.2307.16789',
    25: 'https://arxiv.org/abs/2304.08354',
    26: 'https://arxiv.org/abs/2305.15334',
    27: 'https://arxiv.org/abs/2306.13304',
    28: 'https://doi.org/10.48550/arXiv.2302.04761',
  };

  const chunk = allRefs.slice(r * REFS_PER_SLIDE, (r + 1) * REFS_PER_SLIDE);
  chunk.forEach((ref, idx) => {
    // Extract ref number from "[N] ..."
    const numMatch = ref.match(/^\[(\d+)\]/);
    const refNum = numMatch ? parseInt(numMatch[1]) : null;
    const url = refNum ? (DOI_URLS[refNum] || null) : null;
    const bodyText = numMatch ? ref.slice(numMatch[0].length).trim() : ref;

    // Build ref entry: workaround for pptxgenjs bold+hyperlink bug.
    // [N] badge: invisible hyperlink shape + separate large bold red text.
    // Body text: plain addText alongside it.
    const entryY = 0.62 + idx * 0.84;
    const badgeW = refNum >= 10 ? 0.42 : 0.32;
    if (refNum && url) {
      // Clickable invisible shape for the [N] badge area
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.35, y: entryY, w: badgeW, h: 0.38,
        fill: { color: 'FFFFFF', transparency: 100 },
        line: { color: 'FFFFFF', transparency: 100 },
        hyperlink: { url },
      });
      // Bold red [N] text — no hyperlink so bold renders correctly
      slide.addText('[' + refNum + ']', {
        x: 0.35, y: entryY, w: badgeW, h: 0.38,
        bold: true, color: C.red, fontSize: 15,
        fontFace: 'Calibri', align: 'center', valign: 'middle', margin: 0,
      });
      // Body text to the right
      slide.addText(bodyText, {
        x: 0.35 + badgeW + 0.06, y: entryY, w: 12.63 - badgeW - 0.06, h: 0.78,
        color: C.darkText, fontSize: 11, fontFace: 'Calibri', wrap: true, valign: 'top',
      });
    } else {
      slide.addText(ref, {
        x: 0.35, y: entryY, w: 12.63, h: 0.78,
        color: C.darkText, fontSize: 11, fontFace: 'Calibri', wrap: true, valign: 'top',
      });
    }

    if (idx < chunk.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: 0.35, y: 1.36 + idx * 0.84, w: 12.63, h: 0,
        line: { color: 'E0E0E0', pt: 0.5 },
      });
    }
  });

  // Drive paper folder link — bottom of slide
  slide.addText([
    { text: 'Paper Folder: ', options: { color: C.darkText, fontSize: 9.5, fontFace: 'Calibri' } },
    { text: 'Open Drive Folder', options: {
        hyperlink: { url: 'https://drive.google.com/drive/u/0/folders/1sAOY-c2Bg0Io7102_klRrvtyOj06Kc0Z' },
        color: '1565C0', bold: true, fontSize: 9.5, fontFace: 'Calibri',
    }},
  ], { x: 0.35, y: 7.06, w: 12.63, h: 0.18, valign: 'middle' });
}

// ─────────────────────────────────────────────────────────────────────────────
//  SLIDE 52 — PHD TIMELINE: POST-PRP-1 (SOP-based, months after PoC)
// ─────────────────────────────────────────────────────────────────────────────
{
  const timelineB64 = readB64('phd_timeline');
  const slide = pptx.addSlide();
  addContentBg(slide);
  addHeaderBar(slide, 'PhD Research Timeline — Post-PRP-1 to Thesis (Months After Proof-of-Concept)');
  addFooter(slide, 55);

  slide.addText(
    'Starting from PRP-1 (June 2026). Each objective completion triggers a journal paper submission. '
    + 'Timeline aligned with MSRUAS ORI Standard Operating Procedure (SOP, February 2025). '
    + 'Examiner review minimum 8 weeks per SOP.',
    {
      x: 0.35, y: 0.55, w: 12.63, h: 0.42,
      fontSize: 11.5, italic: true, color: C.deepPurple, fontFace: 'Calibri', wrap: true,
    }
  );

  if (timelineB64) {
    slide.addImage({
      data: `image/png;base64,${timelineB64}`,
      x: 0.2, y: 1.0, w: 12.9, h: 6.1,
      sizing: { type: 'contain', w: 12.9, h: 6.1 },
    });
  } else {
    // Fallback: draw timeline as shapes if image missing
    const phases = [
      { label: 'M+0\nPRP-1\nSubmitted\n(Now)',         color: C.red,       x: 0.3 },
      { label: 'M+2\nObj 1\nComplete\n+ Journal',      color: C.blue,      x: 2.7 },
      { label: 'M+4–6\nObj 2\nComplete\n+ Journal',    color: C.orange,    x: 5.1 },
      { label: 'M+7–9\nObj 3\nComplete\n+ Journal',    color: '00695C',    x: 7.5 },
      { label: 'M+10–12\nObj 4\nComplete\n+ Journal',  color: C.green,     x: 9.9 },
      { label: 'M+20–25\nThesis &\nViva Voce',         color: C.deepPurple,x: 12.3 },
    ];

    // Spine
    slide.addShape(pptx.ShapeType.line, {
      x: 0.35, y: 4.2, w: 12.7, h: 0,
      line: { color: C.deepPurple, pt: 5, endArrowType: 'arrow' },
    });

    phases.forEach((p, i) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: p.x, y: 1.8, w: 2.0, h: 2.3,
        fill: { color: p.color }, line: { color: p.color },
      });
      slide.addText(p.label, {
        x: p.x + 0.08, y: 1.88, w: 1.84, h: 2.1,
        fontSize: 11, bold: true, color: C.white, fontFace: 'Calibri',
        align: 'center', valign: 'middle', wrap: true,
      });
      slide.addShape(pptx.ShapeType.line, {
        x: p.x + 1.0, y: 4.1, w: 0, h: -0.3,
        line: { color: p.color, pt: 2 },
      });
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  WRITE FILE
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  const outPath = '/home/user/workspace/presentation/ACRS_PhD_Proposal_v8_1.pptx';
  await pptx.writeFile({ fileName: outPath });
  console.log('[v8] Written to', outPath);
})();
