#!/usr/bin/env python3
"""Build the MSRUAS PRP PowerPoint with automatic date + slide numbers.

The Kyndryl SharePoint original (Gowrishankar_PPT_PRP2.pptx) is not readable
from this environment (HTTP 401). This script copies the Office PRP master
pattern — Header/Footer date field (updates to today) and slide-number field
— then transfers the ACRS proposal content onto that chrome.
"""

from __future__ import annotations

import json
import shutil
import uuid
import zipfile
from datetime import date
from pathlib import Path

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, PP_PLACEHOLDER
from pptx.enum.text import PP_ALIGN
from pptx.oxml import parse_xml
from pptx.util import Emu, Inches, Pt

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "docs/slides/slides.json").read_text())
COLLEGE = DATA["college"]
SLIDES = DATA["slides"]
CONTENTS = DATA["contents"]
FILENAMES = DATA["filenames"]

W = Inches(13.333)
H = Inches(7.5)
MAROON = RGBColor(0x7C, 0x1D, 0x2E)
GOLD = RGBColor(0xC4, 0xA3, 0x5A)
CREAM = RGBColor(0xFF, 0xFA, 0xF3)
INK = RGBColor(0x1A, 0x12, 0x14)
MUTED = RGBColor(0x5C, 0x4A, 0x4E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
NSMAP_P = "http://schemas.openxmlformats.org/presentationml/2006/main"

TODAY = date.today()
TODAY_TEXT = f"{TODAY.day} {TODAY.strftime('%B %Y')}"  # e.g. 7 September 2026

DIAGRAMS = {
    "sota": (["Query only", "SBERT", "ToolRerank", "One LLM", "Answer"], None),
    "e2e": (["q + M", "SATR", "APRR", "MNCD", "FCNP", "a + M"], None),
    "integrated": (["q + M", "SATR", "APRR", "MNCD", "FCNP", "a + M"], None),
    "satr": (
        ["Query embed", "SBERT (Qin ICLR 2024)", "ToolRerank", "Planner"],
        ["q + H + M_t", "Session fusion", "Hierarchy cut", "Shortlist → APRR"],
    ),
    "compare-satr": (
        ["Query embed", "SBERT (Qin ICLR 2024)", "ToolRerank", "Planner"],
        ["q + H + M_t", "Session fusion", "Hierarchy cut", "Shortlist → APRR"],
    ),
    "aprr": (
        ["Query", "MasRouter / RouteLLM / SOP", "Pick an LLM"],
        ["SATR shortlist", "Dirichlet–Thompson", "Specialist path → MNCD"],
    ),
    "compare-aprr": (
        ["Query", "MasRouter / RouteLLM / SOP", "Pick an LLM"],
        ["SATR shortlist", "Dirichlet–Thompson", "Specialist path → MNCD"],
    ),
    "mncd": (
        ["Manager LLM", "Star / chat messages"],
        ["Mesh gossip", "Score-sum over tool IDs", "Live data.gov.in"],
    ),
    "compare-mncd": (
        ["Manager LLM", "Star / chat messages"],
        ["Mesh gossip", "Score-sum over tool IDs", "Live data.gov.in"],
    ),
    "fcnp": (
        ["Long prompt", "LLMLingua tokens", "No write-back"],
        ["MNCD citations", "Kirchhoff / Physarum", "M_t → SATR"],
    ),
    "compare-fcnp": (
        ["Long prompt", "LLMLingua tokens", "No write-back"],
        ["MNCD citations", "Kirchhoff / Physarum", "M_t → SATR"],
    ),
}


def rgb_of(hex_color: str) -> RGBColor:
    hex_color = hex_color.lstrip("#")
    return RGBColor(int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16))


def set_fill(shape, color: RGBColor) -> None:
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()


def add_textbox(slide, left, top, width, height, text, *, size=14, bold=False, color=INK, align=PP_ALIGN.LEFT, font="Calibri"):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.name = font
    return box


