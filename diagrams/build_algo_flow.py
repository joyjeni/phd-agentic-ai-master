import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import numpy as np

fig, ax = plt.subplots(figsize=(20, 34))
ax.set_xlim(0, 20)
ax.set_ylim(0, 34)
ax.axis('off')
fig.patch.set_facecolor('#0a0e1a')
ax.set_facecolor('#0a0e1a')

# ─── Palette ────────────────────────────────────────────────────────────────
BG    = '#0a0e1a'
PANEL = '#111827'
C1    = '#38bdf8'   # Obj1 – sky blue
C2    = '#fb923c'   # Obj2 – orange
C3    = '#4ade80'   # Obj3 – green
C4    = '#c084fc'   # Obj4 – purple
GOLD  = '#fbbf24'   # output / TN CM
DATA  = '#34d399'   # data.gov.in
WHITE = '#f1f5f9'
DIM   = '#64748b'
MONO  = '#94a3b8'

# ─── Helpers ────────────────────────────────────────────────────────────────
def glow_box(ax, x, y, w, h, color, fc=PANEL, lw=2.5, r=0.3, glow=True, z=3):
    if glow:
        for expand, alpha in [(0.18, 0.08), (0.10, 0.14), (0.04, 0.22)]:
            g = FancyBboxPatch((x-expand, y-expand), w+2*expand, h+2*expand,
                boxstyle=f"round,pad=0,rounding_size={r+expand}",
                linewidth=0, facecolor=color, alpha=alpha, zorder=z-1)
            ax.add_patch(g)
    p = FancyBboxPatch((x,y), w, h,
        boxstyle=f"round,pad=0.04,rounding_size={r}",
        linewidth=lw, edgecolor=color, facecolor=fc, zorder=z)
    ax.add_patch(p)

def pill(ax, cx, cy, text, color, w=3.6, h=0.42, z=6):
    glow_box(ax, cx-w/2, cy-h/2, w, h, color, fc=color+'33', lw=1.5, r=0.2, glow=False, z=z)
    ax.text(cx, cy, text, fontsize=7.5, color=color, fontweight='bold',
            ha='center', va='center', zorder=z+1)

def t(ax, x, y, s, sz=9, c=WHITE, w='normal', ha='center', va='center', z=5, mono=False):
    ff = 'monospace' if mono else 'DejaVu Sans'
    ax.text(x, y, s, fontsize=sz, color=c, fontweight=w, ha=ha, va=va,
            zorder=z, fontfamily=ff)

def down_arrow(ax, x, y1, y2, color, lw=2.5, label='', label_x_offset=0.3):
    ax.annotate('', xy=(x, y2), xytext=(x, y1),
        arrowprops=dict(arrowstyle='->', color=color, lw=lw,
                        mutation_scale=18,
                        connectionstyle='arc3,rad=0'), zorder=4)
    if label:
        mx = (y1+y2)/2
        t(ax, x+label_x_offset+0.6, mx, label, sz=7.5, c=color, ha='left')

def right_arrow(ax, x1, x2, y, color, lw=2, label='', label_y=0.2):
    ax.annotate('', xy=(x2, y), xytext=(x1, y),
        arrowprops=dict(arrowstyle='->', color=color, lw=lw,
                        mutation_scale=16), zorder=4)
    if label:
        t(ax, (x1+x2)/2, y+label_y, label, sz=7, c=color)

# ─── TITLE ──────────────────────────────────────────────────────────────────
t(ax,10,33.3,'Agentic AI Tool Selection System',sz=18,c=WHITE,w='bold')
t(ax,10,32.75,'Algorithmic Flow  —  4 Integrated PhD Objectives',sz=11,c=DIM)
t(ax,10,32.3,'Jenisha T  |  PhD, CSE  |  MS Ramaiah University  |  Abigail Creations',sz=8.5,c=DIM)

# horizontal divider
ax.plot([0.5,19.5],[32.05,32.05],color='#1e293b',lw=1.5,zorder=2)

