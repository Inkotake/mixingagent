# MixingAgent — AI 调音师

基于 [wing-mcp](https://github.com/Inkotake/wing-mcp) 的 AI 声音工程师系统。

## 开发状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 诊断引擎 | ✅ 可用 | Bayesian 假设评分, 5 断点分类, 13 tests |
| 房间记忆 MCP | ✅ 可用 | 11 tests, patch sheets, incidents, preferences |
| Skill | ✅ | 9 参考文件, validate_tool_plan.py |
| Agent presets | ✅ | 4 子代理, 4 slash commands, 2 system prompts |
| 语音交互 | ❌ 计划中 | push-to-talk, TTS 不进 Main LR |
| Agent runtime | ❌ 计划中 | MCP client + session mgmt + model router |

## 依赖

- [wing-mcp](https://github.com/Inkotake/wing-mcp) — WING MCP 服务器 (硬件控制内核)
- Node.js >= 18, pnpm

## 架构

```
用户语音/文字
    ↓
MixingAgent (诊断引擎 + Skill + 记忆)
    ↓
wing-console-mcp (WING MCP Server — 安全控制内核)
    ↓
Behringer WING 调音台
```

## 项目结构

```
mixingagent/
├── packages/
│   ├── sound-diagnosis-engine/   # 诊断引擎 — Bayesian 假设评分 + 5 断点分类
│   └── sound-memory-mcp/         # 房间知识库 MCP — patch sheets, incidents
├── skill/wing-console-operator/  # AI 操作规范 Skill — SKILL.md + 9 参考文件
├── agent-presets/
│   ├── .claude/agents/           # 4 子代理 (diagnosis, safety, protocol, test)
│   ├── .claude/commands/         # /no-sound, /line-check, /review-risk
│   └── system-prompts/           # AI 调音师 + 高危审查员
└── examples/                     # 对话样例 + Room A patch sheet
```

## 快速开始

```bash
pnpm install && pnpm build
# 依赖 wing-mcp 的 wing-console-mcp 服务运行中
```

## 测试

```bash
pnpm test  # 24 tests (3 files): diagnosis engine + memory MCP
```

## License

MIT
