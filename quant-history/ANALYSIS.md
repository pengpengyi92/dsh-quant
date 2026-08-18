# 量化生态数据分析报告 #1（42 家机构全量）

> 数据来源：quant-history / quant-repo 栏目档案（42 家）。
> 可复现原则：每个数字都可追溯到对应档案文件；欢迎 PR 修正与补充。

## 1. 开源姿态分布（42 家）

| 姿态 | 数量 | 机构 |
|---|---|---|
| 框架级开源 | 1 | Jane Street（OCaml 全生态）|
| 基础设施开源 | 1 | Jump（Firedancer）|
| 教育竞赛 | 2 | Optiver（RTG）· IMC（Prosperity）|
| 研究设施 | 2 | Man Group（ArcticDB）· Two Sigma（flint）|
| 论文/数据/学术 | 3 | AQR · WorldQuant · Dimensional |
| 开源初代 | 1 | Point72（csp）|
| 思想/文化输出 | 5 | Bridgewater（原则）· HRT（谜题）· DE Shaw（人才）· Winton（慈善）· Tudor（影像）|
| 披露文件型 | 2 | Virtu · XTX |
| **零开源** | **25** | RenTec · Citadel · Millennium · SIG · Schonfeld · DRW · PDT · Wolverine · CTC · Aspect · Marshall Wace · Tower · Balyasny · Brevan Howard · GSA · Capula · Verition · Akuna · Squarepoint · QRT · Rokos · Wintermute · Alameda · ExodusPoint · Five Rings |

**洞察 1**：42 家里 **60% 零开源**——开源在量化行业始终是少数派。
**洞察 2**：有代码开源的仅 7 家（16.7%），且全是「研究/教育/框架」
型机构——**没有一家做市商开源核心系统**。

## 2. 地理分布

| 集群 | 数量 | 代表 |
|---|---|---|
| 伦敦 | 12 | Man · Winton · Aspect · MW · BH · GSA · Capula · XTX · QRT · Rokos · Wintermute · Squarepoint |
| 纽约 | 11 | DE Shaw · Schonfeld · Millennium · Tower · JS · Two Sigma · HRT · Virtu · PDT · ExodusPoint · Five Rings |
| 芝加哥 | 7 | DRW · Wolverine · CTC · Balyasny · Akuna · Jump · Citadel（现迈阿密）|
| 康涅狄格 | 5 | Bridgewater · Tudor · AQR · Point72 · Verition |
| 阿姆斯特丹 | 2 | Optiver · IMC |
| 其他 | 5 | SIG（费城）· RenTec（长岛）· Dimensional（奥斯汀）· Alameda（香港→巴哈马）· WorldQuant |

**洞察 3**：伦敦+纽约+芝加哥 = 30 家（71%）——量化世界是三座城。
**洞察 4**：阿姆斯特丹只有 2 家，却是期权做市的教育圣地（Optiver+IMC
贡献了全部竞赛开源）。

## 3. 组织形态

| 形态 | 数量 | 代表 |
|---|---|---|
| 做市/自营 | 17 | Optiver · SIG · IMC · Citadel · DRW · Wolverine · CTC · HRT · JS · Jump · Virtu · Wintermute · Akuna · Tower · Five Rings · RenTec · DE Shaw |
| 系统化基金 | 11 | Winton · Aspect · MW · GSA · Capula · XTX · QRT · Squarepoint · Two Sigma · PDT · Man |
| 平台制多策略 | 6 | Millennium · Schonfeld · Balyasny · Point72 · ExodusPoint · Verition |
| 宏观 | 4 | Bridgewater · Tudor · BH · Rokos |
| 学术产品 | 3 | Dimensional · AQR · WorldQuant |
| 反面样本 | 1 | Alameda |

**洞察 5**：做市/自营是最大群体（40%）——「赚价差」是量化最古老的生意。

## 4. 成立年代分布

| 年代 | 数量 | 高光 |
|---|---|---|
| ≤1970s | 2 | Man（1783）· Bridgewater（1975）|
| 1980s | 10 | **量化黄金五年 1986-90**：Optiver/SIG/DE Shaw/Schonfeld/Millennium/IMC/Citadel 七连发 |
| 1990s | 10 | 1997 三连（Winton/Aspect/MW）；1999 Jump |
| 2000s | 10 | 2001-02 四连（Two Sigma/Balyasny/BH/HRT）|
| 2010s | 9 | **2015 三连**（XTX/QRT/Rokos）= 大行自营独立潮；2017 加密双雄（Wintermute/Alameda）|
| 未公开 | 1 | Five Rings |

**洞察 6**：成立潮与监管/技术变革强相关——1986-90（电子化交易兴起）、
2015（沃尔克规则红利期）、2017（加密牛市）。
**洞察 7**：2008 危机年成立的两家（Virtu/Verition）都活成了品类代表——
「危机中出生」是风控基因的天然筛选。

## 5. 谱系线（人才传播树，档案中可追溯）

```
SIG(1987) ──→ Jane Street(2000) ──→ 无
DE Shaw(1988) ──→ Bezos(Amazon) · Two Sigma(2001)
AHL(1987) ──→ Winton(1997, Harding) + Aspect(1997, Lueck/Adam)
Schonfeld(1988) ──→ Balyasny(2001)
Millennium(1989) ──→ ExodusPoint(2018, Gelband)
Optiver(1986) ──→ Akuna(2011)
Brevan Howard(2002) ──→ Rokos(2015)
瑞信固收系 ──→ BH(2002) + Capula(2005) + QRT(2015)
摩根士丹利 PDT(1993) ──→ PDT Partners(2012 独立)
Fama 师门 ──→ Dimensional(1981) + AQR(1998)
```

**洞察 8**：42 家里至少 10 家可追溯到 5 个「母体」（SIG/DE Shaw/AHL/
Millennium/大行自营组）——**量化行业是一棵有根的树**。

## 6. 方法注记

- 本报告为栏目档案的**第一份数据分析**，全部数字人工可核对
- 后续方向（见内部 idea 2026-08-17_quant_ecology_idea）：数据化
  成 JSON、用 dsh-quant 自己的工具（quant_oss_pulse/pipeline）
  复现与更新——研究库自己 dogfooding 产品