# ─── INPUT ROW ──────────────────────────────────────────────────────────────
# Farmer query box
glow_box(ax,0.4,29.8,8.6,1.85,C1,fc='#0c1a2e')
t(ax,4.7,31.32,'FARMER QUERY INPUT',sz=9,c=C1,w='bold')
t(ax,4.7,30.95,'"Tomato price today? / \u0b87\u0ba9\u0bcd\u0bb1\u0bc1 \u0ba4\u0b95\u0bcd\u0b95\u0bbe\u0bb3\u0bbf \u0bb5\u0bbf\u0bb2\u0bc8? / \u0c87\u0c02\u0c21\u0c41 \u0c1f\u0c2e\u0c3e\u0c1f\u0c3e \u0c27\u0c30 \u0c0f\u0c2e\u0c3f\u0c1f\u0c3f?"',
         sz=7.5,c=WHITE)
t(ax,4.7,30.58,
  'Tamil  \u2022  Kannada  \u2022  Malayalam  \u2022  Hindi  \u2022  Marathi  \u2022  English',
  sz=8,c=MONO)
t(ax,4.7,30.15,'IndicTrans2 (AI4Bharat)  \u2192  English  \u2192  Pipeline  \u2192  IndicTrans2  \u2192  Response',
  sz=7.5,c=DIM)

# data.gov.in box
glow_box(ax,9.8,29.8,9.8,1.85,DATA,fc='#0a1e14')
t(ax,14.7,31.32,'data.gov.in  Real-Time API Feed',sz=9,c=DATA,w='bold')
t(ax,14.7,30.95,
  'Resource: 9ef84268-d588-465a-a308-a864a43d0070',sz=7.5,c=MONO,mono=True)
t(ax,14.7,30.58,
  'Mandi Prices  \u2022  PM-KISAN  \u2022  AGMARKNET  \u2022  PMFBY',sz=8,c=WHITE)
t(ax,14.7,30.15,
  'Tamil Nadu  \u2022  Karnataka  \u2022  Kerala  \u2022  Maharashtra  |  9,655+ records',
  sz=7.5,c=DIM)

# arrow down from farmer
down_arrow(ax, 4.7, 29.8, 29.0, C1, label='query + profile', label_x_offset=-4.8)
# arrow down from data.gov.in
down_arrow(ax, 14.7, 29.8, 29.0, DATA, label='live catalogue', label_x_offset=0.3)

# ─── OBJECTIVE 1 ────────────────────────────────────────────────────────────
Y1 = 24.9
glow_box(ax,0.4,Y1,19.2,3.85,C1,fc='#071525')

# left: algo text
t(ax,1.0,28.35,'OBJECTIVE 1',sz=8,c=C1,w='bold',ha='left')
t(ax,1.0,27.95,'SessionRerank+',sz=13,c=WHITE,w='bold',ha='left')
t(ax,1.0,27.55,'Session-Aware Tool Retrieval',sz=9,c=DIM,ha='left')

t(ax,1.1,27.1,'score(q, api)  =  w\u2099 \u00b7 s\u2099  +  w\u2098 \u00b7 m  +  w\u2099 \u00b7 \u03c6\u2099',
  sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,26.68,'\u03c6\u2099  =  \u03a3  \u03b3^(n-i) \u00b7 log(1 + w_{h\u1d62, v})',
  sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,26.26,'w_{u,v}  \u2190  (1-\u03c1) \u00b7 w_{u,v}  +  \u03b4 \u00b7 1[success]',
  sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,25.88,'\u03c1=0.02  \u03b4=1.0  \u03b3=0.7   |   50-session half-life',
  sz=7.5,c=DIM,ha='left')

# right: pills + tags
pill(ax,15.5,28.35,'NDCG@5  +14.7% vs Dense',C1,w=4.6)
pill(ax,15.5,27.8,'Hit@5  +8.5%  |  G1/G2/G3  p<1e-4',C1,w=4.6)
pill(ax,15.5,27.25,'HF Space: LIVE  (Gemma 4)',C1,w=4.6)

t(ax,12.8,26.68,
  'Novel: First session-aware co-activation cache',sz=8.5,c=WHITE,ha='left',w='bold')
