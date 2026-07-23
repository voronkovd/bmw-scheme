"""Component code detection."""

from __future__ import annotations

from bmw_wiring_parser.models import ComponentHit, TextSpan
from bmw_wiring_parser.patterns import COMPONENT_RE, SHEET_CODE_RE

# Words that look like component codes but are noise
NOISE_CODES = {
    "A4",  # paper size
    "A3",
    "A2",
    "A1",
    "A0",
    "B5",
    "B4",
}


def find_components(spans: list[TextSpan]) -> list[ComponentHit]:
    hits: list[ComponentHit] = []
    seen: set[tuple[str, float, float]] = set()

    for span in spans:
        if SHEET_CODE_RE.search(span.text):
            continue
        for match in COMPONENT_RE.finditer(span.text):
            code = match.group("code")
            if code in NOISE_CODES and span.font_size < 8:
                continue
            key = (code, round(span.bbox.x, 1), round(span.bbox.y, 1))
            if key in seen:
                continue
            seen.add(key)
            confidence = 0.9 if len(code) >= 3 else 0.65
            hits.append(
                ComponentHit(
                    code=code,
                    bbox=span.bbox.model_copy(),
                    label=code,
                    confidence=confidence,
                )
            )
    return hits
