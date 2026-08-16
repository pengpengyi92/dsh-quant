# dsh-quant Skill 体系整理（带时间戳）

## [2026-08-17 00:43:27] 启动
任务：调研 dsh 官方 skill 开源体系 → 全量引用到 dsh-quant → 与 dsh-quant
工作流做 skill 映射（tool use + planning 两列）→ 生成自有 SKILL.md。

## [2026-08-17 00:43:27] 调研完成
- 官方 skill 能力族（packages/skill/）：skill（注册/查找 ctx.skills）、
  skill-badge（内置徽章）、skill-filesystem（本地目录发现）、tool-skill（目录+加载工具）
- 规范（docs/subsystems/skills.md）：kebab-case 名、目录包 <name>/SKILL.md、
  frontmatter name+description、可选 disable-model-invocation/user-invocable
- 官方 11 个 skills（.agents/skills/）：archive-agent-notes / code-review /
  doc-site-sync / doc-standards / find-simplifications / merging-stacked-prs /
  pre-push-checks / prose-standard / translate-docs / trim-cot-leakage / record-browser-gif

## [2026-08-17 00:45:14] 产出完成
- skill/README.md：官方 skill 体系引用 + 11 skills 全量映射表（tool use /
  planning 双列）+ 自有 skills 清单 + 七维度映射索引 + 加载方式
- skill/quant-research/SKILL.md：研究工作流 skill（frontmatter 兼容官方格式：
  name/description + markdown 正文；工具链顺序 + 契约 + 验证金标准 + 边界）
- skill/quant-release-cycle/SKILL.md：发版纪律 skill（官方 dsh-pre-push-checks
  的 dsh-quant 落地版）
- 六维度文件夹（tool-use/memory/rag/benchmark/eval/plan）各追加 skill 映射段
- 兼容性核对：kebab-case 名 ✓；目录包 <name>/SKILL.md ✓；frontmatter
  name+description ✓（未用 disable-model-invocation，默认模型+用户双可调用）

## [2026-08-17 00:46:35] 发布完成
- 0.20.1 patch 发布（skill 体系随 npm 包分发：skill-filesystem 可指向
  node_modules/dsh-quant/skill 直接加载）
