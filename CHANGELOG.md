# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.16.0] - 2026-08-16

### Changed
- Domain-driven src layout: dsh-data (PDAT) / dsh-alpha (PAAT) / dsh-ml (PCPT) /
  dsh-risk (PRT) / dsh-execution (PET), each with a domain README; package-level
  API unchanged (backward compatible)
- verify.ts provider fallback chain (binance → okx → bybit) after live outage:
  Binance 451 region block + Bybit CloudFront block; OKX remains available


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.15.0] - 2026-08-16

### Added
- `quant_var_backtest`: Kupiec POF test (failure count vs expected, LR
  statistic, approximate p-value, 95% pass decision)
- `quant_resample`: OHLCV weekly/monthly aggregation (7/30-bar buckets for
  24/7 markets)
- `quant_report`: Markdown research-report assembly from metrics/risk/factor/
  fund outputs
- 100 unit tests milestone


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.14.0] - 2026-08-16

### Added
- `quant_risk`: historical VaR/CVaR (configurable confidence), downside
  deviation, max drawdown, Beta, Jensen alpha, information ratio and
  tracking error against an optional benchmark
- 6 hand-computed risk cases (VaR quantile, beta=2 linear benchmark,
  beta=1 identical benchmark, preconditions); live BTC verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.13.2] - 2026-08-16

### Changed
- Ship demos/ in the npm package (R&D workflow, Jane Street-style UI demo,
  standalone HTML, demo data + generator, UI preview PNG)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.13.1] - 2026-08-16

### Fixed
- UI demo: self-contained standalone HTML (embedded data) so it opens
  directly from file:// (fetch of local JSON is blocked by browsers);
  CDN fallback for Lightweight Charts


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.13.0] - 2026-08-16

### Added
- `quant_fund`: quant hedge-fund simulation (default ¥100M capital, NAV 1.00,
  daily management fee 2%/yr, high-water-mark performance fee 20%) with
  final NAV/AUM, peak AUM, gross/net returns, total fees, net-NAV series
- UI demo Fund block (8 cards + net-vs-gross NAV chart)
- 4 hand-computed fund cases; live verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.12.0] - 2026-08-16

### Added
- `quant_metrics`: full backtest metric suite (9 equity metrics + trade-level
  metrics) with required trio return/drawdown/sharpe
- METRIC_CATALOG metric directory for UI metric pickers
- Jane Street-inspired UI demo (demos/ui-demo.html + gen-ui-demo-data.ts):
  candlestick + overlays + trade markers, equity curve, metric selector
- 7 hand-computed metric cases; Discussion #7 for metric-system PRs

### Fixed
- profitFactor semantics: null (not Infinity) when there are no losses
  (Infinity is not lossless JSON)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.11.0] - 2026-08-16

### Added
- `quant_chart`: renderer-neutral chart data (dsh-chart protocol) — candles
  (with overlays and trade markers), series, and annotation views
- Pure chart builders (chartCandles / chartSeries / chartBacktest /
  chartAnnotate); 4 hand-computed cases; live verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.10.1] - 2026-08-16

### Added
- `demos/rd-workflow.ts`: executable end-to-end R&D demo on live data
  (fetch → stats → quality → indicators → factor eval → backtest → conclusion)
- RD-assistance log (three modes: research / development / data governance;
  ecosystem positioning vs RD-Agent, LLMQuant, inalpha, alphalens)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.10.0] - 2026-08-16

### Added
- `quant_factor_evaluate`: alphalens-methodology factor evaluation (IC/ICIR/
  quantile returns/long-short/turnover/autocorrelation), pure functions
- `quant_factor_combine`: multi-factor z-score weighting + cross-sectional
  rank normalization
- Ecosystem research log (alphalens/qlib/RD-Agent landscape + differentiation)
- 6 hand-computed factor cases; live BTC ROC-factor verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.9.1] - 2026-08-16

### Added
- `quant_series_quality`: missing / z-outlier / jump / frozen-run detection
- `quant_data_annotate`: point-level data labeling (5 label kinds, 3 severity
  levels) — Scale AI-inspired labeling philosophy
- Seven dimension folders (skill/tool-use/memory/rag/benchmark/eval/plan)
  referencing the internal PAT dimension system (private repo, method-level
  reference only)
- 4 hand-computed unit cases


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.9.0] - 2026-08-16

### Added
- `quant_series_stats`: descriptive statistics (skew/kurtosis/autocorr/annVol)
- `quant_data_quality`: OHLCV health check with healthy flag
- 5 hand-computed unit cases; live BTC verification

