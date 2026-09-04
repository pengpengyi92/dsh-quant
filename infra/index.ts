/**
 * dsh-quant-infra · 统一入口（barrel）
 * =====================================================
 * data（进）→ trading（出）→ OMS（订单生命周期）——三模块一个入口。
 * 上层策略 import { ... } from 'dsh-quant-infra' 即可。
 */
export * from './data/market.ts'
export * from './oms/lifecycle.ts'
export * from './oms/broker.ts'
export * from './trading/strategy.ts'
export * from './trading/risk.ts'
