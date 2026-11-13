# dsh-quant release verification

## Newcomer task readiness audit - 2026-11-14

- **Baseline**: 20 open/unassigned issues, 8 good-first labels, no open PRs; 7 labels describe broad intakes rather than one accepted scope. Five indicator-only smoke cases; parser missing values coerce to 0; three newcomer docs stale.
- **Change**: retain/refine #107, scope #159 from #1 and #160 from #109, remove 7 broad labels without closing discussions. Add prerequisites, files, counterexamples, acceptance commands and unchanged review/CI gates.
- **Measure**: GitHub full open-issue/PR/label read-back; inspect current source at c323eb7; synthetic parser probe plus failing assert.throws and valid zero-volume control; actual npm test and bench.
- **Result**: 337/337 existing tests pass; baseline bench passes five cases, local slowest 0.339ms with unseeded inputs (not a stable comparison). Parser regression probe deliberately fails as expected; no fix delivered. Read-back confirms exactly 3 open/unassigned starter issues, all help wanted. Source/runtime changes: none.
- **Trade-off**: fewer labels and only 2 new scoped issues reduce ambiguity; task specs are not implementations or independent proof of financial quality. Contributor uptake, review latency, PR success and performance improvement remain UNMEASURED.
- **Next Action**: maintain claim state on GitHub, review each actual contribution with counterexamples/full CI, credit accepted work, and re-triage stale scopes rather than adding tasks to meet a quota.

## Registry delivery and rc.5 - 2026-11-14

