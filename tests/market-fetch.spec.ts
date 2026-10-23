/**
 * market.ts 网络层测试：fetchKlines 分发、各 provider 的 URL/参数构造、
 * 错误映射（网络失败、HTTP 非 2xx、响应形状/空数据）与截取逻辑。
 * 全程 mock globalThis.fetch，无真实网络调用。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchKlines } from '../src/dsh-data/market.ts'

const realFetch = globalThis.fetch

/** 安装 mock fetch：返回 (url, init) 记录 + 可编程响应；返回恢复函数。 */
function mockFetch(responder: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  const calls: { url: string; init?: RequestInit }[] = []
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    calls.push({ url, init })
    return responder(url, init)
  }) as typeof fetch
  return { calls, restore: () => { globalThis.fetch = realFetch } }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

const signal = () => new AbortController().signal

const OKX_ROWS = [
  ['1786838400000', '63100', '63200', '63000', '63150', '10', '0', '0', '1'],
  ['1786752000000', '63000', '63100', '62900', '63050', '20', '0', '0', '1'],
]
const BYBIT_ROWS = [
  ['1786838400000', '63100', '63200', '63000', '63150', '10'],
  ['1786752000000', '63000', '63100', '62900', '63050', '20'],
]

test('fetchKlines: binance 默认 provider，URL 参数 + 解析', async () => {
  const m = mockFetch(() => json([[1786752000000, '1', '2', '0.5', '1.5', '10', 0, '0', 0, '0', '0', '0']]))
  try {
    const candles = await fetchKlines('BTCUSDT', '1h', 2, signal())
    assert.equal(m.calls.length, 1)
    const url = new URL(m.calls[0]!.url)
    assert.equal(url.origin + url.pathname, 'https://api.binance.com/api/v3/klines')
    assert.equal(url.searchParams.get('symbol'), 'BTCUSDT')
    assert.equal(url.searchParams.get('interval'), '1h')
    assert.equal(url.searchParams.get('limit'), '2')
    assert.equal(candles.length, 1)
    assert.deepEqual(candles[0], {
      openTime: 1786752000000, open: 1, high: 2, low: 0.5, close: 1.5, volume: 10,
    })
  } finally { m.restore() }
})

test('fetchKlines: binance 网络失败 → 统一错误信息', async () => {
  const m = mockFetch(() => { throw new Error('ECONNREFUSED') })
  try {
    await assert.rejects(
      fetchKlines('BTCUSDT', '1h', 1, signal()),
      /market fetch failed for BTCUSDT 1h: ECONNREFUSED/,
    )
  } finally { m.restore() }
})

test('fetchKlines: binance HTTP 非 2xx → 状态码 + body 截断', async () => {
  const m = mockFetch(() => new Response('x'.repeat(500), { status: 400 }))
  try {
    await assert.rejects(
      fetchKlines('BTCUSDT', '1h', 1, signal()),
      /market fetch failed for BTCUSDT 1h: HTTP 400 /,
    )
  } finally { m.restore() }
})

test('fetchKlines: binance 非数组响应 → unexpected response shape', async () => {
  const m = mockFetch(() => json({ code: '00000' }))
  try {
    await assert.rejects(
      fetchKlines('BTCUSDT', '1h', 1, signal()),
      /unexpected response shape for BTCUSDT/,
    )
  } finally { m.restore() }
})

test('fetchKlines: 按 provider 分发到各自端点', async () => {
  const expected: Record<string, string> = {
    okx: 'https://www.okx.com/api/v5/market/candles',
    bybit: 'https://api.bybit.com/v5/market/kline',
    sina: 'https://quotes.sina.cn/cn/api/json_v2.php/CN_MarketDataService.getKLineData',
    tencent: 'https://web.ifzq.gtimg.cn/appstock/app/fqkline/get',
    yahoo: 'https://query1.finance.yahoo.com/v8/finance/chart/AAPL',
  }
  const bodies: Record<string, unknown> = {
    okx: { code: '0', data: [OKX_ROWS[0]] },
    bybit: { retCode: 0, result: { list: [BYBIT_ROWS[0]] } },
    sina: [{ day: '2026-08-15', open: '1', high: '2', low: '0.5', close: '1.5', volume: '10' }],
    tencent: { code: 0, data: { sh600000: { qfqday: [['2026-08-15', '1', '1.5', '2', '0.5', '10']] } } },
    yahoo: {
      chart: { result: [{ timestamp: [1786752000], indicators: { quote: [{ open: [1], high: [2], low: [0.5], close: [1.5], volume: [10] }] } }] },
    },
  }
  const symbols: Record<string, string> = {
    okx: 'BTCUSDT', bybit: 'BTCUSDT', sina: 'sh600000', tencent: 'sh600000', yahoo: 'AAPL',
  }
  for (const [provider, want] of Object.entries(expected)) {
    const m = mockFetch(() => json(bodies[provider]))
    try {
      const candles = await fetchKlines(symbols[provider]!, '1d', 1, signal(), provider as never)
      assert.equal(candles.length, 1, provider)
      assert.ok(m.calls[0]!.url.startsWith(want), `${provider} -> ${m.calls[0]!.url}`)
    } finally { m.restore() }
  }
})

