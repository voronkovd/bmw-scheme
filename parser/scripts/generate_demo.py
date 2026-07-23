#!/usr/bin/env python3
"""Generate a demo BMW-like ETM PDF and parse it into viewer/public/data."""

from __future__ import annotations

import sys
from pathlib import Path

import fitz

ROOT = Path(__file__).resolve().parents[2]
PARSER_SRC = ROOT / "parser" / "src"
sys.path.insert(0, str(PARSER_SRC))

from bmw_wiring_parser.pipeline import parse_pdf  # noqa: E402


def build_pdf(path: Path) -> None:
    doc = fitz.open()

    pages = [
        {
            "code": "6100.0-01",
            "title": "Stromversorgung / Power Distribution",
            "components": [("A10", 100, 200), ("F54", 220, 240), ("X10116", 340, 280), ("K6300", 460, 200)],
            "link": ("siehe 6110.0", 520, 420),
        },
        {
            "code": "6110.0",
            "title": "Motorsteuerung / Engine Control",
            "components": [("A6000", 140, 190), ("B62", 280, 260), ("X60001", 420, 300)],
            "link": ("siehe 6120.0-01", 500, 400),
        },
        {
            "code": "6120.0-01",
            "title": "Zuendung / Ignition",
            "components": [("N51", 160, 210), ("T1", 300, 250), ("X13256", 440, 290)],
            "link": ("siehe 6100.0-01", 480, 430),
        },
    ]

    for spec in pages:
        page = doc.new_page(width=842, height=595)
        page.insert_text((36, 36), spec["code"], fontsize=18)
        page.insert_text((36, 64), spec["title"], fontsize=11)
        page.insert_text((36, 560), "BMW ETM — demo schematic (synthetic)", fontsize=8)
        for code, x, y in spec["components"]:
            page.insert_text((x, y), code, fontsize=10)
            page.draw_rect(fitz.Rect(x - 8, y - 14, x + 50, y + 6), color=(0.2, 0.2, 0.2), width=0.5)
        label, lx, ly = spec["link"]
        page.insert_text((lx, ly), label, fontsize=9)
        # decorative wire lines
        page.draw_line((80, 180), (500, 180), color=(0.1, 0.1, 0.4), width=1)
        page.draw_line((80, 180), (80, 360), color=(0.1, 0.1, 0.4), width=1)

    path.parent.mkdir(parents=True, exist_ok=True)
    doc.save(path)
    doc.close()


def main() -> None:
    fixtures = ROOT / "parser" / "fixtures"
    pdf = fixtures / "demo-etm.pdf"
    out = ROOT / "viewer" / "public" / "data"
    build_pdf(pdf)
    report = parse_pdf(pdf, out, document_id="demo-etm", title="BMW ETM Demo")
    print(f"Wrote demo PDF → {pdf}")
    print(f"Parsed into   → {out}")
    print(
        f"pages={report.page_count} sheets={report.sheets_found} "
        f"links={report.links_found} components={report.components_found}"
    )


if __name__ == "__main__":
    main()
