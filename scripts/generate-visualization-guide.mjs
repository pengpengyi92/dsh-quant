import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const profiles = {
  quant: {
    title: 'dsh-quant / Data Visualization and Research Reporting',
    purpose: 'Data负责来源、schema、时钟、缺失和质量；可视化横跨Data与研究报告。回测引擎属于研究/策略模块，绩效图只是它的输出视图，不把画得好看等同于策略正确。',
    methods: [
      ['行情/质量', 'K线、成交量、SMA、缺失/冻结/延迟条带', '保留UTC和单位；未收盘/缺失点不补成0，不让折线跨越null。'],
      ['回测结果', 'gross/net/benchmark净值、成交点、回撤/恢复、换手/费用', '成交时点与价格对账，先检查cash+position=value；收益与回撤同时看。'],
      ['研究诊断', 'IC/分位组/rolling指标、样本分割、成本敏感度', 'OOS/PIT/费用协议先定，图形不能证明alpha；未测项标UNMEASURED。'],
      ['数据治理', '覆盖热图、revision/arrival时间线、source lineage', 'event/publication/observation分开；权利不明的源不进入公开图。'],
    ],
    route: '先复用现有ChartData契约和自有离线SVG；网页金融K线再评估Lightweight Charts；Python报告先评估Matplotlib/Plotly，绩效tear sheet再比较QuantStats/Pyfolio。不要一次安装12个库。',
    question: '同一固定数据/UTC窗口/null/单位契约，显示是否与原始数组及手算账本一致？再测渲染耗时、文件体积、峰值内存与交互延迟。',
  },
  systems: {
    title: 'P-CSDSAI / Visualization as a Data-System Interface',
    purpose: '本目录从CS/Data/AI系统视角研究schema到编码、查询到视图、浏览器/WASM与服务端的边界。共享公开来源元数据，但问题不同于金融工具排行榜；不改动现有静态安全扫描器或宣称任何第三方运行时安全。',
    methods: [
      ['Typed boundary', 'typed rows -> nullable series -> declarative spec -> renderer', '校验schema/单位/UTC，保留null；不能让JSON序列化悄悄改变数值。'],
      ['Scale/transport', '聚合、列式传输、datashading、增量pivot', '记录聚合损失、极值保留、传输bytes、峰值内存，不以点数/星数推断性能。'],
      ['Interaction', 'selection/linking/hover、streaming update、browser worker', '固定事件序列；测首帧/更新延迟，错误传播与可取消性；全部待独立运行。'],
      ['Verification', 'golden data、SVG/screenshot与可访问性检查', '截图不是数值oracle；对账数据、刻度、标签、缺口和降采样语义。'],
    ],
    route: 'Altair用于grammar/spec边界，Perspective用于增量表/浏览器WASM，Datashader用于大样本聚合；Matplotlib/Plotly/Bokeh作显示层对照。外部库本轮未安装/执行，不把目录校验当性能或安全认证。',
    question: '固定synthetic10k/100k数据和相同过滤/聚合任务，能否保留缺失和极值并降低传输或渲染成本？这是后续可证伪实验，当前UNMEASURED。',
  },
  ficc: {
    title: 'P-Curve / FICC Data Visualization References',
    purpose: '本目录仅新增公开资料/代码入口，不增加曲线方法、校准、bootstrap或实时采集，不搬运PFICC材料，也不修改既有不可变曲线快照。可视化是FICC解释和核对层，不是新定价模型或数据授权。',
    methods: [
      ['横截面曲线', '实际tenor坐标、节点标注、market/observation日期', '0.5Y/1Y/30Y按真实期限定位，不能等间距画索引；单位/币种/约定明确。'],
      ['跨日/变动', '同类曲线叠加、变化bps、tenor-time热图', 'par、issue-YTM、continuous-zero分开；差值先确认quote/rate convention相同。'],
      ['风险图', 'DV01/KRD条形、压力情景、小倍数图', '标方向与单位；图不能授权未批准模型、参数或策略披露。'],
      ['公开归档', 'source/rights/market-date/retrieval-time说明', '只用既有已批准源或合成数据；插值线是视觉引导，不是新增市场报价。'],
    ],
    route: '曲线出版优先现有独立SVG或Matplotlib；需要交互时再评估Plotly/Altair。Perspective/Datashader仅为大表/时间面候选；QuantStats/Pyfolio/Backtesting.py只作绩效报告邻接参考，不视作曲线定价工具。',
    question: '相同已批准snapshot在保留全部native tenors/单位/曲线类型后，图表节点位置与原始输入是否完全一致？第三方渲染速度和金融解释有效性仍UNMEASURED。',
  },
}
const [profile, output] = process.argv.slice(2)
if (!profiles[profile] || !output) throw new Error('usage: node scripts/generate-visualization-guide.mjs quant|systems|ficc OUTPUT_DIRECTORY')
const source = new URL('../docs/data-visualization/sources-2026-11-14.json', import.meta.url)
const manual = new URL('../docs/data-visualization/manual-review-2026-11-14.json', import.meta.url)
const data = JSON.parse(readFileSync(source, 'utf8'))
const p = profiles[profile]
const uses = {
  'matplotlib/matplotlib': '静态科研/曲线图；审查component/font许可', 'plotly/plotly.py': '交互统计/财务图；区分开源库与托管付费产品',
  'vega/altair': '声明式grammar、selection、spec可复核', 'holoviz/holoviews': '数据对象/linked views与多backend边界',
  'holoviz/datashader': '大数据栅格聚合；不能隐藏尾部/极值', 'perspective-dev/perspective': '流式表格、pivot和浏览器WASM/服务端边界',
  'tradingview/lightweight-charts': '网页金融K线；NOTICE/归因链接要求', 'matplotlib/mplfinance': '静态OHLCV面板；许可文本需单独复核',
  'bokeh/bokeh': '交互浏览器/服务端视图；部署鉴权另审', 'ranaroussi/quantstats': '收益/风险tear sheet；指标/频率/benchmark另核对',
  'stefan-jansen/pyfolio-reloaded': '绩效、风险与交易分析；输入/成本/年化假设另核对', 'kernc/backtesting.py': '回测引擎+图；AGPL参考，不并入MIT运行时',
}
const rows = data.records.map(r => `| [${r.repo}](${r.url}) | ${r.role} | ${r.code_license ?? '未自动识别，见人工复核'} | ${uses[r.repo]} | [${r.entry.path}](${r.entry.url}) |`).join('\n')
const methods = p.methods.map(r => `| ${r.join(' | ')} |`).join('\n')
const text = `# ${p.title}

Title/time: Visualization and backtest-reporting study / ${data.reviewed_at} (Asia/Shanghai).
Profile: ${profile}. 12 selected primary-source references, not an exhaustive inventory or ranking.

${p.purpose}

## 方法与验收

| 层面 | 方法 | 核对什么 |
|---|---|---|
${methods}

## 12个项目与固定源码入口

All third-party entries: **REFERENCE_ONLY / NOT_RUN**. No code/data copied, installed or executed from these12 projects.

| 项目 | 角色 | pinned代码许可观察 | 用途/限制 | 实际核验的代码入口 |
|---|---|---|---|---|
${rows}

[完整commit/license path/blob证据](sources-2026-11-14.json) · [独立人工复核](manual-review-2026-11-14.json)。
Perspective原finos URL已重定向至perspective-dev；保留请求名与实际canonical名称，不声称旧机构关系。
Matplotlib/mplfinance的自动许可字段仍为null；人工记录只说明读到的具体协议，不伪装自动SPDX结果。
Lightweight Charts需要核对Apache-2.0与NOTICE/TradingView归因链接；它不是另一个专有Advanced Charts产品。
Backtesting.py为AGPL-3.0，不能因收录就复制/并入MIT应用；任何复用另做兼容/notice审核。
代码许可不授予行情、持仓、客户或模型数据权利。图形/第三方托管服务也不能替代源数据许可。

## 建议路线与实验

${p.route}

可证伪问题：${p.question}
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
`
mkdirSync(resolve(output), { recursive: true })
writeFileSync(resolve(output, 'README.md'), text)
if (resolve(fileURLToPath(source)) !== resolve(output, 'sources-2026-11-14.json')) {
  writeFileSync(resolve(output, 'sources-2026-11-14.json'), readFileSync(source))
  writeFileSync(resolve(output, 'manual-review-2026-11-14.json'), readFileSync(manual))
}
console.log(`Generated ${profile}: ${data.records.length} reference-only entries`)
