# [2026-08-22 17:30:00] IC 衰减 + 组合优化器（0.85.0）

- quant_ic_decay：各 horizon IC + 半衰期 + 最优 horizon + 信号类型
  （short/medium/long）—— 指导再平衡频率
- quant_portfolio_optimize：maxSharpe / minVar / riskParity 三种权重
  优化 + 组合统计 + 集中度 —— 与 backtestPortfolio 无缝衔接
- 7 个手算单测（交替信号短周期 / AR(1) 长周期 / 三种优化权重 / 前置
  条件）→ 单元 186 → 193
- 端到端实测：短周期 halfLife=2；minVar 低波动资产 97% 权重
- 研究链路完整化：因子 → 中性化 → IC 衰减（定频率）→ 组合优化
  （定权重）→ 回测 → 风控 → 报告
- 发布：push master + tag v0.85.0 + npm 自动发布（第 106 次）
  + GitHub Release 手动建 + Announcement #99
