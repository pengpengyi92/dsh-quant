/**
 * A 股 / 中国金融数据渠道知识库（零依赖、零网络，随包分发）。
 *
 * 定位（DeepQuant Harness 原则）：本插件不提供数据 API、不为数据付费；
 * 提供的是渠道导航——哪里有什么数据、费用与门槛、怎么接入、教程在哪里，
 * 把数据成本决策权交给用户。
 *
 * 内容来源：官方文档与社区教程调研（2026-08）。
 */

export interface DataChannel {
  /** 渠道标识（英文小写，可查询） */
  name: string
  /** 展示名 */
  displayName: string
  /** 渠道类型 */
  category: 'python-lib' | 'api-platform' | 'terminal' | 'official-exchange' | 'index'
  /** 官网/文档地址 */
  url: string
  /** 费用与门槛 */
  cost: string
  /** 数据类型（用于按类型查询） */
  dataTypes: string[]
  /** 接入步骤（要点式） */
  setup: string[]
  /** 教程/文档链接 */
  tutorialUrls: string[]
  /** 最适合的场景 */
  bestFor: string
  /** 补充说明 */
  notes?: string
}

export const DATA_CHANNELS: DataChannel[] = [
  {
    name: 'akshare',
    displayName: 'AkShare',
    category: 'python-lib',
    url: 'https://akshare.akfamily.xyz',
    cost: '免费，无注册门槛',
    dataTypes: ['行情', '财务', '宏观', '基金', '期货', '期权', '港股', '美股', '加密货币', '新闻'],
    setup: ['pip install akshare', 'import akshare as ak', '调用形如 ak.stock_zh_a_hist(symbol="000001", period="daily")'],
    tutorialUrls: ['https://akshare.akfamily.xyz/data/stock/stock.html'],
    bestFor: '快速免费获取 A 股行情与基础数据（数据接口多为爬虫聚合，注意稳定性与合规）',
    notes: '接口免费但底层多为公开网页聚合；大批量抓取注意频率限制与数据源条款',
  },
  {
    name: 'baostock',
    displayName: 'BaoStock',
    category: 'python-lib',
    url: 'http://baostock.com',
    cost: '免费，免注册',
    dataTypes: ['行情', '日线', '分钟线', '复权因子', '财务', '指数'],
    setup: ['pip install baostock', 'import baostock as bs', 'bs.login() 后 query_history_k_data_plus()'],
    tutorialUrls: ['http://baostock.com/baostock/index.php/Python_API%E6%96%87%E6%A1%A3'],
    bestFor: '回测用历史数据（日线/分钟线 + 复权因子），稳定且结构清晰',
    notes: '数据更新有延迟，实时行情能力弱',
  },
  {
    name: 'tushare',
    displayName: 'Tushare Pro',
    category: 'api-platform',
    url: 'https://tushare.pro',
    cost: '积分制：注册即 120 分（基础数据）；2000 分起解锁高频与部分高级数据；积分可付费购买或贡献获得',
    dataTypes: ['行情', '日线', '分钟线', '财务', '指数', '宏观', '基金', '期货', '期权', '港股', '区块链', '另类数据'],
    setup: ['在 tushare.pro 注册并获取 token', 'pip install tushare', 'pro = ts.pro_api(token)', 'pro.daily(ts_code="000001.SZ")'],
    tutorialUrls: ['https://tushare.pro/document/1?doc_id=27', 'https://tushare.pro/document/2'],
    bestFor: '需要规范化、全品种（含期货/期权/基金）数据的中重度量化用户',
    notes: '各接口有不同积分要求；token 不要提交到代码仓库',
  },
  {
    name: 'wind',
    displayName: 'Wind 万得',
    category: 'terminal',
    url: 'https://www.wind.com.cn',
    cost: '机构付费终端（个人难以直接购买）',
    dataTypes: ['行情', '财务', '宏观', '基金', '债券', '期货', '另类数据', '研究报告'],
    setup: ['需要有 Wind 金融终端账号（机构采购）', 'pip install WindPy', 'from WindPy import w; w.start(); w.wsd(...)'],
    tutorialUrls: ['https://www.wind.com.cn/'],
    bestFor: '机构级全量数据与研报；无账号时无法使用',
    notes: '学校/公司如有 Wind 账号，是 A 股数据质量与广度的事实标准之一',
  },
  {
    name: 'ifind',
    displayName: '同花顺 iFinD',
    category: 'terminal',
    url: 'http://quantapi.10jqka.com.cn',
    cost: '机构付费终端（需账号）',
    dataTypes: ['行情', '财务', '宏观', '基金', '债券', '期货', '研报', '事件'],
    setup: ['需要 iFinD 账号', '使用 THS 系列数据接口（Python/Excel 插件）', '参考 quantapi 帮助中心 API 文档'],
    tutorialUrls: ['http://quantapi.10jqka.com.cn/thsft/iFindService/DataInterfaceWeb/Index/get-File?Marked=863746e5ecd9608b82b406ddbc4fd11a&id=318'],
    bestFor: '有 iFinD 账号的机构用户（同花顺生态）',
  },
  {
    name: 'sse',
    displayName: '上海证券交易所',
    category: 'official-exchange',
    url: 'https://www.sse.com.cn',
    cost: '官网数据免费（部分需注册）',
    dataTypes: ['行情', '公告', '债券', '基金', '指数'],
    setup: ['官网 → 市场数据/披露 栏目', '公告与部分数据可直接浏览下载'],
    tutorialUrls: ['https://www.sse.com.cn/market/'],
    bestFor: '官方公告、债券与指数的一手来源（合规与权威性优先）',
  },
  {
    name: 'szse',
    displayName: '深圳证券交易所',
    category: 'official-exchange',
    url: 'https://www.szse.cn',
    cost: '官网数据免费',
    dataTypes: ['行情', '日线', '公告', '指数', '基金'],
    setup: ['官网 → 数据服务 → 数据下载中心', '日线行情、指数等可下载'],
    tutorialUrls: ['https://www.szse.cn/market/index.html'],
    bestFor: '深市官方数据下载（日线/指数一手来源）',
  },
  {
    name: 'csindex',
    displayName: '中证指数',
    category: 'index',
    url: 'https://www.csindex.com.cn',
    cost: '免费',
    dataTypes: ['指数', '指数行情', '指数成分', '指数公告'],
    setup: ['官网 → 指数中心 → 数据下载', '指数点位、成分权重可查可下'],
    tutorialUrls: ['https://www.csindex.com.cn/'],
    bestFor: '指数数据（编制方案、成分、权重）的官方来源',
  },
]

