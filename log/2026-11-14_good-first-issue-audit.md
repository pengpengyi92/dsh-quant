# Evidence-based newcomer issue triage

Timestamp: 2026-11-14T04:56:13+08:00 (Asia/Shanghai).
Audited code: `c323eb7c97e7c8eabbdbb8e08c372a0237e867b6`.

## Request and Standard

Identify real, useful work in existing open issues, prepare bounded
`good first issue` tasks, preserve review standards and push the record.
Do not create a quota of easy-looking issues or implement the work before
newcomers can claim it.

Require a verified current gap, a focused file boundary, deterministic
acceptance commands, counterexamples, no paid/private dependency, and no
unresolved domain/architecture decision. Check assignees and existing PRs.
Scope and guidance reduce onboarding friction; they do not waive review/CI.

## Complete Open-Issue Audit

Initial API query returned 20 open issues, all unassigned, and no open PRs.
Eight issues carried `good first issue`; seven were broad intake hubs.
No external bug report, congratulation or directory invitation was rewritten.

| Existing issue | Decision and evidence |
|---|---|
| #1 data quality | Keep intake open/help wanted; remove overly broad newcomer label. Reproduced parser gap scoped separately as #159. |
| #2 data interfaces | Keep intake open/help wanted; source rights/access vary. No single defined fix. Remove newcomer label. |
| #3 factor research | Keep intake open/help wanted; many originally requested functions now exist. No invented new metric. Remove newcomer label. |
| #4 LLMQuant appreciation | Not an implementation task; preserve community thread unchanged. |
| #5 R&D workflows | Keep discussion/help wanted; not one bounded deliverable. Remove newcomer label. |
| #6 UI/chart protocol | Requires protocol/UI design and host integration; not starter-ready. |
| #9 domain positioning | Architecture statement, not a missing bounded implementation. |
| #12 execution ecosystem | Matching/slippage/margin models need domain decisions; keep help wanted, remove newcomer label. |
| #14 FICC/design announcement | Historical release/design statement, not an implementation assignment. |
| #16 options roadmap | SVI/GARCH/quoting/hedging need model conventions and evidence; not starter-ready. |
| #17 BTC experiment/data cooperation | Broad data/research methodology; no new first-task label or unverified data claim. |
| #27 five-plugin intake | Keep intake/help wanted; remove broad newcomer label, no duplicate implementation issue. |
| #40 directory invitation | Community correspondence; no independent coding task or external signup. |
| #51 listing notice | Community correspondence; no fabricated listing verification task. |
| #105 Desktop install | Needs exact host/environment reproduction; CLI success is not Desktop proof. Keep bug open, not a starter. |
| #107 benchmark smoke | Verified still only five indicator cases; retain label, add help wanted, refine same issue to deterministic inputs and three named compute paths. |
| #108 geo/failover | No production retry chain in current fetchKlines; fallback helper is in verify.ts. Needs routing/error/cancellation/provider-policy design; keep help wanted, no newcomer label. |
| #109 plugin/resource intake | Keep hub/help wanted; remove newcomer label. Verified stale contributor docs scoped as #160; publish one curated-task update here. |
| #112 market-making features | Domain research/feature catalogue, not a bounded first implementation. |
| #152 FICC resources | Keep ongoing intake/help wanted; no preselected verified resource gap to manufacture a task. |

## Three Claimable Tasks

