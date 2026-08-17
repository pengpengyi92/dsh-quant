# dsh 开源生态内化手册（ECOSYSTEM PLAYBOOK）

把从 DeepSeek Harness 开源生态学到的东西，内化成 dsh-quant 自己的运营
基建。来源：官方仓库结构（deepseek-ai/deepseek-harness）、awesome-dsh-plugin
收录规范、官方 Discussions 社区、skill 体系、社区插件生态观察。

## 1. 贡献通道内化

学到的：官方「不收外部 PR、issues 关闭、Discussions 是唯一通道」；
awesome 列表「一插件一 YAML、CI 自动检查、批量转换」。

内化到 dsh-quant：
- 我们**收 PR**（比官方更开放是我们的差异化），但设四同步纪律：
  新工具 = index.ts 注册 + Loader 清单 + tools.json + README 表，四处一起改
- 贡献门槛 = 手算测试（数字不撒谎）；契约清单写在 CONTRIBUTING.md
- 征集帖模式：每个域一个「征集 issue」（数据标注/因子/UI/PET 执行），
  社区知道往哪里投

## 2. 收录规范内化

学到的：awesome 收录要求 `dsh-plugin` topic + `dsh.bundle` manifest +
`peerDependencies` + 真实代码（1 天/10 提交门槛）+ 双语描述 + 截图。

内化到 dsh-quant：
- 自身合规：topic ✓、manifest ✓、peerDependencies ✓（全部已达标）
- 生态目录按同规格维护：`docs/QUANT_ECOSYSTEM.md` 一条目一行，
  分类 + 状态 + 一句话——我们的「量化版 awesome」

## 3. 技能体系内化

学到的：官方 skill 能力族（注册/文件发现/目录加载）+ 11 个官方 skill +
SKILL.md 契约（kebab-case + frontmatter）。

内化：`skill/` 目录已落地——官方 11 skills 全量映射表 + 自有
`quant-research` / `quant-release-cycle` 两个 skill（见 skill/README.md）。

## 4. 社区宣发渠道内化

学到的：官方区 Show Your Plugins（产品展示）/ Ideas（改进建议）/
Q&A（bug 报告）分工；awesome 列表是星源；X 是声量。

内化节奏：
- 大版本 → 官方 Show Your Plugins 更新帖 + 自家 Discussion + X 文案
- 方法级改进 → 官方 Ideas 帖（如 DX 建议 #2512）
- 每版本三件套：CHANGELOG + README + log（带时间戳）

## 5. 生态位内化

学到的：插件各占生态位（数据/UI/工具/市场），互补不竞争；
「方法公开、秘密内部」的边界叙事是信任资产。

内化：
- dsh-quant 的生态位 = **量化方法层**（唯一 pipeline 跑通 PDAT→PET）
- 与数据插件的互补关系写进生态地图（Discussion #11），不抢数据生意
- 边界语言统一：「公开方法，头寸/策略/执行在内部」

## 6. 质量门内化

学到的：官方 pre-push-checks（最小验证集不无脑全量）、prose-standard、
trim-cot-leakage（文档无推理残留）。

内化：`quant-release-cycle` skill 固化最小验证集 + 三件套；
提交信息与文档结论先行、过程进 log。

## 7. 度量内化

学到的：生态影响力是可度量的（star/下载/issue 响应）。

内化：`quant_oss_pulse` 自评分（0-100 + 建议），每次发版后狗粮复测。

## 8. 迭代姿态内化

学到的：官方「Into the unknown」的坦诚 + 社区小步快跑的插件文化。

内化：持续堆量（当前阶段）→ 按 product_mindset 收敛亮点；
宁可每周一个小版本，不憋大版本。
