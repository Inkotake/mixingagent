import { describe, it, expect } from "vitest";
import {
  createDiagnosisSession,
  getCurrentBreakpoint,
  updateBreakpoint,
  classifyBreakpoint,
  generateHypotheses,
  scoreHypotheses,
  scoreNextTest,
  classifyBreakpointsByRule,
  logIncident,
  summarizeIncidents,
  formatDiagnosisSummary,
  type DiagnosisSession,
  type Observation,
  type DiagnosisAction,
} from "../src/index.js";

describe("DiagnosisSession", () => {
  it("creates a no_sound session with 6 breakpoints", () => {
    const session = createDiagnosisSession("no_sound", "Vocal 1", "room-a");
    expect(session.workflow).toBe("no_sound");
    expect(session.target).toBe("Vocal 1");
    expect(session.breakpoints.length).toBe(6);
    expect(session.state).toBe("scoping");
  });

  it("creates a feedback session with 4 breakpoints", () => {
    const session = createDiagnosisSession("feedback", "Main PA");
    expect(session.breakpoints.length).toBe(4);
    expect(session.breakpoints[0].location).toBe("monitor_level");
  });

  it("creates a monitor_mix session with 4 breakpoints", () => {
    const session = createDiagnosisSession("monitor_mix", "Drummer IEM");
    expect(session.breakpoints.length).toBe(4);
  });

  it("progresses through breakpoints", () => {
    const session = createDiagnosisSession("no_sound", "Vocal 1");
    const bp = getCurrentBreakpoint(session);
    expect(bp).not.toBeNull();
    expect(bp!.location).toBe("source");

    updateBreakpoint(session, "source", "pass", "Mic is working");
    const next = getCurrentBreakpoint(session);
    expect(next!.location).toBe("input_patch");
  });

  it("classifies breakpoints correctly", () => {
    const session = createDiagnosisSession("no_sound", "Vocal 1");
    const result = classifyBreakpoint(session);
    expect(result.currentStep).toBe(1);
    expect(result.totalSteps).toBe(6);
    expect(result.message).toContain("source");
  });

  it("formats diagnosis summary", () => {
    const session = createDiagnosisSession("no_sound", "Vocal 1", "room-a");
    const summary = formatDiagnosisSummary(session);
    expect(summary).toContain("no_sound");
    expect(summary).toContain("Vocal 1");
    expect(summary).toContain("room-a");
  });
});

describe("Hypothesis scoring", () => {
  it("generates hypotheses for no_input category", () => {
    const hypotheses = generateHypotheses("no_input");
    expect(hypotheses.length).toBe(4);
    expect(hypotheses[0].name).toBe("source_or_cable");
    expect(hypotheses[0].probability).toBeCloseTo(0.45, 1);
  });

  it("generates hypotheses for external category", () => {
    const hypotheses = generateHypotheses("external");
    expect(hypotheses.length).toBe(4);
    expect(hypotheses[0].name).toBe("external_amp_or_speaker");
  });

  it("scores hypotheses against observations", () => {
    const hypotheses = generateHypotheses("no_input");
    const observations: Observation[] = [
      { type: "meter", location: "input_ch1", value: -120, timestamp: new Date().toISOString() }
    ];
    const scored = scoreHypotheses(hypotheses, observations);
    expect(scored.length).toBe(4);
    // source_or_cable should still have highest probability
    expect(scored[0].name).toBe("source_or_cable");
  });
});

describe("Next-best-test scoring", () => {
  it("scores read-meter action highest (low risk, high info)", () => {
    const readMeter: DiagnosisAction = {
      type: "check", description: "Read input meter",
      tool: "wing_meter_read", risk: "low"
    };
    const highRisk: DiagnosisAction = {
      type: "fix", description: "Enable phantom",
      tool: "wing_phantom_set_prepare", risk: "critical"
    };
    expect(scoreNextTest(readMeter)).toBeGreaterThan(scoreNextTest(highRisk));
  });
});

describe("Breakpoint classification", () => {
  it("classifies no_input when input meter is absent", () => {
    const observations: Observation[] = [
      { type: "meter", location: "input_ch1", value: -120, timestamp: new Date().toISOString() },
    ];
    const result = classifyBreakpointsByRule(observations);
    expect(result.category).toBe("no_input");
    expect(result.affectedBreakpoints).toContain("source");
  });

  it("classifies external when all meters show signal and room sound confirmed", () => {
    const observations: Observation[] = [
      { type: "meter", location: "input_ch1", value: -18, timestamp: new Date().toISOString() },
      { type: "meter", location: "post_fader_ch1", value: -18, timestamp: new Date().toISOString() },
      { type: "meter", location: "main_l", value: -18, timestamp: new Date().toISOString() },
      { type: "meter", location: "main_r", value: -18, timestamp: new Date().toISOString() },
      { type: "external", location: "room", value: true, timestamp: new Date().toISOString() },
    ];
    const result = classifyBreakpointsByRule(observations);
    expect(result.category).toBe("external");
  });
});

describe("Incident logging", () => {
  it("logs and summarizes incidents", () => {
    const session = createDiagnosisSession("no_sound", "Vocal 1", "room-a");
    const actions: DiagnosisAction[] = [
      { type: "check", description: "Read input meter", tool: "wing_meter_read", risk: "low" }
    ];
    const observations: Observation[] = [
      { type: "meter", location: "input_ch1", value: -120, timestamp: new Date().toISOString() }
    ];
    const incident = logIncident(session, observations, actions, "resolved", "Cable was unplugged");
    expect(incident.outcome).toBe("resolved");
    expect(incident.resolution).toBe("Cable was unplugged");

    const summary = summarizeIncidents({ roomId: "room-a" });
    expect(summary.total).toBeGreaterThanOrEqual(1);
    expect(summary.resolved).toBeGreaterThanOrEqual(1);
  });
});
