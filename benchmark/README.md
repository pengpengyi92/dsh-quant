# benchmark/ — 基准

指标数值正确性的基准集（手算基准）、回测基准场景、跨所一致性基准。
欢迎 PR 贡献新的基准数据与基准场景。

- 内部联动：对应 PAT（PENGYI AGENT TEAM，private）的 benchmark 维度。
- PCPT 联动：这里是 PBenchmark / benchmark-matrix 的公开方法层，用于把 **Data × Model × Experiment × Evaluation** 固化成可重复证据，而不是只记录单次最好结果。

## Benchmark Frameworks

### JMatrix — Job × People
见 [jmatrix/](./jmatrix/)。

用于还原岗位、人物、组织位置与切入路径。

### ECB — Early Career Benchmark
见 [ecb/](./ecb/)。

通过 Internship / Graduate / MT / apprenticeship / rotation / conversion 等早期人才机制，反推公司的 **organizational orientation / culture / talent model**。

首个正式 bank case：
- [BOCHK — Cross-border Institutional Banker Pipeline](./ecb/bochk.md)

ECB 与 JMatrix 互补：
- **JMatrix** 回答“这个岗位是什么、谁在做、怎么切入”；
- **ECB** 回答“这家公司从最早期开始想培养什么样的人”。

---

## PCPT Benchmark Matrix

建议每个重要实验至少登记：

| Dimension | Examples |
|---|---|
| Data | source / universe / frequency / PIT version / feature set |
| Model | baseline / GBDT / Transformer / sequence / representation / multimodal / LLM / RL |
| Experiment | seed / config / compute / ablation / train-validation split |
| Evaluation | loss / IC / RankIC / decay / turnover / PnL / Sharpe / drawdown / cost / regime stability |
| Artifact | code / config / checkpoint / report / paper / production-candidate status |

核心原则：**benchmark 不等于 leaderboard；benchmark 是可复现比较协议。**
任何更复杂模型都应该能回答：相对 baseline，在哪些数据、regime、成本假设与 OOS 区间下真正改善。

## Skill 映射（2026-08-16 升级）

| 官方 skill | 用途 |
|---|---|
| dsh-code-review | 基准测试评审：契约先行 |
| dsh-pre-push-checks | benchmark 随发版验证集运行 |

benchmark 即 162 个手算单元测试 + 4 Loader 组合 + verify 实时集成。