t(ax,12.8,26.3,
  'api_a \u2192 api_b transition reinforcement within session',sz=8,c=DIM,ha='left')
t(ax,12.8,25.95,
  'github.com/joyjeni/session-aware-toolbench-rerank',sz=7.5,c=C1,ha='left')

# divider inside box
ax.plot([12.5,12.5],[Y1+0.15,Y1+3.7],color=C1+'44',lw=1,zorder=4)

down_arrow(ax, 10.0, Y1, Y1-0.85, C1,
           label='Session priority score  \u2192  biases APRR W matrix', label_x_offset=0.4)

# ─── OBJECTIVE 2 (tall, contains CDR + PDR) ──────────────────────────
Y2 = 18.35
glow_box(ax,0.4,Y2,19.2,5.65,C2,fc='#1a0f05')

t(ax,1.0,23.6,'OBJECTIVE 2',sz=8,c=C2,w='bold',ha='left')
t(ax,1.0,23.15,'APRR  +  CDR  +  PDR',sz=13,c=WHITE,w='bold',ha='left')
t(ax,1.0,22.72,'Adaptive Multi-Agent LLM Routing',sz=9,c=DIM,ha='left')

t(ax,1.1,22.25,'P(a\u2c7c | a\u1d62, q)  \u221d  W\u1d62\u2c7c\u207f  \u00b7  \u03b7\u1d62\u2c7c\u1d5d  \u00b7  \u03c8\u2c7c(q)\u02b8',
  sz=9.5,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,21.82,'W  \u2190  (1-\u03bb) \u00b7 W  +  \u03ba \u00b7 1[success] / (L\u00b2 \u00b7 lat\u2099\u2092\u02b3\u2098)',
  sz=9.5,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,21.42,'\u03b1=2.0  \u03b2=1.0  \u03b3=2.5  \u03bb=0.005  \u03ba=5.0  \u03b5=0.15',
  sz=7.5,c=DIM,ha='left')

# CDR sub-box
glow_box(ax,0.7,18.6,8.8,2.55,GOLD,fc='#1a1505',lw=1.8,r=0.2)
t(ax,5.1,20.82,'CDR  \u2014  Context-Driven Routing',sz=9,c=GOLD,w='bold')
t(ax,1.0,20.42,'\u0394W  *=  (1 + \u03b2 \u00b7 \u03c1(T_q))',sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.0,20.05,'complexity(q) \u2265 \u03b8  \u2192  CoT deliberation round',sz=8,c=WHITE,ha='left')
t(ax,1.0,19.68,'reasoning-quality-weighted W update',sz=8,c=DIM,ha='left')
t(ax,1.0,19.3,'interpretable per-query trace + confidence score',sz=7.5,c=DIM,ha='left')
t(ax,1.0,18.92,'Novel: First CoT quality-weighted routing affinity',sz=7.5,c=GOLD,ha='left',w='bold')

# PDR sub-box
glow_box(ax,9.9,18.6,9.4,2.55,GOLD,fc='#1a1505',lw=1.8,r=0.2)
t(ax,14.6,20.82,'PDR  \u2014  Parallel Dispatch Routing',sz=9,c=GOLD,w='bold')
t(ax,10.1,20.42,'<route_k>  functional token dispatch',sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,10.1,20.05,'Layer 1: brain \u2192 functional token \u2192 arm',sz=8,c=WHITE,ha='left')
t(ax,10.1,19.68,'Layer 2: arm W_local routing (per-domain)',sz=8,c=DIM,ha='left')
t(ax,10.1,19.3,'Confidence-signal 1-bit confidence signals',sz=7.5,c=DIM,ha='left')
t(ax,10.1,18.92,'Novel: -22% latency via direct functional-token dispatch',sz=7.5,c=GOLD,ha='left',w='bold')

# results pills
pill(ax,5.0,23.6,'35.7% latency reduction',C2,w=4.2)
pill(ax,5.0,23.1,'Pareto-optimal  success=0.470',C2,w=4.2)
pill(ax,13.5,23.6,'Vercel Dashboard: LIVE',C2,w=3.8)
pill(ax,13.5,23.1,'23.9% hop reduction',C2,w=3.8)

