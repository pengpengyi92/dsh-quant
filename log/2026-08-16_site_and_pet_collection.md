# 官网上线 + PET 域征集（带时间戳）

## [2026-08-17 00:53:03] 官网（dsh-quant-site）
- website/：单页静态站（index.html + style.css + whale-hero.svg + assets/ui-demo.png）
- 风格：Jane Street 美学（克制底色/等宽数据/橙色点睛/大留白）
- Hero：Q版二次元鲸鱼（大眼睛+星星+腮红+橙色领结），对话气泡点明
  「鲸鱼指代 DeepSeek Harness (dsh)」
- 内容：六域卡片（PDAT~PET+开源域）、PDAT→PET 管线链、UI 截图、
  ML 知识层、生态链接
- 部署：wrangler pages project create dsh-quant-site（production branch
  master）→ pages deploy website → https://dsh-quant-site.pages.dev
  （首请求 522 冷启动，复测稳定 200）
- README 挂官网链接 + 橙色 site badge；0.20.2 patch 随 npm 分发

## [2026-08-17 00:53:03] PET 域交易执行类征集
- 生态盘点：awesome 列表执行类几乎空白；GitHub 搜到 dsh quant 项目 5 个
  （dsh-quant / dsh-quant-workbench / dsh-quant-workspace / dsh-quant-ui /
  dsh-quant-data-mcp）+ dsh-finance
- 征集 Issue #12：撮合/滑点/资金管理/模拟盘/执行成本/券商API 调研 六方向
  + 学习清单（backtrader broker / vectorbt / hummingbot executor / alphalens）
  https://github.com/pengpengyi92/dsh-quant/issues/12
- 学习 Discussion #13：撮合→滑点→模拟盘→成本 学习路线 + 参与方式
  https://github.com/pengpengyi92/dsh-quant/discussions/13
