"""Integration test: synthetic PDF → full artifact set."""

from __future__ import annotations

import json
from pathlib import Path

import fitz
import pytest

from bmw_wiring_parser.pipeline import parse_pdf


def _make_demo_pdf(path: Path) -> None:
    doc = fitz.open()

    page1 = doc.new_page(width=842, height=595)
    page1.insert_text((40, 40), "6100.0-01", fontsize=16)
    page1.insert_text((40, 70), "Stromversorgung / Power Distribution", fontsize=11)
    page1.insert_text((100, 200), "A10", fontsize=10)
    page1.insert_text((200, 220), "F54", fontsize=10)
    page1.insert_text((300, 250), "X10116", fontsize=10)
    page1.insert_text((500, 400), "siehe 6110.0", fontsize=9)
    page1.draw_line((120, 210), (190, 230))
    page1.draw_line((220, 230), (290, 255))

    page2 = doc.new_page(width=842, height=595)
    page2.insert_text((40, 40), "6110.0", fontsize=16)
    page2.insert_text((40, 70), "Motorsteuerung / Engine Control", fontsize=11)
    page2.insert_text((120, 180), "DME", fontsize=10)
    page2.insert_text((120, 200), "A6000", fontsize=10)
    page2.insert_text((400, 350), "siehe 6100.0-01", fontsize=9)
    page2.insert_text((400, 380), "B62", fontsize=10)

    doc.save(path)
    doc.close()


@pytest.fixture()
def demo_pdf(tmp_path: Path) -> Path:
    pdf = tmp_path / "demo-etm.pdf"
    _make_demo_pdf(pdf)
    return pdf


def test_parse_pdf_writes_artifacts(demo_pdf: Path, tmp_path: Path) -> None:
    out = tmp_path / "out"
    report = parse_pdf(demo_pdf, out, document_id="demo", title="Demo ETM")

    assert report.page_count == 2
    assert report.sheets_found == 2
    assert report.links_found >= 2
    assert report.components_found >= 4

    for name in ("manifest.json", "report.json", "search-index.json", "components.json"):
        assert (out / name).is_file()

    manifest = json.loads((out / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["documents"][0]["id"] == "demo"
    assert len(manifest["pages"]) == 2

    svg0 = out / "pages" / "demo-p0000.svg"
    assert svg0.is_file()
    assert "<svg" in svg0.read_text(encoding="utf-8").lower()

    page0 = json.loads((out / "page-data" / "demo-p0000.json").read_text(encoding="utf-8"))
    assert page0["sheet_code"] == "6100.0-01"
    assert any(o["kind"] == "link" for o in page0["overlays"])
    assert any(o["kind"] == "component" for o in page0["overlays"])

    components = json.loads((out / "components.json").read_text(encoding="utf-8"))
    codes = {c["code"] for c in components["components"]}
    assert "A10" in codes
    assert "X10116" in codes
