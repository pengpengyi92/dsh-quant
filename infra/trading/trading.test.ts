/**
 * trading 模块单元测试——策略信号 + 风控门（复用 dsh-risk 数学）
 * 运行: node --experimental-strip-types infra/trading/trading.test.ts
 */
import { createOrder } from '../oms/lifecycle.ts'
import type { Order } from '../oms/lifecycle.ts'
import { SimBroker } from '../oms/broker.ts'
import { signalToOrder } from './strategy.ts'
import type { Signal, Strategy, StrategyContext } from './strategy.ts'
import {
  applyRiskGate, maxNotionalRule, maxExposureRule, sanityRule,
  varNotionalRule, orderNotional,
} from './risk.ts'
import { riskMetrics } from '../../src/dsh-risk/risk.ts'  // 复用 dsh-quant 已验证数学
import type { Bar } from '../data/market.ts'

let passed = 0, failed = 0
function ok(cond: boolean, msg: string) {
  if (cond) { passed++; console.log('  ✓', msg) }
  else { failed++; console.error('  ✗', msg) }
}

// ---- 1. 信号 → 订单草稿 ----
const sig: Signal = { side: 'buy', size: 0.5, ts: 1000, reason: 'ma-cross-up' }
const draft = signalToOrder('BTC-USDT', sig, { equity: 10_000, markPrice: 50_000 })
ok(draft !== null, '信号 → 订单草稿')
ok(draft!.side === 'buy' && draft!.status === 'NEW', '方向正确 + NEW 状态')
ok(Math.abs(draft!.quantity - 0.1) < 1e-9, `数量 = equity×size/price = 0.1（实际 ${draft!.quantity}）`)
ok(signalToOrder('BTC', { ...sig, size: 0 }, { equity: 10_000, markPrice: 50_000 }) === null,
  'size=0（平仓）→ 不下单')

// ---- 2. 风控门：全部通过 → VALIDATED ----
const mkt = { price: 50_000, equity: 10_000 }
const rules = [sanityRule(), maxNotionalRule(0.6), maxExposureRule(6_000)]
let [gatePassed, evP] = applyRiskGate(draft!, rules, mkt)
ok(gatePassed.status === 'VALIDATED', '风控通过 → VALIDATED')
ok(evP.reason === 'risk-passed', '审计: risk-passed')

// ---- 3. 风控门：超名义 → REJECTED + 审计留痕 ----
const bigSig = signalToOrder('BTC-USDT', { side: 'buy', size: 1, ts: 2000 }, { equity: 10_000, markPrice: 50_000 })
let [gateRejected, evR] = applyRiskGate(bigSig!, rules, mkt)
ok(gateRejected.status === 'REJECTED', '超名义 → REJECTED')
ok(evR.reason.startsWith('risk:max-notional'), `审计含规则名（${evR.reason}）`)
ok(!maxNotionalRule(0.6).check(bigSig!, mkt).pass, '规则直接检查也拒绝')

// ---- 4. 复用 dsh-risk：VaR 约束风控 ----
// 构造高波动收益 → var95 大 → 大单被拒
const returns = Array.from({ length: 60 }, (_, i) => (i % 2 === 0 ? 0.03 : -0.03))
const { var95 } = riskMetrics(returns)
ok(var95 > 0, `dsh-risk 算出 var95 = ${(var95 * 100).toFixed(2)}%`)
const varRule = varNotionalRule(var95, 0.05)  // 潜在损失 > 5% equity 拒绝
const bigOrder = createOrder('v1', 'BTC', 'buy', 'market', 2, undefined)
const smallOrder = createOrder('v2', 'BTC', 'buy', 'market', 0.1, undefined)
ok(!varRule.check(bigOrder, mkt).pass, 'VaR: 大单潜在损失超限 → 拒绝')
ok(varRule.check(smallOrder, mkt).pass, 'VaR: 小单在损失预算内 → 通过')

// ---- 5. 策略接口实现（均线交叉示例）----
class MaCross implements Strategy {
  readonly name = 'ma-cross'
  private prev = 0
  onBar(bar: Bar, ctx: StrategyContext): Signal | null {
    const price = bar.c
    if (this.prev === 0) { this.prev = price; return null }
    const up = price > this.prev * 1.01
    this.prev = price
    if (up && ctx.position <= 0) return { side: 'buy', size: 0.5, ts: bar.t, reason: 'ma-cross-up' }
    if (!up && ctx.position > 0) return { side: 'sell', size: 0, ts: bar.t, reason: 'ma-cross-down-flat' }
    return null
  }
}

// ---- 6. 全链路：策略信号 → 风控 → SimBroker 成交 ----
const strat = new MaCross()
const ctx: StrategyContext = { symbol: 'BTC-USDT', position: 0, equity: 10_000, markPrice: 50_000 }
const seedBar: Bar = { t: 3000, o: 49_000, h: 50_000, l: 48_900, c: 50_000, v: 100 }
strat.onBar(seedBar, ctx)  // 首根：预热 prev
const triggerBar: Bar = { t: 4000, o: 50_100, h: 51_200, l: 50_000, c: 51_000, v: 120 }  // +2% > 阈值
const s1 = strat.onBar(triggerBar, ctx)
ok(s1 !== null && s1!.side === 'buy', '策略出买入信号')
const order = signalToOrder(ctx.symbol, s1!, { equity: ctx.equity, markPrice: ctx.markPrice })
ok(order !== null, '信号 → 订单')
const [validated, gateEv] = applyRiskGate(order!, rules, mkt)
ok(validated.status === 'VALIDATED', '过风控 → VALIDATED')
const broker = new SimBroker(1.0)
const result = await broker.submit(validated)
ok(result.status === 'FILLED', 'SimBroker 成交 → FILLED')
const statuses = [gateEv.to, ...broker.audit.map(e => e.to)]
ok(statuses.join('→') === 'VALIDATED→PENDING→FILLED',
  `审计链路完整（${statuses.join('→')}）`)
// size=0.5 × equity=10_000 = 5_000 名义（触发价 51_000 近似，按信号价 50_000 下单）
ok(Math.abs(orderNotional(result, 50_000) - 5_000) < 1e-6, `名义 = equity×size = 5000（实际 ${orderNotional(result, 50_000)}）`)

console.log(`\n结果: ${passed} 通过 / ${failed} 失败`)
if (failed > 0) process.exit(1)
