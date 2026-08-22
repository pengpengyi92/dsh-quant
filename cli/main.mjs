#!/usr/bin/env node
/**
 * dsh-quant CLI — Everything-Plugin Quant OS 的命令行界面（零依赖）。
 *
 * 与 presearch CLI 同哲学：纯 Node + ANSI 转义，可读的"TUI 质感"输出。
 * 首期三个栏目，全部离线可读：
 *
 *   dsh-quant repo                      46 工具仓库（6 大领域分组）
 *   dsh-quant repo <firm>               机构开源仓库档案（quant-repo/）
 *   dsh-quant history                   机构档案索引（quant-history/ 53 家）
 *   dsh-quant history <firm>            某家机构档案（markdown → 可读渲染）
 *   dsh-quant history --reports         四大研究报告（ANALYSIS/TIMELINE/LINEAGE/BANK_LINEAGE）
 *   dsh-quant history --search <关键词> 跨档案全文检索
 *   dsh-quant kline <symbol>            行情历史：彩色 OHLC 表 + 统计
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { fetchKlines } from '../lib/dsh-data/market.js'
import { seriesStats } from '../lib/dsh-data/stats.js'
import { dataQualityReport } from '../lib/dsh-data/quality.js'
import { channelAccessGuide, accessReadiness } from '../lib/dsh-data/data-guide.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const HISTORY_DIR = join(ROOT, 'quant-history')
const REPO_DIR = join(ROOT, 'quant-repo')
const UPSTREAM_DIR = join(ROOT, 'quant-upstream')

// ---------- ANSI helpers ----------
const A = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', magenta: '\x1b[35m',
}
const paint = (color, text) => `${A[color]}${text}${A.reset}`

// ---------- markdown → 可读渲染（档案子集：#/##/###、表格、列表、引用、加粗） ----------
function renderMd(md) {
  const lines = md.split('\n')
  const out = []
  for (const raw of lines) {
    const line = raw.replace(/\*\*(.+?)\*\*/g, (_, t) => paint('bold', t))
    if (line.startsWith('### ')) out.push(` ${paint('bold', paint('yellow', line.slice(4)))}`)
    else if (line.startsWith('## ')) out.push(`\n${paint('bold', paint('cyan', '▍' + line.slice(3)))}`)
    else if (line.startsWith('# ')) out.push(`\n${paint('bold', paint('magenta', line.slice(2)))}\n`)
    else if (line.startsWith('> ')) out.push(paint('dim', '  ' + line.slice(2)))
    else if (line.startsWith('- ')) out.push(`  ${paint('dim', '•')} ${line.slice(2)}`)
    else if (line.startsWith('|')) out.push(line) // 表格保持原样（已对齐）
    else out.push(line)
  }
  return out.join('\n')
}

function firstHeading(file) {
  const md = readFileSync(file, 'utf8')
  const match = md.match(/^# (.+)$/m)
  return match ? match[1].trim() : '(无标题)'
}

const REPORTS = ['ANALYSIS', 'TIMELINE', 'LINEAGE', 'BANK_LINEAGE', 'DD_STANDARD']

function listArchives(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !/^(README|ROADMAP)/.test(f))
    .filter((f) => !REPORTS.includes(f.replace('.md', '')))
    .sort()
}

// ---------- repo 命令 ----------
const DOMAINS = [
  { id: 'data', label: '数据 data' },
  { id: 'alpha', label: '因子 alpha' },
  { id: 'ml', label: '模型/回测 ml' },
  { id: 'risk', label: '风险 risk' },
  { id: 'execution', label: '执行 execution' },
  { id: 'community', label: '社区 community' },
]

