# Jump Trading —— 从 CME 场内到加密基础设施

## 起源（1999）

1999 年成立于芝加哥，创始人 Bill DiSomma 与 Paul Gurinas 原是 CME
场内交易员（「jump trader」——跳着喊价的人）。从场内高频套利起家，
Jump 把「速度」刻进了公司基因。

## 演进路线

```
1999 芝加哥场内高频
  → 2000s 电子化 HFT 先锋，自建低延迟基础设施（微波/光纤/FPGA）
  → 2010s 全球扩张（股票/期货/期权/固收/加密），做市与自营并行
  → 2021 Jump Crypto 成立：加密做市 + 基础设施投资
  → 2024-2025 加密部门调整（公开报道），核心做市业务持续
```

## 关键里程碑

- 全球顶级 HFT 与做市商之一（与 Citadel Securities/JS/Virtu 同级）
- **Jump Crypto 的基础设施布局**：Wormhole（跨链桥）、Pyth（预言机）、
  **Firedancer**（Solana 高性能验证器，C 语言重写）
- **2022 Wormhole 3.25 亿美元被黑**——加密史上最大漏洞事件之一，
  被 Jump 补上（公开事件，行业风控教材）
- Firedancer 开源：把核心底层设施交给社区（见 quant-repo/jumptrading.md）

## 文化

- 工程师文化极重：硬件（FPGA/网络）与软件并重
- 保密与 Jane Street 相似级别，但加密业务让它有了「公开基础设施」
  的一面——**两条腿走路**：交易保密，基础设施开源

## 对量化 R&D 的启示

1. **速度是基础设施，不是魔法**：Firedancer 把「低延迟系统怎么造」
   开源了——证明底层工程可以公开，策略层才保密
2. **加密是新一代做市战场**：24/7、全球、无停牌——与 dsh-quant 用
   BTC 当通用实验框架的理由完全一致
3. **风控要有「补洞」预案**：Wormhole 事件说明再强的团队也会被打穿，
   回撤与极端场景工具（drawdown/压力测试）不是摆设

## 参考

- firedancer-io/firedancer（Jump Crypto Solana 验证器）
- Jump Crypto 官网 building 页面
- Wormhole 2022 安全事件公开报道
