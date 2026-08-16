---
name: quant-release-cycle
description: Use before pushing dsh-quant changes or cutting a release — build, test, regenerate tool schemas, run live verification, update CHANGELOG/README/log, bump the version, push tags and watch the auto-release workflow. The dsh-quant adaptation of the official dsh-pre-push-checks skill.
---

# dsh-quant 发版纪律

官方 `dsh-pre-push-checks` 的 dsh-quant 落地版：推送/发版前跑**最小验证集**，
不无脑全量。发版走全自动流水线（tag → CI → npm），人只做「改码 + 提交 + 打 tag」。

## 1. 最小验证集（按改动面选择）

- 改动工具/纯函数：`npm run build && npm test`（162 单元 + 4 Loader）
- 改动网络层/provider/schema：加跑 `npm run gen:tools`（tools.json 同步）
  + `verify.ts`（真实 API 集成，需 GITHUB_TOKEN 环境变量）
- 改动 README/文档：`git diff --cached --check` 即可
- 新增工具：Loader 清单（tests/loader-composition.spec.ts）+ tools.json +
  README 工具表 + CHANGELOG 四处同步

## 2. 发版流程（npm 自动发布）

```sh
git add -A && git commit -m "feat(x.y.z): ..."
npm version minor            # 或 patch；自动 bump + 打 tag
git push --follow-tags       # CI + release workflow 自动 npm publish
```

- `prepublishOnly` 已内置 build + 全测试门槛；
- 观察发布：`gh run list` 看 release workflow 结论 + registry.npmjs.org 确认版本；
- GitHub push 若缺凭据：用 `gh auth token` 走 https 推（不落盘 token）。

## 3. 每个版本的三件套

1. CHANGELOG.md：Keep a Changelog 格式（Added/Changed/Fixed）；
2. README.md：工具表/计数/NEWS 表同步；
3. log/：版本记录（含教训），同步 PDSH/pengyi-os/PJS 三镜像。

## 4. 映射自官方 skill

本 skill = dsh-pre-push-checks（最小检查集）+ dsh-prose-standard（提交信息
与文档措辞）+ dsh-archive-agent-notes（log 归档判定）在 dsh-quant 上的组合。