test('fetchKlines: okx instId 转换/bar 映射/limit 封顶 300', async () => {
  const m = mockFetch(() => json({ code: '0', data: OKX_ROWS }))
  try {
    const candles = await fetchKlines('BTCUSDT', '1d', 999, signal(), 'okx')
    const url = new URL(m.calls[0]!.url)
    assert.equal(url.searchParams.get('instId'), 'BTC-USDT')
    assert.equal(url.searchParams.get('bar'), '1D')
    assert.equal(url.searchParams.get('limit'), '300')
    // 倒序响应被反转为正序
    assert.equal(candles[0]!.openTime, 1786752000000)
    assert.equal(candles[1]!.openTime, 1786838400000)
  } finally { m.restore() }
})

test('fetchKlines: okx 非 USDT/USD 计价符号报错', async () => {
  const m = mockFetch(() => json({ code: '0', data: [] }))
  try {
    await assert.rejects(
      fetchKlines('ETHBTC', '1h', 1, signal(), 'okx'),
      /okx provider supports USDT\/USD-quoted symbols only, got ETHBTC/,
    )
  } finally { m.restore() }
})

test('fetchKlines: okx code 非 0 / data 非数组报错', async () => {
  for (const body of [{ code: '50001', data: [] }, { code: '0', data: 'nope' }]) {
    const m = mockFetch(() => json(body))
    try {
      await assert.rejects(
        fetchKlines('BTCUSDT', '1h', 1, signal(), 'okx'),
        /okx fetch failed for BTCUSDT 1h/,
      )
    } finally { m.restore() }
  }
})

test('fetchKlines: bybit 不支持的 interval 报错，limit 封顶 200', async () => {
  const m = mockFetch(() => json({ retCode: 0, result: { list: BYBIT_ROWS } }))
  try {
    await assert.rejects(
      fetchKlines('BTCUSDT', '3d', 1, signal(), 'bybit'),
      /bybit provider does not support interval 3d/,
    )
    // 不支持的 interval 在发起请求前即报错；成功调用是第 1 次 fetch
    const candles = await fetchKlines('BTCUSDT', '1d', 999, signal(), 'bybit')
    const url = new URL(m.calls[0]!.url)
    assert.equal(url.searchParams.get('interval'), 'D')
    assert.equal(url.searchParams.get('limit'), '200')
    assert.equal(candles[0]!.openTime, 1786752000000)
  } finally { m.restore() }
})

test('fetchKlines: bybit retCode 非 0 / list 非数组报错', async () => {
  for (const body of [{ retCode: 10001, result: { list: [] } }, { retCode: 0, result: { list: 'nope' } }]) {
    const m = mockFetch(() => json(body))
    try {
      await assert.rejects(
        fetchKlines('BTCUSDT', '1h', 1, signal(), 'bybit'),
        /bybit fetch failed for BTCUSDT 1h/,
      )
    } finally { m.restore() }
  }
})

test('fetchKlines: sina 校验符号/interval，带 Referer，空数据报错', async () => {
  const m = mockFetch(() => json([{ day: '2026-08-15 15:00:00', open: '1', high: '2', low: '0.5', close: '1.5', volume: '10' }]))
  try {
    await assert.rejects(
      fetchKlines('BTCUSDT', '5m', 1, signal(), 'sina'),
      /invalid A-share symbol "BTCUSDT"/,
    )
    await assert.rejects(
      fetchKlines('sh600000', '1w', 1, signal(), 'sina'),
      /sina provider supports intervals 5m\/15m\/30m\/1h\/1d only, got 1w/,
    )
    // 符号/interval 校验在发起请求前即报错；成功调用是第 1 次 fetch
    const candles = await fetchKlines('sh600000', '5m', 9999, signal(), 'sina')
    const url = new URL(m.calls[0]!.url)
    assert.equal(url.searchParams.get('symbol'), 'sh600000')
    assert.equal(url.searchParams.get('scale'), '5')
    assert.equal(url.searchParams.get('ma'), 'no')
    assert.equal(url.searchParams.get('datalen'), '1000')
    assert.equal(candles[0]!.openTime, Date.parse('2026-08-15T15:00:00+08:00'))
  } finally { m.restore() }
})

