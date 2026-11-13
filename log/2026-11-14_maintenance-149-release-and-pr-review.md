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

## Verified release and combined source checkpoint

- npm propagation completed: exact version 0.92.0 and latest0.92.0; dist SHA1 and SHA512 match the accepted Linux artifact.
- Actual official rc.5 CLI `plugin --profile web add dsh-quant@0.92.0`: exit0, downloaded and added one dependency. Isolated profile only. Its `peers check` exits1 for three missing host peers in that profile directory; no complete profile boot is claimed. A separate clean consumer explicitly installs and validates one coherent shared host and loads the actual registry package successfully.
- [Registry run 43503675329](https://github.com/pengpengyi92/dsh-quant/actions/runs/43503675329): all five Linux cohorts passed. [Candidate run 43503610272](https://github.com/pengpengyi92/dsh-quant/actions/runs/43503610272): all five passed, same immutable artifact.
- Local `node scripts/consumer-runtime.mjs 0.2.1-rc.5 dsh-quant@0.92.0 0.92.0`: PASS; 59 registered, 56 deterministic passes, zero failures, three live APIs UNVERIFIED. Installed lock integrity equals the accepted SHA512.
- Independent maintenance review found that historical candidate acceptance compared against the current harness version. Corrected in `6b31440`: explicit selected version, mismatch rejection and a 0.91.1-candidate/0.92.0-harness regression. This was a reusable-harness defect, not failure of the already-tested 0.92.0 package.
- Merged master into the maintenance branch without rewriting any history. Actual combined `npm test`: 337/337 passed, no failures/skips; build/typecheck included.
- PR156 confirmed merged at `3890f98c216645d9b0a586118f46f044ce72fc7a`, 2026-11-13T20:38:34Z.
- PR158 tracks release-harness/evidence changes, not a new npm artifact. Source-only post-release changes are not claimed to exist in the frozen package.
- Added requested post-merge thanks to @Yuren0312: https://github.com/pengpengyi92/dsh-quant/pull/144#issuecomment-6864345968. Other community replies and final maintenance merge receipts follow after remote read-back.

## Public resolution receipts

- Issue149 final evidence/install reply: https://github.com/pengpengyi92/dsh-quant/issues/149#issuecomment-6864464714.
- Issue139 final reply: https://github.com/pengpengyi92/dsh-quant/issues/139#issuecomment-6864466512.
- Duplicate Issue140 final reply: https://github.com/pengpengyi92/dsh-quant/issues/140#issuecomment-6864468263.
- All three closed with reason COMPLETED only after actual registry acceptance passed. Issue105 remains open; no blanket or stale-only issue closure.
- New factual post-merge npm delivery thanks to @hufeide: https://github.com/pengpengyi92/dsh-quant/pull/136#issuecomment-6864470601. Original ancestry preserved.
- Existing GitHub v0.92.0 release notes updated from source-only/blocked to actual verified npm status; no tag or release target was changed.
- Independent re-review found no remaining blocker at `5c4575ff1affdc8fc8d1f280ad2e5736cceca44e`; 13 focused checks passed. Registry/candidate runs above used harness `83cddbe`, not this combined head. Final-head CI and a repeated registry run remain separate gates for PR158.
- Actual `npm run typecheck:market-tests` and final scoped `git diff --check`: PASS.

## Remaining work and limits

- PR158 merged only after current-head six-job CI and final harness acceptance; receipt below.
- Future automated npm authentication requires explicit configuration; no local token was copied to GitHub secrets.
- #105 complete Desktop/Hub/model sessions and three live API calls remain unverified. No financial-performance or production-readiness claim.
- Directory invitation #40 and listing notice #51 are community correspondence, not proof of an independently verified listing or market-data certification. Do not create an external submission or subscribe the user as part of an acknowledgement.

## Final merge receipt - 2026-11-14T04:47:37+08:00

- Reviewed content head: `e57750daad0bdf80e751e574072d8fb634c8991f`.
- All six final-head CI jobs passed: https://github.com/pengpengyi92/dsh-quant/actions/runs/43504562462.
- Repeated actual registry acceptance on that same final head passed all five cohorts: https://github.com/pengpengyi92/dsh-quant/actions/runs/43504578095. This supersedes reliance on the earlier harness run, while preserving its receipt.
- PR158 normal merge confirmed: `439aa313ccb4923ae34d124613cd01c66bb9c3e1`, merged 2026-11-13T20:47:37Z. No admin bypass or self-approval.
- #40 acknowledgement: https://github.com/pengpengyi92/dsh-quant/issues/40#issuecomment-6864503647. No external submission made; community invitation remains open.
- #51 acknowledgement: https://github.com/pengpengyi92/dsh-quant/issues/51#issuecomment-6864505425. Thanks for the notice, not a claim of independently verified listing/completeness; community thread remains open.
- Current completion: PR148, PR156 and maintenance PR158 merged; #149/#139/#140 closed after actual delivery; #105 remains open. Scoped receipts, failed attempts, package hashes, source/harness distinctions and limitations are committed in this repository.
- Subsequent receipt-only documentation does not change the tested runtime implementation or the immutable npm artifact. GitHub remote state is canonical for this log's own final commit.
