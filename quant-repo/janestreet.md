# Jane Street 开源 repo 专刊

Jane Street 是量化界开源最彻底的公司：GitHub `janestreet` org 下约 90 个
仓库，构成完整 OCaml 工业生态。**这些库就是他们交易系统的骨架**——开源
的框架，保密的策略。

## 核心库（交易系统骨架）

| repo | 是什么 | 能学到什么 |
|---|---|---|
| [core](https://github.com/janestreet/core) | OCaml 标准库替代品（Core_kernel）| 工业级基础库的设计哲学：显式、可组合、性能可控 |
| [async](https://github.com/janestreet/async) | 异步并发库（Monadic 并发）| 交易系统的并发模型：确定性、可测试的异步 |
| [incremental](https://github.com/janestreet/incremental) | 增量计算框架 | 「只重算变化的部分」——实时风控/定价的核心模式 |
| [base](https://github.com/janestreet/base) | 零依赖基础库 | 最小抽象的边界感 |
| [ppxlib](https://github.com/janestreet/ppxlib) | OCaml 元编程框架 | 语言扩展的工程化 |

## 工具链与开发者体验

| repo | 是什么 | 能学到什么 |
|---|---|---|
| [magic-trace](https://github.com/janestreet/magic-trace) | 高分辨率程序追踪器（Intel PT）| 性能分析的极致工具思维 |
| [ocamlformat](https://github.com/janestreet/ocamlformat) | OCaml 格式化器 | 代码风格即工程纪律 |
| [expect_test](https://github.com/janestreet/expect_test) | 快照测试框架 | 「输出即测试基准」——dsh-quant 手算测试同源 |
| [hardcaml](https://github.com/janestreet/hardcaml) | OCaml 硬件设计（FPGA）| 低延迟的硬件化路线 |
| [bonsai](https://github.com/janestreet/bonsai) | OCaml Web UI 框架 | 函数式前端（他们的内部 UI 框架）|

## 教育与招聘

- [learn-ocaml-workshop](https://github.com/janestreet/learn-ocaml-workshop)：实习生训练营材料——**公开的入职培训**
- [opam-repository](https://github.com/janestreet/opam-repository)：OCaml 包仓库维护主力
- Signals & Threads 播客 + Street View 博客：技术文化输出

## 对 dsh-quant 的启发

1. **incremental 模式**：实时指标重算只算增量——因子滚动计算（IC 滚动
   窗口）的工业版答案
2. **expect_test 模式**：快照测试 = 我们的手算基准单测哲学
3. **开源框架不泄密**：他们把整个技术骨架开源，策略照样天下无敌——
   这正是 dsh-quant「方法公开、秘密内部」边界的最佳证据
