import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import numpy as np

fig, ax = plt.subplots(figsize=(24, 17))
ax.set_xlim(0, 24)
ax.set_ylim(0, 17)
ax.axis('off')
fig.patch.set_facecolor('#0d1117')
ax.set_facecolor('#0d1117')

C = dict(
    bg='#0d1117', panel='#161b22',
    c1='#58a6ff', c2='#f79c42', c3='#56d364', c4='#bc8cff',
    sub='#21262d', arrow='#8b949e', white='#e6edf3', dim='#8b949e',
    real='#3fb950', title='#f0f6fc', warn='#f85149', gold='#e3b341'
)

def box(ax, x, y, w, h, ec, fc='#161b22', lw=2, r=0.25, alpha=1, zorder=2):
    p = FancyBboxPatch((x,y), w, h,
        boxstyle=f"round,pad=0.04,rounding_size={r}",
        linewidth=lw, edgecolor=ec, facecolor=fc, alpha=alpha, zorder=zorder)
    ax.add_patch(p)

def txt(ax, x, y, s, sz=8.5, c='#e6edf3', w='normal', ha='center', va='center', z=5):
    ax.text(x, y, s, fontsize=sz, color=c, fontweight=w, ha=ha, va=va, zorder=z)

def arr(ax, x1,y1,x2,y2, c='#8b949e', lw=1.6, rad=0.0):
    ax.annotate('', xy=(x2,y2), xytext=(x1,y1),
        arrowprops=dict(arrowstyle='->', color=c, lw=lw,
                        connectionstyle=f'arc3,rad={rad}'), zorder=4)

def darr(ax, x1,y1,x2,y2, c='#8b949e', lw=1.4, rad=0.0, label='', lc=None):
    ax.annotate('', xy=(x2,y2), xytext=(x1,y1),
        arrowprops=dict(arrowstyle='->', color=c, lw=lw,
                        connectionstyle=f'arc3,rad={rad}'), zorder=4)
    if label:
        mx,my=(x1+x2)/2,(y1+y2)/2
        txt(ax,mx,my+0.15,label,sz=6.5,c=lc or c)

# ── TITLE ──────────────────────────────────────────────────────────────────
txt(ax,12,16.45,'Integrated PhD Architecture: Agentic AI Tool Selection System',
    sz=15,c=C['title'],w='bold')
txt(ax,12,15.95,
    'Jenisha T  |  PhD Candidate, CSE  |  MS Ramaiah University  |  Bengaluru, India',
    sz=9,c=C['dim'])

# ── INPUT ──────────────────────────────────────────────────────────────────
box(ax,0.3,13.6,4.6,1.9,C['c1'],fc='#0d1f35',lw=2)
txt(ax,2.6,15.1,'USER QUERY INPUT',sz=9,c=C['c1'],w='bold')
txt(ax,2.6,14.7,'Multi-turn  |  English / Kannada  |  Mobile',sz=8,c=C['white'])
txt(ax,2.6,14.3,'"What is tomato price in Chennai mandi today?"',sz=7.5,c=C['dim'])
txt(ax,2.6,13.85,'Farmer Profile: crop  district  season  language',sz=7,c=C['dim'])

box(ax,0.3,11.3,4.6,2.0,C['real'],fc='#0d2215',lw=2)
txt(ax,2.6,12.88,'data.gov.in  Real-Time API',sz=9,c=C['real'],w='bold')
txt(ax,2.6,12.48,'Mandi Prices  |  PM-KISAN  |  AGMARKNET',sz=8,c=C['white'])
txt(ax,2.6,12.1,'Tamil Nadu APMC  |  Karnataka APMC',sz=8,c=C['white'])
txt(ax,2.6,11.65,'Resource: 9ef84268-d588-465a-a308-a864a43d0070',sz=6.5,c=C['dim'])

