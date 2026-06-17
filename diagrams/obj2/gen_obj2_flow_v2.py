"""
Obj2 Algorithm Flow — APRR + CDR + PDR
White background, 300 DPI, clear step numbers, arrows, data labels
Professional CS/engineering style
"""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

BG      = '#FFFFFF'
PURPLE  = '#3C2864'
RED     = '#C8402A'
ORANGE  = '#E65100'
LIGHT   = '#FFF3E0'
LIGHT2  = '#E3F2FD'
BLUE    = '#1565C0'
GREEN   = '#1B5E20'
GBG     = '#E8F5E9'
TEXT    = '#1A1035'
STEP_BG = '#FFF8E1'

fig, ax = plt.subplots(figsize=(16, 19))
fig.patch.set_facecolor(BG)
ax.set_facecolor(BG)
ax.set_xlim(0, 16)
ax.set_ylim(0, 19)
ax.axis('off')

def rbox(ax, x, y, w, h, fc, ec, lw=2.0):
    box = FancyBboxPatch((x, y), w, h,
        boxstyle="round,pad=0.05",
        facecolor=fc, edgecolor=ec, linewidth=lw, zorder=3)
    ax.add_patch(box)

def badge(ax, x, y, text, color=RED):
    rbox(ax, x, y, 1.3, 0.38, fc=color, ec='none', lw=0)
    ax.text(x+0.65, y+0.19, text, ha='center', va='center',
        fontsize=9, fontweight='bold', color='white', zorder=6)

def arrow(ax, x, y1, y2, col=PURPLE, label=''):
    ax.annotate('', xy=(x, y2), xytext=(x, y1),
        arrowprops=dict(arrowstyle='->', color=col, lw=2.3,
                        mutation_scale=20, connectionstyle='arc3,rad=0'), zorder=4)
    if label:
        ax.text(x+0.15, (y1+y2)/2, label, ha='left', va='center',
            fontsize=8.5, color=col, style='italic', zorder=5)

def data_pill(ax, x, y, w, text, color=LIGHT2, border=BLUE):
    rbox(ax, x, y, w, 0.28, fc=color, ec=border, lw=1.2)
    ax.text(x+w/2, y+0.14, text, ha='center', va='center',
        fontsize=7.5, color=BLUE, fontweight='bold', zorder=6)

# Title
ax.text(8, 18.55, 'Objective 2 — APRR + CDR + PDR', ha='center', va='center',
    fontsize=16, fontweight='bold', color=PURPLE)
ax.text(8, 18.15, 'Adaptive Priority-aware Request Router + Context-Driven Routing + Parallel Dispatch Routing', ha='center', va='center',
    fontsize=10, color=TEXT, style='italic')
ax.plot([0.5, 15.5], [17.9, 17.9], color=RED, lw=2.5)

