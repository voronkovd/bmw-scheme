"""Typer CLI for BMW wiring PDF parsing."""

from __future__ import annotations

from pathlib import Path
from typing import Annotated

import typer

from bmw_wiring_parser.pipeline import parse_pdf, parse_pdfs

app = typer.Typer(
    name="bmw-parse",
    help="Parse BMW ETM PDFs into SVG + JSON for the Wiring Navigator.",
    add_completion=False,
    no_args_is_help=True,
)


@app.command("parse")
def parse_cmd(
    pdf: Annotated[Path, typer.Argument(exists=True, dir_okay=False, readable=True)],
    output: Annotated[
        Path,
        typer.Option("--output", "-o", help="Directory for SVG/JSON artifacts"),
    ] = Path("out"),
    document_id: Annotated[
        str | None,
        typer.Option("--document-id", help="Stable document id used in filenames"),
    ] = None,
    title: Annotated[
        str | None,
        typer.Option("--title", help="Human-readable document title"),
    ] = None,
    include_text: Annotated[
        bool,
        typer.Option("--include-text", help="Embed raw text spans into page-data JSON"),
    ] = False,
) -> None:
    """Parse a PDF and write static viewer data."""
    report = parse_pdf(
        pdf,
        output,
        document_id=document_id,
        title=title,
        include_text_spans=include_text,
    )
    typer.echo(f"Document:   {report.document_id}")
    typer.echo(f"Pages:      {report.page_count}")
    typer.echo(f"Sheets:     {report.sheets_found}")
    typer.echo(f"Links:      {report.links_found}")
    typer.echo(f"Components: {report.components_found}")
    typer.echo(f"Duration:   {report.duration_ms} ms")
    typer.echo(f"Output:     {output.resolve()}")
    if report.warnings:
        typer.echo(f"Warnings:   {len(report.warnings)}")
        for warning in report.warnings[:10]:
            typer.echo(f"  - {warning}")


@app.command("parse-dir")
def parse_dir_cmd(
    directory: Annotated[
        Path,
        typer.Argument(exists=True, file_okay=False, readable=True),
    ],
    output: Annotated[
        Path,
        typer.Option("--output", "-o", help="Directory for SVG/JSON artifacts"),
    ] = Path("out"),
    include_text: Annotated[
        bool,
        typer.Option("--include-text", help="Embed raw text spans into page-data JSON"),
    ] = False,
) -> None:
    """Parse all PDFs in a directory into one combined corpus."""
    pdfs = sorted(directory.glob("*.pdf"))
    if not pdfs:
        typer.echo(f"No PDF files in {directory}")
        raise typer.Exit(code=1)

    typer.echo(f"Parsing {len(pdfs)} PDF(s) → {output.resolve()}")
    reports = parse_pdfs(pdfs, output, clean=True, include_text_spans=include_text)
    for report in reports:
        typer.echo(
            f"  ✓ {report.document_id}: pages={report.page_count} "
            f"sheets={report.sheets_found} links={report.links_found} "
            f"components={report.components_found} ({report.duration_ms} ms)"
        )
    typer.echo(
        f"Total: docs={len(reports)} pages={sum(r.page_count for r in reports)} "
        f"duration={sum(r.duration_ms for r in reports)} ms"
    )


@app.callback()
def main() -> None:
    """BMW Wiring Navigator parser."""


if __name__ == "__main__":
    app()
