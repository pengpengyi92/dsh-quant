# WorldQuant —— Alpha 工厂与开源式研究平台

## 起源（2007）

2007 年由 Igor Tulchinsky 创立（前 Millennium 交易员/研究员）。定位
独特：**把 alpha 研发变成流水线**——不是靠少数天才，而是靠平台与
流程，让全球成千上万研究员协同生产 alpha。

## Alpha 工厂模式

```
研究员网络（全球兼职/全职顾问）
  → BRAIN 平台（alpha 仿真与验证）
  → 合规的 alpha 入库
  → 组合层配置（Millennium Advisors 等载体）
```

- **BRAIN / WebSim**：Web 端 alpha 仿真平台——写表达式 → 回测 → 提交
- **WorldQuant Challenge**：全球竞赛，公开赛题与数据，胜者获奖金/全职
- **WorldQuant University**：免费在线金融工程硕士
- 2025 Forbes 报道：Tulchinsky 用 ChatGPT 式 AI 加速模型研究流程

## 公开研究遗产

- **101 Formulaic Alphas**（Kakushadze, 2016）：把 101 个量价 alpha
  写成公式论文——因子研究的公开教科书，全球 quant 的入门读物
- 规模：WorldQuant Millennium Advisors 管理规模近 300 亿美元
  （Hedgeweek）

## 对量化 R&D 的启示

1. **alpha 可以工业化**：WebSim 证明「写因子 → 仿真 → 入库」能变成
   标准流水线——dsh-quant 的 `quant_factor_evaluate` + `quant_walk_forward`
   就是这个流水线的最小开源版
2. **101 Alphas 是公开基准**：我们的因子板块可以拿它当验收集
3. **平台即护城河**：WorldQuant 的护城河不是单个 alpha，是生产
   alpha 的平台——「工具与方法公开，组合与参数内部」的边界样本

## 参考

- Forbes 2025: How a quant billionaire is powering his trading models with AI
- Hedgeweek: WorldQuant Millennium Advisors ~$30bn
- 101 Formulaic Alphas（Journal of Portfolio Management / SSRN）
