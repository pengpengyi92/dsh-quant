# dsh-quant Agent 指南（一眼看懂版）

> 给任何 agent / MCP client / dsh 模型的第一眼说明书。读完这份，
> 你就知道这个项目是什么、怎么用、怎么扩展。

## 一句话

**dsh-quant = 量化版 everything-is-a-plugin**：AI-native & DSH-native
的量化工具箱，46 个工具、6 个域，一条 pipeline 跑通 PDAT→PET 全链路。
Methods open, secrets internal。

## 六域模块（每个都是插槽）

| 域 | 职责 | 代表工具 |
|---|---|---|
| dsh-data | 行情/数据源/质量 | quant_market_fetch · quant_data_quality |
| dsh-alpha | 指标/因子/评价 | quant_factor_evaluate · quant_factor_neutralize |
| dsh-ml | 回测/模型/验证 | quant_backtest · quant_walk_forward · quant_linear_model |
| dsh-risk | 风控度量 | quant_risk · quant_drawdown · quant_option · quant_bond |
| dsh-execution | 执行/交付 | quant_execute_sim · quant_fund · quant_report |
| dsh-community | 生态度量 | quant_oss_pulse · quant_repo_stats |

工具 schema 全量清单：`mcp/tools.json`（运行时生成，与代码一致）。

## 契约（调用前必读）

1. **等长 null 对齐**：输出与输入等长，头部算不出的窗口位是 null；
   空序列是合法结果，不是错误
2. **无未来函数**：factor[i] 预测 returns[i+1]；回测 bar i 信号、
   bar i+1 成交
3. **canonical JSON + render 分离**：机器读 value，人读 render
4. **联合类型用 oneOf**：`items: { oneOf: [{type:'number'},{type:'null'}] }`
5. 全部纯函数、可并行（isConcurrencySafe）、可离线验证

## 怎么开始

1. 最小体验：`quant_research_pipeline(symbol=BTCUSDT, limit=120)`
   —— 一条命令返回完整研究包（数据→报告→图表）
2. 分步体验：见 `docs/ONBOARDING.md`（五步流水线带每步解读）
3. 深度：`docs/ML_GUIDE.md`（ML/DL 知识地图）· `quant-history/`
   （42 家机构档案 + 三报告）

## 怎么扩展（everything is a plugin）

- 每个域都可插自己的插件：数据源/alpha/模型/风控/执行
- 插件形态：PR 进域（src/dsh-*）或独立 cordis 插件（复用纯函数
  re-export）
- 征集入口：Issue #27；边界：范式公开，策略/参数/内部 alpha 不公开

## 文件地图

```
src/dsh-{data,alpha,ml,risk,execution,community}/   六域实现（纯函数）
docs/ONBOARDING.md · ML_GUIDE.md · QUANT_ECOSYSTEM.md
quant-history/   42 家机构档案 + TIMELINE/ANALYSIS/LINEAGE 三报告
mcp/tools.json   46 工具 schema（模型可见）
tests/           手算基准单测（契约的证明）
skill/           quant-research / quant-release-cycle 两个可加载 skill
```
