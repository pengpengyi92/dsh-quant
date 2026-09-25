# PCPT Six-Layer Research System — 2026-09-25

## Decision

PCPT is upgraded from a model/portfolio domain into a scalable AI-native research system:

**Data → Model → Experiment → Evaluation → AI Agent → Research-to-Production**

This is a super-conversion because it connects personal research infrastructure, PhD/lab-style experimentation, PBenchmark, AI-native automation, and downstream P-Trading production.

## 1. Data

- Scale to large financial time-series, LOB, alternative, text and multimodal datasets.
- Strengthen PIT correctness, quality, lineage, versioning, batch/streaming and compute-ready storage.
- Treat computing resources as a research asset: data pipelines should support distributed training and large experiment grids.

## 2. Model

- Keep Linear / Logistic / GBDT as required baselines.
- Extend systematically to Transformer, sequence models, representation learning, multimodal, LLM, RL/IRL.
- Complexity is justified only by reproducible OOS improvement over baselines.

## 3. Experiment

- Research capability requires experiment capability.
- Standardize configs, seeds, data/model versions, ablations, HPO, distributed training and compute allocation.
- PhD / research-lab / internship environments are valuable because they provide dense experiment cycles, scientific feedback and publishable artifacts.

## 4. Evaluation

- Build a PBenchmark-style benchmark matrix.
- Predictive metrics + portfolio metrics + risk/cost metrics + regime robustness.
- Keep OOS, no-look-ahead, cost-adjusted and reproducible evaluation as non-negotiable gates.

## 5. AI Agent Research Pipeline

- literature → hypothesis → dataset → experiment → evaluation → failure analysis → artifact
- AI automation amplifies the first four layers; it cannot replace deep understanding of them.

## 6. Research-to-Production

- Convert mature research into P-Trading / PWL / PTFT / PMMT candidates.
- Gate candidates through data quality, model evidence, OOS evaluation, risk and transaction-cost checks.
- Public side keeps methods/frameworks; internal side keeps production data, parameters, alpha and live-trading implementation.

## Priority

The first four layers are the capability core. Near-term PCPT work should disproportionately strengthen **Data + Model**, then accumulate real **Experiment + Evaluation** evidence. Agent automation comes after the base loop is understood; productionization is the final conversion.
