# Shenzhen Quant Firm Revenue-per-Head Benchmark V0.2

**Timestamp:** 2026-09-28  
**Scope:** Shenzhen / Greater Bay Area quant firms already covered by our DD work.

## Methodology

Primary normalized metric:

```text
Normalized Revenue / Head
= AUM × 2% normalized gross monetization rate ÷ headcount
```

This is an apples-to-apples benchmark, **not reported company revenue**.

Always separate:
1. public / sourced AUM,
2. public / sourced headcount,
3. normalized 2% benchmark,
4. firm-specific revenue scenario when separately modeled.

## Current ranking

| Rank | Firm | AUM working range | Headcount | AUM / Head | 2% normalized revenue / head |
|---:|---|---:|---:|---:|---:|
| 1 | JHL / Evolution Asset Management | 400–500bn RMB | 37 | 1.08–1.35bn RMB | 21.6–27.0m RMB |
| 2 | Zhixing Tongda | 200bn+ RMB | 35 | 571m+ RMB | 11.4m+ RMB |
| 3 | Century Frontier | 600bn+ RMB | 100+ | ~600m RMB order | ~12m RMB order |
| 4 | Ubiquant / 九坤 | 800bn RMB | 178 | ~449m RMB | ~8.99m RMB |
| 5 | HopeSeek / 宏锡* | 100–150bn RMB | ~25 | 400–600m RMB | 8–12m RMB |
| 6 | Qianhui | 100–150bn RMB | ~47 | 213–319m RMB | 4.26–6.38m RMB |
| 7 | Maoyuan | 400–500bn RMB | ~160 | 250–313m RMB | 5.0–6.25m RMB |
| 8 | Dadao | 100bn+ RMB | ~45 | 222m+ RMB | 4.44m+ RMB |
| 9 | Jasper / Dayan | 100bn+ RMB | 40+ | ~250m+ RMB | ~5m+ RMB |
| 10 | Yansheng | 50–100bn RMB | ~32 | 156–313m RMB | 3.13–6.25m RMB |
| 11 | Jiuqi Lianghe | 20–50bn RMB | ~35 | 57–143m RMB | 1.14–2.86m RMB |

*HopeSeek is Zhongshan-headquartered and is retained for Greater Bay Area comparison.

## Newly added firms

### Century Frontier
- public materials: 600bn+ AUM, 100+ team
- research / risk share >70%
- economic density: roughly 600m AUM/head order of magnitude
- normalized revenue/head: roughly 12m RMB order

### Zhixing Tongda
- public materials: 200bn+ AUM
- public headcount: ~35
- AUM/head >= 571m RMB
- normalized revenue/head >= 11.4m RMB
- if AUM approaches 300bn, normalized revenue/head approaches 17.1m RMB

### Ubiquant / 九坤
- public AUM anchor: ~800bn RMB
- public employee anchor: ~178
- AUM/head ~449m RMB
- normalized revenue/head ~8.99m RMB
- Shenzhen office: PAFC / Ping An Finance Center

## GOD-level takeaways

### 1. Revenue density is an organizational variable
AUM scale alone is insufficient. The more useful institutional metric is:

```text
Economic Density
= monetizable capital / organizational complexity
```

### 2. Two different winning architectures

```text
Heavy Platform
Maoyuan / Ubiquant / Century Frontier
→ larger team
→ more engineering / infra / research specialization
→ platform leverage
```

vs.

```text
Compact Research Institution
JHL / Zhixing Tongda
→ fewer people
→ high AUM/head
→ high decision and research density
```

### 3. Revenue/head is not salary/head

```text
Revenue / Head
→ fixed compensation
→ compute / data / execution
→ operating costs
→ bonus pool
→ retained profit
```

Never equate the benchmark directly with employee compensation.

## Next DD queue

Priority data gaps:
1. Chengqi — exact headcount
2. Super Quantum — exact headcount
3. Bopu — AUM + headcount
4. Anzi — AUM + headcount
5. Guoen — AUM + headcount
6. Hemei — AUM + headcount
7. Command / 康曼德 — AUM + headcount
8. Tairun Haiji — AUM + headcount

## Update rule

Every new firm DD should record:

```text
firm
snapshot_date
AUM_low
AUM_high
headcount
AUM_per_head
normalized_rate
normalized_revenue_per_head
firm_specific_revenue_low
firm_specific_revenue_high
source_confidence
notes
```