1. [#107](https://github.com/pengpengyi92/dsh-quant/issues/107): update the
   existing benchmark issue, not a duplicate. One benchmark file; five old
   cases plus backtestMaCross/factorEvaluate/drawdownAnalysis, deterministic
   inputs, 100 iterations and unchanged smoke ceiling. Remove the unsuitable
   multi-asset flattening suggestion and defer walk-forward.
2. [#159](https://github.com/pengpengyi92/dsh-quant/issues/159), derived from #1:
   one pure parser and tests. Missing raw numeric fields become zero via
   Number coercion; reject them while retaining legitimate zero volume.
3. [#160](https://github.com/pengpengyi92/dsh-quant/issues/160), derived from
   #109: three newcomer entrypoint docs have stale counts and unqualified
   automatic-release wording. Correct evidence/commands, not a blind replace.

Every card includes evidence, files, prerequisites, explicit non-goals,
acceptance checkboxes, commands, claim workflow and unchanged review standards.
No one assigned automatically. Scoped tasks, not parent hubs, are completed
when accepted PRs land. No task was implemented or declared fixed here.

## Actual Reproduction and Checks

- `npm test`: build + typecheck + 337/337 tests PASS, zero failures/skips.
- `npm run bench`: five existing indicator cases PASS. Observed average ms:
  sma1k 0.015, sma10k 0.064, ema10k 0.049, rsi10k 0.126, macd10k 0.339;
  slowest0.339ms. Existing inputs use Math.random; this is one local snapshot,
  not a reproducible performance comparison or an improvement claim.
- Read-only synthetic parser probe on `parseKlines`: open=null, empty string
  and whitespace each produce actual0. A separate zero-volume control passes.
  No live exchange payload or financial loss is claimed.
- Deliberate `assert.throws` probe for null open: exit1 with
  `AssertionError: Missing expected exception`. This is the reproduced missing
  guard, not failure of the existing 337-test suite or a delivered fix.
- Source reading confirmed three entrypoint docs still say46 tools, some
  pin174 tests/four Loader cases, and CONTRIBUTING claims automatic publication;
  compare current package/runtime/release evidence.
- Label changes read back: exactly #107/#159/#160 carry good-first labels,
  each also help wanted and open/unassigned at that checkpoint. Seven broad
  labels removed, all original hubs retained open. Total open issues becomes22.

## Public Review Guidance

- Scope correction in #108: https://github.com/pengpengyi92/dsh-quant/issues/108#issuecomment-6864802527.
- Curated task/label explanation in #109: https://github.com/pengpengyi92/dsh-quant/issues/109#issuecomment-6864804089.
- One inline-shell comment attempt for #107 exited1 without a URL. Its issue
  body edit succeeded independently. Check read-back before retrying; a failed
  command is not counted as a posted comment.
- Contributor thanks during review and after merge remains required;
  no automatic acceptance, group requirement or promised review deadline.

## Delivery Boundary

Only task specifications, onboarding links, maintainer guidance and this
audit are changed. No src/tests/benchmark code, package version, publishing
credentials, API calls, group or automation change. Actual contributor uptake,
PR success/latency and performance improvements remain UNMEASURED.
Documentation validation, final metadata and commit/CI receipts follow after execution.

## Verified Publication and Documentation Checks

- #107 safe retry posted once after verifying the failed attempt left zero
  comments: https://github.com/pengpengyi92/dsh-quant/issues/107#issuecomment-6864844829.
- Exact published bodies for #107/#159/#160 match their versioned task cards
  after newline normalization. Each read back OPEN with zero assignees.
- Final full API read-back:22 open issues; starter set exactly107/159/160.
  All seven relabelled intakes remain OPEN with help wanted. No contributor
  assignment or existing contribution was overwritten.
- Read-only Node validation: seven task/index links resolve or use valid
  primary GitHub URLs; code fences balance and each task includes checkboxes,
  npm test and review guidance. PASS.
- `git diff --exit-code c323eb7 -- src tests benchmark package.json package-lock.json .github/workflows`: PASS. No task implementation, dependency or CI change hidden in this documentation delivery.
- `git diff --check`: PASS.
- Changes will be pushed through a focused documentation PR; CI must pass
  before merge. Do not use task-closing keywords for this triage PR.

## Merge Receipt - 2026-11-14T05:05:21+08:00

- Task-curation [PR161](https://github.com/pengpengyi92/dsh-quant/pull/161)
  merged normally as `83594d92c8c41c76c0dd7b98788b2f827878fde3`.
- Tested head: `fb4a2b65a551646000007a326fe7792b9b24d23d`.
- [CI43507290702](https://github.com/pengpengyi92/dsh-quant/actions/runs/43507290702):
  all six jobs PASS (test plus five compatibility cohorts).
- Maintainer scope review was recorded as a comment, not a self-approval or
  a claim of independent review. No admin bypass or tag change.
- GitHub `closingIssuesReferences` was empty before and after merge; no
  newcomer task or ongoing parent intake was completed by the documentation PR.
- This final receipt is documentation-only; runtime, tasks and package version
  remain unchanged. Remote commit state is authoritative for the receipt itself.
