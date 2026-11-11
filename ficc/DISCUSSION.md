欢迎大家把 FICC relevant repo 放到这里！成熟的、naive 的、教学的、实验阶段的都可以。

**这里是集中讨论区**：回复、比较、评分和复现经验放在本帖，每个 repo 一个顶层评论。
**Issue 用于投稿与跟踪**：[征集入口](https://github.com/pengpengyi92/dsh-quant/issues/152)；接受目录 PR，审核后定期合入 FICC 板块。

评分可用 FICC关联度 / 可复现性 / 数值方法 / 文档 / 工程维护五维 0–5 或 N/A；
未运行请写 NOT_RUN，给出版本、命令、结果、限制和利益关联。👍 表示兴趣，不能当质量认证。

---

# FICC · Fixed Income, Currencies & Commodities

欢迎成熟项目、教学项目、naive baseline 和早期想法。这里汇总 FICC 相关的公开代码、
数据入口和研究工程资源；代码许可、数据权限、项目阶段与验证状态分别记录。

- **集中回复 / 评分 / 复现交流**：[FICC Discussion](https://github.com/pengpengyi92/dsh-quant/discussions/151)
- **投稿 / 收录状态**：[长期征集 Issue](https://github.com/pengpengyi92/dsh-quant/issues/152)；也可使用 [投稿模板](https://github.com/pengpengyi92/dsh-quant/issues/new?template=ficc_resource.yml) 或直接 PR。
- **可版本化目录**：[resources.json](https://github.com/pengpengyi92/dsh-quant/blob/master/ficc/resources.json)；[投稿、评分与每周收录规则](https://github.com/pengpengyi92/dsh-quant/blob/master/ficc/CONTRIBUTING.md)。

本次观察日期 **2026-11-11**，首批 **45 个去重后的仓库引用**，包含
绑定/配套示例；不等同于 45 个独立定价引擎，也不声称穷尽所有 FICC 项目。
全部仅完成 primary repo/README/许可说明核验，**未安装、未运行、未验证数值或数据质量**。
每条的观察日期、原始分类、GitHub archived 标志与已知限制保存在 JSON。

## 从一个具体问题开始

- 债券/信用与定价架构：QuantLib、ORE、Strata、FinancePy；曲线小例子可从 bond_pricing、Nelson–Siegel–Svensson 开始。
- FX 数据/研究/成本：findatapy、finmarketpy、tcapy；先明确货币对、报价方向、时区、bid/ask 与数据权限。
- 商品期货：pysystemtrade、vn.py、NautilusTrader、LEAN；先明确主力/连续合约、换月、乘数与交易日历。
- 宏观/利率数据：fredapi、SDMX、AKShare；先核对发布时间、vintage/revision、期限、单位和授权。
- 电力商品邻接研究：GridStatus、PyPSA、oemof-solph；能源系统优化不能直接视为可交易收益证据。

这只是按任务找入口的导航，未给项目预填质量分或“生产可用”结论。

## 利率、债券、信用、曲线与约定

| 项目 / primary source | FICC 用途 | 代码许可 | 阶段 / 限制 |
|---|---|---|---|
| [QuantLib](https://github.com/lballabio/QuantLib) · [source](https://github.com/lballabio/QuantLib/blob/master/README.md) | C++ instrument/pricer framework: bonds, CDS, inflation products, OIS, swaps, swaptions and FX forwards. | BSD-3-Clause (README; GitHub SPDX NOASSERTION) | REFERENCE_LIBRARY — BSD-style terms are in LICENSE.TXT; API SPDX detection is NOASSERTION. Readme badge names BSD-3-Clause. Not executed. |
| [QuantLib language bindings](https://github.com/lballabio/QuantLib-SWIG) · [source](https://github.com/lballabio/QuantLib-SWIG/blob/master/README.md) | Official QuantLib SWIG bindings for Python, C#, Java, Scala and R; same analytics family as QuantLib. | BSD-3-Clause-style (LICENSE.TXT; GitHub SPDX NOASSERTION) | BINDINGS — Bindings, not an independent pricing engine. Match the binding and native QuantLib versions. |
| [Open Source Risk Engine](https://github.com/OpenSourceRisk/Engine) · [source](https://github.com/OpenSourceRisk/Engine/blob/master/README.md) | QuantLib-based pricing, simulation, risk analytics and XVA with trade/market/configuration interfaces and examples. | BSD-3-Clause-style / Modified BSD (README; GitHub SPDX NOASSERTION) | REFERENCE_LIBRARY — Source documents validation/training uses; no local model validation or market calibration performed. |
| [ORE language bindings](https://github.com/OpenSourceRisk/ORE-SWIG) · [source](https://github.com/OpenSourceRisk/ORE-SWIG/blob/master/README.md) | Bindings for QuantExt, OREData and OREAnalytics; permits Python and other languages to access the ORE family. | BSD-3-Clause-style (LICENSE.txt; GitHub SPDX NOASSERTION) | BINDINGS — Separate wrapper repo; build documentation depends on a compatible ORE release. Last push 2024; current compatibility untested. |
| [Strata](https://github.com/tradingtechnologies/Strata) · [source](https://github.com/tradingtechnologies/Strata/blob/main/README.md) | Java market analytics and risk library; product source includes bonds, credit, deposits, FRA, FX/FX options, swaps, swaptions and cap/floor modules. | Apache-2.0 | REFERENCE_LIBRARY — Canonical repo transferred from OpenGamma/Strata, same GitHub repository ID 20882897. README retains historical OpenGamma links. |
| [finmath lib](https://github.com/finmath/finmath-lib) · [source](https://github.com/finmath/finmath-lib/blob/main/README.md) | Java multi-curve valuation/calibration, OIS and cross-currency products, bonds, CDS, SABR, Hull-White and forward-rate Monte Carlo. | Apache-2.0 | REFERENCE_LIBRARY — Default branch is main (renamed 2025-10-12). No numeric benchmarks reproduced. |
| [FinancePy](https://github.com/domokane/FinancePy) · [source](https://github.com/domokane/FinancePy/blob/master/README.md) | Inspectable Python/Numba implementations for fixed-income, FX and credit derivative pricing and risk management. | GPL-3.0-or-later (README); GitHub SPDX GPL-3.0 | REFERENCE_LIBRARY — GPL obligations and financial conventions need review before integration; no calculation verification claimed. |
| [bond_pricing](https://github.com/jrvarma/bond_pricing) · [source](https://github.com/jrvarma/bond_pricing/blob/master/README.md) | Python bond price/YTM, accrued interest, duration and zero-curve construction, plus NPV/IRR and compounding conversions. | GPL-3.0 | FOCUSED_LIBRARY — Small, targeted bond calculations; optional SciPy fallback changes numerical algorithms and must be accounted for in replication. |
| [Nelson-Siegel-Svensson](https://github.com/luphord/nelson_siegel_svensson) · [source](https://github.com/luphord/nelson_siegel_svensson/blob/master/README.rst) | Python Nelson-Siegel and Nelson-Siegel-Svensson zero/forward curves and OLS/nonlinear calibration. | MIT | FOCUSED_LIBRARY — Last push 2023. Narrow reference implementation; no current Python-version or optimizer regression tests were run. |
| [yieldcurves](https://github.com/sonntagsgesicht/yieldcurves) · [source](https://github.com/sonntagsgesicht/yieldcurves/blob/master/README.rst) | Python yield curves, interpolation, compounding, discount factors and FX-related curve methods. | Apache-2.0 | FOCUSED_LIBRARY — Last push 2024. Verify curve/date conventions and current dependencies before adapter work. |
| [dcf](https://github.com/sonntagsgesicht/dcf) · [source](https://github.com/sonntagsgesicht/dcf/blob/master/README.rst) | Python discounted-cashflow and payment-leg construction for loans and banking instruments. | Apache-2.0 | FOCUSED_LIBRARY — Cashflow toolkit, not market data. Last push 2025; no current build run. |
| [businessdate](https://github.com/sonntagsgesicht/businessdate) · [source](https://github.com/sonntagsgesicht/businessdate/blob/master/README.rst) | Python business dates, holiday adjustments, day-count year fractions and payment schedule generation. | Apache-2.0 | FOCUSED_LIBRARY — Infrastructure for loan/derivative schedules. Calendar coverage and day-count edge cases require case-specific testing. |

## 跨资产衍生品、数值方法与风险

| 项目 / primary source | FICC 用途 | 代码许可 | 阶段 / 限制 |
|---|---|---|---|
| [GS Quant](https://github.com/goldmansachs/gs-quant) · [source](https://github.com/goldmansachs/gs-quant/blob/master/README.md) | Python toolkit for derivatives, risk, structuring and cross-asset analytics; useful for studying FICC workflows and instrument interfaces. | Apache-2.0 | REFERENCE_LIBRARY — Source code is open; README says API access requires institutional client ID/secret. Do not imply data/API access is free or bundled. |
| [FinancialToolbox.jl](https://github.com/rcalxrc08/FinancialToolbox.jl) · [source](https://github.com/rcalxrc08/FinancialToolbox.jl/blob/master/README.md) | Julia Black/Black-Scholes pricing, Greeks, implied volatility and day-count functions, including generic numeric/AD types. | MIT (LICENSE.md); GitHub SPDX NOASSERTION | FOCUSED_LIBRARY — General options numerics relevant to FICC derivatives; not a full fixed-income curve/contract system. |
| [PyFENG](https://github.com/quants-net/PyFENG) · [source](https://github.com/quants-net/PyFENG/blob/main/README.md) | Academic Python reference models including Bachelier, SABR, stochastic volatility, Greeks and implied volatility. | GPL-2.0 | RESEARCH_LIBRARY — Canonical repo transferred from PyFE/pyfeng, same ID 342517882. README explicitly targets academic use; no production readiness claim. |

## FX 研究、数据与交易成本分析

| 项目 / primary source | FICC 用途 | 代码许可 | 阶段 / 限制 |
|---|---|---|---|
| [finmarketpy](https://github.com/cuemacro/finmarketpy) · [source](https://github.com/cuemacro/finmarketpy/blob/master/README.md) | FX spot/forward/option 总回报、波动率曲面、事件研究与黄金/外汇季节性示例。 | Apache-2.0 | Research library / source reviewed — Examples can depend on findatapy/FinancePy and licensed vendor inputs; tutorials and historical charts do not prove profitability. |
| [findatapy](https://github.com/cuemacro/findatapy) · [source](https://github.com/cuemacro/findatapy/blob/master/README.md) | 面向 FX 的多来源数据封装，README 展示 AUDJPY、bid/ask tick、FRED/ALFRED 以及订阅数据接口。 | Apache-2.0 | Data access library / source reviewed — Bloomberg/Eikon and other providers require separate licenses; public downloads retain source-specific conditions. |
| [tcapy](https://github.com/cuemacro/tcapy) · [source](https://github.com/cuemacro/tcapy/blob/master/README.md) | FX spot 成交成本分析，包含订单/成交、基准价、滑点和合成交叉汇率参考。 | Apache-2.0 | Research library / source reviewed — README currently scopes supported order/trade data to FX spot; do not generalize to all asset classes. Last repository push observed in 2024. |
| [oandapyV20](https://github.com/hootnot/oanda-api-v20) · [source](https://github.com/hootnot/oanda-api-v20/blob/master/README.rst) | 第三方 OANDA REST v20 Python wrapper，便于研究 FX 行情/账户/订单 API 结构。 | MIT | Third-party adapter / historical — README identifies a personal project, not an official OANDA SDK. Credentials, regional availability and service terms apply; no order sent and no API session tested. |

## 商品期货、执行研究、能源基本面与数据工程

| 项目 / primary source | FICC 用途 | 代码许可 | 阶段 / 限制 |
|---|---|---|---|
| [VeighNa / vn.py](https://github.com/vnpy/vnpy) · [source](https://github.com/vnpy/vnpy/blob/master/README.md) | 国内外期货、期权接口和 CTA/组合研究框架，提供合约、行情、回测和执行工程参考。 | MIT | Framework / source reviewed — Gateways and data vendors may have separate dependencies, licenses, accounts and permissions. Listing is not live-trading validation. |
| [NautilusTrader](https://github.com/nautechsystems/nautilus_trader) · [source](https://github.com/nautechsystems/nautilus_trader/blob/develop/README.md) | Rust/Python 事件驱动研究与执行框架；README 明确包含 FX、期货、期权以及订单簿回放。 | LGPL-3.0 | Framework / source reviewed — Adapter-specific asset coverage, account/data rights and exact release behavior require independent tests. |
| [pysystemtrade](https://github.com/pst-group/pysystemtrade) · [source](https://github.com/pst-group/pysystemtrade/blob/develop/README.md) | 系统化期货交易研究、组合配置、合约数据和 Interactive Brokers 工作流参考。 | GPL-3.0 | Framework / source reviewed — Historical robcarver17/pysystemtrade moved to pst-group in January 2026 per README; repository ID 46975254 preserved. No strategy performance claim or broker session validated. |
| [QuantConnect LEAN](https://github.com/QuantConnect/Lean) · [source](https://github.com/QuantConnect/Lean/blob/master/Algorithm.Python/BasicTemplateFuturesAlgorithm.py) | 多资产事件驱动引擎，官方样例包括外汇和期货链/到期筛选，可学习跨资产回测契约。 | Apache-2.0 | Framework / source reviewed — Also checked BasicTemplateForexAlgorithm.py. Data purchases, broker connections, cloud services and derivative data rights are separate. |
| [backtrader](https://github.com/mementum/backtrader) · [source](https://github.com/mementum/backtrader/blob/master/README.rst) | 通用事件驱动回测框架包含 futures-like 保证金现金调整、佣金/滑点和历史 OANDA 接口。 | GPL-3.0 | Framework / legacy integrations — Many integrations and examples are historical; package compatibility and fill models require retesting. |
| [gridstatus](https://github.com/gridstatus/gridstatus) · [source](https://github.com/gridstatus/gridstatus/blob/main/README.md) | 北美电力 ISO/RTO 与 EIA 的负荷、燃料结构、LMP、辅助服务等，为能源商品基本面提供入口。 | BSD-3-Clause | Energy data library / source reviewed — Open-source direct-source client differs from paid hosted API. Some sources require credentials; ISO-local time, DST, retention and data terms need explicit handling. |
| [PyPSA](https://github.com/PyPSA/PyPSA) · [source](https://github.com/PyPSA/PyPSA/blob/master/README.md) | 电力/能源系统调度、储能和部门耦合优化，可作为电力商品基本面研究的邻接工具。 | MIT (code); CC-BY-4.0 (documentation) | Energy-system model / adjacent to FICC — Not a derivatives pricer or trading system. Perfect-foresight optimization examples must not be interpreted as realistic historical trading tests; solver licenses are separate. |
| [oemof.solph](https://github.com/oemof/oemof-solph) · [source](https://github.com/oemof/oemof-solph/blob/dev/README.rst) | 能源系统 LP/MILP 优化模型生成器，适合研究供需、储能和能源转换约束。 | MIT (README SPDX declaration) | Energy-system model / adjacent to FICC — Repository license API field absent; README SPDX says MIT. It is an adjacent fundamentals model, not an exchange-price forecaster or derivative trading framework. Solvers require separate installation/terms. |
| [Databento Python](https://github.com/databento/databento-python) · [source](https://github.com/databento/databento-python/blob/main/README.md) | 官方历史/实时市场数据客户端，包含期货换月 smart symbology 与多种市场数据 schema。 | Apache-2.0 | Official client / service separate — SDK source is open; data plans, exchange entitlements, credentials and redistribution restrictions are separate. No paid or authenticated download executed. |
| [Databento Binary Encoding (DBN)](https://github.com/databento/dbn) · [source](https://github.com/databento/dbn/blob/main/README.md) | 市场数据消息编码、存储和 CLI/Python/Rust 工具，可用于期货逐笔/订单簿管道设计。 | Apache-2.0 | Data format/library / source reviewed — A message format/tool, not a free data source. Source and dataset licenses are independent. |

## 宏观、央行及跨资产数据

| 项目 / primary source | FICC 用途 | 代码许可 | 阶段 / 限制 |
|---|---|---|---|
| [OpenBB Open Data Platform](https://github.com/openbq-org/OpenBB) · [source](https://github.com/openbq-org/OpenBB/tree/develop/openbb_platform/extensions) | 固定收益、外汇、商品和经济数据扩展；适合构建 FICC 研究的数据接入层。 | Apache-2.0 | Framework / source reviewed — Canonical repository ID 323048702; historical OpenBB-finance/OpenBB redirects here. LICENSE explicitly declares Apache-2.0 although GitHub SPDX detection says NOASSERTION. Individual providers retain their own credentials, subscriptions and data rights. |
| [AKShare](https://github.com/akfamily/akshare) · [source](https://github.com/akfamily/akshare/tree/main/akshare) | 公开财经接口覆盖债券、期货、外汇与宏观数据，可作为中国 FICC 数据发现入口。 | MIT | Data interface library / source reviewed — Code license does not grant redistribution rights to upstream data; availability and source schemas were not tested. |
| [TuShare / TuShare Pro SDK](https://github.com/waditu/tushare) · [source](https://github.com/waditu/tushare) | 官方 Pro 文档提供期货合约、日线、主连续映射以及外汇/债券接口；可研究交割、持仓和连续合约数据。 | BSD-3-Clause | SDK + separate data service / source reviewed — Use official service documentation for coverage, not the stock-focused legacy README. Token, points and endpoint permissions apply; no authenticated request made. Low code push frequency does not imply the data service stopped updating. |
| [fredapi](https://github.com/mortada/fredapi) · [source](https://github.com/mortada/fredapi/blob/master/README.md) | FRED/ALFRED Python 接口及 vintage/as-of 查询，可支持利率/宏观研究和数据修订控制。 | Apache-2.0 | Data client / source reviewed — FRED key is required; series-specific rights and release timestamps remain separate. Vintage support alone does not prove a backtest is free from look-ahead. |
| [sdmx1](https://github.com/khaeru/sdmx) · [source](https://github.com/khaeru/sdmx/blob/main/README.rst) | SDMX 2.1/3.0 数据与元数据客户端，支持央行、国际组织和统计机构数据源。 | Apache-2.0 | Standards/client library / source reviewed — Fork lineage to pandaSDMX is documented. Endpoint availability and code mappings are provider-specific and untested. |
| [pandaSDMX](https://github.com/dr-leo/pandaSDMX) · [source](https://github.com/dr-leo/pandaSDMX/blob/master/README.rst) | SDMX 数据/元数据工具，README 列出 BIS、ECB、OECD 等 FICC 相关宏观提供方。 | Apache-2.0 | Standards/client library / older code line — Last repository push observed in 2023; sdmx1 is a related fork, not a renamed identical project. No live endpoint check. |
| [pandas-datareader](https://github.com/pydata/pandas-datareader) · [source](https://github.com/pydata/pandas-datareader/blob/main/README.md) | pandas 宏观/政策数据访问，README 展示 FRED GS10 并列出 Bank of Canada、World Bank、OECD 等。 | BSD-3-Clause | Data client / source reviewed — GitHub API returns NOASSERTION; LICENSE.md contains the 3-clause BSD text. Source-specific availability and licenses apply. |
| [yfinance](https://github.com/ranaroussi/yfinance) · [source](https://github.com/ranaroussi/yfinance/blob/main/yfinance/domain/market.py) | 第三方 Yahoo 数据工具的 market 模块明确提供 RATES、COMMODITIES、CURRENCIES 分类，可用于探索性数据发现。 | Apache-2.0 | Unofficial data client / exploratory — README states Yahoo Finance API data is intended for personal use only. Do not assume commercial use, redistributable data, tick accuracy or institutional coverage. |

## 教学、naive baseline 与历史研究参考

| 项目 / primary source | FICC 用途 | 代码许可 | 阶段 / 限制 |
|---|---|---|---|
| [finmath experiments](https://github.com/finmath/finmath-experiments) · [source](https://github.com/finmath/finmath-experiments/blob/main/README.md) | Examples and experiments using finmath; useful for curve calibration and interest-rate-model learning rather than independent vendor analytics. | Apache-2.0 | LEARNING_EXAMPLES — Companion of finmath-lib; not counted as an independent numerical engine. |
| [TF Quant Finance](https://github.com/google/tf-quant-finance) · [source](https://github.com/google/tf-quant-finance/blob/master/README.md) | TensorFlow numerical finance reference with rate-curve construction, Hull-White, SABR and calibration examples. | Apache-2.0 | LEGACY_RESEARCH — README explicitly says ARCHIVED/no longer maintained, even though GitHub archived flag was false at observation. Use as legacy research/reference. |
| [QuantLib.jl (original)](https://github.com/pazzo83/QuantLib.jl) · [source](https://github.com/pazzo83/QuantLib.jl/blob/master/README.md) | Pure Julia alpha implementation with bonds, swaps, swaptions, partial CDS, short-rate models and yield/default curves. | MIT (LICENSE.md); GitHub SPDX NOASSERTION | LEGACY_RESEARCH — README calls it alpha; original repo last push 2020. JuliaQuant/QuantLib.jl is a fork, omitted as duplicate. Not official C++ QuantLib bindings. |
| [QSForex](https://github.com/mhallsmoore/qsforex) · [source](https://github.com/mhallsmoore/qsforex/blob/master/README.md) | QuantStart 外汇交易日记配套的 alpha 阶段事件驱动/点差回测项目，适合学习和讨论原型。 | MIT (declared in README; GitHub license field absent) | Educational / alpha / historical — README explicitly calls it alpha; last push observed in 2022. Historical OANDA integration may need substantial updating; standalone license detection missing. Do not treat as a production recommendation. |
| [forex-python](https://github.com/MicroPyramid/forex-python) · [source](https://github.com/MicroPyramid/forex-python/blob/master/README.md) | 简单汇率与币种换算 API，适合作为入门/小型 FX 数据处理示例。 | MIT | Small utility / source reviewed — Daily reference-rate utility, not tick/executable quotes; external rates service was not contacted. README endpoint naming is historical. |
| [Rates Bond Quant](https://github.com/pengpengyi92/rates-bond-quant) · [source](https://github.com/pengpengyi92/rates-bond-quant/blob/master/README.md) | 维护者自己的教学项目：简化债券现金流、价格、久期、凸性、利率冲击与多期限比较，附 Python/FastAPI/Next.js 界面。 | MIT | LEARNING_EXAMPLES — Maintainer-owned project, disclosed. Earlier ficc-rates-bond-quant URL redirects here. Educational reconstruction; no production or live trading claim, and this catalog update did not rerun its tests. |

## 单独标识：source-available / 许可待确认

| 项目 / primary source | FICC 用途 | 代码许可 | 阶段 / 限制 |
|---|---|---|---|
| [isda_daycounters](https://github.com/miradulo/isda_daycounters) · [source](https://github.com/miradulo/isda_daycounters/blob/master/README.md) | Minimal Python day-count collection covering Actual/360, Actual/365, Actual/Actual and several 30/360 variants. | UNKNOWN / no license file found in root | LEARNING_LICENSE_UNRESOLVED — Last push 2020. Treat as a public code reference pending license clarification; not approved for reuse/distribution. |
| [Rateslib](https://github.com/attack68/rateslib) · [source](https://github.com/attack68/rateslib/blob/main/README.md) | Fixed-income analysis for bonds/futures, IRS, cross-currency and FX swaps, curve solving and AD risk sensitivities. | CUSTOM: Source-Available Non-Commercial + Commercial Subscription | SOURCE_AVAILABLE — README explicitly states NOT open source. Commercial use requires a paid license. Keep outside the OSI-open-source subset. |

## 已有 FICC 讨论与本仓库工具

这些是历史教学/研究讨论，独立于这次 repo 目录收录，不把旧帖内容当作新的数值验收。

- [利率债 #124](https://github.com/pengpengyi92/dsh-quant/discussions/124) · [信用债 #125](https://github.com/pengpengyi92/dsh-quant/discussions/125)
- [FX #126](https://github.com/pengpengyi92/dsh-quant/discussions/126) · [贵金属 #127](https://github.com/pengpengyi92/dsh-quant/discussions/127)
- [宏观框架 #128](https://github.com/pengpengyi92/dsh-quant/discussions/128) · [Rates Bond Quant 联动 #129](https://github.com/pengpengyi92/dsh-quant/discussions/129)
- [已有 quant_bond 工具的历史公告 #14](https://github.com/pengpengyi92/dsh-quant/issues/14)

本仓库已有 [quant_bond](https://github.com/pengpengyi92/dsh-quant/blob/master/src/dsh-risk/bond.ts) 的债券价格/YTM、久期、凸性、DV01 教学方法，
以及数据渠道知识库中的 ChinaBond、CFETS 等引用。本次没有新增 FICC 定价工具或自动交易功能。

投稿巡检已安排每周一 09:30（Asia/Shanghai）的 Codex 线程跟进；运行依赖客户端与连接可用。
巡检发现新内容后仍需 review/CI 通过再合入，未配置无人值守自动 merge。

## 收录与验证边界

- 原仓库/官方文档是来源；收录不代表作者背书、dsh 插件兼容、模型验证或已完成集成。
- source-available、许可未知、历史/archived 项目都有明确标签；请按具体代码版本核对许可。
- SDK 开源不代表市场数据免费；商业 API、交易所授权、凭据、服务条款和再分发权单独确认。
- 学习实验也欢迎。定价比较至少固定曲线、日计数、日历、复利、结算、clean/dirty、单位及已知答案；
  回测须核对无未来函数、数据修订、换月、bid/ask、费用和风险。
- 每个 repo 在 Discussion 留一个顶层评论，回复、评分和争议都放在它的回复下。
  投稿 Issue 只跟踪 submitted → needs-info/reviewed → PR → merged → credited。
- 每周批量检查、review 后合入；无人值守 merge 尚未配置。未运行的数值可靠性评分填 N/A。

目录由 `resources.json` 生成。修改数据后运行 `node scripts/ficc-catalog.mjs --write`，
再运行 `npm run test:ficc`；生成器离线运行，不访问或修改 GitHub。
