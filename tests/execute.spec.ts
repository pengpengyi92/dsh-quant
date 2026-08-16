/**
 * 交易执行模拟手算测试（dsh-execution，无实盘）。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { executeSimulate } from '../src/dsh-execution/execute.ts'

const close = [100, 101, 102, 103, 104]

test('executeSim: 一买一卖全程手算', () => {
  const r = executeSimulate(close, [
    { index: 0, side: 'buy', quantity: 1 },
    { index: 2, side: 'sell', quantity: 1 },
  ], { initialCash: 1000, feeRate: 0.001 })
  assert.equal(r.tradeCount, 2)
  assert.equal(r.unfilledCount, 0)
  // buy: fill@1 price 101, fee 0.101 → cash 898.899, position 1
  const buy = r.fills[0]!
  assert.equal(buy.fillIndex, 1)
  assert.equal(buy.fillPrice, 101)
  assert.ok(Math.abs(buy.fee - 0.101) < 1e-9)
  assert.ok(Math.abs(buy.cashAfter - 898.899) < 1e-9)
  assert.equal(buy.positionAfter, 1)
  // sell: fill@3 price 103, fee 0.103 → cash 1001.796, position 0
  const sell = r.fills[1]!
  assert.equal(sell.fillIndex, 3)
  assert.ok(Math.abs(sell.cashAfter - 1001.796) < 1e-9)
  assert.equal(sell.positionAfter, 0)
  // 盯市权益
  assert.ok(Math.abs(r.equityCurve[1]! - 999.899 / 1000) < 1e-9)
  assert.ok(Math.abs(r.equityCurve[4]! - 1001.796 / 1000) < 1e-9)
  assert.ok(Math.abs(r.totalFee - 0.204) < 1e-9)
  assert.ok(Math.abs(r.totalReturnPct - 0.1796) < 1e-9)
  assert.equal(r.position, 0)
})

test('executeSim: 滑点成本（100bps 买入）', () => {
  const r = executeSimulate(close, [{ index: 0, side: 'buy', quantity: 1 }], {
    initialCash: 1000, feeRate: 0.001, slippageBps: 100,
  })
  const f = r.fills[0]!
  assert.equal(f.fillPrice, 102.01)
  assert.ok(Math.abs(f.slippageCost - 1.01) < 1e-9)
  assert.ok(Math.abs(r.totalSlippageCost - 1.01) < 1e-9)
})

test('executeSim: valueFraction 按当前权益下单', () => {
  const r = executeSimulate(close, [{ index: 0, side: 'buy', valueFraction: 0.5 }], {
    initialCash: 1000, feeRate: 0.001,
  })
  const f = r.fills[0]!
  // 权益 1000 → 500/101 ≈ 4.9504950 股
  assert.ok(Math.abs(f.quantity - 500 / 101) < 1e-9)
  assert.ok(Math.abs(f.cashAfter - 499.5) < 1e-9)
})

test('executeSim: 卖出受持仓约束（空仓卖出 → unfilled）', () => {
  const r = executeSimulate(close, [{ index: 0, side: 'sell', quantity: 5 }], { initialCash: 1000 })
  assert.equal(r.tradeCount, 0)
  assert.equal(r.unfilledCount, 1)
})

test('executeSim: 现金不足 → unfilled', () => {
  const r = executeSimulate(close, [{ index: 0, side: 'buy', quantity: 100 }], { initialCash: 10 })
  assert.equal(r.tradeCount, 0)
  assert.equal(r.unfilledCount, 1)
})

test('executeSim: 越界订单 / 延迟越界 → unfilled', () => {
  const r = executeSimulate(close, [
    { index: 4, side: 'buy', quantity: 1 },        // index >= n-1
    { index: 3, side: 'buy', quantity: 1 },        // fill = 4+1+latency(2)=6 越界
  ], { initialCash: 1000, latencyBars: 2 })
  assert.equal(r.tradeCount, 0)
  assert.equal(r.unfilledCount, 2)
})

test('executeSim: 前置条件', () => {
  assert.throws(() => executeSimulate([100], []), /at least 2/)
  assert.throws(() => executeSimulate(close, [], { initialCash: 0 }), /initialCash/)
  assert.throws(() => executeSimulate(close, [], { feeRate: -1 }), /feeRate/)
  assert.throws(() => executeSimulate(close, [], { latencyBars: 1.5 }), /latencyBars/)
})