t(ax,12.8,22.25,
  'Novel: First REINFORCE-equiv decay-regularised router',sz=8.5,c=WHITE,ha='left',w='bold')
t(ax,12.8,21.82,
  'Proposition 1: REINFORCE-equivalence under stated conditions',sz=8,c=DIM,ha='left')
t(ax,12.8,21.42,
  'github.com/joyjeni/aprr-multi-agent-routing',sz=7.5,c=C2,ha='left')
ax.plot([12.5,12.5],[Y2+0.15,Y2+5.5],color=C2+'44',lw=1,zorder=4)

down_arrow(ax, 10.0, Y2, Y2-0.85, C2,
           label='Routing decision + confidence score', label_x_offset=0.4)

# ─── OBJECTIVE 3 ────────────────────────────────────────────────────────────
Y3 = 12.7
glow_box(ax,0.4,Y3,19.2,4.8,C3,fc='#071510')

t(ax,1.0,17.1,'OBJECTIVE 3',sz=8,c=C3,w='bold',ha='left')
t(ax,1.0,16.67,'MNCD  Mesh Agents',sz=13,c=WHITE,w='bold',ha='left')
t(ax,1.0,16.25,'Decentralized Context Sharing Mesh',sz=9,c=DIM,ha='left')

t(ax,1.1,15.78,'w(p,q)  =  \u03b1 \u00b7 s_pq  +  (1-\u03b1) \u00b7 1/(1 + \u2113_pq)   [\u03b1=0.3]',
  sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,15.35,'t\u0302(q)  =  argmax\u209c  \u03a3\u1d62  c\u1d62 \u00b7 (m\u1d62 - rank\u1d62(t) + 1)',
  sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,14.92,'distress: c_local < \u03c4=0.55  \u2192  broadcast help request',
  sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,14.52,'Gossip: E[T_diff] = O(log N) w.h.p  |  R=3 replication  |  \u03c6*=8 failure detect',
  sz=7.5,c=DIM,ha='left')

# results pills
pill(ax,15.8,17.1,'97.5% accuracy (5-agent mesh)',C3,w=4.8)
pill(ax,15.8,16.55,'97.0% with 2/5 agents dead',C3,w=4.8)
pill(ax,15.8,16.0,'vs 44.0% single-agent baseline',C3,w=4.8)

t(ax,12.8,15.78,
  'Novel: First pub/sub+gossip+R=3+distress in one LLM stack',sz=8.5,c=WHITE,ha='left',w='bold')
t(ax,12.8,15.35,
  'Models: gemma-2-2b-it  |  Qwen2.5-7B  |  Llama-3.1-8B',sz=8,c=DIM,ha='left')
t(ax,12.8,14.95,
  'TN/KA/KL APMC S5=93.3%  |  Kaggle: mncd_mesh.ipynb',sz=7.5,c=C3,ha='left')
t(ax,12.8,14.55,
  'github.com/joyjeni/mncd-mesh-agents',sz=7.5,c=C3,ha='left')

ax.plot([12.5,12.5],[Y3+0.15,Y3+4.65],color=C3+'44',lw=1,zorder=4)

# CDR distress arrow (Obj2 -> Obj3, right side)
ax.annotate('', xy=(19.4, Y3+3.8), xytext=(19.4, Y2+0.5),
    arrowprops=dict(arrowstyle='->', color=C2+'cc', lw=1.5,
                    connectionstyle='arc3,rad=0'), zorder=4)
t(ax,19.6,19.85,'CDR neg-quality\n\u2192 distress signal',sz=7,c=C2,ha='left',va='center')

down_arrow(ax, 10.0, Y3, Y3-0.85, C3,
           label='Mesh context + Borda consensus', label_x_offset=0.4)

# ─── OBJECTIVE 4 ────────────────────────────────────────────────────────────
Y4 = 7.2
glow_box(ax,0.4,Y4,19.2,5.15,C4,fc='#0d0518')

