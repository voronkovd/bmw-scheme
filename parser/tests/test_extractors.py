"""Unit tests for extractors (no PDF required)."""

from __future__ import annotations

from bmw_wiring_parser.extractors.components import find_components
from bmw_wiring_parser.extractors.links import find_links
from bmw_wiring_parser.extractors.sheet_code import (
    find_sheet_codes,
    pick_primary_sheet_code,
)
from bmw_wiring_parser.indices import build_overlays, build_search_index
from bmw_wiring_parser.models import BBox, ComponentHit, LinkHit, PageData, SheetCodeHit, TextSpan
from bmw_wiring_parser.patterns import COMPONENT_RE, SHEET_CODE_RE


def _span(text: str, *, x: float = 10, y: float = 20, size: float = 12) -> TextSpan:
    return TextSpan(
        text=text,
        bbox=BBox(x=x, y=y, width=max(40.0, len(text) * 6), height=14),
        font_size=size,
    )


def test_sheet_code_pattern() -> None:
    assert SHEET_CODE_RE.search("6100.0-01")
    assert SHEET_CODE_RE.search("1240.1")
    assert SHEET_CODE_RE.search("SP0001")
    assert not SHEET_CODE_RE.search("610")


def test_component_pattern() -> None:
    assert COMPONENT_RE.search("A10")
    assert COMPONENT_RE.search("X10116")
    assert COMPONENT_RE.search("F54")
    assert COMPONENT_RE.search("B12a")


def test_find_sheet_codes_prefers_top_large() -> None:
    spans = [
        _span("Noise", y=200, size=8),
        _span("6100.0-01", y=30, size=14),
        _span("6110.0", y=400, size=8),
    ]
    hits = find_sheet_codes(spans)
    assert pick_primary_sheet_code(hits) == "6100.0-01"


def test_find_links_skips_current_sheet() -> None:
    spans = [
        _span("siehe 6110.0", y=100),
        _span("6100.0-01", y=20, size=14),
    ]
    links = find_links(spans, current_sheet="6100.0-01")
    targets = {link.target_sheet for link in links}
    assert "6110.0" in targets
    assert "6100.0-01" not in targets


def test_find_components() -> None:
    spans = [_span("A10"), _span("X10116"), _span("F54")]
    comps = find_components(spans)
    codes = {c.code for c in comps}
    assert codes == {"A10", "X10116", "F54"}


def test_build_overlays_and_search_index() -> None:
    sheet = SheetCodeHit(code="6100.0-01", bbox=BBox(x=1, y=1, width=10, height=10))
    link = LinkHit(
        target_sheet="6110.0",
        label="siehe 6110.0",
        bbox=BBox(x=2, y=2, width=10, height=10),
    )
    comp = ComponentHit(code="A10", bbox=BBox(x=3, y=3, width=10, height=10))
    overlays = build_overlays(0, [sheet], [link], [comp])
    assert len(overlays) == 3

    page = PageData(
        page_index=0,
        sheet_code="6100.0-01",
        title="Power Distribution",
        width=800,
        height=600,
        sheet_codes=[sheet],
        links=[link],
        components=[comp],
        overlays=overlays,
        svg_path="pages/demo-p0000.svg",
    )
    index = build_search_index("demo", [page])
    types = {e.type for e in index.entries}
    assert "sheet" in types
    assert "component" in types
    assert "link" in types
