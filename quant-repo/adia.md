# ADIA / ADIA Lab 公开代码专刊：归属、许可与复现边界

> Title: ADIA Public-Code Ecosystem, Not a Proprietary Alpha Release.
> 时间：2026-11-12T00:42:04+08:00，Asia/Shanghai。
> [机构 Deep DD](../quant-history/adia.md) · [冻结元数据](evidence/2026-11-12-adia-github.json)。

## 先回答“ADIA 有开源 repo 吗”

**有可研究的相关代码生态，但本次未确认 ADIA 自有官方投资技术仓库。**
应分为 ADIA 本体、独立 ADIA Lab、合作方 CrunchDAO、社区参赛者四层。
不能因为仓库名字含 ADIA，就归入“ADIA 官方开源”。

[Lab 官方关系说明](https://www.adialab.ae/relationship-with-adia) 明确其独立
法律实体、治理与预算。本专刊例外登记合作方/社区**链接参考**，不把它们
计入本栏目“机构官方 org”数量，不宣称官方背书。

有界检索包含官方站点、GitHub `"ADIA Lab"` repository 搜索首 30 条、
`ADIA type:org` 首 30 条及 CrunchDAO 全部公开仓库分页。尚未确认官方
归属，不等于证明“绝对零开源”。快照记录检索范围，而不是机构资产清单。

## 六个入口

stars 和最近 push 均为 2026-11-12 快照，不是质量评分。SHA 完整值、
README blob、根目录 license/NOTICE 证据在 JSON 中；本次外部执行均为 **NOT_RUN**。

| 仓库 | 归属 / 技术与用途 | 活动快照 | 许可与使用边界 |
|---|---|---|---|
| [crunchdao/competitions](https://github.com/crunchdao/competitions) | 合作方；Python/Jupyter starter、runner、scoring | 34 stars；2026-11-11 push；commit `25d8b4e` | GitHub license=null，根目录未发现 LICENSE；子目录和数据条款仍需单独审查 |
| [crunchdao/quickstarters-adialab](https://github.com/crunchdao/quickstarters-adialab) | 合作方；2023 Market Prediction 的 train/infer、EDA、特征选择和时间切分示例 | 51 stars；2023-08-01 push；`66fb5508` | 未识别根许可；旧赛 starter，不当作 2026 实时赛 SDK |
| [crunchdao/crunch-cli](https://github.com/crunchdao/crunch-cli) | 合作方；Python 数据访问、local test、代码打包/提交接口 | 9 stars；2026-11-05 push；`c6ae069d` | README 声明 MIT，但 API license=null、根目录未见 LICENSE；记录差异，复用前核对权利 |
| [Ori-Replication/ADIA-Lab-Causal-Discovery](https://github.com/Ori-Replication/ADIA-Lab-Causal-Discovery) | 社区；Jupyter 特征/实验流程，含失败实验；作者自述第 3 | 6 stars；2025-02-15 push；`7fd401df` | 未识别根许可；排名未独立核验，链接阅读，不拷贝再发布 |
| [BoNing-Gu/ADIA-Lab-Structural-Break](https://github.com/BoNing-Gu/ADIA-Lab-Structural-Break) | 社区；Python 实验管线、时间戳特征、OOF/失败实验存档；作者描述第 5 | 12 stars；2025-10-28 push；`726879ff` | 未识别根许可；README 的复现/得分属于作者陈述 |
| [szukiyu40/adia-structural-break-realtime](https://github.com/szukiyu40/adia-structural-break-realtime) | 社区，Yu Suzuki；Python 在线统计/树模型、Chronos、分布预测对照、source manifest | 2 stars；2026-10-07 push；`343265af` | **Apache-2.0** + NOTICE 已识别；权重、比赛数据、部分中间文件缺失，不能一键完整重训 |

“未识别许可”指此版本的 API/root 检查，不是法律裁定、不是说所有子目录
一定没有条款。公开可读、允许参加比赛、允许复制代码、允许商用、允许
再分发数据，是不同权利。Apache 仓库的依赖/预训练模型仍各有其许可。

## 优先看哪里

### 1. 合作方的赛制接口与评分

冻结版本中的精确入口：

- [2023 Market Prediction](https://github.com/crunchdao/competitions/tree/25d8b4e2f76f122c8fe21b82e9556308ba8d8988/competitions/adialab)
- [Causal Discovery](https://github.com/crunchdao/competitions/tree/25d8b4e2f76f122c8fe21b82e9556308ba8d8988/competitions/causality-discovery)
- [2025 Structural Break](https://github.com/crunchdao/competitions/tree/25d8b4e2f76f122c8fe21b82e9556308ba8d8988/competitions/structural-break)
- [Structural Break Open Benchmark](https://github.com/crunchdao/competitions/tree/25d8b4e2f76f122c8fe21b82e9556308ba8d8988/competitions/structural-break-open-benchmark)
- [Real-Time scoring](https://github.com/crunchdao/competitions/blob/25d8b4e2f76f122c8fe21b82e9556308ba8d8988/competitions/structural-break-real-time/scoring/scoring.py)

先读目标和接口，再考虑模型，不先堆深度网络。官方
[Open Benchmark 文档](https://docs.crunchdao.com/competitions/competitions/structural-break-open-benchmark)
明确：给定边界、同时看到前后两段，对每条序列给单个分数，按 ROC-AUC。
这不是在线报警。

实时赛逐点处理，使用截至当前的前缀。读到的 scorer 在相同 online step
跨序列计算 AUC，并用 `n_positive * n_negative` 加权；只有一类的 step
跳过，无有效 pair 时返回 0.5。这个 **TS-AUC** 不是全行 pooled AUC。
我们只阅读该源文件，未运行主办方 scorer 或核验私有评分服务。

2026 实时赛[官方期限](https://www.adialab.ae/adia-lab-x-crunch-the-structural-break-challenge-2026)
为 5 月 6 日至 10 月 1 日，已截止。Open Benchmark 是另一个持续评估项目；
参与前重新读它的规则、奖金、原创性和时间安排，不能把旧公告视为当前资格。

### 2. 许可较清楚的近期社区方案

Yu Suzuki 的 [固定版本 README](https://github.com/szukiyu40/adia-structural-break-realtime/blob/343265af66da726ae29c58738f68f3b66a2ffb6a/README.md)
值得学习的不是“模型越多越好”，而是：用序列自身历史作参考、多种
证据小权重融合、对照 head、开发集重复使用的明确披露，以及 source
manifest / NOTICE / 缺失依赖的诚实说明。

作者公开分数不是本项目的 benchmark。没有权重和中间产物，单看训练
脚本不能宣称可完整复现；显卡/数据条款也没有在本次研究中获批。

### 3. 旧赛方案学工程，不搬排行榜成绩

BoNing-Gu 的时间戳特征/模型输出、OOF、失败实验记录方式，对本项目的
实验可追踪性有参考价值。Ori-Replication 把测试特征流程、最终提交与
失败尝试分开，也值得观察。缺少独立数据/协议复现，不能采信“100%
可复现”等作者措辞为本项目验收结果。

## 可以迁移的思想，尚未接入的功能

| 方向 | 独立实现候选 | 验证门槛 |
|---|---|---|
| data | 序列 ID、event time、history/online 分界、版本与缺失值契约 | PIT、重复/乱序/数据泄漏负对照 |
| alpha / ML | 统计基线 → rolling/residual 特征 → 小型分类器 | 固定序列级拆分、消融、训练/推理代价 |
| risk | 变点不确定性、报警持久性、检测延迟 | false alarm、delay、变点类型覆盖；不能只看 AUC |
| evaluation | 区分 offline ROC-AUC 与 online TS-AUC | 手算 toy、单类 step、空有效 pair、未来扰动不影响过去 |
| agent | 文献/代码索引、证据归因、失败复盘 | 无网络也可重放核心实验，不让 Agent 取代数据/模型验收 |

所有候选为 **PROPOSED / UNMEASURED**，不计入当前工具数。没有 clone
外部代码、安装新依赖、拉取比赛数据、训练、提交比赛、交易或模型 API 调用。
本次新增的是 DD 与来源导航，不是完成了结构突变产品。

## 更新证据

```bash
# 仅联网读取 GitHub 公共元数据，需要已配置 gh；不执行外部仓库。
node scripts/adia-source-snapshot.mjs
```

脚本按上海日期输出 snapshot；同日重跑会更新当日文件，应审阅差异并同步
本文。跨日应保留旧快照，而不是静默覆盖历史事实。
模型质量和复现状态需要独立实验，不能由 metadata 检查“自动升格”。
