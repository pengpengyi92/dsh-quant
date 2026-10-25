# Maintainer triage and PR144 acceptance - 2026-10-26

Date: Asia/Shanghai (CI UTC dates are October 25). Scope: current open PRs,
reported installation failures and bounded maintenance, not a package release.

## Verified outcome

- Reviewed the actual GitHub open queues: one PR and 22 Issues initially.
- Corrected and merged [PR144](https://github.com/pengpengyi92/dsh-quant/pull/144).
  [Issue106](https://github.com/pengpengyi92/dsh-quant/issues/106) closed
  automatically at `2026-10-25T18:06:59Z`, after acceptance.
- Retained Yuren0312's original commit
  `0cbf0899fbd78bc8dfbd77a39bcf289c84edb8d6`; maintainer follow-up is
  `744d99c9c6e9c0c69b263cbabc0f36ad7901a470`. No contributor history rewrite.
  `maintainerCanModify=true` was checked before the normal, non-force push.
- Actual merge: `f9f761a5c3e9f01515343bc49ddfc7435d7eef5c`.
  Its tree `77a0757b5daf2f1b06452cfb6a367fa6b2e77bd6` equals the independently
  tested local integration tree (local commit `92c1a9ef7686ea5f7263d73ef8db3d83049b4238`).
- Original review was CHANGES_REQUESTED. Re-reviewed the corrected exact head,
  formally approved, then merged only after five new CI jobs passed.
- Added a follow-up `typecheck:market-tests` command and CI gate in the standard
  job and all four compatibility cohorts; source-only typecheck misses tests.
  This follow-up changes no production source or dependency versions.

## What was corrected

The original `RequestInfo` annotation fails the repository's Node-only compiler
contract with TS2552. Replaced it with
`Parameters<typeof globalThis.fetch>[0]`, without adding DOM libraries.
Strengthened the HTTP truncation check from prefix-only to an exact message.
Added three tests covering shared-provider network errors, HTTP body truncation
and already-consumed response bodies. Every fetch replacement is restored in
`finally`; fixtures are synthetic/offline, not external price downloads.

An intermediate maintainer test mock attempted to replace `Response.text` and
failed TS2540 because the Node declaration is read-only. That intermediate
implementation was replaced with a real consumed Response before commit.
The passing final typecheck is not a claim that the intermediate check passed.

## Independent local test receipt

Environment: Windows, Node 24.18.0, npm 11.16.0, TypeScript 5.9.3, existing
dependencies (no new dependency installation). Base: current master
`8bd95a5c8ee95a0c9ee47fc0dc85baddcafb6153`. Measured integration tree above.
Test input: synthetic constants in `tests/market-fetch.spec.ts`, SHA-256
`bcaf13b1d34f07698df6936ec60529e7cde8555bfce95faa092639f91ef767fc`.

| Exact command / protocol | Exit | Observed result |
| --- | --- | --- |
| `node node_modules/typescript/bin/tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --skipLibCheck --allowImportingTsExtensions --lib ES2022 --types node tests/market-fetch.spec.ts` (original) | 1 | TS2552, RequestInfo missing |
| Same explicit command on corrected file | 0 | PASS |
| `node --test tests/market-fetch.spec.ts tests/market.spec.ts tests/market-sina.spec.ts tests/market-yahoo.spec.ts` | 0 | 44 pass, 0 fail, 0 skip |
| `npm test` (corrected fork, then current-master integration) | 0 | 317 pass, 0 fail, 0 skip on each; build/source types included |
| `npm run typecheck:scripts` | 0 | PASS |
| `npm run bench` | 0 | Existing five cases, slowest 0.335 ms; no controlled speedup claim |
| `npm run test:cov` (full suite with tsx) | 0 | 317 pass; market.ts line 99.25%, branch 95.52%; overall line 95.39% |
| `node --experimental-test-coverage --test tests/market-fetch.spec.ts tests/market.spec.ts tests/market-sina.spec.ts tests/market-yahoo.spec.ts` | 0 | 44 pass; market.ts line 100.00%, branch 95.71% |
| `npm run typecheck:market-tests` (follow-up, same explicit Node contract for all four files) | 0 | PASS |
| `git diff --check` | 0 | PASS before maintainer commit |

Do not pool the native Node and tsx instrumentation results. The contributor's
original 98.74% is a historical measurement of the earlier head, not the new
head's result. All results above are independently observed, not self-reported.

Local generated full-test log finished `2026-10-25T18:05:15.7443714Z`;
coverage log `18:04:51.2619998Z`; native coverage log `18:06:04.3427492Z`.
Local raw log fingerprints (not bundled into npm):

- Full suite: `8d4ddf3ec78a91b862d946c69eb47301e3533973c1a0b5eb2b177616ca5fbfbf`.
- npm coverage: `da01cc53c26c2e901cbcc57bdd9220b0f7cb19b4cc6993e470f4a9dde4f25efc`.
- Native coverage: `1d040d5a671c0c4c69a4a935d49a8ad33ae3f3e4f3cd413050e8d6142a16eec8`.

## Remote CI evidence

[Run40219495782](https://github.com/pengpengyi92/dsh-quant/actions/runs/40219495782)
on corrected head `744d99c` completed SUCCESS on all five jobs: test plus
DSH 0.1.0-rc.6, 0.2.0-rc.2, 0.2.1-alpha.3 and 0.2.1-rc.2. The run initially
required external-contributor approval; the maintainer approved the reviewed
workflow. Compatibility jobs include real packed-Loader consumers. No publish
workflow or package tag was triggered by this maintenance change.

The added Node-only CI gate is a separate follow-up; its own PR checks are the
authoritative remote acceptance evidence for the new gate, not the older run.

## Remaining queue (21 open Issues after closing 106)

| Priority / Issues | Decision and next action |
| --- | --- |
| P0: 139, 140 | Same compatibility delivery request. Keep both open pending actual registry delivery. npm latest/dist-tags still 0.90.0; exact 0.91.1 lookup E404; local `npm whoami` ENEEDAUTH. Do not retry publishing blindly or move existing tags. Official maintainer authentication is required. |
| P1: 105 | Desktop installation not reproduced. Posted a precise request for desktop/bundled tool versions, steps and redacted first error. Engines metadata alone does not prove the DepGraph root cause. CLI/Loader compatibility is not desktop evidence. |
| P2: 107 | Benchmark still has only five indicator cases. Backtest/factor/risk extension remains genuine work, not falsely closed because the old smoke passes. |
| P2: 108 | Provider retry/failure contract needs scoped design and fake-response tests. No production failover change made here. Provider access restrictions must be respected; do not bypass them. |
| Roadmap: 112, 16, 14, 9, 6 | Market making, options, FICC, architecture and UI direction. Retained as roadmap; no untested feature-completion claim. |
| Community: 109, 27, 17, 12, 5, 4, 3, 2, 1 | Contribution/data/research invitations. Retained rather than closing open-ended collaboration threads for age alone. |
| Ecosystem: 51, 40 | Inclusion/directory threads retained; no new listing or outreach claimed. |

Desktop follow-up:
[Issue105 comment](https://github.com/pengpengyi92/dsh-quant/issues/105#issuecomment-6401261190).
No repeated unchanged-status comments were added to 139/140. This pass does not
claim to implement the entire roadmap or validate external listings.

## Limits and next action

No npm publish, tag movement, release announcement, paid API use, trading,
live endpoint verification, desktop/model session or performance optimization.
The immutable 0.91.1 release candidate remains independent of the new tests.
Best next action: complete official npm authentication, then run the documented
exact-candidate publication/registry-consumer acceptance; only then close
139/140. Never paste tokens into Issues, commits or chat.
