# dsh-quant / Data Visualization and Research Reporting

Title/time: Visualization and backtest-reporting study / 2026-11-14T16:07:00.651+08:00 (Asia/Shanghai).
Profile: quant. 12 selected primary-source references, not an exhaustive inventory or ranking.

Data负责来源、schema、时钟、缺失和质量；可视化横跨Data与研究报告。回测引擎属于研究/策略模块，绩效图只是它的输出视图，不把画得好看等同于策略正确。

## 方法与验收

| 层面 | 方法 | 核对什么 |
|---|---|---|
| 行情/质量 | K线、成交量、SMA、缺失/冻结/延迟条带 | 保留UTC和单位；未收盘/缺失点不补成0，不让折线跨越null。 |
| 回测结果 | gross/net/benchmark净值、成交点、回撤/恢复、换手/费用 | 成交时点与价格对账，先检查cash+position=value；收益与回撤同时看。 |
| 研究诊断 | IC/分位组/rolling指标、样本分割、成本敏感度 | OOS/PIT/费用协议先定，图形不能证明alpha；未测项标UNMEASURED。 |
| 数据治理 | 覆盖热图、revision/arrival时间线、source lineage | event/publication/observation分开；权利不明的源不进入公开图。 |

## 12个项目与固定源码入口

All third-party entries: **REFERENCE_ONLY / NOT_RUN**. No code/data copied, installed or executed from these12 projects.

