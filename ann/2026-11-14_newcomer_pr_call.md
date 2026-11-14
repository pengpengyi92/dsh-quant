# Your first dsh-quant PR: three real, scoped tasks / 欢迎新人一起贡献

2026-11-14 (Asia/Shanghai). We checked the current issues and code rather than
labelling a whole roadmap "easy". Here are three focused starting points:

| Task | What to change | What acceptance means |
|---|---|---|
| [#159: Missing numeric K-line fields](https://github.com/pengpengyi92/dsh-quant/issues/159) | One parser plus its offline tests; null/blank values currently become zero | Fail-before/pass-after regressions; valid zero volume remains valid; no silently dropped rows or changes to other providers |
| [#107: Benchmark compute paths](https://github.com/pengpengyi92/dsh-quant/issues/107) | Keep five indicator cases; add backtest/factor/drawdown, with deterministic inputs | 100 measured iterations per case; fixture creation/assertions outside timing; actual timings, unchanged math and smoke ceiling |
| [#160: Newcomer documentation](https://github.com/pengpengyi92/dsh-quant/issues/160) | Three entrypoint docs with stale counts/commands and publishing wording | Current source evidence, working links, offline/live-test distinction, no unsupported release or Desktop claims |

No account, API key, paid dataset or quantitative research model is required.
Full file boundaries, commands, counterexamples and non-goals are in each issue
and the [versioned task map](https://github.com/pengpengyi92/dsh-quant/blob/master/docs/GOOD_FIRST_ISSUES.md).

## How to claim / 如何认领

1. Check the issue's current assignees, comments and linked PRs. It was open and
   unassigned when we checked; GitHub's live state is authoritative.
2. Comment **"I'd like to work on this"** plus a short approach. A maintainer
   confirms ownership so two contributors do not unknowingly duplicate work.
3. Fork/branch from current master and send one focused PR linking the scoped
   issue. Include the actual commands/results, not just "tests pass".

Common baseline: `npm ci`, then `npm test`. Parser work also runs
`node --import tsx --test tests/market.spec.ts` and
`npm run typecheck:market-tests`. Benchmark work runs `npm run bench` twice
on identical inputs. Documentation work checks links and `git diff --check`.

## Friendly collaboration, unchanged review standards

Questions and small first contributions are welcome. We will give specific,
constructive feedback, thank you during review and after accepted merge, and
preserve contributor credit. Thanks for building with us; keep going!

The newcomer label is not automatic approval: scope, correctness, negative
controls, no-look-ahead/null alignment where applicable, privacy and CI still
apply. Do not post secrets or licensed/private data. No group membership is
required and no instant-merge deadline is promised.

这些任务是真实、可验证的小改动，不是凑数；我们欢迎讨论，也会认真 review。
This announcement does not implement or complete the tasks. Long-term intake
hubs remain open; only an accepted implementation PR completes a scoped issue.