def add_bullets(slide, left, top, width, height, items, *, size=13) -> None:
    if not items:
        return
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.level = 0
        p.space_after = Pt(6)
        run = p.add_run()
        run.text = item
        run.font.size = Pt(size)
        run.font.color.rgb = INK
        run.font.name = "Calibri"
        pPr = p._p.get_or_add_pPr()
        bu = parse_xml(
            '<a:buFont xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" typeface="Arial"/>'
        )
        buChar = parse_xml(
            '<a:buChar xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" char="•"/>'
        )
        pPr.append(bu)
        pPr.append(buChar)


def add_table(slide, left, top, width, height, headers, rows) -> None:
    n_rows = 1 + len(rows)
    n_cols = len(headers)
    table = slide.shapes.add_table(n_rows, n_cols, left, top, width, height).table
    usable = max(width.inches, 1)
    if n_cols == 2:
        widths = [Inches(usable * 0.32), Inches(usable * 0.68)]
    elif n_cols == 3:
        widths = [Inches(usable * 0.16), Inches(usable * 0.34), Inches(usable * 0.50)]
    else:
        widths = [Inches(usable / n_cols)] * n_cols
    for i, w in enumerate(widths):
        table.columns[i].width = w
    for c, header in enumerate(headers):
        cell = table.cell(0, c)
        cell.text = header
        cell.fill.solid()
        cell.fill.fore_color.rgb = MAROON
        for p in cell.text_frame.paragraphs:
            for run in p.runs:
                run.font.bold = True
                run.font.size = Pt(11)
                run.font.color.rgb = WHITE
                run.font.name = "Calibri"
    for r, row in enumerate(rows, start=1):
        for c, value in enumerate(row):
            cell = table.cell(r, c)
            cell.text = value
            cell.fill.solid()
            cell.fill.fore_color.rgb = CREAM
            for p in cell.text_frame.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(10)
                    run.font.color.rgb = INK
                    run.font.name = "Calibri"
                    if c == 0:
                        run.font.bold = True
                        run.font.color.rgb = MAROON


def add_evidence_cards(slide, items, top) -> None:
    if not items:
        return
    n = len(items)
    gap = Inches(0.18)
    left0 = Inches(0.35)
    total = Inches(12.6)
    width = Emu(int((total - gap * (n - 1)) / n))
    height = Inches(4.55)
    fields = (
        ("Author(s)", "authors"),
        ("Year", "year"),
        ("Title", "title"),
        ("Publication", "venue"),
        ("Objective", "objective"),
        ("Methodology", "methodology"),
        ("Findings", "findings"),
        ("Limitations", "limitations"),
    )
    for i, ev in enumerate(items):
        x = left0 + Emu(int(i * (width + gap)))
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = WHITE
        card.line.color.rgb = MAROON
        card.line.width = Pt(1.25)
        box = slide.shapes.add_textbox(
            x + Inches(0.1), top + Inches(0.08), width - Inches(0.2), height - Inches(0.16)
        )
        tf = box.text_frame
        tf.word_wrap = True
        head = tf.paragraphs[0]
        head.alignment = PP_ALIGN.LEFT
        run = head.add_run()
        run.text = f"Evidence {ev['n']}"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = MAROON
        run.font.name = "Calibri"
        for label, key in fields:
            p = tf.add_paragraph()
            p.space_before = Pt(4)
            p.space_after = Pt(0)
            label_run = p.add_run()
            label_run.text = f"{label}: "
            label_run.font.size = Pt(10)
            label_run.font.bold = True
            label_run.font.color.rgb = MAROON
            label_run.font.name = "Calibri"
            value_run = p.add_run()
            value_run.text = str(ev.get(key) or "")
            value_run.font.size = Pt(10)
            value_run.font.color.rgb = INK
            value_run.font.name = "Calibri"


def add_flow(slide, labels, top, fill: RGBColor) -> None:
    if not labels:
        return
    gap = Inches(0.12)
    left0 = Inches(0.4)
    total = Inches(12.5)
    width = Emu(int((total - gap * (len(labels) - 1)) / len(labels)))
    for i, label in enumerate(labels):
        x = left0 + Emu(int(i * (width + gap)))
        shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, top, width, Inches(0.48))
        set_fill(shape, fill)
        try:
            shape.adjustments[0] = 0.1
        except Exception:
            pass
        tf = shape.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        run = p.add_run()
        run.text = label
        run.font.size = Pt(10)
        run.font.color.rgb = WHITE
        run.font.bold = True
        run.font.name = "Calibri"


