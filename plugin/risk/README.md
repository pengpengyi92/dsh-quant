# plugin/risk —— 风控插件（插槽：dsh-risk）

| 插件 | 类型 | 一句话 | 对接方式 |
|---|---|---|---|
| [pyfolio](https://github.com/quantopian/pyfolio) | Python 库 | Quantopian 绩效/风控分析库（tearsheet 全家桶）| subprocess 调用；与 `quant_metrics`/`quant_risk` 结果互验 |
| [empyrical](https://github.com/quantopian/empyrical) | Python 库 | 收益/风险指标计算库（dsh-quant 风控金标准同源）| 同上 |
| [riskfolio-lib](https://github.com/dcajasn/Riskfolio-Lib) | Python 库 | 组合优化 + 风险指标（VaR/CVaR/回撤全谱）| subprocess 调用；补充组合层风控 |
| [zhang787jun/dsh-finance](https://github.com/zhang787jun/dsh-finance) | dsh 插件 | 金融研究工作流 + 组合风险工具 | dsh 内挂载，研究流程互补 |

**内置对照**：`quant_risk`（VaR/CVaR/β/α/IR）+ `quant_drawdown`
（峰谷恢复）+ `quant_var_backtest`（Kupiec）+ `quant_option`/`quant_bond`
（定价与希腊）。

**典型组合**：内置工具做快速红线体检；pyfolio/empyrical 做机构级
tearsheet；riskfolio-lib 做组合优化与压力测试——三层风控火力。