steps = [
    {
        'num': 'INPUT', 'color': LIGHT2, 'ec': BLUE,
        'title': 'INPUT: Ranked Tool Candidates from Objective 1',
        'lines': [
            'T_5  = top-5 ranked APIs from SessionRerank+  (Obj 1)',
            'Session context  H_n  = history of agent actions',
            'Online weight matrix  W  (updated across routing rounds)',
        ],
        'data_out': 'T_5, H_n, W  →  APRR routing pipeline',
        'y': 16.35
    },
    {
        'num': 'STEP 1', 'color': STEP_BG, 'ec': ORANGE,
        'title': 'Priority Scoring  (APRR)',
        'lines': [
            'For each agent  a_j:  score_j  =  W[q, a_j]  ·  context_fit(H_n, a_j)',
            'W[q, a_j] = online RL weight;  context_fit = cosine(H_n embedding, a_j profile)',
            'Compute priority vector  P  =  [score_1, …, score_K]',
        ],
        'data_out': 'Priority vector  P  over  K  agents',
        'y': 14.3
    },
    {
        'num': 'STEP 2', 'color': '#FBE9E7', 'ec': '#BF360C',
        'title': 'CDR: Context-Driven Routing  (Deliberation Gate)',
        'lines': [
            'If  max(P) ≥ θ_CDR:  direct-route to  a* = argmax(P)  (single best agent)',
            'If  max(P) < θ_CDR:  escalate to PDR for parallel dispatch  (uncertainty)',
            'CDR threshold  θ_CDR  = 0.72  (calibrated on ToolBench validation)',
        ],
        'data_out': 'Route decision:  DIRECT → a*   OR   PARALLEL → PDR',
        'y': 12.25
    },
    {
        'num': 'STEP 3', 'color': '#F3E5F5', 'ec': '#6A1B9A',
        'title': 'PDR: Parallel Dispatch Routing  (Multi-Agent Fan-out)',
        'lines': [
            'Select top-M agents by  P  (M = 3 by default)',
            'Dispatch query to  a_1, a_2, …, a_M  in parallel threads',
            'Collect responses  R = {r_1, …, r_M}  with timeout  T = 265ms',
        ],
        'data_out': 'Response set  R  from  M  agents',
        'y': 10.2
    },
    {
        'num': 'STEP 4', 'color': '#E8F5E9', 'ec': GREEN,
        'title': 'Borda Consensus Aggregation',
        'lines': [
            'Score each response:  borda_j = Σ_i rank_i(r_j)  (cross-agent ranking)',
            'Final answer  r*  ←  argmax_j borda_j',
            'Ties broken by  P  priority score',
        ],
        'data_out': 'Final response  r*  (consensus answer)',
        'y': 8.2
    },
    {
        'num': 'STEP 5', 'color': STEP_BG, 'ec': ORANGE,
        'title': 'Latency Gate  (SLA Enforcement)',
        'lines': [
            'If  latency(r*) ≤ 265ms:  PASS  →  continue to reward',
            'If  latency(r*) > 265ms:  FALLBACK  →  return best partial result',
            'SLA target:  ≤ 265ms  end-to-end wall-clock time',
        ],
        'data_out': 'r*  validated against latency SLA',
        'y': 6.2
    },
    {
        'num': 'STEP 6', 'color': STEP_BG, 'ec': ORANGE,
        'title': 'Online RL Weight Update',
        'lines': [
            'Reward  σ = 1  if task success,  σ = 0  otherwise',
            'W[q, a*]  ←  W[q, a*]  +  α · (σ  −  W[q, a*])',
            'Learning rate  α = 0.05;  W  decays 1% per unused round',
        ],
        'data_out': 'Updated weight matrix  W',
        'y': 4.2
    },
    {
        'num': 'STEP 7', 'color': STEP_BG, 'ec': ORANGE,
        'title': 'Feedback to Obj 3  (MNCD Context Update)',
        'lines': [
            'Successful response  r*  +  routing decision  →  context delta  ΔC',
            'ΔC  broadcast to MNCD mesh nodes  (Objective 3)',
            'CDR quality signal  q_cdr  emitted for mesh edge-weight update',
        ],
        'data_out': 'ΔC, q_cdr  →  Objective 3 (MNCD)',
        'y': 2.2
    },
]

for s in steps:
    y = s['y']
    is_input = s['num'] == 'INPUT'
    h = 1.8
    rbox(ax, 0.4, y, 15.2, h, fc=s['color'], ec=s['ec'], lw=2.0)
    badge_col = BLUE if is_input else RED
    badge(ax, 0.55, y+h-0.5, s['num'], color=badge_col)
    ax.text(2.05, y+h-0.31, s['title'], ha='left', va='center',
        fontsize=11, fontweight='bold', color=PURPLE, zorder=5)
    for j, line in enumerate(s['lines']):
        ax.text(0.75, y+h-0.8-j*0.36, f'▸  {line}', ha='left', va='center',
            fontsize=9, color=TEXT, fontfamily='monospace', zorder=5)
    data_pill(ax, 0.6, y+0.04, 12.0, f'↳ Output: {s["data_out"]}')

# Arrows between steps
for i in range(len(steps)-1):
    y_from = steps[i]['y']
    y_to   = steps[i+1]['y'] + 1.80 + 0.02
    arrow(ax, 8.0, y_from, y_to)

# CDR vs PDR branch arrow (visual hint)
cdr_y = steps[2]['y'] + 0.9
ax.annotate('', xy=(2.5, steps[2]['y']-0.55), xytext=(2.5, cdr_y-0.1),
    arrowprops=dict(arrowstyle='->', color='#BF360C', lw=1.5,
                    mutation_scale=16, connectionstyle='arc3,rad=0.3'), zorder=4)
ax.text(1.8, cdr_y-0.3, 'DIRECT', fontsize=8, color='#BF360C', fontweight='bold')

ax.annotate('', xy=(13.5, steps[3]['y'] + 1.85), xytext=(13.5, cdr_y-0.1),
    arrowprops=dict(arrowstyle='->', color='#6A1B9A', lw=1.5,
                    mutation_scale=16, connectionstyle='arc3,rad=-0.3'), zorder=4)
ax.text(13.6, cdr_y-0.3, 'PARALLEL', fontsize=8, color='#6A1B9A', fontweight='bold')

# OUTPUT
rbox(ax, 0.4, 0.15, 15.2, 0.85, fc=GBG, ec=GREEN, lw=2.5)
ax.text(8, 0.57, '★   OUTPUT:  Final Response r*  +  Updated Weight Matrix W  +  Context Delta ΔC   ★',
    ha='center', va='center', fontsize=11, fontweight='bold', color=GREEN, zorder=6)

plt.tight_layout(pad=0.3)
plt.savefig('/home/user/workspace/diagrams/obj2/obj2_algorithm_flow.png',
    dpi=300, bbox_inches='tight', facecolor=BG)
plt.close()
print("obj2_algorithm_flow.png saved at 300 DPI")