def add_diagram(slide, kind: str | None, top) -> None:
    if not kind or kind == "none":
        return
    pair = DIAGRAMS.get(kind)
    if not pair:
        return
    top_row, bottom_row = pair
    if bottom_row:
        add_textbox(slide, Inches(0.4), top, Inches(12.5), Inches(0.24),
                    "Top: published SOTA. Bottom: this proposal. No numerical targets.",
                    size=11, color=MUTED)
        add_flow(slide, top_row, top + Inches(0.28), RGBColor(0x4A, 0x2A, 0x32))
        add_flow(slide, bottom_row, top + Inches(0.86), MAROON)
    else:
        caption = "ACRS loop (maroon). Green path is the increment, not a metric." if kind in {"e2e", "integrated"} else "SOTA (grey): turn-amnesic planner — no write-back."
        add_textbox(slide, Inches(0.4), top, Inches(12.5), Inches(0.24), caption, size=11, color=MUTED)
        fill = MAROON if kind in {"e2e", "integrated"} else RGBColor(0x4A, 0x2A, 0x32)
        add_flow(slide, top_row, top + Inches(0.28), fill)


def ensure_hf(element) -> None:
    tag = f"{{{NSMAP_P}}}hf"
    existing = element.find(tag)
    if existing is not None:
        existing.set("sldNum", "1")
        existing.set("hdr", "0")
        existing.set("ftr", "1")
        existing.set("dt", "1")
        return
    hf = parse_xml(
        '<p:hf xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" '
        'sldNum="1" hdr="0" ftr="1" dt="1"/>'
    )
    element.append(hf)


def restyle_placeholder(shape, *, color: RGBColor, align) -> None:
    try:
        shape.top = Inches(7.18)
        shape.height = Inches(0.28)
        tf = shape.text_frame
        tf.word_wrap = False
        for p in tf.paragraphs:
            p.alignment = align
            for run in p.runs:
                run.font.size = Pt(10)
                run.font.color.rgb = color
                run.font.name = "Calibri"
    except Exception:
        return


def add_chrome(slide) -> None:
    header = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), W, Inches(0.72))
    set_fill(header, MAROON)
    gold = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0.72), W, Inches(0.06))
    set_fill(gold, GOLD)
    footer = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(7.12), W, Inches(0.38))
    set_fill(footer, MAROON)
    add_textbox(
        slide,
        Inches(0.32),
        Inches(0.08),
        Inches(12.6),
        Inches(0.32),
        COLLEGE["university"].upper(),
        size=13,
        bold=True,
        color=WHITE,
    )
    add_textbox(
        slide,
        Inches(0.32),
        Inches(0.38),
        Inches(12.6),
        Inches(0.28),
        f"{COLLEGE['facultyHeader']}  ·  {COLLEGE['kicker']}",
        size=11,
        color=GOLD,
    )
    add_textbox(
        slide,
        Inches(3.7),
        Inches(7.18),
        Inches(6.3),
        Inches(0.26),
        f"{COLLEGE['scholar']}  |  {COLLEGE['registerNo']}  |  {COLLEGE['mode']}",
        size=10,
        color=WHITE,
        align=PP_ALIGN.CENTER,
    )


def style_master(prs: Presentation) -> None:
    for layout in [prs.slide_master, *prs.slide_layouts]:
        for ph in list(layout.placeholders):
            kind = ph.placeholder_format.type
            if kind == PP_PLACEHOLDER.DATE:
                ph.left, ph.width = Inches(0.28), Inches(3.4)
                restyle_placeholder(ph, color=GOLD, align=PP_ALIGN.LEFT)
            elif kind == PP_PLACEHOLDER.FOOTER:
                ph.left, ph.width = Inches(3.7), Inches(6.3)
                restyle_placeholder(ph, color=WHITE, align=PP_ALIGN.CENTER)
            elif kind == PP_PLACEHOLDER.SLIDE_NUMBER:
                ph.left, ph.width = Inches(10.5), Inches(2.5)
                restyle_placeholder(ph, color=GOLD, align=PP_ALIGN.RIGHT)


