/**
 * dsh-quant-infra · trading 模块 · 风控门（下单前检查）
 * =====================================================
 * 风控 = 订单进入 VALIDATED 前的闸门：
 *   全部规则通过 → NEW → VALIDATED（'risk-passed'）
 *   任一规则拒绝 → NEW → REJECTED（'risk:<rule>:<reason>'，审计留痕）
 * 已过 PENDING 的订单不能再走风控门（要撤走 cancel 路径）——transition 抛错防错。
 *
 * 复用 dsh-quant dsh-risk（不重造轮子）：
 *   VaR 约束规则的 var95 由调用方用 dsh-risk riskMetrics(returns).var95 计算喂入
 *   ——infra 保持零依赖，已验证的数学复用在调用侧。
 */
import { transition } from '../oms/lifecycle.ts'
import type { Order, LifecycleEvent } from '../oms/lifecycle.ts'

/** 风控所需的市场快照（纯数据，调用方喂入） */
export interface MarketSnapshot {
  /** 当前市价（market 单计价用；limit 单用 order.price） */
  price: number
  /** 账户权益 */
  equity: number
  /** 组合已有名义敞口（不含本单）——maxExposureRule 用 */
  existingNotional?: number
}

export interface RiskDecision {
  pass: boolean
  /** 拒绝时：规则名 */
  rule?: string
  /** 拒绝时：原因（进审计 reason） */
  reason?: string
}

/** 风控规则：纯函数检查一张 NEW 订单 */
export interface RiskRule {
  readonly name: string
  check(order: Order, market: MarketSnapshot): RiskDecision
}

/** 订单名义金额（limit 用限价，market 用市价） */
export function orderNotional(order: Order, price: number): number {
  return order.quantity * price
}

/** 单笔名义上限 = equity × frac */
export function maxNotionalRule(maxFracOfEquity: number): RiskRule {
  return {
    name: `max-notional-${maxFracOfEquity}`,
    check(order, m) {
      const notional = orderNotional(order, order.price ?? m.price)
      const cap = m.equity * maxFracOfEquity
      if (notional > cap) {
        return { pass: false, reason: `notional ${notional.toFixed(4)} > cap ${cap.toFixed(4)}` }
      }
      return { pass: true }
    },
  }
}

/** 组合总敞口上限（本单 + 已有） */
export function maxExposureRule(maxTotalNotional: number): RiskRule {
  return {
    name: `max-exposure-${maxTotalNotional}`,
    check(order, m) {
      const notional = orderNotional(order, order.price ?? m.price)
      const total = notional + (m.existingNotional ?? 0)
      if (total > maxTotalNotional) {
        return { pass: false, reason: `total exposure ${total.toFixed(4)} > ${maxTotalNotional}` }
      }
      return { pass: true }
    },
  }
}

/**
 * VaR 约束：单笔潜在损失 = notional × var95 ≤ equity × lossFrac。
 * var95 由调用方用 dsh-risk riskMetrics(returns).var95 喂入（复用已验证数学）。
 */
export function varNotionalRule(var95: number, lossFrac: number): RiskRule {
  return {
    name: `var-notional-${(var95 * 100).toFixed(1)}pct`,
    check(order, m) {
      const notional = orderNotional(order, order.price ?? m.price)
      const worstLoss = notional * var95
      const cap = m.equity * lossFrac
      if (worstLoss > cap) {
        return { pass: false, reason: `var-loss ${worstLoss.toFixed(4)} > cap ${cap.toFixed(4)}` }
      }
      return { pass: true }
    },
  }
}

/** 基本健全性：数量 > 0；限价单价格 > 0 */
export function sanityRule(): RiskRule {
  return {
    name: 'sanity',
    check(order, m) {
      if (!(order.quantity > 0)) return { pass: false, reason: `qty ${order.quantity} <= 0` }
      if (order.price != null && order.price <= 0) {
        return { pass: false, reason: `limit price ${order.price} <= 0` }
      }
      if (!(m.price > 0)) return { pass: false, reason: `market price ${m.price} <= 0` }
      return { pass: true }
    },
  }
}

/** 全部规则通过 → VALIDATED；任一拒绝 → REJECTED。返回 [订单, 审计事件] */
export function applyRiskGate(
  order: Order,
  rules: RiskRule[],
  market: MarketSnapshot,
): [Order, LifecycleEvent] {
  for (const rule of rules) {
    const d = rule.check(order, market)
    if (!d.pass) {
      const reason = `risk:${rule.name}:${d.reason ?? 'denied'}`
      return transition(order, 'REJECTED', reason, { rule: rule.name })
    }
  }
  return transition(order, 'VALIDATED', 'risk-passed')
}
