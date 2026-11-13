# ADIA Deep DD and Public-Code Research Map

- Title: Add ADIA to the existing dsh-quant DD columns.
- Recorded at: 2026-11-12T00:42:04+08:00, Asia/Shanghai.
- Base: `1257d9bd9fe3668f2d6498b0134c137034b0356c`.
- Branch: `codex/adia-dd-20261112`.

## Original Human Request

> ADIA看看有没有开源repo！！把ADIA也做一个全面dd，加入dsh-quant里面把！。我勒个豆。在discussion里面还是哪里，我们之前dd在哪里，就加在哪里。

## Placement and Decisions

Read AGENTS.md, mcp/AGENT_GUIDE.md and quant-history/DD_STANDARD.md.
Existing files use quant-history for firms, quant-repo for engineering, log
for process, and Announcements Discussions for research publications (e.g.
QRT #132). Reuse that structure. Do not change old dossiers or global counts.

Official 2025 Review, published in 2026, supersedes 2024 for the latest
annual baseline. Preserve 2023/2024 QRD headcount as dated historical data.
Read official Lab relationship/bios and the three complete Workable job
descriptions via the endpoint advertised in the official careers HTML.
Do not use salary aggregators or turn national-only programmes into global ones.

Six GitHub references are PARTNER or COMMUNITY, never ADIA_OFFICIAL.
Freeze owner/commit/root license metadata. Some APIs report null licenses;
crunch-cli README says MIT without a root license file, so flag the discrepancy.
The recent Apache-2.0 community source release lacks weights/intermediate
artifacts: useful to read, not independently reproduced. No source code copied.

Propose an offline/online structural-break study with PIT and negative controls,
but do not implement it, download competition data or report benchmark gains.
No private strategies, credentials, applications or personal relationship data
are included in this public DD. The Human requested repository/Discussion
publication, not a package release, deployment, contest entry or trading.

## Verification and Delivery

Verified 2026-11-12T00:46:31+08:00:

- `node scripts/adia-source-snapshot.mjs`: six public source records saved;
  no upstream installation or execution.
- `node --check scripts/adia-source-snapshot.mjs`: exit 0.
- `node --import tsx --test tests/adia-dd.spec.ts`: 5/5 pass.
- `npm test`: build + typecheck + 329/329 tests pass, zero failures/skips.
- `git diff --check`: exit 0.

These are documentation consistency and existing runtime regressions, not
fact-proof tests or independent ADIA-model validation. External model quality
remains UNMEASURED.

## Public Delivery

Verified 2026-11-12T00:49:16+08:00:

- Content commit `29176732483d8f4dfca900e406114b39d9b772c9` pushed to the scoped branch.
- [PR #156](https://github.com/pengpengyi92/dsh-quant/pull/156) is OPEN, not a main-branch merge.
- All five CI jobs on that content commit passed: test and four compatibility cohorts.
- [Discussion #157](https://github.com/pengpengyi92/dsh-quant/discussions/157)
  is in the existing **Announcements** category, matching previous DD publications.
- Remote body read back and matched `ann/2026-11-12_adia_deep_dd.md` after CRLF
  normalization; branch links and PR reference present. No duplicate discussion.
- Initial commit attempt lacked an author identity. Reused the repository's
  existing public noreply author per command; no global Git configuration changed.
- Final receipt/index update follows this content commit; no auto-merge,
  package-version bump, release, deployment or external-model execution.

## Independent Review Fixes — 2026-11-14

Reviewed head: `a1bc4c5cebd691857eccc3b89708117533b61361`. Two provenance
findings were reproduced independently: a metadata refresh claimed manual
discovery searches it did not perform, and a live repository license label
could identify a separately pinned revision without matching license evidence.
The Human authorized scoped fixes and a local commit on the existing branch,
not a push, merge, remote comment or work in other worktrees.

- Moved the reported 2026-11-12 manual discovery scope to
  `quant-repo/evidence/2026-11-12-adia-manual-search.json`. Its original
  recording date and non-exhaustive conclusion stay historical. Individual
  query results were not retained; this is not a machine-replayable search log.
- Metadata refreshes now declare six known repositories only and
  `discovery_search_performed=false`. They link the historical manual record
  instead of renewing its date, scope or institution-ownership conclusion.
- Retained the repository-level SPDX observation separately. Identification
  requires a root LICENSE/COPYING file and a matching path/blob from the
  license API at the resolved commit. Missing files, NOTICE alone, mismatches
  and unknown SPDX remain review-gated. API failures abort before any output.
- The original Apache LICENSE/NOTICE and README blobs were checked during
  the independent review. Added explicit pinned-content review provenance;
  every original field of all six records and both retrieval timestamps
  compares equal to the reviewed head. No changing metadata was regenerated.

Local verification on 2026-11-14:

- `node --import tsx --test tests/adia-dd.spec.ts`: 9/9 PASS. Four new offline
  regression tests cover refresh scope, missing root license files, mismatched
  evidence and disagreement between repository/pinned SPDX labels. API calls
  are injected fixtures; importing the script has no collection/write effects.
- Actual `npm test`: build + typecheck + 333/333 tests PASS, zero failures/skips,
  including all five Loader-composition tests, using existing node_modules.
- `node --check scripts/adia-source-snapshot.mjs`: PASS.
- `git diff --check`: PASS.
- Compared all original historical snapshot record fields and retrieval
  timestamps against `a1bc4c5`: unchanged.

Limits: the changed collector was not run against live GitHub; its request
shapes were checked against GitHub's documented license `ref` parameter and
tested with deterministic API fixtures. No external code/model/data execution,
new dependencies, paid calls, package release or remote publication. Existing
institution/hiring research limits remain unchanged. Only this worktree's
ADIA scope was edited; the workspace-level project index was left untouched
under the Human's exclusive-worktree instruction. Fixes await re-review.
