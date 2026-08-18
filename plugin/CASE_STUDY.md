# 案例：五槽插件组合的完整闭环（从数据到执行）

> 一个模拟案例：个人研究者给 A 股做一个简单的多因子策略，
> 用 plugin/ 里的外部插件 + dsh-quant 内置工具，走完 data → alpha →
> model → risk → execution → 交付 的完整闭环。

## 场景设定

- 目标：A 股多因子选股策略（月频调仓，模拟盘验证）
- 标的池：沪深 300 成分（示例用 000001.SZ 演示链路）
- 原则：外部插件做「深度火力」，内置工具做「范式与验证」

## Step 1 · data 插件（插槽 dsh-data）

```
[外部] capital-generation（A股 MCP）→ fin_data_* 取日线/财务
[内置] quant_data_quality   → 体检（缺值/异常/时间戳）
[内置] quant_data_guide     → 查询「复权」渠道，对齐复权口径
```

**输出**：干净的对齐数据 + 体检报告。**为什么组合**：免费接口打底
（内置行情），深度数据挂 MCP，口径问题问知识库——三件套各司其职。

## Step 2 · alpha 插件（插槽 dsh-alpha）

```
[外部] 101 Formulaic Alphas → 选 3 个候选（动量 Alpha#2、反转 Alpha#10、波动 Alpha#101）
[内置] quant_factor_evaluate → IC / RankIC / IC 衰减 / 分层 → 筛选
[内置] quant_factor_neutralize → 行业中性化（groups=行业代码）
[内置] quant_factor_combine → 合成信号（rank 0..1）
```

**输出**：一个经过 IC 筛选 + 中性化的合成信号。**为什么组合**：
外部因子库出「原料」，内置评价范式出「质检」——内部 alpha 永远
不进公开仓库，但范式让每个人都能质检自己的 alpha。

## Step 3 · model 插件（插槽 dsh-ml）

```
[外部] qlib Alpha158 → 备选特征工程（可选深度）
[内置] quant_walk_forward → 滚动训练/样本外（无未来函数金标准）
[内置] quant_linear_model → 因子→收益 的合成权重
```

**输出**：样本外 IC 为正的模型 + 每窗口权重。**为什么组合**：
qlib 提供特征工程深度，dsh-quant 提供「不做假」的验证框架——
train R² 只是参考，OOS IC 才是证据。

## Step 4 · risk 插件（插槽 dsh-risk）

```
[内置] quant_risk        → VaR/CVaR/β/α/IR 快检
[内置] quant_drawdown    → 回撤段解剖（峰/谷/恢复）
[外部] riskfolio-lib     → 组合优化 + 压力测试（深度）
[内置] quant_var_backtest → Kupiec（若有 VaR 模型）
```

**输出**：红线清单（最大回撤上限、组合集中度约束）。
**为什么组合**：内置做「红线快检」，外部做「机构级深度」——
三层风控火力，覆盖从快速体检到压力测试。

## Step 5 · execution 插件（插槽 dsh-execution）

```
[内置] quant_backtest      → 月频调仓回测（无未来函数）
[内置] quant_execute_sim   → 滑点/双边费/延迟的真实成本模拟
[外部] optibook（语义参照）→ 撮合/部分成交模型对齐
[内置] quant_fund          → 1 亿模拟私募（NAV 1.00 / 管理费 / 高水位提成）
```

**输出**：扣成本后的净值曲线 + 模拟私募报告。
**为什么组合**：外部撮合语义做「真实感校准」，内置执行框架做
「可复现的模拟」——**无实盘边界**：Hummingbot/freqtrade 仅学习。

## Step 6 · 交付与复盘

```
[内置] quant_report → Markdown 研究报告
[内置] quant_chart  → 图表数据（K线/净值/水下）
[内置] quant_oss_pulse → 生态自评（哈哈，顺手看下项目自己的影响力）
```

## 闭环图

```
data(外部 MCP + 内置体检)
  → alpha(101 Alphas + 内置评价/中性化)
  → model(qlib + walk-forward)
  → risk(riskfolio + 内置红线)
  → execution(撮合语义 + execute_sim + fund)
  → report/chart（交付）
  → 复盘 → 下一轮（一切皆为插件，任何一环可替换）
```

## 这个案例的要点

1. **内置 = 范式**：每一步都有可手算的基准，外部结果可以对齐验证
2. **外部 = 火力**：深度数据/因子库/风控库/撮合语义，按需挂载
3. **闭环可替换**：任何一步换插件，闭环不断——everything is a plugin
4. **边界清晰**：方法全公开，策略/参数/内部 alpha 留在你自己的仓库
