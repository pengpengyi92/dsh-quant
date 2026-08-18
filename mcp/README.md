# dsh-quant 与其他 Agent / dsh 的交互（MCP & Integration）

> 📖 Agent 第一眼说明书：[AGENT_GUIDE.md](AGENT_GUIDE.md)（一句话/六域/契约/怎么开始/怎么扩展）· 五步上手体验：[../docs/ONBOARDING.md](../docs/ONBOARDING.md)

> 本插件以 dsh 工具契约为核心；其他 agent、MCP client、dsh 实例均可按下面方式直接交互。

## 1. 三种交互方式

### 方式 A：dsh 内（原生，推荐）

```sh
dsh plugin add dsh-quant          # 或 cordis.yml:
- name: 'dsh-quant'
```

dsh agent 的模型直接看到 46 个 `quant_*` 工具（schema 由 system-prompt 装配注入），
调用走 dsh 完整执行管线（pre-execute → guards → execute → post-execute → result）。
这是"零胶水"的交互：装完即用。

### 方式 B：其他 agent / MCP client（通过 tools.json）

`mcp/tools.json` 是 46 个工具的**模型可见 JSON Schema 清单**（运行时从
`ctx.tools.schemas()` 提取，永远与代码一致）。任何支持 function-calling 的
agent 框架（Claude tool use、OpenAI functions、MCP servers）可直接把它当
工具清单接入：

- 执行侧：直接 import 本包（npm i dsh-quant）→ `ctx.tools.execute()`；
  或不经 dsh，直接调用 `src/indicators.ts` / `src/backtest.ts` / `src/market.ts`
  的**纯函数**（零 harness 依赖，任意 Node 项目可用）
- 纯函数入口示例：

```ts
import { sma, rsi, backtestMaCross } from 'dsh-quant'
// 无需 cordis 环境即可计算
sma([1, 2, 3, 4, 5], 3)          // → [null, null, 2, 3, 4]
backtestMaCross(closes, 5, 20, 0.001)
```

### 方式 C：dsh 作为 MCP host（ACP / MCP client 生态）

dsh 本身是 MCP-capable harness（`dsh-mcp-client`）。在其他 MCP host 中通过
dsh 暴露本插件的会话，工具调用即进入 dsh 的 agent 管线。

## 2. 依赖与配置

- 环境/依赖全清单：见 [`../docs/ENVIRONMENT.md`](../docs/ENVIRONMENT.md)
- 发布包内容：lib/（构建产物）+ cordis.patch.yml（bundle 入口）+ README + LICENSE
- 不需要任何 API key（行情为交易所公共接口；数据指南是纯知识库）

## 3. 更新 tools.json

```sh
npx tsx scripts/gen-tools-json.ts   # 每次增删工具后重新生成
```

`tools.json` 随包发布（files 白名单），供外部 agent 静态消费。
