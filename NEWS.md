# News

## 0.15.0 — 2026-08-16

**VaR 回测检验 + 周期聚合 + 研究报告（31 → 34 工具）— 测试破百！**

- `quant_var_backtest`：Kupiec POF 检验（失败率 vs 期望、LR 统计量、近似 p 值、95% 通过判定）
- `quant_resample`：K 线周/月聚合（OHLCV + 根数，7×24 市场）
- `quant_report`：把 metrics/risk/factor/fund 组装成 Markdown 研究报告
- 单元测试 **100 个**（里程碑）


## 0.14.0 — 2026-08-16

**风险模块（30 → 31 工具）**

- `quant_risk`：历史 VaR / CVaR（Expected Shortfall）/ 下行偏差 / 最大回撤 / Beta / Jensen Alpha / 信息比率 / 跟踪误差
- 基准对比能力（无基准时 beta/alpha/IR 为 0）
- 6 个手算单测（VaR 分位、beta=2 线性基准、beta=1 同基准、前置条件）
- 真实 BTC：VaR95 2.92%、CVaR95 4.17%、maxDD 28.69%


## 0.13.1 — 2026-08-16

**UI demo 修复：双击即开的自包含版本**

- demos/ui-demo-standalone.html：数据内嵌，file:// 直接打开（修复浏览器 fetch 本地 JSON 被拦截）
- Lightweight Charts CDN fallback（unpkg → jsdelivr）


## 0.13.0 — 2026-08-16

**模拟量化基金（29 → 30 工具）— 游戏化前身**

- `quant_fund`：1 亿初始资金、净值 1.00 起步、管理费按日计提（默认 2%/年）、业绩提成高水位（默认 20%）
- 输出终期净值/终期 AUM/峰值 AUM/费前费后收益/累计费用/费后净值序列
- UI demo 新增 Fund 区块（8 张卡片 + 费后净值 vs 策略净值对比图）
- 真实数据实测：1.00 亿 → NAV 0.9816 → AUM 0.982 亿 → 净 -1.84%（费用侵蚀符合私募逻辑）
- 愿景：未来单独做"模拟开量化私募"游戏


## 0.12.0 — 2026-08-16

**回测指标库 + Jane Street 风格 UI demo（28 → 29 工具）**

- `quant_metrics`：9 项指标（必有收益/回撤/夏普 + 波动/Calmar/Sortino/胜率/盈亏比/平均期收益）+ 交易级指标
- METRIC_CATALOG 指标目录（key/中英名/格式化/必有标记）——UI 勾选即显示
- demos/ui-demo.html：Jane Street 风格（克制配色、橙色点缀、等宽数据）真实回测 UI 样板——K线+均线+买卖点、净值图、指标选择器
- demos/gen-ui-demo-data.ts：真实数据一键生成 demo JSON
- 7 个手算单测 + Discussion #7（指标系统征集 PR：VaR/CVaR/IC 衰减/beta…）


## 0.11.0 — 2026-08-16

**chart 数据面（27 → 28 工具）— UI 引爆路线第一步**

- `quant_chart`：结构化图表数据（dsh-chart 协议）——candles（K线+均线叠加+买卖点标记）/ series（净值、IC 序列）/ annotations（点级标注可视化）
- 纯函数 chart.ts（chartCandles/chartSeries/chartBacktest/chartAnnotate）零依赖
- 4 个手算单测；真实数据验证（120 根 K 线 + SMA20 叠加 + 标注图）
- 设计文档 log/2026-08-16_ui_chart_design.md + Issue #6（UI 征集）


## 0.10.1 — 2026-08-16

**R&D 工作流 demo + 方法论文档**

- `demos/rd-workflow.ts`：真实数据 7 步研究闭环（fetch→stats→quality→indicators→factor→backtest→结论）可执行 MVP case
- log：dsh-quant 如何辅助 R&D（三模式：research/development/data governance + 生态关系）
- Issue #4（LLMQuant 致敬）+ #5（R&D 辅助征集）


## 0.10.0 — 2026-08-16

**因子实验室（25 → 27 工具）—— R&D 助手主干补齐**

- `quant_factor_evaluate`：alphalens 指标集纯函数版（IC/ICIR/分位数分层/多空价差/换手/自相关）
- `quant_factor_combine`：多因子 z-score 加权 + 截面 rank 归一化
- 因子生态调研 log（alphalens/qlib/RD-Agent/AlphaInspect 全景 + 差异化定位）
- 6 个手算单测；真实 BTC ROC 因子实测（IC -0.05，横盘动量无效——诚实结果）


## 0.9.1 — 2026-08-16

**数据标注 + 序列质量（23 → 25 工具）+ 七维文件夹**

- `quant_series_quality`：缺值 / z 异常（>3σ）/ 跳变 / 冻结连续值检测
- `quant_data_annotate`：点级数据标注（missing/z_outlier/jump_up/jump_down/frozen + 三级严重度），致敬 Scale AI（Alexander Wang）的标注哲学
- 七维文件夹：skill / tool-use / memory / rag / benchmark / eval / plan（对应内部 PAT 五维度体系，private 引用）
- **欢迎 PR**：数据检测与标注维度开放征集（见 GitHub Issue）


## 0.9.0 — 2026-08-16

**描述统计 + 数据质量（21 → 23 工具）**

- `quant_series_stats`：均值/方差/偏度/峰度/自相关/年化波动/总收益（取数后第一步）
- `quant_data_quality`：OHLCV 健康检查（high<low、非正、时间戳、缺口、极端变动 → healthy 标志）
- 5 个手算单测；真实 BTC 数据验证（healthy ✓）


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
