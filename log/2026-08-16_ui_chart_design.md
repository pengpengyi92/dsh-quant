# dsh-quant UI / Chart 双路线设计（引爆产品计划）

- **author:** DeepSeek (deepseek-v4-pro, Mac 端)
- **created_at:** 2026-08-16
- **record type:** 产品设计文档（log/ + 三库镜像）

## 一、机会判断（为什么 UI 是引爆点）

1. **官方缺 chart 卡片**：dsh 官方 UI 词汇只有 generic / terminal / diff / search /
   read / web——没有图表渲染能力；所有插件只能输出文本。
2. **社区 UI 全是"布局型"**：awesome 列表的 UI 类（sidebar/主题/语音/移动端）没有
   "数据可视化型"——真空地带。
3. **dsh-quant 天然产图数据**：K 线（fetch）、指标（12 个）、净值曲线 + 买卖点
   （backtest 有 entryIndex/exitPrice）、因子 IC/分层（factor）、点级标注
   （annotate 有 index+severity）——全是结构化、可直接画。

## 二、双路线

### 路线 A：dsh-quant-ui（引爆自己）

给 dsh-quant 配量化工作台面板（TradingView 风格深色图表）：

| 图表 | 数据源 |
|---|---|
| K 线蜡烛图 + 均线叠加 | market_fetch + sma/ema |
| 指标子图（RSI/MACD/布林带）| 12 指标 |
| 回测净值曲线 + 买卖点标记 | backtest（entry/exit 点现成）|
| 因子 IC 条形图 / 分层收益 | factor_evaluate |
| 数据标注可视化 | annotate（点级 index + severity → 红/黄/绿高亮）|

### 路线 B：dsh-chart（平台级引爆）

把 A 提炼成**通用 chart 协议**，补上官方缺的图表能力：

- 注册通用 chart 节点（ConversationNodeDefinition + keyed renderer）
- 任何插件输出 `{ type: 'chart', ... }` → 前端渲染交互式图表
- dsh-quant 成为首个 showcase → 其他插件跟进 = 生态地位 + 平台贡献

## 三、技术方案（基于 notes/06-web-ui.md 研究）

| 层 | 选择 | 理由 |
|---|---|---|
| 扩展点 | `ConversationNodeDefinition` + keyed renderer（client plugin）| 官方 Chat 节点是 UI 集成的正门 |
| 图表库 | **Lightweight Charts**（TradingView 开源，K 线专精）+ ECharts 备选（复杂图）| 免费、深色美学、体积小 |
| 数据协议 | chart node 输入 schema：candles / series / markers / annotations 四类 | 结构化、可序列化、可回放 |
| 标注渲染 | severity 1/2/3 → 黄/橙/红点级高亮（Scale AI 哲学可视化）| 复用 annotate 工具语义 |
| 状态 | 走 sessionProjections 或 node 自身数据（图表只读展示，无需推流）| 最简路径 |

## 四、API 设计草案（chart node 数据面）

```ts
interface ChartData {
  kind: 'candles' | 'series' | 'bars'
  candles?: Candle[]                       // K 线（复用量化数据结构）
  series?: { name: string; values: (number|null)[] }[]   // 叠加线（指标）
  markers?: { index: number; kind: 'entry'|'exit'|'stop'|'target' }[]
  annotations?: { index: number; label: string; severity: 1|2|3 }[]
  title?: string
}
```

## 五、美学（"前端美丽"）

- TradingView 深色主题（背景 #131722、蜡烛绿涨红跌——注意 A 股习惯红涨绿跌可配置）
- 标注：黄色=提示、橙色=明显问题、红色=需人工复核（severity 映射）
- 卡片式布局、平滑动画、hover 显示数值

## 六、路线图

```
0.11.0  dsh-quant 输出 chart 数据面（presentResult 附 chart data / chart node 数据）
        → dsh-quant-ui 包（Lightweight Charts 渲染：K线/指标/净值/因子/标注）
        → dsh-chart 通用协议 + 首个 showcase
        → 生态 PR/issue（给官方和 awesome 社区）
        → 引爆：其他插件开始用 dsh-chart
```

## 七、宣发价值

- X 素材：quant agent 直接画出漂亮 K 线 + 标注红点的画面（概念图/录屏）——"数据质量
  可视化"的画面感极强
- 与 Issue #1（标注维度征集）联动：标注越多维度，可视化越好看——社区贡献的飞轮