| 项目 | 角色 | pinned代码许可观察 | 用途/限制 | 实际核验的代码入口 |
|---|---|---|---|---|
| [matplotlib/matplotlib](https://github.com/matplotlib/matplotlib) | static-scientific | 未自动识别，见人工复核 | 静态科研/曲线图；审查component/font许可 | [lib/matplotlib/pyplot.py](https://github.com/matplotlib/matplotlib/blob/0e56caa4c321f137bc526c2715453a55181f9cfa/lib/matplotlib/pyplot.py) |
| [plotly/plotly.py](https://github.com/plotly/plotly.py) | interactive-statistical | MIT | 交互统计/财务图；区分开源库与托管付费产品 | [plotly/express/_chart_types.py](https://github.com/plotly/plotly.py/blob/3c1aeba0a90ef6f7a32fd35a48338ef7ee349d93/plotly/express/_chart_types.py) |
| [vega/altair](https://github.com/vega/altair) | declarative-grammar | BSD-3-Clause | 声明式grammar、selection、spec可复核 | [altair/vegalite/v6/api.py](https://github.com/vega/altair/blob/9029f1f4c32f3054fae314100361a3563801d562/altair/vegalite/v6/api.py) |
| [holoviz/holoviews](https://github.com/holoviz/holoviews) | linked-data-views | BSD-3-Clause | 数据对象/linked views与多backend边界 | [holoviews/plotting/plot.py](https://github.com/holoviz/holoviews/blob/06928baf481fc61d6ab1b4affe0f991857fd445d/holoviews/plotting/plot.py) |
| [holoviz/datashader](https://github.com/holoviz/datashader) | large-data-rasterization | BSD-3-Clause | 大数据栅格聚合；不能隐藏尾部/极值 | [datashader/core.py](https://github.com/holoviz/datashader/blob/169e4badd28381abc9100e5c1d724134159fd748/datashader/core.py) |
| [perspective-dev/perspective](https://github.com/perspective-dev/perspective) | streaming-pivot-ui | Apache-2.0 | 流式表格、pivot和浏览器WASM/服务端边界 | [rust/perspective-viewer/src/rust/lib.rs](https://github.com/perspective-dev/perspective/blob/56038acfb5be1ba29d2a325f5f70567a8fa3d290/rust/perspective-viewer/src/rust/lib.rs) |
| [tradingview/lightweight-charts](https://github.com/tradingview/lightweight-charts) | financial-canvas | Apache-2.0 | 网页金融K线；NOTICE/归因链接要求 | [src/api/create-chart.ts](https://github.com/tradingview/lightweight-charts/blob/aebdfc8f0d85b95e43467ae79516753158d60e61/src/api/create-chart.ts) |
| [matplotlib/mplfinance](https://github.com/matplotlib/mplfinance) | ohlcv-static | 未自动识别，见人工复核 | 静态OHLCV面板；许可文本需单独复核 | [src/mplfinance/plotting.py](https://github.com/matplotlib/mplfinance/blob/493811dac9a203de7ec148fb95504e7d3f400ba5/src/mplfinance/plotting.py) |
| [bokeh/bokeh](https://github.com/bokeh/bokeh) | interactive-browser | BSD-3-Clause | 交互浏览器/服务端视图；部署鉴权另审 | [src/bokeh/plotting/_figure.py](https://github.com/bokeh/bokeh/blob/1ad3b4fda2a6c14ded93644ab7adcab9ab458e1c/src/bokeh/plotting/_figure.py) |
| [ranaroussi/quantstats](https://github.com/ranaroussi/quantstats) | performance-tearsheet | Apache-2.0 | 收益/风险tear sheet；指标/频率/benchmark另核对 | [quantstats/plots.py](https://github.com/ranaroussi/quantstats/blob/d1a214fb906e76f974f45cdccf923b601c67a756/quantstats/plots.py) |
| [stefan-jansen/pyfolio-reloaded](https://github.com/stefan-jansen/pyfolio-reloaded) | performance-risk-analysis | Apache-2.0 | 绩效、风险与交易分析；输入/成本/年化假设另核对 | [src/pyfolio/tears.py](https://github.com/stefan-jansen/pyfolio-reloaded/blob/7015d68772f4d16a9ad7e01d6787ab4f993d7eef/src/pyfolio/tears.py) |
| [kernc/backtesting.py](https://github.com/kernc/backtesting.py) | backtest-engine-and-plot | AGPL-3.0 | 回测引擎+图；AGPL参考，不并入MIT运行时 | [backtesting/backtesting.py](https://github.com/kernc/backtesting.py/blob/ca2e2611621e472542ba90f7243a1fa06a7d7108/backtesting/backtesting.py) |

[完整commit/license path/blob证据](sources-2026-11-14.json) · [独立人工复核](manual-review-2026-11-14.json)。
Perspective原finos URL已重定向至perspective-dev；保留请求名与实际canonical名称，不声称旧机构关系。
Matplotlib/mplfinance的自动许可字段仍为null；人工记录只说明读到的具体协议，不伪装自动SPDX结果。
Lightweight Charts需要核对Apache-2.0与NOTICE/TradingView归因链接；它不是另一个专有Advanced Charts产品。
Backtesting.py为AGPL-3.0，不能因收录就复制/并入MIT应用；任何复用另做兼容/notice审核。
代码许可不授予行情、持仓、客户或模型数据权利。图形/第三方托管服务也不能替代源数据许可。

## 建议路线与实验

先复用现有ChartData契约和自有离线SVG；网页金融K线再评估Lightweight Charts；Python报告先评估Matplotlib/Plotly，绩效tear sheet再比较QuantStats/Pyfolio。不要一次安装12个库。

可证伪问题：同一固定数据/UTC窗口/null/单位契约，显示是否与原始数组及手算账本一致？再测渲染耗时、文件体积、峰值内存与交互延迟。
Baseline为现有显示契约/固定合成输入；第三方速度、内存、适配度和金融正确性**UNMEASURED**。
固定样本、缺失/极值/单位反例、环境/代码版本、实际命令、结果与代价，再决定集成，不凭品牌比较。

## 已运行与未运行的边界

[dsh-quant自有离线画图示例](https://github.com/pengpengyi92/dsh-quant/tree/master/demos/data-visualization)
使用80根全新合成K线、手工指定成交及可手算账本，展示均线、成交点、净值和回撤。
这不是12个上游库的复现，也不是市场/策略表现。可视化对账另发现
[现有MA回测平仓现金问题 #166](https://github.com/pengpengyi92/dsh-quant/issues/166)，尚未在本次修复；
不把该引擎的错误结果当作已验证绩效图。截图、目录测试和精美图表都不等于会计/金融正确性。

## 共建

欢迎分享可复现data plugin、renderer adapter、图表/性能反例或改进。提供title、带时区timestamp、
来源/许可、schema/时间/单位、命令/结果或NOT_RUN，以及一个负对照。不要上传私有原始数据、密钥或持仓。
Thanks for the collaboration; upstream credit, constructive review, source/privacy checks and tests still gate accepted PRs.

Source evidence curated in [dsh-quant](https://github.com/pengpengyi92/dsh-quant/tree/master/docs/data-visualization).
This profile is an independently authored reading route, not private-project export or an affiliation claim.
