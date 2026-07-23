"""End-to-end parse pipeline: PDF → SVG + JSON artifacts."""

from __future__ import annotations

import json
import re
import shutil
import time
from datetime import UTC, datetime
from pathlib import Path

import fitz

from bmw_wiring_parser.extractors import extract_text_spans
from bmw_wiring_parser.extractors.components import find_components
from bmw_wiring_parser.extractors.links import find_links
from bmw_wiring_parser.extractors.sheet_code import (
    find_sheet_codes,
    guess_title,
    pick_primary_sheet_code,
)
from bmw_wiring_parser.indices import (
    build_overlays,
    build_search_index,
)
from bmw_wiring_parser.models import (
    ComponentsIndex,
    DocumentInfo,
    Manifest,
    PageData,
    ParseReport,
    SearchIndex,
)
from bmw_wiring_parser.pdf_export import export_page_svg


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return slug or "document"


def _write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    data: object
    if isinstance(payload, (Manifest, SearchIndex, ComponentsIndex, ParseReport, PageData)):
        data = payload.model_dump(mode="json")
    else:
        data = payload
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _parse_one(
    pdf_path: Path,
    output_dir: Path,
    *,
    document_id: str | None = None,
    title: str | None = None,
    include_text_spans: bool = False,
) -> tuple[DocumentInfo, list[PageData], ParseReport]:
    started = time.perf_counter()
    pdf_path = pdf_path.resolve()
    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    doc_id = document_id or _slugify(pdf_path.stem)
    doc_title = title or pdf_path.stem.replace("_", " ")
    pages_dir = output_dir / "pages"
    page_data_dir = output_dir / "page-data"
    pages_dir.mkdir(parents=True, exist_ok=True)
    page_data_dir.mkdir(parents=True, exist_ok=True)

    document = fitz.open(pdf_path)
    pages: list[PageData] = []
    warnings: list[str] = []
    pages_without_sheet: list[int] = []

    try:
        for page_index in range(document.page_count):
            page = document.load_page(page_index)
            svg_name = f"{doc_id}-p{page_index:04d}.svg"
            svg_rel = f"pages/{svg_name}"
            width, height = export_page_svg(page, pages_dir / svg_name)

            spans = extract_text_spans(page)
            sheet_hits = find_sheet_codes(spans)
            primary = pick_primary_sheet_code(sheet_hits)
            if primary is None:
                pages_without_sheet.append(page_index)
                warnings.append(f"{doc_id} page {page_index}: no sheet code detected")

            links = find_links(spans, primary)
            components = find_components(spans)
            overlays = build_overlays(page_index, sheet_hits, links, components)
            page_title = guess_title(spans, primary)

            page_data = PageData(
                page_index=page_index,
                sheet_code=primary,
                title=page_title,
                width=width,
                height=height,
                sheet_codes=sheet_hits,
                links=links,
                components=components,
                overlays=overlays,
                svg_path=svg_rel,
                text_spans=spans if include_text_spans else [],
            )
            pages.append(page_data)
            _write_json(page_data_dir / f"{doc_id}-p{page_index:04d}.json", page_data)
    finally:
        document.close()

    duration_ms = int((time.perf_counter() - started) * 1000)
    info = DocumentInfo(
        id=doc_id,
        title=doc_title,
        source_pdf=str(pdf_path.name),
        page_count=len(pages),
        created_at=datetime.now(UTC).isoformat(),
    )
    report = ParseReport(
        document_id=doc_id,
        source_pdf=str(pdf_path),
        page_count=len(pages),
        sheets_found=sum(1 for p in pages if p.sheet_code),
        links_found=sum(len(p.links) for p in pages),
        components_found=sum(len(p.components) for p in pages),
        pages_without_sheet_code=pages_without_sheet,
        warnings=warnings,
        duration_ms=duration_ms,
    )
    return info, pages, report


