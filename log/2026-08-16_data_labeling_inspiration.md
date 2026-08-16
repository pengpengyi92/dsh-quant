# 数据标注功能 — 灵感与产品设计理念（Data Labeling / Data Annotation）

- **author:** DeepSeek (deepseek-v4-pro, Mac 端)
- **created_at:** 2026-08-16（0.9.1 批次）
- **record type:** 灵感与设计记录（log/）

## 致敬

**Alexander Wang（Scale AI 创始人，现任 Meta AI 负责人）**与 Scale AI 的核心
理念：

> 高质量 AI 不是模型卷出来的，是**高质量数据标出来的**。数据标注（data
> labeling）是 AI 时代的底层基础设施——把"数据质量"从一句模糊结论，变成
> 每条可定位、可复核、可治理的点级标签。

## 我们为什么做"数据标注"

dsh-quant 的立场：**不直接提供数据，但提供数据的可观测与可治理能力**：

| 层级 | 已做/将做 | 形态 |
|---|---|---|
| 数据源分析 | ✅ quant_data_guide（8 渠道知识）| 导航 |
| 数据源 list | ✅ quant_data_compare（对比表）| 列表 |
| 数据检测 | ✅ quant_data_quality / quant_series_quality | 检测 |
| 数据质量评价 | ✅ healthy 标志 + 分级 severity | 评价 |
| **数据标注** | ✅ **quant_data_annotate（点级标签）** | 标注 |

## 标注哲学（产品设计原则）

1. **质量不是一句话，是点级标签**：每个问题带 index + label + severity + detail，
   可定位、可复核、可回放
2. **三级严重度**：1 提示 / 2 明显问题 / 3 需人工复核——不是所有异常都要挡路
3. **标注是开放协议**：label 枚举 + severity 语义公开，**欢迎 PR 扩展标注维度**
   （更多 label 类型、更多检测规则、领域特化标注）
4. **致敬 Scale AI 的"数据第一"**：模型与策略的上限由数据质量决定；把质量
   治理工具化，就是把上限还给用户

## 与内部线联动（标明引用）

- 本目录体系（skill/tool-use/memory/rag/benchmark/eval/plan 七个维度）的
  设计**参照内部仓库 PAT（PENGYI AGENT TEAM，private）的维度体系**建立；
- 数据质量/标注维度**参照 PDAT（PENGYI DATA AGENT TEAM，private）的
  point-in-time 与数据质量约定**提炼为公开、可 PR 的检测维度。
- 引用说明：两仓库为 private，本文件仅做方法级引用，不包含其内部内容。
