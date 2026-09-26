import uuid
from datetime import datetime, timezone

from app.ai.claude_client import narrate_findings
from app.ai_journey.engine import run_ai_journey
from app.compliance.mapping import map_wcag
from app.models import AIJourneyReport, AIJourneyStep, Finding, ScanSummary, Severity

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


def _build_summary(step_count: int, findings: list[Finding]) -> ScanSummary:
    auto_fixable = sum(1 for f in findings if f.auto_fixable)
    penalty = sum(SEVERITY_PENALTY.get(f.severity, 1) for f in findings)
    readiness = max(0, min(100, 100 - penalty))
    high_risk = sorted({f.journey for f in findings if f.severity in (Severity.critical, Severity.serious)})

    return ScanSummary(
        journeys_tested=step_count,
        barriers_found=len(findings),
        auto_fixable=auto_fixable,
        needs_manual=len(findings) - auto_fixable,
        is17802_readiness_pct=readiness,
        high_risk_journeys=high_risk,
    )


async def run_full_ai_journey(raw_url: str, goal: str | None) -> AIJourneyReport:
    url = _normalize_url(raw_url)
    result = await run_ai_journey(url, goal)

    findings = await narrate_findings(result.raw_findings)
    for f in findings:
        f.compliance_tags = map_wcag(f.wcag_ref, f.journey)

    findings_by_step: dict[int, list[Finding]] = {}
    for f in findings:
        # journey was set to "Step {n}" when the raw finding was collected
        try:
            step_num = int(f.journey.split()[1])
        except (IndexError, ValueError):
            continue
        findings_by_step.setdefault(step_num, []).append(f)

    steps = [
        AIJourneyStep(
            step_number=s.step_number,
            url=s.url,
            actions=s.actions,
            screenshot_base64=s.screenshot_base64,
            findings=findings_by_step.get(s.step_number, []),
        )
        for s in result.steps
    ]

    return AIJourneyReport(
        id=str(uuid.uuid4()),
        url=url,
        goal=goal,
        created_at=datetime.now(timezone.utc).isoformat(),
        steps=steps,
        summary=_build_summary(len(steps), findings),
        stop_reason=result.stop_reason,
    )
