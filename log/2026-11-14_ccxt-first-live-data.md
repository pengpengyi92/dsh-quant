# First working data source: CCXT + Kraken

Recorded:2026-11-14T15:52:10+08:00. Accepted live run:15:47:34–15:47:44+08:00.
Timezone:Asia/Shanghai. Base369e6a21571af787d082e9daa37a36770cc5b41c.
Branch:codex/ccxt-public-data-20261114.

## Human request and decision

Select one of11 catalogued data projects, no paid dependency/API and clear
license; run a real data fetch, tests and benchmark; preserve process in log
and push. This is not authorization to trade, buy data or expose private PDAT.

Chose CCXT4.5.92 MIT for the existing JS/TS Candle pipeline, using Kraken
public OHLC without keys/accounts/payment. SDK license and provider terms
remain separate. Scope is personal non-commercial research only, no data
redistribution/commercial grant. Other candidates were not benchmarked/installed.
See docs/data-sources/CCXT-KRAKEN-2026-11-14.md for primary sources/selection.

## Delivered behavior

`real CCXT SDK -> ccxtHourlyCandles -> real Cordis/dsh-tools runtime ->
quant_data_quality + quant_sma`, with independent native REST mapping as the
same-exchange control. Strict UTC ms, exactly60 consecutive closed hours;
future/unclosed/outside-window bars cannot flow downstream; missing bars
fail rather than fill. Bad/missing numbers, seconds, duplicate/unsorted times
and impossible OHLC are rejected; valid zero base volume remains zero.

The optional example lock isolates CCXT (~70.5MB unpacked) and undici from
the root runtime. A named pure bridge is exported, but no model-visible tool,
provider dispatch/schema, numerical method, root dependency/version or npm
release changes. Do not confuse source integration with registry deployment.
Newcomer #107/#159/#160 files/implementations remain untouched.

## Actual runs and failures

- Context7 quota exhausted; read official CCXT manual and pinned installed
  source plus Kraken docs instead. No unsupported API guessed into the result.
- `npm install --prefix demos/ccxt-public --ignore-scripts --no-fund --no-audit`:
  installed10 packages. Lifecycle scripts disabled; no root CCXT dependency.
- First launch assertion failed before any request: npm package4.5.92 exports
  JS version4.5.91. Verified manifest/lock/source, now records both explicitly.
- First live run07:43:54Z:8 requests,6 successful paths. Audit then reported
  two affected package entries (1high/1moderate), via undici7.29.1. Functional
  PASS is retained, not accepted as final dependency configuration.
- Fixed optional override to7.30.1; second run07:45:13Z also passed, audit0.
  Further review found Node's built-in undici7.28.0 unaffected by npm overrides;
  transport was still native fetch. This run is diagnostic, not final config.
- Final run07:47:34Z explicitly injected npm undici7.30.1 fetch for both paths.
  Max12 allowed public GETs,1.1s scheduled spacing,10s timeout/request,0 retries.
  Actual8 requests,all200;3 REST and3 SDK paths each60 bars,2 outside-window
  rows discarded, same canonical SHA256 across all6.12 registered tool calls
  passed; SMA exactly matches pure-function oracle.
- Three runs/24 total HTTP requests; no orders/private endpoints, key, account,
  paid access, raw-data publication or model inference. Failed startup0 calls.
- Initial strict typecheck flagged optional callback init; default fixed it.
  Sparse array holes were explicitly added to negative controls before acceptance.

## Benchmark and stored artifacts

Accepted public-safe evidence:
benchmark/ccxt/evidence/2026-11-14T07-47-34-088Z.json.
Earlier generated receipts retained, not rewritten. They record actual code/
lock SHA256, base commit and DIRTY-worktree status, not a false clean commit.

Window:2026-11-11T18:00Z..2026-11-14T06:00Z exclusive. REST543.47/1116.92/
885.97ms; CCXT4127.92ms first load then1571.97/1865.02ms. n=3, descriptive
only; includes rate scheduling/hash and cold metadata, not installation/import.
Offline240 synthetic bars,50 warmups +1000 timings/path: median0.0112ms unsafe
mapping,0.0153ms strict bridge,0.0167ms strict+quality+SMA. Safety does more work;
no equivalent-work speedup, real alpha/OOS/return or production claim.

Private raw responses/canonical data/tool results remain under ignored
`.data-local/ccxt/<run-id>/`; public receipts contain no market quotes/OHLC
arrays. Git/package exclusion checks and final test/CI/push receipts follow.

## Verification so far

-14/14 scoped bridge/transport/archived-evidence tests PASS; hand-calculated
  Candle and SMA fixtures, missing-value and permission/transport controls.
