# dsh-risk（PRT 映射：风控域）

风险度量与模型检验。

- risk.ts：VaR/CVaR（历史法）、下行偏差、最大回撤、Beta、Jensen Alpha、
  信息比率、跟踪误差 + Kupiec POF 检验（VaR 回测）
- drawdown.ts：回撤分析（underwater/峰谷恢复/时长）
- bond.ts：债券分析（价格↔收益率互算、麦考利/修正久期、凸性、DV01）——
  FICC 联动模块

## FICC 联动（PFIC）

bond.ts 是公开侧的固定收益方法论，与内部 PFIC（Pengyi FICC）同语言：
**公开方法（定价/久期/凸性），头寸/策略/执行支持在内部**。数据侧联动：
中债登估值（chinabond）与 CFETS（cfets）渠道见 quant_data_guide。
边界说明：连续复利、日期计数与曲线构建约定不在本模块范围，留给内部。

原则：金标准对齐 empyrical；检验工具化（模型准不准有标准答案）。
