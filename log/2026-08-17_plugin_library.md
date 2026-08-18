# [2026-08-18 14:24:39] plugin/ 五槽外部插件库上线（0.36.0）

- 结构：plugin/{data,alpha,risk,execution,combo}/ 五文件夹 +
  plugin/README 总览（引用方式：MCP 直挂 / Python 库经 subprocess）
- 第一批 22 个弹药：data 4（capital-generation 等 MCP）/
  alpha 5（101 Alphas/alphalens/qlib/BRAIN）/ risk 4（pyfolio/
  empyrical/riskfolio/dsh-finance）/ execution 6（RTG/Prosperity/
  optibook/backtrader/vectorbt/Hummingbot 仅方法论）/
  combo 5（qlib/nautilus_trader/Vibe-Trading/dsh workbench×2）
- 边界：execution 槽只做模拟与框架参照，Hummingbot/freqtrade 不接实盘
- Announcements Discussion #37（新栏目宣发）
- package.json files 收录 plugin/ → npm 随包分发
- v0.36.0 发布（第 54 次自动发布）