const TOOLS = [
  { name: 'quant_market_fetch', domain: 'data', desc: '行情K线抓取（binance/okx/bybit/sina/tencent/yahoo）' },
  { name: 'quant_data_guide', domain: 'data', desc: '数据通道指南' },
  { name: 'quant_data_advice', domain: 'data', desc: '数据源选型建议' },
  { name: 'quant_data_compare', domain: 'data', desc: '数据通道对比' },
  { name: 'quant_data_annotate', domain: 'data', desc: '序列标注' },
  { name: 'quant_data_quality', domain: 'data', desc: '数据质量检查' },
  { name: 'quant_series_stats', domain: 'data', desc: '序列统计（均值/波动/极值）' },
  { name: 'quant_series_quality', domain: 'data', desc: '序列质量诊断' },
  { name: 'quant_resample', domain: 'data', desc: 'K线重采样' },
  { name: 'quant_sma', domain: 'alpha', desc: '简单移动平均' },
  { name: 'quant_ema', domain: 'alpha', desc: '指数移动平均' },
  { name: 'quant_macd', domain: 'alpha', desc: 'MACD 指标' },
  { name: 'quant_rsi', domain: 'alpha', desc: '相对强弱指标' },
  { name: 'quant_kdj', domain: 'alpha', desc: 'KDJ 随机指标' },
  { name: 'quant_bollinger', domain: 'alpha', desc: '布林带' },
  { name: 'quant_atr', domain: 'alpha', desc: '平均真实波幅' },
  { name: 'quant_adx', domain: 'alpha', desc: '趋势强度 ADX' },
  { name: 'quant_cci', domain: 'alpha', desc: '顺势指标' },
  { name: 'quant_roc', domain: 'alpha', desc: '变动率 ROC' },
  { name: 'quant_obv', domain: 'alpha', desc: '能量潮 OBV' },
  { name: 'quant_williams_r', domain: 'alpha', desc: '威廉指标' },
  { name: 'quant_factor_evaluate', domain: 'alpha', desc: '因子评估（IC/分位）' },
  { name: 'quant_factor_combine', domain: 'alpha', desc: '多因子合成' },
  { name: 'quant_factor_neutralize', domain: 'alpha', desc: '因子中性化' },
  { name: 'quant_backtest', domain: 'ml', desc: '通用策略回测' },
  { name: 'quant_backtest_bollinger', domain: 'ml', desc: '布林带突破回测' },
  { name: 'quant_backtest_rsi', domain: 'ml', desc: 'RSI 反转回测' },
  { name: 'quant_backtest_grid', domain: 'ml', desc: '网格策略回测' },
  { name: 'quant_backtest_portfolio', domain: 'ml', desc: '组合回测' },
  { name: 'quant_metrics', domain: 'ml', desc: '绩效/交易指标' },
  { name: 'quant_linear_model', domain: 'ml', desc: '线性模型（拟合/预测/评估）' },
  { name: 'quant_var_backtest', domain: 'ml', desc: 'VaR 回测' },
  { name: 'quant_walk_forward', domain: 'ml', desc: '滚动前推验证' },
  { name: 'quant_risk', domain: 'risk', desc: '风险指标' },
  { name: 'quant_drawdown', domain: 'risk', desc: '回撤分析' },
  { name: 'quant_bond', domain: 'risk', desc: '债券分析' },
  { name: 'quant_option', domain: 'risk', desc: '期权分析' },
  { name: 'quant_volatility', domain: 'risk', desc: '已实现波动率' },
  { name: 'quant_chart', domain: 'execution', desc: '图表数据（K线/标注/回测）' },
  { name: 'quant_execute_sim', domain: 'execution', desc: '执行模拟' },
  { name: 'quant_fund', domain: 'execution', desc: '资金曲线模拟' },
  { name: 'quant_report', domain: 'execution', desc: '研报生成' },
  { name: 'quant_research_pipeline', domain: 'execution', desc: '研究管线（PDAT→PET 全链路）' },
  { name: 'quant_repo_stats', domain: 'community', desc: 'GitHub 仓库统计' },
  { name: 'quant_npm_stats', domain: 'community', desc: 'npm 包统计' },
  { name: 'quant_oss_pulse', domain: 'community', desc: '开源脉搏' },
]

function cmdRepoTools() {
  console.log('')
  console.log(`${paint('bold', paint('cyan', 'dsh-quant'))} ${paint('dim', '— Everything-Plugin Quant OS 工具仓库')}`)
  console.log(paint('dim', `46 tools · 6 domains · 方法开放，密钥内藏`))
  console.log('')
  for (const domain of DOMAINS) {
    const tools = TOOLS.filter((t) => t.domain === domain.id)
    console.log(` ${paint('bold', paint('magenta', `◆ ${domain.label}`))} ${paint('dim', `(${tools.length})`)}`)
    for (const tool of tools) console.log(`   ${paint('cyan', tool.name.padEnd(26))} ${paint('dim', tool.desc)}`)
    console.log('')
  }
}

function cmdRepoFirm(name) {
  const file = join(REPO_DIR, `${name}.md`)
  let md
  try {
    md = readFileSync(file, 'utf8')
  } catch {
    console.error(paint('red', `✗ quant-repo 无 ${name} 档案，可用：${listArchives(REPO_DIR).map((f) => f.replace('.md', '')).join(', ')}`))
    process.exit(1)
  }
  console.log(renderMd(md))
}

// ---------- history 命令 ----------

