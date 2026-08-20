# 专题报告：Citadel 超级深挖专刊（CITADEL SPECIAL · 规模之王）

> 档案（citadel.md）的深挖版。核心问题：**为什么 Citadel 是
> 量化世界的规模之王**？——双引擎（多策略基金 + 全球最大做市商）
> 如何互相喂养，从哈佛宿舍一路长成最赚钱对冲基金的历史。

## 一、规模之王的数据底座

| 指标 | 数字 | 口径 |
|---|---|---|
| 2022 年基金利润 | **~$160 亿**（对冲基金史上单年最高） | LCH Investments / Advisor Perspectives |
| 2023 年基金利润 | ~$63 亿（连续三年登顶「最赚钱对冲基金」） | LCH Investments memo |
| 2024-2025 累计 | 旗舰基金 2021-2025 四年累计赚 **~$570 亿**（prospectus 口径） | Hedgeweek |
| 基金 AUM | ~$650-700 亿（2024，SHOWDOWN 口径） | 多源 |
| Citadel Securities 2024 交易收入 | **$97 亿**（超 Barclays，同比 +55%） | Bloomberg / Hedgeweek |
| Citadel Securities 2025 交易收入 | **$120 亿**（再创纪录） | Bloomberg 2026-03 |
| 非银做市收入池 | Jane Street + Citadel Securities 合计 $1140 亿（2024-2025） | Hedgeweek |
| Griffin 身家 | ~$480 亿（2025 口径） | 财富榜综合 |

**对照**：XTX 是「人均之王」（200 人 / £12.8 亿利润）；Citadel 是
**「总量之王」**——用十倍于 XTX 的人，做出十倍的利润，同时拥有
基金与做市两条命脉。

## 二、起源（1990 · 哈佛宿舍）

- **Kenneth C. Griffin**：哈佛经济学出身，大二时说服校方在宿舍装
  卫星天线接收债券数据，做可转换债券套利——**「宿舍卫星天线」
  是量化圈最著名的白手起家意象**（另有「从亲戚处募集 ~$26.5 万」
  口径，见 citadel.md）
- 1987 年进入 Glenwood Capital 做可转债套利 → 1990 年（22 岁）
  用自有资金 + 外部资本创立 Citadel
- 名字：**Citadel（城堡）**——防御性命名，与 XTX「名字无意义」
  形成命名学两极（对照 SIGNATURES 命名学栏目）

## 三、历史时间线

| 时间 | 事件 |
|---|---|
| 1990 | 芝加哥成立；可转债套利起家 |
| 1994-1998 | 拓展固收/股票；成长为芝加哥大机构（对标当年的「芝加哥帮」） |
| 1998 | 长期资本（LTCM）危机波及，Citadel 一度传闻承压但存活 |
| 2002 | **Citadel Securities 成立**——做市引擎点火 |
| 2006 | 收购芝加哥期权做市商（期权业务起步） |
| 2008 | **金融危机重创：基金巨亏 ~55%**；格里芬自掏腰包数亿美元
  （「自渡」叙事），限制赎回 + 重组 |
| 2009-2011 | 缓慢恢复；2010 前后量化/做市业务重新扩张 |
| 2012-2016 | **Citadel Securities 借 HFT + 订单流付费（PFOF）崛起**，
  成为美股零售订单流最大执行方之一 |
| 2020-2021 | 疫情波动市大赚；2021 GameStop 事件：Citadel Securities
  是 Robinhood 订单流主要执行方，与 Point72 共同向 Melvin
  Capital 注资 ~$27.5 亿——国会听证把 PFOF 推向公众 |
| 2022 | 基金赚 **$160 亿**（史上单年最高）；总部从芝加哥迁往迈阿密 |
| 2023 | 基金再赚 ~$63 亿，连续登顶 LCH 最赚钱榜单 |
| 2024 | Citadel Securities 交易收入 $97 亿（超 Barclays）；基金
  表现回落（天然气交易失利，年度收益 2018 以来最低） |
| 2025 | Citadel Securities 交易收入 $120 亿再创纪录；与 Jane Street
  合计非银做市收入池 $1140 亿 |

## 四、双引擎架构（Citadel 模式的秘密核心）

```
                    Citadel 集团（Griffin 全资控制）
                    ┌──────────────┬──────────────┐
        Citadel（对冲基金）      Citadel Securities（做市）
        1990 · 多策略 · AUM~700亿    2002 · 全球最大做市商之一
        股票/固收/宏观/量化/商品      美股零售订单流/期权/ETF/固收
        └──────────────┴──────────────┘
           共享：技术平台 · 数据 · 人才池 · 风控基建
```

- **CAPITAL_MODEL 报告的「双引擎」样本**：基金侧募资（客户钱 +
  管理费/业绩费）与做市侧自营（订单流 + 价差收入）互不依赖——
  一条命脉波动时另一条兜底（2008 基金巨亏时做市侧未崩塌）