# ── OBJECTIVE 1 ────────────────────────────────────────────────────────────
box(ax,0.3,6.0,4.6,5.0,C['c1'],fc='#0b1d2e',lw=2.5,r=0.3)
txt(ax,2.6,10.65,'OBJECTIVE 1',sz=7.5,c=C['c1'],w='bold')
txt(ax,2.6,10.25,'SessionRerank+',sz=12,c=C['white'],w='bold')
txt(ax,2.6,9.85,'Session-Aware Tool Retrieval',sz=8.5,c=C['dim'])

# sub-boxes O1
box(ax,0.55,9.15,1.9,0.75,C['c1'],fc=C['sub'],lw=1.2)
txt(ax,1.5,9.57,'Gemma 4',sz=8,c=C['white'],w='bold')
txt(ax,1.5,9.32,'embeddinggemma-300m',sz=6.5,c=C['dim'])

box(ax,2.65,9.15,1.95,0.75,C['c1'],fc=C['sub'],lw=1.2)
txt(ax,3.62,9.57,'CoactivationCache',sz=8,c=C['white'],w='bold')
txt(ax,3.62,9.32,'delta-incr  rho-decay',sz=6.5,c=C['dim'])

box(ax,0.55,8.2,1.9,0.72,C['c1'],fc=C['sub'],lw=1.2)
txt(ax,1.5,8.6,'Profile Mask',sz=8,c=C['white'],w='bold')
txt(ax,1.5,8.35,'crop  district  season',sz=6.5,c=C['dim'])

box(ax,2.65,8.2,1.95,0.72,C['c1'],fc=C['sub'],lw=1.2)
txt(ax,3.62,8.6,'NDCG@5 / Hit@5',sz=8,c=C['white'],w='bold')
txt(ax,3.62,8.35,'+14.7% vs Dense',sz=7,c=C['real'])

box(ax,0.55,7.25,4.05,0.72,C['c1'],fc='#0a1a28',lw=1)
txt(ax,2.62,7.65,'HF Space: abigailcreations/karnataka-agri-assistant',sz=7,c=C['c1'])
txt(ax,2.62,7.4,'Kaggle: sessionrerank_gemma4_kaggle.ipynb',sz=7,c=C['dim'])

box(ax,0.55,6.2,4.05,0.78,C['c1'],fc=C['sub'],lw=1)
txt(ax,2.62,6.63,'BM25  Dense  ToolRerank  CrossEnc  Gemma4FT',sz=7,c=C['white'])
txt(ax,2.62,6.38,'5-stage cascade  |  5 seeds  |  G1/G2/G3',sz=7,c=C['dim'])

# ── OBJECTIVE 2 (wide centre) ───────────────────────────────────────────────
box(ax,5.4,4.5,8.2,11.1,C['c2'],fc='#1c1405',lw=2.5,r=0.35)
txt(ax,9.5,15.25,'OBJECTIVE 2',sz=7.5,c=C['c2'],w='bold')
txt(ax,9.5,14.85,'APRR  +  CDR  +  PDR',sz=13,c=C['white'],w='bold')
txt(ax,9.5,14.4,'Adaptive Multi-Agent LLM Routing',sz=9,c=C['dim'])

# APRR core
box(ax,5.65,13.1,7.7,1.65,C['c2'],fc='#261b08',lw=1.8)
txt(ax,9.5,14.38,'APRR Core  —  Decay-Regularised Policy Iteration',sz=9,c=C['white'],w='bold')
txt(ax,9.5,13.95,'P(a_j | a_i, q)  oc  W_ij^alpha  * eta_ij^beta  * psi_j(q)^gamma',sz=8.5,c=C['c2'])
txt(ax,9.5,13.55,'W  <-  (1-lambda)*W  +  kappa * 1[success] / (L^2 * latency_norm)',sz=8.5,c=C['c2'])
txt(ax,9.5,13.2,'alpha=2.0  beta=1.0  gamma=2.5  lambda=0.005  kappa=5.0  epsilon=0.15',sz=7,c=C['dim'])

