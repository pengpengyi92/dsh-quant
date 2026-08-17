# Optiver —— 期权做市的荷兰学派

## 起源（1986）

1986 年成立于阿姆斯特丹，创始团队来自欧洲期权交易所（EOE，即后来的
Euronext）大厅交易员，从场内期权做市起家。名字取自荷兰语「期权」
（optie）与「交易」（handel/ver）。总部阿姆斯特丹，全球 30+ 办公室
（悉尼、上海、新加坡、芝加哥、伦敦等）。

## 演进路线

```
1986 场内期权做市（喊价）
  → 1990s 电子化转型，自研交易系统
  → 2000s 全球扩张（悉尼/美国/亚洲），ETF 与股指期权做市领军
  → 2010s 高速基础设施 + 培训体系成熟（8 周做市博弈训练营）
  → 2020s 挑战赛开源（Ready Trader Go → Optiver Challenge）
```

## 关键里程碑

- 欧洲 ETF 做市常年第一（Euronext Best ETF Market Maker 多届）
- 2012+ 亚太扩张：悉尼总部之外，上海/新加坡/孟买
- 2020-2023 **Ready Trader Go**：开源的做市算法竞赛，全球学生/工程师
  用 Autotrader SDK 写做市 bot 在模拟交易所互搏——把做市思维做成了
  教育产品
- 2023 后 **Optiver Challenge / optibook**：新一代模拟交易所平台，
  结合期权定价与做市
- 收入量级：未上市，年报口径净利润数亿欧元级（2023 Annual Review）

## 文化与管理

- **做市是科学**：内部 8 周训练营教博弈论、定价、速度（「Optiver ready」）
- **数学谜题招聘**：著名的 80 in 8（80 道心算 8 分钟）测试
- 扁平 + 技术驱动：交易员与工程师同台，速度与模型并重
- 公开度介于 Citadel 与 Jane Street 之间：有官方历史页、技术博客与
  开源挑战赛

## 对量化 R&D 的启示

1. **做市 = 定价 + 库存 + 速度**：Optiver 把做市拆成可训练的三件事——
   dsh-quant 的期权板块（BS + 五希腊 + IV）正是定价这一环的方法层
2. **教育即生态**：Ready Trader Go 让全球学生用它的 SDK 学做市——
   用开源教育培育人才与品牌（dsh-quant 的 demo/skill 同思路）
3. **期权是他们的主场**：波动率微笑、库存风险、对冲——这是期权板块
   路线图（微笑/曲面/做市方法层）的直接参照

## 参考

- Optiver 官方：The history of market making and Optiver
- Optiver Annual Review 2023
- Ready Trader Go / sdn-optiver-challenge 仓库（见 quant-repo/optiver.md）