- **Baseline**: npm latest 0.90.0; official rc.5 CLI rejects its old peer ranges. Source release alone was not installable delivery.
- **Change**: publish accepted Linux 0.92.0 with official authorization; add rc.5 pins, shell-free Windows npm launch, valid registry dependency specs and selected-release-aware acceptance. Fix PR148 privacy and PR156 provenance/license boundaries separately.
- **Measure**: immutable source `5560929`, 490-file tarball receipt in `release/0.92.0/pack.json`; five pinned Linux cohorts, clean actual npm install -> shared peers -> real Loader -> SMA known answer -> 59 registrations -> 56 deterministic calls. Independent old0.90 negative controls and exact rc.5 CLI install.
- **Result**: npm exact/latest 0.92.0, SHA512 equals the accepted candidate; registry run [43503675329](https://github.com/pengpengyi92/dsh-quant/actions/runs/43503675329) and candidate run [43503610272](https://github.com/pengpengyi92/dsh-quant/actions/runs/43503610272) passed all five jobs. Local combined source suite 337/337. Old0.90 is rejected as expected; actual0.92 CLI add exits0.
- **Trade-off**: separate consumers avoid conflating manifest compatibility with package loading. Isolated CLI profile alone reports missing host peers on `pnpm peers check`; installed-package Loader consumers explicitly provide and validate one shared host. No force/exemption used. Desktop/Hub/model sessions and three live APIs remain UNVERIFIED; performance/financial outcomes UNMEASURED.
- **Next Action**: merge reviewed harness/evidence maintenance; separately verify Desktop and live services, and explicitly configure future automated publishing. Existing tags and contributor ancestry remain intact.

The records below retain historical failures and their original dates; they
are not the current npm status.

## ADIA provenance review fixes — 2026-11-14

- **Baseline**: PR head `a1bc4c5`; refresh relabelled historical manual search
  scope with a fresh timestamp and used a live repository license label for a
  separately pinned commit. The committed six-record snapshot matched upstream.
- **Change**: separate dated manual discovery evidence; known-repository-only
  refresh; identify a license only when the commit-specific API path/blob matches
  a pinned root license file. Keep repository-level SPDX as a separate observation.
- **Measure**: fixed offline API fixtures for discovery scope, absent license
  files, mismatched evidence, unidentified SPDX and differing live/pinned labels;
  compare every original historical record field with the reviewed head.
- **Result**: 9/9 scoped tests, actual `npm test` (build + typecheck + 333/333
  tests), script syntax, diff checks and historical-field comparison PASS.
  No live snapshot regeneration or upstream model/data execution. Model quality
  and performance remain **UNMEASURED**.
- **Trade-off**: one additional pinned license API read when a root license file
  exists; API errors stop generation. Identification is not a rights/legal audit.
- **Next Action**: finish local regression verification and commit for re-review;
  no remote publication or merge in this task.

## ADIA public research addition — 2026-11-12

- **Baseline**: master `1257d9b`; existing quant-history/quant-repo columns and
  Announcements DD posts; no dedicated ADIA dossier in the local archive.
- **Change**: nine-part Deep DD, independent Lab/QRD distinction, six pinned
  partner/community references, official job requirements and a proposed
  offline/online structural-break research protocol. No runtime/model change.
- **Measure**: source ownership/license metadata, commit pins, local links,
  document/evidence consistency and existing regression tests. Public-source
  reading is not an external-model reproduction or exhaustive legal audit.
- **Result**: source snapshot recorded; five documentation checks, standard
  `npm test` (build + typecheck + 329 tests), script syntax and diff checks pass. All external
  code execution is NOT_RUN; numerical quality, alpha, adoption, performance,
  and proposed detector implementation are **UNMEASURED**.
- **Trade-off**: useful navigation, but missing licenses, weights and current
  internal facts prevent direct code adoption or production claims.
- **Next Action**: finish scoped tests and delivery; review rights/data and
  freeze an independent experiment before adding a detector/tool.

## 0.92.0 FICC community milestone — 2026-11-11

- **Baseline**: master d3cfb158, package source 0.91.1, GitHub Release 0.91.0,
  npm latest 0.90.0; FICC tools/teaching threads existed but no dedicated repo hub.
- **Change**: 45 unique repo references + provenance/permission boundaries,
  generated directory/Discussion, intake Issue Form, ratings and weekly review.
  Version 0.92.0 also rolls up previously merged contributions without rewriting them.
- **Measure**: fixed offline suite on Node 24.18.0/npm 11.16.0, script/market types,
  directory completeness, duplicates, restricted license isolation and primary-URL guards.
- **Result**: local `npm test` 324/324, source/script/market types and catalog
  consistency PASS. New PR/merge/publisher evidence is in
  [delivery record](release/0.92.0/DELIVERY.md). External repo execution,
  numerical quality, adoption and financial performance remain **UNMEASURED**.
- **Trade-off**: broad source discovery is useful for navigation but no
  production certification. Source-available/unknown licenses and legacy tools
  remain explicitly separated; no fabricated community score.
- **Next Action**: finish release delivery, then review new submissions weekly;
  API/data/adapter validation is a separate experiment with fixed conventions.

## Historical 0.91.1 compatibility release delivery

## Baseline

npm `latest=0.90.0`; its old manifest fails the DSH 0.2.1-rc.2 host gate.
Source-only compatibility acceptance is not registry delivery acceptance.

## Change

Preserved hufeide's #136 contribution; #142 integrated bounded host ranges,
engine declaration and historical-runtime-safe call-ID typing. #143 prepared
0.91.1 without moving the older 0.91.0 tag. Add an exact-tag, four-cohort
candidate/registry delivery workflow with content-integrity checks.

## Measure

Fixed cohorts: 0.1.0-rc.6, 0.2.0-rc.2, 0.2.1-alpha.3, 0.2.1-rc.2.
Protocol: clean install -> shared peers -> real Loader -> known-answer SMA
-> 59 registrations -> 56 deterministic calls. Registry acceptance also
requires the reviewed tarball integrity, not just the source version string.

## Result

Candidate four-cohort checks and five CI jobs passed (linked in release
evidence). Independent Windows standard npm test: 298/298; script types and
56 calls pass. The v0.91.1 publisher passed tests but npm PUT returned E404.
Independent exact-tag candidate workflow 39113283541 passed all four clean
consumers and reproduced the original tarball byte-for-byte (480 entries).
Actual registry-consumer result: **UNMEASURED, publication blocked**.

## Trade-off

Four clean consumers cost repeated npm dependency installs. They distinguish
source compatibility, package contents and installation delivery rather than
treating one as proof of the others. Three network APIs/full UI are excluded.
No performance or live-profitability improvement is claimed or measured.

## Next Action

Complete official maintainer npm authentication, publish the immutable
reviewed candidate once, then pass registry acceptance before closing Issues.

## Market network-test maintenance (2026-10-26)

- Baseline: PR144 original head 0cbf089; explicit Node-only test types fail
  TS2552 (`RequestInfo`). Historical October 18 measurements are not new runs.
- Change: maintainer follow-up 744d99c preserves Yuren0312's original commit;
  runtime-derived fetch input type, exact truncation assertion, three shared
  network/HTTP/body-error cases. No production code changed. Explicit test
  typecheck added to the standard and four-cohort CI paths.
- Measure: fixed offline fixtures; Node 24.18.0 / TS 5.9.3; latest-master
  integration tree 77a0757b5daf2f1b06452cfb6a367fa6b2e77bd6; npm test and
  npm coverage protocol, separately native Node market-only coverage.
- Result: 317/317 full, 44/44 market tests; Node-only types PASS; npm protocol
  market lines 99.25%, overall 95.39%; native market-only lines 100.00%.
  All five PR CI jobs pass in run 40219495782. Merged tree equals tested tree.
- Trade-off: more fixture assertions and one fast compiler invocation per
  CI cohort; coverage protocols differ and are not pooled. Live endpoints,
  desktop UI, runtime speed improvement and registry delivery: UNMEASURED.
- Next Action: authenticate the npm maintainer through the official flow,
  then validate the immutable published candidate; no tag was changed here.
