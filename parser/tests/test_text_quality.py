"""Unit tests for PDF text quality filters."""

from __future__ import annotations

from bmw_wiring_parser.text_quality import is_readable_text, sanitize_text


def test_sanitize_strips_control_chars() -> None:
    assert sanitize_text("\x01\x02INDEX\x03") == "INDEX"
    assert "\ufffd" not in sanitize_text("A\ufffdB")


def test_readable_rejects_glyph_garbage() -> None:
    garbage = "\x02\x02\x01\x02\x02\x01\x02\x02\x01\x02\x02"
    assert not is_readable_text(garbage)
    assert is_readable_text("ELECTRICAL TROUBLESHOOTING")
    assert is_readable_text("0100.0")
    assert is_readable_text("F54")