# CDR sub-box (inside Obj2)
box(ax,5.65,10.7,3.65,2.2,C['gold'],fc='#1e1608',lw=1.8)
txt(ax,7.47,12.55,'CDR',sz=11,c=C['gold'],w='bold')
txt(ax,7.47,12.15,'Chain-of-Reasoning Over Workload',sz=8,c=C['white'])
txt(ax,7.47,11.78,'Complexity -> greedy vs CoT deliberation',sz=7.5,c=C['dim'])
txt(ax,7.47,11.43,'DeltaW *= (1 + beta * rho(T_q))',sz=8,c=C['c2'])
txt(ax,7.47,11.08,'reasoning-quality-weighted W update',sz=7,c=C['dim'])
txt(ax,7.47,10.82,'interpretable per-query trace',sz=7,c=C['dim'])

# PDR sub-box (inside Obj2)
box(ax,9.6,10.7,4.0,2.2,C['gold'],fc='#1e1608',lw=1.8)
txt(ax,11.6,12.55,'PDR',sz=11,c=C['gold'],w='bold')
txt(ax,11.6,12.15,'Octopus-Inspired Distributed Routing',sz=8,c=C['white'])
txt(ax,11.6,11.78,'Functional token <octo_k> dispatch',sz=7.5,c=C['dim'])
txt(ax,11.6,11.43,'Arm-local W_local  |  ASI metric',sz=8,c=C['c2'])
txt(ax,11.6,11.08,'Chromatophore 1-bit confidence signals',sz=7,c=C['dim'])
txt(ax,11.6,10.82,'-22% latency vs APRR  |  2-layer arch',sz=7,c=C['real'])

# Hybrid label
box(ax,5.65,9.9,7.7,0.62,C['c2'],fc='#1a1206',lw=1)
txt(ax,9.5,10.24,'CDR-PDR Hybrid: PDR parallel dispatch + CDR reasoning-gated routing within arm',sz=7.5,c=C['white'])

# Results band
box(ax,5.65,8.65,7.7,1.0,C['c2'],fc='#140f04',lw=1.2)
txt(ax,9.5,9.32,'ToolBench Benchmark  (5 seeds x 40 iter x 500 queries  |  G1/G2/G3)',sz=8,c=C['dim'],w='bold')
txt(ax,9.5,8.95,'APRR: success=0.470  latency=261ms  hops=2.77   vs Random: 0.323',sz=8,c=C['white'])
txt(ax,9.5,8.72,'35.7% latency reduction  |  23.9% hop reduction  over StaticSemantic',sz=7.5,c=C['real'])

# PDR latency box
box(ax,5.65,7.6,3.65,0.82,C['c2'],fc='#1a1206',lw=1)
txt(ax,7.47,8.08,'PDR: 207ms  (-22%)',sz=8,c=C['white'])
txt(ax,7.47,7.78,'CDR: 467ms  (+interpretability)',sz=8,c=C['dim'])

# Kaggle/HF band
box(ax,9.6,7.6,3.7,0.82,C['c2'],fc='#1a1206',lw=1)
txt(ax,11.45,8.08,'Kaggle: APRR_Reproducible_Benchmark',sz=7.5,c=C['c2'])
txt(ax,11.45,7.78,'Colab: APRR_CDR_PDR_Benchmark',sz=7.5,c=C['dim'])

# ToolBench cite
box(ax,5.65,4.72,7.7,2.65,C['sub'],fc='#161b22',lw=1,r=0.2)
txt(ax,9.5,7.0,'ToolBench (Qin et al. ICLR 2024)  |  G1-Inst  G1-Tool  G1-Cat',sz=8,c=C['white'],w='bold')
txt(ax,9.5,6.65,'G2-Inst  G2-Cat  G3-Inst  (cross-tool / cross-domain splits)',sz=8,c=C['dim'])
txt(ax,9.5,6.3,'5-agent topology: WeatherAgent  MarketAgent  CropAgent  SchemeAgent  SoilAgent',sz=7.5,c=C['white'])
txt(ax,9.5,5.95,'GitHub: aprr-multi-agent-routing  (public)',sz=7,c=C['dim'])
txt(ax,9.5,5.62,'Deployed: Vercel Dashboard  https://aprr-multi-agent-routing.vercel.app',sz=7,c=C['c2'])

