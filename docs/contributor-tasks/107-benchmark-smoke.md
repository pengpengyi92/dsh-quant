## Goal and confirmed gap

Maintainer-scoped on 2026-11-14, against `c323eb7`. This refines existing #107,
not a second benchmark issue. Comment here to claim it; no implementation PR
was open at the audit. Basic TypeScript and Node experience is sufficient;
no trading account, API key, paid data or research model is needed.

`benchmark/smoke.ts` times only five indicator cases. Backtest, factor and
drawdown paths are still absent. Its generator also uses unseeded Math.random,
so repeated runs do not have the same inputs.

## Bounded change

Work in `benchmark/smoke.ts`; do not change domain mathematics or public tools.
Replace unseeded inputs with fixed synthetic inputs, prepared outside timing.
Keep the five existing cases and add exactly these three:

1. `backtestMaCross(close365, 5, 20, 0.001)` from `src/dsh-ml/backtest.ts`.
2. `factorEvaluate(factor240, returns240, 5, 20, 5)` from `src/dsh-alpha/factor.ts`.
3. `drawdownAnalysis(equity10k)` from `src/dsh-risk/drawdown.ts`.

Use finite, positive close/equity fixtures and nonconstant factor/return
vectors. Factor inputs are one ordered series, **not a flattened multi-asset
panel**. Preserve the function's existing lag convention. This replaces the
original issue's unsuitable "100 symbols x 240 bars" suggestion. Walk-forward
and production-scale benchmarks are separate follow-ups, not this first PR.

## Acceptance checklist

- [ ] All eight named cases execute on deterministic inputs, with an untimed warmup.
- [ ] Each case runs 100 measured iterations and prints average milliseconds per call, not the total mislabelled as an average.
- [ ] Input generation, logging and correctness assertions stay outside timed loops.
- [ ] Untimed checks cover output lengths/finite summary values; reuse the existing hand-computed examples for correctness, without changing their expected answers.
- [ ] Timing summaries reject non-finite values and retain the existing 2000ms smoke ceiling. Do not tighten it based on one machine.
- [ ] Two `npm run bench` invocations use identical inputs/case definitions; timing values may differ normally.
- [ ] Record Node version, commands and actual output in the PR. No invented speedup or universal performance claim.
- [ ] `npm test` passes; no new dependency, API call, package bump or numerical change.

## Start and review

Read `benchmark/smoke.ts`, `tests/backtest.spec.ts`, `tests/factor.spec.ts` and
`tests/drawdown.spec.ts`. From the repository root:

```sh
npm ci
npm run bench
npm test
```

One focused PR may use `Closes #107`. Maintainers review deterministic inputs,
timing boundaries, unchanged math and full CI. A label does not waive review;
we will credit the contributor and thank them after an accepted merge.
