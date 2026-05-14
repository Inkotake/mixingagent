# MixingAgent — AI 调音师

基于 [wing-mcp](https://github.com/Inkotake/wing-mcp) 的 **AI 声音工程师系统**。

## AI 调音师能做什么

把 MixingAgent 放在排练室，它通过 MCP 协议连接 wing-mcp 控制 Behringer WING 调音台：

- **听懂你的问题** — "主唱没声音" → 自动定位 CH 1 → 逐级排查 → 精确定位断点
- **只读诊断优先** — 先看 meter、查路由、读状态，不盲目修改
- **确认后才改** — 所有写入需要你说出精确确认文本
- **记住你的场地** — patch sheet、乐队偏好、历史故障
- **一次只说一件事** — 不会给你甩十条指令

## 架构

```
你的语音/文字
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
│   ├── sound-diagnosis-engine/   # 诊断引擎 — Bayesian 假设评分 + 断点分类
│   └── sound-memory-mcp/         # 房间知识库 MCP — patch sheets, incidents, preferences
├── skill/wing-console-operator/  # AI 操作规范 Skill — 9 个参考文件
├── agent-presets/                # 子代理 + slash 命令 + system prompts
│   ├── .claude/agents/           # 4 个专用子代理
│   ├── .claude/commands/         # /no-sound, /line-check, /review-risk
│   └── system-prompts/           # AI 调音师 + 安全审查员 prompt
└── examples/                     # 对话样例 + Room A patch sheet
```

## 快速开始

```bash
pnpm install && pnpm build

# 依赖 wing-mcp 的 wing-console-mcp 服务
# 参见 https://github.com/Inkotake/wing-mcp
```

## 诊断引擎

Bayesian 假设评分 + 断点分类规则：

| 断点分类 | 假设 | 先验概率 |
|---------|------|---------|
| `no_input` | source_or_cable | 0.45 |
| `no_input` | input_patch | 0.25 |
| `no_input` | headamp_or_phantom | 0.20 |
| `no_post_fader` | channel_mute | 0.35 |
| `no_post_fader` | noise_gate_closed | 0.25 |
| `no_main_meter` | dca_mute | 0.30 |
| `no_main_meter` | mute_group | 0.25 |
| `no_room_sound` | output_patch | 0.40 |
| `no_room_sound` | speaker_power | 0.30 |
| `external` | external_amp_or_speaker | 0.40 |

## 对话示例

```
用户: 主唱没声音
AI: [读取 Room A patch sheet] 主唱 → CH 1
    [检查 signal] CH 1 无信号 (RMS -65 dBFS)
    [trace path] headamp 30dB, not muted, fader -6dB
    → 问题在音源端。请检查话筒线/无线接收器。

用户: 线松了，现在好了
AI: [重新检查] CH 1 有信号 ✅ (RMS -18.3 dBFS)。还需要什么调整？
```

## 依赖

- [wing-mcp](https://github.com/Inkotake/wing-mcp) — WING MCP 服务器 (硬件控制 + 安全内核)

## License

MIT
