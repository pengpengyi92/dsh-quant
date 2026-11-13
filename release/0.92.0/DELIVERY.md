# 0.92.0 delivery record — 2026-11-11

**Current update (2026-11-14): npm 0.92.0 is published, latest is 0.92.0, and
five exact registry consumers pass.** See the appended delivery completion
below; the November 11 failures are preserved as historical evidence.

## Baseline

- Inspected master: `d3cfb15895bafd83d39abd722cfd552c14d9c586`.
- Latest formal GitHub Release before this update: `v0.91.0` (2026-09-18).
- Existing source/tag `0.91.1` identifies the reviewed October candidate;
  its npm publish failed with E404. The tag remains immutable.
- Fresh npm preflight: `latest=0.90.0`, local `npm whoami=ENEEDAUTH`.
- All five current-master CI jobs passed in [42992678148](https://github.com/pengpengyi92/dsh-quant/actions/runs/42992678148).

## Change

New 45-repo FICC directory and JSON source, generated README/Discussion,
submission Issue Form, five-axis evidence-based ratings and weekly review/PR
admission. Public hub [#151](https://github.com/pengpengyi92/dsh-quant/discussions/151)
and intake [#152](https://github.com/pengpengyi92/dsh-quant/issues/152) are open.
Existing FICC threads #124–129 are indexed, not recreated.

Version 0.92.0 is a content/community milestone with the already merged
compatibility, JSON/Kupiec, market-test and SiftingIO fixes. No breaking API,
new quantitative tool or dependency was added. The old tags are preserved.

## Measure

Node 24.18.0 / npm 11.16.0, existing locked dependencies; fixed offline tests.

| Check | Result |
|---|---|
| `npm test` (includes build + source types) | 324 pass, 0 fail/skip |
| `npm run typecheck:scripts` | PASS |
| `npm run typecheck:market-tests` | PASS |
| `npm run test:ficc` and generator consistency | PASS |
| Catalog source/metadata review | 45 unique repo references; NOT_EXECUTED |
| Fresh release PR / merge CI | PASS, five jobs each |
| Tagged publisher | Tests/build PASS; npm PUT E404 |
| GitHub Release | PUBLISHED, v0.92.0 source release |
| npm 0.92.0 registry install | BLOCKED, exact version lookup E404; latest remains 0.90.0 |

The full suite includes three new catalog tests. Changing the test import from
sync require(ESM) to dynamic ESM import preserves the declared Node 20 floor;
this local run itself used Node 24, and does not claim a full Node 20 run.

## Actual result and public receipts

- [PR #153](https://github.com/pengpengyi92/dsh-quant/pull/153), head
  `407bd8977cdb407362336a8d89298f9c91a45290`, merged after independent review
  and [five green PR jobs](https://github.com/pengpengyi92/dsh-quant/actions/runs/43025101779).
- Merge/tag source: `556092969e7d1b4095f1872445d41321b743a8f3`;
  [post-merge CI](https://github.com/pengpengyi92/dsh-quant/actions/runs/43025261740)
  also passed all five jobs. New `v0.92.0` identifies that source; old tags remain fixed.
- [GitHub Release](https://github.com/pengpengyi92/dsh-quant/releases/tag/v0.92.0)
  published, with [update and contributor thanks #154](https://github.com/pengpengyi92/dsh-quant/discussions/154).
- [Publisher 43025403748](https://github.com/pengpengyi92/dsh-quant/actions/runs/43025403748)
  passed install, build, 324 tests and tag/version equality; final npm publish
  at `2026-11-11T13:02:05Z` returned **E404**, `PUT https://registry.npmjs.org/dsh-quant`.
  This does not distinguish expired credentials from insufficient permissions.
- Independent bounded registry queries afterwards: exact 0.92.0 is absent;
  `latest=0.90.0`. npm is **not published**. No secret was read, printed or changed;
  no blind retry or new version was used to work around authentication.
- #139/#140/#149 remain open. DSH rc.5 desktop itself remains outside the
  four historical compatibility cohorts, independently of npm authentication.
- GitHub interpreted a negated closing-keyword sentence in #153 as an Issue
  closure and closed #139 at `13:00:37Z`. The PR text was corrected and #139
  reopened at `13:07:25Z`; it is not considered resolved by this source release.
- FICC weekly follow-up created in Codex: `dsh-quant-ficc`, ACTIVE, Monday
  09:30 Asia/Shanghai; scan/triage/prepare reviewed changes, not unattended merge.

This post-release receipt updates documentation after the immutable tag; it
does not move the tag or claim a different package was published.

## Trade-off

All external resources were reviewed through primary GitHub/source/license
evidence only, not installed, priced, backtested or certified. Wrappers and
examples are separately counted; source-available/unresolved license resources
are distinct. API data rights and commercial subscriptions remain separate.
Ratings are community evidence, not a prefilled maintainer score or endorsement.

## Next Action

A maintainer must restore accepted npm publishing authentication through the
official login/token flow, then publish the existing reviewed 0.92.0 source
and run exact registry-consumer acceptance. No token should be shared in chat.
Continue weekly FICC submission review and merge reviewed catalog PRs with credit.

## Delivery completion - 2026-11-14

Official maintainer login and a separate browser publish confirmation completed.
The exact Linux artifact from [candidate run 43501409148](https://github.com/pengpengyi92/dsh-quant/actions/runs/43501409148)
was published once using `npm publish <tarball> --ignore-scripts --access public`.
No secret or authorization URL was copied into the repository. No old tag moved.

- Source SHA: `556092969e7d1b4095f1872445d41321b743a8f3`.
- Artifact: 1,477,591 bytes, 490 files, SHA256 `90a840dc02cb576f7390f5fb4fa183eb00b6cbc0257031f447a98e165b06f9e6`.
- Exact npm 0.92.0 and latest confirmed. Dist integrity matches [pack.json](pack.json).
- [Candidate run 43503610272](https://github.com/pengpengyi92/dsh-quant/actions/runs/43503610272) and [actual registry run 43503675329](https://github.com/pengpengyi92/dsh-quant/actions/runs/43503675329): five Linux cohorts each PASS, including rc.5; shared peers, real Loader, SMA, 59 registrations and 56 deterministic calls.
- Official rc.5 CLI on Windows/Node24: `dsh plugin --profile web add dsh-quant@0.90.0` rejected; identical command targeting 0.92.0 exited0. Isolated profile only, no allow-version/force/legacy-peer-deps. Its standalone peer check warns that host peers are not in the profile directory; real Loader consumers separately validate shared host dependencies.
- First lookup/install immediately after publish still failed while npm processed the package. Later exact/latest/integrity and install checks passed. Failed attempts remain in the maintenance log, not counted as passes.
- Current combined maintenance source tests: 337/337; those source-only maintenance changes do not alter the immutable published tarball.

Three live APIs, full Desktop/Hub/model sessions and the reporter's exact
Node26/Linux combination remain unverified. Future automated publishing is
not repaired by this local login; the old GitHub publisher credential was not
read, copied or changed. Detailed [maintenance log](../../log/2026-11-14_maintenance-149-release-and-pr-review.md).
