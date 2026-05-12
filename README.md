# MixingAgent — AI 调音师

基于 [wing-mcp](https://github.com/Inkotake/wing-mcp) 的智能调音助手系统。

## 项目结构

```
mixingagent/
├── packages/
│   ├── sound-diagnosis-engine/   # 诊断引擎
│   └── sound-memory-mcp/         # 房间知识库 MCP
├── skill/wing-console-operator/  # AI 操作规范 Skill
├── agent-presets/                # Agent 配置、子代理、/命令
├── examples/                     # 对话样例
└── docs/                         # 使用手册、诊断设计
```

## 快速开始

```bash
pnpm install
pnpm build
```

需要先安装并运行 wing-mcp 的 `wing-console-mcp` 服务器。

## 与 wing-mcp 的关系

- **wing-mcp**: 通用 WING MCP 服务器 — 提供完整的调音台控制和状态读取
- **mixingagent**: AI 调音师应用 — 诊断引擎、记忆系统、Skill、语音交互

mixingagent 通过 MCP 协议调用 wing-mcp 的工具，由 wing-mcp 的安全引擎保证所有操作的安全性。