### Fixed
- candlesCheck now inspects the first candle too (high<low / non-positive)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.8.0] - 2026-08-16

### Added
- `quant_data_compare`: per-data-type channel comparison (coverage, cost tier, best-for; covering channels first)
- `quant_data_advice`: decision-tree recommendations by budget (free/low/institutional) and purpose (research/backtest/official) with reasons
- 5 decision-tree unit cases


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.7.0] - 2026-08-16

### Added
- `log/` per-version records; `mcp/` integration guide + runtime-generated
  `tools.json` (19 tool schemas); `docs/ENVIRONMENT.md` dependency matrix
- Pure-function re-exports from the package entry (`sma`, `backtestMaCross`,
  `searchChannels`, …) usable without any harness
- README quick-start, PR welcome note, R&D positioning


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.6.0] - 2026-08-16

### Added
- `quant_data_guide`: built-in A-share data channel knowledge base (8 channels: akshare, baostock, tushare, Wind, iFinD, SSE, SZSE, CSI) queryable by channel name or data type — channel navigation, not data APIs
- 6 knowledge-base unit cases

### Changed
- **Package renamed to `dsh-quant`** (DeepQuant Harness). Tool prefix `quant_*` and all tool schemas stay unchanged; previous name keeps serving 0.1-0.5.


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.5.0] - 2026-08-16

### Added
- `provider` parameter on `quant_market_fetch`: `binance` (default) / `okx` /
  `bybit` — native zero-dependency REST adapters with unified Candle output
- 4 adapter parse unit cases (real response samples); live cross-exchange
  consistency check (OKX vs Bybit same-day close within 0.005%)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.4.0] - 2026-08-16

### Added
- `quant_backtest_portfolio`: multi-asset allocation with optional periodic
  rebalancing, two-sided fees, final weights and rebalance count
- 3 hand-computed portfolio cases; live BTC+ETH 60/40 verification
  (3 rebalances, weights return to target)

### Fixed
- Initial allocation and rebalance fee accounting (fees pre-deducted on
  initial buy; two-pass rebalance so order does not matter)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.3.0] - 2026-08-16

### Added
- Strategy family: `quant_backtest_bollinger` (band-breakout) and
  `quant_backtest_rsi` (mean-reversion), same canonical output as
  `quant_backtest` (trades/position/equity/drawdown/Sharpe)
- Money management: optional `stopLoss` / `takeProfit` fractions on all three
  strategy tools; trades now carry `exitReason` (`signal`/`stop_loss`/
  `take_profit`)
- 6 hand-computed strategy unit cases (breakout entry, stop-loss, take-profit
  precedence, RSI reversion, preconditions); live BTC verification


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.2.0] - 2026-08-16

### Added
- Six common technical indicators: `quant_kdj` (RSV method), `quant_williams_r`,
  `quant_cci`, `quant_obv`, `quant_adx` (+DI/-DI, Wilder), `quant_roc`
- 6 hand-computed unit cases for the new indicators; live verification on real
  BTC candles (KDJ/CCI/OBV/ADX)


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.1.1] - 2026-08-16

### Added
- Open-source collaboration loop: CONTRIBUTING.md, issue/PR templates,
  GitHub Actions CI (build + 30 tests + typecheck), tag-triggered release
  workflow, README badges
- Clean package-lock.json; local development no longer requires the
  deepseek-harness checkout (real npm dependencies)
- `prepublishOnly` gate: build + full tests before any publish


All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[SemVer](https://semver.org/).

## [0.1.0] - 2026-08-16

### Added
- `quant_market_fetch` — OHLCV candles from the Binance public REST API
  (anonymous, zero-dependency `fetch`)
- Six technical indicators with length-aligned null-padded outputs:
  `quant_sma`, `quant_ema`, `quant_rsi` (Wilder), `quant_macd`,
  `quant_bollinger`, `quant_atr` (Wilder)
- `quant_backtest` — dual-MA crossover backtest (signal on bar `i`, execution
  at bar `i+1` close, two-sided fees, drawdown/Sharpe)
- `quant_backtest_grid` — fast/slow parameter grid search sorted by total
  return
- Bundle manifest (`dsh.bundle` → `cordis.patch.yml`): installable via
  `dsh plugin add dsh-quant-indicators`
- TypeScript build chain (NodeNext ESM, `lib/` with declarations)
- Test suite: 30 hand-computed unit cases + 4 real-Loader composition cases +
  live integration + consumer simulation (built `lib/` loaded through real
  node_modules resolution)

[0.1.0]: https://github.com/pengpengyi92/dsh-quant-indicators/releases/tag/v0.1.0
