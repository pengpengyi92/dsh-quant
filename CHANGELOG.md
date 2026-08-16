# Changelog

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
