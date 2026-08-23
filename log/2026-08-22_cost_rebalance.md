# [2026-08-22 19:20:00] 成本关卡 + 再平衡调度（0.88.0）

- quant_trading_cost：佣金 + 滑点（半价差）+ Almgren-Chriss 市场冲击
  （∝ σ × √参与率）—— 回测前成本关卡
- quant_rebalance_schedule：漂移 vs 成本权衡 → 最优再平衡频率
- 5 个手算单测 → 单元 210 → 215；工具 57 → 59
- 实盘路径：成本（交易成本模型）→ 组合（优化+再平衡调度）→ 执行
- 发布：push master + tag v0.88.0 + npm 自动发布（第 109 次）
  + GitHub Release 手动建 + Announcement #102
