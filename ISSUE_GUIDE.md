# ISSUE_GUIDE.md — dsh-quant issue guide for agents (and the humans who run them)

> **Who this is for**: AI agents visiting dsh-quant, and maintainers who want
> agents to file *good* issues — the kind that turn into merged PRs.
> dsh-quant is agent-native: agents read this repo's docs and contribute
> plugins, tests, and fixes themselves. A well-formed issue is the first step.

---

## 1. What an issue is (and is not)

| | Issue | PR |
|---|---|---|
| Purpose | state a problem, need, or invitation | deliver code that resolves one |
| Who | anyone — human or agent | contributor (usually after an issue) |
| Lifecycle | open → discuss → (PR references it) → close | open → review → merge |

**Golden rule**: an issue should make it **trivial for the next agent** to act.
If a fresh agent can read your issue and write a correct PR without asking
questions, it's a good issue.

---

## 2. Issue types we welcome (all of them)

| Type | Label | Use when... | What a good one contains |
|---|---|---|---|
| **Bug** | `bug` | something works incorrectly | repro (tool+args+expected+actual), environment, minimal case |
| **Feature request** | `enhancement` | new tool/indicator/strategy/data source | what + canonical output sketch + why it matters |
| **Call for contributions** | `good first issue` + `help wanted` | inviting PRs for a defined gap | existing state, suggested scope (S/M/L), acceptance criteria |
| **Data / research invite** | `help wanted` | inviting data providers / research partners | what data/knowledge, how to connect, existing hooks |
| **Question** | `question` | "how do I…?" | context + what you tried (docs-first; Q&A may move to Discussions) |
| **Design discussion** | `enhancement` | architectural direction | the decision to make, tradeoffs, reference to DESIGN.md |

Every type is welcome — **a repo with many issue types is a living repo**.
We maintain labels so agents can filter: `good first issue` = safe onboarding,
`help wanted` = explicitly seeking help, `bug` = needs a fix.

---

## 3. Writing a good bug report (agent checklist)

```
[ ] One bug per issue — a separate issue is easier to bisect than a list
[ ] Title: "[bug] <tool>: <what's wrong in one line>"
[ ] Repro: exact tool name + arguments + expected vs actual
    { "tool": "quant_sma", "arguments": { "values": [1,2,3,4,5], "window": 3 } }
    Expected: [null,null,2,3,4]
    Actual:   [null,null,2,3,4,5]   ← wrong shape
[ ] Environment: dsh-quant version (`npm ls dsh-quant`), node/pnpm version
[ ] Minimal: strip it to the smallest failing case (that's also a hint of the fix)
[ ] No secrets: never paste API keys, tokens, or private alpha expressions
```

An agent filing a bug should also try: **is it already fixed on master?**
`git pull && npm test` — if yes, say so instead of opening a duplicate.

---

## 4. Writing a good feature request (agent checklist)

```
[ ] Title: "[feat] <tool or area>: <capability>"
[ ] What: one sentence
[ ] Canonical output sketch: the JSON shape the tool must return (tool contract)
    { "example": "output shape the agent can consume" }
[ ] Why it matters: who uses it, what workflow it unblocks
[ ] Fit: which of the six domains (data/alpha/ML/risk/execution/community)
[ ] Reference existing patterns: link a sibling tool to imitate
```

Feature requests that include a **canonical output sketch** are dramatically
more likely to get merged — the output contract is the hard part.

---

## 5. Claiming / driving an issue as an agent

1. Find a `good first issue` (label filter) — read it fully.
2. **Comment to claim** it (so two agents don't collide): "I'll take this."
3. Implement per `CONTRIBUTING.md` (pure core, canonical outputs, tests).
4. Open a PR with `closes #<issue>` in the description → auto-links.
5. Reference the contract in the PR body (tests run, typecheck clean,
   coverage added).

**Commit hygiene for agents**: conventional commits (`feat:`/`fix:`/`test:`/
`docs:`/`infra:`), signed-off, no AI co-author lines unless the repo policy
allows them — check `CONTRIBUTING.md` first.

---

## 6. Maintainer side: keeping the issue tracker healthy

- **Reply fast** (even "thanks, triaging"): responsiveness is the #1
  contributor-retention lever. Issue #105 (dsh-desktop install) got a
  root-cause fix + a reply the same day — that's the bar.
- **Label everything**: every open issue carries ≥1 label (we enforce it).
- **Route Q&A to Discussions**: `config.yml` sends questions/ideas there,
  keeping issues focused on bugs + feature/cfc work.
- **Turn stale invites into actions**: a "征集 PR" issue without activity
  after a while → either close politely or break it into smaller `good first
  issue` pieces (like #106: "raise market.ts coverage 69.6% → ≥85%").
- **Celebrate closes**: when an issue closes via PR, the contributor appears
  in release notes + README author section.

---

## 7. Quick reference

```text
Issue tracker:  https://github.com/pengpengyi92/dsh-quant/issues
Templates:      .github/ISSUE_TEMPLATE/{bug_report,feature_request,call_for_contributions}.md
Discussions:    https://github.com/pengpengyi92/dsh-quant/discussions  (Q&A / ideas)
Contributing:   CONTRIBUTING.md   (dev loop + design rules)
Agent guide:    AGENTS.md / mcp/AGENT_GUIDE.md
```

> 🐳 **Every issue is an invitation.** A good issue says: "here's a defined
> gap, here's the contract, here's how you close it." That's how an
> agent-native repo grows.
