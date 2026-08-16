# dsh-quant 环境与依赖（Environment & Dependencies）

> 0.7.0 起维护。fork/pull 后按此文档安装即可测试通过、直接使用。
> 记录日期：2026-08-16（版本 0.7.0 时点快照）

## 运行时要求（Runtime）

| 项 | 要求 | 说明 |
|---|---|---|
| Node.js | ^22.19.0 或 >=24 | CI 用 24；本地开发 24.14.0 |
| npm | 随 Node 自带 | 使用 `npm ci`（有 package-lock）|
| TypeScript | ^5.6（lock 5.9.3）| 构建 lib/（NodeNext ESM + 声明文件）|
| tsx | ^4.19（lock 4.23.12）| 测试运行器（零配置 TS）|
| Python | **无需**（本插件 100% TypeScript，零 Python 依赖）| 仅数据指南指向的渠道库（akshare/tushare 等）需要用户在各自环境装 Python 3.9+ |

## 核心依赖（peerDependencies，由宿主 dsh 提供）

| 包 | 版本 | 角色 |
|---|---|---|
| @deepseek-ai/cordis | ^4.0.0（lock 4.0.1）| 插件框架（ctx 服务）|
| @deepseek-ai/dsh-tools | ^0.1.0-rc.5（lock 0.1.0-rc.6）| defineTool 契约 + 工具注册表 |
| @deepseek-ai/dsh-system-prompt | ^0.1.0-rc.5（lock 0.1.0-rc.6）| ToolRuntime 的注入依赖 |

## 开发依赖（devDependencies）

| 包 | 版本（lock）| 用途 |
|---|---|---|
| @deepseek-ai/cordis-plugin-loader | 1.0.2 | REAL-composition 测试 |
| @deepseek-ai/cordis-plugin-include | 1.0.6 | cordis.yml 加载 |
| @types/node | 24.13.3 | Node 类型 |
| typescript | 5.9.3 | 构建 |
| tsx | 4.23.12 | 测试 |

## 快速开始（fork/pull 后）

```sh
npm ci          # 按 lock 精确安装（27+ 包）
npm run build   # tsc → lib/
npm test        # 50 单元 + 4 Loader 组合（离线，无需网络）
npm run test:verify  # 额外真实行情集成（需网络访问 Binance/OKX/Bybit 公共 API）
```

## 与 dsh 集成

```yaml
# 方式 1：dsh plugin add dsh-quant
# 方式 2：cordis.yml 直接引用
- name: 'dsh-quant'
```

## 版本矩阵（本插件 vs 依赖）

| 插件版本 | dsh-tools | cordis | Node |
|---|---|---|---|
| 0.6.0–0.7.0 | ^0.1.0-rc.5 | ^4.0.0 | ^22.19 / >=24 |
| 0.1.0–0.5.0 | ^0.1.0-rc.5 | ^4.0.0 | ^22.19 / >=24 |

## 数据渠道的 Python 环境（仅使用渠道指南时）

- akshare / baostock / tushare 需要用户自备 Python 3.9+ 环境（`pip install <lib>`）
- 本插件不捆绑、不代付任何数据 API；详见 `quant_data_guide` 工具与 mcp/ 文档