def inject_slide_fields(slide, index: int) -> None:
    """Put PowerPoint auto date + slide-number fields on the slide itself."""
    date_id = f"{{{uuid.uuid4()}}}"
    num_id = f"{{{uuid.uuid4()}}}"
    date_xml = f'''
      <p:sp xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:nvSpPr>
          <p:cNvPr id="{4000 + index}" name="Automatic Date {index}"/>
          <p:cNvSpPr txBox="1"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="255016" y="6565900"/>
            <a:ext cx="3108960" cy="255016"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="none" lIns="0" tIns="0" rIns="0" bIns="0" anchor="ctr"/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="l"/>
            <a:fld id="{date_id}" type="datetime3">
              <a:rPr lang="en-GB" sz="1000" dirty="0">
                <a:solidFill><a:srgbClr val="C4A35A"/></a:solidFill>
                <a:latin typeface="Calibri"/>
              </a:rPr>
              <a:t>{TODAY_TEXT}</a:t>
            </a:fld>
            <a:endParaRPr lang="en-GB" sz="1000"/>
          </a:p>
        </p:txBody>
      </p:sp>
    '''
    num_xml = f'''
      <p:sp xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
        <p:nvSpPr>
          <p:cNvPr id="{5000 + index}" name="Automatic Slide Number {index}"/>
          <p:cNvSpPr txBox="1"/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="9601200" y="6565900"/>
            <a:ext cx="2286000" cy="255016"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:noFill/>
        </p:spPr>
        <p:txBody>
          <a:bodyPr wrap="none" lIns="0" tIns="0" rIns="0" bIns="0" anchor="ctr"/>
          <a:lstStyle/>
          <a:p>
            <a:pPr algn="r"/>
            <a:fld id="{num_id}" type="slidenum">
              <a:rPr lang="en-GB" sz="1000" dirty="0">
                <a:solidFill><a:srgbClr val="C4A35A"/></a:solidFill>
                <a:latin typeface="Calibri"/>
              </a:rPr>
              <a:t>{index}</a:t>
            </a:fld>
            <a:r>
              <a:rPr lang="en-GB" sz="1000">
                <a:solidFill><a:srgbClr val="C4A35A"/></a:solidFill>
                <a:latin typeface="Calibri"/>
              </a:rPr>
              <a:t> / {len(SLIDES)}</a:t>
            </a:r>
            <a:endParaRPr lang="en-GB" sz="1000"/>
          </a:p>
        </p:txBody>
      </p:sp>
    '''
    tree = slide.shapes._spTree
    tree.append(parse_xml(date_xml))
    tree.append(parse_xml(num_xml))


def patch_package_fields(path: Path) -> None:
    """Force datetime3 + Header/Footer flags inside the zip after save."""
    tmp = path.with_suffix(".patched.pptx")
    with zipfile.ZipFile(path, "r") as zin, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for info in zin.infolist():
            data = zin.read(info.filename)
            name = info.filename
            if name.endswith(".xml") and (
                "slideMaster" in name or "slideLayout" in name or "/slides/slide" in name
            ):
                text = data.decode("utf-8")
                text = text.replace('type="datetimeFigureOut"', 'type="datetime3"')
                text = text.replace('type="datetime1"', 'type="datetime3"')
                # Refresh cached date text commonly stored in the field.
                text = text.replace(">1/27/13<", f">{TODAY_TEXT}<")
                if "<p:hf" not in text:
                    if "</p:sldMaster>" in text:
                        text = text.replace("</p:sldMaster>", '<p:hf sldNum="1" hdr="0" ftr="1" dt="1"/></p:sldMaster>')
                    elif "</p:sldLayout>" in text:
                        text = text.replace("</p:sldLayout>", '<p:hf sldNum="1" hdr="0" ftr="1" dt="1"/></p:sldLayout>')
                    elif "</p:sld>" in text:
                        text = text.replace("</p:sld>", '<p:hf sldNum="1" hdr="0" ftr="1" dt="1"/></p:sld>')
                data = text.encode("utf-8")
            zout.writestr(info, data)
    tmp.replace(path)


