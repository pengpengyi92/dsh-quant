# plugin/ROADMAP —— dsh-quant 可供给的 AI-native 插件候选

五槽各自还可以**由我们供给**的插件方向（欢迎 PR 认领）：

| 插槽 | 候选插件 | 说明 |
|---|---|---|
| data | `quant-news-sentiment` | 新闻/公告情绪因子（免费源聚合 → 情绪打分）|
| data | `quant-fundamentals-mcp` | 基本面数据 MCP（财报快照/一致预期）|
| alpha | `quant-factor-zoo` | 内置因子动物园（动量/反转/波动/换手/振幅…）|
| alpha | `quant-101-alphas-bench` | 101 Alphas 的 dsh-quant 复现基准集 |
| ml/combo | `quant-multi-agent-research` | subagent 编排的多标的并行研究 |
| ml/combo | `quant-portfolio-optimizer` | MVO/风险平价组合优化（内置版）|
| risk | `quant-stress-tester` | 历史情景压力测试（2008/2015/2020 情景）|
| risk | `quant-factor-monitor` | 因子失效监控/IC 预警 |
| execution | `quant-simulation-market` | 本地模拟交易所（撮合/订单簿/部分成交）|
| execution | `quant-paper-loop` | 日频模拟盘闭环（信号→执行→盯市→再平衡）|

## 供给原则

- 与内置工具同契约（等长 null 对齐 / 无未来函数 / 手算测试 /
  纯函数 / oneOf）
- 独立发布为 cordis 插件或 PR 进对应域（src/dsh-*）
- 每个候选落地时配一个案例（并入 CASE_STUDY.md 模式）
