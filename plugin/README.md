# plugin/ —— 五槽外部插件库（Everything-Plugin 的弹药架）

dsh-quant 的五个插槽（data / alpha / risk / execution / combo）各自可以
引用**外部 repo 与 MCP**作为插件。本目录整理可直接对接的弹药：

```
plugin/
  data/        数据插件（MCP server + 数据库）
  alpha/       因子插件（因子库 + 评价工具）
  risk/        风控插件（风险/绩效库）
  execution/   执行插件（做市 SDK + 撮合/回测引擎）
  combo/       组合插件（完整量化栈，一键引用）
```

## 引用方式（两种）

1. **MCP 类**（dsh 原生）：直接 `dsh plugin add` 或 MCP 配置挂载，
   agent 会话内即可调用（capital-generation / data-mcp 等）
2. **Python 库类**：agent 用 dsh 官方 shell / subprocess 能力调用
   （qlib / riskfolio-lib / backtrader 等），dsh-quant 的纯函数负责
   数据对齐与结果验证

## 与内置工具的关系

- 内置工具（quant_*）= 开箱即用的**范式演示**（BTC 示例 + 手算基准）
- 外部插件 = 按需挂载的**火力扩展**（更深的因子库/更全的风控/
  更真的撮合）
- 原则不变：**everything is a plugin**——内置与外部在同一套契约下协作

## 收录规则（欢迎 PR）

- 每个 repo：一句话 + 类型（MCP/库/框架）+ 与插槽的对接方式
- 只收公开可验证项目；标注 stars 级与语言
- 征集入口：Issue #27；完整生态目录见 docs/QUANT_ECOSYSTEM.md
