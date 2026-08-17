# Two Sigma 开源 repo 专刊

Two Sigma 是「披着对冲基金外衣的科技公司」——开源也走科技公司
路线：twosigma org 下有多个数据科学/工程库。

## 核心 repo

| repo | 是什么 | 能学到什么 |
|---|---|---|
| [twosigma/flint](https://github.com/twosigma/flint) | **大规模时间序列库**（基于 Spark）| 金融时间序列的分布式处理：对齐、窗口、缺失值——「数据工程怎么为量化服务」的完整样本 |
| [twosigma/beakerx](https://github.com/twosigma/beakerx) | Jupyter 扩展套件（已归档）| 研究员工作台的 UI 思维：表格/绘图/交互——历史价值大于现状 |

## org 其他

twosigma org 另有内核与工具库若干（beakerx_kernel_base 等）。

## 对 dsh-quant 的启发

1. **flint 的「对齐」哲学**：时间序列的等长对齐、窗口语义、缺失
   处理——dsh-quant 的「null 对齐契约」是单机版，flint 是分布式版
2. **BeakerX 的遗产**：研究员需要可交互的工作台——dsh-quant-ui
   是同一需求在 agent 时代的新答案
3. **科技公司式开源**：Two Sigma 开源的是「研究基础设施」而非
   「交易基础设施」——边界分层比 JS 还清晰
