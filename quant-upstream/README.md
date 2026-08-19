# quant-upstream — 量化产业链 · 上游栏目

> 数据服务供应商 = 量化行业的上游。终端是载体，数据是原料，我们是"用原料的人"。

## 产业链定位（三层框架）

```
上游（本栏目）          中游（未来栏目）        下游（未来栏目）
数据/终端/基础设施    →  因子/数据中台/研究    →  执行/经纪/自营交易
Bloomberg · Wind        quant-midstream         quant-downstream
Refinitiv · iFinD      （PDAT/PET 自己就是）    Jane Street 等（quant-history 已收）
Choice · TradingView
```

- **上游**：数据服务供给商——行情、基本面、另类数据、终端产品。量化人的"军火商"。
- **中游**：用数据做研究的环节——我们的 PDAT→PET 管线本质上就是自建中游。
- **下游**：交易执行与自营——quant-history 的 53 家机构档案里大量是下游玩家。

**一句话**：quant-history 记"谁在赚钱"，quant-repo 记"谁开源了什么"，
quant-upstream 记"**大家打仗时，谁是卖水卖铲子的**"。

## 收录标准（对齐 quant-history 的 DD_STANDARD）

1. 每家供应商一个档案文件（`<name>.md`），结构统一：起源/定位/数据覆盖/终端体验/生态/对我们的意义
2. **价格与数据条款一律标注"以官方报价为准"+ 待考证**——行业报价不公开，宁缺毋编
3. 对比结论写进 `COMPARISON.md` 总表，数字可追溯到各家档案
4. 与 fun-facts 联动：终端史、TUI 传统这类"人文事实"优先沉淀成 fun fact

## 档案清单

| 文件 | 供应商 | 状态 |
|------|--------|------|
| COMPARISON.md | 对比总表 + 产业链分析 | ✅ |
| BLOOMBERG.md | Bloomberg Terminal | ✅ |
| WIND.md | Wind 万得 | ✅ |
| REFINITIV.md | LSEG Refinitiv（Eikon → Workspace） | ✅ |
| IFIND.md | 同花顺 iFinD | ✅ |
| CHOICE.md | 东方财富 Choice | ✅ |
| TRADINGVIEW.md | TradingView | ✅ |
| JOINQUANT.md | 聚宽 JoinQuant | ✅ |
| RICEQUANT.md | 米筐 RiceQuant | ✅ |
| GO-GOAL.md | 朝阳永续 Go-Goal | ✅ |
| REUTERS-DATA.md | 路透数据（新闻数据血统，1851 信鸽起家） | ✅ |
| ALT-DATA-CN.md | 国内另类数据商（品类地图合集） | ✅ |
| （队列） | 通联数据 · 数库科技 · 四象爱数 · 恒生聚源 | 📋 |

## 栏目哲学

> 量化人花大量时间选数据源——这件事本身就该被研究。
> 上游厂商的产品逻辑，决定了整个行业能做什么研究。

## 上游七家的产品哲学光谱

| 哲学 | 代表 | 一句话 |
|------|------|--------|
| 键盘流 TUI 贵族 | Bloomberg / Wind | 效率是定价权 |
| 图形化守成 | Refinitiv | 鼠标 vs 键盘路线之争 |
| 自然语言先行 | 同花顺 iFinD（问财） | AI-native 的预告 |
| 流量派价格战 | 东方财富 Choice | 互联网思维进金融 |
| 图表即产品 | TradingView | 给 DSL，用户长生态 |
| 平台派双扩张 | 聚宽 JoinQuant | 中游起家，上下游通吃 |
