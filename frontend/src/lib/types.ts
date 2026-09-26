export type Persona = "color_blind" | "low_vision" | "motor_impaired" | "screen_reader";
export type Severity = "critical" | "serious" | "moderate" | "minor";

export interface ComplianceTag {
  law: string;
  reference: string;
}

export interface Finding {
  id: string;
  journey: string;
  persona: Persona;
  severity: Severity;
  title: string;
  user_impact: string;
  suggested_fix: string;
  code_before: string | null;
  code_after: string | null;
  auto_fixable: boolean;
  manual_test_hint: string;
  wcag_ref: string | null;
  selector: string;
  compliance_tags: ComplianceTag[];
}

export interface JourneyResult {
  name: string;
  findings: Finding[];
  accessibility_tree: string[];
}

export interface ScanSummary {
  journeys_tested: number;
  barriers_found: number;
  auto_fixable: number;
  needs_manual: number;
  is17802_readiness_pct: number;
  high_risk_journeys: string[];
}

export interface ScanReport {
  id: string;
  url: string;
  created_at: string;
  journeys: JourneyResult[];
  summary: ScanSummary;
  screenshot_base64: string | null;
}

export interface ScanHistoryItem {
  id: string;
  url: string;
  created_at: string;
  barriers_found: number;
  readiness_pct: number;
}

export interface JourneyAction {
  name: string;
  input: Record<string, unknown>;
}

export interface AIJourneyStep {
  step_number: number;
  url: string;
  actions: JourneyAction[];
  screenshot_base64: string | null;
  findings: Finding[];
}

export type AIJourneyStopReason = "completed" | "max_steps_reached" | "left_target_site" | "error";

export interface AIJourneyReport {
  id: string;
  url: string;
  goal: string | null;
  created_at: string;
  steps: AIJourneyStep[];
  summary: ScanSummary;
  stop_reason: AIJourneyStopReason;
}

export interface AIJourneyHistoryItem {
  id: string;
  url: string;
  goal: string | null;
  created_at: string;
  barriers_found: number;
  steps_taken: number;
  stop_reason: AIJourneyStopReason;
}

export const PERSONA_LABEL: Record<Persona, string> = {
  color_blind: "Color-blind user",
  low_vision: "Low-vision user",
  motor_impaired: "Motor-impaired user",
  screen_reader: "Screen-reader user",
};
