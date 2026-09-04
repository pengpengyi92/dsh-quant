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
│   └── lifecycle.test.ts  # 11 测试全过（合法/非法流转/部分成交/撤单竞态/审计）
├── data/          # 数据模块
│   └── market.ts     # 行情/历史接口 + 归一化（秒→毫秒）+ 质量检查 + 重采样
└── trading/       # （设计预留：strategy/execution/risk——复用 dsh-quant 现有）
```

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
node --experimental-strip-types infra/oms/lifecycle.test.ts
# 结果: 11 通过 / 0 失败
```

## 关联
- 母项目: dsh-quant（alpha/combo 在上层）
- 消费方: PMMT/PTFT（PMMT 的 paper_trader 可接 OMS）
- 哲学: P-Research Eval 主线（审计 = eval trail）· POKX 边界（不接实盘）
