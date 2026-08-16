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

## 追加：星标增长行动（同日）
- ✅ GitHub topics 扩到 15 个（deepseek/llm/ai-agents/quantitative-finance/backtesting/factor-investing/risk-management/algorithmic-trading/finance...）
- ✅ README 星标漏斗升级：stars/downloads 徽章 + UI 截图 + 快速安装 + 34 工具/5 域卖点 + NEWS 补到 0.16.0 + 已知限制更新 + ⭐ CTA 结尾
- ✅ 置顶 issue #9 尾部加星标 CTA（指向 discussion #10）
- ✅ README commit 267344f 已推送
- ⏳ awesome-dsh-plugin PR #958 待 maintainer merge（mergeable UNKNOWN）
- ⏳ X 发布 + bio 挂 GitHub 链接（用户侧操作）
- 基线：3 stars / 0 forks

## 追加：X 求星宣发（同日）
- ✅ X 推文已发布：pulse 自评 40/C + 「点一颗 ⭐ 帮它上 B 级」钩子（用户侧手动发布，链接待补录）
- ✅ 发布后即时狗粮复测：stars 3 | forks 0 | issues 7 | PRs 0 | npm 7d downloads 0 → pulse 40/C
- 📌 观察点：7 个 open issue 多为征集帖（邀请性质），pulse 健康分把它们计为积压 →
  0.18.0 候选：healthScore 区分 invitation/征集标签 或按 issue 年龄加权
- 📌 观察点：npm downloads API 对新发布包有滞后（7d=0），下载分档短期失真

## 追加：awesome PR #958 按新规范重做（同日）
- 背景：上游列表迁移到「一插件一 YAML」格式（#970），maintainer fkysly 留言：
  旧 README 直改方式作废 + 缺中文描述 → 无法自动转换
- 修复：data/plugins/pengpengyi92__dsh-quant.yml（category: tools，en/zh 双描述）
  + 重新生成两个 README（1018 条目）+ screenshots.json 挂工作台截图
- CI：Submission gate pass + check pass（22s）；仓库年龄未卡（07:40Z 创建，8 小时）
- PR 状态：awaiting maintainer merge（标题已改为单包 YAML 格式，已回复致谢）
- dsh-quant-ui 未单独提交：非 dsh 插件（独立 Web 工作台），待 client-plugin 化后再收

## 追加：官方 deepseek-harness 贡献帖（同日）
- 调研结论：官方明确「暂不接受外部 PR」+ issues 已关闭 → 唯一贡献通道是 Discussions
  （CONTRIBUTING.md 原文：cannot accept external pull requests；团队监控讨论并据此分配资源）
- 已发布 Ideas 帖 #2512：schema DSL 两个改进建议（实证自 dsh-quant 37 工具实战）
  1. 联合类型报错应指向 oneOf：json-schema.ts L305 现报文只说「type arrays are not supported」，
     不指路正确写法（nullable 数组是插件最常见形态）→ 建议一行改动
  2. cookbook 输出小节应提醒输出属性标记 required:true，否则 InferValue 推断为可选、
     运行时静默、render 里 value possibly-undefined
- 查重：官方讨论区无 defineTool/schema DSL 相关帖（搜索结果为空）
- 链接：https://github.com/deepseek-ai/deepseek-harness/discussions/2512
- 帖中承诺：官方开放外部 PR 通道后，我们直接贡献这两处小改动

## 追加：官方 Show Your Plugins 展示帖（同日）
- 已发布 #2513：dsh-quant 0.17 六域全景展示（含工作台截图 embed、社区循环、awesome 收录链接）
  https://github.com/deepseek-ai/deepseek-harness/discussions/2513
- 旧帖 #2307（dsh-quant-indicators 时代）留言指路新帖，避免重复展示
- 同日官方区三连：DX 建议 #2512（Ideas）+ 展示 #2513（Show Your Plugins）+ 旧帖更新
