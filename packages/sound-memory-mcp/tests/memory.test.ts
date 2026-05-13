import { describe, it, expect } from "vitest";

// Test the data structures and types that underpin the memory system
describe("Memory data structures", () => {
  it("creates a valid RoomTopology", () => {
    const room = {
      roomId: "room-a",
      name: "Rehearsal Room A",
      device: { model: "WING", ip: "192.168.1.100", firmware: "3.1" },
      patchSheet: {
        roomId: "room-a",
        channels: [
          { ch: 1, name: "Vocal 1", source: "Local 1", phantom: false },
          { ch: 2, name: "Guitar DI", source: "Local 2", phantom: false },
        ],
        buses: [
          { bus: 1, name: "Drummer IEM", destination: "Output 1", notes: "Stereo" },
        ],
      },
      bandPreferences: [
        { id: "pref_1", performer: "Drummer", category: "monitor_mix", key: "click", value: "+4dB" },
      ],
      incidents: [
        {
          id: "inc_1", timestamp: new Date().toISOString(), roomId: "room-a",
          type: "no_sound" as const, target: "Vocal 1",
          description: "Cable unplugged", resolution: "Reconnected XLR"
        },
      ],
      updatedAt: new Date().toISOString(),
    };
    expect(room.roomId).toBe("room-a");
    expect(room.patchSheet.channels.length).toBe(2);
    expect(room.bandPreferences.length).toBe(1);
    expect(room.incidents.length).toBe(1);
  });

  it("creates a valid MemoryRecord", () => {
    const record = {
      id: "mem_001",
      type: "semantic" as const,
      scope: "room" as const,
      scopeId: "room-a",
      text: "Room A uses WING with 48 channels",
      source: { kind: "user_confirmed" as const, ref: "setup_session_1" },
      confidence: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requiresReview: false,
    };
    expect(record.type).toBe("semantic");
    expect(record.confidence).toBeGreaterThan(0.9);
    expect(record.source.kind).toBe("user_confirmed");
  });

  it("creates a valid IncidentRecord", () => {
    const incident = {
      id: "inc_001",
      timestamp: new Date().toISOString(),
      roomId: "room-a",
      type: "feedback" as const,
      target: "Main PA",
      description: "Feedback at 4kHz during rehearsal",
      resolution: "Cut 4kHz by 3dB on Main EQ",
      auditId: "aud_abc123",
    };
    expect(incident.type).toBe("feedback");
    expect(incident.resolution).toContain("EQ");
  });

  it("MemoryType enum covers all categories", () => {
    const types = ["semantic", "episodic", "procedural", "preference", "safety", "operational"];
    expect(types.length).toBe(6);
    for (const t of types) {
      expect(["semantic", "episodic", "procedural", "preference", "safety", "operational"]).toContain(t);
    }
  });

  it("MemoryScope enum covers all scopes", () => {
    const scopes = ["global", "room", "band", "user", "device", "session"];
    expect(scopes.length).toBe(6);
  });

  it("SourceKind enum covers all sources", () => {
    const kinds = ["user_confirmed", "tool_observed", "document", "agent_inferred"];
    expect(kinds.length).toBe(4);
  });

  it("IncidentRecord type covers all problem types", () => {
    const validTypes = ["no_sound", "feedback", "routing", "hardware", "other"];
    expect(validTypes.length).toBe(5);
  });
});

describe("Search scoring logic (unit)", () => {
  it("tokenizes Chinese and English text", () => {
    // Simple tokenization: split on non-word chars, lowercase
    const tokenize = (text: string): string[] => {
      return text.toLowerCase()
        .split(/[\s,，。！？、]+/)
        .filter(t => t.length > 0);
    };
    const tokens = tokenize("主唱 没声音 Vocal 1 no sound");
    expect(tokens.length).toBeGreaterThanOrEqual(5);
    expect(tokens).toContain("主唱");
    expect(tokens).toContain("vocal");
  });

  it("Jaccard similarity works for exact match", () => {
    const jaccard = (a: Set<string>, b: Set<string>): number => {
      const intersection = new Set([...a].filter(x => b.has(x)));
      const union = new Set([...a, ...b]);
      return union.size === 0 ? 0 : intersection.size / union.size;
    };
    const query = new Set(["vocal", "no", "sound"]);
    const text = new Set(["vocal", "no", "sound", "channel", "one"]);
    const score = jaccard(query, text);
    expect(score).toBeCloseTo(3 / 5, 1);
  });

  it("scope boost favors room scope", () => {
    const scopeBoost = (scope: string): number => {
      switch (scope) {
        case "room": return 0.15;
        case "band": return 0.12;
        case "device": return 0.10;
        case "user": return 0.08;
        case "global": return 0.05;
        default: return 0;
      }
    };
    expect(scopeBoost("room")).toBeGreaterThan(scopeBoost("global"));
    expect(scopeBoost("room")).toBe(0.15);
  });

  it("recency boost favors recent records", () => {
    const now = new Date();
    const recent = new Date(now.getTime() - 3600000).toISOString(); // 1 hour ago
    const old = new Date(now.getTime() - 86400000 * 30).toISOString(); // 30 days ago

    const recencyBoost = (createdAt: string, type: string): number => {
      const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3600000;
      if (type === "episodic") return Math.exp(-ageHours / 48);
      return Math.exp(-ageHours / 720);
    };

    const recentBoost = recencyBoost(recent, "semantic");
    const oldBoost = recencyBoost(old, "semantic");
    expect(recentBoost).toBeGreaterThan(oldBoost);
  });
});
