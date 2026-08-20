# 专题报告：上市量化机构全谱（LISTED QUANT）

> 回答：**Virtu 不是唯一上市的量化机构**——但确实是最纯粹的
> 「上市做市商」。本篇盘点上市量化家族：活的、死的、传闻中的。

## 一、上市量化家族（现存 3 家）

| 机构 | 上市 | 交易所 | 主业 | 备注 |
|---|---|---|---|---|
| **Man Group** | **1994** | 伦敦 LSE | 系统化资管（AHL） | 上市最早——比 Virtu 早 21 年；240 岁老店「并购式进化」 |
| **Virtu Financial** | 2015-04 | NASDAQ（VIRT） | 做市 + 执行服务 | 募资最高 3.14 亿美元；用户点名的「上市量化」代表 |
| **Flow Traders** | **2015-07** | 泛欧交易所阿姆斯特丹 | ETF 做市 | 估值超 15 亿欧元——**与 Virtu 同年上市**（2015 = 做市商上市元年） |

## 二、已消亡的上市做市商（死亡链）

```
Knight Capital（上市做市商）
  → 2012-08-01：软件部署事故，45 分钟亏损 4.4 亿美元——资本
    市场史上最著名的「技术故障致死」案例
  → 2013：被 Getco 合并为 KCG
  → 2017：KCG 被 Virtu 收购
```
上市做市商的一整条产业链最终收束于 Virtu——「活到最后的
上市做市商」。

## 三、Virtu 专档（用户点名的样本）

- 创始人 **Vince Viola**（前 NYMEX 纽商所主席）；CEO Doug Cifu
- 2015-04 IPO（一度因 Flash Boys 舆论推迟一年）；募资最高
  $314M；NASDAQ: VIRT
- **传奇数据梗**：上市文件披露 IPO 前 **1485 个交易日中仅 1 天
  亏损**（1500 交易日 1 天亏的中文报道口径）——「越震越赚」的
  做市模型巅峰展示
- 2017 收购 KCG（Knight+Getco 遗产）——做市行业整合者
- 业务：全球股票/期货/期权/固收做市 + 机构执行服务

## 四、Flow Traders 专档

- 2004 年成立于阿姆斯特丹（两位创始人：Roger Hodenius 与 Jan
  van Kuijk，待核）——ETF 做市专精
- 2015-07 泛欧交易所上市（估值 15 亿欧元+）——荷兰做市文化的
  资本化样本（Optiver/IMC 选择不上市，Flow 选择上市）
- 低波动市场中的逆风样本（2018 Reuters 报道「becalmed markets」
  中业绩平淡）——**上市做市商的业绩透明度代价**

## 五、Man Group 专档

- **1994 年在伦敦上市**——对冲基金/另类资管上市的第一代
- 1783 年糖商 → 商品经纪 → 系统化量化（收购 AHL）→ 上市平台
  持续并购（GLG/Numeric）——「上市 = 并购弹药」的 240 年样本
- 与 Virtu/Flow 的区别：**资管型上市**（赚管理费）vs **做市型
  上市**（赚价差）——两种完全不同的上市生意

## 六、为什么上市量化这么少？（五大原因）

1. **合伙制 vs 股东制**：做市商的利润分配文化是合伙分成
  （pass-through），上市后变成「为股东打工」——最优秀的人会走
2. **策略保密 vs 财报披露**：上市 = 季度财报 = 持仓/收入结构
  曝光——量化最恨的透明度
3. **自营资本 vs 公众资本**：自营做市不需要外部股权资本
  （CAPITAL_MODEL 报告：做市商几乎全自营）——上市募来的钱
  没处用
4. **估值难题**：业绩波动大（Flow Traders 的低波动年）——市场
  给不出稳定 PE，股价即枷锁
5. **控制权**：Viola/Griffin/Overdeck 们不需要通过 IPO 变现
  ——卖一部分给红杉（Citadel Securities 2022）就够

## 七、传闻与未来

- **Citadel Securities**：2022 年红杉 11.5 亿美元入股——上市
  传闻常年不断，但 Griffin 多次否认——「卖股份 ≠ 上市」
- 加密做市商（Wintermute/GSR）无上市先例
- 中国：**0 家上市量化机构**——私募管理人制度不提供 A 股上市
  路径；上市的只有供应商层（恒生电子/同花顺/东方财富）

## 八、对 dsh-quant 的启示

1. **上市不是量化的终点，是异类选项**：Virtu/Flow 上市是为了
  「资本化退出 + 并购弹药」，不是为了融资做策略——dsh-quant
  的开源自营路线天然不需要上市
2. **透明度是双刃剑**：Virtu 用「1485/1486」的数据透明征服了
  市场，Flow 用同样的透明暴露了低波动年的疲态——**「方法公开」
  的声誉红利与业绩压力并存**（我们选择公开的是方法，不是净值）
3. **死亡链警示**：Knight 的 45 分钟事故 → 被并购 → 被 Virtu
  吸收——量化机构的风险管理没有「上市豁免」，反而被放大

## 参考

- 中国网财经（Virtu 1500 交易日仅 1 天亏，2015-11）：http://big5.china.com.cn/gate/big5/finance.china.com.cn/stock/zqyw/20151117/3446627.shtml
- Reuters（Virtu IPO 重启，2015-04）：https://www.reuters.com/article/2015/04/15/virtufinancial-ipo-idUSL2N0XC32E20150415/
- ETF Strategy（Flow Traders IPO 估值 15 亿欧元，2015-07）：https://www.etfstrategy.com/ipo-values-etf-market-maker-flow-traders-at-over-1-5bn-26589/
- 维基百科（Flow Traders / Man Group）：https://en.wikipedia.org/wiki/Flow_Traders
- 各档案：virtu.md / mangroup.md
