# plugin/combo —— 组合插件（完整量化栈，一键引用）

| 插件 | 类型 | 一句话 | 对接方式 |
|---|---|---|---|
| [Microsoft qlib](https://github.com/microsoft/qlib) | 全栈 | 微软 AI 量化平台（数据/因子/模型/回测全家桶）| subprocess 调用；研究结论可用 dsh-quant 工具复验 |
| [nautilus_trader](https://github.com/nautechsystems/nautilus_trader) | 全栈 | 高性能事件驱动交易平台（Rust/Python）| 执行/撮合层参照；@pengpengyi92 有贡献 PR |
| [Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | 全栈 | HKUDS 个人交易 agent（3.1 万星）| agent 架构参照；@pengpengyi92 有贡献 PR |
| [dmsobtl/dsh-quant-workbench](https://github.com/dmsobtl/dsh-quant-workbench) | dsh 插件 | A股/美股/加密一站式研究 | dsh 内挂载，研究流程互补 |
| [AllenCX/dsh-quant-workspace](https://github.com/AllenCX/dsh-quant-workspace) | dsh 插件 | 桥接本地低频量化引擎 | dsh 内挂载，引擎桥接样本 |

**内置对照**：`quant_research_pipeline`（PDAT→PET 一键全链路）+
`researchMultiAsset`（多标的并行）。

**典型组合**：快速研究用内置 pipeline；深度研究挂 qlib；高频/执行
架构学 nautilus_trader；agent 化参照 Vibe-Trading——combo 插槽 =
「引用一个完整栈，缺什么再往五槽里补什么」。
