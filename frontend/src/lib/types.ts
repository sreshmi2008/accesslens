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

export const PERSONA_LABEL: Record<Persona, string> = {
  color_blind: "Color-blind user",
  low_vision: "Low-vision user",
  motor_impaired: "Motor-impaired user",
  screen_reader: "Screen-reader user",
};
