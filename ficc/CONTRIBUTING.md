# FICC 投稿、讨论与收录 / Community workflow

FICC = Fixed Income, Currencies and Commodities。利率、信用、外汇、大宗商品、
宏观数据、定价、风险、研究工程、执行框架及教学实验均可投稿。
成熟的库、naive baseline、学生项目、尚未跑通的想法都欢迎；请如实标注状态。
可以投自己的 repo，也可以推荐别人的项目，不要求已经适配 dsh。

## 三个入口，各自推进什么

1. **Issue：投稿和状态跟踪。** 使用 FICC resource submission 模板，一 repo 一
   Issue；新想法也可以先投稿。写清链接、FICC 关联、已知限制和 Discussion 评论
   链接。投稿 Issue 可保持简短，技术比较、评分和长回复请去集中 Discussion。
2. **Discussion：回复、提问、评分和复现交流。** 为一个 repo 建一个顶层评论，
   后续交流回复该评论；请先搜索现有评论，避免同一个项目出现多个讨论分支。
3. **PR：修改可版本化的目录或实现。** 不想先提 Issue，也可直接 PR。
   目录收录与 dsh 工具集成是两种贡献：收录不表示已经安装、验证或集成。

入口链接和首批资源见 [FICC 首页](README.md)。技术缺陷继续使用普通 bug 模板。
Issue 本身不能像 PR 一样 merge：审核后由维护者或投稿人提交目录 PR，合并后在
原 Issue 留下 PR/版本链接，再以 completed 关闭该条投稿。
长期征集总 Issue 和集中 Discussion 持续开放，不被某一批 PR 自动关闭。

## 投稿内容

```text
Repository / primary URL:
Author / proposer (self-promotion is welcome):
FICC topic: rates | credit | fx | commodities | macro-data | infrastructure
Why relevant (one concrete workflow):
Maturity: idea | teaching | prototype | library | legacy
License / data rights (unknown is a valid answer):
What I actually ran (command, version, data) / NOT_RUN:
Known limitation / counterexample:
Discussion comment URL:
```

不要上传 token、付费数据、客户/雇主材料或未经许可的策略/持仓。
我们只需要项目的公开证据。没有 license 的项目可以交流，但不会被标成可自由复用。
source-available、非商业或商业双许可项目独立标识，不混称 OSI 开源。
库代码许可与下载数据的使用/再分发权分别核对。

## 社区评分：有证据再打分

可以在 Discussion 给每个项目评分；回复对应 repo 的顶层评论即可。👍 / upvote
表示感兴趣，不等于质量认证。推荐格式：

| 维度 | 0–5 / N/A | 请提供的依据 |
|---|---|---|
| FICC 关联度 | | 具体资产/任务，避免只写“金融” |
| 可复现性 | | commit、命令、数据许可、期望与实际结果 |
| 数值/方法可靠性 | | 已核对的公式、baseline、测试与反例 |
| 文档与可用性 | | 安装过程、样例、接口、失败边界 |
| 工程与维护 | | 测试、CI、依赖、最近维护事实 |

附上使用场景、日期、repo commit/release、是否亲自运行，以及利益关联。
未运行请明确写 `NOT_RUN`，数值可靠性填 `N/A`，不凭 stars 补分。
不强制总分、不制造排行榜；若汇总社区评分，保留样本量、各维度、时间和分歧。
评分可以随新证据修改，并保留先前结论的上下文。教学项目的有效小例子也有价值。

## 每周批量收录纪律

维护者每周查看待投稿 Issue 和新 Discussion 评论；这是维护节奏约定，尚无
无人值守自动 merge。每批执行：

`submitted → needs-info / reviewed → PR → merged → credited`

- 核验 primary repo、canonical URL、license、归档状态、FICC 关联并去重。
- 在 `resources.json` 增加/修订一条，注明观察日期、证据和验证边界。
- 同步 `README.md` 表格；保留 legacy、source-available 和许可未知的标签。
- 运行 `npm run test:ficc`；涉及工具/数值代码时遵守主仓库完整测试契约。
- review 后 merge；在投稿 Issue/Discussion 记录合入 PR 与版本，感谢投稿人。
- 在 `CHANGELOG.md` 和 `log/` 的当期更新记录保留贡献来源。

收录依据是相关性、可核验来源和准确描述。评分帮助比较，不作为禁止 naive
项目参与的门槛；运行测试/定价正确性另行记录，不能用“已经收录”替代。
