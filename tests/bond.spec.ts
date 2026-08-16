/**
 * 债券分析手算测试（dsh-risk · FICC 联动）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bondAnalytics, priceFromYield, yieldFromPrice } from '../src/dsh-risk/bond.ts'

const approx = (a: number, b: number, tol = 1e-6): void => {
  assert.ok(Math.abs(a - b) < tol, `${a} ≈ ${b}`)
}

test('bondAnalytics: 年付息 2 年 3% 票息 @ YTM 4%（教科书手算）', () => {
  const r = bondAnalytics({ couponRate: 0.03, periodsToMaturity: 2, paymentsPerYear: 1, ytm: 0.04 })
  // P = 3/1.04 + 103/1.04²
  const price = 3 / 1.04 + 103 / 1.04 ** 2
  approx(r.price, price)
  approx(r.price, 98.113905)
  // Mac = (1×2.8846 + 2×95.2293)/98.1139
  approx(r.macaulayDuration, 1.9706, 1e-4)
  approx(r.modifiedDuration, 1.9706 / 1.04, 1e-4)
  // Conv = [3×1×2/1.04³ + 103×2×3/1.04⁴]/P
  const conv = (3 * 1 * 2 / 1.04 ** 3 + 103 * 2 * 3 / 1.04 ** 4) / price
  approx(r.convexity, conv)
  approx(r.dv01, (r.modifiedDuration * r.price) / 10000)
  assert.equal(r.yieldToMaturity, 0.04)
})

test('bondAnalytics: 零息债 10 年 @ 5%', () => {
  const r = bondAnalytics({ couponRate: 0, periodsToMaturity: 10, paymentsPerYear: 1, ytm: 0.05 })
  approx(r.price, 100 / 1.05 ** 10)
  approx(r.macaulayDuration, 10)
  approx(r.modifiedDuration, 10 / 1.05)
  approx(r.convexity, 10 * 11 / 1.05 ** 2)
  approx(r.dv01, (10 / 1.05) * (100 / 1.05 ** 10) / 10000)
})

test('bondAnalytics: 半年付息平价债（coupon = YTM = 6%）→ 价格 100', () => {
  const r = bondAnalytics({ couponRate: 0.06, periodsToMaturity: 2, paymentsPerYear: 2, ytm: 0.06 })
  approx(r.price, 100)
  // 平价半年付息 Mac（期）= (1.03/0.03)(1 - 1/1.03⁴) = 3.8286 期 → 年 = /2
  const macPeriods = (1.03 / 0.03) * (1 - 1 / 1.03 ** 4)
  approx(r.macaulayDuration, macPeriods / 2, 1e-6)
  approx(r.modifiedDuration, (macPeriods / 2) / 1.03)
})

test('bondAnalytics: price ↔ ytm 互算（二分法回环）', () => {
  const p = priceFromYield(100, 0.03, 2, 1, 0.04)
  approx(yieldFromPrice(100, 0.03, 2, 1, p), 0.04, 1e-9)
  const r = bondAnalytics({ couponRate: 0.03, periodsToMaturity: 2, paymentsPerYear: 1, price: p })
  approx(r.yieldToMaturity, 0.04, 1e-9)
  approx(r.price, p, 1e-9)
})

test('bondAnalytics: 前置条件', () => {
  assert.throws(() => bondAnalytics({ couponRate: 0.03, periodsToMaturity: 2 }), /exactly one/)
  assert.throws(() => bondAnalytics({ couponRate: 0.03, periodsToMaturity: 2, ytm: 0.04, price: 100 }), /exactly one/)
  assert.throws(() => bondAnalytics({ couponRate: -0.01, periodsToMaturity: 2, ytm: 0.04 }), /couponRate/)
  assert.throws(() => bondAnalytics({ couponRate: 0.03, periodsToMaturity: 0, ytm: 0.04 }), /periodsToMaturity/)
  assert.throws(() => bondAnalytics({ couponRate: 0.03, periodsToMaturity: 2, paymentsPerYear: 3, ytm: 0.04 }), /paymentsPerYear/)
  assert.throws(() => bondAnalytics({ couponRate: 0.03, periodsToMaturity: 2, ytm: 0 }), /ytm/)
})
