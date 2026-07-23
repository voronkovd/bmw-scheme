"""PDF page → SVG export."""

from __future__ import annotations

from pathlib import Path

import fitz


def export_page_svg(page: fitz.Page, dest: Path) -> tuple[float, float]:
    """Render a page to SVG and write it to dest. Returns (width, height)."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    rect = page.rect
    svg = page.get_svg_image(matrix=fitz.Identity)
    dest.write_text(svg, encoding="utf-8")
    return float(rect.width), float(rect.height)
