"""Build overlay list and aggregate indexes."""

from __future__ import annotations

from collections import defaultdict

from bmw_wiring_parser.models import (
    ComponentHit,
    ComponentIndexEntry,
    ComponentsIndex,
    LinkHit,
    OverlayItem,
    OverlayKind,
    PageData,
    SearchIndex,
    SearchIndexEntry,
    SheetCodeHit,
)


def build_overlays(
    page_index: int,
    sheet_codes: list[SheetCodeHit],
    links: list[LinkHit],
    components: list[ComponentHit],
) -> list[OverlayItem]:
    overlays: list[OverlayItem] = []

    for i, sheet in enumerate(sheet_codes):
        overlays.append(
            OverlayItem(
                id=f"p{page_index}-sheet-{i}",
                kind=OverlayKind.SHEET_CODE,
                label=sheet.code,
                bbox=sheet.bbox,
                meta={"code": sheet.code, "confidence": sheet.confidence},
            )
        )

    for i, link in enumerate(links):
        overlays.append(
            OverlayItem(
                id=f"p{page_index}-link-{i}",
                kind=OverlayKind.LINK,
                label=link.label,
                bbox=link.bbox,
                meta={
                    "target_sheet": link.target_sheet,
                    "confidence": link.confidence,
                },
            )
        )

    for i, component in enumerate(components):
        overlays.append(
            OverlayItem(
                id=f"p{page_index}-comp-{i}",
                kind=OverlayKind.COMPONENT,
                label=component.code,
                bbox=component.bbox,
                meta={"code": component.code, "confidence": component.confidence},
            )
        )

    return overlays


def build_search_index(document_id: str, pages: list[PageData]) -> SearchIndex:
    entries: list[SearchIndexEntry] = []
    for page in pages:
        if page.sheet_code:
            entries.append(
                SearchIndexEntry(
                    id=f"{document_id}-sheet-{page.page_index}",
                    type="sheet",
                    label=page.sheet_code,
                    sheet_code=page.sheet_code,
                    page_index=page.page_index,
                    document_id=document_id,
                )
            )
        if page.title:
            entries.append(
                SearchIndexEntry(
                    id=f"{document_id}-title-{page.page_index}",
                    type="title",
                    label=page.title,
                    sheet_code=page.sheet_code,
                    page_index=page.page_index,
                    document_id=document_id,
                )
            )
        for ov in page.overlays:
            if ov.kind == OverlayKind.COMPONENT:
                entries.append(
                    SearchIndexEntry(
                        id=f"{document_id}-{ov.id}",
                        type="component",
                        label=ov.label,
                        sheet_code=page.sheet_code,
                        page_index=page.page_index,
                        document_id=document_id,
                        bbox=ov.bbox,
                    )
                )
            elif ov.kind == OverlayKind.LINK:
                entries.append(
                    SearchIndexEntry(
                        id=f"{document_id}-{ov.id}",
                        type="link",
                        label=ov.meta.get("target_sheet", ov.label),
                        sheet_code=page.sheet_code,
                        page_index=page.page_index,
                        document_id=document_id,
                        bbox=ov.bbox,
                    )
                )
    return SearchIndex(entries=entries)


def build_components_index(pages: list[PageData]) -> ComponentsIndex:
    by_code: dict[str, list[dict[str, object]]] = defaultdict(list)
    for page in pages:
        for comp in page.components:
            by_code[comp.code].append(
                {
                    "page_index": page.page_index,
                    "sheet_code": page.sheet_code,
                    "bbox": comp.bbox.model_dump(),
                    "confidence": comp.confidence,
                }
            )

    components = [
        ComponentIndexEntry(code=code, pages=locs, count=len(locs))
        for code, locs in sorted(by_code.items())
    ]
    return ComponentsIndex(components=components)
