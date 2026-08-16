# dsh-quant 如何辅助 R&D（Research & Development）— 工作流与模式

- **author:** DeepSeek (deepseek-v4-pro, Mac 端)
- **created_at:** 2026-08-16（0.10.1 批次）
- **record type:** 方法与定位记录（log/）

## 一句话

**dsh-quant 是 agent 的 quant R&D 工具箱：把"取数 → 理解 → 信任 → 计算 → 检验 → 验证 → 结论"七步研究闭环全部工具化，agent 不用写代码也能做完一轮完整研究。**

## 七步 R&D 工作流（demos/rd-workflow.ts 实证）

| 步 | 工具 | R&D 角色 |
|---|---|---|
| 1. 取数 | quant_market_fetch | 数据接入（3 交易所免凭据）|
| 2. 理解 | quant_series_stats | 描述统计：这数据长什么样 |
| 3. 信任 | quant_data_quality / annotate | 数据健康与点级标注（Scale AI 哲学）|
| 4. 计算 | 12 指标 | 特征工程（因子原材料）|
| 5. 检验 | quant_factor_evaluate | 因子 IC/分层/换手（alphalens 方法论）|
| 6. 验证 | 4 回测 + grid + 组合 | 策略假设检验（含止损止盈）|
| 7. 结论 | 结构化输出串联 | 研究结论（诚实：样本内/因子弱照实说）|

## 三类辅助模式

### 模式 A：Research（研究探索）
agent 快速试因子、试策略 → factor_evaluate 给 IC 证据 → 弱因子快速淘汰
（今天 demo 实证：ROC 动量 IC -0.05，横盘市场诚实淘汰）

### 模式 B：Development（工程开发）
纯函数再导出（`import { sma, backtestMaCross } from 'dsh-quant'`）→ 任意 Node
项目零 harness 复用 → 研究结论直接进生产代码

### 模式 C：Data governance（数据治理）
不供数据但供治理：渠道导航（guide/compare/advice）+ 检测 + 标注 → 用户自持
数据也能达到"可观测可治理"标准

## 与市面 R&D 项目的关系（调研 2026-08）

| 项目 | 路线 | 与我们的关系 |
|---|---|---|
| 微软 RD-Agent / R&D-Agent-Quant | 多智能体重框架 | 同方向（agent 做 R&D）；我们走工具级轻量路线 |
| LLMQuant Alpha-Agent / quant-mind | agent 量化研究/知识抽取 | 同路人；数据侧互补（Issue #4 致敬）|
| inalpha | 专业 quant agent 框架 | 重执行侧（沙箱+审批）；我们纯研究侧 |
| alphalens / qlib | 人的库 | 我们提供方法论标准的 agent 原生版 |

**生态定位：研究侧的 agent 原生工具箱——不与重框架竞争，服务 dsh agent 生态。**

## 演进方向（欢迎 issue/PR 共建）

- 更多研究环节工具化：risk（VaR/CVaR）、resample（复权/周期聚合）、report（结论报告）
- 更多数据适配框架：不同数据源 → 等长数组的适配器
- benchmark/eval：研究任务的评测集（agent 用 dsh-quant 完成任务的判分）
