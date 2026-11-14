# 数据从哪里来：Data sources / plugins 共建报告

日期：2026-11-14，Asia/Shanghai。范围：本轮公开搜索与一手来源复核后的首批
11 个相关仓库；**不是全网穷尽、排名或生产认证**。可复核的 commit、许可证路径/
blob 与角色在[机器可读快照](evidence/2026-11-14-data-repos.json)。

**后续实现（当日15:47）**：已选CCXT + Kraken跑通真实个人研究示例，见
[独立协议、benchmark和安全修正](CCXT-KRAKEN-2026-11-14.md)。下文/快照保留首轮
LINK_ONLY/NOT_RUN历史状态，不将其他10个来源升级为实测；本次接入不涉及PDAT私有代码。

## 1. 先分清四层

`原始交易所/披露/宏观来源 -> SDK/采集器 -> MCP/插件 -> 存储、质量和研究`

MCP 是访问层，不天然是数据库，也不保证底层数据免费、准确或可再分发。
开源软件许可、账号/额度、数据用途与再分发权分别核验。下面的库不全是
原生 DSH/Cordis 插件；目录收录不等于已接入 `quant_market_fetch`。

## 2. 首批来源与工程项目

所有项目本轮均为 **LINK_ONLY / NOT_RUN**：查看来源与许可证，没有安装或执行
上游代码、调用其行情服务、开通账号或购买套餐。表中用途是待验证方向。

