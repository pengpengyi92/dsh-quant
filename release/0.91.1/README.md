# 0.91.1 candidate evidence

Status: **locally verified release candidate; npm publication blocked**.

Update: the new `v0.91.1` tag now exists. Its real publishing attempt failed
with npm E404; see [DELIVERY-ATTEMPT.md](DELIVERY-ATTEMPT.md). The earlier
validation below remains candidate evidence, not registry acceptance.

- `audit.json`: registry/tag/release/CI inspection and original contribution lineage.
- `validation.json`: one candidate package hash, build/types, 298 tests and four consumer results.
- `pack.json`: complete npm package file manifest and integrity.
- `logs.zip`: command output, with temporary workspace paths normalized (no credentials).
- `DELIVERY-ATTEMPT.md` / `delivery-logs.zip`: real publisher E404 and Windows test results.
- `candidate-reproduction.json` / `candidate-acceptance-jobs.json`: successful exact-tag CI reproduction and four clean consumers.
- `candidate-receipts.zip`: downloaded rc.2 consumer receipt (tarball omitted).
- `verify-reproduction.mjs`: compare the downloaded candidate to the original hashes and Loader/call results.

| Pinned DSH cohort | Install / peers / real Loader / SMA | Registrations | Deterministic calls |
| --- | --- | --- | --- |
| 0.1.0-rc.6 | pass | 59 | 56/56 |
| 0.2.0-rc.2 | pass | 59 | 56/56 |
| 0.2.1-alpha.3 | pass | 59 | 56/56 |
| 0.2.1-rc.2 | pass | 59 | 56/56 |

Every row used the same local tarball recorded in `validation.json`. This does
not claim registry installation. Raw logs explicitly identify `local-tarball`.
The package can be recreated with `npm ci`, `npm run build`, and `npm pack
--ignore-scripts`; this evidence directory is outside the npm files allowlist.

For the blocking condition and exact registry verification commands see the
[delivery record](../../docs/maintenance/RELEASE-0.91.1-2026-10-18.md).