t(ax,1.0,11.95,'OBJECTIVE 4',sz=8,c=C4,w='bold',ha='left')
t(ax,1.0,11.52,'FCNP  Context Pruning',sz=13,c=WHITE,w='bold',ha='left')
t(ax,1.0,11.1,'Flow-Based Context Network Pruning  (Kirchhoff / FlowNetwork analog)',sz=9,c=DIM,ha='left')

t(ax,1.1,10.62,'L(D) \u00b7 p  =  I        (Kirchhoff potential field)',
  sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,10.2,'D\u1d62\u2c7c(t+1)  =  (1-\u03bc) \u00b7 D\u1d62\u2c7c  +  \u03b1 \u00b7 |Q\u1d62\u2c7c|^\u03b3     [\u03bc=0.10]',
  sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,9.78,'\u03a3|D(t+1)-D(t)|  <  \u03b5 \u00b7 \u03a3D(t)    [\u03b5=1e-4, max_iter=200]',
  sz=9,c=MONO,ha='left',mono=True,w='bold')
t(ax,1.1,9.38,'A\u1d62\u2c7c = max(0, cos(x\u1d62,x\u2c7c)-\u03c4)  [\u03c4=0.30]  |  sink coupling m\u1d62 \u221d cos(x\u1d62, q)',
  sz=7.5,c=DIM,ha='left')
t(ax,1.1,8.98,'mandi table 50 records  \u2192  FCNP prune  \u2192  top 5 relevant  \u2192  LLM token budget',
  sz=7.5,c=DIM,ha='left')

# 7 baselines
t(ax,1.1,8.55,'7 Baselines: NoCompress  Random  TopK  BM25  DenseTopK  SelectiveCtx  LLMLingua',
  sz=7.5,c=DIM,ha='left')

# results pills
pill(ax,16.0,11.95,'10:1 compression',C4,w=4.2)
pill(ax,16.0,11.4,'F1@K p<0.05  all baselines',C4,w=4.2)
pill(ax,16.0,10.85,'>= 99% citation accuracy',C4,w=4.2)

t(ax,12.8,10.62,
  'Novel: First Kirchhoff flow-reinforcement context compression',sz=8.5,c=WHITE,ha='left',w='bold')
t(ax,12.8,10.2,
  'Global flow-coupled optimisation vs per-item ranking',sz=8,c=DIM,ha='left')
t(ax,12.8,9.78,
  'PDR route label gates domain-specific pruning',sz=8,c=DIM,ha='left')
t(ax,12.8,9.38,
  'Dashboard: Vercel  |  Kaggle: fcnp_toolbench_benchmark.ipynb',sz=7.5,c=C4,ha='left')
t(ax,12.8,8.98,
  'github.com/joyjeni/fcnp-context-pruning',sz=7.5,c=C4,ha='left')

ax.plot([12.5,12.5],[Y4+0.15,Y4+5.0],color=C4+'44',lw=1,zorder=4)

# PDR -> Obj4 arrow (right side)
# PDR domain-gated pruning signal (removed stray arc — routing noted via text label below)

# feedback arrow: Obj4 -> Obj1 (left side)
ax.annotate('', xy=(0.1, 26.7), xytext=(0.1, Y4+2.5),
    arrowprops=dict(arrowstyle='->', color=C4+'cc', lw=2.0,
                    connectionstyle='arc3,rad=0'), zorder=4)
t(ax,0.05,20.2,'Pruned\nContext\nFeedback',sz=7.5,c=C4,ha='center',va='center')

down_arrow(ax, 10.0, Y4, Y4-0.85, GOLD,
           label='Ranked tools + route + consensus + pruned context', label_x_offset=0.4)

# ─── OUTPUT ─────────────────────────────────────────────────────────────────
Y5 = 4.5
glow_box(ax,0.4,Y5,19.2,2.45,GOLD,fc='#1a1405')
t(ax,10.0,6.6,'UNIFIED SYSTEM OUTPUT',sz=11,c=GOLD,w='bold')
t(ax,10.0,6.18,
  '"Coimbatore APMC: \u0ba4\u0b95\u0bcd\u0b95\u0bbe\u0bb3\u0bbf  \u2014  Min \u20b94,200  |  Max \u20b95,600  |  Modal \u20b94,800 / qt  (17 Jun 2026)"',
  sz=9,c=WHITE)
