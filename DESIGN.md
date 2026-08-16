# dsh 量化指标插件 DESIGN（阶段 3 立项）

> 目标：做一个对 dsh 生态有真实价值、质量合格、可离线验证的插件，作为加入团队的敲门砖。
> 本文件是设计决策记录；实现见 `quant-indicators/`，验证见 `quant-indicators/verify.ts`。

## 1. 背景与定位

- 官方 CONTRIBUTING.md 最推崇的路径：**创建插件 + 打 `dsh-plugin` topic**。
- 我们的差异化背景：量化交易。dsh 是 coding agent harness，量化场景的 agent 需要"算指标"这个基础能力，但目前官方工具集（bash/fs/web/terminal/subagent…）**没有技术指标计算**——这是真实空白。
- 约束：MVP 必须**零外部依赖、可离线验证**（不依赖行情 API 凭据/网络），保证质量可控、可复现；行情获取作为后续路线。

## 2. 命名与定位

- 工作区项目名：`quant-indicators/`（本地开发名 `dsh-quant-indicators`，发布时再定 npm scope）
- 定位：**给模型的一组纯计算技术指标工具**——模型拿到 OHLCV/收盘价序列后，可以调用它们算 SMA/EMA/RSI/MACD/布林带/ATR，返回结构化 canonical JSON（Code Mode 可直接编程消费）。
- 与官方工具风格一致：一个包、多个工具、`ctx.tools.register`、defineTool 契约。

## 3. MVP 工具清单

所有工具：输入价格序列 → 输出结构化 JSON；纯函数实现；`isConcurrencySafe: true`（可并行）。

| 工具名 | 参数 | canonical 输出 | 说明 |
|---|---|---|---|
| `quant_sma` | `values: number[]`, `window: integer ≥1` | `{ values: number[], window: number }`（含 window 的元数据，方便下游） | 简单移动平均 |
| `quant_ema` | `values: number[]`, `window: integer ≥1` | `{ values: number[], window: number }` | 指数移动平均，alpha = 2/(window+1)，从第一个值起递归 |
| `quant_rsi` | `values: number[]`, `window: integer ≥1`（默认 14） | `{ values: number[], window: number }` | 相对强弱指数（Wilder 平滑），首值 null → 用 NaN 还是省略？**决策：输出与输入等长，不可计算的头部位置返回 `null`**（模型可对齐索引）|
| `quant_macd` | `values: number[]`, `fast: integer=12`, `slow: integer=26`, `signal: integer=9` | `{ macd: (number\|null)[], signal: (number\|null)[], histogram: (number\|null)[] }` | 三者等长对齐 |
| `quant_bollinger` | `values: number[]`, `window: integer=20`, `multiplier: number=2` | `{ upper: (number\|null)[], middle: (number\|null)[], lower: (number\|null)[], window: number, multiplier: number }` | 标准差用总体（除以 n）|
| `quant_atr` | `high: number[]`, `low: number[]`, `close: number[]`, `window: integer=14` | `{ values: (number\|null)[], window: number }` | 平均真实波幅（Wilder）；三个数组必须等长 |

对齐约定（所有指标统一）：
- 输出与输入**等长**（ATR 与 high/low/close 等长），头部 `window-1` 个位置（MACD 从 slow+signal-2 起）为 `null`——模型能按索引对齐，无需自己补 padding。
- 空序列 / 窗口 > 序列长度 → 全 `null` 输出（合法结果，不是错误）。
- 输入含 NaN/Infinity → `INVALID_ARGS`（数据质量错误提前暴露）。
- 约束检查（窗口 ≥1、fast<slow、数组等长）在 execute 手检并抛错 → isError（DSL 表达不了的约束）。

## 4. 包结构

