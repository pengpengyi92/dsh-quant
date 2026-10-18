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
