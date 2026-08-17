# Jump Trading 开源 repo 专刊

Jump 的开源姿态 = **交易保密 + 基础设施开源**：核心做市系统零公开，
但加密时代把底层设施（验证器/预言机/跨链桥）交给了社区。

## 旗舰 repo

| repo | 是什么 | 能学到什么 |
|---|---|---|
| [firedancer-io/firedancer](https://github.com/firedancer-io/firedancer) | **Jump Crypto 的 Solana 验证器**（C 语言重写，追求吞吐与低延迟）| 低延迟系统工程的工业教科书：内存管理、并发、网络栈——「速度怎么造」的全部答案 |

## 关联基础设施（Jump 参与创立/投资，现独立运营）

| repo | 是什么 |
|---|---|
| [wormhole-foundation/wormhole](https://github.com/wormhole-foundation/wormhole) | 跨链消息协议（Jump Crypto 创立，2022 被黑后修复并独立）|
| [pyth-network](https://github.com/pyth-network) | 去中心化预言机（Jump 创立，面向低延迟金融数据）|

## 对 dsh-quant 的启发

1. **Firedancer 是「执行层开源」的终极样本**：它把最底层的性能工程
   全公开，交易策略照样保密——「框架公开不泄密」的最强证据
2. **预言机思维**：Pyth 把「价格数据」本身做成产品——dsh-quant 的
   `quant_market_fetch` 免费行情层是同一个问题的量化版
3. **加密做市 = 24/7 执行域**：与我们的 BTC 通用实验框架同频

## 备注

Jump Trading 母体 GitHub 公开 repo 极少（保密文化），本专刊以
firedancer-io / wormhole-foundation / pyth-network 三个相关 org 为准。
