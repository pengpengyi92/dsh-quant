# 🐳 dsh-quant — The Everything-Plugin Quant OS

🌐 **Site**: https://dsh-quant-site.pages.dev · ✅ Listed in [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) (one-click install via dsh-market)

[![npm](https://img.shields.io/npm/v/dsh-quant)](https://www.npmjs.com/package/dsh-quant)
[![downloads](https://img.shields.io/npm/dm/dsh-quant)](https://www.npmjs.com/package/dsh-quant)
[![stars](https://img.shields.io/github/stars/pengpengyi92/dsh-quant?style=social)](https://github.com/pengpengyi92/dsh-quant)
[![site](https://img.shields.io/badge/site-dsh--quant--site.pages.dev-orange)](https://dsh-quant-site.pages.dev)
[![license](https://img.shields.io/npm/l/dsh-quant)](LICENSE)
[![ci](https://github.com/pengpengyi92/dsh-quant/actions/workflows/ci.yml/badge.svg)](https://github.com/pengpengyi92/dsh-quant/actions)
[![dsh-plugin](https://img.shields.io/badge/dsh-plugin-blue)](https://github.com/topics/dsh-plugin)

> **AI-native & DSH-native quant toolkit for every quant aspect** — 46 tools · 6 domains
> (data / alpha / ML / risk / execution / ecosystem) · one end-to-end PDAT→PET
> research pipeline. **Methods open, secrets internal.**

## 🧩 Core Philosophy: Everything is a Plugin (quant edition)

dsh's philosophy is **everything is a plugin**; dsh-quant brings it to quant —
open-sourcing the internal five-team paradigm (**PDAT → PAAT → PCPT → PRT → PET**)
as **five pluggable modules**:

```
data plugin   dsh-data      market data / sources / quality  ← plug in Binance or your own data
alpha plugin  dsh-alpha     indicators / factors / eval      ← write your own alpha (internal alpha stays private)
model plugin  dsh-ml        backtests / ML/DL/RL framework   ← train your own models (internal research stays private)
risk plugin   dsh-risk      VaR / drawdown / options / bonds ← set your own risk limits
exec plugin   dsh-execution sim execution / fund / report    ← build your own trading system (paper or live)
```

- **What's open is the paradigm**: how modules compose, how contracts are defined
  (null alignment / no look-ahead / hand-computed tests), how results are validated —
  not the internal secrets
- **You fill it in**: product power = UI + strategies + data interfaces + DL/RL
  models + trading-system building, all self-assembled, all pluginized
- **Infinite self-evolution**: fill the framework with your modules → run paper/live
  → feed the ecosystem back — that's dsh-quant

Plugin call for proposals: [Issue #27 (five modules × many plugins)](https://github.com/pengpengyi92/dsh-quant/issues/27) — PDAT plugins, PET plugins, anything you can imagine 🐋

## 🤖 AI-Native Is Deliberate (design statement)

dsh-quant's primary consumer is the **agent (the model), not the human** — a
deliberate choice from day one:

- **Tool schemas are injected into the system prompt** — every contract (args /
  outputs / alignment rules) is written from the model's perspective
- **Equal-length null alignment** — outputs match input length; leading window
  positions are `null`, so the model aligns by index and never pads
- **Canonical JSON + render separation** — machines read structure, humans read prose
- **All isConcurrencySafe** — pure functions, no shared state; agents can call all
  46 tools in parallel without interference
- **Skill layer** — `skill/quant-research` lets the model load the workflow itself

Full statement: [Issue #14](https://github.com/pengpengyi92/dsh-quant/issues/14) "AI-native is deliberate".

## 🐍 Why Almost No Python?

A common question: a quant project without `.py` files? **Answer: 0 Python files,
21 TypeScript source files, zero runtime dependencies — deliberate:**

- dsh-quant is a **dsh plugin** running inside the harness's Node runtime: same
  process as the agent, composable by the Loader, reversible registration (HMR-safe)
  — TypeScript is the only natural choice
- Where Python is needed (akshare / tushare / baostock), use the **channel knowledge
  base** (`quant_data_guide`, 15 channels): dsh ships shell / subprocess capabilities,
  so the agent decides whether to spawn Python — dsh-quant carries no runtime
- All numerical methods (indicators / backtests / options / bonds) are **pure
  functions with hand-computed baselines**: zero deps, offline-verifiable,
  `npm test` green anywhere

One goal: **build the most usable AI-native quant repo** 🐋

**46 `quant_*` tools · 6 domains · 174 unit tests · zero runtime deps**. Full positioning: pinned [Issue #9](https://github.com/pengpengyi92/dsh-quant/issues/9).

## 🤖 For visiting agents

Agents landing on this repo: start at [AGENTS.md](AGENTS.md) (root-level, auto-read
by Copilot / Claude Code / dsh), then the closed-loop example
[plugin/CASE_STUDY.md](plugin/CASE_STUDY.md) or [Discussion #38](https://github.com/pengpengyi92/dsh-quant/discussions/38),
and the one-glance contract [mcp/AGENT_GUIDE.md](mcp/AGENT_GUIDE.md).

## Quick Install (dsh users)

```sh
npm i dsh-quant
```

Add one line to your cordis.yml:

```yaml
- name: 'dsh-quant'
```

46 tools auto-register — indicators / backtests / factors / risk / fund simulation /
ecosystem metrics out of the box. One `quant_research_pipeline` runs the whole
PDAT→PET chain. ML/DL knowledge: [docs/ML_GUIDE.md](docs/ML_GUIDE.md);
executable demo: `npx tsx demos/ml-workflow.ts`.

## 🚀 Product Experience: Three Minutes to a Full Quant Pipeline

Right after install, experience the complete PDAT→PET flow (BTC public data +
simple strategy + backtest + paper trading):

```
data(quant_market_fetch) → quality(quant_data_quality) → factors(quant_factor_evaluate)
→ backtest(quant_backtest) → metrics(quant_metrics) → risk(quant_risk)
→ drawdown(quant_drawdown) → paper sim(quant_execute_sim) → fund sim(quant_fund)
→ report(quant_report)
```

One-liner: `quant_research_pipeline(symbol=BTCUSDT, limit=120)` returns everything
in one call.

Then plug **your own plugins** into each module (data sources / alpha / models /
risk / execution — everything is a plugin, proposals at Issue #27).

Five-step walkthrough with commentary: [docs/ONBOARDING.md](docs/ONBOARDING.md) ·
Agent one-glance guide: [mcp/AGENT_GUIDE.md](mcp/AGENT_GUIDE.md)

## 🖥️ UI Workbench (dsh-quant-ui)

![dsh-quant UI](demos/ui-demo-preview.png)

[dsh-quant-ui](https://github.com/pengpengyi92/dsh-quant-ui): candlesticks + MA
overlays + trade markers, equity curves, fund NAV / management-fee / performance-fee
cards, metric selector — plus a swimming chibi whale 🐋 (click the title 3 times).

Live demo: https://dsh-quant-ui.pages.dev

## ⌨️ CLI (dsh-quant terminal)

Zero-dependency readable terminal (pure Node + ANSI, same philosophy as the
P-Research CLI). Browse the research columns and live market data without a
browser:

```bash
node cli/main.mjs repo                      # 46 tools · 6 domains
node cli/main.mjs history                   # 53 firm archives index
node cli/main.mjs history citadel           # one firm's archive (rendered)
node cli/main.mjs history --reports         # ANALYSIS / TIMELINE / LINEAGE / BANK_LINEAGE
node cli/main.mjs history --search 高频      # cross-archive search
node cli/main.mjs kline BTCUSDT --limit 20  # colored OHLC table + stats
node cli/main.mjs browse                   # interactive TUI: arrow-key firm browser
```

After `npm install -g .`, the commands shorten to `dsh-quant repo`,
`dsh-quant history citadel`, etc.

## Tools

| Tool | Parameters | Canonical output | First valid index |
|---|---|---|---|
| `quant_data_compare` | `dataType` (e.g. "financials"/"daily bars") | `{ dataType, channels: [{ name, cost, covers, bestFor }] }` (covering first) | — |
| `quant_data_advice` | `dataType` + `budget` (free/low/institutional) + `purpose` (research/backtest/official) | `{ recommendations: [{ rank, name, reason }] }` (decision-tree ranked) | — |
| `quant_series_stats` | `values: number[]` | `{ count, mean, std, min, max, median, skew, kurtosis, autocorr1, annualizedVol, totalReturnPct }` | — (first step after fetching) |
| `quant_var_backtest` | `returns` + `varSeries` + `confidence=0.95` | `{ failures, expected, lrStat, pValue, passed, periods }` (Kupiec POF test) | — (the ground truth for VaR models) |
| `quant_option` | `spot` + `strike` + `timeToMaturity` + `riskFreeRate` + `type` + exactly one of `volatility`/`price` | `{ price, impliedVolatility, delta, gamma, vega, theta, rho, … }` | — (Optiver-inspired: BS pricing + five greeks + IV solve) |
| `quant_volatility` | `close: number[]` + `annualization=252` | `{ annualized, perPeriod, n, logReturns(aligned) }` | — (realized vol; the RV-vs-IV research entry) |
| `quant_bond` | `couponRate` + `periodsToMaturity` + `paymentsPerYear?` + exactly one of `ytm`/`price` | `{ price, yieldToMaturity, macaulayDuration, modifiedDuration, convexity, dv01, … }` | — (FICC link: pricing/duration/convexity/DV01, textbook discounting) |
| `quant_drawdown` | `equity: number[]` | `{ underwater(aligned), maxDrawdownPct, currentDrawdownPct, periods(peak/trough/recovery/depth/duration), ongoing }` | — (drawdown episode analysis) |
| `quant_resample` | `candles` + `period` (week=7 bars/month=30 bars) | `{ candles }` (OHLCV aggregation, 24/7 markets) | — |
| `quant_report` | strategy/metrics/risk/factor/fund (module outputs) | `{ report }` (Markdown research report) | — (R&D conclusion assembly) |
| `quant_repo_stats` | `owner` + `repo` | `{ stars, forks, watchers, openIssues, openPullRequests, topics, latestRelease, … }` (public GitHub API, no credentials) | — (ecosystem data) |
| `quant_npm_stats` | `pkg` | `{ latest, weeklyDownloads, monthlyDownloads, description, … }` (npm registry + downloads API) | — (ecosystem data) |
| `quant_oss_pulse` | `stars` + `downloadsWeekly?` + `starsPrevious?` + `openIssues?` + `openPullRequests?` + `daysSinceRelease?` | `{ score(0-100), grade(A-D), components, suggestions, summary }` | — (open-source influence score; missing inputs score neutral 50) |
| `quant_risk` | `returns` (decimal series) + `benchmarkReturns?` + `confidence=0.95` | `{ var95, cvar95, downsideDeviation, maxDrawdownPct, beta, alpha, informationRatio, trackingError, periods }` | — (core risk module) |
| `quant_fund` | `equityCurve` + `initialCapital=1e8` + `managementFeeRate=0.02` + `performanceFeeRate=0.2` | `{ initialCapital, finalNavNet, finalAum, peakNav, peakAum, gross/netReturnPct, fees, navNet }` | — (quant hedge-fund sim: NAV 1.00 start, daily mgmt fee, 20% high-water-mark performance fee) |
| `quant_metrics` | `equityCurve` + `trades?` | `{ totalReturnPct, maxDrawdownPct, sharpe, annualizedVol, calmar, sortino, winRate, profitFactor, avgPeriodReturnPct, tradeMetrics }` (required trio: return/drawdown/sharpe) | — (METRIC_CATALOG for UI pickers) |
| `quant_chart` | `kind` (candles/series/annotations) + matching data | structured chart data (dsh-chart protocol: candles+overlays+markers / multi-series / annotation views) | — (UI-route data plane) |
| `quant_execute_sim` | `close` + `orders[{index, side, quantity?/valueFraction?}]` + `initialCash?` + `feeRate?` + `slippageBps?` + `latencyBars?` | `{ fills, equityCurve, finalEquity, totalReturnPct, totalFee, totalSlippageCost, tradeCount, unfilledCount, cash, position }` | — (execution framework, no live trading) |
| `quant_research_pipeline` | `symbol?` + `interval?` + `limit?` + `provider?` + `candles?` + strategy/fund params | `{ candles, quality, stats, metrics, risk, drawdown, fund, factor, report, charts }` | — (one-call PDAT→PET research) |
| `quant_factor_evaluate` | `factorValues` + `forwardReturns` (factor[i] predicts ret[i+1]) + `quantiles=5` + `window=20` + `decayHorizons=5` | `{ ic, rankIc, icDecay, icir, icSeries, quantileReturns, longShort, turnover, autocorr1, n }` (alphalens set + RankIC/IC decay) | — |
| `quant_factor_neutralize` | `factorValues` + `groups?` + `styleFactors?` + `method?` | `{ values(standardized), method, groupCount, styleCount, rSquared }` | — (group z-score / OLS residual neutralization) |
| `quant_walk_forward` | `returns` + `features[][]` + `trainWindow` + `testWindow` + `step?` | `{ predictions(null-aligned), oosIc, oosRankIc, oosCount, windows, trainR2Mean }` | — (rolling train / out-of-sample, no look-ahead) |
| `quant_linear_model` | `X(samples×features)` + `y` + `lambda?` + `predictX?` + `yTest?` | `{ intercept, weights, lambda, trainR2, n, predictions?, testR2?, testIc? }` | — (standalone OLS/Ridge fit & predict) |
| `quant_factor_combine` | `factors: number[][]` (equal length) + `weights?` | `{ signal(rank 0..1), effectiveWeights, factorCount }` | — (z-score weighting + cross-sectional ranking) |
| `quant_series_quality` | `values: number[]`, `jumpThreshold=0.2` | `{ count, missingCount, zOutliers, jumps, longestConstantRun, healthy }` | — (series-level quality) |
| `quant_data_annotate` | `values: number[]`, `jumpThreshold=0.2` | `{ count, annotations: [{index, label, severity, detail}], summary }` | — (point-level labeling, a tribute to Scale AI) |
| `quant_data_quality` | `candles` (quant_market_fetch output) | `{ count, highBelowLow, nonPositive, timeNotIncreasing, timeGaps, extremeMoves, healthy }` | — (pre-analysis health check) |
| `quant_data_guide` | `query` (channel name/data type, e.g. "tushare"/"financials") or `channel` (exact name) | `{ query, results: [{ name, url, cost, dataTypes, setup, tutorialUrls, bestFor, … }] }` | — (built-in 15-channel data knowledge base: A-shares/US/bonds + dsh ecosystem data plugins) |
| `quant_market_fetch` | `symbol: string` (e.g. BTCUSDT / sh600000 / AAPL), `interval: 1m…1M`, `limit: 1-1000`, `provider: binance/okx/bybit/sina/tencent/yahoo` | `{ symbol, interval, provider, candles: [{openTime, open, high, low, close, volume}] }` | — |
| `quant_sma` | `values: number[]`, `window: integer` | `{ values: (number\|null)[], window }` | index `window-1` |
| `quant_ema` | `values: number[]`, `window: integer` | `{ values: (number\|null)[], window }` | index `window-1` (seed = first-window mean, alpha = 2/(w+1)) |
| `quant_rsi` | `values: number[]`, `window: integer = 14` | `{ values: (number\|null)[], window }` | index `window` (Wilder smoothing) |
| `quant_macd` | `values: number[]`, `fast=12`, `slow=26`, `signal=9` | `{ macd, signal, histogram }` (equal length) | macd: `slow-1`; signal/histogram: `slow+signal-2` |
| `quant_bollinger` | `values: number[]`, `window=20`, `multiplier=2` | `{ upper, middle, lower, window, multiplier }` | index `window-1` (population std) |
| `quant_atr` | `high/low/close: number[]`, `window=14` | `{ values: (number\|null)[], window }` | index `window` (Wilder smoothing) |
| `quant_kdj` | `high/low/close: number[]`, `window=9` | `{ k, d, j }` (equal length) | index `window-1` (RSV method, K/D seeded at 50) |
| `quant_williams_r` | `high/low/close: number[]`, `window=14` | `{ values: (number\|null)[], window }` | index `window-1` (range -100..0) |
| `quant_cci` | `high/low/close: number[]`, `window=20` | `{ values: (number\|null)[], window }` | index `window-1` (±100 overbought/oversold) |
| `quant_obv` | `close/volume: number[]` | `{ values: number[] }` | everywhere (first value 0, no nulls) |
| `quant_adx` | `high/low/close: number[]`, `window=14` | `{ adx, plusDi, minusDi, window }` | ±DI: index `window`; ADX: index `2*window-1` |
| `quant_roc` | `values: number[]`, `window=12` | `{ values: (number\|null)[], window }` | index `window` |
| `quant_backtest` | `close: number[]`, `fast=10`, `slow=30`, `feeRate=0.001`, `stopLoss?`, `takeProfit?` | `{ totalReturnPct, maxDrawdownPct, sharpe, position, equityCurve, trades(with exitReason) }` | first trade one bar after first confirmed cross |
| `quant_backtest_bollinger` | `close: number[]`, `window=20`, `multiplier=2`, `feeRate=0.001`, `stopLoss?`, `takeProfit?` | same (buy on upper-band breakout, sell on mid-band cross-down) | one bar after first confirmed breakout |
| `quant_backtest_rsi` | `close: number[]`, `rsiWindow=14`, `buyBelow=30`, `sellAbove=70`, `feeRate=0.001`, `stopLoss?`, `takeProfit?` | same (buy on RSI cross-up through buyBelow, sell on cross-down through sellAbove) | one bar after first confirmed signal |
| `quant_backtest_portfolio` | `assets: [{name, close}]`, `weights?`, `rebalanceEvery?`, `feeRate=0.001` | `{ totalReturnPct, maxDrawdownPct, sharpe, equityCurve, assetNames, finalWeights, rebalances }` | — (multi-asset portfolio) |
| `quant_backtest_grid` | `close: number[]`, `fastMin=3`, `fastMax=10`, `slowMin=10`, `slowMax=30`, `feeRate=0.001` | `{ results(sorted by return desc), best, fastRange, slowRange, feeRate }` | — (grid search; skips fast >= slow) |

### Typical chain (model's view)

```
quant_market_fetch(symbol: BTCUSDT, interval: 1d, limit: 100)
  → take close → quant_sma / quant_ema / quant_rsi / quant_macd / … → quant_backtest
```

Verified live: real Binance daily bars → indicators → backtest (fast 5 / slow 20) end to end.

### Backtest contract

- Dual-MA crossover: buy all-in when fast SMA crosses above slow SMA, liquidate when
  it crosses below; signals confirm on bar `i` and fill at bar `i+1` close
  (**no look-ahead**).
- Fees are charged on both sides of notional (`feeRate` per side).
- Open tail position: the last trade's `exitIndex/exitPrice/returnPct` are `null`.
- `position` and `equityCurve` match input length; equity is normalized (starts at 1);
  Sharpe is annualized assuming daily frequency (√365).

## Alignment conventions

- All outputs are **equal-length** with inputs; leading unwindowed positions are
  `null` — the model aligns by index, no padding needed.
- Empty series or `window > series length` is a **legal result** (all `null`),
  not an error.
- Non-finite numbers (NaN/Infinity) are rejected at the registry's lossless-JSON
  argument snapshot layer (the model's JSON boundary) and never reach `execute`.
- Constraints (window ≥ 1 integer, macd fast < slow, atr arrays equal length,
  multiplier > 0) are hand-checked in `execute`; thrown errors become `isError`
  results via the registry.

## Contract (defineTool)

- Arguments use the unified schema DSL, validated by `defineTool` before `execute`
  (types / required / integers).
- `execute` returns only the canonical JSON value; `output.render` produces the
  model-facing prose.
- Every tool is `isConcurrencySafe: true` — pure functions, no shared state, no side
  effects, parallel-schedulable.
- Registration is a reversible effect: `ctx.tools.register` returns a disposer;
  fiber disposal unregisters.

## Model Experience

### What the model sees

Each tool's name/description/JSON schema is injected into the system-prompt assembly
(`ctx.systemPrompt.tools()`). Descriptions state the alignment rules (which head
positions are null), so the model never guesses.

### Token impact

Each tool costs one fixed schema block; call results are charged by rendered content.
The `null`-alignment design avoids repeated padding requests from the model.

### KV cache impact

The schema prefix is stable (reused as long as the tool set and order are unchanged);
results append after the reusable prefix.

## Release history (NEWS)

| Version | Date | Notes |
|---|---|---|
| 0.57.0 | 2026-08-19 | IMC_SPECIAL — first firm deep-dive special (office chronicle + Prosperity), 22 reports total |
| 0.56.0 | 2026-08-19 | QUANT_VENDORS_CN — China's picks-and-shovels layer (Kafang/RQAlpha/jqdatasdk), 21 reports total |
| 0.55.0 | 2026-08-19 | FOREIGN_CN_MAP_V2 — fully verified foreign-in-China map (7 PFM, second wave 2024-2026), 20 reports total |
| 0.54.0 | 2026-08-19 | Shanghai gravity + foreign-in-China map — SHANGHAI_GRAVITY + FOREIGN_CN_MAP, 19 reports total |
| 0.53.0 | 2026-08-19 | Quant maps ×2 — QUANT_MAP_CN + QUANT_MAP_GLOBAL (city-centric), 17 reports total |
| 0.52.0 | 2026-08-19 | Office maps ×2 — OFFICE_CN + OFFICE_GLOBAL, 15 reports total |
| 0.51.0 | 2026-08-19 | Signature encyclopedias ×2 — SIGNATURES_CN + SIGNATURES_GLOBAL, 13 reports total |
| 0.50.0 | 2026-08-19 | Age chronicles ×2 — AGE_CN (2004-2022) + AGE_GLOBAL (1783-2018), 11 reports total |
| 0.49.0 | 2026-08-19 | D-tier research reports ×4 — REGULATION / TALENT_MAP / STAR_PRODUCTS / QUANT_AI (9 reports total) |
| 0.48.0 | 2026-08-19 | 5 cross-border archives — Tengsheng/Inshiman/Yuansheng/GSR/Eisler (94 firms) |
| 0.47.0 | 2026-08-19 | 8 CN Lite archives — Kaifeng/Honghu/Egret/Zhuoshi/Hande/Niankong/Mengxi/Xinhong (89 firms) |
| 0.46.0 | 2026-08-19 | 7 CN Lite archives — Shenyi/Jasper/Liyi/Bodao/Zunjia/Qianyi/Pingfanghe (81 firms) |
| 0.45.0 | 2026-08-19 | 3 CN Lite archives — Tianyan/Aifang/Maoyuan (74 firms) |
| 0.44.0 | 2026-08-19 | 10 CN Lite archives — Zhicheng/Qianxiang/Blackwing/Inno/LongQi/JoinQuant/Evolution/Sixie/Bridgewater-CN/Beyang (71 firms) |
| 0.43.0 | 2026-08-19 | Golden Bull special — 12 years of quant winners (2014-2025) + archive cross-analysis |
| 0.42.0 | 2026-08-19 | 5 Lite archives — Hongxi/Mingshi/Wenbo/Luoshu/Pansong (61 firms) + founding-date backfill |
| 0.41.0 | 2026-08-19 | Two-mode DD (Deep/Lite) + 3 Lite archives — ChaoQuanZi/YanSheng/Banyang (56 firms) |
| 0.40.0 | 2026-08-19 | DD standard v1 + China batch 1 re-due-diligenced (nine-section format, to-verify lists) |
| 0.39.0 | 2026-08-19 | China batch 2 — Zhixing Tongda/Chengqi/Ruitian/KuanDe/Lingjun/Xiaoyong (53 firms, WorldQuant lineage) |
| 0.38.0 | 2026-08-17 | Bank/brokerage lineage report — 13 firms, two waves, three generations |
| 0.37.0 | 2026-08-17 | China batch 1 — High-Flyer/Ubiquant/Minghong/Yanfu/Century Frontier (47 firms) |
| 0.36.3 | 2026-08-17 | AGENTS.md engagement loop — full vision + ask-your-human CTA |
| 0.36.2 | 2026-08-17 | AGENTS.md + CLAUDE.md agent onboarding |
| 0.36.1 | 2026-08-17 | Five-slot closed-loop case study + 10 supplyable candidates |
| 0.36.0 | 2026-08-17 | plugin/ five-slot external plugin library (22 repos & MCPs) |
| 0.35.2 | 2026-08-17 | Brand line 🐳 Dsh-Quant — The Everything-Plugin Quant OS |
| 0.35.1 | 2026-08-17 | Full English README |
| 0.35.0 | 2026-08-17 | Core UX: PDAT→PET onboarding (BTC example) + mcp/AGENT_GUIDE |
| 0.34.0 | 2026-08-17 | Quant lineage report (five motherships) |
| 0.33.0 | 2026-08-17 | Macro legends batch (42 firms) + first data analysis report |
| 0.32.0 | 2026-08-17 | Systematic Europe batch (37 firms) |
| 0.31.0 | 2026-08-17 | Market-making & crypto batch incl. Alameda failure case (32 firms) |
| 0.30.0 | 2026-08-17 | QRT/Capula/Winton/DRW/Tower batch (27 firms) |
| 0.29.0 | 2026-08-17 | SIG + quant chronicle timeline (22 firms) |
| 0.28.0 | 2026-08-17 | Balyasny/IMC/XTX/Five Rings + DE Shaw boost (21 firms) |
| 0.27.0 | 2026-08-17 | Man Group/AQR/GSA/Bridgewater batch (17 firms) |
| 0.26.0 | 2026-08-17 | Two Sigma/Virtu/DE Shaw/Renaissance batch (13 firms) |
| 0.25.0 | 2026-08-17 | HRT/Point72/Squarepoint batch (9 firms) |
| 0.24.0 | 2026-08-17 | Millennium/WorldQuant/Jump batch (6 firms) |
| 0.23.0 | 2026-08-17 | quant-history + quant-repo columns (Citadel/Optiver/Jane Street) |
| 0.22.0 | 2026-08-17 | Options & volatility board (Optiver-inspired) |
| 0.21.0 | 2026-08-17 | FICC link: quant_bond + bond data channels |
| 0.20.0 | 2026-08-16 | yahoo US/global klines + 13-channel guide + researchMultiAsset |
| 0.19.0 | 2026-08-16 | quant_linear_model + docs/ML_GUIDE + ml-workflow demo |
| 0.18.0 | 2026-08-16 | Chain completion: A-share klines, RankIC/IC decay, neutralization, walk-forward, drawdown, execution sim, pipeline |
| 0.17.0 | 2026-08-16 | dsh-community domain: quant_repo_stats / quant_npm_stats / quant_oss_pulse |
| 0.16.0 | 2026-08-16 | Domain-driven layout ↔ PDAT/PAAT/PCPT/PRT/PET + exchange fallback chain |
| 0.15.0 | 2026-08-16 | Kupiec VaR backtest + resample + report; 100 unit tests milestone |
| 0.14.0 | 2026-08-16 | quant_risk (VaR/CVaR/Beta/Alpha/IR/TE) |
| 0.13.0 | 2026-08-16 | quant_fund (1e8 capital, NAV 1.00, HWM 20% fee) + UI fund cards |
| 0.12.0 | 2026-08-16 | quant_metrics (9+ metrics) + Jane Street-style UI demo |
| 0.11.0 | 2026-08-16 | quant_chart (dsh-chart protocol) |
| 0.10.0 | 2026-08-16 | quant_factor_evaluate / combine (alphalens methodology) |
| 0.9.0 | 2026-08-16 | series stats + data quality + annotation (tribute to Scale AI) |
| 0.8.0 | 2026-08-16 | channel compare + decision-tree advice |
| 0.7.0 | 2026-08-16 | mcp/tools.json + pure-function re-exports + docs |
| 0.6.0 | 2026-08-16 | data channel guide (8 A-share channels) + rename to dsh-quant |
| 0.5.0 | 2026-08-16 | multi-exchange sources (OKX / Bybit) |
| 0.4.0 | 2026-08-16 | multi-asset portfolio backtest (periodic rebalancing) |
| 0.3.0 | 2026-08-16 | strategy family (Bollinger breakout / RSI reversion) + stop-loss/take-profit |
| 0.2.0 | 2026-08-16 | +6 indicators (KDJ / W%R / CCI / OBV / ADX / ROC) |
| 0.1.0 | 2026-08-16 | Launch: market data + 6 indicators + MA backtest/grid + CI/auto-release |

Full records: [NEWS.md](NEWS.md) and [CHANGELOG.md](CHANGELOG.md).

## Known limitations & roadmap

- **Market coverage is crypto-first**: Binance / OKX / Bybit public APIs (automatic
  fallback), no credentials; A-shares go through the channel knowledge base (akshare
  et al. as future providers).
- **Backtests are a built-in strategy family**: dual-MA / Bollinger breakout / RSI
  reversion / portfolio rebalancing / grid search; custom strategy callbacks are the
  future route.
- **presentCall/presentResult not customized**: indicator results have no file /
  terminal / diff semantics; UI falls back to generic cards.
- **Market tools need network**: live cases live in verify.ts; offline indicator /
  backtest cases are unaffected.

## Domain layout (PDAT→PET pipeline mapping)

```
src/dsh-data/       data (PDAT): 3 exchanges, 15 channels, quality/annotation, resample
src/dsh-alpha/      alpha (PAAT): 12 indicators + factor eval/combine (alphalens methodology)
src/dsh-ml/         portfolio (PCPT): strategy backtests + portfolio + metric catalog
src/dsh-risk/       risk (PRT): VaR/CVaR/Beta/Alpha/IR + Kupiec test + options + bonds
src/dsh-execution/  delivery (PET): chart data plane, fund sim, research report (no live trading)
src/dsh-community/  ecosystem (unique to the open side): GitHub/npm data + influence pulse
```

**The boundary**: data and conclusions stay internal; tools and methods ship to
dsh-quant — no alpha, no production strategies, no live-trading engineering, but
frameworks, indicators, factor evaluation, UI and demos. See pinned [Issue #9](https://github.com/pengpengyi92/dsh-quant/issues/9).

## Quick start (after fork/pull)

```sh
npm ci && npm run build && npm test    # offline full tests (174 unit + 4 Loader)
npm run test:verify                    # live market integration (needs network)
npm run gen:tools                      # regenerate mcp/tools.json
```

## Build & use

```sh
# build lib/ (tsc, NodeNext ESM; ships .js + .d.ts)
cd quant-indicators && tsc -p tsconfig.json

# use in dsh: add one line to cordis.yml
# - name: 'dsh-quant'
# (the Loader resolves the package exports → lib/index.js from node_modules)
```

## Verification

```sh
# pure-function numeric correctness + market parsing + backtests (174 cases, node:test, zero deps)
cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/*.spec.ts

# REAL-composition: cordis.yml booted through the real Loader (registration visible / pipeline / isError / HMR-safety)
cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/loader-composition.spec.ts

# harness integration (schemas → execution pipeline → isError → live fetch→indicators→backtest end-to-end)
cd deepseek-harness && pnpm exec tsx ../quant-indicators/verify.ts

# consumer simulation: built lib loaded through real node_modules resolution (simulates post-install)
cd deepseek-harness && pnpm exec tsx ../quant-indicators/consumer-test/boot.ts
```

## ⭐ Support

If dsh-quant helps your research, a ⭐ makes the project visible to more dsh users.

<p align="center"><img src="demos/whale-trading.png" alt="dsh whale trading on a holographic screen" width="420" /></p>

This whale stands for DeepSeek Harness (dsh) — trading on its holographic screen 🐋

Issues / PRs / discussions welcome; share your domain perspective in
[Discussion #10](https://github.com/pengpengyi92/dsh-quant/discussions/10). 🐋

Ecosystem infrastructure: [quant ecosystem directory](docs/QUANT_ECOSYSTEM.md) ·
[ecosystem playbook](docs/ECOSYSTEM_PLAYBOOK.md) · [ecosystem map Discussion #11](https://github.com/pengpengyi92/dsh-quant/discussions/11)

Research columns: [quant-history (firm archives)](quant-history/) · [quant-repo (open-source special)](quant-repo/)

Plugin library (five slots × external repos & MCPs): [plugin/](plugin/)
