# Issue 149, registry delivery and scoped PR review

Started: 2026-11-14 (Asia/Shanghai). Checkpoint: 2026-11-14T04:35:53+08:00.

## Baseline

- Maintenance base: `1acbf8d653a15e32edd4a83b974094ea61bc6aba`.
- npm latest was 0.90.0; exact 0.92.0 returned E404. GitHub tag/release was not npm delivery.
- Issue 149 reported DSH 0.2.1-rc.5 rejecting old plugin peer ranges. Initial response: https://github.com/pengpengyi92/dsh-quant/issues/149#issuecomment-6863951743.
- PR148 and PR156 were open; both needed substantive corrections before merge.

## Compatibility and artifact evidence

- Official rc.5 CLI installed in an isolated, ignored test directory. DSH_HOME and DSH_AGENTS_HOME point only there; normal user profiles were not used.
- Actual `dsh plugin --profile web add dsh-quant@0.90.0` rejected before install, naming the old ^0.1.0-rc.5 peers. No exemption, force or legacy-peer-deps was used.
- Independent npm consumer negative control also failed ERESOLVE as expected for 0.90.0 + rc.5.
- Existing Linux candidate acceptance https://github.com/pengpengyi92/dsh-quant/actions/runs/43501409148 passed all four original cohorts.
- Exact immutable release source: `556092969e7d1b4095f1872445d41321b743a8f3`. No tag was moved.
- Accepted Linux candidate: 1,477,591 bytes; 490 files; SHA256 `90a840dc02cb576f7390f5fb4fa183eb00b6cbc0257031f447a98e165b06f9e6`. Receipt: `release/0.92.0/pack.json`.
- Local `node scripts/consumer-runtime.mjs 0.2.1-rc.5 <accepted-tarball>` passed clean install, shared peers, actual Loader, 59 registrations, SMA `[null,null,2,3,4]`, and 56 deterministic calls. Three live APIs remain UNVERIFIED.
- This Windows Node 24 test is not proof of the reporter's complete Linux/Node26/Hub environment or Windows Desktop UI.

## Harness repair and actual tests

- The first registry-control attempt failed EINVALIDTAGNAME because the harness used `dsh-quant@0.90.0` as the dependency value. That was a harness error, not the compatibility reproduction. Fixed to the exact version and added regression tests; the subsequent control produced the expected ERESOLVE.
- Windows npm subprocess launch initially could not execute npm.cmd directly. Added a shell-free npm JS entry wrapper, preserving argument boundaries.
- Added exact rc.5 pins to CI and acceptance. Acceptance now records the current harness SHA separately from the immutable tagged package SHA.
- Actual maintenance `npm test`: build, typecheck and 327/327 tests passed; zero failures/skips. `npm run typecheck:scripts` and `git diff --check` passed.
- No performance, returns or live API improvement is claimed.

## Review corrections

- PR148: removed personal applicant/correspondence details and unsupported general eligibility dates; retained programme-specific caution. Fix: `250d913eb1a9f2f16b9e8332e5182fed51f5fe20`. Sanitised evidence records unchanged unrelated sections, links, tables and private-marker absence, without reproducing private values.
- PR156: separated dated manual discovery from metadata refresh, and bound license identification to pinned path/blob evidence. Fix: `a701f937b94d11219e34e2631eb00501cb075b0f`; nine ADIA tests, full 333/333 suite passed. Historical values/timestamps preserved; new collector live execution remains NOT_RUN.
- Both fixes pushed normally to their existing PR branches. No history rewrite, independent human approval or merged status is claimed at this checkpoint.

## Publication checkpoint

Official maintainer login succeeded. Publishing the accepted tarball requested a separate official browser authorization; awaiting Human confirmation at this checkpoint. No password, OTP, token or authentication URL is stored here. Automated GitHub publishing credentials have not been changed. Publication, actual registry acceptance, merges and community acknowledgements must be recorded below after they happen.

## Delivery update - 2026-11-14T04:39:00+08:00

- Human completed official publish authorization; `npm publish <accepted-tarball> --ignore-scripts --access public --registry=https://registry.npmjs.org` exited 0 with `+ dsh-quant@0.92.0` and a registry-processing notice.
- Initial post-publish exact lookup still returned E404. The official rc.5 install returned ERR_PNPM_NO_MATCHING_VERSION and a Windows libuv assertion after that error. These are recorded failures, not successful registry acceptance or proof of a new plugin defect. Await propagation; do not close Issues yet.
- PR148 current-head CI run 43502990801: all five jobs passed; merged at `cf140fb405da9703ff42822469e72aa18d065c86`, 2026-11-13T20:37:58Z.
- PR156 current-head CI run 43502996320: all five jobs passed; normal merge command succeeded. Exact merge receipt will be recorded after read-back.
- Maintainer review comments were posted on both PRs; no self-approval was submitted.