t(ax,10.0,5.78,
  'Source: data.gov.in AGMARKNET  |  Confidence: 0.94  |  Route: PDR <route_1> \u2192 MarketAgent  |  2 hops',
  sz=8,c=DIM)
t(ax,10.0,5.38,
  'Context compressed: 52 records \u2192 5  |  Mesh consensus: 5/5 agents agreed  |  Language: Tamil',
  sz=8,c=DIM)
t(ax,10.0,4.78,
  'Tool ranked #1: Agmarknet KA  |  NDCG@5=0.91  |  Co-activation edges updated for next turn',
  sz=7.5,c=MONO)

down_arrow(ax, 10.0, Y5, Y5-0.72, GOLD, lw=3)

# ─── TN CM BOX ──────────────────────────────────────────────────────────────
Y6 = 1.0
# gradient-like background
for i in range(30):
    alpha = 0.04 + i*0.004
    ax.add_patch(FancyBboxPatch((0.4, Y6+i*0.1), 19.2, 0.1,
        boxstyle="square,pad=0", linewidth=0,
        facecolor=GOLD, alpha=alpha*0.5, zorder=2))
glow_box(ax,0.4,Y6,19.2,2.75,GOLD,fc='#1c1200',lw=3,glow=True)

t(ax,10.0,3.45,'Tamil Nadu Chief Minister  —  Startup Investment Proposal',
  sz=13,c=GOLD,w='bold')
t(ax,10.0,3.0,
  'Real-Time Agriculture Intelligence for 37M Tamil Nadu Farmers  |  6 Languages  |  data.gov.in Live',
  sz=9.5,c=WHITE)
t(ax,10.0,2.6,
  'SessionRerank+ [Obj1]  \u2192  APRR+CDR+PDR [Obj2]  \u2192  MNCD Mesh [Obj3]  \u2192  FCNP [Obj4]',
  sz=9,c=DIM)
t(ax,10.0,2.18,
  'Gemma 4  |  IndicTrans2  |  HF Space LIVE  |  Vercel LIVE  |  Kaggle  |  data.gov.in',
  sz=8.5,c=GOLD)
t(ax,10.0,1.72,
  'Abigail Creations  \u2014  abigailinnovations@gmail.com  \u2014  MS Ramaiah University, Bengaluru',
  sz=8,c=DIM)

# ─── RIGHT SIDE LEGEND ──────────────────────────────────────────────────────
legend = [(C1,'Obj 1: SessionRerank+  (Tool Retrieval)'),
          (C2,'Obj 2: APRR + CDR + PDR  (Routing)'),
          (C3,'Obj 3: MNCD  (Decentralized Mesh)'),
          (C4,'Obj 4: FCNP  (Context Pruning)'),
          (GOLD,'Output + TN CM Demo'),
          (DATA,'data.gov.in  Real-Time Feed'),]
for i,(c,lbl) in enumerate(legend):
    yl = 33.3 - i*0.42
    ax.plot([0.5,1.0],[yl,yl],color=c,lw=4,solid_capstyle='round',zorder=6)
    # just show on left as a small legend strip at very top

# bottom legend strip
for i,(c,lbl) in enumerate(legend):
    xl = 0.5 + i*3.25
    ax.plot([xl,xl+0.4],[0.55,0.55],color=c,lw=4,solid_capstyle='round',zorder=6)
    t(ax,xl+0.5,0.55,lbl,sz=6.2,c=DIM,ha='left',va='center')

plt.tight_layout(pad=0.1)
plt.savefig('/home/user/workspace/presentation/algorithm_flow.png',
            dpi=180, bbox_inches='tight', facecolor=BG)
import shutil
shutil.copy('/home/user/workspace/presentation/algorithm_flow.png', '/home/user/workspace/phd_master_repo/diagrams/algorithm_flow.png')
plt.close()
print("Algorithm flow diagram saved.")
