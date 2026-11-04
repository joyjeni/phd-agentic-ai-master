# Reproduce every number in experiments/RESULTS.md on a CPU (~75 min total)
PY ?= python
.PHONY: test quick all
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
