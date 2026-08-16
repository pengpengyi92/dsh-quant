# tool-use/ — 工具使用

quant_* 工具的使用示例、典型工作流（fetch → stats → quality → indicators →
backtest）、提示词模板。

- 内部联动：对应 PAT（PENGYI AGENT TEAM，private）的 tool-use 维度。

## Skill 映射（2026-08-16 升级）

| 官方 skill | 用途 |
|---|---|
| dsh-pre-push-checks | 工具改动后跑最小验证集（build+test+gen+verify）|
| dsh-find-simplifications | 纯函数审阅：重复计算/死分支 |

dsh-quant 自有 skill：`quant-research`（工具链顺序 + 契约）→ 见 skill/README.md。
