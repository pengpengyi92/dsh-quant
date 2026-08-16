# News

## 0.8.0 — 2026-08-16

**数据指南扩充（19 → 21 工具）**

- `quant_data_compare`：按数据类型对比 8 渠道（覆盖情况 + 费用门槛 + 适用场景）
- `quant_data_advice`：场景决策树（预算 free/low/institutional × 用途 research/backtest/official → 排序推荐 + 理由）
- 5 个决策树单测（baostock 回测优先 / tushare 低预算 / wind 机构 / 官方用途）


## 0.7.0 — 2026-08-16

**工程完备化：开箱即用 + 交互 + 依赖治理**

- `log/`：每版本更新记录；`mcp/`：交互指南 + tools.json（19 工具 schema，运行时生成）；`docs/ENVIRONMENT.md`：环境依赖全清单
- 纯函数再导出：任意 Node 项目 `import { sma, backtestMaCross } from 'dsh-quant'` 零 harness 使用
- README：欢迎 PR、定期 merge；fork/pull → npm ci → npm test 即通过
- 定位：dsh 好用的 quant 研究工程（R&D 是核心）


## 0.6.0 — 2026-08-16

**数据渠道指南 + 更名**

- 新增 `quant_data_guide`：A 股 8 大数据渠道知识库（akshare/baostock/tushare/Wind/iFinD/上交所/深交所/中证指数），按渠道名或数据类型查询，返回费用/接入/教程
- **更名 `dsh-quant-indicators` → `dsh-quant`**（DeepQuant Harness）；工具前缀 `quant_*` 不变，向后兼容
- 6 个知识库单测


## 0.5.0 — 2026-08-16

**多交易所行情数据源**

- `quant_market_fetch` 新增 `provider` 参数：`binance`（默认）/ `okx` / `bybit`
- OKX/Bybit 原生 REST adapter（零依赖 fetch + 倒序归一 + 统一 Candle）
- 跨所一致性验证：同日 BTC close 偏差 0.005%（OKX 63063.3 vs Bybit 63066.3）
- 4 个解析单测（真实响应样本）


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
