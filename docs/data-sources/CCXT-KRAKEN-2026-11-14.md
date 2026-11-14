# 第一例真实接入：CCXT + Kraken 公开只读行情

日期：2026-11-14，Asia/Shanghai。结论：**小范围接入已跑通**，不是仅收录链接。
源码示例：[demos/ccxt-public](../../demos/ccxt-public/README.md)。这是可选 SDK
输入桥接，**没有给 `quant_market_fetch` 增加 provider，也没有新增模型工具或发布 npm**。

## 选型问题、范围与许可

可证伪问题：无需付费或凭据，能否通过一个清晰许可的 SDK 取得同一窗口的60根
已收盘 BTC/USD 小时 K 线，正确映射为 Candle，并在真实 dsh 工具运行时得到
可核对的质量检查/SMA 输出？若缺值、单位、顺序、窗口覆盖或对照不一致，则失败。

选择 **CCXT4.5.92 + Kraken public OHLC**：TypeScript/JS 环境直接复用；客户端
[MIT 许可/固定源版本](https://github.com/ccxt/ccxt/blob/e6fd82900c9f2b71fa0fa7524d95dd788e2803fc/LICENSE.txt)，
公开行情无需 key，恰好可接现有 Candle/quality/indicator 流程。其余10个候选没有
在本轮安装或测速，下面是工程约束选择，不是它们的性能排名：

| 候选 | 本轮不先选的原因 |
|---|---|
| AKShare / AKTools | Python/桥接及逐接口的上游条款需要另审；不是已测出它们更差。 |
| OpenBB | 多 provider 与较大集成面，先验证一个源再考虑平台层。 |
| TuShare / fredapi / LLMQuant | 账号/token/key/credit 与接口权限多一个前置条件；不等于全部必须付费。 |
| yfinance | 非官方 Yahoo 客户端，个人用途/访问/复权约束另测；本轮不扩大验证面。 |
| EdgarTools | MIT，SEC 财报适合下一轮；需 fair-access 标识和披露/修订语义，不是当前 crypto Candle 的最小例子。 |
| DuckDB / dlt | 存储/摄取设施，不是数据供应商，不能独自满足“真实获取行情”。 |

**代码 MIT 不等于行情开放许可**。Kraken 的[公开接口说明](https://docs.kraken.com/exchange/guides/overview)
确认 market data 无需 key；[API notices](https://docs-legacy.kraken.com/api/docs/guides/global-intro/#notices)
要求某些用途、包括非个人商业用途先获许可，仍受[平台条款](https://www.kraken.com/legal/global-terms)
约束。本例仅限个人非商业研究，未核准商业服务或数据再分发。原始行情不入 Git/
npm；公开的是自有代码、全新合成 fixture、请求计数/耗时/hash。无需账号/付费，
不等于任何地区/用途都获准使用；拒绝访问时停止，不绕过限制。

## 固定协议

- Baseline：独立原生 REST 请求相同 Kraken pair/interval/since；解析秒→毫秒，
  volume取原始第6列，不把第5列 VWAP 当成交量。
- Change：真实 `ccxt.kraken.fetchOHLCV` → 新增 `ccxtHourlyCandles` → 已注册
  `quant_data_quality` / `quant_sma(window=5)`。核对手算 fixture 和纯函数 SMA。
- 两条路径用同一 patched undici7.30.1 transport、同一只读 allowlist。每次12请求
  上限，1.1s调度间隔，10s/请求，无重试、无换域名、无私有接口/下单。
- 接受窗口为UTC **2026-11-11 18:00 至2026-11-14 06:00（右端不含）**。
  它比运行开始整点额外落后一小时，60根闭合 bar。每路径3轮，顺序REST/CCXT、
  CCXT/REST、REST/CCXT；每轮映射完全相等，跨轮冻结窗口结果也必须不变。
- [官方 OHLC 说明](https://docs.kraken.com/api-reference/market-data/get-ohlc-data)
  指出末根是未提交窗口、最多720条。两条路径各返回62条，本例均丢弃窗口外2条，
  不补齐不存在的 bar。闭合筛选不是历史可获得性/PIT vintage 证明。

## 实测结果

接受回执：[2026-11-14T07-47-34-088Z.json](../../benchmark/ccxt/evidence/2026-11-14T07-47-34-088Z.json)。
本地运行15:47:34–15:47:44，Node24.18.0/Windows x64。源码在369e6a2之后的工作树，
所以回执明确 `DIRTY; use file hashes`，记录实际运行的源码/lock SHA256，
不冒充369e6a2已经含有新增实现。

| 检查 | 实际结果 |
|---|---|
| 公开 HTTP 请求 | 8/12预算，全部200；Assets/AssetPairs各1次，OHLC共6次 |
| 窗口数据 | 六条路径各60根，严格递增/连续/已闭合；每路径过滤2根窗口外数据 |
| 对照 | 3/3轮REST与CCXT完整Candle精确相等；跨轮也相等，hash在回执中 |
| 真实工具调用 | 六条路径各调用quality+SMA，12/12通过；SMA与纯函数输出完全相同 |
| 账号/key/支付/交易 | 均未使用；无模型推理调用 |

端到端取数耗时（毫秒）：

| 轮次 | 原生REST | CCXT |
|---|---:|---:|
| 1 | 543.47 | 4127.92，首次含市场元数据加载 |
| 2 | 1116.92 | 1571.97，已缓存市场元数据 |
| 3 | 885.97 | 1865.02，已缓存市场元数据 |

包含限流等待/响应hash/首轮SDK元数据请求；不含安装、模块import和工具计算。
**n=3只能描述本次请求，不报告p95/SLA或宣称CCXT提速。** 价值是统一SDK/严格
边界/可复核流程，代价是启动、元数据、依赖体积和调度延迟。

固定240根**独立合成**输入，50次warmup、1000次采样/路径，断言在计时外：

| 离线路径 | 中位数ms |
|---|---:|
| 无校验Number映射baseline | 0.0112 |
| 严格窗口/值/顺序校验 | 0.0153 |
| 严格映射+quality+SMA | 0.0167 |

负对照：无校验 baseline 会把null volume变0；严格桥接拒绝。不同工作量与JIT/GC/
单进程顺序使微秒级结果不能当作严格的速度竞赛。这不是金融alpha/收益benchmark。

## 失败、安全修正与历史回执

1. 首次启动在联网前失败：npm包实际4.5.92，导出的JS版本字符串却是4.5.91。
   核对已安装manifest、lock integrity及源码后，同时记录/校验两者，不改写成虚假的版本。
2. 第一份取数回执07:43:54Z为功能PASS，但npm audit随后发现CCXT固定依赖
   undici7.29.1涉及安全公告（汇总2个受影响包：1 high、1 moderate）。该配置不作为接受版本。
3. 第二份07:45:13Z已override undici7.30.1、audit为0，但进一步检查发现Node自带
   undici7.28.0不受npm override影响，实际transport仍为native fetch；也不作为最终配置。
4. 最终示例显式把**两条**路径都注入npm undici7.30.1 fetch，并再次运行全协议。
   npm audit最终0已知问题。参考[已修复版本公告](https://github.com/advisories/GHSA-2m5v-pch6-74hx)。
   这是当前advisory数据库的结果，不是“绝对安全”或对任意代理/TLS配置的认证。
5. 初始新测试typecheck提示回调init可能undefined，已补默认值后通过。初始Context7
   文档查询额度耗尽，改读CCXT官方manual、已安装固定源文件和Kraken官方文档。

三份生成回执保留，不覆盖前两份。合计24次只读公开HTTP请求、零交易、零付费；
启动版本断言失败发生在网络请求前，不计入HTTP次数。

## 验收、边界与下一步

本例的15个专项测试覆盖手算映射、0成交量、null/空串/布尔/非有限数、稀疏数组、
秒时间戳、乱序/重复、窗口边界/缺口、OHLC范围、私有端点/凭据/重定向/预算拒绝，
以及归档回执、可选依赖锁和打包排除门槛。全量测试/CI的实际命令与结果见
[本轮日志](../../log/2026-11-14_ccxt-first-live-data.md)。CI只运行离线测试、可选包安装/
审计/typecheck；不暗中持续访问交易所。

决策：接受为 **PERSONAL_RESEARCH_DEMO**，不是一般商业数据授权、生产采集器、
全历史行情、PIT保证或quant_market_fetch内建路由。生产化、别的symbol/时间框架、
新增自动重试或商业用途必须另立范围和验收，不直接套用本次PASS。

下一轮优先检验：不同运行时间的持久快照/恢复、明确publication/observation契约、
已授权第二源的单位/时间对照；再评估是否值得新增原生provider工具。不做无依据扩展。