function cmdHistoryIndex() {
  console.log('')
  console.log(`${paint('bold', paint('cyan', 'quant-history'))} ${paint('dim', '— 量化机构档案（53 家）')}`)
  console.log('')
  const firms = listArchives(HISTORY_DIR)
  for (const file of firms) {
    const title = firstHeading(join(HISTORY_DIR, file))
    console.log(` ${paint('cyan', file.replace('.md', '').padEnd(18))} ${paint('dim', title)}`)
  }
  console.log('')
  console.log(paint('dim', ' 查看: dsh-quant history citadel    |  报告: dsh-quant history --reports    |  检索: dsh-quant history --search 高频'))
  console.log('')
}

function cmdHistoryFirm(name) {
  const file = join(HISTORY_DIR, `${name}.md`)
  let md
  try {
    md = readFileSync(file, 'utf8')
  } catch {
    console.error(paint('red', `✗ 无 ${name} 档案，可用：${listArchives(HISTORY_DIR).map((f) => f.replace('.md', '')).join(', ')}`))
    process.exit(1)
  }
  console.log(renderMd(md))
}

function cmdHistoryReports() {
  console.log('')
  console.log(`${paint('bold', paint('cyan', 'quant-history'))} ${paint('dim', '— 研究报告')}`)
  console.log('')
  for (const report of REPORTS) {
    const title = firstHeading(join(HISTORY_DIR, `${report}.md`))
    console.log(` ${paint('yellow', report.padEnd(16))} ${paint('dim', title)}`)
  }
  console.log('')
}

function cmdHistorySearch(keyword) {
  console.log('')
  console.log(`${paint('bold', paint('cyan', 'quant-history'))} ${paint('dim', `— 检索 " ${keyword} "`)}`)
  console.log('')
  let hits = 0
  for (const file of listArchives(HISTORY_DIR)) {
    const lines = readFileSync(join(HISTORY_DIR, file), 'utf8').split('\n')
    const matches = lines.filter((line) => line.includes(keyword))
    if (matches.length) {
      hits += matches.length
      console.log(paint('magenta', ` ${file.replace('.md', '')}`))
      for (const match of matches.slice(0, 3)) {
        console.log(paint('dim', `   …${match.trim().slice(0, 90)}`))
      }
      console.log('')
    }
  }
  if (!hits) console.log(paint('dim', ' 无匹配'))
  console.log(paint('dim', ` 共 ${hits} 处匹配`))
  console.log('')
}

function cmdUpstreamIndex() {
  console.log('')
  console.log(`${paint('bold', paint('cyan', 'quant-upstream'))} ${paint('dim', '— 量化产业链 · 上游（数据服务供给商）')}`)
  console.log('')
  for (const file of listArchives(UPSTREAM_DIR)) {
    const title = firstHeading(join(UPSTREAM_DIR, file))
    console.log(` ${paint('cyan', file.replace('.md', '').padEnd(14))} ${paint('dim', title)}`)
  }
  console.log('')
  console.log(paint('dim', ' 查看: dsh-quant upstream bloomberg   |  总表: dsh-quant upstream comparison'))
  console.log('')
}

function cmdUpstreamFirm(name) {
  const file = join(UPSTREAM_DIR, `${name}.md`)
  let md
  try {
    md = readFileSync(file, 'utf8')
  } catch {
    console.error(paint('red', `✗ 无 ${name} 档案，可用：${listArchives(UPSTREAM_DIR).map((f) => f.replace('.md', '')).join(', ')}`))
    process.exit(1)
  }
  console.log(renderMd(md))
}

