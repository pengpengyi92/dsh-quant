# 🔗 开源宇宙联动：介绍 rates-bond-quant（我们自己的 FICC repo）× 互@计划

> **dsh-quant 新 ann** · 2026-08-28 · 开源宇宙互@第一弹
> 目标：介绍我们的另一个 repo（rates-bond-quant），并启动"开源宇宙互@计划"——
> 各 repo 互相 @、互相放大影响力和优势
> 关联：rates-bond-quant（FICC 定价）· dsh-quant（量化 OS）· FICC 系列（#124-128）

---

## 0. 一句话

> **rates-bond-quant = 我们 FICC Quant Lab 的第一个正式 repo（Python 定价引擎 +
> FastAPI + Next.js 前端）——与 dsh-quant 的 FICC 系列直接互补：它做利率债
> 定价实现，dsh-quant 做概念与方法论。互@ = 方法论（dsh-quant）× 实现
> （rates-bond-quant）× 数据（PDAT）互相导流，放大整个开源宇宙。**

---

## 一、介绍 rates-bond-quant

### 1.1 是什么
| 项 | 内容 |
|---|---|
| **repo** | github.com/pengpengyi92/rates-bond-quant |
| **定位** | 利率债分析教育项目（Python）|
| **技术栈** | Python 定价引擎 + FastAPI 后端 + TypeScript/Next.js 前端 |
| **网站** | ficc-rates-bond-quant.pages.dev |
| **覆盖** | 现金流 → 定价 → Macaulay/修正久期 → 凸性 → 情景 |

### 1.2 FICC Quant Lab 路线图（大图）
```text
rates-bond-quant（Rates ✅ 当前）
  → Credit（信用债，独立 repo，有可运行代码后）
  → FX（外汇，独立 repo）
→ FICC Quant Lab 全家桶
```

### 1.3 与 dsh-quant 的互补
| 维度 | rates-bond-quant | dsh-quant |
|---|---|---|
| **语言** | Python | TypeScript |
| **形态** | 独立应用（引擎+API+前端）| 工具库（59 工具）|
| **FICC** | 定价实现（久期/凸性）| 概念与方法论（#124-128）|
| **角色** | "实现层" | "方法论层" |

---

## 二、开源宇宙互@计划（互相放大）

### 2.1 为什么互@
```text
每个 repo 是一个"放大器"：
dsh-quant（方法论+工具）→ @ rates-bond-quant（实现）
rates-bond-quant（定价）→ @ dsh-quant（概念）
PDAT（数据）→ @ 两者（数据源）
P-Research（研究）→ @ 全部（前沿）
→ 互相导流 = 一个 repo 的读者看到整个宇宙
```

### 2.2 互@矩阵（我们的开源宇宙）
| repo | 角色 | 互@ |
|---|---|---|
| **dsh-quant** | 量化 OS（59 工具）| 方法论中枢 |
| **rates-bond-quant** | FICC 定价实现 | 实现层 |
| **p-research** | AI 前沿研究 | 研究层 |
| **dsh-quant-ui** | 可视化 | 展示层 |
| **PTFT/PMMT/PWOL** | 三策略 | 应用层 |
| **PDAT**（私有）| 数据 | 数据层 |

### 2.3 怎么互@（动作）
1. **README 互链**：每个 repo 的 README 加"Related projects"（列其他 repo）
2. **Discussion 互推**：一篇 ann 里 @ 其他 repo（如本篇）
3. **工具互用**：rates-bond-quant 用 dsh-quant 方法论 · dsh-quant 引用定价实现
4. **文档互引**：FICC 系列（#124-128）→ rates-bond-quant 链接

---

## 三、rates-bond-quant × dsh-quant 联动点

### 3.1 概念 → 实现
```text
dsh-quant #124 利率债（概念：定价/久期/凸性）
  → rates-bond-quant（实现：Python 引擎算久期/凸性）
→ 概念有人实现，实现有理论支撑
```

### 3.2 方法论 → 工具
```text
dsh-quant bond.ts（priceFromYield/YTM 纯函数）
  ↔ rates-bond-quant（Macaulay/修正久期/凸性）
→ 双向验证（TS 版 vs Python 版）
```

### 3.3 未来（FICC Quant Lab）
```text
rates-bond-quant 扩展 Credit/FX
  → dsh-quant 同步信用债/外汇概念（#125/#126 已有！）
→ 两个 repo 一起长大
```

---

## 四、互@计划落地清单

- [ ] dsh-quant README：加 "Related: rates-bond-quant"（FICC 实现层）
- [ ] rates-bond-quant README：加 "Related: dsh-quant"（方法论层）
- [ ] FICC 系列 ann：加 rates-bond-quant 链接（本篇已加）
- [ ] rates-bond-quant 引入 dsh-quant 概念（久期/凸性章节）
- [ ] 后续：Credit/FX repo 上线时，同步互@

---

## 🐳 一句话

> **rates-bond-quant = 我们 FICC 的实现层（Python 定价引擎），dsh-quant = 方法论层
> （TS 工具 + 概念）。开源宇宙互@计划启动：README 互链、Discussion 互推、工具互用、
> 文档互引——每个 repo 都是一个放大器，互相放大，一起长大。**

---

## 📚 相关

- rates-bond-quant：github.com/pengpengyi92/rates-bond-quant · ficc-rates-bond-quant.pages.dev
- dsh-quant FICC 系列：#124-128（利率/信用/外汇/商品/宏观体系）
- dsh-quant bond.ts（priceFromYield/YTM）

欢迎翻阅、指正、PR 🐳
