# dsh-quant 生态宣讲稿（完整版）

> 一篇讲完 dsh-quant 的全部：世界观、架构、体验、内容、生态与邀请。
> 用于 5 个 agent 的发布宣讲 / 社区传播 / 新用户第一课。

---

## 开场：什么是 dsh-quant

**AI-native & DSH-native：量化版的 everything-is-a-plugin。**

46 个工具、6 大域、一条 pipeline 跑通量化研究全链路。给 DeepSeek
Harness 的量化工具箱——方法公开，秘密内部（Methods open, secrets
internal）。

我们非常喜欢 dsh 的「一切皆为插件」理念，所以 dsh-quant 也是同样的
哲学：**架构开源，生态互联，自由填充**。

## 世界观：五团队架构的开源版

dsh-quant 的六域源自 Pengyi 内部五团队的架构（内部私有，不公开——
公开的是架构范式）：

| 内部（private）| 公开插槽（dsh-quant）| 你可以填充 |
|---|---|---|
| PDAT · Pengyi Data Agent Team | dsh-data | 自己的数据源/质量规则 |
| PAAT · Pengyi Alpha Agent Team | dsh-alpha | 自己的因子（内部 alpha 永不开源）|
| PCPT · Pengyi Combination Portfolio Team | dsh-ml | 自己的 ML/DL/RL 模型 |
| PRT · Pengyi Risk Team | dsh-risk | 自己的风控红线 |
| PET · Pengyi Execution Team | dsh-execution | 自己的执行/模拟盘 |

加上开源侧独有域 **dsh-community**（生态度量：quant_oss_pulse——
工具会给自己打分）。

## AI-native 是刻意的（不是巧合）

- 工具 schema 自动进系统提示词——契约从模型视角写
- 等长 null 对齐——模型按索引直接用，永远不补 padding
- canonical JSON + render 分离——机器读结构，人读渲染
- 全部 isConcurrencySafe——46 工具可并行无污染
- skill 层——模型自己加载研究工作流
- 0 个 Python 文件、21 个 TS 源文件、零运行时依赖——因为它是
  dsh 插件，与 agent 同进程；需要 Python 时走渠道导航（15 渠道
  知识库），agent 自己决定

## 核心体验：三分钟跑通量化全流程

装完第一件事——体验一条完整 PDAT→PET 流水线（BTC 公开数据 +
简单策略 + 回测 + 模拟盘）：

```
数据 → 因子 → 策略 → 风控 → 交付
quant_market_fetch → quant_factor_evaluate → quant_backtest
→ quant_risk → quant_execute_sim → quant_fund → quant_report
```

一键版：`quant_research_pipeline(symbol=BTCUSDT, limit=120)`。

体验完，每个模块都是插槽——按自己的想法插插件，**无限自进化**。

## 内容资产：42 家机构的量化活百科全书

- **quant-history**：42 家机构档案（从 1783 年的 Man Group 到 2018
  年的 ExodusPoint，含 Alameda 反面教材）
- **三份研究报告**：
  - TIMELINE 编年史（240 年，8 场危机）
  - ANALYSIS 数据分析（42 家五维统计 + 八大洞察）
  - LINEAGE 量化家谱（五大母体谱系：SIG/DE Shaw/AHL/Millennium/
    大行自营组）
- **核心洞察**：60% 的量化机构零开源——「方法公开」在行业里是
  稀缺品；量化是一棵有根的树；母体沉默、后代开放。

## 生态与合作

- 免费行情三市场：加密（三所容错）+ A股（新浪/腾讯前复权）+
  美股/全球（Yahoo）——BTC 是通用实验框架
- 15 渠道数据知识库（含 dsh 生态数据插件收录）
- 已收录 awesome-dsh-plugin → dsh-market 插件市场一键安装
- 官方区展示帖 + DX 建议帖 + 4 个列表 PR 在途
- PMMLAB（Pengyi Multi-Model Lab）是我们的首席宣发官：五位模块
  代言人（DQH 系列）与宣传片制作中
- 技能层：quant-research / quant-release-cycle 两个可加载 skill，
  官方 11 skills 全量映射

## 邀请

1. **体验**：npm i dsh-quant，三分钟跑通流水线
2. **贡献**：插件征集 Issue #27（五模块 × 多插件）；PR 契约就五条
   （等长 null 对齐 / 无未来函数 / 手算测试 / 纯函数 / oneOf）
3. **研究**：42 家档案 + 三报告，欢迎 PR 补全（中国量化篇排第一）
4. **合作**：数据方 / 生态方 / 社区——issue & discussion 随时聊

## 结尾

> dsh-quant 不提供固定范式，提供一整套与 dsh 核心一致的架构。
> 倡导自由自在的研究：方法论给足，参数与策略由你。
> **架构开源，生态互联，自由填充。** 🐋

📍 GitHub：https://github.com/pengpengyi92/dsh-quant
🌐 官网：https://dsh-quant-site.pages.dev
📦 npm：dsh-quant@0.35.0
