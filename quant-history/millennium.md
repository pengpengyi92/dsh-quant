# Millennium Management —— 多策略之王的 pod 工厂

## 起源（1989）

1989 年由 Israel "Izzy" Englander 在纽约创立。Englander 此前在 Kaufman,
Alsberg 与 Jamie Securities 做可转债与期权交易。Millennium 从一家小
自营机构成长为全球最大的多策略对冲基金之一。

## pod 结构：多策略的组织学

Millennium 的招牌是 **pod shop** 模式：

- 数百个独立交易团队（pods），各有策略与盈亏（P&L）
- 中央风控：每个 pod 有回撤红线（通常 5%-7.5%），触发即砍仓/撤资
- 收益分成（pass-through）：pod 赚得多分得多，亏得多走人
- 结果：多策略低相关 + 严格风控 → **近 30 年几乎年年正收益**
  （2008 年仅 -3%，2018 年微亏为罕见例外）

## 规模与里程碑

- 管理规模：~700 亿美元级（2024-2025）
- 员工数千人（研究员/工程师/trader 混编）
- 与 Citadel 并称多策略双雄；两者 2025 年同列非银做市/多策略收入第一梯队

## 文化

- **业绩即一切**：淘汰率高，激励机制极端市场化
- **风控是宪法**：中央风险团队权力高于任何 pod
- 保密文化与 Citadel 类似，公开信息极少

## 对量化 R&D 的启示

1. **风控是组合层的第一公民**：Millennium 用「单 pod 红线」把分散
   变成纪律——dsh-quant 的 `quant_risk`/`quant_drawdown` 就是这条
   红线的量化工具
2. **多策略 = 低相关的艺术**：pod 独立 + 中央砍仓 = 策略级风险平价
3. **淘汰机制的另一面**：残酷的业绩文化换来的是「永远有人替你试新
   策略」——R&D 流水线的极致形态

## 参考

- Hedgeweek: WorldQuant Millennium Advisors ~$30bn（关联实体报道）
- 公开访谈与 13F 数据（whalewisdom）
