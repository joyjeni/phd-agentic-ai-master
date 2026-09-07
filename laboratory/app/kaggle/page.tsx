import { Card } from "@/components/ui/card";

const NOTEBOOKS = [
  {
    file: "notebooks/01_satr.ipynb",
    title: "O1 SATR",
    body: "Build the session-aware reranker, rank a wheat-in-Punjab query, then a follow-up using FCNP-like memory.",
  },
  {
    file: "notebooks/02_aprr.ipynb",
    title: "O2 APRR",
    body: "Sample APRR hops with P∝W^α η^β ψ^γ and print the affinity path.",
  },
  {
    file: "notebooks/03_mncd.ipynb",
    title: "O3 MNCD",
    body: "Gossip rank.update, score-sum consensus, live AGMARKNET only (no simulated prices).",
  },
  {
    file: "notebooks/04_fcnp.ipynb",
    title: "O4 FCNP",
    body: "Kirchhoff/Physarum prune; persistent citations survive; emit session memory.",
  },
  {
    file: "notebooks/05_e2e_pipeline.ipynb",
    title: "Integrated loop",
    body: "Two-turn Agriculture session for joyjeni@gmail.com. Fails the notebook if any arrow is missing.",
  },
];

export default function KagglePage() {
  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
          Kaggle execution
        </p>
        <h1 className="mt-2 font-serif text-4xl">GPU-free research notebooks</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Python engines under <code>python/phd_agentic</code> mirror the TypeScript
          runtime. Copy the repository into a Kaggle notebook, set the working
          directory to the repo root, and Run All. No GPU and no paid API are
          required for pipeline integrity tests.
        </p>
      </header>
      <Card className="p-5 text-sm leading-relaxed text-[var(--muted)]">
        <p className="text-[var(--paper)]">Attach or upload</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>This repository (or the python/ + notebooks/ folders).</li>
          <li>
            Optional: official ToolBench files if you have them; the bundled catalog
            is sufficient for the proposal-stage loop.
          </li>
          <li>
            Optional Kaggle secret <code>DATA_GOV_API_KEY</code> for live AGMARKNET.
            Without it the notebook still calls data.gov.in with the public visualization
            key on the resource page. It never invents mandi prices.
          </li>
        </ol>
        <pre className="mt-4 overflow-auto rounded-lg bg-[var(--ink)] p-4 text-xs text-[var(--paper)]">
{`import sys
sys.path.append("/kaggle/working")
from phd_agentic.pipeline import run_pipeline
trace = run_pipeline("What is the current mandi price of wheat in Punjab?")
assert trace["pipeline_ok"]`}
        </pre>
      </Card>
      <div className="grid gap-3 md:grid-cols-2">
        {NOTEBOOKS.map((item) => (
          <Card key={item.file} className="p-5">
            <p className="text-[11px] uppercase tracking-wide text-[var(--gold)]">
              {item.file}
            </p>
            <h2 className="mt-1 font-serif text-xl">{item.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