/** 按渠道名精确查找。 */
export function findChannel(name: string): DataChannel | undefined {
  const lower = name.trim().toLowerCase()
  return DATA_CHANNELS.find(c => c.name === lower || c.displayName.toLowerCase() === lower)
}

export interface GuideMatch {
  channel: DataChannel
  /** 命中原因：渠道名命中或命中的数据类型 */
  matchReason: string
}

/** 按关键词搜索：渠道名/展示名/数据类型/场景描述。返回按渠道名精确度排序的匹配。 */
export function searchChannels(query: string): GuideMatch[] {
  const q = query.trim().toLowerCase()
  if (q === '') return DATA_CHANNELS.map(c => ({ channel: c, matchReason: 'all channels' }))
  const results: GuideMatch[] = []
  for (const c of DATA_CHANNELS) {
    if (c.name.toLowerCase().includes(q) || c.displayName.toLowerCase().includes(q)) {
      results.push({ channel: c, matchReason: `channel name matches "${query}"` })
      continue
    }
    const hitTypes = c.dataTypes.filter(t => t.includes(q) || q.includes(t))
    if (hitTypes.length > 0) {
      results.push({ channel: c, matchReason: `data types: ${hitTypes.join(', ')}` })
      continue
    }
    if (c.bestFor.toLowerCase().includes(q) || c.cost.toLowerCase().includes(q)) {
      results.push({ channel: c, matchReason: `description matches "${query}"` })
    }
  }
  return results
}
