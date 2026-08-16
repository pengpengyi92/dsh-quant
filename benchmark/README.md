# benchmark/ — 基准

指标数值正确性的基准集（手算基准）、回测基准场景、跨所一致性基准。
欢迎 PR 贡献新的基准数据与基准场景。

- 内部联动：对应 PAT（PENGYI AGENT TEAM，private）的 benchmark 维度。

## Skill 映射（2026-08-16 升级）

| 官方 skill | 用途 |
|---|---|
| dsh-code-review | 基准测试评审：契约先行 |
| dsh-pre-push-checks | benchmark 随发版验证集运行 |

benchmark 即 162 个手算单元测试 + 4 Loader 组合 + verify 实时集成。
