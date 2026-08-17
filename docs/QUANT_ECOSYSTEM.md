# 量化生态目录（QUANT ECOSYSTEM）

dsh 生态里与量化/金融数据相关的项目目录（awesome 风格：一项目一行）。
社区讨论见 [Discussion #11](https://github.com/pengpengyi92/dsh-quant/discussions/11)。
欢迎 PR 增补条目。

## 目录

| 项目 | 类型 | 一句话 | 状态 |
|---|---|---|---|
| [pengpengyi92/dsh-quant](https://github.com/pengpengyi92/dsh-quant) | 量化工具箱 | 46 工具 · 6 域，pipeline 跑通 PDAT→PET | 活跃（我们）|
| [pengpengyi92/dsh-quant-ui](https://github.com/pengpengyi92/dsh-quant-ui) | Web 工作台 | Jane Street 风 K线/净值/基金模拟 | 活跃（我们）|
| [v587d/capital-generation](https://github.com/v587d/capital-generation) | A股数据 MCP | 11 个 fin_data__* 金融数据工具 | 收录于渠道库 |
| [Realyujie/dsh-us-stocks](https://github.com/Realyujie/dsh-us-stocks) | 美股数据 | 行情/财报/一致预期 | 收录于渠道库 |
| [LLMQuant/data-mcp](https://github.com/LLMQuant/data-mcp) | 数据 MCP | agent-native 金融数据先行者 | 收录于渠道库 |
| [zhang787jun/dsh-finance](https://github.com/zhang787jun/dsh-finance) | 研究工作流 | 金融研究流程 + 组合风险 | 观察 |
| [dmsobtl/dsh-quant-workbench](https://github.com/dmsobtl/dsh-quant-workbench) | 研究工作台 | A股/美股/加密一站式分析 | 观察 |
| [AllenCX/dsh-quant-workspace](https://github.com/AllenCX/dsh-quant-workspace) | 引擎桥接 | 桥接本地低频量化引擎 | 观察 |
| [helibeiqi/dsh-quant-data-mcp](https://github.com/helibeiqi/dsh-quant-data-mcp) | 数据 MCP | 零依赖 A股数据工具 | 观察 |
| [linxichen/dsh-rigorquant](https://github.com/linxichen/dsh-rigorquant) | 多智能体研究 | 无人值守 walled 研究 preset+skill | 学习对象 |
| [PM25000/dsh-ths-holdings](https://github.com/PM25000/dsh-ths-holdings) | 持仓浮窗 | 同花顺持仓/今日盈亏 | 边界外（实盘侧）|
| [Awu12277/dsh-stock-watch](https://github.com/Awu12277/dsh-stock-watch) | 行情监控 | A股自选实时监控 | 边界外（提醒侧）|

## 学习对象（非 dsh 插件，方法论迁移）

- [yrousset/rtg](https://github.com/yrousset/rtg)：Optiver Ready Trader Go 的 Avellaneda-Stoikov 做市实现
- [AchilleasDim/market-making-algorithm-optiver](https://github.com/AchilleasDim/market-making-algorithm-optiver)：期权/期货做市 + delta 对冲 + 库存管理
- backtrader / vectorbt / hummingbot：执行与撮合抽象（PET 域学习清单）

## 维护规则

- 新条目 PR 格式：一行表格 + 类型（工具箱/数据/工作台/MCP/…）+ 一句话 + 状态
- 状态语义：活跃（持续维护）/ 收录于渠道库（进了 quant_data_guide）/ 观察 /
  学习对象 / 边界外
- 与 Discussion #11 双向同步：本文件是结构化事实，讨论帖是社区补充
