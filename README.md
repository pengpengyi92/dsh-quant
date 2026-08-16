# dsh-quant-indicators

[![npm](https://img.shields.io/npm/v/dsh-quant-indicators)](https://www.npmjs.com/package/dsh-quant-indicators)
[![license](https://img.shields.io/npm/l/dsh-quant-indicators)](LICENSE)
[![ci](https://github.com/pengpengyi92/dsh-quant-indicators/actions/workflows/ci.yml/badge.svg)](https://github.com/pengpengyi92/dsh-quant-indicators/actions)
[![dsh-plugin](https://img.shields.io/badge/dsh-plugin-blue)](https://github.com/topics/dsh-plugin)

给 dsh 模型的一组量化工具：行情数据获取（Binance 公共 API）+ 技术指标计算（SMA / EMA / RSI / MACD / 布林带 / ATR / KDJ / W%R / CCI / OBV / ADX / ROC）+ 三大策略回测（双均线交叉 / 布林带突破 / RSI 均值回归）+ 资金管理（止损/止盈）。

定位：量化场景的 agent 需要"取数据 → 算指标 → 回测"的完整链路。官方工具集（bash/fs/web/terminal/subagent…）目前没有技术指标——本插件填补这个空白。指标与回测为纯函数实现，零外部依赖，可离线验证；行情获取走免费公共 API，无需凭据。

## 工具

| 工具 | 参数 | canonical 输出 | 首个有效位置 |
|---|---|---|---|
| `quant_market_fetch` | `symbol: string`（如 BTCUSDT）, `interval: 1m…1M`, `limit: 1-1000` | `{ symbol, interval, provider, candles: [{openTime, open, high, low, close, volume}] }` | — |
| `quant_sma` | `values: number[]`, `window: integer` | `{ values: (number\|null)[], window }` | index `window-1` |
| `quant_ema` | `values: number[]`, `window: integer` | `{ values: (number\|null)[], window }` | index `window-1`（seed = 前 window 均值，alpha = 2/(w+1)）|
| `quant_rsi` | `values: number[]`, `window: integer = 14` | `{ values: (number\|null)[], window }` | index `window`（Wilder 平滑）|
| `quant_macd` | `values: number[]`, `fast=12`, `slow=26`, `signal=9` | `{ macd, signal, histogram }`（等长）| macd: `slow-1`；signal/histogram: `slow+signal-2` |
| `quant_bollinger` | `values: number[]`, `window=20`, `multiplier=2` | `{ upper, middle, lower, window, multiplier }` | index `window-1`（总体标准差）|
| `quant_atr` | `high/low/close: number[]`, `window=14` | `{ values: (number\|null)[], window }` | index `window`（Wilder 平滑）|
| `quant_kdj` | `high/low/close: number[]`, `window=9` | `{ k, d, j }`（等长）| index `window-1`（RSV 法，K/D 初始 50）|
| `quant_williams_r` | `high/low/close: number[]`, `window=14` | `{ values: (number\|null)[], window }` | index `window-1`（区间 -100..0）|
| `quant_cci` | `high/low/close: number[]`, `window=20` | `{ values: (number\|null)[], window }` | index `window-1`（±100 超买超卖）|
| `quant_obv` | `close/volume: number[]` | `{ values: number[] }` | 全程（首值 0，无 null）|
| `quant_adx` | `high/low/close: number[]`, `window=14` | `{ adx, plusDi, minusDi, window }` | ±DI: index `window`；ADX: index `2*window-1` |
| `quant_roc` | `values: number[]`, `window=12` | `{ values: (number\|null)[], window }` | index `window` |
| `quant_backtest` | `close: number[]`, `fast=10`, `slow=30`, `feeRate=0.001`, `stopLoss?`, `takeProfit?` | `{ totalReturnPct, maxDrawdownPct, sharpe, position, equityCurve, trades(含 exitReason) }` | 首笔交易在首次交叉确认后一根 |
| `quant_backtest_bollinger` | `close: number[]`, `window=20`, `multiplier=2`, `feeRate=0.001`, `stopLoss?`, `takeProfit?` | 同上（突破上轨买入、下穿中轨卖出）| 首次突破确认后一根 |
| `quant_backtest_rsi` | `close: number[]`, `rsiWindow=14`, `buyBelow=30`, `sellAbove=70`, `feeRate=0.001`, `stopLoss?`, `takeProfit?` | 同上（RSI 上穿 buyBelow 买入、下穿 sellAbove 卖出）| 首次信号确认后一根 |
| `quant_backtest_grid` | `close: number[]`, `fastMin=3`, `fastMax=10`, `slowMin=10`, `slowMax=30`, `feeRate=0.001` | `{ results(按收益降序), best, fastRange, slowRange, feeRate }` | —（网格搜索，跳过 fast >= slow）|

### 典型链路（模型视角）

```
quant_market_fetch(symbol: BTCUSDT, interval: 1d, limit: 100)
  → 取 close 数组 → quant_sma / quant_ema / quant_rsi / quant_macd / … → quant_backtest
```

已实测：真实 Binance 日线 → 指标 → 回测（fast 5 / slow 20）端到端跑通。

### 回测契约

- 双均线交叉：fast SMA 上穿 slow SMA 全仓买入，下穿清仓；信号在 bar `i` 确认、`i+1` 收盘价成交（**无未来函数**）。
- 手续费按成交金额双边收取（`feeRate` 每边）。
- 尾部未平仓：最后一笔交易 `exitIndex/exitPrice/returnPct` 为 `null`。
- `position` 与 `equityCurve` 与输入等长；资金曲线归一化（初始 1）；夏普年化假设日频（√365）。

## 对齐约定

- 所有输出与输入**等长**，头部无法计算的窗口位置为 `null`——模型可以按索引直接对齐，无需自己补 padding。
- 空序列或 `window > 序列长度` 是**合法结果**（全 `null`），不是错误。
- 非有限数（NaN/Infinity）在 registry 的 lossless-JSON 参数快照层即被拒绝（模型 JSON 边界），不会到达 execute。
- 约束（window ≥ 1 整数、macd 要求 fast < slow、atr 三数组等长、multiplier > 0）在 execute 手检，抛错经 registry 转为 `isError` 结果。

## 契约（defineTool）

- 参数用统一 schema DSL，由 `defineTool` 在 execute 前校验（类型/必填/整数）。
- `execute` 只返回 canonical JSON 值；`output.render` 给模型渲染。
- 所有工具 `isConcurrencySafe: true`——纯函数、无共享状态、无副作用，可并行调度。
- 注册是可逆 effect：`ctx.tools.register` 返回 disposer，fiber 释放即注销。

## Model Experience

### 模型看到什么

每个工具的 name/description/JSON schema 自动进入系统提示词装配（`ctx.systemPrompt.tools()`）。description 说明了对齐约定（哪些头部位置是 null），模型无需猜测。

### Token 影响

每个工具固定一份 schema 成本；调用结果按渲染内容计。`null` 对齐设计避免了模型为了对齐而重复请求 padding 计算。

### KV Cache 影响

schema 前缀稳定（工具集与顺序不变则复用）；结果追加在可复用前缀之后。

## 迭代记录（NEWS）

| 版本 | 日期 | 更新 |
|---|---|---|
| 0.3.0 | 2026-08-16 | 策略族（布林带突破 / RSI 反转）+ 止损止盈 + exitReason |
| 0.2.0 | 2026-08-16 | +6 指标（KDJ / W%R / CCI / OBV / ADX / ROC）|
| 0.1.1 | 2026-08-16 | 开源协作设施（CI + 自动发布流水线 + 模板）|
| 0.1.0 | 2026-08-16 | 首发：行情 + 6 指标 + 双均线回测/网格 |

完整更新记录见 [NEWS.md](NEWS.md) 与 [CHANGELOG.md](CHANGELOG.md)。

## 已知限制与后续路线

- **单一数据源（Binance 公共 API）**：只覆盖加密市场，无需凭据。A 股（akshare 需 Python 子进程）等作为后续 provider。
- **回测仅支持双均线交叉**：更通用的策略回调/参数网格是后续路线。
- **presentCall/presentResult 未定制**：指标结果无文件/终端/diff 语义，UI 走 generic 卡片兜底。
- **行情工具依赖网络**：在线用例在 verify.ts 中，网络不可达时该用例失败（离线指标/回测用例不受影响）。
- 未发布：本地开发包名 `dsh-quant-indicators`，发布时定 npm scope 并打 `dsh-plugin` topic。构建链（tsc → lib）与消费者场景已验证，`npm pack --dry-run` 通过（7 文件 11.5 kB）。

## 构建与使用

```sh
# 构建 lib/（tsc, NodeNext ESM；产物含 .js + .d.ts）
cd quant-indicators && tsc -p tsconfig.json

# 在 dsh 中使用：cordis.yml 里加一行
# - name: 'dsh-quant-indicators'
# （Loader 从 node_modules 解析包的 exports → lib/index.js）
```

## 验证

```sh
# 纯函数数值正确性 + 行情解析 + 回测（30 用例，node:test，零依赖）
cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/indicators.spec.ts ../quant-indicators/tests/market.spec.ts ../quant-indicators/tests/backtest.spec.ts

# REAL-composition：cordis.yml 经真实 Loader boot（4 用例：注册可见/管线/isError/HMR-safety）
cd deepseek-harness && pnpm exec tsx --test ../quant-indicators/tests/loader-composition.spec.ts

# harness 集成（schemas → 执行管线 → isError → 真实行情 fetch→指标→回测 端到端）
cd deepseek-harness && pnpm exec tsx ../quant-indicators/verify.ts

# 消费者模拟：真实 node_modules 解析加载构建产物 lib（模拟 npm 安装后）
cd deepseek-harness && pnpm exec tsx ../quant-indicators/consumer-test/boot.ts
```
