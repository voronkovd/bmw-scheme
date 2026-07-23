"""Pydantic models for parser output."""

from __future__ import annotations

from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class BBox(BaseModel):
    """Axis-aligned bounding box in PDF/SVG page coordinates (top-left origin)."""

    x: float
    y: float
    width: float
    height: float

    def as_tuple(self) -> tuple[float, float, float, float]:
        return (self.x, self.y, self.width, self.height)


class TextSpan(BaseModel):
    text: str
    bbox: BBox
    font_size: float = 0.0


class SheetCodeHit(BaseModel):
    code: str
    bbox: BBox
    confidence: float = 1.0


class LinkHit(BaseModel):
    """Cross-sheet reference found on a page."""

    target_sheet: str
    label: str
    bbox: BBox
    confidence: float = 1.0


class ComponentHit(BaseModel):
    code: str
    bbox: BBox
    label: str | None = None
    confidence: float = 1.0


class OverlayKind(StrEnum):
    SHEET_CODE = "sheet_code"
    LINK = "link"
    COMPONENT = "component"


class OverlayItem(BaseModel):
    id: str
    kind: OverlayKind
    label: str
    bbox: BBox
    meta: dict[str, Any] = Field(default_factory=dict)


class PageData(BaseModel):
    page_index: int
    sheet_code: str | None
    title: str | None = None
    width: float
    height: float
    sheet_codes: list[SheetCodeHit] = Field(default_factory=list)
    links: list[LinkHit] = Field(default_factory=list)
    components: list[ComponentHit] = Field(default_factory=list)
    overlays: list[OverlayItem] = Field(default_factory=list)
    svg_path: str
    text_spans: list[TextSpan] = Field(default_factory=list)


class DocumentInfo(BaseModel):
    id: str
    title: str
    source_pdf: str
    page_count: int
    created_at: str


class Manifest(BaseModel):
    version: str = "1.0"
    documents: list[DocumentInfo]
    pages: list[dict[str, Any]]


class ComponentIndexEntry(BaseModel):
    code: str
    pages: list[dict[str, Any]] = Field(default_factory=list)
    count: int = 0


class SearchIndexEntry(BaseModel):
    id: str
    type: str
    label: str
    sheet_code: str | None = None
    page_index: int
    document_id: str
    bbox: BBox | None = None


class SearchIndex(BaseModel):
    entries: list[SearchIndexEntry] = Field(default_factory=list)


class ComponentsIndex(BaseModel):
    components: list[ComponentIndexEntry] = Field(default_factory=list)


class ParseReport(BaseModel):
    document_id: str
    source_pdf: str
    page_count: int
    sheets_found: int
    links_found: int
    components_found: int
    pages_without_sheet_code: list[int] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    duration_ms: int = 0
