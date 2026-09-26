import base64
from pathlib import Path

from playwright.async_api import async_playwright

from app.models import RawFinding, Severity
from app.scanner.wcag_tags import extract_wcag_ref

# Vendored locally (not fetched via <script src>) because many real sites set a
# Content-Security-Policy that blocks loading scripts from third-party CDNs.
# page.evaluate() runs via the DevTools protocol, which isn't subject to the
# page's script-src CSP the way an injected <script> tag would be.
AXE_SOURCE = (Path(__file__).parent / "vendor" / "axe.min.js").read_text(encoding="utf-8")

INTERACTIVE_ELEMENTS_JS = """
() => {
  const selectors = 'a[href], button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';
  return Array.from(document.querySelectorAll(selectors)).map((el, i) => {
    const rect = el.getBoundingClientRect();
    const label = (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 60);
    return {
      tag: el.tagName.toLowerCase(),
      label,
      x: rect.x, y: rect.y, width: rect.width, height: rect.height,
      inForm: !!el.closest('form'),
      selector: el.id ? ('#' + el.id) : (el.tagName.toLowerCase() + ':nth-of-type(' + (i + 1) + ')'),
    };
  }).filter(e => e.width > 0 && e.height > 0);
}
"""

FOCUSED_ELEMENT_JS = """
() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const style = getComputedStyle(el);
  const label = (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 60);
  return {
    tag: el.tagName.toLowerCase(),
    label,
    outlineStyle: style.outlineStyle,
    boxShadow: style.boxShadow,
    inForm: !!el.closest('form'),
    selector: el.id ? ('#' + el.id) : el.tagName.toLowerCase(),
  };
}
"""

FORM_MEMBERSHIP_JS = """
(selectors) => selectors.map((sel) => {
  try {
    const el = document.querySelector(sel);
    return el ? !!el.closest('form') : false;
  } catch (e) {
    return false;
  }
})
"""

AXE_IMPACT_TO_SEVERITY = {
    "critical": Severity.critical,
    "serious": Severity.serious,
    "moderate": Severity.moderate,
    "minor": Severity.minor,
}


def _journey_for(in_form: bool) -> str:
    return "Form Interaction Journey" if in_form else "Page Load Journey"


async def run_axe_on_page(page, journey_name: str | None = None) -> list[RawFinding]:
    """Run axe-core against the page's current state and return raw findings.

    Shared by the deterministic single-page scanner and the AI-driven journey
    engine, which calls this after every action to check accessibility at
    each step instead of only once at the end.
    """
    findings: list[RawFinding] = []
    await page.evaluate(AXE_SOURCE)
    axe_results = await page.evaluate("async () => await axe.run()")

    selectors = []
    violations = axe_results.get("violations", [])
    for v in violations:
        for node in v.get("nodes", []):
            target = node.get("target", ["body"])
            selectors.append(target[0] if target else "body")

    in_form_flags = await page.evaluate(FORM_MEMBERSHIP_JS, selectors) if selectors else []

    idx = 0
    for v in violations:
        wcag_ref = extract_wcag_ref(v.get("tags", []))
        severity = AXE_IMPACT_TO_SEVERITY.get(v.get("impact") or "moderate", Severity.moderate)
        for node in v.get("nodes", []):
            target = node.get("target", ["body"])
            selector = target[0] if target else "body"
            in_form = in_form_flags[idx] if idx < len(in_form_flags) else False
            idx += 1
            findings.append(
                RawFinding(
                    source="axe",
                    rule_id=v.get("id", "unknown"),
                    wcag_ref=wcag_ref,
                    selector=selector,
                    html_snippet=node.get("html", "")[:400],
                    description=f"{v.get('help', '')}. {node.get('failureSummary', '')}".strip(),
                    journey=journey_name or _journey_for(in_form),
                    severity_hint=severity,
                )
            )
    return findings


class ScanResult:
    def __init__(self):
        self.raw_findings: list[RawFinding] = []
        self.accessibility_tree: list[str] = []
        self.screenshot_base64: str | None = None
        self.has_form: bool = False


