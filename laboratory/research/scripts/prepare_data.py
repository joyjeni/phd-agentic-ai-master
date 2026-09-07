#!/usr/bin/env python3
"""Build the committed data bundle from public sources.

Outputs (all under ``data/``)
-----------------------------
``toolbench/corpus.jsonl.gz``          10,439 deduplicated ToolBench G1 endpoint documents
``toolbench/queries.test.jsonl``       100 held-out instructions with their qrels gold sets
``toolbench/train_trajectories.jsonl`` co-called endpoint groups from the *training* qrels,
                                       used only to fit the O1 co-occurrence graph
``toolbench/sessions.test.jsonl``      the derived ToolBench-Sessions turns
``toolbench/meta.json``                provenance and sessionisation diagnostics
``datagov/``                           live-only; snapshots are not committed or served as answers

Sources
-------
ToolBench retrieval split, G1, mirrored publicly on the Hugging Face Hub at
``Adorg/ToolBench`` (the original release is Qin et al., 2023,
https://github.com/OpenBMB/ToolBench). Only the retrieval split is needed.

Usage
-----
    python research/scripts/prepare_data.py                 # download + build
    python research/scripts/prepare_data.py --skip-datagov  # ToolBench only
    python research/scripts/prepare_data.py --cache-dir /tmp/tb
"""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import sys
import time
import urllib.request
from collections import defaultdict
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT / "research" / "src"))

HF_BASE = "https://huggingface.co/datasets/Adorg/ToolBench/resolve/main/retrieval/G1"
FILES = {
    "corpus.tsv": f"{HF_BASE}/corpus.tsv",
    "test.query.txt": f"{HF_BASE}/test.query.txt",
    "qrels.test.tsv": f"{HF_BASE}/qrels.test.tsv",
    "qrels.train.tsv": f"{HF_BASE}/qrels.train.tsv",
}


def download(url: str, dest: Path) -> Path:
    if dest.exists() and dest.stat().st_size > 0:
        print(f"  cached  {dest.name} ({dest.stat().st_size:,} bytes)")
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    print(f"  fetch   {dest.name} <- {url}")
    req = urllib.request.Request(url, headers={"User-Agent": "paim-research/0.1"})
    with urllib.request.urlopen(req, timeout=180) as resp, dest.open("wb") as fh:
        while chunk := resp.read(1 << 20):
            fh.write(chunk)
    print(f"          {dest.stat().st_size:,} bytes")
    return dest


def read_corpus(path: Path) -> dict[str, dict]:
    """Deduplicate the corpus by doc id (the released TSV repeats every row)."""
    csv.field_size_limit(1 << 30)
    out: dict[str, dict] = {}
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.reader(fh, delimiter="\t", quotechar='"')
        next(reader, None)  # header: docid, document_content
        for row in reader:
            if len(row) < 2:
                continue
            doc_id = row[0].strip()
            if not doc_id or doc_id in out:
                continue
            try:
                out[doc_id] = json.loads(row[1])
            except json.JSONDecodeError:
                continue
    return out


def read_qrels(path: Path) -> dict[str, list[str]]:
    grouped: dict[str, list[str]] = defaultdict(list)
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            parts = line.split()
            if len(parts) < 4:
                continue
            qid, _, doc_id, rel = parts[0], parts[1], parts[2], parts[3]
            if int(rel) > 0:
                grouped[qid].append(doc_id)
    return {k: sorted(set(v)) for k, v in grouped.items()}