# ── OBJECTIVE 3 ─────────────────────────────────────────────────────────────
box(ax,14.2,7.5,4.8,8.1,C['c3'],fc='#0b1e10',lw=2.5,r=0.3)
txt(ax,16.6,15.25,'OBJECTIVE 3',sz=7.5,c=C['c3'],w='bold')
txt(ax,16.6,14.85,'MNCD Mesh Agents',sz=12,c=C['white'],w='bold')
txt(ax,16.6,14.45,'Decentralized Context Sharing Mesh',sz=8.5,c=C['dim'])

box(ax,14.45,13.6,4.3,0.75,C['c3'],fc=C['sub'],lw=1.2)
txt(ax,16.6,14.0,'P2P Pub/Sub + Gossip  (Demers 1987)',sz=8,c=C['white'])

box(ax,14.45,12.65,2.0,0.72,C['c3'],fc=C['sub'],lw=1.2)
txt(ax,15.45,13.05,'Replication',sz=8,c=C['white'],w='bold')
txt(ax,15.45,12.8,'R = 3 nodes',sz=7,c=C['dim'])

box(ax,16.65,12.65,2.1,0.72,C['c3'],fc=C['sub'],lw=1.2)
txt(ax,17.7,13.05,'phi-Accrual',sz=8,c=C['white'],w='bold')
txt(ax,17.7,12.8,'Failure Detect',sz=7,c=C['dim'])

box(ax,14.45,11.7,4.3,0.72,C['c3'],fc=C['sub'],lw=1.2)
txt(ax,16.6,12.1,'Borda Consensus  |  Adaptive Edge Weights',sz=8,c=C['white'])

box(ax,14.45,10.75,4.3,0.72,C['c3'],fc=C['sub'],lw=1.2)
txt(ax,16.6,11.15,'w(p,q) = alpha*s_pq + (1-alpha)/(1+l_pq)',sz=8,c=C['white'])

box(ax,14.45,9.75,4.3,0.75,C['c3'],fc='#081a0c',lw=1.2)
txt(ax,16.6,10.17,'97.5% accuracy  |  100% uptime (2/5 dead)',sz=8,c=C['real'])
txt(ax,16.6,9.9,'97.0% at 20% packet loss  |  R=2.60',sz=8,c=C['white'])

box(ax,14.45,8.8,4.3,0.72,C['c3'],fc=C['sub'],lw=1.2)
txt(ax,16.6,9.2,'Kaggle: mncd_mesh.ipynb',sz=7.5,c=C['c3'])
txt(ax,16.6,8.95,'HF Models: gemma-2-2b-it  Qwen2.5-7B  Llama-3.1-8B',sz=7,c=C['dim'])

box(ax,14.45,7.68,4.3,0.9,C['c2'],fc='#1a1208',lw=1.2)
txt(ax,16.6,8.2,'Distress signal <-- CDR low-confidence traces',sz=7.5,c=C['c2'])
txt(ax,16.6,7.9,'CSA drop --> mesh help broadcast (PDR)',sz=7.5,c=C['c2'])

# ── OBJECTIVE 4 ─────────────────────────────────────────────────────────────
box(ax,19.4,7.5,4.35,8.1,C['c4'],fc='#130c20',lw=2.5,r=0.3)
txt(ax,21.57,15.25,'OBJECTIVE 4',sz=7.5,c=C['c4'],w='bold')
txt(ax,21.57,14.85,'FCNP Pruning',sz=12,c=C['white'],w='bold')
txt(ax,21.57,14.45,'Flow-Based Context Network Pruning',sz=8.5,c=C['dim'])

