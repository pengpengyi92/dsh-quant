# 0.92.0 delivery record — 2026-11-11

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
| Fresh release PR / merge CI | PENDING |
| Tagged publisher | NOT_ATTEMPTED_YET |
| GitHub Release | PENDING |
| npm 0.92.0 registry install | PENDING_PUBLICATION |

The full suite includes three new catalog tests. Changing the test import from
sync require(ESM) to dynamic ESM import preserves the declared Node 20 floor;
this local run itself used Node 24, and does not claim a full Node 20 run.

## Result and publication gate

The local source candidate is tested. Publish a GitHub source Release only
after the PR passes its own CI and merges. Push a new `v0.92.0` tag to start
one attempt through the existing `release.yml`; no secret is read or replaced.
Re-read the exact registry version afterwards. If authentication still fails,
report GitHub source release success separately and leave npm installation
requests #139/#140/#149 open.

## Trade-off

All external resources were reviewed through primary GitHub/source/license
evidence only, not installed, priced, backtested or certified. Wrappers and
examples are separately counted; source-available/unresolved license resources
are distinct. API data rights and commercial subscriptions remain separate.
Ratings are community evidence, not a prefilled maintainer score or endorsement.

## Next Action

Finish CI/merge/tag/release and append the actual URLs/results below. If npm
authentication blocks delivery, a maintainer must complete the official npm
login/token flow; never infer publication from a successful source build.
Then review new FICC submissions weekly and merge reviewed catalog PRs with credit.
