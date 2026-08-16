---
name: quant-research
description: Use when running quantitative research with dsh-quant — factor evaluation, backtests, risk analysis, fund simulation, walk-forward validation, or the end-to-end research pipeline. Gives the canonical tool chain, alignment conventions (no look-ahead, null padding, factor[i]→returns[i+1]) and the out-of-sample validation gold standard.
---

# Quant Research with dsh-quant

dsh-quant 的量化研究标准工作流：工具按域组合成 PDAT→PET 链路，每步都有
对齐契约与验证金标准。规划（planning）时按链路排布任务；执行（tool use）
时严格按契约传参。

## 1. 规划：PDAT→PET 链路

```
planning: 数据 → 质量 → 特征/因子 → 模型/回测 → 风控 → 交付
tool use: quant_market_fetch → quant_data_quality → quant_factor_evaluate/
          quant_factor_neutralize → quant_backtest*/quant_walk_forward →
          quant_risk/quant_drawdown → quant_fund/quant_report/quant_chart
```

- 单标的完整研究：一条 `quant_research_pipeline` 跑通全链路（含报告与图表）。
- 多标的并行：每个标的交给一个 subagent 调 `quant_research_pipeline`
  （纯 TS 侧可用 `researchMultiAsset`），单标的失败不阻断其他标的。
- 研究结论的样本外证据必须来自 `quant_walk_forward` 的 OOS IC/RankIC，
  训练集 R2 只是参考。

## 2. Tool use 契约（不可违反）

- **对齐**：所有输出与输入等长，头部无法计算的窗口位置为 null——按索引
  直接对齐，模型不需要补 padding。空序列/超窗是合法结果（全 null），不是错误。
- **无未来函数**：`factorValues[i]` 预测 `forwardReturns[i+1]`；
  回测信号在 bar i 确认、bar i+1 收盘成交。
- **联合类型用 oneOf**：`items: { oneOf: [{ type: 'number' }, { type: 'null' }] }`；
  输出对象每个字段都要 `required: true`。
- **非有限数**在 registry 层即被拒绝（lossless JSON），NaN/Infinity 不可达 execute。
- 数据源：加密（binance/okx/bybit 自动容错）、A股（sina/tencent 前复权）、
  美股/全球（yahoo）；深度数据走渠道知识库 `quant_data_guide`。

## 3. 验证金标准

- 因子：`ic`（Pearson）+ `rankIc`（Spearman）+ `icDecay`（衰减应平滑）+
  `longShort`（多空价差）+ `turnover`（换手成本校验）。
- 模型：`quant_walk_forward` 滚动训练/样本外预测；**禁止随机 K 折**
  （时序数据随机切分泄漏未来）；多次试验需 Deflated Sharpe 校正。
- 策略：`quant_metrics`（收益/回撤/夏普/卡玛）+ `quant_risk`（VaR/CVaR/β/IR）
  + `quant_drawdown`（回撤段/恢复）+ Kupiec 检验（`quant_var_backtest`）。
- 交付：`quant_fund`（1 亿起 NAV 1.00 双费高水位）+ `quant_report` +
  `quant_chart` 图表数据。

## 4. 边界

公开方法与框架，不公开生产策略；生产策略/特征库/RL 实现属内部 PCPT。
过拟合诊断清单与 RL 问题形式化见 `docs/ML_GUIDE.md`。
