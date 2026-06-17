"""
Inject speaker notes directly into PPTX XML.
Reads speaker_script.md, parses per-slide notes, then writes them
into ppt/notesSlides/notesSlideN.xml in the PPTX zip.
"""
import re, zipfile, shutil, os
from lxml import etree

SCRIPT_PATH = '/home/user/workspace/presentation/speaker_script.md'
PPTX_PATH   = '/home/user/workspace/presentation/ACRS_PhD_Proposal_v3.pptx'
PPTX_OUT    = '/home/user/workspace/presentation/ACRS_PhD_Proposal_v3.pptx'

# ── 1. Parse speaker script ───────────────────────────────────────────────────
with open(SCRIPT_PATH, 'r') as f:
    raw = f.read()

sections = re.split(r'\n## Slide (\d+)', raw)
notes = {}
it = iter(sections[1:])
for num_str, content in zip(it, it):
    n = int(num_str)
    text = content.strip()
    text = re.sub(r'^---+\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\[(.*?)\]\(.*?\)', r'\1', text)
    text = re.sub(r'`(.*?)`', r'\1', text)
    lines_list = [l.rstrip() for l in text.splitlines()]
    while lines_list and not lines_list[0]: lines_list.pop(0)
    while lines_list and not lines_list[-1]: lines_list.pop()
    notes[n] = '\n'.join(lines_list)

print(f"Parsed notes for {len(notes)} slides.")

# ── 2. Inject into PPTX ───────────────────────────────────────────────────────
# Work on a temp copy
tmp = PPTX_PATH + '.tmp'
shutil.copy2(PPTX_PATH, tmp)

NSMAP = {
    'a':   'http://schemas.openxmlformats.org/drawingml/2006/main',
    'p':   'http://schemas.openxmlformats.org/presentationml/2006/main',
    'r':   'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
}

def make_notes_body(text):
    """Build a <p:txBody> element with the notes text, one <a:p> per paragraph."""
    ns_p = 'http://schemas.openxmlformats.org/presentationml/2006/main'
    ns_a = 'http://schemas.openxmlformats.org/drawingml/2006/main'

    txBody = etree.Element(f'{{{ns_p}}}txBody')
    # Required bodyPr
    bodyPr = etree.SubElement(txBody, f'{{{ns_a}}}bodyPr')
    # lstStyle
    etree.SubElement(txBody, f'{{{ns_a}}}lstStyle')

    paragraphs = text.split('\n')
    for para in paragraphs:
        p_elem = etree.SubElement(txBody, f'{{{ns_a}}}p')
        if para.strip():
            r_elem = etree.SubElement(p_elem, f'{{{ns_a}}}r')
            rPr = etree.SubElement(r_elem, f'{{{ns_a}}}rPr', attrib={'lang': 'en-US', 'dirty': '0'})
            t_elem = etree.SubElement(r_elem, f'{{{ns_a}}}t')
            t_elem.text = para
        # else: empty paragraph = blank line
    return txBody

injected = 0
with zipfile.ZipFile(tmp, 'r') as zin:
    names = zin.namelist()
    contents = {}
    for name in names:
        contents[name] = zin.read(name)

# Find how many notesSlides we have
notes_files = sorted([n for n in names if n.startswith('ppt/notesSlides/notesSlide') and n.endswith('.xml')])
print(f"Found {len(notes_files)} notesSlide files: {[os.path.basename(f) for f in notes_files[:5]]}...")

