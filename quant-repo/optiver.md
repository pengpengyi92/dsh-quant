# Optiver 开源 repo 专刊

Optiver 的开源姿态是**教育型**：把做市的核心玩法打包成竞赛 SDK 与模拟
交易所，让全球学生和工程师边玩边学做市——顺便完成招聘与品牌。

## 核心 repo

| repo | 是什么 | 能学到什么 |
|---|---|---|
| [ReadyTraderGo](https://github.com/optiver/ReadyTraderGo) | 做市算法竞赛 SDK（Go 语言）| **Autotrader 接口设计**：如何把做市抽象成「读行情→报价→撤单」的最小 API |
| [sdn-optiver-challenge](https://github.com/optiver/sdn-optiver-challenge) | 新一代挑战赛 starter code | 期权定价 + 做市的题目设计思路 |
| [optibook](https://github.com/optiver/optibook) | 模拟交易所平台（竞赛用）| 撮合引擎的公开实现——PET 域 `quant_execute_sim` 的直接参照 |

## 社区优质参赛方案（非官方，学习对象）

| repo | 亮点 |
|---|---|
| [yrousset/rtg](https://github.com/yrousset/rtg) | Avellaneda-Stoikov 做市策略实现 |
| [windsornguyen/rtg](https://github.com/windsornguyen/rtg) | 做市 autotrader 实战结构 |
| [AchilleasDim/market-making-algorithm-optiver](https://github.com/AchilleasDim/market-making-algorithm-optiver) | 期权/期货做市 + delta 对冲 + 库存管理 |

## 对 dsh-quant 的启发

1. **Autotrader 的最小 API**：把做市抽象成三件事（读盘/报价/撤单）——
   我们 PET 域执行框架下一步可以对齐这个心智模型
2. **模拟交易所是教育产品**：optibook 证明「可玩的仿真」是最好的教学
   ——dsh-quant 的基金模拟游戏化路线同源
3. **Avellaneda-Stoikov**：库存惩罚报价框架——期权板块路线图
   「做市方法层」的数学核心，社区实现齐备可学
