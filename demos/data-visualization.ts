import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { performance } from 'node:perf_hooks'
import { sma } from '../src/dsh-alpha/indicators.ts'
import { chartCandles, chartSeries, type ChartMarker } from '../src/dsh-execution/chart.ts'
import { drawdownAnalysis } from '../src/dsh-risk/drawdown.ts'

export function visualizationFixture() {
  const close = Array.from({ length: 80 }, (_, i) => Math.round((100 + i / 10 + 12 * Math.sin(i / 5) + 2 * Math.cos(i / 2)) * 100) / 100)
  const candles = close.map((c, i) => {
    const open = i ? close[i - 1]! : c - 1
    return { openTime: Date.UTC(2026, 0, 1 + i), open, high: Math.max(open, c) + 2,
      low: Math.min(open, c) - 2, close: c, volume: 100 + i }
  })
  // Scripted, independently reconcilable fixture fills, NOT an engine/strategy result.
  const trades = [{ entryIndex: 30, exitIndex: 47 }, { entryIndex: 63, exitIndex: 79 }]
  const equity = fixtureLedger(close, trades, 0.001)
  const dd = drawdownAnalysis(equity)
  const markers: ChartMarker[] = trades.flatMap(t => [
    { index: t.entryIndex, kind: 'entry' as const },
    ...(t.exitIndex === null ? [] : [{ index: t.exitIndex, kind: 'exit' as const }]),
  ])
  return {
    provenance: 'INDEPENDENT_SYNTHETIC_FIXTURE; no CCXT or private market data; not investable performance',
    assumptions: { fast: 5, slow: 15, feeRate: 0.001, execution: 'manually scripted fixture fills, NOT a strategy/backtest; no slippage model' },
    candles, fast: sma(close, 5), slow: sma(close, 15), equity,
    underwaterPct: dd.underwater.map(v => v * 100), trades, markers,
    chartData: [
      chartCandles(candles, [{ name: 'SMA5', values: sma(close, 5) }, { name: 'SMA15', values: sma(close, 15) }], markers, 'Synthetic daily candles'),
      chartSeries([{ name: 'net equity', values: equity }], 'Scripted fixture equity'),
      chartSeries([{ name: 'drawdown (%)', values: dd.underwater.map(v => v * 100) }], 'Drawdown'),
    ],
  }
}

/** Fixture-only cash/share accounting oracle, not a replacement backtesting engine. */
export function fixtureLedger(prices: readonly number[], trades: readonly { entryIndex: number; exitIndex: number }[], fee: number) {
  if (!prices.length || prices.some(p => !Number.isFinite(p) || p <= 0) || !Number.isFinite(fee) || fee < 0 || fee >= 1) throw new RangeError('invalid fixture prices/fee')
  for (const [i, t] of trades.entries()) {
    if (!Number.isInteger(t.entryIndex) || !Number.isInteger(t.exitIndex) || t.entryIndex < 0 || t.exitIndex <= t.entryIndex
      || t.exitIndex >= prices.length || (i > 0 && t.entryIndex <= trades[i - 1]!.exitIndex)) throw new RangeError('invalid/overlapping fixture fills')
  }
  let cash = 1
  let shares = 0
  return prices.map((price, i) => {
    if (trades.some(t => t.entryIndex === i)) { shares = cash * (1 - fee) / price; cash = 0 }
    if (trades.some(t => t.exitIndex === i)) { cash = shares * price * (1 - fee); shares = 0 }
    return cash + shares * price
  })
}

/** Null starts a new segment: missing/warmup points are never interpolated. */
export function linePath(values: readonly (number | null)[], x: (i: number) => number, y: (v: number) => number) {
  let active = false
  return values.map((value, i) => {
    if (value === null) { active = false; return '' }
    if (!Number.isFinite(value)) throw new TypeError('plot values must be finite or null')
    const command = active ? 'L' : 'M'
    active = true
    return `${command}${x(i).toFixed(2)},${y(value).toFixed(2)}`
  }).join(' ')
}

