# Point72 开源 repo 专刊

Point72 是「后 SAC 时代」第一家**主动开源**的华尔街大基金——官方博客
标题就叫《Point72 Launches Its First Open-Source Library》。

## 旗舰 repo

| repo | 是什么 | 能学到什么 |
|---|---|---|
| [Point72/csp](https://github.com/Point72/csp) | **高性能响应式流处理库**（C++ 核心 + Python API）| 实时流式数据处理：图计算、回放引擎、与交易系统级延迟搏斗的工程方案——量化实时研究栈的公开样本 |

## 为什么是 csp

- 实时策略研究需要「流处理」：行情/信号/风控都是流——csp 把这块
  基础设施开源，说明「流式基础设施不是策略，可以共享」
- 与 Jane Street 的 incremental（增量计算）形成有趣的对照：
  **JS 开源计算范式，Point72 开源流处理范式**

## org 其他仓库

Point72 GitHub org 下另有少量工具库与示例（以 csp 为核心）。

## 对 dsh-quant 的启发

1. **「第一个开源库」的示范效应**：从零到一最难，csp 之后 Point72
   的开源会越来越自然——dsh-quant 的每次开源动作也在积累同样的势能
2. **流处理 vs 批处理**：dsh-quant 目前是批处理（数组进数组出）；
   csp 是流处理的参照——未来做实时因子/行情订阅时的方法论来源
3. **合规重生的技术注脚**：SAC 时代的教训没有让 Point72 走向封闭，
   反而用开源重建技术品牌——边界与开放可以并存
