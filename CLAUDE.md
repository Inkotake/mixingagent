# AI Sound Engineer (调音师)

AI sound engineer system built on wing-mcp. Provides intelligent diagnosis, memory, and voice interaction for Behringer WING consoles.

## Project goal

- `sound-diagnosis-engine`: no-sound / feedback / monitor workflows with Bayesian hypothesis scoring
- `sound-memory-mcp`: room knowledge, patch sheets, memories, incidents (standalone MCP server)
- `wing-console-operator` Skill: safe operating procedures for AI agents
- `voice-shell`: push-to-talk and realtime voice UX (future)
- Agent presets, slash commands, system prompts, and example dialogues

## Architecture

```
voice/chat client
  -> mixingagent (diagnosis + memory + skill)
      -> wing-console-mcp (from wing-mcp project)
      -> Behringer WING console
```

## Dependencies

- `wing-console-mcp`: the WING MCP server from the wing-mcp project
- Node.js >= 18, pnpm

## Safety

All safety enforcement lives in wing-console-mcp. This project provides the intelligent layer on top — diagnosis workflows, memory retrieval, voice interaction — but NEVER bypasses the MCP safety layer.
