# [2026-08-22 18:50:00] 验证工具组：防过拟合四件套（0.87.0）

- quant_factor_correlation：相关矩阵 + 有效独立因子数（Participating
  Ratio）—— 因子去重
- quant_deflated_sharpe：Bailey & López de Prado 过拟合校正夏普
  （试验次数校正 + p 值）—— 回测金标准最后一环
- quant_stress_test：压力情景（崩盘/流动性危机/波动飙升）组合损失
- quant_parameter_sensitivity：参数网格稳健性（平原 vs 针尖）
- 10 个手算单测 → 单元 200 → 210；工具 53 → 57
- 端到端实测：ρ=1.0 有效数 1.0；50 试验夏普仍显著；压力 -65.4%；
  敏感性 0.77
- 实盘质检关卡齐：因子去重 → Deflated Sharpe + 敏感性 → 压力测试
- 发布：push master + tag v0.87.0 + npm 自动发布（第 108 次）
  + GitHub Release 手动建 + Announcement #101
