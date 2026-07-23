"""Cross-sheet link detection."""

from __future__ import annotations

from bmw_wiring_parser.models import LinkHit, TextSpan
from bmw_wiring_parser.patterns import LINK_HINT_RE, SHEET_CODE_RE


def find_links(spans: list[TextSpan], current_sheet: str | None) -> list[LinkHit]:
    """Detect references to other sheet codes on the page."""
    hits: list[LinkHit] = []
    seen: set[tuple[str, float, float]] = set()

    for span in spans:
        text = span.text
        for match in LINK_HINT_RE.finditer(text):
            target = match.group(1)
            if current_sheet and target == current_sheet:
                continue
            key = (target, round(span.bbox.x, 1), round(span.bbox.y, 1))
            if key in seen:
                continue
            seen.add(key)
            confidence = 0.85 if match.group(0).lower().startswith(("siehe", "see")) else 0.7
            hits.append(
                LinkHit(
                    target_sheet=target,
                    label=match.group(0).strip(),
                    bbox=span.bbox.model_copy(),
                    confidence=confidence,
                )
            )

        # Also treat standalone sheet codes (not the primary) as navigable links
        for match in SHEET_CODE_RE.finditer(text):
            target = match.group(0)
            if current_sheet and target == current_sheet:
                continue
            key = (target, round(span.bbox.x, 1), round(span.bbox.y, 1))
            if key in seen:
                continue
            seen.add(key)
            hits.append(
                LinkHit(
                    target_sheet=target,
                    label=target,
                    bbox=span.bbox.model_copy(),
                    confidence=0.55,
                )
            )

    return hits
