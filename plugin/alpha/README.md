# plugin/alpha —— 因子插件（插槽：dsh-alpha）

| 插件 | 类型 | 一句话 | 对接方式 |
|---|---|---|---|
| [101 Formulaic Alphas](https://github.com/topics/101-formulaic-alphas) | 论文/库 | WorldQuant 的 101 个量价 alpha 公式（GitHub 有大量 Python 实现）| 实现后喂 `quant_factor_evaluate`（IC/RankIC/分层）复现验证 |
| [alphalens](https://github.com/quantopian/alphalens) | Python 库 | Quantopian 因子评价库（dsh-quant 因子评价的方法同源）| agent 经 subprocess 调用，结果与 `quant_factor_evaluate` 互验 |
| [Microsoft qlib Alpha158/Alpha360](https://github.com/microsoft/qlib) | Python 库 | 微软 AI 量化平台的 158/360 因子库 | 因子数据导出 → dsh-alpha 插槽做中性化/walk-forward |
| [linxichen/dsh-rigorquant](https://github.com/linxichen/dsh-rigorquant) | dsh 插件 | RigorQuant 多智能体研究 preset+skill | dsh 内挂载，无人值守因子研究 |
| WorldQuant BRAIN / WebSim | 平台 | 免费 Web alpha 仿真（写表达式→回测→入库）| 平台产出因子 → 本地用 dsh-alpha 工具复现 |

**内置对照**：`quant_factor_evaluate`（IC/RankIC/IC 衰减/分层/多空）+
`quant_factor_neutralize`（分组/OLS）+ `quant_factor_combine`。

**典型组合**：从 101 Alphas 选因子 → BRAIN 平台验证想法 → qlib 批量
计算 → dsh-alpha 工具做样本外评价——因子流水线完整闭环。