- **订单流信息优势**：做市商看到全市场零售订单流，反哺基金侧
  的微观结构判断——「数据流喂养」是双引擎协同的核心
- **Griffin 全资控制**：与 Millennium/Point72 的 pod 分成不同，
  Citadel 顶层利润归格里芬（个人身家 ~$480 亿的来源）

## 五、与 XTX 的极致对照（人均之王 vs 规模之王）

| 维度 | XTX | Citadel |
|---|---|---|
| 规模 | ~200 人 | 数千人（基金 + 做市） |
| 结构 | 单一业务（电子做市）| 双引擎（基金 + 做市） |
| 资本 | 纯自营不募资 | 基金募资 + 做市自营 |
| 利润 | £12.8 亿（2024）| 基金 $160 亿峰值 + 做市 $97-120 亿收入 |
| 文化 | 数学家俱乐部 · 扁平合伙 | 精英竞技场 · 极度保密 NDA |
| 名字 | 无意义 | 城堡（防御命名）|

**结论：量化赚钱有两条相反路径——XTX 证明「少而精」可达
人均极限；Citadel 证明「大而全」可达总量极限。两者的共同点
是：都把「人、算力、数据」当作可复利的基础设施。**

## 六、文化与管理（规模之王的组织学）

- **极度保密**：NDA 文化行业最严，「不开源、不演讲、不解释」
  ——公开极简主义是刻意选择（citadel.md 已述，这里深化）
- **精英竞技场**：招聘以顶尖名校 + 奥赛/数学竞赛背景为主，
  面试流程公开透明（量化研究/工程双轨，官方博客详解）；
  考核以业绩为核心，内部竞争激烈
- **技术自研**：交易/风控/数据全栈自建——「技术即基础设施」
  的极致版本（对比 XTX 的「算力军备」，Citadel 是「全栈自研」）
- **城市选择**：1990 芝加哥（期权/做市大本营）→ 2022 迈阿密
  （税收 + 疫情后迁移潮）——总部迁移是「人才 + 税负」双重
  权衡的行业风向标（对照 OFFICE_GLOBAL 城市地图）

## 七、对 dsh-quant 的启示

1. **双引擎 = 对冲思维**：基金 + 做市的组合本质是「收入流
   去相关」——dsh-quant 的 `quant_backtest_portfolio` 与
   PCPT 的 baseline combiners 在工具层面复刻这个思维
2. **保密 vs 开源是光谱两端**：Citadel 证明「方法全内部化」
   能到多大；dsh-quant 证明「方法全公开」也能形成生态——
   边界哲学一致：**能复制的不是优势，能生态化的才是**
3. **订单流/数据是新的护城河**：Citadel 的双引擎协同本质是
   数据流协同——dsh-quant 的 `quant_data_guide` 渠道知识库
   与生态插件地图（谁有深度数据）就是「数据流地图」的开源版
4. **人才即基础设施**：Citadel 的中国谱系（锐天/明汯/知行
   通达——TALENT_MAP 的 Citadel 系）证明母体输出人才树的
   规模效应——与 WorldQuant 系并列的两大中国量化母体

## 参考

- Bloomberg: Citadel Securities nets record $12bn trading haul (2026-03)：https://www.bloomberg.com/news/articles/2026-03-24/citadel-securities-nets-record-12-billion-trading-haul-in-2025
- Hedgeweek: Citadel prospectus reveals $57bn in gains from largest funds：https://www.hedgeweek.com/citadel-prospectus-reveals-57bn-in-gains-from-largest-funds/
- Advisor Perspectives: Citadel's $16 Billion Win Tops Paulson's Greatest Trade Ever (2023)：https://www.advisorperspectives.com/articles/2023/01/24/citadels-16-billion-win-tops-paulsons-greatest-trade-ever
- Business Insider: Ken Griffin memo on top hedge fund profits (2024-01)：https://www.businessinsider.com/citadel-generates-top-profits-for-investors-memo-lch-investments-2024-1
- Bloomberg/Hedgeweek: Citadel Securities record $9.7bn trading revenue (2025-03)：https://www.hedgeweek.com/griffins-citadel-securities-reports-record-9-7bn-trading-revenue/
- Citadel Securities: HQ relocation Miami (2022)：https://www.citadelsecurities.com/news-and-insights/citadel-to-relocate-hq-from-chicago-to-miami/
- CNBC: Warren presses Citadel CEO Griffin about PFOF (2021-02)：https://www.cnbc.com/amp/2021/02/18/warren-presses-citadel-ceo-griffin-about-relationship-with-robinhood-payment-for-order-flow.html
- 第一财经: 逼空大战听证会焦点（2021）：https://www.yicai.com/news/100952661.html
- 新浪财经: 城堡守望者肯尼斯·格里芬：从重创到复兴（2010）：https://finance.sina.com.cn/roll/20100313/01517557973.shtml
- 维基百科（Citadel LLC / Citadel Securities）：https://en.m.wikipedia.org/wiki/Citadel_Investment_Group
