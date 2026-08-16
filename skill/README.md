# dsh-quant Skill 体系：官方全量引用 + 工作流映射

dsh 的 skill 体系已开源（`deepseek-ai/deepseek-harness` 的 `packages/skill/` 能力族
+ `.agents/skills/` 官方技能库）。本目录把官方 skills **全量引用**到 dsh-quant，
并与 dsh-quant 的工作流做**映射对应**，落到 **tool use**（工具怎么用）与
**planning**（研究怎么规划）两个平面。

## 1. 官方 skill 体系（引用）

能力族四包：`skill`（注册/查找 `ctx.skills`）、`skill-badge`（内置徽章）、
`skill-filesystem`（本地目录发现 `<name>/SKILL.md`）、`tool-skill`（模型可见的
目录/加载工具）。规范：`docs/subsystems/skills.md`——kebab-case 命名、
frontmatter `name` + `description`、可选 `disable-model-invocation` /
`user-invocable`。

## 2. 官方 11 skills 全量清单 × dsh-quant 映射

| 官方 skill | 官方用途 | dsh-quant 映射（tool use） | dsh-quant 映射（planning） |
|---|---|---|---|
| dsh-pre-push-checks | 推送前最小检查集 | 发版前 `npm run build && npm test && npm run gen:tools && verify.ts`（见 `quant-release-cycle`）| 发版计划：改动面 → 最小验证集 → tag → 自动发布 |
| dsh-code-review | PR 评审标准 | 评审 PR 时对照域契约（null 对齐/无未来函数/isConcurrencySafe）| 评审计划：先契约后实现，先测试后代码 |
| dsh-prose-standard | 文字标准 | ML_GUIDE/域 README/工具 description 的措辞（模型视角、无营销词）| 文档计划：每个版本补 CHANGELOG + log + README 三件套 |
| dsh-doc-standards | 文档结构标准 | 教程 vs 参考分离：README=参考、docs/ML_GUIDE=教程、log/=过程记录 | 文档规划：新功能先定文档落点 |
| dsh-translate-docs | 双语文档工作流 | 中英双语文档的翻译与配对校验 | 发布计划：X 文案中英双语并行 |
| dsh-doc-site-sync | 文档站同步 | dsh-quant-ui pages.dev 部署后的链接校验 | UI 发版计划：demo 截图 + 站点同步 |
| dsh-archive-agent-notes | Agent Notes 生命周期 | log/ 的归档判定（v0.x 记录 vs 过程笔记）| 知识管理计划：结论入库、过程可弃 |
| dsh-find-simplifications | 找简化点 | 工具纯函数审阅（重复计算/死分支）| 迭代计划：每个大版本后做一次简化扫描 |
| dsh-merging-stacked-prs | 依赖 PR 栈落地 | awesome-dsh-plugin fork 同步/force-push 的规范（上游 rebase）| PR 计划：先同步上游再改分支 |
| dsh-trim-cot-leakage | 修剪推理残留 | 提交信息/文档去除「我试了/后来改成」类叙事 | 写作计划：结论先行，过程进 log |
| record-browser-gif | 浏览器演示 GIF | UI 演示动图（替换静态截图场景）| 产品计划：UI 变更必配演示 |

## 3. dsh-quant 自有 skills

| skill | 位置 | 用途 |
|---|---|---|
| quant-research | `skill/quant-research/SKILL.md` | 量化研究全流程：工具链顺序 + 对齐约定 + 验证金标准 |
| quant-release-cycle | `skill/quant-release-cycle/SKILL.md` | 发版纪律：官方 pre-push-checks 的 dsh-quant 落地版 |

## 4. 七维度文件夹映射（0.9.0 建立，本次升级为映射索引）

| 维度 | 官方 skill | dsh-quant 工具/工作流 |
|---|---|---|
| skill/ | 全部 11 个（本 README §2）| 本目录两个自有 skill |
| tool-use/ | pre-push-checks、find-simplifications | 43 个 quant_* 工具的调用链（见 quant-research）|
| memory/ | archive-agent-notes | log/ 版本记录 + 域 README（长期记忆）|
| rag/ | —（数据检索）| quant_data_guide 渠道知识库 = 内置 RAG 语料 |
| benchmark/ | code-review、pre-push-checks | 162 手算基准单测（benchmark 即测试）|
| eval/ | prose-standard、trim-cot-leakage | factorEvaluate/walkForward 的 OOS 评价 = 研究评估 |
| plan/ | doc-standards、merging-stacked-prs | 研究管线规划（PDAT→PET）+ subagent 每标的并行计划 |

各文件夹内 README.md 给出单维度详表。

## 5. 加载方式（dsh 会话内）

- `skill-filesystem` 指向本目录（或 npm 安装后指向
  `node_modules/dsh-quant/skill`）→ `quant-research` / `quant-release-cycle`
  进入目录；
- 模型通过 `skill` 工具加载：`skill(name="quant-research")` 后按指南执行
  tool use 与 planning。
