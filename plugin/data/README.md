# plugin/data —— 数据插件（插槽：dsh-data）

| 插件 | 类型 | 一句话 | 对接方式 |
|---|---|---|---|
| [v587d/capital-generation](https://github.com/v587d/capital-generation) | MCP | A股金融数据 MCP（11 个 `fin_data__*` 工具）| dsh 内挂载；替代/补充 quant_market_fetch 的 A股深度数据 |
| [helibeiqi/dsh-quant-data-mcp](https://github.com/helibeiqi/dsh-quant-data-mcp) | MCP | 零依赖 A股数据 MCP（无 key，NDJSON 协议）| 同上，最轻量的 A股数据入口 |
| [LLMQuant/data-mcp](https://github.com/LLMQuant/data-mcp) | MCP | agent-native 金融数据（方法论先行者）| MCP 挂载；与 quant_data_guide 渠道知识互补 |
| [Realyujie/dsh-us-stocks](https://github.com/Realyujie/dsh-us-stocks) | MCP | 美股行情/财报/分析师一致预期 | dsh 内挂载；美股深度数据（dsh-quant 内置 yahoo 免费行情打底）|

**内置对照**：`quant_market_fetch`（加密三所/A股/美股免费行情）+
`quant_data_guide`（15 渠道知识库）+ `quant_data_quality`（体检）。

**典型组合**：BTC 实验用内置免费行情；A股深度数据挂 capital-generation；
美股财报挂 dsh-us-stocks——三个插槽各司其职。
