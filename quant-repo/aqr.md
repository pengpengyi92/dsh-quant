# AQR 开源 repo 专刊

AQR 的「开源」以**论文 + 数据集**为主体（GitHub repo 极少）——
量化界「研究开放度」的天花板。

## 公开资产

| 资产 | 是什么 | 价值 |
|---|---|---|
| **AQR Data Sets** | 官网免费下载的因子数据（BAB/动量/价值/质量等）| 「我们的研究，你来复现」——因子研究的公开基准 |
| 论文库 | Betting Against Beta、Value and Momentum Everywhere… | 因子投资的方法论全集（SSRN 免费）|
| Cliff's Perspectives | 长期公开写作 | 量化思想的免费课程 |

## GitHub 现状

AQR 官方 org 的 repo 极少（研究以论文形态发布）——与 WorldQuant
同属「论文 > repo」型。

## 对 dsh-quant 的启发

1. **数据集是最高级开源**：AQR 把因子数据免费开放——dsh-quant 的
   「免费数据接口 + 渠道知识」是同一哲学的执行层
2. **复现实验路线**：用 AQR Data Sets 跑 `quant_factor_evaluate`
   （IC/RankIC/分层）复现论文结论——把公开基准变成我们的测试集
   （下一步候选实验）
3. **研究即品牌**：AQR 用论文获客——dsh-quant 的
   quant-history/quant-repo 栏目是同一个逻辑的社区版
