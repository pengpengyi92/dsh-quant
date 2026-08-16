# dsh-community 域（开源生态域）

dsh-quant 独有的「自我造血」域：开源侧用自己的工具度量自己的生态影响力。
内部五队（PDAT/PAAT/PCPT/PRT/PET）没有对应物——这是开源侧相对内部的独有资产。

## 模块

- `github.ts` — GitHub 仓库生态数据（星标/复刻/议题/PR/最新 release），公共 API，无需凭据
- `npm.ts` — npm 包生态数据（最新版/周下载/月下载），公共 API
- `pulse.ts` — 影响力评分 `ossPulse`（0-100 + A/B/C/D 等级 + 行动建议），纯函数可手算

## pulse 公式（可解释、可手算）

| 分项 | 权重 | 输入 | 中性值 |
|---|---|---|---|
| stars 星标基数 | 20% | stars 分档 | —（必填）|
| downloads npm 周下载 | 15% | downloadsWeekly 分档 | 50 |
| momentum 星标增速 | 25% | (stars - starsPrevious)/max(1, starsPrevious) | 50 |
| health 社区健康 | 20% | (openIssues+openPRs)/max(1, stars) 分档 | 50 |
| freshness 发布新鲜度 | 20% | daysSinceRelease 分档 | 50 |

等级：>=80 A · >=60 B · >=40 C · 否则 D。建议按最弱分项给出具体行动。

## 用法（模型视角）

```
quant_repo_stats(owner, repo) + quant_npm_stats(pkg)
  → quant_oss_pulse(stars, downloadsWeekly, starsPrevious, openIssues, openPullRequests, daysSinceRelease)
  → 每天一条生态健康播报 + 行动建议
```

不吃自己的狗粮的生态工具不是好工具——本域的第一个正式用户就是 dsh-quant 自己。
