# Data sources & plugins: where does your research data come from?

欢迎分享 Data 相关的 plugin、MCP、SDK、来源和工程项目。我们这次先做了一轮
有边界的一手来源调研，再来邀请共建，而不是只发一个空泛征集帖。

## First review batch / 本轮实际整理

首批11个项目：LLMQuant/data-mcp、AKShare、AKTools、OpenBB、CCXT、TuShare、
yfinance、fredapi、EdgarTools、DuckDB 和 dlt。它们分别属于 MCP/桥接、数据 SDK、
集成平台或存储/摄取工程，**不全是原生 DSH 插件，也不全是数据供应商**。

[完整数据来源与接入报告](https://github.com/pengpengyi92/dsh-quant/blob/master/docs/data-sources/DATA-SOURCING-2026-11-14.md)
逐项列出用途、固定 revision/许可证证据、账号/数据权利边界与待验证方向。
本轮引用状态为 LINK_ONLY / NOT_RUN，没有安装上游项目、创建账号或购买服务。
不是全网穷尽、优劣排名、数据质量认证或真实行情性能 benchmark。

LLMQuant Data 已经收录，不再重复新增。我们修正了现有渠道说明：MIT MCP
代码与后台数据服务不是一回事，接入有账号/凭据/credit 边界。文档提到 beta
试用，不代表无限免费；pricing 页面本轮返回403，实际现金价格、注册与付费均未
验证。[检查与用户自主验证流程](https://github.com/pengpengyi92/dsh-quant/blob/master/docs/data-sources/LLMQUANT.md)
写明了哪些步骤有一手依据、哪些还没跑。不要在这里发送 API key 或完整托管 MCP URL。

也只读查看了 **PDAT（proprietary/private repo）**。本轮选出的公开材料是
[通用来源契约和新合成样例](https://github.com/pengpengyi92/dsh-quant/tree/master/plugin/data/source-contract)，
不是私有源码镜像：不复制内部采集器、客户/策略、日志、凭据或第三方真实数据。

## What to share / 怎么参与

在本帖回复项目链接与一个具体用例即可；需要收录/实现跟踪时沿用
[Issue #2](https://github.com/pengpengyi92/dsh-quant/issues/2)。FICC 专题仍用
[#152](https://github.com/pengpengyi92/dsh-quant/issues/152) 和
[#151](https://github.com/pengpengyi92/dsh-quant/discussions/151)，不再造平行投稿队列。

```text
Primary repo/docs; author/affiliation:
Role: original source | SDK | MCP/DSH plugin | quality/storage/ETL
One concrete use + what is new beyond existing entries:
Markets/data types; batch/snapshot/stream:
Account/key/fee/quota, or unknown:
Code license; permitted data use/redistribution:
Version + actual command/result, or NOT_RUN:
Timestamps/revisions/units/adjustment + known failure:
```

自己的项目、第三方资源、小型教学例子和失败复盘都欢迎。不要提交未经许可的数据、
密钥、客户资料、私有持仓或策略。代码许可、技术可访问和数据再分发权分别核验。

## Collaboration and review

我们按 `source/rights review -> scoped issue/PR -> tests/CI -> merge -> credit`
推进。收录不等于集成，凭据就绪不等于 API 实测，不为未知模型/权限问题硬贴新人
标签。已经整理好的新人任务仍见 [#162](https://github.com/pengpengyi92/dsh-quant/discussions/162)。

Thanks to upstream maintainers and everyone who shares a reproducible example,
limitation or correction. We appreciate your time, give specific review feedback,
preserve attribution and thank contributors after accepted merges. Keep going;
we welcome continued collaboration, without lowering the review standard.
