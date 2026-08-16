# rag/ — 检索增强

检索增强资料的约定：数据渠道文档、指标公式卡片、研究报告片段的索引方式。
`quant_data_guide` 的知识库（src/data-guide.ts）是当前最小的内置 RAG 形态。

- 内部联动：对应 PAT（PENGYI AGENT TEAM，private）的 RAG 维度。

## Skill 映射（2026-08-16 升级）

内置 RAG 语料 = quant_data_guide 的 13 渠道知识库（随包分发、零网络）。
官方 skill 体系无检索类技能，检索走工具：`quant_data_guide`（渠道）
+ `quant_repo_stats`（GitHub 生态数据）。
