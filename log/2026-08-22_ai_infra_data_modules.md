# [2026-08-22 16:45:00] AI-infra 数据模块 · own 模块计划 1-4（0.84.0）

- **动机**：与世纪前沿 zhiqing（AI infra / 数据模块）共建的
  切入点 —— 数据质量层是最对口的方向（own 一个模块理念）
- **四个模块全部落地**：
  1. 数据质量层：`quant_data_pit`（PIT 前视检测 / 幸存者偏差 /
     渠道可靠性 + 健康度）—— 新文件 src/dsh-data/quality.ts
  2. AI-infra 渠道视角：`quant_channel_guide`（接入指南 +
     就绪检查）—— data-guide.ts 追加
  3. CLI 工具化：`dsh-quant quality` / `dsh-quant channel`
  4. 产业链闭环：quant-upstream 闭环段（研究界 PDAT→PET 且闭环）
- **验证**：186 单元（+7 手算单测）+ 4 Loader + build 全绿；
  CLI 双命令实测通过；工具 46 → 48
- **与 zhiqing 共建话术**（数据方向）："数据质量是量化最贵的
  一环，我们开源工具（PIT/幸存者/渠道），你们贡献实践规范"
- 发布：push master + tag v0.84.0 + npm 自动发布（第 105 次）
  + GitHub Release 手动建 + Announcement #98
