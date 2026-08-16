# dsh-data（PDAT 映射：数据域）

市场数据接入、渠道导航、数据质量与标注。

- market.ts：行情（Binance/OKX/Bybit 公共 API）+ 解析
- data-guide.ts：A 股 8 渠道知识库（查询/对比/决策建议）
- stats.ts：描述统计、序列质量、点级标注（Scale AI 哲学）
- resample.ts：周期聚合（周/月线）

原则：不提供数据 API、不为数据付费；提供数据的可观测与可治理。
