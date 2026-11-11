# ADIA 全面 DD：主权资本、QRD、独立 ADIA Lab 与公开代码生态

记录时间：2026-11-12T00:42:04+08:00，Asia/Shanghai。

沿用 quant-history / quant-repo 双栏目，而不是另起一个机构库。
本次以官方 2025 Review、Lab 关系说明、招聘原文及 GitHub 元数据为基础。

## 阅读入口

- [九段 Deep DD](https://github.com/pengpengyi92/dsh-quant/blob/codex/adia-dd-20261112/quant-history/adia.md)：治理、历史、规模口径、多资产投资、QRD、风险、招聘与待核。
- [代码专刊](https://github.com/pengpengyi92/dsh-quant/blob/codex/adia-dd-20261112/quant-repo/adia.md)：六个合作方/社区仓库，commit、许可、用途和复现限制。
- [冻结元数据](https://github.com/pengpengyi92/dsh-quant/blob/codex/adia-dd-20261112/quant-repo/evidence/2026-11-12-adia-github.json)：记录时间、owner、license、root license/NOTICE 与 NOT_RUN。

内容先通过独立 PR 审阅；上面的分支链接可直接阅读，不表示已合入 master。

## 几个关键发现

1. ADIA 是主权长期投资机构，不是纯 HFT 公司；QRD 参与系统化策略和动态配置。
2. ADIA Lab 是独立法律实体，不能把其比赛代码说成 ADIA 内部 alpha 开源。
3. 已确认 CrunchDAO 的比赛 starter/scoring 和社区方案；尚未核实自有官方投资技术仓库，检索无结果不等于绝对不存在。
4. Data Science 岗位实际属于 Data Curation；另有各经验层级的 QRD 综合入口。岗位原文、年资和学位条件已分别标注。
5. 2026 实时结构突变赛已于 10 月 1 日截止。offline ROC-AUC、online TS-AUC 与持续 Open Benchmark 不可混为一谈。
6. 最新长期收益不等于单年回报，更不等于 QRD alpha；本次未核实官方总 AUM。

## 欢迎共建

欢迎补充**可验证的官方仓库归属、明确许可证、论文实现及复现记录**。
请附 URL、日期、具体版本与数据使用条件，尤其欢迎纠正已变化的招聘
信息。谢谢所有公开方法、失败实验和复现边界的作者。

本次只是 DD/导航，未安装外部仓库、取比赛数据或训练/提交模型。
结构突变插件还是研究提案，质量 **UNMEASURED**，不计入工具数量。

本地标准 `npm test`（build、typecheck、329 项测试）通过，其中新增 5 项
文档/来源一致性检查。测试不等于 ADIA 外部模型复现，也不证明招聘适配。
