# Four-objective HTTP orchestrator

The Next.js lab (Vercel) is the integrated farmer demo. This folder is the
Python equivalent: start each GitHub module's `service/app.py`, then:

```bash
python orchestrator/pipeline.py "wheat mandi price in Karnataka"
```

| Service | Default | Repo |
|---------|---------|------|
| SATR `POST /rerank` | `:43131` | session-aware-toolbench-rerank |
| APRR `POST /route` | `:43132` | aprr-multi-agent-routing |
| MNCD `POST /mesh` | `:43133` | mncd-mesh-agents |
| FCNP `POST /prune` | `:43134` | fcnp-context-pruning |

MNCD consensus is **score-sum** by default. Live mandi rows require
`DATA_GOV_API_KEY` on the FCNP process; missing keys fail loudly.
