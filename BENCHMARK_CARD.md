# 0.91.1 compatibility release delivery

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
