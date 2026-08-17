# WorldQuant 开源 repo 专刊

WorldQuant 的公开姿态独树一帜：**repo 极少，但「公开研究资产」极多**——
它开源的载体不是 GitHub，而是论文与平台。

## 公开研究资产

| 资产 | 是什么 | 价值 |
|---|---|---|
| **101 Formulaic Alphas**（Kakushadze 2016）| 101 个量价 alpha 公式论文 | 因子研究的公开教科书；dsh-alpha 的验收集 |
| **BRAIN / WebSim 平台** | 免费 Web alpha 仿真 | 「写表达式→回测→入库」的产品化样本 |
| **WorldQuant University** | 免费在线金融工程硕士 | 系统化 quant 教育 |

## 社区实现（GitHub 上的 101 Alphas 移植）

101 Alphas 在 GitHub 有大量社区实现（Python 为主），搜索
`101 Formulaic Alphas` 即可找到一批可运行的因子库——把论文变成
`quant_factor_evaluate` 的测试输入非常顺手。

## 对 dsh-quant 的启发

1. **论文 > repo**：WorldQuant 证明公开价值不一定以代码形式存在——
   quant-history/quant-repo 双栏目正好覆盖这两种形态
2. **101 Alphas 是现成的因子基准**：建议后续做一次「101 因子的
   dsh-quant 复现实验」（demo + 日志），让 dsh-alpha 与公开教科书对齐
3. **平台型开源**：WebSim 是「开源思想 + 闭源平台」——研究流水线的
   终极形态，值得持续观察