test('fetchKlines: sina Referer 头 + 非数组/空数组响应报错', async () => {
  for (const responder of [
    () => json({ not: 'array' }),
    () => json([]),
  ]) {
    const m = mockFetch(responder)
    try {
      await assert.rejects(fetchKlines('sh600000', '5m', 1, signal(), 'sina'), /sina fetch/)
    } finally { m.restore() }
  }
  const m = mockFetch(() => json([{ day: '2026-08-15', open: '1', high: '2', low: '0.5', close: '1.5', volume: '10' }]))
  try {
    await fetchKlines('sh600000', '1d', 1, signal(), 'sina')
    const headers = (m.calls[0]!.init?.headers ?? {}) as Record<string, string>
    assert.equal(headers.Referer, 'https://finance.sina.com.cn')
  } finally { m.restore() }
})

test('fetchKlines: tencent 仅 1d，空结果报错，截取最后 limit 根', async () => {
  const rows = [
    ['2026-08-13', '1', '1.5', '2', '0.5', '10'],
    ['2026-08-14', '1', '1.6', '2', '0.5', '11'],
    ['2026-08-15', '1', '1.7', '2', '0.5', '12'],
  ]
  const m = mockFetch(() => json({ code: 0, data: { sh600000: { qfqday: rows } } }))
  try {
    await assert.rejects(
      fetchKlines('sh600000', '1h', 1, signal(), 'tencent'),
      /tencent provider supports interval 1d only \(adjusted daily klines\), got 1h/,
    )
    await assert.rejects(
      fetchKlines('BTCUSDT', '1d', 1, signal(), 'tencent'),
      /invalid A-share symbol "BTCUSDT"/,
    )
    //  interval/符号校验在发起请求前即报错；成功调用是第 1 次 fetch
    const candles = await fetchKlines('sh600000', '1d', 2, signal(), 'tencent')
    const url = new URL(m.calls[0]!.url)
    assert.equal(url.searchParams.get('param'), 'sh600000,day,,,2,qfq')
    assert.equal(candles.length, 2)
    assert.equal(candles[1]!.openTime, Date.parse('2026-08-15T00:00:00+08:00'))
  } finally { m.restore() }
})

test('fetchKlines: tencent code 非 0 / 无数据 / 空结果报错', async () => {
  for (const body of [
    { code: 1001 },
    { code: 0, data: { sh600000: {} } },
    { code: 0, data: { sh600000: { qfqday: [] } } },
  ]) {
    const m = mockFetch(() => json(body))
    try {
      await assert.rejects(fetchKlines('sh600000', '1d', 1, signal(), 'tencent'), /tencent/)
    } finally { m.restore() }
  }
})

test('fetchKlines: yahoo 校验符号/interval，range 按 limit 选择，截取', async () => {
  const chart = (n: number) => ({
    chart: {
      result: [{
        timestamp: Array.from({ length: n }, (_, i) => 1786752000 + i * 86400),
        indicators: {
          quote: [{
            open: Array.from({ length: n }, () => 1),
            high: Array.from({ length: n }, () => 2),
            low: Array.from({ length: n }, () => 0.5),
            close: Array.from({ length: n }, () => 1.5),
            volume: Array.from({ length: n }, () => 10),
          }],
        },
      }],
    },
  })
  const m = mockFetch(() => json(chart(3)))
  try {
    await assert.rejects(
      fetchKlines('aapl', '1d', 1, signal(), 'yahoo'),
      /invalid yahoo symbol "aapl"/,
    )
    await assert.rejects(
      fetchKlines('AAPL', '1h', 1, signal(), 'yahoo'),
      /yahoo provider supports interval 1d only, got 1h/,
    )
    for (const [limit, range] of [[30, '3mo'], [400, '2y'], [5000, 'max']] as const) {
      await fetchKlines('AAPL', '1d', limit, signal(), 'yahoo')
      const url = new URL(m.calls[m.calls.length - 1]!.url)
      assert.equal(url.searchParams.get('range'), range)
      assert.equal(url.searchParams.get('interval'), '1d')
      assert.ok(url.pathname.endsWith('/AAPL'))
    }
    const candles = await fetchKlines('AAPL', '1d', 2, signal(), 'yahoo')
    assert.equal(candles.length, 2)
    assert.equal(candles[0]!.openTime, 1786752000000 + 86400000)
  } finally { m.restore() }
})

test('fetchKlines: yahoo 无 chart 数据 / 空 klines 报错', async () => {
  for (const body of [{ chart: { result: [] } }, {
    chart: { result: [{ timestamp: [1], indicators: { quote: [{ open: [null], high: [2], low: [0.5], close: [1.5], volume: [1] }] } }] },
  }]) {
    const m = mockFetch(() => json(body))
    try {
      await assert.rejects(fetchKlines('AAPL', '1d', 1, signal(), 'yahoo'), /yahoo fetch/)
    } finally { m.restore() }
  }
})
