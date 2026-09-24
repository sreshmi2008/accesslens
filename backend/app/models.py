from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class Persona(str, Enum):
    color_blind = "color_blind"
    low_vision = "low_vision"
    motor_impaired = "motor_impaired"
    screen_reader = "screen_reader"


class Severity(str, Enum):
    critical = "critical"
    serious = "serious"
    moderate = "moderate"
    minor = "minor"


class ComplianceTag(BaseModel):
    law: str
    reference: str


class RawFinding(BaseModel):
    """Findings straight out of axe-core / heuristics, before Claude narrates them."""

    source: str  # "axe" | "target-size" | "focus-order" | "a11y-tree"
    rule_id: str
    wcag_ref: Optional[str] = None
    selector: str
    html_snippet: str = ""
    description: str
    journey: str  # "Page Load Journey" | "Form Interaction Journey"
    severity_hint: Severity = Severity.moderate


class Finding(BaseModel):
    id: str
    journey: str
    persona: Persona
    severity: Severity
    title: str
    user_impact: str
    suggested_fix: str
    code_before: Optional[str] = None
    code_after: Optional[str] = None
    auto_fixable: bool
    wcag_ref: Optional[str] = None
    selector: str
    compliance_tags: list[ComplianceTag] = Field(default_factory=list)


class JourneyResult(BaseModel):
    name: str
    findings: list[Finding]
    accessibility_tree: list[str] = Field(default_factory=list)


class ScanSummary(BaseModel):
    journeys_tested: int
    barriers_found: int
    auto_fixable: int
    needs_manual: int
    is17802_readiness_pct: int
    high_risk_journeys: list[str]


class ScanReport(BaseModel):
    id: str
    url: str
    created_at: str
    journeys: list[JourneyResult]
    summary: ScanSummary
    screenshot_base64: Optional[str] = None


class ScanRequest(BaseModel):
    url: str


class ScanHistoryItem(BaseModel):
    id: str
    url: str
    created_at: str
    barriers_found: int
    readiness_pct: int
