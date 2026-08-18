# 🚀 上手体验：一条 PDAT→PET 量化流水线（BTC 示例）

> 装完 dsh-quant 后，按这条流水线走一遍，你就完整体验了量化研究的
> 全流程。之后每个环节都可以换成你自己的插件——**everything is a plugin**。
> 一键版见文末（quant_research_pipeline）。

## 第 0 步：安装

```sh
npm i dsh-quant
```

cordis.yml 加一行：

```yaml
- name: 'dsh-quant'
```

46 个 `quant_*` 工具自动注册，agent 直接可见。

## 第 1 步：数据环（PDAT）——取数 + 体检

```
quant_market_fetch(symbol=BTCUSDT, interval=1d, limit=120)
quant_data_quality(candles=…)      → healthy 与否
quant_series_stats(close=…)        → 收益/波动的基本画像
```

**体验**：公开数据怎么取、怎么体检（缺值/异常/时间戳）。以后这里
可以接你自己的数据源插件（A股/美股/数据库）。

## 第 2 步：因子环（PAAT）——造信号 + 评价

```
quant_sma(close, 20)                       → 均线
quant_factor_evaluate(动量因子, 未来收益)   → IC / RankIC / 分层 / 多空
quant_factor_neutralize(因子, 风格)        → 中性化
```

**体验**：因子怎么算、怎么用 IC 评价、怎么中性化。以后这里换成
你自己的 alpha 插件（内部 alpha 永远不开源到这里，范式给你）。

## 第 3 步：策略环（PCPT）——回测 + 看结果

```
quant_backtest(close, fast=5, slow=20)   → 交易/净值/回撤
quant_metrics(equityCurve, trades)       → 夏普/卡玛/胜率
quant_walk_forward(收益, 特征, 30, 10)    → 样本外验证（防过拟合）
```

**体验**：双均线策略怎么回测、指标怎么读、为什么样本外验证是金标准。
以后这里换成你自己的模型插件（DL/RL/树模型）。

## 第 4 步：风控环（PRT）——量风险 + 设红线

```
quant_risk(returns)          → VaR/CVaR/β/α/IR
quant_drawdown(equityCurve)  → 回撤段/恢复/水下
quant_var_backtest(…)        → Kupiec 检验（模型准不准）
```

**体验**：风险怎么度量、回撤怎么解剖、VaR 模型怎么检验。以后这里
换成你自己的风控插件（压力测试/组合 VaR/更多检验）。

## 第 5 步：交付环（PET）——模拟盘 + 报告

```
quant_execute_sim(close, orders, 滑点/费/延迟)   → 成交/权益/成本
quant_fund(equityCurve, 1亿起)                  → 净值/管理费/提成
quant_report(各模块输出)                        → Markdown 研究报告
```

**体验**：订单怎么模拟成交、量化私募怎么收费（1 亿起、净值 1.00、
高水位 20% 提成）、结论怎么成文。以后这里换成你自己的执行插件
（撮合模型/模拟盘闭环/券商接入调研）。

## 一键版（体验完整链路）

```
quant_research_pipeline(symbol=BTCUSDT, limit=120, fast=5, slow=20)
→ 数据/质量/统计/回测/指标库/风控/回撤/基金/因子/报告/图表 全部一次返回
```

## 之后：按自己的想法插插件

- 每个域都是插槽（数据/因子/模型/风控/执行 × 多插件）
- 插件征集：Issue #27；贡献指南：CONTRIBUTING.md
- 契约：等长 null 对齐、无未来函数、手算测试——范式给足，自由发挥
