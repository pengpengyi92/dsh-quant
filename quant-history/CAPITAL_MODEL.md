# 专题报告：外资资本模式大总结（CAPITAL MODEL）

> 钱从哪来：**自营（prop）vs 募资（hedge fund）vs 双轨（hybrid）**。
> 覆盖外资档案 42 家的资本结构全景。数据来自各档案，个别口径
> 待核处标注。

## 一、三分类总表

### 🟢 自营系（Prop · 自有资本交易，不募外部资金）

| 机构 | 主业 | 备注 |
|---|---|---|
| Jane Street | ETF/股票做市 | 纯自营做市之王（用户点名样本） |
| Optiver · IMC | 期权/衍生品做市 | 荷兰做市双雄，纯自营 |
| SIG | 期权做市 | 核心自营（扑克文化老钱） |
| Jump · Tower · HRT | HFT/做市 | HRT「纯算法自营」——零外部资金 |
| DRW · CTC · Wolverine | 芝加哥做市帮 | 自营基因 |
| XTX | 全自动做市 | Gerko 的纯自营帝国 |
| GSA | 系统化多策略 | 低调自营 |
| Akuna | 期权做市 | Optiver 血统自营 |
| PDT Partners | 多策略 | 摩根士丹利自营组后代——「自营的极致传承」 |
| Five Rings · Virtu | 自营做市 | Virtu 特殊：**自营 + 上市**（2015 IPO） |
| Wintermute · GSR · Alameda | 加密做市 | 加密圈全自营 |

### 🔵 募资系（Hedge Fund · 管理外部投资者资金）

| 机构 | 主业 | 备注 |
|---|---|---|
| Millennium · Point72 · Balyasny | pod 多策略 | 用户点名样本：Millennium 有募集资金 |
| Bridgewater · Brevan Howard · Tudor · Rokos | 宏观 | 外部资本 |
| DE Shaw · Two Sigma · Renaissance | 量化多策略 | 外部基金（RenTec 特殊，见双轨） |
| Citadel（基金侧） | 多策略 | Wellington 系列 |
| AQR · Dimensional | 因子投资 | 特殊：**公募化**（共同基金/ETF 零售化） |
| Man Group · Marshall Wace · Winton · Aspect | 系统化 | Man 特殊：**上市募资**（1783 老店） |
| Capula · QRT · Squarepoint · Verition · ExodusPoint · Eisler | 多策略/固收 | 外部资本 |
| WorldQuant | Alpha 工厂 | 平台 + 外部 BRAIN 产品（混合，待核） |

### 🟡 双轨系（Hybrid · 自营 + 募资并行）

| 机构 | 双轨结构 |
|---|---|
| Renaissance | **Medallion（大奖章）2005 年起 100% 内部资金**——外部投资者被请出；RIEF/RIDA 面向外部——「最好的策略留给自己」 |
| DE Shaw | **Oculus（自营）** + 外部基金并行——创始人模式与资管模式共存 |
| Citadel | **Citadel 基金（募资）** + **Citadel Securities（自营做市）**双引擎 |
| Schonfeld | 券商自营基因 + 平台制资管混合 |
| Point72 | 2014-2018 家族办公室（纯自有）→ 2018 起募资——「自营转募资」的转型样本 |

## 二、规律分析

1. **做市商几乎全部自营**：Jane Street/Optiver/IMC/SIG/Jump/HRT/
  XTX/Wintermute/GSR——流动性业务的资本需求特殊（日内周转 +
  库存风险），外部资本的赎回压力与做市不兼容
2. **pod 平台几乎全部募资**：Millennium/Point72/Balyasny——
  300 个 pod 的多样性红利需要规模，规模来自外部机构资金
  （养老金/主权基金）
3. **自营的尽头是「封闭或上市」**：RenTec 把最好的策略封闭
  给自己（Medallion 内部化）；Virtu 把自营做市资本化（IPO）——
  自营资金的两个出口
4. **募资的尽头是「公募化」**：Dimensional/AQR 从对冲基金走向
  共同基金/ETF——把「策略产品」变成「零售货架」；Man Group
  靠上市并购活了 240 年
5. **转型路线**：Point72（自营→募资）、RenTec（募资→自营）——
  资本结构随策略容量与野心双向流动

## 三、中国对照

- 中国量化私募（备案制）= **全募资系**——「自营系」几乎不存在
  （早期自营起家的宽德/致诚卓远等全部转了资管）
- 唯一例外：幻方用私募利润养 DeepSeek——**「募资→自营 AI」的
  中国版双轨**（对标 RenTec 的「最好留给自己」反向操作：幻方把
  最好的技术开源给了全世界）
- 自营文化的缺失 → 中国没有 Jane Street/HRT 式的纯自营巨头；
  但「平台+资管」模式（聚宽双轮）正在补课

## 四、对 dsh-quant 的启示

1. **dsh-quant 是「开源自营」路线**：无募资压力、无投资者赎回
  约束——与 Jane Street/HRT 的自营独立性同构；方法公开（像
  幻方的开源），但不需要用「规模」换「生存」
2. **资本模式决定产品哲学**：自营→低调做策略；募资→做品牌与
  透明度；开源→做生态与复利——dsh-quant 的「产品力>声量」
  正是自营系的气质
3. **未来选项**：若有一天需要「规模化的多样性红利」，pod 制
  与插件市场的同构（POD_PLATFORM 报告）已经给出了路线图

## 参考

- 各机构档案（quant-history/*.md）+ 深挖专刊（MILLENNIUM/
  POINT72/BALYASNY/IMC/JANE_STREET/OPTIVER SPECIAL）
- POD_PLATFORM.md（pod 平台募资/自营细节）
