# ADIA：主权长期资本、系统化投资与独立科研生态

> **模式：Deep**，按 [DD_STANDARD.md](DD_STANDARD.md) 九段清单执行。
> Title: ADIA Institutional Due Diligence and Public Research Map.
> 记录时间：2026-11-12T00:42:04+08:00，Asia/Shanghai；信息截点：2026-11-12。
> 定位：公开资料研究，不是投资建议、法律尽调、内部组织图或招聘承诺。
> 配套：[代码专刊](../quant-repo/adia.md) · [来源快照](../quant-repo/evidence/2026-11-12-adia-github.json)。

**一句话结论**：Abu Dhabi Investment Authority（阿布扎比投资局，ADIA）
不是零售银行，也不是只做高频的自营公司，而是代表阿布扎比政府投资的
长期、多资产机构。值得研究的是它如何把资本配置、内部量化研发、外部
管理人和数据工程连接起来。[官方简介](https://www.adia.ae/)

**最有趣的入口**：ADIA 不只把量化用于选股。QRD 参与动态资产配置；
独立的 ADIA Lab 则以论文、竞赛和学术合作开放问题，但不等于开放 ADIA
的内部交易系统。两条线必须分开看。

## 1. 起源、治理与关键人物

本机构由政府设立，不能套用私募基金的“几位联合创始人持股创业”模板。
现有一手资料确认成立年份，但本次未核验设立法律原文、准确月日与完整
历任管理层，不补写未经核实的个人创始叙事。

| 人物 | 公开角色与来源时点 | 可核实背景 / 边界 |
|---|---|---|
| Sheikh Tahnoun bin Zayed Al Nahyan | 2025 Review 董事会主席 | 治理角色，不是将其写成 1976 年创始人 |
| Sheikh Hamed bin Zayed Al Nahyan | 同期 Managing Director | 管理机构，不等于某个量化策略的基金经理 |
| Marcos López de Prado | ADIA Lab 当前官方简介列 ADIA Global Head, Quantitative R&D | Cornell 工程学院 Professor of Practice、Berkeley Lab Research Fellow；不据头衔推断具体团队汇报线 |
| Alex Lipton | Lab 官方简介也列 ADIA Global Head, Quantitative R&D；2021 年加入 Strategy & Planning | 曾任 BofA Global Quantitative Group 联席主管，有 Citadel、Credit Suisse、Deutsche Bank、Bankers Trust 经历 |
| Horst D. Simon | ADIA Lab Director，2022 年首任主任 | 此前在 Berkeley Lab / NERSC；HPC、数值算法背景，不应写成 ADIA 投资 CIO |

两位研究负责人被官网同时列为 Global Head，不能自行解释为同一职位的
先后替换，也不能臆造联席制度。董事会、QRD 和 Lab Advisory Board 是
不同层级；诺奖/图灵奖顾问也不是 ADIA 全职交易团队名单。

来源：[2025 董事会](https://www.adia.ae/en/pr/2025a/pdf/ADIA%20Annual%20Review%202025-%20Board%20of%20Directors.pdf)、
[López de Prado](https://www.adialab.ae/bios/professor-marcos-lopez-de-prado)、
[Lipton](https://www.adialab.ae/bios/professor-alex-lipton)、
[Simon](https://www.adialab.ae/bios/dr-horst-d-simon)。个人学历未逐一核验，不推断毕业学校与学位。

## 2. 成立时间、实体与办公地

| 对象 | 已核实事实 | 不应混淆的边界 |
|---|---|---|
| ADIA | 1976 年成立；政府长期投资机构 | 不等于 UAE 所有主权投资机构，也不是面向个人的商业银行 |
| ADIA 办公地址 | 211 Corniche，Abu Dhabi，UAE | 所投资产遍及全球，不表示每个投资地区都有招聘办公室 |
| ADIA Lab | 官方宣布 2022-12-02 启动；独立法律实体，有独立治理、预算和 boards | ADIA 支持它，但不能将它简称为内部 alpha desk |
| Lab 办公地址 | Level 26, Al Khatem Tower, ADGM Square, Al Maryah Island, Abu Dhabi | 与 ADIA Corniche 地址不同 |

来源：[ADIA](https://www.adia.ae/)、
[2022 启动公告](https://www.mediaoffice.abudhabi/en/economy/adia-to-launch-independent-centre-for-basic-and-applied-research-in-data-and-computational-sciences/)、
[Lab 与 ADIA 的法律/治理关系](https://www.adialab.ae/relationship-with-adia)。
本次未建立完整全球分支实体清单，不把第三方招聘地点当成已登记实体。

## 3. 发展历程与风险记录

| 时点 | 事件 | 证据边界 |
|---|---|---|
| 1976 | ADIA 成立 | 官方简介；准确设立月日未核 |
| 2021 | Lipton 加入 ADIA QRD | 当前官方个人简介回溯 |
| 2022-11-03 / 2022-12-02 | 宣布设立 / 启动独立 ADIA Lab | 政府新闻稿，区分公告日与运营日 |
| 2023 Review | QRD 约 100 位专家 | 历史人数，不是今天的人数 |
| 2024 Review | QRD 超过 125 人；新增系统化 market-neutral / directional 策略、推进统一数据平台 | 原报告口径；不是最新 headcount |
| 2025 Review，2026-09-10 已发布 | 继续系统化投资；上调 Financial Alternatives、Private Equity 战略区间 | 2025 活动及配置披露，不是 2026 实时持仓 |
| 2026-05-06 至 2026-10-01 | ADIA Lab / Crunch 实时结构突变赛 | **本次调研时已截止**；不能再宣传成开放报名 |

来源：[2023 Review](https://www.adia.ae/en/pr/2023/pdf/adia-annual-report-2023-09-09-2024.pdf)、
[2024 运营回顾](https://www.adia.ae/en/pr/2024/operational-review.html)、
[出版目录及日期](https://www.adia.ae/en/publications)、
[2026 比赛官方页](https://www.adialab.ae/adia-lab-x-crunch-the-structural-break-challenge-2026)。

负面信息也应有边界：2025 Financial Alternatives 回顾明确记录量化策略
夏季及年末受到因子轮动、低质量资产反弹影响，CTA 上半年遭遇反复反转。
这是配置环境与行业风险，不等于 ADIA 某个内部团队的已披露亏损数字。
本次没有做全球诉讼、监管处罚或对手方风险的穷尽筛查，不能结论为“无负面”。
[2025 Financial Alternatives](https://www.adia.ae/en/pr/2025a/financial-alternatives.html)

## 4. 规模、收益与披露口径

| 数据 | 公开口径 | 正确解读 |
|---|---|---|
| 2023 QRD 人数 | 约 100 人 | 研发团队的历史规模，不是全机构规模 |
| 2024 QRD 人数 | 超过 125 人 | 不能外推为 2026 headcount |
| 2025 员工 | 1,350 人、来自 61 个国家 | 2025 Review 全机构口径，不是 QRD 人数 |
| 截至 2025-12-31 的 20 / 30 年年化收益 | 6.6% / 7.2%，point-to-point、time-weighted | 不是 2025 单年收益，更不是 QRD alpha；2025 非上市资产数据完成前为 provisional |
| 截至 2024-12-31 的对应长期收益 | 6.3% / 7.1% | 窗口进入/退出年份变化会影响比较 |
| 最新总 AUM | **本次核验的官方披露未给出** | 不把媒体“万亿美元”估值、13F 资产或单项持仓当作官方总 AUM |

来源：[2025 运营回顾](https://www.adia.ae/en/pr/2025a/operational-review.html)、
[2025 MD 信](https://www.adia.ae/en/pr/2025a/letter-from-the-md.html)。
本档案不编造逐年 AUM 序列，也不从员工数倒推资产规模或人均利润。

2025 战略区间中，Financial Alternatives 从 5–10% 调整为 7–12%，
Private Equity 从 12–17% 调整为 15–20%，Real Estate 从 5–10% 调整为
2–7%。地区区间为 North America 45–60%、Europe 15–30%、Emerging
Markets 10–20%、Developed Asia 5–10%。这些是**范围，不是实际权重**，
不能求和为 100% 或用中点伪造组合。
[2025 组合披露](https://www.adia.ae/en/pr/2025a/index.html)

## 5. 投资与研究架构：不只是“给基金投钱”

| 层次 | 已公开职责 / 活动 | 对研究系统的启示（分析，不是内部流程披露） |
|---|---|---|
| Total portfolio / Core Portfolio | 汇总现金、固定收益、指数权益，支持资金与流动性调配 | 模型之外，还需风险预算、资金、流动性和再平衡 |
| QRD | 动态配置、研究及实施系统化策略，覆盖 market-neutral 与 directional | 数据、研究、工程、组合不是彼此孤立的工具 |
| Equities Department | 2025 增加系统化管理人、较高换手 extension 策略；扩展中国管理人，扩大 market-neutral / total return | ADIA 兼有自建能力与外部专业管理人配置 |
| Fixed Income Department | 2025 继续建设 AI 驱动研究平台，扩充 FX、credit、quantitative 人才 | FICC + AI/data 不是只存在于纯量化对冲基金 |
| Alternative Investments Department | 对冲基金与多策略管理人配置，关注量化、宏观等不同回报来源 | 不能把外部管理人的收益归因成内部 QRD 模型收益 |
| Integrated middle/back office | 2024 披露 Central Investment Services、Operations、IT 的一体化平台 | 数据血缘、对账、可审计和稳健执行也是技术工作 |
| ADIA Lab | 独立的基础/应用数据与计算科学研究 | 论文、公开 benchmark 与投资策略的验收标准不同 |

来源：[QRD / MBO](https://www.adia.ae/en/pr/2024/operational-review.html)、
[Total portfolio](https://www.adia.ae/en/pr/2025a/letter-from-the-md.html)、
[Equities](https://www.adia.ae/en/pr/2025a/equities.html)、
[Fixed Income](https://www.adia.ae/en/pr/2025a/fixed-income.html)、
[Alternatives](https://www.adia.ae/en/pr/2025a/financial-alternatives.html)。

尚未公开核实：内部信号、预测周期、换手约束、杠杆、交易接口、实时
执行拓扑、GPU 数量及各 desk PnL。本档案不据“AI 平台”推断使用了
RAG、多 Agent、某家云或某个商用模型。

## 6. 谱系：主权资本，而非银行自营分拆

组织层面更合适的标签是“政府长期资本 + 全球配置 + 自建量化 + 外部
管理人”，不是 WorldQuant 系、Citadel 系或瑞信 MBO。Lipton 等人的
前雇主经历是**人才网络**，不能直接证明整家机构的策略血缘。

与已收录档案的比较是分析视角，不表示合作或投资关系已被证明：

- [QRT](qrt.md)：独立系统化资管人与主权长期投资者的组织目标不同。
- [Bridgewater](bridgewater.md)：可以比较宏观、分散化与风险预算问题，不能说模型相同。
- [Point72](point72.md)：都重视研究与工程，但 ADIA 的总组合和多代际资本约束不同。
- [银行谱系](BANK_LINEAGE.md)：银行量化人才可跨机构流动，不等于机构由银行分拆。

## 7. 开源姿态：已确认生态代码，未确认自有官方投资仓库

**结论不是“ADIA 零开源”。** 在本次有界检索中，尚未核验到由 ADIA
本体或 ADIA Lab 官方身份维护、可明确归属的投资技术 GitHub 仓库。
同名 GitHub org 并不构成机构认证；没搜到也不证明绝对不存在。

已经核验的入口分两层：

- **合作方** CrunchDAO：比赛 starter、scoring、Python 客户端；不是 ADIA 自有策略库。
- **社区参赛者**：因果发现、结构突变、实时检测方案；排名/分数是作者陈述，尚未由本项目复现。

最值得对接的两类题目：offline structural break 使用已知边界前后两段
数据，官方用 ROC-AUC；real-time 逐点读入，只能使用已见前缀，评分为
TS-AUC。后者按同一 online step 跨序列计算 AUC，以正负样本对数量加权，
不是将所有时间点简单混合计算一个 ROC-AUC。

[Open Benchmark 文档](https://docs.crunchdao.com/competitions/competitions/structural-break-open-benchmark)、
[官方合作方实时 scoring](https://github.com/crunchdao/competitions/blob/25d8b4e2f76f122c8fe21b82e9556308ba8d8988/competitions/structural-break-real-time/scoring/scoring.py)。
详见 [quant-repo 专刊](../quant-repo/adia.md)，本次只登记链接，没有安装、接入或跑外部模型。

## 8. 发展方向、风险与可行动入口

### 发展方向（基于公开事实的分析）

ADIA 的吸引力在于“研究如何影响真实多资产组合”，不只在于一个模型
有多强。公开材料中的 QRD、数据平台、固定收益 AI 和总组合资金管理，
构成可以研究的技术/资本交叉界面；Lab 则提供另一条科研交流入口。

主要风险/限制包括：数据与内部业绩不透明、非上市资产估值滞后、全球
政策和对手方变化、研究发现向生产的落差，以及把公开竞赛得分当成
真实交易收益的误读。主权长钱不意味着没有市场风险或可以无限算力。

### 招聘观察：按官方 JD，不能只看 Quant 头衔

2026-11-12 读取官方 careers 所链接的 Workable `jobs.md`，列表显示
9 个入口，更新时间为 2026-11-11。入口存在不保证某个 desk 有即时编制。

| 官方岗位 | 实际侧重 / 门槛 | 适合如何理解 |
|---|---|---|
| [Quantitative Researchers & Developers](https://apply.workable.com/adia/jobs/view/4CFA7E24F7.md) | Strategy and Planning；各经验层级；STEM 高学位优先，明确不要求投资经验 | 通用研究/工程招聘入口，不等于纯 QR JD 或 graduate 保证 |
| [Quantitative Researcher & Developer - Data Science](https://apply.workable.com/adia/jobs/view/F18DA76604.md) | **Data Curation**：ingestion、cleaning、tagging、统计分析、自动化；SQL/Python + 另一门语言；非 PhD 需 3+ 年数据科学经验 | 数据研究与工程，不能误写成只做 alpha/LLM 的岗位 |
| [Senior Computational Scientist - Trustworthy AI](https://apply.workable.com/adia/jobs/view/1B132ECDDD.md) | 独立 Lab；PhD；倾向 5+ 年博士后经验；研究领导、论文、开源、benchmark、可解释/鲁棒/安全 AI | 资深 scientist，不是普通 junior AI engineer，也不是授予 PhD 学位的岗位 |

三个岗位均为 Abu Dhabi on-site。薪资官方未披露；不采用聚合网站的
AED 数字作为官方待遇。UAE National 专项实习/奖学金不得泛化为面向所有
国籍的入口。签证、国籍资格、经历等价性及 headcount 应向招聘方确认。

可展示的准备证据（建议，不是“已匹配”结论）：

1. 数据方向：带 PIT/数据质量、失败恢复、SQL 测试与可重放记录的数据集。
2. QR/ML：固定验证协议、无前视、成本/换手、负对照、失败实验和清晰报告。
3. Lab：研究问题、论文/开源贡献、可信 AI 评估，不用 Agent 数量代替科研证据。

### 对 dsh-quant 的具体启示

提议新研究主题“**离线结构突变 vs 在线检测**”，不直接拷贝外部方案：

- Baseline：离线双样本均值/方差差异；在线历史标准化的 CUSUM 类基线。
- Change：滚动统计或独立实现的 residual 特征；每轮只改变一个组件。
- Measure：离线 ROC-AUC；在线 TS-AUC，同时报告 false alarms、delay、延迟与内存。
- Negative controls：无突变、伪边界、随机标签；未来值扰动不能改变此前输出。
- Split：按完整序列/生成过程家族划分，不能将同一序列时间点随机分散到两侧。
- Result：**UNMEASURED / NOT_IMPLEMENTED**。本次 DD 不产生 alpha、PnL 或生产认证。

工程候选应先做许可/数据权利审查，再决定放进独立实验还是插件接口。
论文与竞赛也不能证明机构只录用博士，或有博士就一定可入职。

## 9. 来源、方法与待核清单

本次采用三个独立证据面交叉检查：ADIA 官方报告/治理，ADIA Lab 官方
关系说明/研究页，GitHub owner/commit/license 元数据与官方 careers JD。
检索命中只是线索，关键结论以已读取的一手正文为准，不使用 AI 生成
机构榜单或招聘聚合站替代官方披露。

| 主题 | 一手来源 | 时点 / 局限 |
|---|---|---|
| 本体身份 | [ADIA 官网](https://www.adia.ae/) | 1976 年、政府资本、地址 |
| 最近年度基线 | [2025 Review PDF](https://www.adia.ae/en/pr/2025/pdf/adia-annual-review-2025_final.pdf) / [出版页](https://www.adia.ae/en/publications) | 2026 年披露 2025 年活动；不是 2026 实时数据 |
| 治理 | [Board](https://www.adia.ae/en/pr/2025a/pdf/ADIA%20Annual%20Review%202025-%20Board%20of%20Directors.pdf) | 年报截面，不臆造最新内部汇报线 |
| QRD 历史演进 | [2024 Review](https://www.adia.ae/en/pr/2024/operational-review.html) | >125 为 2024 披露口径 |
| Lab 法律关系 | [Relationship with ADIA](https://www.adialab.ae/relationship-with-adia) | 独立法律实体、独立预算/治理 |
| 研究输出 | [Research Series](https://www.adialab.ae/research-series) | 因果投资、风险平价、Sortino 统计推断等；未逐篇复现 |
| 招聘 | [官方 careers](https://jobs.adia.ae/) → [机器可读入口](https://jobs.adia.ae/_/llms.txt) → [完整列表](https://apply.workable.com/adia/jobs.md) | 完整 JD 已读取；岗位和资格仍会变化 |
| 开源归属与活动 | [冻结快照](../quant-repo/evidence/2026-11-12-adia-github.json) | 六仓库，commit/root license 元数据；不代表穷尽全球仓库 |
| 比赛状态 | [2026 实时赛](https://www.adialab.ae/adia-lab-x-crunch-the-structural-break-challenge-2026) / [Open Benchmark](https://docs.crunchdao.com/competitions/competitions/structural-break-open-benchmark) | 两种赛制、不同评价与有效期 |

待核：准确设立法律与月日、最新总 AUM、2026 QRD 人数、各负责人具体
分工、内部计算/数据栈、未公开岗位和待遇、全部诉讼/监管历史、每个
仓库的数据及再分发权利。检索未命中不转换成“不存在”。本报告与
作者/机构无隶属或背书关系；外部性能全部为未独立验证。
