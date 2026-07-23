"""Low-level text extraction from PDF pages."""

from __future__ import annotations

import fitz

from bmw_wiring_parser.models import BBox, TextSpan
from bmw_wiring_parser.text_quality import is_readable_text, sanitize_text


def extract_text_spans(page: fitz.Page) -> list[TextSpan]:
    """Extract positioned text spans from a PyMuPDF page.

    Spans from custom-encoded fonts without ToUnicode often come out as
    control characters; those are dropped so titles/overlays stay clean.
    """
    spans: list[TextSpan] = []
    raw = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)
    for block in raw.get("blocks", []):
        if block.get("type") != 0:
            continue
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                raw_text = span.get("text") or ""
                text = sanitize_text(raw_text)
                if not text or not is_readable_text(text, min_len=1):
                    continue
                x0, y0, x1, y1 = span["bbox"]
                spans.append(
                    TextSpan(
                        text=text,
                        bbox=BBox(x=x0, y=y0, width=x1 - x0, height=y1 - y0),
                        font_size=float(span.get("size") or 0.0),
                    )
                )
    return spans


def page_plain_text(spans: list[TextSpan]) -> str:
    return "\n".join(s.text for s in spans)