| 项目 / 一手仓库 | 角色与用途 | 当前代码许可证证据 | 访问/数据边界与下一步 |
|---|---|---|---|
| [LLMQuant/data-mcp](https://github.com/LLMQuant/data-mcp) | 金融数据/知识的 MCP 连接器 | MIT，固定 revision | 已收录；补齐账号、凭据、credit 和 MCP 非原生插件说明。见下节流程。 |
| [akfamily/akshare](https://github.com/akfamily/akshare) | Python 财经数据接口库，A 股/跨市场探索 | MIT | 接口与上游条款逐项核对；不要将 SDK 免费等同于数据授权或稳定性保证。 |
| [akfamily/aktools](https://github.com/akfamily/aktools) | AKShare 的 HTTP/MCP 桥接 | MIT | 是桥接服务，不是独立行情权利来源；优先隔离本地试验，部署和鉴权未测。 |
| [openbq-org/OpenBB](https://github.com/openbq-org/OpenBB) | 多提供商数据集成平台 | 固定 LICENSE 文本声明 Apache-2.0；GitHub 自动识别为 NOASSERTION，单列人工记录 | 原 OpenBB-finance 地址已重定向；旧版本/产品许可不能混用。各 provider 的 key、费用和数据权利另查。 |
| [ccxt/ccxt](https://github.com/ccxt/ccxt) | 交易所市场数据客户端 | MIT | 仅考虑公开只读行情；限制/限流、标识符、未收盘 K 线要验证，不接私有账户和下单。 |
| [waditu/tushare](https://github.com/waditu/tushare) | 中国市场数据 SDK | BSD-3-Clause | 服务账号/token、接口权限与套餐另定；不公开下载数据，不沿用未复核的积分/价格。 |
| [ranaroussi/yfinance](https://github.com/ranaroussi/yfinance) | 非官方 Yahoo 数据研究客户端 | Apache-2.0 | 上游明确提示研究/教育、个人用途及 Yahoo 条款；复权、覆盖和 PIT 不能默认正确。 |
| [mortada/fredapi](https://github.com/mortada/fredapi) | FRED/ALFRED 宏观与修订版本客户端 | Apache-2.0 | wrapper 不是美联储官方服务；FRED API 需自有 key，系列版权和 vintage 单独核查。 |
| [dgunning/edgartools](https://github.com/dgunning/edgartools) | SEC EDGAR/XBRL 披露研究 | MIT | 遵守 SEC 标识与 fair-access 规则；披露时间、修订和单位需要专门测试。 |
| [duckdb/duckdb](https://github.com/duckdb/duckdb) | 本地 SQL/Parquet 分析与存储 | MIT | **不是数据供应商**；用于消费合法获得的快照，不能解决数据采购与权限。 |
| [dlt-hub/dlt](https://github.com/dlt-hub/dlt) | 数据摄取/加载工程 | Apache-2.0 | **不是行情源**；连接器/增量/目标表语义要测，工程框架不授予源数据权利。 |

许可证是代码级观察，不是法律或再分发批准。自动快照保留 OpenBB 的未知状态；
人工读取固定 LICENSE 的结论在[独立复核记录](evidence/2026-11-14-manual-reviews.json)，
不伪装成自动识别结果，也不把新许可套到旧版本。

补充一手规则：[FRED API 与系列版权](https://fred.stlouisfed.org/docs/api/terms_of_use.html)、
[FRED key](https://fred.stlouisfed.org/docs/api/api_key.html)、
[SEC developer resources](https://www.sec.gov/about/developer-resources)、
[CCXT public/private API](https://github.com/ccxt/ccxt/wiki/manual)、
[yfinance 用途提示](https://github.com/ranaroussi/yfinance)、
[OpenBB 许可版本说明](https://github.com/OpenBB-finance/openbb-docs/blob/main/content-odp/python/faqs/license.mdx)。

## 3. LLMQuant Data：已收录，修正接入描述

它已在 Issue2、生态目录和渠道库中，不再重复新增条目。原有“免费开源项目/
原生插件”说明不准确。本次修正代码许可与后台服务、注册/凭据和 credit 的区别，
并让缺少凭据的 readiness 检查阻塞。完整的用户自主接入/预算/验证流程见
[LLMQUANT.md](LLMQUANT.md)。本轮未注册、付费或执行凭据 API 测试；官网
pricing 的403意味着具体现金金额/当前额度 **UNVERIFIED**，不能说“永久免费”。

## 4. PDAT：proprietary/private，选择性公开

已复核 PDAT 远端为 PRIVATE，并只读查看当前 main 的说明、adapter/生命周期/
公开边界。旧本地工作树落后于远端，没有将旧文档当作最新实现。没有修改 PDAT。

本轮选择公开的是[通用来源契约与新合成样例](../../plugin/data/source-contract/README.md)：
来源/权利回执、event/publication/observation 三种时间、缺失值与版本、未知权利
禁止外发。它是独立整理的公开抽象，**不是内部源码的重许可或镜像**。

内部采集器、存储/回放实现、权限与客户控制、策略、个人日志和真实第三方数据均未
复制。未来想选代码开源时，先独立定范围、核权利和泄露风险，再做合成测试与审批。
不会因“自己能下载”就发布数据，也不将私有仓库页面作为公众必须访问的证据。

## 5. 邀请什么样的贡献

沿用 [Issue2 数据接口分享](https://github.com/pengpengyi92/dsh-quant/issues/2)，
FICC 专题继续走 [#152](https://github.com/pengpengyi92/dsh-quant/issues/152) /
[#151](https://github.com/pengpengyi92/dsh-quant/discussions/151)。欢迎自己的项目，
也欢迎介绍别人的资源、失败案例和已有连接器；不要为增加条目数重复收录。

```text
Primary repo/docs + author/affiliation:
Role: original source | SDK | MCP/DSH plugin | quality/storage/ETL
Market/data type and batch/snapshot/stream mode:
Account/key/fee/quota (unknown is acceptable):
Code license + data-use/redistribution rights:
Version/commit + actual command/result, or NOT_RUN:
Event/publication/observation time; revisions/adjustment/units:
Known failure + one negative control:
What this would add beyond an existing entry:
```

优先做小的、可复核的接口/归一化/质量或离线 fixture PR；真实数据权限、未知架构
和生产授权问题不会硬贴 good-first 标签。Review/CI/无前视与隐私标准不降；过程
感谢建议，合并后署名并感谢贡献，欢迎继续协作。群不作为参与门槛。

## 6. 下一步试验，而非“最好”的结论

建议先用无凭据的合成 fixture 固定 schema、缺失值、单位、时间和权利边界；再由
用户选定一个允许的只读源，给出小样本和调用预算。宏观用 vintage 对照，披露用
publication-time 对照，行情用收盘状态/复权/跨源核对。随后再评估是否引入更大的
平台或存储栈。这是减少权限和成本不确定性的工程顺序，不是已测出的质量排名。

可证伪问题：候选连接器能否在同一许可/覆盖/时间约定下，重复产生可追溯输入，
并正确拒绝缺失、晚到、修订泄漏和无权分享？Baseline 为当前离线 fixture 和已有
渠道指南；实际 authenticated API latency/cost/coverage/PIT correctness 均待单独测量，
没有报告生产就绪、交易收益或未经执行的性能数字。
