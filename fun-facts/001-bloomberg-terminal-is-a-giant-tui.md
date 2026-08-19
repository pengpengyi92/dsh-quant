# Fun Fact #001 — The Bloomberg Terminal Is a Giant TUI

> 记录日期：2026-08-19 · 来源：常识性行业知识 + 产品观察（待补一手引用）

## The fact

**Bloomberg Terminal — the most iconic (and expensive) piece of software
in finance — is, architecturally, a giant TUI.**

- 黑底橙字（amber-on-black），键盘命令驱动（`TOP`、`GP`、`WEI`、`DES`），
  功能键翻页，无鼠标依赖——交易员的肌肉记忆全部建立在键盘上。
- 它每年收费约 $30,000+/台，全球几十万终端用户，却依然是一套
  "文字界面"。华尔街最值钱的软件，没有华丽 GUI。
- 这证明了：**专业用户要的是速度、密度和确定性——而不是图形**。

## Why this matters to us

1. 量化人的图腾产品就是一个 TUI。我们做 CLI，走的是 Bloomberg 的血脉。
2. `dsh-quant` CLI（`repo` / `history` / `kline`）就是这个信仰的第一批
   落地：可读的、零依赖的、键盘世界的产品。
3. 这也解释了我们为何喜欢 TUI：**文字 > 图形、键盘 > 鼠标、组合 > 孤岛、
   一切皆可脚本化**——Linux 的世界观。

## Related fun-fact candidates (queue)

- 华尔街历史上"最短命的交易系统"故事（待考证）
- Jane Street 用 OCaml 写全栈的八卦（已有档案：quant-history/jane-street.md）
- vim 与 emacs 的编辑器圣战（TUI 文化的巅峰对决）
