# 📊 IC / IR 详细介绍：因子评价的"血压"与"心率"（概念全解）

> **dsh-quant 新 ann** · 2026-08-28 · 量化概念系列
> 目标：把 IC（Information Coefficient）和 IR（Information Ratio）讲透——
> 定义、公式、直觉、实操、常见误区、与我们工具的关系
> 关联：dsh-quant quant_factor_evaluate（IC/ICIR/RankIC/IC 衰减已实现）

---

## 0. 一句话

> **IC 是"这个因子预测未来收益准不准"（相关），IR 是"这个策略/因子的超额收益稳不稳"
> （夏普式）。IC 看因子，IR 看策略——两个都是量化研究的"体检指标"：
> IC 是血压（数值），IR 是心率（稳定性）。**

---

## 一、IC（Information Coefficient）— 信息系数

### 1.1 定义
**IC = 因子值与未来收益的相关性**——衡量"这个因子能不能预测收益"。

```text
IC = corr(因子值_t, 未来收益_{t+1})
```

### 1.2 两种 IC

| 类型 | 计算 | 特点 |
|---|---|---|
| **Pearson IC** | 线性相关 | 对异常值敏感 |
| **RankIC（Spearman）** ⭐ | 秩相关 | **对异常值稳健，实际更常用** |

### 1.3 直觉
- **IC > 0**：因子值越高，未来收益越高（正向预测）
- **IC < 0**：反向预测（取反可用）
- **IC ≈ 0**：无预测能力（横盘/噪音——dsh-quant 实测 BTC ROC 因子 IC -0.05，诚实无效）
- **IC 绝对值越大越准**：0.03 以上 = 可用；0.05 = 很好；0.1 = 极强（罕见）

### 1.4 实操（横截面）
- 每期（如每天）：算所有股票因子值 vs 下一期收益的横截面相关
- 得到**IC 时间序列**（每天一个 IC）
- **IC 均值**：平均预测力 · **IC 标准差**：稳定性

### 1.5 常用指标（alphalens 标准）
```text
IC 均值（mean IC）
IC 标准差（std IC）
ICIR（见下）
IC 衰减（IC decay）：未来 1/3/5/10 天的 IC——预测力衰减速度
IC 正比率（% positive）：IC > 0 的比例
```

---

## 二、IR（Information Ratio）— 信息比率

### 2.1 两种 IR（重要：同名不同义）

**① ICIR（IC 的信息比率）— 因子层面** ⭐ dsh-quant 用这个
```text
ICIR = mean(IC) / std(IC)
（滚动 IC 的均值 ÷ 标准差）
```
- **直觉**：IC 是"准不准"，ICIR 是"稳不稳"
- **ICIR > 0.5** 好 · **> 1** 优秀（稳定预测）
- 例子：IC 均值 0.04、标准差 0.08 → ICIR = 0.5

**② IR（组合/策略层面）— 夏普式**
```text
IR = 超额收益均值 / 超额收益标准差
（active return ÷ tracking error）
```
- **直觉**：策略相对基准的超额"性价比"
- **IR > 1** = 好 · **IR > 2** = 优秀（长期）
- 与夏普区别：夏普用总收益，IR 用超额收益

### 2.2 两种 IR 的关系（易混淆！）
```text
因子层面：ICIR = mean(IC)/std(IC)   —— 这个因子稳不稳
策略层面：IR = active_ret/tracking_err —— 这个组合超不多
```
**ICIR 高 → 因子有效 → 组合 IR 才可能高**（因子是组合的原料）

---

## 三、为什么 IC/IR 重要（研究的"体检"）

### 3.1 因子评价的核心（IC）
| 指标 | 回答 |
|---|---|
| IC 均值 | 因子有没有预测力 |
| IC 标准差 | 预测力稳不稳 |
| ICIR | 综合（均值/波动）|
| IC 衰减 | 预测力持续多久 |
| RankIC | 去掉极端值后还准吗 |

### 3.2 策略评价的核心（IR）
- **IR = 超额收益的质量**：不是"赚多少"，是"多稳地赚"
- 组合优化里常用 IR 目标：最大化 IR = 最小化 tracking error 下最大化超额
- **IR 决定信息比率的价值**：高 IR 策略能放大规模

---

## 四、常见误区（诚实提醒）

1. **IC 高 ≠ 策略能赚**：IC 只衡量预测力，还要看换手/成本/容量
2. **IC 会变**：因子的 IC 是时变的（regime）——今天有效明天可能失效
3. **RankIC vs Pearson**：异常值多时 Pearson 会骗你，RankIC 更稳
4. **ICIR ≠ IR**：因子层面 vs 策略层面，别混
5. **过拟合的 IC**：样本内 IC 高不算数——要样本外（walk-forward）
6. **IC 衰减快**：因子失效快 → 换手高 → 成本吃掉收益

---

## 五、与我们（dsh-quant/PWOL）的关系

### 5.1 dsh-quant 已实现（quant_factor_evaluate）
- **IC**（Pearson）· **RankIC**（Spearman 秩相关，对异常值稳健）
- **ICIR**（滚动 IC 均值/标准差）
- **IC 衰减**（icDecay：未来 1..N 天预测力衰减）
- 分位数分层/多空价差/换手/自相关（alphalens 指标集纯函数版）

### 5.2 实操流（我们怎么用）
```text
因子 → quant_factor_evaluate
  → IC 均值/RankIC → 有预测力吗？
  → ICIR → 稳吗？
  → IC 衰减 → 能持续多久？
  → 分层回测 → 真能赚钱吗（含成本）？
→ 通过 → 进 PWOL alpha 库 → A500 指增
```

### 5.3 我们的诚实案例
- **BTC ROC 因子**：实测 IC -0.05 → 横盘动量无效 → **诚实记录**（不是所有因子都有效）

---

## 🐳 一句话

> **IC 是"因子准不准"（血压），IR 是"策略稳不稳"（心率）——ICIR 是因子层面的
> 稳定性，IR 是组合层面的性价比。dsh-quant 已经把这套"体检"工程化了：
> IC/RankIC/ICIR/IC 衰减，点一下全出来——让每个因子都经得起拆解。**

---

## 📚 参考

- dsh-quant：quant_factor_evaluate（alphalens 指标集纯函数版）
- alphalens（因子评价标准库）
- Fama-French/Barra 多因子文献（见 #116 多因子历史）

欢迎翻阅、指正、PR 🐳
