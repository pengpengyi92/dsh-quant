/**
 * 期权与波动率手算测试（dsh-risk · Optiver 灵感板块）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bsPrice, impliedVolatility, optionAnalytics } from '../src/dsh-risk/options.ts'
import { realizedVolatility } from '../src/dsh-risk/volatility.ts'

const approx = (a: number, b: number, tol = 1e-4): void => {
  assert.ok(Math.abs(a - b) < tol, `${a} ≈ ${b}`)
}

test('optionAnalytics: ATM 看涨（S=K=100, r=5%, T=1, σ=20%）教科书手算', () => {
  const r = optionAnalytics({ spot: 100, strike: 100, timeToMaturity: 1, riskFreeRate: 0.05, volatility: 0.2, type: 'call' })
  // d1 = (0 + 0.05 + 0.02)/0.2 = 0.35, d2 = 0.15
  // N(0.35)=0.636831, N(0.15)=0.559618
  approx(r.price, 100 * 0.6368306 - 100 * Math.exp(-0.05) * 0.5596177)
  approx(r.price, 10.4506)
  approx(r.delta, 0.6368)
  approx(r.gamma, 0.01876)
  approx(r.vega, 0.3752)
  approx(r.theta, -6.4142, 1e-3)
  approx(r.rho, 0.5323)
  assert.equal(r.impliedVolatility, 0.2)
})

test('optionAnalytics: 看跌期权满足 put-call parity', () => {
  const c = optionAnalytics({ spot: 100, strike: 110, timeToMaturity: 0.5, riskFreeRate: 0.03, volatility: 0.25, type: 'call' })
  const p = optionAnalytics({ spot: 100, strike: 110, timeToMaturity: 0.5, riskFreeRate: 0.03, volatility: 0.25, type: 'put' })
  approx(c.price - p.price, 100 - 110 * Math.exp(-0.03 * 0.5))
  // delta 关系：Δc - Δp = 1
  approx(c.delta - p.delta, 1)
})

test('optionAnalytics: 市场价格 → IV 反解回环', () => {
  const price = bsPrice(100, 105, 0.25, 0.02, 0.3, 'call')
  approx(impliedVolatility(100, 105, 0.25, 0.02, price, 'call'), 0.3, 1e-6)
  const r = optionAnalytics({ spot: 100, strike: 105, timeToMaturity: 0.25, riskFreeRate: 0.02, price, type: 'call' })
  approx(r.impliedVolatility, 0.3, 1e-6)
  approx(r.price, price, 1e-9)
})

test('optionAnalytics: 深实值看涨 delta → 1，深虚值 → 0', () => {
  const itm = optionAnalytics({ spot: 100, strike: 10, timeToMaturity: 0.5, riskFreeRate: 0.05, volatility: 0.2, type: 'call' })
  const otm = optionAnalytics({ spot: 100, strike: 1000, timeToMaturity: 0.5, riskFreeRate: 0.05, volatility: 0.2, type: 'call' })
  approx(itm.delta, 1, 1e-3)
  approx(otm.delta, 0, 1e-3)
  approx(itm.price, 100 - 10 * Math.exp(-0.05 * 0.5), 1e-2)
})

test('optionAnalytics: 前置条件', () => {
  assert.throws(() => optionAnalytics({ spot: 100, strike: 100, timeToMaturity: 1, riskFreeRate: 0.05, type: 'call' }), /exactly one/)
  assert.throws(() => optionAnalytics({ spot: 100, strike: 100, timeToMaturity: 1, riskFreeRate: 0.05, volatility: 0.2, price: 5, type: 'call' }), /exactly one/)
  assert.throws(() => optionAnalytics({ spot: 0, strike: 100, timeToMaturity: 1, riskFreeRate: 0.05, volatility: 0.2, type: 'call' }), /spot/)
  assert.throws(() => optionAnalytics({ spot: 100, strike: 100, timeToMaturity: 0, riskFreeRate: 0.05, volatility: 0.2, type: 'call' }), /timeToMaturity/)
})

test('realizedVolatility: 简单序列手算', () => {
  // 对数收益 [ln(1.1), ln(0.9)] ≈ [0.0953, -0.1054]，均值 ≈ -0.00503，σ ≈ 0.10033
  const r = realizedVolatility([100, 110, 99])
  const lr1 = Math.log(110 / 100)
  const lr2 = Math.log(99 / 110)
  const mean = (lr1 + lr2) / 2
  const per = Math.sqrt(((lr1 - mean) ** 2 + (lr2 - mean) ** 2) / 2)
  approx(r.perPeriod, per)
  approx(r.annualized, per * Math.sqrt(252))
  assert.equal(r.n, 2)
  assert.equal(r.logReturns[0], null)
  approx(r.logReturns[1]!, lr1)
})

test('realizedVolatility: 常数序列 → 0；样本不足 → 0 合法结果', () => {
  assert.equal(realizedVolatility([100, 100, 100]).annualized, 0)
  assert.equal(realizedVolatility([100]).annualized, 0)
  assert.throws(() => realizedVolatility([]), /not be empty/)
  assert.throws(() => realizedVolatility([100, -1]), /positive/)
  assert.throws(() => realizedVolatility([100, 101], 0), /annualization/)
})