# Determine slide-to-notesSlide mapping
# pptxgenjs creates notesSlide1 for slide1, etc. But we need to verify.
# Check ppt/slides/_rels/slide1.xml.rels for the notes relationship
for slide_num in range(1, 40):
    slide_rels_path = f'ppt/slides/_rels/slide{slide_num}.xml.rels'
    if slide_rels_path not in contents:
        print(f"  Slide {slide_num}: no rels file — skip")
        continue

    rels_xml = contents[slide_rels_path]
    rels_tree = etree.fromstring(rels_xml)
    notes_target = None
    for rel in rels_tree:
        rt = rel.get('Type', '')
        if 'notesSlide' in rt:
            notes_target = rel.get('Target', '')
            break

    if not notes_target:
        # No notes relationship yet — skip (notes exist but may be empty)
        pass

    # Find the notesSlide file name
    # notes_target is like '../notesSlides/notesSlideN.xml'
    if notes_target:
        ns_filename = os.path.basename(notes_target)  # e.g. notesSlide1.xml
        ns_path = f'ppt/notesSlides/{ns_filename}'
    else:
        # Default assumption: notesSlide{slide_num}.xml
        ns_path = f'ppt/notesSlides/notesSlide{slide_num}.xml'

    if ns_path not in contents:
        print(f"  Slide {slide_num}: notesSlide not found at {ns_path}")
        continue

    if slide_num not in notes:
        print(f"  Slide {slide_num}: no notes text — skip")
        continue

    # Parse the notes slide XML
    ns_xml = contents[ns_path]
    tree = etree.fromstring(ns_xml)

    ns_p = 'http://schemas.openxmlformats.org/presentationml/2006/main'
    ns_a = 'http://schemas.openxmlformats.org/drawingml/2006/main'

    # Find the notes text body (sp with idx=1, or the second sp element)
    # Notes slide has two sp: [0]=slide thumbnail placeholder, [1]=notes text area
    spTree = tree.find(f'.//{{{ns_p}}}cSld/{{{ns_p}}}spTree')
    if spTree is None:
        spTree = tree.find(f'.//{{{ns_a}}}spTree')
    if spTree is None:
        # Try direct search
        all_sp = tree.findall(f'.//{{{ns_p}}}sp')
        if not all_sp:
            print(f"  Slide {slide_num}: no sp elements found")
            continue
    else:
        all_sp = spTree.findall(f'{{{ns_p}}}sp')

    # Notes body is usually the sp with ph idx=1 (body placeholder)
    notes_sp = None
    for sp in all_sp:
        ph = sp.find(f'.//{{{ns_p}}}ph')
        if ph is not None:
            idx = ph.get('idx', '0')
            typ = ph.get('type', '')
            if idx == '1' or typ == 'body':
                notes_sp = sp
                break
    if notes_sp is None and len(all_sp) >= 2:
        notes_sp = all_sp[1]  # fallback: second sp

    if notes_sp is None:
        print(f"  Slide {slide_num}: could not find notes sp")
        continue

    # Find or create txBody in notes_sp
    txBody = notes_sp.find(f'{{{ns_p}}}txBody')
    if txBody is None:
        txBody = notes_sp.find(f'.//{{{ns_a}}}txBody')

    if txBody is None:
        print(f"  Slide {slide_num}: no txBody — skip")
        continue

    # Clear existing paragraphs (keep bodyPr and lstStyle)
    # Remove all a:p elements
    for p_elem in txBody.findall(f'{{{ns_a}}}p'):
        txBody.remove(p_elem)

    # Add new paragraphs
    note_text = notes[slide_num]
    paragraphs = note_text.split('\n')
    for para in paragraphs:
        p_elem = etree.SubElement(txBody, f'{{{ns_a}}}p')
        if para.strip():
            r_elem = etree.SubElement(p_elem, f'{{{ns_a}}}r')
            rPr = etree.SubElement(r_elem, f'{{{ns_a}}}rPr',
                                   attrib={'lang': 'en-US', 'dirty': '0', 'sz': '1200'})
            t_elem = etree.SubElement(r_elem, f'{{{ns_a}}}t')
            t_elem.text = para

    # Serialize back
    contents[ns_path] = etree.tostring(tree, xml_declaration=True,
                                       encoding='UTF-8', standalone=True)
    injected += 1

print(f"\nInjected notes into {injected} slides.")

# Write output PPTX
with zipfile.ZipFile(PPTX_OUT, 'w', zipfile.ZIP_DEFLATED) as zout:
    for name, data in contents.items():
        zout.writestr(name, data)

print(f"Saved: {PPTX_OUT}")
os.remove(tmp)
