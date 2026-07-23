"""Helpers for filtering broken custom-encoded PDF text."""

from __future__ import annotations

import re
import unicodedata

_CTRL_OR_PRIVATE = re.compile(
    r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f\ufdd0-\ufdef\ufffe\uffff\ufffd]"
)
_READABLE_CHARS = re.compile(r"[A-Za-z0-9ÄÖÜäöüß\-./()&+,:'\"]")


def sanitize_text(text: str) -> str:
    """Drop control / replacement characters and collapse whitespace."""
    cleaned = _CTRL_OR_PRIVATE.sub("", text)
    cleaned = "".join(
        ch for ch in cleaned if unicodedata.category(ch)[0] != "C" or ch in "\t\n "
    )
    return re.sub(r"\s+", " ", cleaned).strip()


def is_readable_text(text: str, *, min_len: int = 2) -> bool:
    """True when text looks like real schematic labels, not custom glyph codes."""
    cleaned = sanitize_text(text)
    if len(cleaned) < min_len:
        return False
    readable = len(_READABLE_CHARS.findall(cleaned))
    ratio = readable / max(len(cleaned), 1)
    # Reject strings dominated by symbols/garbage glyphs.
    return ratio >= 0.55