box(ax,19.65,13.6,3.85,0.75,C['c4'],fc=C['sub'],lw=1.2)
txt(ax,21.57,14.0,'Kirchhoff Potential Field (Conductance Dynamics analog)',sz=7.5,c=C['white'])

box(ax,19.65,12.65,3.85,0.72,C['c4'],fc=C['sub'],lw=1.2)
txt(ax,21.57,13.05,'D_ij(t+1) = (1-mu)*D_ij + alpha*|Q_ij|^gamma',sz=7.5,c=C['white'])

box(ax,19.65,11.7,3.85,0.72,C['c4'],fc=C['sub'],lw=1.2)
txt(ax,21.57,12.1,'L(D)*p = I   (Kirchhoff solve per iter)',sz=7.5,c=C['white'])

box(ax,19.65,10.75,3.85,0.72,C['c4'],fc=C['sub'],lw=1.2)
txt(ax,21.57,11.15,'7 SOTA baselines: BM25  DenseTopK',sz=7.5,c=C['white'])
txt(ax,21.57,10.9,'SelectiveCtx  LLMLingua  + 3 trivial',sz=7,c=C['dim'])

box(ax,19.65,9.75,3.85,0.75,C['c4'],fc='#0e0818',lw=1.2)
txt(ax,21.57,10.17,'10:1 compression  |  F1@K p<0.05',sz=8,c=C['real'])
txt(ax,21.57,9.9,'>=99% citation accuracy (oracle budget)',sz=7.5,c=C['white'])

box(ax,19.65,8.8,3.85,0.72,C['c4'],fc=C['sub'],lw=1.2)
txt(ax,21.57,9.2,'Kaggle: fcnp_toolbench_benchmark.ipynb',sz=7.5,c=C['c4'])
txt(ax,21.57,8.95,'Dashboard: Vercel  |  HF: ToolBench splits',sz=7,c=C['dim'])

box(ax,19.65,7.68,3.85,0.9,C['c2'],fc='#1a1208',lw=1.2)
txt(ax,21.57,8.2,'Domain-gated pruning <-- PDR route',sz=7.5,c=C['c2'])
txt(ax,21.57,7.9,'CDR trace relevance --> context filter',sz=7.5,c=C['c2'])

# ── OUTPUT ──────────────────────────────────────────────────────────────────
box(ax,1.5,3.1,21.0,2.1,C['c1'],fc='#0b1a2e',lw=2,r=0.4)
txt(ax,12.0,4.75,'UNIFIED SYSTEM OUTPUT',sz=10,c=C['c1'],w='bold')

cols = [(C['c1'],'Ranked Tool List','NDCG@5 +14.7%','HF Space (live)'),
        (C['c2'],'Agent Route Path','261ms  2.77 hops','Vercel Dashboard'),
        (C['c3'],'Mesh Consensus','97.5% accuracy','Kaggle Notebook'),
        (C['c4'],'Pruned Context','10:1 compression','Kaggle Notebook')]
for i,(ec,t1,t2,t3) in enumerate(cols):
    xi = 1.8 + i*5.1
    box(ax,xi,3.22,4.7,1.75,ec,fc='#161b22',lw=1.5,r=0.25)
    txt(ax,xi+2.35,4.6,t1,sz=8.5,c=ec,w='bold')
    txt(ax,xi+2.35,4.25,t2,sz=8,c=C['white'])
    txt(ax,xi+2.35,3.88,t3,sz=7.5,c=C['dim'])

# TN CM pitch
box(ax,4.5,0.2,15.0,2.65,C['c2'],fc='#1a1005',lw=2.5,r=0.4)
txt(ax,12.0,2.5,'Tamil Nadu Chief Minister  —  Startup Investment Demo',
    sz=12,c=C['c2'],w='bold')
