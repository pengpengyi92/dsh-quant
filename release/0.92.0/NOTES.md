# v0.92.0 — FICC community, resource directory and contributor roll-up

FICC 资源与共建入口上线：**45 个去重仓库引用**，覆盖利率/信用、衍生品、FX、
商品期货、能源基本面、宏观数据和教学/naive/历史项目。

- [FICC 目录](https://github.com/pengpengyi92/dsh-quant/tree/master/ficc)
- [集中讨论、回复与评分 #151](https://github.com/pengpengyi92/dsh-quant/discussions/151)
- [长期投稿与收录跟踪 #152](https://github.com/pengpengyi92/dsh-quant/issues/152)

成熟库和早期想法都欢迎。Issue 跟踪投稿，Discussion 集中交流和证据评分；审核后的
条目由作者或维护者提交小 PR，定期 merge 并记录贡献者。目录保存代码许可、数据权限
限制和来源日期；source-available 与许可未知条目单独标识。首批是来源核验，未安装
或运行外部库，不将收录说成生产验证或 dsh 兼容认证。

## 同时收进正式版本的既有 merge

- **DSH 兼容性**：#136 / #142，保留 @hufeide 的原始贡献历史；感谢 @ziladan
  在 #139 / #140 提交升级反馈。四宿主验收范围保留到 0.2.1-rc.2。
- **JSON / 风险修复**：#138 解决未提供 trades 时的非 JSON 输出，感谢
  @klauschenshu-arch 的 #135；#141 修复 Kupiec POF 边界、p 值及有限输出。
- **行情离线测试**：感谢 @Yuren0312 的 #144；#146 进一步把 Node-only
  market-test 类型检查加入常规与四宿主 CI。PR 已 merge，原作者 commit 保留。
- **数据渠道**：感谢 @aprsn 在 Issue #2 投稿 SiftingIO；#150 条件收录官方
  spec/SDK，保留凭据、数据权限和实际 API 未测边界，同时修复 readiness schema。
- **交付与研究记录**：#143 / #145 的精确包与四宿主验收机制；已提交的研究、
  benchmark 和全球宏观架构文档一并保留。

感谢 **@hufeide、@Yuren0312、@klauschenshu-arch、@ziladan、@aprsn**，
以及目录中各项目的原作者。欢迎继续投稿、review 和复现交流。🐳

## 验证与发布状态

本地 build、source/script/market-test 类型检查和 `npm test` **324/324** 通过。
FICC 生成目录、去重、来源和许可边界校验通过。GitHub CI 与 npm 发布结果见
[交付记录](https://github.com/pengpengyi92/dsh-quant/blob/master/release/0.92.0/DELIVERY.md)。

这是保持现有 API 的 additive minor milestone；本轮没有新增数值工具、部署第三方
库或实盘功能。GitHub source Release 与 npm 可安装版本分别记录；不要仅凭 tag 推定
registry 已更新。既有 `v0.91.0` / `v0.91.1` tag 保持不变。

DSH 0.2.1-rc.5 desktop 安装（#149）、三个 live API 和外部库数值复现仍未验证。
