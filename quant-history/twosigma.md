# Two Sigma —— 把「科学方法」当公司名字的 ML 先驱

## 起源（2001）

2001 年成立于纽约，创始人 John Overdeck 与 David Siegel 都来自
DE Shaw——Overdeck 是数学天才（IMO 银牌/斯坦福），Siegel 是
DE Shaw 前 CTO（MIT 计算机博士）。公司名 Two Sigma 直指统计学的
「两个标准差」——科学方法就是他们的品牌。

## 演进路线

```
2001 科学方法 + 机器学习起家
  → 2000s 数据基础设施自建（比大多数同行早十年）
  → 2010s 规模爆发：AUM 至 ~600 亿美元级，全球办公室扩张
  → 2019 Two Sigma Venn（面向外部投资者的分析平台）
  → 2020s 规模调整（行业性），ML 研究继续加码
```

## 文化

- **ML-first**：公司内部像科技公司——内部 Kaggle 竞赛、模型平台、
  研究氛围；「我们是披着对冲基金外衣的科技公司」
- 开源老手：BeakerX（Jupyter 扩展）、Flint（时间序列库）——见
  quant-repo/twosigma.md
- 双创始人共治：Overdeck（数学/交易）+ Siegel（工程/技术）的
  双头结构，两人都是家长式技术领袖

## 对量化 R&D 的启示

1. **数据基础设施先于策略**：Two Sigma 自建数据平台再谈 alpha——
   dsh-quant 的 dsh-data 域（质量/标注/渠道）就是这个顺序
2. **科学方法可复现**：一切研究要「可复现」——我们的手算测试
   + seed 可复现（PMMLAB 归档规则）同源
3. **ML 是放大器不是魔法**：Two Sigma 证明了 ML 在量化里的正路是
   基础设施化，而不是单点模型

## 参考

- twosigma GitHub org（beakerx/flint）
- 公开采访与财报披露
