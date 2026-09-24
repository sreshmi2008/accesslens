"""axe-core reports WCAG success criteria as tags like 'wcag143'. There is no
reliable algorithmic way to re-split that back into '1.4.3' (some criteria
have two-digit third parts, e.g. 1.4.11), so this is an explicit lookup
covering the rules our scanner actually surfaces."""

AXE_TAG_TO_WCAG: dict[str, str] = {
    "wcag111": "1.1.1",
    "wcag131": "1.3.1",
    "wcag143": "1.4.3",
    "wcag1411": "1.4.11",
    "wcag211": "2.1.1",
    "wcag243": "2.4.3",
    "wcag246": "2.4.6",
    "wcag247": "2.4.7",
    "wcag258": "2.5.8",
    "wcag332": "3.3.2",
    "wcag412": "4.1.2",
}


def extract_wcag_ref(tags: list[str]) -> str | None:
    for tag in tags:
        if tag in AXE_TAG_TO_WCAG:
            return AXE_TAG_TO_WCAG[tag]
    return None
