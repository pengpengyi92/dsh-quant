# 专题报告：Optiver 深挖专刊（OPTIVER SPECIAL）

> 档案（optiver.md）的深挖版：历史 · 办公室编年史 · 竞赛文化 ·
> fun facts。办公室年份部分为公开资料拼合，待核处标注。

## 一、名字学：Optiver = 「期权做市商」

**Optiver = 荷兰语「期权做市商」（optie verhandelaar）的音译缩写**——
1986 年成立时直白的行业宣言。与 IMC（International Marketmakers
Combination）并称荷兰做市双雄：一个说「我是做市商」，一个说
「我是期权做市商」。

## 二、起源（1986 · 阿姆斯特丹）

- 1986 年成立于阿姆斯特丹，创始人 **Johann Kaemingk**——欧洲
  期权交易所（EOE，1978 年开市，欧洲第一家期权交易所）的场内
  交易员出身
- 起点：场内人工期权做市 → 三十余年演化为全球顶级自动化做市商
- 「交易所催生做市商」的荷兰样本（IMC 1989 同源）

## 三、历史时间线

| 时间 | 事件 |
|---|---|
| 1986 | 阿姆斯特丹成立，EOE 期权做市 |
| 1990s | 电子化转型；跨洋扩张（芝加哥/悉尼） |
| 2007-2008 | 【事件】**CFTC 指控 Optiver US 涉嫌操纵 NYMEX 原油期货**（2007「Hammer」事件）——被媒体称为高频交易「首犯」（2019 董法文章）；后续和解（细节待核） |
| 2010s | 伦敦/新加坡/上海布局；员工持股合伙制深化 |
| 2019 前后 | 中国实体：澳帝桦私募基金管理（上海）+ 澳帝桦（上海）信息技术——外资 WFOE 之一（详见 FOREIGN_CN_MAP_V2） |
| 2021 前后 | 奥斯汀（美国第二办公室）· 孟买（技术中心） |
| 2023 | **Ready Trader Go 竞赛上线**（UK/EU 学生编程挑战） |
| 2024 | 成为 **Pyth Network** 数据提供者——做市商数据进加密预言机 |

## 四、办公室编年史（建立/规模/定位）

| Office | 建立 | 定位 | 备注 |
|---|---|---|---|
| 阿姆斯特丹 | 1986 | 全球总部 · 欧洲做市 | 发源地；全球员工 ~2000+（2024 口径，待核） |
| 芝加哥 | 1990s（待核） | 美国做市总部 | 美股期权主战场 |
| 悉尼 | 1990s（待核） | 亚太第一站 | 澳洲期权交易所——南半球做市训练营核心成员 |
| 伦敦 | 2010s（待核） | 欧洲第二 | 英国市场 + 欧洲时区互补 |
| 新加坡 | 2010s（待核） | 东南亚 | 亚洲做市 + 加密布局 |
| 上海 | 2019 前后（待核） | 中国实体（澳帝桦双实体） | 用户线报确认存在；WFOE 私募 + 信息技术双轨 |
| 奥斯汀 | 2021 前后（待核） | 美国第二办公室 | 技术人才池（德州科技圈） |
| 孟买 | 2021 前后（待核） | 印度技术中心 | Data Centre/工程岗位（optiver.com 招聘路径 /technology/mumbai/） |

## 五、fun facts

1. **名字就是业务**：optie verhandelaar——「期权做市商」的荷兰语
   音译（与 IMC 的全名同款直白）
2. **高频交易「首犯」**：2007-2008 年 CFTC 的原油期货操纵指控——
   早期 HFT 监管摩擦的全球样本（中国版对照：IMC 2016 被查）
3. **Ready Trader Go 竞赛**：2023 年上线的编程挑战——参赛者在
   GitHub 公开提交（Avellaneda-Stoikov 做市策略是经典参考答案）
4. **做市商数据上链**：2024 年成为 Pyth Network 数据提供者——
   传统做市商给加密预言机供数
5. **dsh-quant 的血缘**：我们的期权/波动率工具（quant_option/
   quant_volatility，v0.22.0）**灵感直接来自 Optiver 的公开实践**
   （Ready Trader Go 做市模拟、optibook 仿真、期权定价挑战）——
   档案里唯一「工具级血缘」的机构
6. **合伙制老钱**：三十余年独立做市、员工持股——与 IMC 同属
   「不上市不募资」路线

## 六、对量化 R&D 的启示

1. **公开实践是最好的招聘与教学**：Optiver 把做市模拟开源化
  （Ready Trader Go）——与 Prosperity（IMC）、UBIQUANT CHALLENGE
  （九坤）同属「竞赛三角」；dsh-quant 的期权工具就是这个思路
  的产品化
2. **监管摩擦是行业先行指标**：Optiver 2007（原油）→ IMC 2016
  （中国股指期货）→ 中国 2024 程序化新规——做市商与监管的
  博弈时间线就是行业合规史
3. **传统做市 × 加密基础设施**：Pyth 供数显示做市能力可外溢为
  数据服务——「做市商的第二曲线」

## 参考

- Optiver 官方（做市与 Optiver 历史）：https://www.optiver.com/insights/explainers/the-history-of-market-making-and-optiver/
- MarketsWiki（Johann Kaemingk）：https://www.marketswiki.com/wiki/index.php?title=Johann_Kaemingk
- 搜狐·董法（Optiver 30 年，高频交易首犯，2019）：https://www.sohu.com/a/355592416_118776
- Ready Trader Go 启动（2023）：https://optiver.com/its-ready-trader-go-time-optiver-launches-coding-competition-for-uk-and-eu-students/
- Pyth（Optiver 成为数据提供者）：https://www.pyth.network/blog/new-pyth-data-provider-optiver