```
quant-indicators/
  package.json          # name: dsh-quant-indicators, type: module
  node_modules/@deepseek-ai → symlink 到 deepseek-harness（复用 workspace 依赖）
  src/
    indicators.ts       # 纯函数实现（无 dsh 依赖，可独立单测）
    index.ts            # 插件：name/inject/apply，register 6 个 defineTool
  verify.ts             # 验证：boot ctx → schemas() → execute() 每工具
  tests/
    indicators.spec.ts  # 纯函数数值正确性（已知答案样例）
  README.md             # 契约、模型体验、限制（模仿官方 README 结构）
```

`src/indicators.ts` 纯函数独立于 dsh——这是刻意的：**核心算法与 harness 解耦**，数值正确性可以脱离 Cordis 测试（用 node:test 或简单断言脚本即可），harness 层只做 schema/注册/执行验证。

## 5. defineTool 契约合规清单（对照 notes/03）

- [x] 参数用统一 schema DSL（`type`/`required`/`description`）
- [x] `output.schema` 声明 canonical 值（object/array 根），`output.render` 给模型渲染
- [x] execute 只返回 canonical 值；错误抛错（registry 转 isError）
- [x] DSL 表达不了的约束手检（window ≥ 1、数组等长、数值有限）
- [x] `isConcurrencySafe: true`（纯函数、无共享状态、无副作用）
- [ ] presentCall/presentResult：MVP 用 generic 兜底（返回 undefined），指标无文件/终端/diff 语义，UI 卡片无特殊需求
- [ ] timeoutMs：纯计算很快，不设（默认）
- [ ] README 的 Model Experience 段（模型/Token/KV-cache 效果）——发布前补

## 6. 测试与验证策略

1. **纯函数单测**（`tests/indicators.spec.ts`）：已知答案样例——
   - SMA(1..5, w=3) = [2,3,4]
   - EMA 手算样例（对照标准公式）
   - RSI 用 Wilder 标准样例（如经典 14 期样例序列）
   - MACD/布林带/ATR 手算或推导样例
   - 边界：空数组、window > 长度、NaN 输入
2. **harness 验证**（`verify.ts`）：boot ctx（SystemPrompt + ToolRuntime + 插件）→ schemas() 确认 6 工具 → execute() 每工具走完整管线 → 无效参数 isError 路径 → register disposer。
3. （后续）REAL-composition 测试：cordis.yml + Loader boot，符合官方 testing 政策。

## 7. 后续路线（非 MVP）

- **行情数据源**：`quant_market` 工具（akshare / ccxt / yfinance 之一，凭据可选）——需网络，作为阶段 2。
- **回测**：`quant_backtest`（策略回调 + 历史数据 → 收益/回撤/夏普）——较大，单独包。
- **发布**：npm 发布 + GitHub `dsh-plugin` topic + README 教程；后续可在官方 Discussions 发帖分享。

## 8. 验收标准（阶段 3 完成定义）

- [x] 6 个指标工具全部注册 + 执行链路验证通过（verify.ts 全绿）
- [x] 纯函数数值正确性有测试覆盖（12 用例全过，含经典 RSI 70.46 / MACD / ATR 手算）
- [x] README 契约完整（含 Model Experience）
- [x] REAL-composition 测试（cordis.yml + 真实 Loader boot，4 用例全过：注册可见 / 管线执行 / isError / HMR-safety disposer）
- [x] 行情数据源 `quant_market_fetch`（Binance 公共 API，零依赖原生 fetch；真实 fetch→sma 链路端到端实测）
- [x] 回测 `quant_backtest`（双均线交叉，无未来函数，双边手续费；手算 V 形样例 + 真实 BTC 数据端到端）——验收 7/7
- [x] 发布准备：LICENSE + package.json（files/keywords/scripts）+ npm pack dry-run 通过（7 文件 11.5 kB）+ 发言稿 `discussions-post.md`
- [ ] 实际发布到 npm + 打 `dsh-plugin` topic + 发布 Discussions 发言（需要 npm/GitHub 账号，用户决定）
