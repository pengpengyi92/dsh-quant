# eval/ — 评测

对 agent 使用 dsh-quant 完成任务的评测集：任务描述、期望工具链、判分标准。
欢迎 PR 贡献 eval 用例。

- 内部联动：对应 PAT（PENGYI AGENT TEAM，private）的 evaluation 维度。

## Skill 映射（2026-08-16 升级）

| 官方 skill | 用途 |
|---|---|
| dsh-prose-standard | 评估结论的措辞标准 |
| dsh-trim-cot-leakage | 评估文档去除推理残留 |

研究评估 = factorEvaluate（IC/RankIC/IC衰减）+ walkForward（OOS IC）+
Kupiec 检验 + 回撤分析。金标准见 docs/ML_GUIDE.md §3。
