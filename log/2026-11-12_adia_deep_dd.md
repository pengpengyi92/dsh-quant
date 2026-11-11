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
