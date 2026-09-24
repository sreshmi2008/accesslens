import uuid
from datetime import datetime, timezone

from app.ai.claude_client import narrate_findings
from app.compliance.mapping import map_wcag
from app.models import Finding, JourneyResult, ScanReport, ScanSummary, Severity
from app.scanner.browser import run_scan

SEVERITY_PENALTY = {
    Severity.critical: 8,
    Severity.serious: 5,
    Severity.moderate: 2,
    Severity.minor: 1,
}


def _normalize_url(url: str) -> str:
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def _build_summary(journey_names: list[str], findings: list[Finding]) -> ScanSummary:
    auto_fixable = sum(1 for f in findings if f.auto_fixable)
    penalty = sum(SEVERITY_PENALTY.get(f.severity, 1) for f in findings)
    readiness = max(0, min(100, 100 - penalty))

    high_risk = sorted(
        {f.journey for f in findings if f.severity in (Severity.critical, Severity.serious)}
    )

    return ScanSummary(
        journeys_tested=len(journey_names),
        barriers_found=len(findings),
        auto_fixable=auto_fixable,
        needs_manual=len(findings) - auto_fixable,
        is17802_readiness_pct=readiness,
        high_risk_journeys=high_risk,
    )


async def run_full_scan(raw_url: str) -> ScanReport:
    url = _normalize_url(raw_url)
    scan_result = await run_scan(url)

    findings = await narrate_findings(scan_result.raw_findings)
    for f in findings:
        f.compliance_tags = map_wcag(f.wcag_ref, f.journey)

    journey_names = ["Page Load Journey"]
    if scan_result.has_form:
        journey_names.append("Form Interaction Journey")

    journeys = [
        JourneyResult(
            name=name,
            findings=[f for f in findings if f.journey == name],
            accessibility_tree=scan_result.accessibility_tree,
        )
        for name in journey_names
    ]

    report = ScanReport(
        id=str(uuid.uuid4()),
        url=url,
        created_at=datetime.now(timezone.utc).isoformat(),
        journeys=journeys,
        summary=_build_summary(journey_names, findings),
        screenshot_base64=scan_result.screenshot_base64,
    )
    return report
