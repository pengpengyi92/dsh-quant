# 2026-11-18 — factor teaching-resource intake

- **Baseline:** [#109](https://github.com/pengpengyi92/dsh-quant/issues/109) is open for
  broad plugin and learning-resource submissions. JQ Factor Lab was not in the ecosystem
  directory at `9c974c69ada1b44f912e4d691d6457ed955d9782`.
- **Change:** one non-installable learning reference in
  [QUANT_ECOSYSTEM](../docs/QUANT_ECOSYSTEM.md), with an
  [audit note](../docs/alpha-research/JQ_FACTOR_LAB.md) and Unreleased credit to
  [@ft1148137](https://github.com/pengpengyi92/dsh-quant/issues/109#issuecomment-6895809764).
  Not a FICC submission; its catalog and long-running intake stay unchanged.
- **Measure:** exact public Git commit/tree, LICENSE/NOTICE, example source and
  configuration, data-rights boundary, distinct submitter-reported versus maintainer
  execution status, and a docs-only diff. Peer static review independently
  corroborated the link-only decision.
- **Local checks:** `npm test` (build, typecheck, 362/362 unit cases) and
  `npm run test:ficc` (3/3 tests, 45 catalog records) passed. These are
  dsh-quant checks, not runs of the linked project.
- **Result:** relevant as a synthetic factor/IC teaching reference. Maintainer
  upstream execution `NOT_RUN`; numerical, performance and compatibility results
  `UNMEASURED`. No code/data imported, no upstream deps/install, no tools or
  workflows changed, no credentials or paid resources.
- **Trade-off:** a pinned link provides provenance, not a trusted execution
  capability or a guarantee about the upstream repository.
- **Next Action:** pass project checks and review before merging. Review the
  separate [parser/docs PR #168](https://github.com/pengpengyi92/dsh-quant/pull/168)
  against [#159](https://github.com/pengpengyi92/dsh-quant/issues/159) /
  [#160](https://github.com/pengpengyi92/dsh-quant/issues/160) independently.
  [#166](https://github.com/pengpengyi92/dsh-quant/issues/166) remains an open
  backtest accounting issue; not addressed here.
