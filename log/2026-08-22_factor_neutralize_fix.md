# [2026-08-22 03:00:00] quant_factor_neutralize 修复（0.83.0）

- 发现：`quant_factor_neutralize` 工具**一直注册在 46 工具里**（loader
  测试工具名列表含它），但 index.ts 的 `factorNeutralize` **导入缺失** →
  执行无法解析（build 报 never 类型）；README 文档早已承诺该工具
- 修复：补上导入 + 删除重复导出行 + 新增 5 个手算单测
  （zscore 标准化 / 组内 zscore / OLS 残差 R² / 残差方向保留 / 前置
  条件）→ 单元测试 174 → **179 全过** + build + 4 Loader 全绿
- 端到端验证：group 中性化真实执行正确（两组各自标准化，
  组间水平差消除）
- 教训：工具「注册了但导入断了」是最难发现的静默故障——loader
  测试只验证注册数量不验证执行；README 文档行 + 实际执行才是
  真相（呼应 swe-verify：绝不报告未经验证的成功）
- 发布：push master + tag v0.83.0 + npm 自动发布（第 104 次）
  + GitHub Release 手动建 + Announcement #97
