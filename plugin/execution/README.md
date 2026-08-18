# plugin/execution —— 执行插件（插槽：dsh-execution，无实盘边界）

| 插件 | 类型 | 一句话 | 对接方式 |
|---|---|---|---|
| [Optiver ReadyTraderGo](https://github.com/optiver/ReadyTraderGo) | SDK | 做市算法竞赛 SDK（Autotrader 最小 API 设计）| 学习/移植其做市抽象到 `quant_execute_sim` 场景 |
| [IMC Prosperity](https://github.com/topics/imc-prosperity) | SDK | 新一代做市竞赛（模拟交易所 + starter kit）| 竞赛 SDK 的撮合/下单语义参照 |
| [optibook](https://github.com/optiver/optibook) | 框架 | Optiver 模拟交易所（撮合引擎公开实现）| 撮合/部分成交模型的直接参照 |
| [backtrader](https://github.com/mementum/backtrader) | Python 库 | 事件驱动回测（broker/commission/slippage 三层抽象）| subprocess 调用；`quant_execute_sim` 的成本模型对标 |
| [vectorbt](https://github.com/polakowo/vectorbt) | Python 库 | 向量化回测/订单建模（快）| 批量策略验证；结果与内置回测互验 |
| [Hummingbot](https://github.com/hummingbot/hummingbot) | 框架 | 开源做市机器人（**实盘——仅学习，不接入**）| executor/订单生命周期的方法论参照 |

**内置对照**：`quant_execute_sim`（滑点/延迟/双边费/多头语义）+
`quant_backtest_*`（策略族）+ `quant_fund`（模拟私募）。

**边界**：本插槽只做**模拟与框架参照**——实盘系统不进 dsh-quant
（Hummingbot/freqtrade 仅作方法论学习，不接实盘）。
