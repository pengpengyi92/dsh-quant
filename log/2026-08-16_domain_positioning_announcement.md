# 2026-08-16 域驱动模块全景发布（issue + discussion）

定位公告正式发布到 dsh-quant 仓库：对象感/模块感极强的域分类。

## 内容要点
- 分类来源：内部私有仓库组织方式（PDAT/PAAT/PCPT/PRT/PET 五团队独立运作）
- 域映射：dsh-data→PDAT、dsh-alpha→PAAT、dsh-ml→PCPT、dsh-risk→PRT、dsh-execution→PET
- 内外边界五条：「数据与结论留在内部，工具与方法进入 dsh-quant」
  1. 不提供数据本身 → 数据源清单 + 免费数据接口
  2. 不直接提供 PAAT alpha（保密）→ 指标库/因子评价/回测框架/UI
  3. 不提供 PCPT ML/RL 生产策略 → demo + ML/DL 知识 + 训练评估框架
  4. 不提供 PRT 风控策略 → 风控指标 + Kupiec 检验等模块
  5. 不提供 PET 交易工程（无实盘）→ dsh 交易框架 + 基金模拟 + 图表报告
- 内外完全独立、互相学习；开源优势 = 讨论交流；持续更新进步

## 发布位置
- Issue: https://github.com/pengpengyi92/dsh-quant/issues/9 （已置顶 📌）
- Discussion (Announcements): https://github.com/pengpengyi92/dsh-quant/discussions/10
- 正文暂存: .scratch/domain-positioning-{issue,discussion}.md

## 状态
✅ issue 创建并置顶；✅ discussion 创建；⏳ 待社区反馈
