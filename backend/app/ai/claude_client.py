import json
import uuid

from anthropic import AsyncAnthropic

from app.config import settings
from app.models import Finding, Persona, RawFinding

MAX_FINDINGS_TO_NARRATE = 40

_PERSONA_HINTS = {
    "image-alt": "screen_reader",
    "input-image-alt": "screen_reader",
    "button-name": "screen_reader",
    "link-name": "screen_reader",
    "aria-command-name": "screen_reader",
    "label": "screen_reader",
    "form-field-multiple-labels": "screen_reader",
    "color-contrast": "low_vision",
    "target-size-small": "motor_impaired",
    "target-spacing-tight": "motor_impaired",
    "missing-focus-indicator": "motor_impaired",
    "heading-order": "screen_reader",
    "landmark-one-main": "screen_reader",
}

SYSTEM_PROMPT = """You are an accessibility expert writing findings for an Indian web accessibility \
audit tool called AccessLens. For each raw technical finding you are given, rewrite it from the \
point of view of the disabled user it actually affects. Be concrete and specific to the element \
described, never generic. Respond with ONLY a JSON array (no prose, no markdown fences) where each \
object has exactly these keys:
- "index": the integer index of the input finding this corresponds to
- "persona": one of "color_blind", "low_vision", "motor_impaired", "screen_reader"
- "title": short finding title (max 10 words)
- "user_impact": 1-2 sentences, plain language, written as what actually happens to the user \
("A screen-reader user will hear ...")
- "suggested_fix": 1-2 sentences of plain-language guidance
- "code_after": a short corrected HTML/CSS snippet implementing the fix, or null if not \
auto-fixable in a snippet (e.g. it needs a design decision)
- "auto_fixable": true if this is a mechanical fix (contrast, alt text, labels, focus outline, \
target size/spacing), false if it needs human judgement (complex ARIA, workflow redesign)
"""


def _dedupe(raw_findings: list[RawFinding]) -> list[tuple[RawFinding, int]]:
    grouped: dict[tuple[str, str], list[RawFinding]] = {}
    order: list[tuple[str, str]] = []
    for f in raw_findings:
        key = (f.rule_id, f.journey)
        if key not in grouped:
            grouped[key] = []
            order.append(key)
        grouped[key].append(f)

    severity_rank = {"critical": 0, "serious": 1, "moderate": 2, "minor": 3}
    result = [(grouped[k][0], len(grouped[k])) for k in order]
    result.sort(key=lambda pair: severity_rank.get(pair[0].severity_hint.value, 4))
    return result[:MAX_FINDINGS_TO_NARRATE]


def _build_prompt(items: list[tuple[RawFinding, int]]) -> str:
    payload = []
    for i, (f, count) in enumerate(items):
        payload.append(
            {
                "index": i,
                "rule_id": f.rule_id,
                "wcag_ref": f.wcag_ref,
                "journey": f.journey,
                "selector": f.selector,
                "html_snippet": f.html_snippet,
                "description": f.description,
                "occurrences_on_page": count,
                "persona_hint": _PERSONA_HINTS.get(f.rule_id),
            }
        )
    return json.dumps(payload, indent=2)


def _fallback_finding(raw: RawFinding, count: int) -> Finding:
    persona = Persona(_PERSONA_HINTS.get(raw.rule_id, "screen_reader"))
    impact = raw.description
    if count > 1:
        impact += f" (found on {count} similar elements on the page)"
    return Finding(
        id=str(uuid.uuid4()),
        journey=raw.journey,
        persona=persona,
        severity=raw.severity_hint,
        title=raw.rule_id.replace("-", " ").title(),
        user_impact=impact,
        suggested_fix="Review this element against the linked WCAG criterion and apply the standard fix pattern.",
        code_before=raw.html_snippet or None,
        code_after=None,
        auto_fixable=False,
        wcag_ref=raw.wcag_ref,
        selector=raw.selector,
    )


async def narrate_findings(raw_findings: list[RawFinding]) -> list[Finding]:
    if not raw_findings:
        return []

    items = _dedupe(raw_findings)

    if not settings.anthropic_api_key:
        return [_fallback_finding(raw, count) for raw, count in items]

    prompt = _build_prompt(items)

    try:
        client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        response = await client.messages.create(
            model=settings.claude_model,
            max_tokens=4096,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": f"Raw findings:\n{prompt}"}],
        )
        text = response.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        narrations = json.loads(text)
    except Exception:
        return [_fallback_finding(raw, count) for raw, count in items]

    by_index = {n["index"]: n for n in narrations if isinstance(n, dict) and "index" in n}

    findings: list[Finding] = []
    for i, (raw, count) in enumerate(items):
        n = by_index.get(i)
        if not n:
            findings.append(_fallback_finding(raw, count))
            continue
        impact = n.get("user_impact", raw.description)
        if count > 1:
            impact += f" (found on {count} similar elements on this page)"
        try:
            persona = Persona(n.get("persona", "screen_reader"))
        except ValueError:
            persona = Persona.screen_reader
        findings.append(
            Finding(
                id=str(uuid.uuid4()),
                journey=raw.journey,
                persona=persona,
                severity=raw.severity_hint,
                title=n.get("title", raw.rule_id),
                user_impact=impact,
                suggested_fix=n.get("suggested_fix", ""),
                code_before=raw.html_snippet or None,
                code_after=n.get("code_after"),
                auto_fixable=bool(n.get("auto_fixable", False)),
                wcag_ref=raw.wcag_ref,
                selector=raw.selector,
            )
        )
    return findings
