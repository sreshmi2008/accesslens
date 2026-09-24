"""Maps WCAG 2.1 success criteria to the Indian legal/standards references that
key off them. IS 17802 is numbered identically to WCAG 2.1, so its reference
mirrors the WCAG SC. GIGW 3.0 and the RPwD Act don't enumerate per-criterion
clauses the way WCAG does, so they get one anchor reference each rather than
a fabricated per-criterion citation.
"""

from app.models import ComplianceTag

RPWD_TAG = ComplianceTag(
    law="RPwD Act, 2016",
    reference="Section 46 - barrier-free access to ICT and information",
)

GIGW_TAG = ComplianceTag(
    law="GIGW 3.0",
    reference="Accessibility requirement - WCAG 2.1 AA baseline",
)

SEBI_TAG = ComplianceTag(
    law="SEBI Circular (2023/2025, accessibility of investor-facing platforms)",
    reference="Applies to transaction/investment flows",
)

_WCAG_TO_IS17802 = {
    "1.1.1": "IS 17802:2020 - 1.1.1 Non-text Content",
    "1.3.1": "IS 17802:2020 - 1.3.1 Info and Relationships",
    "1.4.3": "IS 17802:2020 - 1.4.3 Contrast (Minimum)",
    "1.4.11": "IS 17802:2020 - 1.4.11 Non-text Contrast",
    "2.1.1": "IS 17802:2020 - 2.1.1 Keyboard",
    "2.4.3": "IS 17802:2020 - 2.4.3 Focus Order",
    "2.4.6": "IS 17802:2020 - 2.4.6 Headings and Labels",
    "2.4.7": "IS 17802:2020 - 2.4.7 Focus Visible",
    "2.5.8": "IS 17802:2020 - 2.5.8 Target Size (Minimum)",
    "3.3.2": "IS 17802:2020 - 3.3.2 Labels or Instructions",
    "4.1.2": "IS 17802:2020 - 4.1.2 Name, Role, Value",
}


def map_wcag(wcag_ref: str | None, journey_name: str) -> list[ComplianceTag]:
    tags = [RPWD_TAG, GIGW_TAG]

    if wcag_ref and wcag_ref in _WCAG_TO_IS17802:
        tags.append(ComplianceTag(law="IS 17802", reference=_WCAG_TO_IS17802[wcag_ref]))
    elif wcag_ref:
        tags.append(ComplianceTag(law="IS 17802", reference=f"IS 17802:2020 - {wcag_ref} (WCAG 2.1 aligned)"))

    if "form" in journey_name.lower() or "transaction" in journey_name.lower():
        tags.append(SEBI_TAG)

    return tags
