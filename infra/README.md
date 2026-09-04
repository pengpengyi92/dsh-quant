# dsh-quant-infra — 量化基础设施开发包

> 从 dsh-quant（Everything-Plugin Quant OS）衍生的**基建骨架**——data + trading 双模块 + OMS 订单生命周期。
> 设计: `PRDT/knowledge/ai/dsh-quant-infra-design-2026-09.md`

## 一句话

**量化系统的"操作系统"**：数据怎么进（data）、订单怎么走（OMS/lifecycle）、交易怎么跑（trading）——上层策略只管信号，不管基建。

## 结构

```
infra/
├── oms/           # ⭐ OMS 订单生命周期（核心新能力）
│   ├── lifecycle.ts  # 订单状态机 + 审计事件（NEW→VALIDATED→PENDING→FILLED...）
│   ├── broker.ts     # Broker 抽象（SimBroker 模拟，实盘 adapter 由外部实现）
│   └── lifecycle.test.ts  # 16 测试全过（合法/非法流转/部分成交/撤单竞态/撤单路由/审计）
├── data/          # 数据模块
│   └── market.ts     # 行情/历史接口 + 归一化（秒→毫秒）+ 质量检查 + 重采样
├── trading/       # 交易模块（策略信号 → 风控门 → OMS）
│   ├── strategy.ts   # 策略接口（onBar/onTick → Signal）+ 信号→订单草稿
│   ├── risk.ts       # 风控门（maxNotional/maxExposure/VaR 约束 → VALIDATED/REJECTED）
│   └── trading.test.ts  # 18 测试全过（信号草稿/风控/全链路/复用 dsh-risk 数学）
└── index.ts        # 统一入口（barrel）
```

**信号流（闭环）**：`onBar/onTick → Signal → signalToOrder() → Order(NEW) → 风控门（VALIDATED/REJECTED）→ broker.submit（PENDING→FILLED）`

## OMS 订单生命周期（核心）

```
NEW → VALIDATED → PENDING → PARTIALLY_FILLED → FILLED
      ↓            ↓            ↓
   REJECTED    PENDING_CANCEL  PENDING_CANCEL → CANCELLED
```

- **不可逆状态机**：非法流转抛错（防错）
- **审计事件**：每步 {ts, from, to, reason}——全生命周期可回放（赤诚）
- **撤单竞态**：PENDING_CANCEL → FILLED 允许（可能已成交）

## 设计原则

1. 纯函数核心（零依赖可测）
2. 状态机不可逆（防错）
3. Broker 可插拔（模拟→纸面→实盘只换 adapter——POKX 边界哲学）
4. 审计留痕（每步 lifecycle 事件）
5. 上层策略无关

## 运行测试

```bash
node --experimental-strip-types infra/oms/lifecycle.test.ts      # 16 通过 / 0 失败
node --experimental-strip-types infra/trading/trading.test.ts    # 18 通过 / 0 失败
# 合计 34 测试全绿（node >= 22.6 原生 TS 类型剥离，零依赖）
```

## 风控门（trading/risk）

- 下单前闸门：全部规则通过 → `VALIDATED`；任一拒绝 → `REJECTED`（审计留痕 `risk:<rule>:<reason>`）
- 内置规则：`sanityRule` / `maxNotionalRule` / `maxExposureRule` / `varNotionalRule`
- **复用 dsh-quant dsh-risk**：VaR 约束的 `var95` 用 `riskMetrics(returns).var95` 计算喂入——已验证数学复用在调用侧，infra 零依赖

## 关联
- 母项目: dsh-quant（alpha/combo 在上层）
- 消费方: PMMT/PTFT（PMMT 的 paper_trader 可接 OMS）
- 哲学: P-Research Eval 主线（审计 = eval trail）· POKX 边界（不接实盘）
