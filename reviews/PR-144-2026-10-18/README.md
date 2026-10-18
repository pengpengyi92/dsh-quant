# PR #144 evidence snapshot

Contributor: **Yuren0312**. Status: **changes requested, not merged**.

See the [full independent audit](../../docs/maintenance/PR-144-2026-10-18.md).

- `validation.json`: exact source identities, independent results and limits.
- `ci-jobs.json`: authenticated GitHub job results, after maintainer approval.
- `review.json`: the formal review identity/state and original commit anchor.
- `logs.zip`: raw local test, coverage, type-error, isolation and mutation logs;
  the isolation runner is included. No credentials, dependencies or model data.
- `SHA256SUMS.json`: content hashes for the evidence payloads (not itself).

Reproduction uses the original PR head or its documented local merge, not
this documentation-only archival branch. To repeat the isolation check,
extract the runner from `logs.zip` into `<checkout>/.review-144/`, then run
`node --test .review-144/isolation-runner.mjs`. It asserts the 16 original
tests restore a network-denying fetch sentinel after every case and never
invoke it. This checks default serial execution, not concurrent test safety.

The two temporary source mutations were reverted immediately. Their surviving
41-test runs are assertion-strength probes, not accepted source changes.