txt(ax,12.0,2.05,'Real-Time Agriculture Intelligence  |  data.gov.in  Live Feed  |  Agentic AI Platform',sz=9,c=C['white'])
txt(ax,12.0,1.65,'SessionRerank+  [Obj1]  →  APRR+CDR+PDR  [Obj2]  →  MNCD Mesh  [Obj3]  →  FCNP  [Obj4]',sz=8.5,c=C['dim'])
txt(ax,12.0,1.28,'Gemma 4  |  ToolBench  |  HF Space  |  Kaggle  |  Vercel  |  data.gov.in',sz=8,c=C['real'])
txt(ax,12.0,0.78,'Abigail Creations  —  Kyndryl India  —  MS Ramaiah University of Applied Sciences',sz=8,c=C['dim'])

# ── ARROWS ──────────────────────────────────────────────────────────────────
# Input -> Obj1
arr(ax,2.6,13.6,2.6,11.0,C['c1'],lw=2)
# data.gov.in -> Obj1
arr(ax,2.6,11.3,2.6,11.0,C['c1'],lw=1.5)
# Input -> Obj2
arr(ax,4.9,14.5,5.4,14.3,C['c2'],lw=2)
# data.gov.in -> Obj2
arr(ax,4.9,12.3,5.4,12.0,C['real'],lw=1.5)

# Obj1 -> Obj2 (session priority)
darr(ax,4.9,8.5,5.65,9.5,C['c1'],lw=1.8,rad=0.0,label='priority score',lc=C['c1'])

# APRR -> CDR, PDR (internal)
arr(ax,7.9,13.1,7.47,12.9,C['c2'],lw=1.2)
arr(ax,11.1,13.1,11.6,12.9,C['c2'],lw=1.2)
# CDR <-> PDR hybrid
ax.annotate('', xy=(9.6,11.8), xytext=(9.3,11.8),
    arrowprops=dict(arrowstyle='<->', color=C['gold'], lw=1.2), zorder=4)

# Obj2 -> Obj3
darr(ax,13.6,11.0,14.2,11.0,C['c2'],lw=2,label='routing\ndecision',lc=C['c2'])

# Obj3 -> Obj4
darr(ax,19.0,11.0,19.4,11.0,C['c3'],lw=2,label='mesh\ncontext',lc=C['c3'])

# CDR -> Obj3 distress
arr(ax,7.5,10.7,14.45,8.5,C['c2'],lw=1.2,rad=-0.12)

# PDR -> Obj4 domain-gated pruning
arr(ax,13.0,10.7,19.4,8.5,C['c4'],lw=1.2,rad=0.08)

# All -> output
arr(ax,2.6,6.0,4.0,4.85,C['c1'],lw=1.5)
arr(ax,9.5,4.5,9.5,4.85,C['c2'],lw=1.5)
arr(ax,16.6,7.5,14.5,4.85,C['c3'],lw=1.5)
arr(ax,21.57,7.5,19.0,4.85,C['c4'],lw=1.5)

# output -> TN CM
arr(ax,12.0,3.1,12.0,2.85,C['c2'],lw=2.5)

# ── LEGEND ──────────────────────────────────────────────────────────────────
items = [
    (C['c1'],'Obj 1: SessionRerank+ (Tool Retrieval · HF Space live)'),
    (C['c2'],'Obj 2: APRR + CDR + PDR (Routing · Vercel)'),
    (C['c3'],'Obj 3: MNCD Mesh (Decentralized Context · Kaggle)'),
    (C['c4'],'Obj 4: FCNP (Context Pruning · Kaggle)'),
    (C['real'],'data.gov.in Real-Time Integration'),
]
for i,(c,t) in enumerate(items):
    xl = 0.5 + i*4.7
    ax.plot([xl,xl+0.4],[0.45,0.45],color=c,lw=3.5,solid_capstyle='round',zorder=6)
    txt(ax,xl+0.5,0.45,t,sz=6.8,c=C['dim'],ha='left',va='center')

plt.tight_layout(pad=0.1)
plt.savefig('/home/user/workspace/phd_master_repo/diagrams/overall_architecture.png',
            dpi=180, bbox_inches='tight', facecolor='#0d1117')
plt.close()
print("Architecture diagram saved.")
