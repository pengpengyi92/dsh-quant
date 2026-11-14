# CCXT community follow-up and visualization methods

Recorded:2026-11-14T16:15:46+08:00, Asia/Shanghai. Base43315ef3aea649d604cfcb70c19bc4a2ebf296e7.

## Authorized work

Publish the working CCXT example in Discussion164 with code/commands/benchmark/
license limits and thanks/collaboration; collect visualization references for
dsh-quant Data, P-CSDSAI and P-Curve; add useful drawing methods; log and push.
No permission to copy private data/code, run trades, change visibility or deploy
new services is inferred. No real market data was added to the visualization.

## Published and verified

[CCXT reply](https://github.com/pengpengyi92/dsh-quant/discussions/164#discussioncomment-19608782)
published in the existing thread after checking its replies (none); exact body
read-back PASS against ann/2026-11-14_ccxt_live_followup.md. Includes PR165,
source/example, source-checkout commands, actual n=3 latency/control results,
raw-data locality, personal-research rights, limits and invitation to data PRs.
No new parallel intake/group or invented performance claim.

## Source review and three scopes

12 primary repos selected across static/declarative/browser/large-data charts,
performance tearsheets and a separately classified backtest engine. Pinned
canonical repo, commit, actual entry file/blob, license file/blob and NOTICE.
All12 REFERENCE_ONLY / NOT_RUN; not an exhaustive search or library ranking.
Perspective redirects finos -> perspective-dev. Matplotlib license API404 and
mplfinance NOASSERTION stayed unknown automatically; separately read pinned
Matplotlib agreements, component-license directory and TradingView NOTICE/
README attribution. Did not relabel them BSD or ignore AGPL in Backtesting.py.

Shared public metadata is reproduced in the two other authorized repos, while
their guides differ: dsh-quant data/reporting; P-CSDSAI schema/transport/WASM/
aggregation; P-Curve actual tenor/units/conventions/rights. Existing unrelated
worktrees left unchanged; P-Curve gets an explicit public file allowlist update,
no new approved model/data topic or private PFICC source.

## Runnable drawing and a real accounting finding

Created own offline80-bar synthetic example with existing ChartData/SMA/
drawdown contracts and own SVG renderer. Three views: candles + MA + scripted
fills; fixture equity; underwater. Null gaps break paths. It is not an upstream
renderer implementation, strategy backtest, raw Kraken chart or production tool.

The initial attempt to display existing MA-engine output exposed realized cash
not being carried forward on close. Independent synthetic12-price reproduction:
buy6/sell8,0.1% fees each side; actual final equity0.998001 versus expected
1.330668. An independent reconciliation assertion actually FAILED. Tracked
[bug166](https://github.com/pengpengyi92/dsh-quant/issues/166) after a targeted
existing-issue search. The defect remains UNFIXED in this contribution; no
financial-correctness claim follows from the previously green358 tests.

Public visualization instead uses explicitly scripted synthetic fills and a
small fixture-only cash/share oracle; winning/losing/flat/fees/multiple trades
are independently tested. It is not a silent rewrite/replacement of the engine.
Core backtest/market functions, task107/159/160 and raw private data are untouched.

Own SVG:20 warmups/250 renders of fixed80-bar model, mean0.1411ms,
27486bytes at16:10:56+08:00 on Windows/Node24.18.0. No fileIO/raster/browser or
third-party renderer in the measurement. NOT a library speed comparison/SLA.
Rasterized with existing Sharp solely for QA; viewed the actual PNG twice,
before/after isolating accounting; final labels/three panels/candles/markers
visible and non-overlapping. No renderer dependency added.

## Verification checkpoint

Four new JS drawing tests PASS. Full suite, strict example typecheck,4 Python
reference contracts, private-data/pack checks and remote CI/push receipts follow.
Catalog checks cannot establish library runtime correctness/performance/security;
all third-party benchmark claims remain UNMEASURED. Fix166 is the next P0 gate
before trusting closed-trade MA-engine performance reports.

## Actual local verification — 2026-11-14T16:18:59+08:00

- `npm test`:build + source typecheck +362/362 PASS,0fail/skip. This still
  does not fix166; its independent financial assertion remains the open finding.
- `node --import tsx --test tests/data-visualization.spec.ts`:4/4 PASS.
- Strict ES2022/NodeNext tsc for example/tests:PASS.
- Python3.12 `-m unittest discover -s tests -p test_visualization_catalog.py -v`:
  4/4 PASS; pinned-source/rights/local-link/limited privacy checks, not library runs.
- `node scripts/check-ccxt-pack.mjs`:534 package files,0 forbidden data/dependency
  entries; original CCXT compiled bridge and lock retained. Dry-run only.
- `git diff --check`:PASS. Core engine/market code, CCXT demo, deps/tool schemas,
  benchmark smoke and existing contributor-task implementations unchanged.
- Cross-repo source evidence copied only from the new public-reference artifacts;
  separate guides/explicit tests and P-Curve allowlist checked. No private trees.

Initial P-Curve test invocation lacked an installed/source-importable p_curve
in its fresh isolated worktree; one module import failed. Re-run with temporary
PYTHONPATH=src gave68/68 PASS, synthetic example and publication checker PASS.
P-CSDSAI existing+new catalog tests14/14 PASS. No app or mathematical core changed.
Remote CI, commit/push and publication receipts follow after actual delivery.

## Remote delivery — 2026-11-14T16:24+08:00

- dsh-quant source724b90f208eed29990b1ceb7e6d2655e263bc94b pushed;
  [PR167](https://github.com/pengpengyi92/dsh-quant/pull/167) merged at16:22:40+08
  as95af67751b8b4903ec606da6eb398c71d6cb3c3a after all7 jobs in
  [CI43575425913](https://github.com/pengpengyi92/dsh-quant/actions/runs/43575425913)
  succeeded. Normal matched-head merge, no admin bypass/self-approval or invented
  independent human review. Tool count/dependencies/npm release unchanged.
- P-Curve reference source2f605fb03edf5f33139c81cd77b3e0eef17ddfa7;
  [PR9](https://github.com/pengpengyi92/p-curve/pull/9) merged as
  f690436c5029e8ae225dea655384460e4e8c394b after six platforms in
  [CI43575453374](https://github.com/pengpengyi92/p-curve/actions/runs/43575453374)
  passed installed-package tests, synthetic example and publication checker.
- P-CSDSAI source53213752f9af448ecc8e386e9d29a51c6da38df9 pushed to
  [PR3](https://github.com/pengpengyi92/p-csdsai/pull/3).14 catalog checks pass,
  but app quality [43575438624](https://github.com/pengpengyi92/p-csdsai/actions/runs/43575438624)
  fails the existing npm audit gate:19 affected entries,11moderate/8high.
  Current main6fe6ae2 also fails that audit step (run43575364796). This PR
  does not change package/lock/app code from its base. It remains OPEN, not
  merged by disabling security checks; dependency remediation is separate work.
- No new group, paid/model/market requests or hosting deployment. #166 remains
  OPEN/UNFIXED; the synthetic fixture does not certify the MA backtester.

Final receipt updates are documentation-only; current remote identities and CI
results are also recorded in Git history/linked PRs. Thanks for continued
source, visualization and reproducibility contributions; review standards hold.