def read_queries(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            parts = line.rstrip("\n").split("\t")
            if len(parts) >= 2:
                out[parts[0].strip()] = parts[1].strip()
    return out


def build_toolbench(cache: Path, data_dir: Path) -> dict:
    print("ToolBench G1 retrieval split")
    paths = {name: download(url, cache / name) for name, url in FILES.items()}

    print("  parse   corpus")
    corpus = read_corpus(paths["corpus.tsv"])
    queries = read_queries(paths["test.query.txt"])
    qrels_test = read_qrels(paths["qrels.test.tsv"])
    qrels_train = read_qrels(paths["qrels.train.tsv"])
    print(
        f"          {len(corpus):,} endpoints, {len(queries)} test queries, "
        f"{sum(len(v) for v in qrels_test.values())} test judgements, "
        f"{len(qrels_train):,} training queries"
    )

    out = data_dir / "toolbench"
    out.mkdir(parents=True, exist_ok=True)

    with gzip.open(out / "corpus.jsonl.gz", "wt", encoding="utf-8") as fh:
        for doc_id in sorted(corpus, key=lambda d: int(d) if d.isdigit() else 0):
            row = dict(corpus[doc_id])
            row["doc_id"] = doc_id
            fh.write(json.dumps(row, sort_keys=True) + "\n")

    with (out / "queries.test.jsonl").open("w", encoding="utf-8") as fh:
        for qid in sorted(queries, key=lambda q: int(q) if q.isdigit() else 0):
            if qid not in qrels_test:
                continue
            fh.write(
                json.dumps(
                    {
                        "qid": qid,
                        "query": queries[qid],
                        "gold_doc_ids": qrels_test[qid],
                    },
                    sort_keys=True,
                )
                + "\n"
            )

    # Training trajectories: each training query's gold endpoint set is a group
    # of endpoints that were called together. Test queries are excluded so the
    # O1 co-occurrence graph cannot leak test labels.
    test_ids = set(qrels_test)
    with (out / "train_trajectories.jsonl").open("w", encoding="utf-8") as fh:
        kept = 0
        for qid, docs in sorted(qrels_train.items(), key=lambda kv: kv[0]):
            if qid in test_ids or len(docs) < 2:
                continue
            fh.write(json.dumps({"qid": qid, "doc_ids": docs}, sort_keys=True) + "\n")
            kept += 1
    print(f"          {kept:,} training trajectories (>=2 endpoints, test queries excluded)")

    # Derived sessions + diagnostics.
    from paim.data.toolbench import build_sessions, load_bundle, sessionisation_report

    meta = {
        "source": "Adorg/ToolBench (Hugging Face mirror of ToolBench G1 retrieval split)",
        "originalRelease": "Qin et al. 2023, https://github.com/OpenBMB/ToolBench",
        "builtAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "endpoints": len(corpus),
        "testQueries": len([q for q in queries if q in qrels_test]),
        "testJudgements": sum(len(v) for v in qrels_test.values()),
        "trainTrajectories": kept,
    }
    (out / "meta.json").write_text(json.dumps(meta, indent=1, sort_keys=True))

    bundle = load_bundle(data_dir)
    report = sessionisation_report(bundle)
    meta["sessionisation"] = report
    (out / "meta.json").write_text(json.dumps(meta, indent=1, sort_keys=True))

    with (out / "sessions.test.jsonl").open("w", encoding="utf-8") as fh:
        for s in build_sessions(bundle):
            fh.write(
                json.dumps(
                    {
                        "session_id": s.session_id,
                        "query": s.query,
                        "sub_goals": [
                            {
                                "sub_goal_id": g.sub_goal_id,
                                "turn": g.turn,
                                "text": g.text,
                                "gold_doc_ids": list(g.gold_doc_ids),
                            }
                            for g in s.sub_goals
                        ],
                    },
                    sort_keys=True,
                )
                + "\n"
            )
    print(
        f"  sessions {report['sessions']} sessions, {report['multiTurnSessions']} multi-turn "
        f"({report['multiTurnFraction']:.0%}), avg {report['avgTurns']} turns, "
        f"label-preserving={report['labelPreserving']}"
    )
    return meta


def build_datagov(data_dir: Path) -> dict:
    print("data.gov.in Agriculture live probe (no snapshot write)")
    from paim.data.datagov import AGRICULTURE_RESOURCES, DataGovClient

    client = DataGovClient(data_dir=data_dir)
    probed = []
    for resource in AGRICULTURE_RESOURCES:
        try:
            resp = client.fetch(resource.doc_id, limit=5)
            if not resp.ok or resp.source != "live":
                raise RuntimeError(resp.error or "live fetch failed")
            print(
                f"  ok      {resource.doc_id}: {len(resp.records)} live records of "
                f"{resp.total:,} (source={resp.source})"
            )
            probed.append({"docId": resource.doc_id, "records": len(resp.records), "source": resp.source})
        except Exception as exc:
            print(f"  FAIL    {resource.doc_id}: {exc}")
            probed.append({"docId": resource.doc_id, "error": str(exc)})
    return {"liveProbes": probed}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--cache-dir", default="/tmp/paim-cache", help="download cache")
    ap.add_argument("--data-dir", default=str(REPO_ROOT / "data"))
    ap.add_argument("--skip-toolbench", action="store_true")
    ap.add_argument("--skip-datagov", action="store_true")
    args = ap.parse_args()

    cache = Path(args.cache_dir)
    data_dir = Path(args.data_dir)
    summary: dict = {}

    if not args.skip_toolbench:
        summary["toolbench"] = build_toolbench(cache, data_dir)
    if not args.skip_datagov:
        summary["datagov"] = build_datagov(data_dir)

    print("\ndone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
