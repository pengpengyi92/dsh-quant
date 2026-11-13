# Scoped First Contributions

Audited 2026-11-14 (Asia/Shanghai), baseline `c323eb7`. This is a small,
reviewed starting set, not a quota or a promise that every roadmap item is easy.
Task status and ownership on GitHub are authoritative; this list is a dated map.

## Available Starting Points

| Task | Evidence and scope | Skills | Acceptance brief |
|---|---|---|---|
| [#107: Extend benchmark smoke](https://github.com/pengpengyi92/dsh-quant/issues/107) | Five indicator cases only; add backtest/factor/drawdown, deterministic inputs; no math changes | Basic TypeScript / Node | [Benchmark task](contributor-tasks/107-benchmark-smoke.md) |
| [#159: Reject missing K-line numeric fields](https://github.com/pengpengyi92/dsh-quant/issues/159), from #1 | null/blank fields demonstrably become 0; one parser plus tests, preserve zero volume | Basic TypeScript / tests | [Parser task](contributor-tasks/parser-missing-numbers.md) |
| [#160: Correct newcomer documentation](https://github.com/pengpengyi92/dsh-quant/issues/160), from #109 | Three entrypoint docs have stale counts and unsupported automatic-publishing wording | Markdown / reading script output | [Documentation task](contributor-tasks/onboarding-docs.md) |

All three were open and unassigned at publication; do not infer a current claim
reservation from this document. No implementation is delivered by this audit.

## Claiming and Review

1. Open the linked issue, check assignees and linked PRs, then comment with a
   short approach. A maintainer confirms ownership; no automatic assignment.
2. Work from current master, follow [contributor rules](../CONTRIBUTING.md),
   and send one focused PR with actual commands and before/after evidence.
3. Maintainers review correctness, scope, counterexamples and CI. Labels do
   not waive null alignment, no-look-ahead, privacy or source-rights rules.
4. Close only the scoped task when complete. Long-term intake hubs stay open.
5. We thank contributors during review and after accepted merges, credit their
   work and welcome continued collaboration. No group membership is required.

## What Does Not Qualify Yet

- Broad intake hubs #1/#2/#3/#5/#12/#27/#109/#152: useful places to propose
  work, not bounded first tasks. Scope a child issue before adding this label.
- #105 Desktop install: needs exact environment/reproduction and host-level
  judgement; not proved fixed by CLI acceptance.
- #108 provider routing/geo failures: the fallback loop is in `verify.ts`, not
  a production retry chain in `fetchKlines`. Requires a routing/error/abort
  contract and provider-policy review first; no bypass instructions or blind
  retry/cache changes.
- #6 chart protocol, #16 options models and #112 market-making research need
  design/domain decisions before a bounded starter can be offered.

Support labels are not a substitute for scope. Keep general `help wanted`
where relevant, and remove misleading `good first issue` labels rather than
closing useful discussions or inventing tasks to reach a count.
