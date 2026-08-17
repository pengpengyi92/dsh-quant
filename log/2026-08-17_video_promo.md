# [2026-08-17 15:19:56] MMlab 首支宣传片完成（dsh-quant 15s）

## 成品
- 文件：PDSH/MMlab/02_video/generated/2026-08-17_video_dsh-quant-15s.webm
- 规格：15.8s · 1280×720 · VP9+Opus · 1.8MB · 零成本
- 五场景：鲸鱼登场 / Web 工作台 / 数字滚动 / 管线链 / 结尾 CTA
- 旁白：edge-tts 晓晓（免费无 key）

## 生产链路（全浏览器方案 = Remotion 原理）
whale-hero.svg + UI 截图 → Canvas 动画 → Chrome headless MediaRecorder(VP9)
+ edge-tts 音轨混流 → webm
- 坑1：headless 加 --disable-gpu 时 MediaRecorder 输出 0 字节（canvas
  捕获需要合成器）
- 坑2：音频需 --autoplay-policy=no-user-gesture-required
- 坑3：本机无可用 ffmpeg（npm ffmpeg-static 被 OS 杀 + codesign 失败）
  → 浏览器方案成为默认生产路径

## 状态
- 先不迭代；X 宣发后再按反馈迭代（BGM/字幕烧录/节奏）
- MMlab 三板块：生图 ✅（Pollinations 实测）/ 视频 ✅（首片完成）/
  音频 ✅（edge-tts 旁白）——全链路零成本可用

## X 宣发草稿（备用，发布时复制）
🐋 我们给 dsh-quant 拍了支 15 秒宣传片——零成本：
手绘鲸鱼 SVG + 浏览器 Canvas 动画 + edge-tts 免费旁白，
画面音轨一次混流，没用一个付费工具。
46 工具 · 6 域 · 一条管线跑通 PDAT→PET
⭐ github.com/pengpengyi92/dsh-quant
#dsh #DeepSeekHarness #quant #opensource
