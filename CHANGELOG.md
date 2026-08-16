# Changelog

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