def build() -> Path:
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    prs.core_properties.author = COLLEGE["scholar"]
    prs.core_properties.title = COLLEGE["title"]
    prs.core_properties.subject = f"{COLLEGE['kicker']} · {COLLEGE['programme']}"
    prs.core_properties.comments = f"Automatic date {TODAY_TEXT}; slide numbers via PowerPoint slidenum field."

    style_master(prs)
    ensure_hf(prs.slide_master._element)
    for layout in prs.slide_layouts:
        ensure_hf(layout._element)

    blank = prs.slide_layouts[6]  # Blank — chrome comes from master + fields

    for index, entry in enumerate(SLIDES, start=1):
        slide = prs.slides.add_slide(blank)
        add_chrome(slide)
        background = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0.78), W, Inches(6.34))
        set_fill(background, CREAM)

        add_textbox(
            slide,
            Inches(0.4),
            Inches(0.88),
            Inches(12.5),
            Inches(0.26),
            f"{COLLEGE['kicker']}  ·  {entry.get('section') or ''}",
            size=11,
            bold=True,
            color=MAROON,
        )
        add_textbox(
            slide,
            Inches(0.4),
            Inches(1.12),
            Inches(12.5),
            Inches(0.55),
            entry["title"],
            size=22,
            bold=True,
            color=INK,
        )

        y = Inches(1.72)
        if entry.get("body"):
            add_textbox(slide, Inches(0.4), y, Inches(12.5), Inches(0.42), entry["body"], size=13, color=MUTED)
            y = Inches(2.18)

        if entry.get("kind") == "contents":
            lines = [f"{item['n']}   {item['title']}" for item in CONTENTS]
            add_bullets(slide, Inches(0.45), y, Inches(12.4), Inches(4.4), lines, size=14)
        elif entry.get("table"):
            table = entry["table"]
            add_table(slide, Inches(0.35), y, Inches(12.6), Inches(4.4), table["headers"], table["rows"])
        elif entry.get("evidence"):
            add_evidence_cards(slide, entry["evidence"], y)
        else:
            paras = entry.get("paragraphs") or []
            bullets = entry.get("bullets") or []
            diagram = entry.get("diagram")
            leftover_h = 2.05 if diagram and diagram != "none" else 4.35
            texts = paras + bullets
            if texts:
                add_bullets(slide, Inches(0.4), y, Inches(12.5), Inches(leftover_h), texts, size=13)
            if diagram and diagram != "none":
                add_diagram(slide, diagram, Inches(4.85))
            if entry.get("footnote"):
                add_textbox(
                    slide,
                    Inches(0.4),
                    Inches(6.78),
                    Inches(12.5),
                    Inches(0.28),
                    entry["footnote"],
                    size=10,
                    color=MUTED,
                )

        ensure_hf(slide._element)
        inject_slide_fields(slide, index)

    out_dir = ROOT / "docs/slides"
    public = ROOT / "public"
    out_dir.mkdir(parents=True, exist_ok=True)
    public.mkdir(parents=True, exist_ok=True)

    primary = out_dir / FILENAMES["pptx"]
    prs.save(primary)
    patch_package_fields(primary)

    copies = [
        public / FILENAMES["pptx"],
        out_dir / FILENAMES["templateCopy"],
        public / FILENAMES["templateCopy"],
        ROOT / FILENAMES["templateCopy"],
        ROOT / FILENAMES["pptx"],
    ]
    for dest in copies:
        shutil.copyfile(primary, dest)

    zip_path = public / FILENAMES["pptx"].replace(".pptx", ".zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(primary, arcname=FILENAMES["pptx"])
        zf.write(out_dir / FILENAMES["templateCopy"], arcname=FILENAMES["templateCopy"])
    shutil.copyfile(zip_path, out_dir / zip_path.name)

    print(f"wrote {primary} ({primary.stat().st_size} bytes)")
    print(f"date field cache: {TODAY_TEXT}; slide-number field: slidenum")
    print(f"copies: {FILENAMES['pptx']} and {FILENAMES['templateCopy']}")
    return primary


if __name__ == "__main__":
    build()
