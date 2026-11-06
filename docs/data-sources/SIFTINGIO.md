# SiftingIO 数据渠道审核

复核日期：**2026-11-06（北京时间）**。投稿者：**@aprsn**，在
[原投稿](https://github.com/pengpengyi92/dsh-quant/issues/2#issuecomment-6659567979)
中自述为 Alper San、SiftingIO 创始人；此处保留投稿署名，不独立认证其身份。

**结论：附条件收录为 `api-platform` 渠道，供用户自行评估。**

| 审核层次 | 当前结论 |
|---|---|
| 渠道目录 | 公开资料足够支持导航；`quant_data_guide(channel="siftingio")` 返回费用、限制、来源及贡献署名 |
| 真实 API 测试 | 未执行带有效凭据的 REST/WS 请求；未开账户、购买套餐或获取凭据 |
| 数据质量 | 未独立验证准确性、延迟、可用率、历史完整性或 PIT 正确性 |
| 正式 dsh 插件兼容性 | 未验证；官方 SDK/MCP 的存在不等于通过 dsh Loader、工具契约或端到端集成测试 |

本次检查时 Issue #2 为 Open，只有原投稿一条评论；未发现已有处理 PR。
在基线 `8bf174d3587f9df27608e5759b979eb00abe0927` 及当时全部 8 个远程分支的
受版本控制文件、提交标题中未找到 SiftingIO/aprsn 收录记录；这不涵盖其他 fork、
未推送工作或私下审核。

## 与现有规则的对应

[Issue #2](https://github.com/pengpengyi92/dsh-quant/issues/2) 征集结构化接口、
搜索/过滤等语义入口及低接入成本，并要求接入方式、授权和费用说明。
[CONTRIBUTING](../../CONTRIBUTING.md) 允许在渠道指南记录付费来源，禁止代理付费数据；
[外部插件目录规则](../../plugin/README.md#收录规则欢迎-pr) 要求公开可验证项目。
本次只增加渠道知识及文档，不注册 provider、不安装 SDK/MCP，也不增加网络调用。

| Agent-native 评价维度 | 证据与判断 |
|---|---|
| 结构化调用 | [Quickstart](https://sifting.io/docs/quickstart)、[REST 规范](https://sifting.io/openapi.yaml)、[WS 规范](https://sifting.io/asyncapi.yaml) 提供 JSON 合约；已静态检查 |
| 搜索/过滤入口 | OpenAPI 的 `/v1/symbols` 提供标的搜索与资产类别等过滤；`/v1/fnd/stocks/search` 提供公司/代码搜索。未验证语义向量检索能力 |
| SDK/MCP | 官方代码公开且可审阅（见下表）；未做运行或 dsh 兼容验证 |
| 接入成本 | 必须自备账户及 API Key；存在受配额和用途约束的免费层，符合“可评估渠道”，不属于免凭据接口 |
| 可用于研究的可信度 | 有文档化时间、分页、错误及行情口径；独立质量证据不足，只作附条件导航 |

## 公开接口与代码核验

实际下载并用 YAML 解析器读取两个公开规范；OpenAPI 为 **3.1.0**，AsyncAPI 为
**3.0.0**，各自 `info.version` 均为 `1.0.0`。检查的 **420 / 33** 个 `$ref`
均可在各自文件内解析。此项仅检查 YAML 与内部引用，不是完整标准合规认证或服务测试。
未在本仓库存放规范副本或行情响应。

| 文件 | SHA-256（2026-11-06 下载内容） |
|---|---|
| [openapi.yaml](https://sifting.io/openapi.yaml) | `c570068c23592fb5f2f10c62a3ee1d90e0b039053eebd87a14a52b43600e4b9b` |
| [asyncapi.yaml](https://sifting.io/asyncapi.yaml) | `dfe7a1922bce9a2df4256d3d560723d070013a18be1e05c0ea306547cd76a36a` |

REST 基址为 `https://api.sifting.io`，首选 `X-API-Key` 请求头；规范也列出
`api_key` 查询参数。历史 bars 需协商 gzip 并处理 cursor 分页。
[WebSocket 文档](https://sifting.io/docs/websocket) 的地址为
`wss://stream.sifting.io/ws/v1`；示例用 `key` 查询参数，日志必须遮蔽完整凭据。
本次没有使用任何 API Key。

按[官方 SDK 页面](https://sifting.io/sdks) 的链接核验了以下仓库的 LICENSE、
README 及相关传输/工具注册源码。以下是本次读取的固定提交，不表示最新版或经过运行验证。

| 项目 | 已读取提交 | 代码许可 |
|---|---|---|
| [Python SDK](https://github.com/SiftingIO/sdk-python)（`siftingio`） | [`5a4d3f7`](https://github.com/SiftingIO/sdk-python/tree/5a4d3f72e6b71f4d43a0884ce24d3a065c336dfd) | [MIT](https://github.com/SiftingIO/sdk-python/blob/5a4d3f72e6b71f4d43a0884ce24d3a065c336dfd/LICENSE) |
| [Go SDK](https://github.com/SiftingIO/sdk-go) | [`b85013f`](https://github.com/SiftingIO/sdk-go/tree/b85013f966ee954d142389b6b0dcb4d4e993ff14) | [MIT](https://github.com/SiftingIO/sdk-go/blob/b85013f966ee954d142389b6b0dcb4d4e993ff14/LICENSE) |
| [JS/TS SDK](https://github.com/SiftingIO/sdk-typescript)（`@siftingio/sdk`） | [`517f99f`](https://github.com/SiftingIO/sdk-typescript/tree/517f99f8ab67cc06c651f2f197e5a36c11498838) | [MIT](https://github.com/SiftingIO/sdk-typescript/blob/517f99f8ab67cc06c651f2f197e5a36c11498838/LICENSE) |
| [TypeScript MCP](https://github.com/SiftingIO/siftingio-mcp)（`siftingio-mcp`） | [`40a31aa`](https://github.com/SiftingIO/siftingio-mcp/tree/40a31aadd36c7c380a630fd705890b977fe80269) | [MIT](https://github.com/SiftingIO/siftingio-mcp/blob/40a31aadd36c7c380a630fd705890b977fe80269/LICENSE) |

MCP 源码有工具参数、部分结构化输出和只读标注；其 WS 状态变更工具另有标注。
[官方 MCP 接入说明](https://sifting.io/integrations/mcp) 中的本地 API-key 版与托管连接器
是不同接入形态，本条目录记录针对投稿的 API/SDK 渠道。

## 配额、覆盖与许可

以下是 **2026-11-06 的供应商公开声明**，不是独立实测结果；上线或采购前应复查。

| 项目 | 记录与限制 | 来源 |
|---|---|---|
| 免费层 | 各市场 10,000 REST 次/月、60 次/分钟、1 个 WS 连接、5 个标的订阅、1 个 key、1 人；需注册，无须银行卡；内部非商业用途，best-effort 可用性 | [定价](https://sifting.io/pricing) |
| 超额与商用 | Free/Builder 超额返回 429；付费按市场/套餐区分，Pro/Ultra 的商用展示仍受协议限制，不能据此认定可原样转售数据 | [定价](https://sifting.io/pricing)、[条款 §9](https://sifting.io/legal/terms-of-use) |
| 覆盖 | 美股及 ETF、FX、大宗商品、crypto 的实时参考行情与历史 OHLCV；具体标的需确认可用数据，不能仅凭 catalog 有记录就认定有历史 | [股票产品](https://sifting.io/product/stocks)、[OpenAPI](https://sifting.io/openapi.yaml) |
| 历史深度 | 支持的股票/FX 序列 25+ 年、商品 20+ 年、crypto 10+ 年；实际起点和完整度依标的、上市时间、数据集、粒度而异 | [定价：历史深度](https://sifting.io/pricing)、[股票产品 FAQ](https://sifting.io/product/stocks) |
| 行情含义 | 聚合、衍生、归一化的参考值，可能偏离特定交易所；股票 bars 规范注明未作拆股/分红复权；FX 的 `v` 是 tick count 或缺失时的 0，不是货币成交量 | [披露 §3](https://sifting.io/disclaimer)、[OpenAPI](https://sifting.io/openapi.yaml)、[FX bars](https://sifting.io/docs/historical/forex) |

**代码许可与数据许可分别适用。** SDK 以及规范文件的 MIT 标记不授予行情自由分发权。
[服务条款](https://sifting.io/legal/terms-of-use) §4/5/9 和
[披露](https://sifting.io/disclaimer) §7/8 要求按套餐、用途及上游许可使用数据。
商业展示、再分发、历史存储、衍生数据及 AI/ML 训练/微调/评测用途，须确认适用范围并取得
协议要求的书面授权；MCP 检索接入不等于获得建立模型训练数据集的许可。
本仓库只分发渠道元数据，不包含凭据、商业行情或代理访问代码。

## 未解决证据与后续验收

[方法说明](https://sifting.io/data-methodology) 描述稳健聚合、跨源 consensus 与降级标记，
[状态页](https://siftingio.instatus.com/) 提供供应商运维报告。这些属于供应商证据；
本次未取得独立准确率评测、可复现跨源对账或带凭据的覆盖/可用率测量。
SDK 中的 mock 测试也不能替代真实行情验证。保留现有质量模块的“未知渠道，需实测”结果；
目录收录不增加可靠性评分或官方来源推荐。

请投稿者优先补充：

1. **规范差异**：[股票 bars 网页](https://sifting.io/docs/historical/stocks) 写 `limit` 最大 2000，
   本次 OpenAPI 写最大 1000；WS 文档/规范的概述称 query key 为唯一方式，但后续又列出
   首帧 `auth` 方式（AsyncAPI `authenticate`）。请明确实际支持值与模式并同步规范。
2. **历史与口径**：提供按市场、标的、粒度的起止/缺口清单，复权、退市标的、修订/PIT、
   session/时区及各市场 volume 的定义，说明原始/衍生字段和上游授权范围。
3. **用途授权**：明确免费评估、机构内部非展示研究、商业展示、缓存/存储、衍生结果发布、
   再分发和 AI/ML 使用分别需要哪种许可；只需公开条款或非敏感说明，不在 Issue 提交密钥。
4. **后续真实测试**：在用户自有凭据和明确许可下，对自选标的/窗口验证 schema、gzip、分页、
   401/403/429 处理、WS 重连、时间及 OHLC/volume 一致性，并与口径匹配的独立来源对账；
   只公开许可允许的汇总指标。`quant_data_quality`/`quant_data_annotate` 的检测结果另行记录。
5. **正式 dsh 集成**：另建适配 PR，验证 Loader/MCP 挂载、canonical schema、凭据注入、
   故障隔离与端到端调用；完成前继续标记“兼容性未验证”。

本次渠道测试仅验证目录查询、限制与署名保留、无凭据时被就绪检查拦截，以及收录不提升
质量/权威性；仓库构建、单测及 CI 的结果属于 **dsh-quant 本次变更验证**，不代表
SiftingIO API 或其 MCP 已通过真实数据与兼容性测试。
