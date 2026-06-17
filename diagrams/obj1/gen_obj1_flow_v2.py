"""
Obj1 Algorithm Flow — SessionRerank+
White background, 300 DPI, clear step numbers, arrows, data labels
Professional CS/engineering style — no biological terms
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import matplotlib.patheffects as pe

# ── Colour Palette (white background, Ramaiah-aligned) ──
BG      = '#FFFFFF'
PURPLE  = '#3C2864'   # Ramaiah deep purple — headers
RED     = '#C8402A'   # Ramaiah red — step badges
BLUE    = '#1565C0'   # step body accent
LIGHT1  = '#EDE7F6'   # obj1 step bg
LIGHT2  = '#E3F2FD'   # data flow bg
GREEN   = '#1B5E20'   # output
GBG     = '#E8F5E9'   # output bg
TEXT    = '#1A1035'   # body text
ARROW   = '#3C2864'   # arrow colour
STEP_BG = '#F3E5F5'   # step interior

fig, ax = plt.subplots(figsize=(14, 18))
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 14)
ax.set_ylim(0, 18)
ax.axis('off')

def rbox(ax, x, y, w, h, fc, ec, lw=2.0, radius=0.2):
    box = FancyBboxPatch((x, y), w, h,
        boxstyle=f"round,pad=0.05",
        facecolor=fc, edgecolor=ec, linewidth=lw, zorder=3)
    ax.add_patch(box)

def step_badge(ax, x, y, num, color=RED):
    badge = FancyBboxPatch((x, y), 0.72, 0.38,
        boxstyle="round,pad=0.05",
        facecolor=color, edgecolor='none', zorder=5)
    ax.add_patch(badge)
    ax.text(x+0.36, y+0.19, num, ha='center', va='center',
        fontsize=9, fontweight='bold', color='white', zorder=6)

def arrow(ax, x, y1, y2, label='', col=ARROW):
    ax.annotate('', xy=(x, y2), xytext=(x, y1),
        arrowprops=dict(arrowstyle='->', color=col, lw=2.2,
                        mutation_scale=20, connectionstyle='arc3,rad=0'), zorder=4)
    if label:
        ax.text(x+0.15, (y1+y2)/2, label, ha='left', va='center',
            fontsize=8, color=col, style='italic', zorder=5)

def data_pill(ax, x, y, w, text, color=LIGHT2, border=BLUE):
    rbox(ax, x, y, w, 0.28, fc=color, ec=border, lw=1.2)
    ax.text(x+w/2, y+0.14, text, ha='center', va='center',
        fontsize=7.5, color=BLUE, fontweight='bold', zorder=6)

# ── Title ──
ax.text(7, 17.5, 'Objective 1 — SessionRerank+', ha='center', va='center',
    fontsize=16, fontweight='bold', color=PURPLE)
ax.text(7, 17.1, 'Session-Aware Contextual Tool Reranker Plus — Algorithm Flow', ha='center', va='center',
    fontsize=11, color=TEXT, style='italic')

# Bottom red line under title
ax.plot([0.5, 13.5], [16.85, 16.85], color=RED, lw=2.5)

# ── Legend ──
legend_y = 16.55
ax.text(0.5, legend_y+0.05, 'Legend:', fontsize=9, color=TEXT, fontweight='bold')
for i,(lc,lt) in enumerate([(RED,'Step'), (GBG,'Output'), (LIGHT2,'Data Flow')]):
    rbox(ax, 1.5+i*2.2, legend_y-0.05, 0.35, 0.28, fc=lc if lc!=GBG else GBG, ec=PURPLE, lw=1)
    ax.text(1.95+i*2.2, legend_y+0.09, lt, fontsize=8.5, color=TEXT)

# ── Steps ──
steps = [
    {
        'num': 'INPUT', 'color': LIGHT2, 'ec': BLUE,
        'title': 'INPUT: Multi-turn Query + Session History',
        'lines': [
            'Query q  (Kannada / Tamil / Hindi / Malayalam / Marathi / English)',
            'Session history  H_n  =  { (q_1,a_1), …, (q_{n-1},a_{n-1}) }',
            'API Catalogue  A  =  43,000 real-world APIs  (ToolBench dataset)',
        ],
        'data_out': 'q, H_n, A → Objective 1 pipeline',
        'y': 14.9
    },
    {
        'num': 'STEP 1', 'color': STEP_BG, 'ec': PURPLE,
        'title': 'Language Normalisation  (IndicTrans2)',
        'lines': [
            'Detect source language  lang(q)  ∈  {kn, ta, hi, ml, mr, en}',
            'If lang ≠ en:  q_en  ←  IndicTrans2( q )',
            'Output: normalised query  q_en  in English',
        ],
        'data_out': 'q_en  (English query)',
        'y': 12.85
    },
    {
        'num': 'STEP 2', 'color': STEP_BG, 'ec': PURPLE,
        'title': 'Dual-Mode Candidate Recall  (BM25 + Dense)',
        'lines': [
            'Embed:  v_q  ←  Gemma-4 encoder( q_en )',
            'Dense recall:  top-50  from  FAISS index  by  cosine( v_q, v_api )',
            'BM25 recall:  top-50  by  term-frequency score',
            'Merge & deduplicate → candidate set  C  (|C| ≤ 100)',
        ],
        'data_out': 'C  = top-100 candidate APIs',
        'y': 10.5
    },
    {
        'num': 'STEP 3', 'color': STEP_BG, 'ec': PURPLE,
        'title': 'Co-Activation Prior  φ_n  (Session Graph)',
        'lines': [
            'For each  c ∈ C:  φ_n(c)  =  Σ_{i=1}^{n-1}  γ^(n-i) · log(1 + w_{h_i, c})',
            'Decay parameter  γ = 0.7  (recent sessions weighted higher)',
            'w_{u,v}  = edge weight in co-activation graph  G',
        ],
        'data_out': 'φ_n  = session-graph prior per candidate',
        'y': 8.55
    },
    {
        'num': 'STEP 4', 'color': STEP_BG, 'ec': PURPLE,
        'title': 'Three-Term Composite Score',
        'lines': [
            'score(q, api)  =  w_s · s_n  +  w_m · m  +  w_h · φ_n',
            's_n = semantic similarity  |  m = BM25 match score',
            'Weights  w_s, w_m, w_h  learned from ToolBench validation split',
        ],
        'data_out': 'score(q, api)  for each  c ∈ C',
        'y': 6.7
    },
    {
        'num': 'STEP 5', 'color': STEP_BG, 'ec': PURPLE,
        'title': 'Rerank + Top-K Selection',
        'lines': [
            'Sort  C  by  score(q, api)  (descending)',
            'Return  Top-5  ranked APIs  →  T_5',
            'Target:  NDCG@5  ≥  0.52   (baseline  0.452)',
        ],
        'data_out': 'T_5  = top-5 ranked APIs',
        'y': 4.9
    },
    {
        'num': 'STEP 6', 'color': STEP_BG, 'ec': PURPLE,
        'title': 'Agent Dispatch + Execution',
        'lines': [
            'T_5  passed to agent dispatcher',
            'Agent executes API calls and captures result  r',
            'Success signal:  σ ∈ {0, 1}  based on task completion',
        ],
        'data_out': 'σ  (success/failure signal)',
        'y': 3.1
    },
    {
        'num': 'STEP 7', 'color': STEP_BG, 'ec': PURPLE,
        'title': 'Online Graph Edge Update',
        'lines': [
            'w_{u,v}  ←  (1 − ρ) · w_{u,v}  +  δ · 1[σ=1]',
            'ρ = 0.02  (decay),  δ = 1.0  (reward)',
            '50-session half-life; graph persists across sessions',
        ],
        'data_out': 'Updated co-activation graph  G',
        'y': 1.3
    },
]

for s in steps:
    y = s['y']
    is_input = s['num'] == 'INPUT'
    h = 1.75
    rbox(ax, 0.4, y, 13.2, h, fc=s['color'], ec=s['ec'], lw=2.0)
    # Step badge
    badge_col = BLUE if is_input else RED
    rbox(ax, 0.5, y+h-0.48, 1.2, 0.38, fc=badge_col, ec='none', lw=0)
    ax.text(1.1, y+h-0.29, s['num'], ha='center', va='center',
        fontsize=9, fontweight='bold', color='white', zorder=6)
    # Title
    ax.text(1.85, y+h-0.29, s['title'], ha='left', va='center',
        fontsize=11, fontweight='bold', color=PURPLE, zorder=5)
    # Lines
    for j, line in enumerate(s['lines']):
        ax.text(0.75, y+h-0.75-j*0.36, f'▸  {line}', ha='left', va='center',
            fontsize=9, color=TEXT, fontfamily='monospace', zorder=5)
    # Data output pill
    data_pill(ax, 0.55, y+0.04, 10.5, f'↳ Output: {s["data_out"]}')

# ── Arrows between steps ──
step_ys = [(s['y'] + 1.75, s['y'] + 1.75) for s in steps]
for i in range(len(steps)-1):
    y_from = steps[i]['y']         # bottom of step box
    y_to   = steps[i+1]['y'] + 1.75 + 0.02  # top of next box
    arrow(ax, 7.0, y_from, y_to)

# ── OUTPUT box ──
rbox(ax, 0.4, 0.15, 13.2, 0.85, fc=GBG, ec=GREEN, lw=2.5)
ax.text(7, 0.57, '★   OUTPUT:  Top-5 Ranked APIs  +  Updated Co-Activation Graph  G   ★',
    ha='center', va='center', fontsize=11, fontweight='bold', color=GREEN, zorder=6)

plt.tight_layout(pad=0.3)
plt.savefig('/home/user/workspace/diagrams/obj1/obj1_algorithm_flow.png',
    dpi=300, bbox_inches='tight', facecolor=BG)
plt.close()
print("obj1_algorithm_flow.png saved at 300 DPI")