// ---------- kline 命令 ----------
function fmtNum(value, digits = 2) {
  if (!Number.isFinite(value)) return '—'
  return Number(value).toFixed(digits)
}
function fmtPct(value) {
  if (!Number.isFinite(value)) return paint('dim', '  —  ')
  const text = `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  return value >= 0 ? paint('green', text) : paint('red', text)
}
function fmtVol(value) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
  return String(Math.round(value))
}

function parseKlineArgs(argv) {
  const args = { symbol: null, interval: '1d', provider: 'binance', limit: 20, json: false, stats: true }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--interval') args.interval = argv[++i]
    else if (arg === '--provider') args.provider = argv[++i]
    else if (arg === '--limit') args.limit = Number(argv[++i])
    else if (arg === '--json') args.json = true
    else if (arg === '--no-stats') args.stats = false
    else if (!args.symbol) args.symbol = arg
  }
  return args
}

async function cmdKline(argv) {
  const args = parseKlineArgs(argv)
  if (!args.symbol) {
    console.error(paint('red', '用法: dsh-quant kline <symbol> [--interval 1d] [--provider binance] [--limit 20]'))
    process.exit(1)
  }
  let candles
  try {
    candles = await fetchKlines(args.symbol, args.interval, Math.min(Math.max(args.limit, 1), 500), AbortSignal.timeout(20000), args.provider)
  } catch (err) {
    console.error(paint('red', `✗ 行情获取失败: ${err.message}`))
    process.exit(1)
  }
  if (!candles.length) {
    console.error(paint('yellow', `⚠ ${args.symbol} 无数据（检查格式：BTCUSDT / 600519.SS）`))
    process.exit(1)
  }
  if (args.json) {
    console.log(JSON.stringify(candles, null, 2))
    return
  }
  console.log('')
  console.log(`${paint('bold', paint('cyan', args.symbol))} ${paint('dim', `· ${args.interval} · ${args.provider} · ${candles.length} 根K线`)}`)
  console.log('')
  console.log(` ${paint('dim', '日期'.padEnd(12))}${paint('dim', '开盘'.padStart(12))}${paint('dim', '最高'.padStart(12))}${paint('dim', '最低'.padStart(12))}${paint('dim', '收盘'.padStart(12))}  ${paint('dim', '涨跌')}  ${paint('dim', '成交量')}`)
  let prevClose = null
  for (const candle of candles) {
    const change = prevClose === null ? NaN : ((candle.close - prevClose) / prevClose) * 100
    const body = candle.close >= candle.open ? 'green' : 'red'
    const line = [
      fmtNum(candle.open).padStart(12),
      fmtNum(candle.high).padStart(12),
      fmtNum(candle.low).padStart(12),
      paint(body, fmtNum(candle.close).padStart(12)),
      fmtPct(change),
      paint('dim', fmtVol(candle.volume).padStart(10)),
    ].join('  ')
    console.log(` ${paint('dim', new Date(candle.openTime).toISOString().slice(0, 10).padEnd(12))}${line}`)
    prevClose = candle.close
  }
  if (args.stats) {
    const closes = candles.map((c) => c.close)
    const stats = seriesStats(closes)
    const total = ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100
    const avgVol = candles.reduce((a, b) => a + b.volume, 0) / candles.length
    console.log('')
    console.log(` ${paint('bold', '统计')} ${paint('dim', '（基于收盘价）')}`)
    console.log(`   区间收益   ${fmtPct(total)}`)
    console.log(`   最高/最低  ${fmtNum(Math.max(...candles.map((c) => c.high)))} / ${fmtNum(Math.min(...candles.map((c) => c.low)))}`)
    console.log(`   均值/波动  ${fmtNum(stats.mean)} / ${fmtNum(stats.std)}`)
    console.log(`   平均成交   ${fmtVol(avgVol)}`)
    console.log('')
  }
}

// ---------- quality 命令 ----------
function cmdQuality(argv) {
  // 用法: dsh-quant quality 1,2,3,4,5 --channels binance,okx
  const raw = argv[0]
  const channelsArg = argv.find((a) => a.startsWith('--channels='))
  const channels = channelsArg ? channelsArg.split('=')[1].split(',').map((s) => s.trim()).filter(Boolean) : []
  if (!raw) {
    console.error(paint('red', '用法: dsh-quant quality <csv数值> [--channels=binance,okx]'))
    return
  }
  const values = raw.split(',').map((s) => {
    const t = s.trim()
    if (t === 'null' || t === '') return null
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  })
  const report = dataQualityReport(values, channels)
  console.log(`${paint('bold', paint('cyan', '数据质量报告'))}`)
  console.log(` ${paint('bold', '健康度')}   ${(report.healthScore * 100).toFixed(0)}/100`)
  console.log(` ${paint('bold', 'PIT')}      ${report.pit.pass ? paint('green', '通过') : paint('yellow', `注意(${report.pit.lookAheadIndices.length} 个断点)`) }`)
  console.log(` ${paint('bold', '连续性')}  ${report.survivorship.continuous ? paint('green', '连续') : paint('yellow', `缺失 ${report.survivorship.gaps.length} 段`) }`)
  if (report.survivorship.tailTruncated) console.log(`            ${paint('yellow', '⚠ 尾部缺失（疑似幸存者偏差）')}`)
  if (report.channels.length > 0) {
    console.log(` ${paint('bold', '渠道')}     `)
    for (const c of report.channels) {
      console.log(`           ${c.channel} 可靠度 ${(c.reliability * 100).toFixed(0)}% ${c.cost}`)
    }
  }
  console.log('')
}

// ---------- channel 命令 ----------
function cmdChannel(argv) {
  // 用法: dsh-quant channel akshare   /   dsh-quant channel akshare --check
  const name = argv[0]
  if (!name) {
    console.error(paint('red', '用法: dsh-quant channel <名称> [--check]'))
    return
  }
  const guide = channelAccessGuide(name)
  const check = argv.includes('--check')
  console.log(`${paint('bold', paint('cyan', `渠道接入指南 · ${guide.displayName}`))}`)
  console.log(` ${paint('bold', '步骤')}`)
  guide.steps.forEach((s, i) => console.log(`   ${i + 1}. ${s}`))
  if (guide.prerequisites.length > 0) {
    console.log(` ${paint('bold', '前置')}  ${guide.prerequisites.join('；')}`)
  }
  if (guide.example) console.log(` ${paint('bold', '示例')}  ${paint('dim', guide.example)}`)
  if (guide.fallback) console.log(` ${paint('bold', '备用')}  ${guide.fallback}`)
  if (check) {
    const r = accessReadiness(name)
    console.log(` ${paint('bold', '就绪')}  ${r.ready ? paint('green', '可直接使用') : paint('yellow', r.blockers.join('；'))}`)
    r.actions.forEach((a) => console.log(`           → ${a}`))
  }
  console.log('')
}

// ---------- 入口 ----------
const [, , command, ...rest] = process.argv

function usage() {
  console.log(`${paint('bold', paint('cyan', 'dsh-quant CLI'))} ${paint('dim', '— 可读的量化终端（零依赖）')}`)
  console.log('')
  console.log(`  ${paint('cyan', 'repo')}                         ${paint('dim', '46 工具仓库（6 领域）')}`)
  console.log(`  ${paint('cyan', 'repo <firm>')}                 ${paint('dim', '机构开源仓库档案（quant-repo/）')}`)
  console.log(`  ${paint('cyan', 'history')}                     ${paint('dim', '机构档案索引（53 家）')}`)
  console.log(`  ${paint('cyan', 'history <firm>')}              ${paint('dim', '某家机构档案')}`)
  console.log(`  ${paint('cyan', 'history --reports')}           ${paint('dim', '四大研究报告')}`)
  console.log(`  ${paint('cyan', 'history --search <关键词>')}    ${paint('dim', '跨档案检索')}`)
  console.log(`  ${paint('cyan', 'browse [history|upstream]')}    ${paint('dim', '交互式 TUI：方向键浏览档案（↑↓ / Enter 查看 / / 搜索 / q 退出）')}`)
  console.log(`  ${paint('cyan', 'upstream [<firm>]')}           ${paint('dim', '产业链上游：数据服务供给商对比（Wind/Bloomberg...）')}`)
  console.log(`  ${paint('cyan', 'kline <symbol>')}              ${paint('dim', '行情 OHLC（彩色）+ 统计')}`)
  console.log(`  ${paint('cyan', 'quality <csv>')}               ${paint('dim', '数据质量报告（PIT/连续性/渠道）')}`)
  console.log(`  ${paint('cyan', 'channel <name>')}              ${paint('dim', '数据渠道接入指南（--check 就绪检查）')}`)
  console.log('')
  console.log(paint('dim', ' 示例: dsh-quant history citadel'))
  console.log(paint('dim', '       dsh-quant history --search 高频'))
  console.log(paint('dim', '       dsh-quant kline BTCUSDT --limit 20'))
  console.log('')
}

async function main() {
  switch (command) {
    case 'repo':
      if (rest[0] && !rest[0].startsWith('--')) cmdRepoFirm(rest[0])
      else cmdRepoTools()
      return
    case 'browse':
      await import('./tui.mjs').then((m) => m.browse(rest[0]))
      return
    case 'history':
      if (rest[0] === '--reports') cmdHistoryReports()
      else if (rest[0] === '--search') cmdHistorySearch(rest.slice(1).join(' '))
      else if (rest[0] && !rest[0].startsWith('--')) cmdHistoryFirm(rest[0])
      else cmdHistoryIndex()
      return
    case 'upstream':
      if (rest[0] && !rest[0].startsWith('--')) cmdUpstreamFirm(rest[0].toLowerCase())
      else cmdUpstreamIndex()
      return
    case 'kline':
    case 'market':
      await cmdKline(rest)
      return
    case 'quality':
      cmdQuality(rest)
      return
    case 'channel':
      cmdChannel(rest)
      return
    case 'version':
    case '--version':
      console.log('dsh-quant CLI 0.1.0')
      return
    default:
      usage()
  }
}

main().catch((err) => {
  console.error(paint('red', `✗ ${err.message}`))
  process.exit(1)
})
