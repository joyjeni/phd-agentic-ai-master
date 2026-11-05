# Reproduce every number in experiments/RESULTS.md on a CPU (~75 min total)
PY ?= python
.PHONY: test quick all v3 v3-kcc-smoke
test:            ## unit tests (seconds)
	cd laboratory/research && $(PY) -m pytest -q
quick: test      ## ablation table only (~5 min)
	$(PY) experiments/run_all.py --repo . --seeds 3 --out experiments/results/acrs_results.json
all: quick       ## everything reported in the thesis
	$(PY) experiments/leakage_audit.py
	$(PY) experiments/o1_satr_v2.py --repo . --out experiments/results/o1_satr_v2.json
	$(PY) experiments/baselines_sensitivity.py --repo . --seeds 3 --out experiments/results/baselines_sensitivity.json
	$(PY) experiments/o3_forge.py --repo . --out experiments/results/o3_forge.json
	COLLUDE=1 $(PY) experiments/o3_collude.py --repo . --out experiments/results/o3_collude.json
	COLLUDE=1 $(PY) experiments/o3_collude.py --repo . --width 4 --out experiments/results/o3_collude_w4.json
	$(PY) experiments/power_analysis.py --repo . --out experiments/results/power_analysis.json

v3:              ## ACRS v3: O1-O4 + G1 governance, attack sweep, certified execution (~6 min)
	$(PY) experiments/integrated_eval.py --dataset toolbench --seeds 3
v3-kcc-smoke:    ## pipeline check on synthetic KCC rows (not a result)
	$(PY) experiments/integrated_eval.py --dataset kcc --smoke --seeds 2 --quick --out /tmp/acrs_kcc_smoke.json
