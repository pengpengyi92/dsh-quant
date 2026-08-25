# MAINTAINING.md — dsh-quant maintainer playbook（维护者工作手册）

> **Who this is for**: the humans (and agent helpers) who review and merge PRs
> for dsh-quant. dsh-quant is agent-native *and* community-native: every issue
> reporter is a potential contributor, every contributor is a potential
> maintainer. Our job is to turn interest into merged code.
> Companion docs: `CONTRIBUTING.md` (contributor rules) · `ISSUE_GUIDE.md`
> (issue discipline) · `AGENTS.md` (agent guide).

---

## 1. The core idea: every issue is a future PR

The people who open issues are our **first contributors**:

- **Bug reporter** → likely a real user → can become a fixer
- **Ecosystem notifier** ("you're on list X") → a promoter → can become a linker
- **Feature requester** → has a need → can become the implementer

**Rule of thumb**: when someone files an issue, our reply should make it
**easier for them to send us a PR** than to move on. We review and merge —
that's the ecosystem work.

> 🐳 提 issue 的人 = 未来的 PR 作者 = 未来的 maintainer。我们审、我们 merge，
> 这是 maintain 项目、做生态的日常。

---

## 2. Issue → PR 转化流程（我们维护者的日常）

```text
issue 进来
  → 快速回复（24h 内，哪怕只是 "thanks, triaging"）
  → 打标签（bug / good first issue / help wanted ...）
  → 降低门槛（拆小、写清楚契约、给最小案例）
  → 邀请：@reporter "want to take a shot? I'll review fast"
  → PR 进来 → 快速 review → merge → 感谢 + 记录
  → 循环（reporter 变成 repeat contributor）
```

### 每个角色我们怎么对待

| 角色 | 例子 | 我们做什么 |
|---|---|---|
| **Bug reporter** | #105 traderlife8（dsh-desktop 装不上）| 修根因 + 回复排查步骤 + **邀请他来验证/补 PR** |
| **Ecosystem notifier** | #51 awesome-dsh-plugin-stock 收录 | 感谢 + 互相链接 + 问他生态里还有哪些列表 |
| **Directory proposer** | #40 DSH Directory | 评估 + 行动 + 反馈结果 |
| **Feature requester** | 任何人 | 确认需求 → 拆成可 PR 的 good-first-issue |

---

## 3. 审核与 merge 标准（快速但不放水）

### Merge 门槛（对 PR）
- [ ] CI 全绿（build + test + typecheck + bench + coverage + consumer）
- [ ] 契约：等长 null 对齐 · 无未来函数 · isConcurrencySafe
- [ ] 新数值函数带**手算基准单测**
- [ ] 无密钥/私密数据/私人信息
- [ ] Conventional commit + Signed-off-by（如政策要求）

### Review 态度
- **快**：小 PR 24h 内合，别让贡献者等
- **具体**：给行级反馈，不说空话
- **鼓励**：第一次贡献者，哪怕有小问题，引导修正而不是关掉
- **celebrate**：merge 后 release notes 点名 + README author section

---

## 4. 生态工作（beyond code）

维护项目不只是 merge PR：

1. **互推生态**：awesome 列表收录（#51 已发生）、DSH Directory（#40）、
   官方 Discussion 展示帖——持续做（见 promotion ops 日志）
2. **欢迎数据/研究合作**：Issue #109（插件征集）· #17（BTC 实验框架）·
   #2（数据接口征集）——把"我们的缺口"变成"别人的机会"
3. **记录与宣发**：每次 merge 的 PR、每个收录的列表、每个新贡献者——
   都在 release notes / Discussion 里点出来（credit 文化）
4. **培养维护者**：常客贡献者 → 邀请 co-maintain（CONTRIBUTING 规则允许时）

---

## 5. 当前贡献者台账（2026-08 起）

| 贡献者 | 做了什么 | 下一步 |
|---|---|---|
| **traderlife8**（70 repos）| #105 报 dsh-desktop 安装 bug | 已验证修复？→ 邀请补 PR 或后续贡献 |
| **the-beating-light-of-the-nail** | #51 报收录 awesome-dsh-plugin-stock | 感谢 + 问生态列表 |
| **alexchenzl** | #40 提议上 DSH Directory | 推进 + 反馈 |
| pengpengyi92（我们）| 19 issues · infra 升级 · 征集 | 持续维护 |

---

## 6. 我们的承诺（对贡献者）

- 每个 issue 24h 内有回应（哪怕 triaging）
- 每个 PR 快速 review，小 PR 优先合
- 每个 merge 的贡献都记入 release notes + README author section
- "方法公开、秘密内部"：公开的我们全开源，私密的我们不说

> 🐳 **提 issue 的人我们欢迎来修，我们来审、来 merge——这就是生态。**
