# 因子回测/因子分析开源生态调研（2026-08-16，0.10.0 依据）

- **author:** DeepSeek (deepseek-v4-pro, Mac 端)
- **record type:** 调研记录（log/）

## 一、生态地图

| 项目 | 定位 | 状态 | 关键能力 |
|---|---|---|---|
| [alphalens](https://github.com/quantopian/alphalens)（Quantopian）| 因子分析行业金标准 | 停维（2020）| IC/ICIR、分位数分层收益、换手、因子自相关、均值回归 |
| [alphalens-reloaded](https://github.com/stefan-jansen/alphalens-reloaded) | 社区接棒维护版 | 活跃 | 同上（pandas 兼容修复）|
| [qlib](https://github.com/microsoft/qlib)（微软）| AI 导向量化平台 | 活跃 | alpha158/360 因子库、ML 建模、回测、组合 |
| [RD-Agent](https://github.com/microsoft/RD-Agent)（微软）| agent 自动化 R&D | 活跃 | 用 agent 自动做因子挖掘+实验流水线 |
| [AlphaInspect](https://github.com/wukan1986/AlphaInspect) | 因子表现可视化 | 小众 | 因子表现图 |
| vectorbt / quantstats / pyfolio | 回测与绩效 | 活跃 | 向量化回测、绩效报告 |

## 二、关键发现

1. **方法论金标准 = alphalens 指标集**：IC → ICIR → 分位数分层收益 → 换手 →
   因子自相关。0.10.0 的 factorEvaluate 即此指标集的纯函数实现。
2. **微软 RD-Agent 验证方向**：agent 自动化量化 R&D 已被大厂做重平台；
   dsh-quant 走工具级轻量路线（不与之竞争，服务 dsh agent 生态）。
3. **生态空白**：给 agent 用的、零依赖、手算可测、方法论标准的因子工具
   ——正是 dsh-quant 的位置。

## 三、差异化定位（确认）

| | alphalens/qlib | dsh-quant 路线 |
|---|---|---|
| 形态 | Python 重库（人写代码用）| dsh 工具（agent 直接调用）|
| 依赖 | pandas/平台数据格式 | 零依赖纯函数、手算可测 |
| 数据 | 要自备完整因子面板 | 从行情开始（agent 从 fetch 自己构建）|
| 协议 | 无 | defineTool + tools.json（任何 agent 可用）|

## 四、数据适配声明（写入工具描述与文档）

dsh-quant 不提供数据；factorEvaluate / combineFactors 接受等长数组：
- 单资产时间序列：factor[i] 配 forwardReturns[i+1]
- 多资产截面：把截面按时间摊平后传入
- 未来将提供多种适配不同数据的回测框架（后期调整）