export function renderVisualization(model = visualizationFixture()) {
  const x = (i: number) => 88 + i / (model.candles.length - 1) * 1064
  const axes = (top: number, height: number, min: number, max: number, label: string) => {
    const range = max - min || 1
    const y = (v: number) => top + height - (v - min) / range * height
    const grid = [0, 0.5, 1].map(t => {
      const value = min + t * range
      return `<line x1="88" x2="1160" y1="${y(value)}" y2="${y(value)}" stroke="#dbe1e5"/><text x="76" y="${y(value) + 5}" text-anchor="end">${value.toFixed(2)}</text>`
    }).join('')
    return { y, svg: `<text x="88" y="${top - 16}" class="panel-title">${label}</text>${grid}` }
  }
  const price = axes(130, 220, Math.min(...model.candles.map(c => c.low)), Math.max(...model.candles.map(c => c.high)), '01  Candles / SMA / scripted fixture fills')
  const eq = axes(428, 112, Math.min(...model.equity) * 0.99, Math.max(...model.equity) * 1.01, '02  Net equity (initial = 1; synthetic, not OOS)')
  const dd = axes(620, 112, Math.min(-1, ...model.underwaterPct) * 1.1, 0, '03  Drawdown (%) / zero = running peak')
  const path = (values: readonly (number | null)[], y: (v: number) => number, stroke: string) => `<path d="${linePath(values, x, y)}" fill="none" stroke="${stroke}" stroke-width="2"/>`
  const candles = model.candles.map((c, i) => {
    const color = c.close >= c.open ? '#167647' : '#c64040'
    return `<g data-candle="${i}"><line x1="${x(i)}" x2="${x(i)}" y1="${price.y(c.high)}" y2="${price.y(c.low)}" stroke="${color}"/><rect x="${x(i) - 3}" y="${Math.min(price.y(c.open), price.y(c.close))}" width="6" height="${Math.max(1, Math.abs(price.y(c.open) - price.y(c.close)))}" fill="${color}"/></g>`
  }).join('')
  const markers = model.markers.map(m => `<circle data-fill="${m.kind}" cx="${x(m.index)}" cy="${price.y(model.candles[m.index]!.close)}" r="5" fill="${m.kind === 'entry' ? '#075f9b' : '#bd571b'}" stroke="white" stroke-width="1.5"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1220 810" role="img" aria-labelledby="title desc">
<title id="title">dsh-quant synthetic visualization example</title><desc id="desc">Eighty synthetic daily candles, moving averages, trade fills, equity and drawdown. No real market performance.</desc>
<style>text{font-family:Arial,sans-serif;font-size:13px;fill:#253239}.panel-title{font-size:16px;font-weight:600}</style>
<rect width="1220" height="810" fill="#ffffff"/>
<text x="36" y="34" style="font-size:23px;font-weight:600">dsh-quant / data to research visualization</text>
<text x="36" y="60">SYNTHETIC ONLY | scripted fills, NOT a strategy result | MA5/15 | fee 0.10% per side | no alpha claim</text>
<text x="88" y="88" fill="#075f9b">SMA5: blue / entry: blue circle</text><text x="430" y="88" fill="#bd571b">SMA15: amber / exit: orange circle</text>
${price.svg}${candles}${path(model.fast, price.y, '#075f9b')}${path(model.slow, price.y, '#bd571b')}${markers}
${eq.svg}${path(model.equity, eq.y, '#147d79')}
${dd.svg}${path(model.underwaterPct, dd.y, '#b44352')}
${[0, 20, 40, 60, 79].map(i => `<text x="${x(i)}" y="758" text-anchor="middle">${new Date(model.candles[i]!.openTime).toISOString().slice(5, 10)} UTC</text>`).join('')}
<text x="36" y="792">Data/QA views and research reporting share a display layer; a chart does not validate a strategy or data license.</text></svg>`
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const directory = new URL('./data-visualization/', import.meta.url)
  mkdirSync(directory, { recursive: true })
  const model = visualizationFixture()
  const svg = renderVisualization(model)
  writeFileSync(new URL('example.json', directory), `${JSON.stringify(model, null, 2)}\n`)
  writeFileSync(new URL('example.svg', directory), svg)
  for (let i = 0; i < 20; i++) renderVisualization(model)
  const start = performance.now()
  for (let i = 0; i < 250; i++) renderVisualization(model)
  console.log(JSON.stringify({ title: 'Own offline SVG renderer; not third-party library benchmark', generated_at: new Date().toISOString(), bars: 80,
    measured_iterations: 250, mean_render_ms: (performance.now() - start) / 250, svg_bytes: Buffer.byteLength(svg),
    output: fileURLToPath(directory), external_network: false, financial_performance: 'NOT_EVALUATED' }))
}