- Intermediate full `npm test`:354/354 PASS before3 receipt/lock tests added.
- Strict example/bridge/tests/benchmark typecheck PASS; no DOM library needed.
- `npm run test:compat`:59 registered,56 deterministic calls PASS,0failed,
  three existing network tools UNVERIFIED by that suite. This demo does not
  upgrade their unrelated service/session coverage.
- Final optional `npm audit --omit=dev --json`:0 known vulnerabilities at check
  time, not a complete security certification. No audit auto-fix/force downgrade.

Remaining gates: final combined suite, package privacy exclusion, full PR CI,
normal reviewed merge/push. Remaining research gaps: commercial/data rights,
historical publication/observation availability, persistence/recovery,
cross-source correctness and production operation. No raw private material used.

## Packaging regression caught before push

Timestamp:2026-11-14T15:52+08:00. Initial npm pack dry-run unexpectedly included
1864 nested dependency files under demos/ccxt-public/node_modules (2389 total).
No local raw data was included. Root `files: [demos,...]` can include nested
dependencies despite the usual root node_modules exclusion. Added nested
`.npmignore` and an executable pack gate plus injected-path negative test.
Re-run:525 files,0 forbidden, compiled bridge and demo lock both present.
Gate also runs in the optional CI job after actual dependency installation.
The failed check is retained here; no oversized/private-data package was published.

## Final local verification

- `npm test`:build + source typecheck +358/358 PASS,0fail/skip.
- `node --import tsx --test tests/ccxt*.spec.ts`:15/15 PASS (14 before the
  added pack regression); includes synthetic negative controls, not live calls.
- Strict tsc for run.ts, bridge tests, evidence tests and offline benchmark:
  PASS with NodeNext/ES2022/strict/allowJs, no DOM lib. Existing script and
  market typecheck commands also PASS.
- `node scripts/check-ccxt-pack.mjs`:PASS,525 files,0 local-data/dependency
  entries; compiled bridge and locked example included. Dry-run only, no publish.
- `git diff --exit-code 369e6a2 -- src/dsh-data/market.ts benchmark/smoke.ts
  AGENTS.md mcp/AGENT_GUIDE.md CONTRIBUTING.md package.json package-lock.json
  mcp/tools.json`:PASS. Starter-task implementation files and public tool schema
  count/runtime dependencies are unchanged.
- `git diff --check`:PASS at inspection. Git ignores local raw data as expected.
- `npm run test:cov`:PASS; observed line95.80%, branch91.48%, function84.68%.
  The existing gate is line>=85%; no threshold weakened.

The new optional CI job installs/audits the isolated lock, typechecks and runs
offline benchmark/pack gates, but never invokes the `--live` demo. Remote CI,
merge commit and final delivery read-back remain pending at this checkpoint.

## Remote delivery receipt

Timestamp:2026-11-14T15:56:30+08:00 (Asia/Shanghai).

- Source/report/evidence commit:e21f8c1b23fd3344e1dd824a7443c31552e1f5a8.
- [PR165](https://github.com/pengpengyi92/dsh-quant/pull/165) MERGED at
  2026-11-14T15:56:16+08:00 asba8b7cecc656047b5e2a2c60fcc3beb9cff662ab.
- [CI43573307935](https://github.com/pengpengyi92/dsh-quant/actions/runs/43573307935):
  all7 jobs SUCCESS, including optional SDK install/audit/typecheck/offline
  benchmark/actual pack gate, main unit/coverage/consumer and five host cohorts.
  Normal merge matched the tested head; no admin bypass or self-approval,
  and no independent human review was claimed.
- Full358/358 source tests,15 scoped tests, local line coverage95.80%, real
  accepted live window/12 runtime calls, final optional audit0 and pack525/0
  forbidden entries are recorded above. Existing benchmark smoke also PASS;
  its unseeded five indicator cases are not used to claim CCXT performance gains.
- Twelve document links/local targets/HTTPS syntax and accepted run code+lock
  hashes validated; format/bounded secret scan and diff checks PASS. No claim
  that every remote URL is reachable or that bounded scanning proves no secrets.
- Synced local branch to actual merged master without resetting user changes.
  Final follow-up is documentation-only TODO/benchmark/log receipt; source,
  accepted evidence and private data remain unchanged. No tag/npm publish.

Acceptance:PERSONAL_RESEARCH_DEMO. Further market/provider/native-tool or
commercial-data changes need a separately scoped review and evidence. Thanks
to CCXT and Kraken maintainers; corrections and reproducible contributions
are welcome, with the same source/privacy/CI standards.
