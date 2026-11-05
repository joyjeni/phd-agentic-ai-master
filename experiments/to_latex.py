"""Render integrated_eval JSON into LaTeX tables (booktabs + makecell), medians over seeds."""
import json, sys, statistics as st
R = json.load(open(sys.argv[1])); tag = sys.argv[2]; name = R["dataset"]["name"]
pct = lambda x: f"{100*x:.1f}\\,\\%"
def med(d, k): return d["dist"][k]["median"]
out = []
if "ablation" in R:
    out.append(rf"""\begin{{table}}[htbp]
  \centering
  \caption{{Objective ablation with G1 on {name} (median of {R['args']['seeds']} seeds, per sub-goal)}}
  \label{{tab:{tag}-ablation}}
  \footnotesize\setlength{{\tabcolsep}}{{3pt}}
  \begin{{tabular}}{{@{{}}lcccccc@{{}}}}
    \toprule
    Configuration & NDCG@5 & \makecell{{Auto-\\executed}} & \makecell{{Executed\\errors}} & \makecell{{Executed\\precision}} & \makecell{{Cost /\\sub-goal}} & \makecell{{$\Phi^\ast$\\met}} \\
    \midrule""")
    for n, d in R["ablation"].items():
        out.append(f"    {n.replace('+', '+\\,')} & {med(d,'ndcg@5'):.3f} & {pct(med(d,'executeRate'))} & {pct(med(d,'executedErrorRate'))} & {pct(med(d,'executedPrecision'))} & {med(d,'costPerSubGoal'):.4f} & {pct(med(d,'fidelityFloorMet'))} \\\\")
    out.append("    \\bottomrule\n  \\end{tabular}\n\\end{table}\n")
out.append(rf"""\begin{{table}}[htbp]
  \centering
  \caption{{Indirect prompt injection through poisoned endpoints on {name} (median of {R['args']['seeds']} seeds)}}
  \label{{tab:{tag}-attack}}
  \footnotesize\setlength{{\tabcolsep}}{{4pt}}
  \begin{{tabular}}{{@{{}}lccccc@{{}}}}
    \toprule
    Configuration & \makecell{{Poisoned\\endpoints}} & \makecell{{Auto-\\executed}} & \makecell{{Executed\\errors}} & \makecell{{Attack\\success}} & \makecell{{Executed\\precision}} \\
    \midrule""")
for n, d in R["attack"].items():
    cfg, rate = n.split(" @ attack ")
    out.append(f"    {cfg.replace('+', '+\\,')} & {pct(float(rate))} & {pct(med(d,'executeRate'))} & {pct(med(d,'executedErrorRate'))} & {pct(med(d,'attackSuccessRate'))} & {pct(med(d,'executedPrecision'))} \\\\")
out.append(f"    \\bottomrule\n  \\end{{tabular}}\n\\end{{table}}\n")
rows = {}
for c in R["certified"]:
    rows.setdefault((c["alpha"], c["attack"]), []).append(c)
out.append(rf"""\begin{{table}}[htbp]
  \centering
  \caption{{Certified auto-execution by Learn-then-Test on {name}: threshold from the calibration half, risk on the held-out half ($\delta=0.05$; {R['args']['seeds']} seeds)}}
  \label{{tab:{tag}-ltt}}
  \footnotesize\setlength{{\tabcolsep}}{{4pt}}
  \begin{{tabular}}{{@{{}}ccccccc@{{}}}}
    \toprule
    $\alpha$ & Attack & \makecell{{Seeds\\certified}} & \makecell{{$\theta^\ast$\\(range)}} & \makecell{{Held-out risk\\(max)}} & \makecell{{Within\\$\alpha$}} & \makecell{{Coverage\\(mean)}} \\
    \midrule""")
for (a, atk), cs in sorted(rows.items()):
    v = [c for c in cs if c["threshold"]["valid"]]
    th = f"{min(c['threshold']['threshold'] for c in v):.2f}--{max(c['threshold']['threshold'] for c in v):.2f}" if v else "--"
    risk = pct(max(c["heldOutExecutedRisk"] for c in v)) if v else "--"
    within = f"{sum(c['riskWithinAlpha'] for c in v)}/{len(v)}" if v else "--"
    cov = pct(st.mean(c["heldOutCoverage"] for c in v)) if v else "0 (all REVIEW)"
    out.append(f"    {a:.2f} & {pct(atk)} & {len(v)}/{len(cs)} & {th} & {risk} & {within} & {cov} \\\\")
out.append("    \\bottomrule\n  \\end{tabular}\n\\end{table}\n")
pk = R["passK"]; sr = R["stageReliability"]
out.append("% pass^k: " + ", ".join(f"{k}={v:.3f}" for k, v in pk.items()))
out.append("% stage reliability seed0: " + json.dumps({k: round(v, 3) for k, v in sr[0].items()}))
out.append(f"% guard false-positive rate: {R['guardFalsePositiveRate']:.4f}; release gate: {R['release']['gate']}; CI may promote: {R['release']['ciMayPromote']}; approver may promote: {R['release']['namedApproverMayPromote']}; manifest {R['release']['manifest']['digest'][:16]}")
print("\n".join(out))
