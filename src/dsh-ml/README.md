# dsh-ml（PCPT 映射：组合与建模域）

策略回测、组合构建、指标库与 ML 框架（DL/RL 为知识层，生产策略在内部 PCPT）。

## 模块

- `backtest.ts` — 4 策略引擎（MA交叉+网格/布林突破/RSI反转/多资产组合）+ 资金管理
- `metrics.ts` — 回测指标库（9 净值指标 + 交易级 + METRIC_CATALOG）
- `walkforward.ts` — Walk-forward 训练评估框架（滚动 OLS/样本外/OOS IC/RankIC）
- `linear.ts` — 独立线性模型（OLS/Ridge 的 fit/predict/evaluate），可手算

原则：无未来函数（bar i 信号 bar i+1 成交）；手算基准单测。

## ML/DL 架构知识

完整的量化 ML/DL 架构地图见 [docs/ML_GUIDE.md](../../docs/ML_GUIDE.md)：
研究管线架构、模型阶梯（线性→树→DL→RL）、样本外验证金标准
（walk-forward / 禁随机 K 折 / Deflated Sharpe）、过拟合诊断清单、
RL 问题形式化。

可执行 demo：`npx tsx demos/ml-workflow.ts`（真实数据 → 特征 → 中性化 →
线性模型 → walk-forward → 结论）。

## 边界

- 公开：方法、框架、demo、知识（本域全部内容）。
- 内部（PCPT）：生产策略、特征库、模型参数、RL 实现。
