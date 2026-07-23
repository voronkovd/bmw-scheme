"""Sheet code detection."""

from __future__ import annotations

from bmw_wiring_parser.models import SheetCodeHit, TextSpan
from bmw_wiring_parser.patterns import SHEET_CODE_RE, TITLE_NOISE
from bmw_wiring_parser.text_quality import is_readable_text, sanitize_text


def find_sheet_codes(spans: list[TextSpan]) -> list[SheetCodeHit]:
    """Find sheet codes; prefer larger fonts near the top of the page."""
    hits: list[SheetCodeHit] = []
    seen: set[str] = set()

    ranked = sorted(spans, key=lambda s: (s.bbox.y, -s.font_size))
    for span in ranked:
        for match in SHEET_CODE_RE.finditer(span.text):
            code = match.group(0)
            if code in seen:
                continue
            seen.add(code)
            # Higher confidence for larger text in the upper third
            confidence = 0.7
            if span.font_size >= 10:
                confidence += 0.15
            if span.bbox.y < 120:
                confidence += 0.15
            hits.append(
                SheetCodeHit(
                    code=code,
                    bbox=span.bbox.model_copy(),
                    confidence=min(confidence, 1.0),
                )
            )
    return hits


def pick_primary_sheet_code(hits: list[SheetCodeHit]) -> str | None:
    if not hits:
        return None
    return max(hits, key=lambda h: (h.confidence, -h.bbox.y)).code


def guess_title(spans: list[TextSpan], sheet_code: str | None) -> str | None:
    """Pick a plausible page title from top text spans."""
    candidates: list[tuple[float, str]] = []
    for span in spans:
        if span.bbox.y > 180:
            continue
        text = sanitize_text(span.text)
        if len(text) < 3 or not is_readable_text(text, min_len=3):
            continue
        if TITLE_NOISE.match(text):
            continue
        if sheet_code and text == sheet_code:
            continue
        if SHEET_CODE_RE.fullmatch(text):
            continue
        # Prefer descriptive titles over tiny index crumbs.
        score = span.font_size + min(len(text), 40) * 0.05
        candidates.append((score, text))
    if not candidates:
        return None
    return max(candidates, key=lambda c: c[0])[1]
