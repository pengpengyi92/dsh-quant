/**
 * OMS lifecycle 单元测试——合法/非法流转 + 成交 + 审计
 * 运行: node --experimental-strip-types infra/oms/lifecycle.test.ts
 */
import { createOrder, transition, fill, replay } from './lifecycle.ts'
import type { Order } from './lifecycle.ts'
import { SimBroker } from './broker.ts'

let passed = 0, failed = 0
function ok(cond: boolean, msg: string) {
  if (cond) { passed++; console.log('  ✓', msg) }
  else { failed++; console.error('  ✗', msg) }
}

// ---- 1. 合法流转 NEW → VALIDATED → PENDING → FILLED ----
let o: Order = createOrder('o1', 'BTC-USDT', 'buy', 'limit', 0.1, 50000)
let evs: any[] = []
;[o, evs] = transition(o, 'VALIDATED', 'ok') as any
;[o, evs] = transition(o, 'PENDING', 'ok') as any
const [filled, ev] = fill(o, 0.1, 50500)
ok(filled.status === 'FILLED', '合法流转到 FILLED')
ok(filled.avgFillPrice === 50500, '均价正确')

// ---- 2. 非法流转应抛错（防错）----
let threw = false
try {
  const bad = createOrder('o2', 'BTC', 'buy', 'market', 1)
  transition(bad, 'FILLED', 'illegal')  // NEW → FILLED 非法
} catch { threw = true }
ok(threw, '非法流转 NEW→FILLED 被拒绝')

// ---- 3. 部分成交 ----
let p = createOrder('o3', 'BTC', 'sell', 'limit', 0.2, 50000)
p = transition(p, 'VALIDATED', 'ok')[0]
p = transition(p, 'PENDING', 'ok')[0]
let [part, evP] = fill(p, 0.1, 51000)
ok(part.status === 'PARTIALLY_FILLED', '部分成交 → PARTIALLY_FILLED')
let [full, evF] = fill(part, 0.1, 52000)
ok(full.status === 'FILLED', '补足 → FILLED')
ok(Math.abs(full.avgFillPrice! - 51500) < 1e-9, '加权均价 51500 正确')

// ---- 4. 撤单竞态：PENDING_CANCEL → FILLED 允许 ----
let c = createOrder('o4', 'BTC', 'buy', 'limit', 0.1, 50000)
c = transition(c, 'VALIDATED', 'ok')[0]
c = transition(c, 'PENDING', 'ok')[0]
c = transition(c, 'PENDING_CANCEL', 'user-cancel')[0]
let [cFilled, evC] = fill(c, 0.1, 50000)  // 撤单前已成交（竞态）
ok(cFilled.status === 'FILLED', '撤单竞态：PENDING_CANCEL→FILLED 允许')

// ---- 5. 审计回放 ----
const auditEvents = evP && evF ? [evP, evF] : []
ok(replay(auditEvents).length === 2, '审计事件可回放（partial→full 两事件）')

// ---- 6. SimBroker 集成 ----
const broker = new SimBroker(1.0)  // 必成交
const ob = SimBroker.newOrder('b1', 'BTC', 'buy', 'market', 0.5)
const result = await broker.submit(ob)
ok(result.status === 'FILLED', 'SimBroker 必成交 → FILLED')
ok(result.filledQty === 0.5, '成交数量正确')
ok(broker.audit.some(e => e.to === 'FILLED'), 'broker 审计含 FILLED 事件')

console.log(`\n结果: ${passed} 通过 / ${failed} 失败`)
if (failed > 0) process.exit(1)
