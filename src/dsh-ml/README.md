# dsh-ml（PCPT 映射：组合与建模域）

策略回测、组合构建、指标库与 ML 框架。PCPT 的长期目标不是“模型清单”，而是一个能够大规模利用数据与计算资源、持续做实验并把研究转化为生产候选的 AI-native research system。

## PCPT Six-Layer Research System

PCPT 按以下六层持续升级，顺序本身就是研究闭环：

1. **Data** — 大规模时序 / LOB / alternative data / text / multimodal 数据；数据质量、PIT、版本化、列式存储、batch + streaming；目标是能够利用大量数据并为分布式训练与实验稳定供数。
2. **Model** — 线性 / Logistic / GBDT 作为 baseline；向 Transformer、sequence models、representation learning、multimodal、LLM、RL/IRL 等高容量模型扩展。模型必须建立在可复现 baseline 之上，而不是只追求复杂度。
3. **Experiment** — config-driven experiments、seed/version control、ablation、HPO、distributed training、compute scheduling 与资源分配。没有 experiment 就没有可验证的研究经验；每个重要 idea 都必须形成可重复实验。
4. **Evaluation** — 从 loss/MSE/AUC 扩展到 IC/RankIC、decay、turnover、PnL、Sharpe、drawdown、cost-adjusted performance、OOS robustness、regime stability。通过 benchmark matrix 持续比较 data × model × regime × metric。
5. **AI Agent Research Pipeline** — Agent 用于 literature review → hypothesis → dataset → experiment → evaluation → failure analysis → artifact；自动化建立在对前四层的深刻理解之上，不替代研究判断。
6. **Research → Production** — 把成熟的 research artifact 接到 P-Trading / PWL / PTFT / PMMT 等生产链路：signal candidate → backtest → risk/cost gate → paper/live candidate。公开仓保留方法与框架，生产策略与参数继续留在内部。

### Priority

**Core first:** Data → Model → Experiment → Evaluation。

前四层是 PCPT 的研究能力本体，也是最优先强化的部分。第五层 Agent 是效率放大器；第六层 Research-to-Production 是最终价值转化。当前重点尤其是：

- 扩展 Data scale / quality / alternative-data capability；
- 建立从 baseline 到 Transformer / sequence / representation / multimodal / LLM / RL 的模型阶梯；
- 形成真正的实验经验与可重复 experiment registry；
- 用 PBenchmark / benchmark matrix 做跨模型、跨数据、跨 regime 的系统评价。

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

- 公开：方法、框架、demo、benchmark、知识（本域全部内容）。
- 内部（PCPT）：生产数据、生产特征库、模型参数、策略、RL/agent production 实现。
