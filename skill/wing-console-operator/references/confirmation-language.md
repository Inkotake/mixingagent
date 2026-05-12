# Confirmation Language Reference

## Risk-Level Confirmation Templates

### Medium risk
Use when adjusting channel faders, mutes, sends, EQ.
```
确认执行
确认把 {target} {action}
Example: 确认把主唱推高 3dB
```

### High risk
Use when adjusting main fader, DCA, mute groups, gate/dynamics.
Must include target AND action.
```
确认执行 {target} {action}
Example: 确认把 Main LR 降低 1dB
Example: 确认 mute DCA 2
```

### Critical risk
Use for phantom power, routing, scene recall.
Must include target, action, AND risk acknowledgment.
```
确认开启 {target} 的 48V 幻象电源，我确认连接设备需要幻象电源
确认 recall {scene}，我知道这会改变当前调音台状态
确认修改 {target} 的路由，我知道可能导致主扩或耳返无声
```

## Invalid Confirmations (will be rejected)
- "yes" / "ok" / "确认" (too vague for high/critical)
- "do it" (no target acknowledgment)
- Reusing an old confirmation ID
- Confirming for a different target than the one being prepared
