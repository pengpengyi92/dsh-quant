# 专题报告：Jane Street 深挖专刊（JANE STREET SPECIAL）

> 档案（janestreet.md）的深挖版：历史 · 办公室编年史 · OCaml
> 文化 · fun facts。办公室年份部分为公开资料拼合，待核处标注。

## 一、起源（2000 · 纽约格林尼治村）

- 2000 年成立（部分资料称 1999，见维基百科口径），**四位创始人**：
  **Tim Reynolds · Rob Granieri · Marc Gerstein**（三人来自 SIG
  的 ETF 做市团队）+ **Michael Jenkins**
- 名字：**「Jane Street」是纽约格林尼治村的一条街名**——公司
  名来自早期的办公室所在街道，和 Optiver/IMC 的「业务即名字」
  相反，走的是「地名即名字」路线
- 起点：**ETF 做市**——从一只新资产类别的流动性提供者做起，
  二十年做到全球 ETF 做市龙头

## 二、历史时间线

| 时间 | 事件 |
|---|---|
| 2000 | 纽约成立，ETF 做市起家（SIG 血统的「ETF 三人组」） |
| 2000s | 拓展股票/债券/期货/期权做市；自营交易 |
| 2005 前后（待核） | 伦敦办公室——欧洲市场 |
| 2012 前后（待核） | 香港办公室——亚洲市场 |
| 2019 前后（待核） | 新加坡办公室——东南亚 + 加密业务支点 |
| 2021 前后（待核） | 阿姆斯特丹办公室——欧盟牌照（英国脱欧后布局） |
| 2020-2021 | 疫情波动市中做市业务大爆发；进入加密货币做市 |
| 2023-2024 | 媒体口径：净交易收入百亿美元级、利润位居华尔街做市商前列（待核） |

## 三、办公室编年史（建立/规模/定位）

| Office | 建立 | 定位 | 备注 |
|---|---|---|---|
| 纽约 | 2000 | 全球总部 | 格林尼治村起家；「Jane Street」街名出处 |
| 伦敦 | 2005 前后（待核） | 欧洲做市 | 欧洲 ETF/股票市场 |
| 香港 | 2012 前后（待核） | 亚洲做市 | 大中华+亚洲市场准入 |
| 新加坡 | 2019 前后（待核） | 东南亚 + 加密支点 | 数字资产做市的前哨 |
| 阿姆斯特丹 | 2021 前后（待核） | 欧盟牌照 | 脱欧后的欧盟合规实体 |
| 全球员工 | ~2500-3000（2024 口径，待核） | —— | 做市商里工程师占比最高的之一 |

## 四、OCaml 文化（技术特色）

- **全栈 OCaml**：全球最大的 OCaml 工业用户——交易系统、研究、
  基础设施全部用 OCaml 写（ocaml.org 官方「Large Scale Trading
  System」成功案例）
- **「Why OCaml?」博客**：类型系统在编译期消灭 bug——「类型
  安全即风控」的工程哲学
- **开源贡献**：Core / Async / Incremental 等库 + **Dune 构建系统**
  （博客自述「How we accidentally built a better build system」）+
  编译器团队（技术演讲「Jane and the Compiler」）
- 对比：SIG（C++/扑克文化）→ Jane Street（OCaml/类型文化）——
  母体与后代的技术路线分化样本

## 五、fun facts

1. **创始三人组来自 SIG 的 ETF 团队**——Susquehanna 母体的
  「ETF 分蘖」；Michael Jenkins 补足技术位
2. **公司名就是一条街**：纽约格林尼治村的 Jane Street——
  「低调到用地址当名字」
3. **招聘不问金融背景**：面试考 puzzles 与数学/编程——实习生
  月薪即可达数万美元（媒体口径）；「聪明人学金融很快」
4. **疫情年做市商赢家**：2020 波动市中 ETF/期权做市大赚——
  「波动率是做市商的节日」
5. **加密货币的迟到者**：观望多年后 2021 年才进入加密做市——
  「不追风口的巨头」样本
6. **无着装要求的工程师文化**：华尔街的反义词——做市商里最像
  科技公司的

## 六、对量化 R&D 的启示

1. **类型安全 = 契约文化**：OCaml 的类型系统与 dsh-quant 的
  「统一 schema DSL + required 字段 + 对齐约定」同构——**编译期/
  注册期消灭错误，而非运行期**；Jane Street 是这条哲学的最强
  工业背书
2. **开源基建不伤生意**：做市策略闭源，但 Core/Async/Dune 全
  开源——与幻方「模型开源、策略闭源」同构的第二例；dsh-quant
  的「方法公开、秘密内部」在世界级机构里有先行者
3. **母体分蘖的科技版**：SIG（博弈/扑克）→ Jane Street（类型/
  函数式）——同一做市母体可以孵化出技术哲学完全不同的后代；
  中国版的对照：WorldQuant → 九坤/倍漾的 AI 化

## 参考

- 维基百科（存档版，创始人四人名单/办公室）：https://web.archive.org/web/20230307104850/https://en.wikipedia.org/wiki/Jane_Street_Capital
- OCaml 官方成功案例：https://ocaml.org/success-stories/large-scale-trading-system
- Jane Street 博客（Why OCaml / Dune）：https://blog.janestreet.com/why-ocaml/
- JZL 研究（OCaml 坚定践行者）：https://www.odaily.news/zh-CN/post/5181878