def _write_corpus(
    output_dir: Path,
    documents: list[DocumentInfo],
    pages_by_doc: list[tuple[str, list[PageData]]],
    reports: list[ParseReport],
) -> None:
    manifest_pages: list[dict[str, object]] = []
    all_search = SearchIndex(entries=[])
    components_pages: list[tuple[str, list[PageData]]] = pages_by_doc

    for doc_id, pages in pages_by_doc:
        for p in pages:
            manifest_pages.append(
                {
                    "document_id": doc_id,
                    "page_index": p.page_index,
                    "sheet_code": p.sheet_code,
                    "title": p.title,
                    "svg_path": p.svg_path,
                    "page_data_path": f"page-data/{doc_id}-p{p.page_index:04d}.json",
                    "width": p.width,
                    "height": p.height,
                    "link_count": len(p.links),
                    "component_count": len(p.components),
                }
            )
        search = build_search_index(doc_id, pages)
        all_search.entries.extend(search.entries)

    # Merge component indexes across documents
    from collections import defaultdict

    by_code: dict[str, list[dict[str, object]]] = defaultdict(list)
    for doc_id, pages in components_pages:
        for page in pages:
            for comp in page.components:
                by_code[comp.code].append(
                    {
                        "document_id": doc_id,
                        "page_index": page.page_index,
                        "sheet_code": page.sheet_code,
                        "bbox": comp.bbox.model_dump(),
                        "confidence": comp.confidence,
                    }
                )

    from bmw_wiring_parser.models import ComponentIndexEntry

    components_index = ComponentsIndex(
        components=[
            ComponentIndexEntry(code=code, pages=locs, count=len(locs))
            for code, locs in sorted(by_code.items())
        ]
    )

    manifest = Manifest(documents=documents, pages=manifest_pages)
    batch_report = {
        "documents": [r.model_dump(mode="json") for r in reports],
        "totals": {
            "documents": len(reports),
            "page_count": sum(r.page_count for r in reports),
            "sheets_found": sum(r.sheets_found for r in reports),
            "links_found": sum(r.links_found for r in reports),
            "components_found": sum(r.components_found for r in reports),
            "duration_ms": sum(r.duration_ms for r in reports),
            "warnings": sum(len(r.warnings) for r in reports),
        },
    }

    _write_json(output_dir / "manifest.json", manifest)
    _write_json(output_dir / "search-index.json", all_search)
    _write_json(output_dir / "components.json", components_index)
    _write_json(output_dir / "report.json", batch_report)


def parse_pdf(
    pdf_path: Path,
    output_dir: Path,
    *,
    document_id: str | None = None,
    title: str | None = None,
    include_text_spans: bool = False,
) -> ParseReport:
    """Parse a single BMW ETM PDF into static viewer artifacts."""
    info, pages, report = _parse_one(
        pdf_path,
        output_dir,
        document_id=document_id,
        title=title,
        include_text_spans=include_text_spans,
    )
    _write_corpus(output_dir, [info], [(info.id, pages)], [report])
    return report


def parse_pdfs(
    pdf_paths: list[Path],
    output_dir: Path,
    *,
    clean: bool = True,
    include_text_spans: bool = False,
) -> list[ParseReport]:
    """Parse multiple PDFs into one combined viewer corpus."""
    output_dir = output_dir.resolve()
    if clean and output_dir.exists():
        for name in ("pages", "page-data"):
            target = output_dir / name
            if target.exists():
                shutil.rmtree(target)
        for name in ("manifest.json", "search-index.json", "components.json", "report.json"):
            path = output_dir / name
            if path.exists():
                path.unlink()

    output_dir.mkdir(parents=True, exist_ok=True)
    documents: list[DocumentInfo] = []
    pages_by_doc: list[tuple[str, list[PageData]]] = []
    reports: list[ParseReport] = []
    used_ids: set[str] = set()

    for pdf_path in pdf_paths:
        base_id = _slugify(pdf_path.stem)
        doc_id = base_id
        suffix = 2
        while doc_id in used_ids:
            doc_id = f"{base_id}-{suffix}"
            suffix += 1
        used_ids.add(doc_id)

        info, pages, report = _parse_one(
            pdf_path,
            output_dir,
            document_id=doc_id,
            title=pdf_path.stem.replace("_", " "),
            include_text_spans=include_text_spans,
        )
        documents.append(info)
        pages_by_doc.append((info.id, pages))
        reports.append(report)

    _write_corpus(output_dir, documents, pages_by_doc, reports)
    return reports
