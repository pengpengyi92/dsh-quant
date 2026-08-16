# News

## 0.4.0 — 2026-08-16

**多资产组合回测**

- 新增 `quant_backtest_portfolio`：初始按权重建仓、可选定期再平衡、双边手续费
- 输出组合净值曲线、总收益、最大回撤、夏普、最终权重、再平衡次数
- 3 个手算单测 + 真实 BTC+ETH 60/40 组合实测（3 次再平衡、权重回归目标）
- 修复：初始建仓与再平衡的手续费记账（费用预扣 + 两遍调仓）


## 0.3.0 — 2026-08-16

**策略族 + 资金管理**

- 新增 `quant_backtest_bollinger`（布林带突破）与 `quant_backtest_rsi`（RSI 均值回归）两个策略回测工具
- 三大策略（含双均线）统一支持可选 `stopLoss` / `takeProfit` 资金管理
- 每笔交易带 `exitReason`（signal / stop_loss / take_profit）出场归因
- 6 个手算单测 + 真实 BTC 数据验证（止损真实触发）

## 0.2.0 — 2026-08-16

**六项常用技术指标**

- 新增 `quant_kdj`（RSV 法）、`quant_williams_r`、`quant_cci`、`quant_obv`、`quant_adx`（+DI/-DI）、`quant_roc`
- 工具总数 9 → 15；6 个手算单测；真实 BTC 数据验证（ADX 19.28 与横盘实情一致）

## 0.1.1 — 2026-08-16

**开源协作设施**

- CONTRIBUTING.md、CHANGELOG.md、issue/PR 模板
- GitHub Actions CI（自动测试）+ tag 触发自动 npm 发布流水线（首次跑通）
- README badges、干净 package-lock、`prepublishOnly` 门禁

## 0.1.0 — 2026-08-16

**首发**

- `quant_market_fetch`：Binance 公共 API 行情（免凭据）
- 六项基础指标：SMA / EMA / RSI / MACD / 布林带 / ATR（长度对齐 null 填充）
- `quant_backtest`（双均线交叉）+ `quant_backtest_grid`（参数网格搜索）
- 30 手算单测 + 4 Loader 组合测试 + 消费者模拟 + 真实数据端到端
- bundle 化：`dsh plugin add dsh-quant-indicators` 可装
