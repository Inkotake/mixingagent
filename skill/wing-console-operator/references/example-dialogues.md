# Example Dialogues

See `examples/dialogues/` for full walkthroughs:
- `no-sound-vocal.md` — Main vocal no sound diagnosis
- `monitor-mix.md` — Drummer IEM adjustment

## Pattern: Diagnosis First
User: "Problem X"
AI: Read state → classify breakpoint → recommend → [user confirms] → apply → verify

## Pattern: Direct Request
User: "Adjust Y by Z dB"
AI: Read current value → prepare change → [user confirms] → apply → readback → report

## Pattern: Critical Action
User: "Change routing/phantom/scene"
AI: Read state → classify as critical → require exact risk-acknowledging confirmation → apply → audit
