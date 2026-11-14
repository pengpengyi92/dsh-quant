# plugin/data —— 数据插件（插槽：dsh-data）

**2026-11-14 数据来源共建**：[首批11个数据/工程仓库与接入报告](../../docs/data-sources/DATA-SOURCING-2026-11-14.md)
· [LLMQuant 注册/credit/验证边界](../../docs/data-sources/LLMQUANT.md)
· [PDAT proprietary/private 来源的精选公开契约与合成样例](source-contract/README.md)。
首轮报告中的候选状态为引用/未集成；Python 库、MCP 与原生 Cordis 插件分别对待。
后续已跑通 [CCXT + Kraken 可选实例](../../demos/ccxt-public/README.md)：真实SDK取数
接入Candle和已注册quality/SMA工具，[协议/实测](../../docs/data-sources/CCXT-KRAKEN-2026-11-14.md)。
这不改变quant_market_fetch的内置provider，也不授予商业数据使用/再分发权。
下表其它历史条目未在本轮重新验证，不从目录推断权限、安装或兼容性已通过。

| 插件 | 类型 | 一句话 | 对接方式 |
|---|---|---|---|
| [v587d/capital-generation](https://github.com/v587d/capital-generation) | MCP | A股金融数据 MCP（11 个 `fin_data__*` 工具）| dsh 内挂载；替代/补充 quant_market_fetch 的 A股深度数据 |
| [helibeiqi/dsh-quant-data-mcp](https://github.com/helibeiqi/dsh-quant-data-mcp) | MCP | 零依赖 A股数据 MCP（无 key，NDJSON 协议）| 同上，最轻量的 A股数据入口 |
| [LLMQuant/data-mcp](https://github.com/LLMQuant/data-mcp) | MCP | agent-native 金融数据连接器，代码 MIT 不等于数据永久免费 | 用户自有账号/凭据与 credits；通过 MCP client 配置，不当作原生 Cordis 插件；[复核流程](../../docs/data-sources/LLMQUANT.md) |
| [Realyujie/dsh-us-stocks](https://github.com/Realyujie/dsh-us-stocks) | MCP | 美股行情/财报/分析师一致预期 | dsh 内挂载；美股深度数据（dsh-quant 内置 yahoo 免费行情打底）|

**内置对照**：`quant_market_fetch`（加密三所/A股/美股免费行情）+
`quant_data_guide`（16 渠道知识库）+ `quant_data_quality`（体检）。

**商业渠道目录**：[SiftingIO 审核记录](../../docs/data-sources/SIFTINGIO.md)
（由 @aprsn 投稿，附条件收录）。公开 API/SDK/MCP 已作静态审阅；未执行有效凭据
API 测试，未验证 dsh 插件兼容性。SDK 的 MIT 许可不授予行情数据使用权。

**典型组合**：BTC 实验用内置免费行情；A股深度数据挂 capital-generation；
美股财报挂 dsh-us-stocks——三个插槽各司其职。
