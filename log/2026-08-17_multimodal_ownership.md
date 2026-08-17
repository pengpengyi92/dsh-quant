# [2026-08-17 20:17:50] 决策沉淀：dsh-quant 的多模态生成全部由 PDSH + PMMLAB 包揽

## 决策
dsh-quant 的**多模态生成**（生图/生视频/生音频/宣传素材）从此全部由
**PDSH/MMlab（操作实验室）+ PMMLAB（Pengyi Multi-Model Lab，规范研究）**包揽，
dsh-quant 本体不放任何多模态生成功能。

## 分工矩阵
| 职责 | 归属 |
|---|---|
| 量化方法层（46 工具 · 6 域 · 管线）| dsh-quant（专注，不膨胀）|
| 多模态工具实测、生产配方、生成资产 | PDSH/MMlab |
| 多模态规范研究、四 Agent 调度、人控门 | PMMLAB |
| 品牌鲸鱼 IP 手绘 SVG 源稿 | MMlab 管理，dsh-quant 仓库只放成品 |

## 为什么这是好 R&D
- **生态位纪律**：社区已有 10 个生图插件 + 27 个音频插件——dsh-quant
  不抢生图的生态位，只守「量化方法层」这一个单点（product_mindset 备忘录）
- **实验室分工**：操作实验室（MMlab 实测出配方：Pollinations 零 key 生图、
  edge-tts 免费配音、浏览器 Canvas 录屏 = Remotion 原理）→ 规范实验室
  （PMMLAB 目录 + 团队 + 门）→ 宣发。各做各擅长的事
- **可复用性**：78 个多模态插件目录在 PMMLAB/research，实测配方在
  MMlab/02_video，未来任何项目要宣传片直接调度，不用重新发明

## 关联文档
- PDSH/MMlab/README.md（共享关系段）
- PMMLAB/research/multimodal-tools.md（78 插件全目录）
- log/2026-08-17_video_promo.md（首支宣传片生产链路）
- log/2026-08-17_pmmlab_share.md（PMMLAB 建立与接入）
