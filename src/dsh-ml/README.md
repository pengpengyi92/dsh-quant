# dsh-ml（PCPT 映射：组合与建模域）

策略回测、组合构建与指标库（ML/DL 为未来扩展方向）。

- backtest.ts：4 策略引擎（MA交叉+网格/布林突破/RSI反转/多资产组合）+ 资金管理
- metrics.ts：回测指标库（9 净值指标 + 交易级 + METRIC_CATALOG）

原则：无未来函数（bar i 信号 bar i+1 成交）；手算基准单测。
