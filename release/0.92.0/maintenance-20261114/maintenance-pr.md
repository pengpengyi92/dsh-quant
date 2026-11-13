## Scope

Follow up #149 with an actual rc.5 host reproduction and repair the release acceptance path. Preserve immutable tags and existing contributor ancestry.

- Add exact DSH 0.2.1-rc.5 pins to CI and release acceptance.
- Fix invalid registry dependency syntax in the consumer harness; add negative-control regression tests.
- Launch npm shell-free on Windows and bound test-directory cleanup.
- Separate current acceptance harness from immutable tagged source; preserve the reviewed Linux tarball receipt.
- Record actual old-package rejection, candidate acceptance, review fixes and publication checkpoints in the maintenance log.

## Verification

- Local `npm test`: 327/327 passed (build + typecheck included).
- `npm run typecheck:scripts`, YAML parse and `git diff --check`: passed.
- Official rc.5 CLI rejected published 0.90.0 with the reported peer-range error. No allow-version, force or legacy-peer-deps.
- Immutable 0.92.0 Linux candidate passed four Linux consumers in run 43501409148 and a clean local rc.5 real Loader consumer (59 tools, 56 deterministic calls).
- Official npm publish returned success for that exact tarball; registry propagation/installation is a separate acceptance step, not implied by publish success.

Not verified: three live APIs, full Desktop/Hub/model sessions, reporter's exact Node26/Linux combination. GitHub publishing credentials were not changed. This PR does not close compatibility issues until registry acceptance is recorded.
