# Man Group —— 1783 年活到现在的量化活化石

## 起源（1783）

1783 年由 James Man 在伦敦创立——最初是**糖桶经纪商**，历经 240 年
演变：经纪 → 大宗商品 → 资产管理 → 全球最大上市对冲基金之一。
「活得久」本身就是 Man Group 的核心能力。

## 多管理人结构

| 分支 | 成立 | 专长 |
|---|---|---|
| Man AHL | 1987 | **CTA/趋势跟踪鼻祖**（Michael Adam、David Harding、Martin Lueck 创立；Harding 后来另创 Winton）|
| Man GLG | 1995 | 主动股票 |
| Man Numeric | 1989 | 波士顿量化股票（前身 Numeric Investors）|
| Man GPM 等 | — | 私募/地产/信贷多线 |

- 伦敦上市（LSE: EMG，FTSE 250）
- AUM：~1700 亿美元级（2024-2025）——「古老 + 巨大 + 系统化」

## 里程碑

- AHL 把**趋势跟踪**从神秘手艺变成科学（移动平均/突破系统化的源头
  之一——与 dsh-quant 的 `quant_backtest` 双均线策略同宗）
- 2020s 持续收购与整合（量化股票、信贷、另类数据）
- 开源：ArcticDB（时间序列数据库）——见 quant-repo/man-group.md

## 对量化 R&D 的启示

1. **趋势跟踪是百年策略**：AHL 证明了「追涨杀跌」系统化后能穿越
   牛熊——双均线/突破回测是最诚实的起点
2. **机构长寿靠结构**：多管理人 + 上市治理 = 不依赖单一天才——
   与 pod 制（Millennium）不同的长寿方案
3. **数据栈开源**：ArcticDB 证明「研究基础设施」是最适合开源的
   层级——dsh-data 域的同类定位

## 参考

- Man Group 官网与年报；man-group GitHub org