def _flatten_ax_tree(node: dict | None, out: list[str], depth: int = 0, limit: int = 60) -> None:
    if node is None or len(out) >= limit:
        return
    role = node.get("role", "")
    name = node.get("name", "")
    if role and role not in ("none", "generic", "text") and name:
        out.append(f"{role}: {name}")
    elif role in ("button", "link", "img", "checkbox", "textbox") and not name:
        out.append(f"{role}: (no accessible name)")
    for child in node.get("children", []) or []:
        _flatten_ax_tree(child, out, depth + 1, limit)


async def run_scan(url: str) -> ScanResult:
    result = ScanResult()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1366, "height": 900})
        await page.goto(url, wait_until="networkidle", timeout=45000)
        result.has_form = await page.evaluate("() => document.querySelectorAll('form').length > 0")

        # 1. axe-core: the rule-based ~30-40% (alt text, contrast, labels, ARIA, roles)
        result.raw_findings.extend(await run_axe_on_page(page))

        # 2. Motor-impaired heuristics: touch target size and crowding
        elements = await page.evaluate(INTERACTIVE_ELEMENTS_JS)
        for el in elements:
            if el["width"] < 24 or el["height"] < 24:
                result.raw_findings.append(
                    RawFinding(
                        source="target-size",
                        rule_id="target-size-small",
                        wcag_ref="2.5.8",
                        selector=el["selector"],
                        html_snippet=f'<{el["tag"]}> "{el["label"]}"',
                        description=(
                            f'Interactive {el["tag"]} "{el["label"]}" is {round(el["width"])}x'
                            f'{round(el["height"])}px, below the 24x24px minimum target size.'
                        ),
                        journey=_journey_for(el["inForm"]),
                        severity_hint=Severity.moderate,
                    )
                )

        capped = elements[:150]
        for i, a in enumerate(capped):
            for b in capped[i + 1 :]:
                same_row = abs(a["y"] - b["y"]) < max(a["height"], b["height"])
                gap_x = b["x"] - (a["x"] + a["width"])
                if same_row and 0 <= gap_x < 8:
                    result.raw_findings.append(
                        RawFinding(
                            source="target-spacing",
                            rule_id="target-spacing-tight",
                            wcag_ref="2.5.8",
                            selector=a["selector"],
                            html_snippet=f'<{a["tag"]}> "{a["label"]}" next to <{b["tag"]}> "{b["label"]}"',
                            description=(
                                f'"{a["label"]}" and "{b["label"]}" are only {round(gap_x)}px apart, '
                                "risking accidental taps for users with limited fine motor control."
                            ),
                            journey=_journey_for(a["inForm"] or b["inForm"]),
                            severity_hint=Severity.moderate,
                        )
                    )
                    break

        # 3. Keyboard focus-indicator trace
        seen_missing = set()
        for _ in range(20):
            await page.keyboard.press("Tab")
            focused = await page.evaluate(FOCUSED_ELEMENT_JS)
            if not focused:
                continue
            no_outline = focused["outlineStyle"] == "none"
            no_shadow = focused["boxShadow"] in ("none", "")
            key = focused["selector"]
            if no_outline and no_shadow and key not in seen_missing:
                seen_missing.add(key)
                result.raw_findings.append(
                    RawFinding(
                        source="focus-indicator",
                        rule_id="missing-focus-indicator",
                        wcag_ref="2.4.7",
                        selector=focused["selector"],
                        html_snippet=f'<{focused["tag"]}> "{focused["label"]}"',
                        description=(
                            f'"{focused["label"]}" ({focused["tag"]}) has no visible focus outline when '
                            "tabbed to, so keyboard-only users lose track of where they are on the page."
                        ),
                        journey=_journey_for(focused["inForm"]),
                        severity_hint=Severity.serious,
                    )
                )

        # 4. Accessibility tree snapshot -> feeds the screen-reader audio demo on the frontend
        snapshot = await page.accessibility.snapshot(interesting_only=True)
        _flatten_ax_tree(snapshot, result.accessibility_tree)

        # 5. Screenshot -> feeds the color-blindness simulation filter on the frontend
        screenshot_bytes = await page.screenshot(full_page=True, type="png")
        result.screenshot_base64 = base64.b64encode(screenshot_bytes).decode("ascii")

        await browser.close()

    return result
