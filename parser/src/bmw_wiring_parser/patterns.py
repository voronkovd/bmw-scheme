"""Regular expression patterns for BMW ETM text."""

from __future__ import annotations

import re

# Typical ETM sheet codes: 6100.0-01, 6110.0, 1240.1-02, SP0001
SHEET_CODE_RE = re.compile(
    r"\b(?:"
    r"SP\d{3,5}"
    r"|"
    r"\d{4}\.\d(?:-\d{2})?"
    r")\b"
)

# Cross-sheet references often appear as bare sheet codes near arrows / "siehe"
LINK_HINT_RE = re.compile(
    r"(?i)(?:siehe|see|→|->|⇒)?\s*("
    r"SP\d{3,5}"
    r"|"
    r"\d{4}\.\d(?:-\d{2})?"
    r")"
)

# BMW component designators: A10, B12a, F54, X10116, S212, K6300, etc.
COMPONENT_RE = re.compile(
    r"\b(?P<code>"
    r"[ABEFGHKMNPQRSTXY]"
    r"\d{1,5}"
    r"[a-z]?"
    r")\b"
)

# Title-like lines (German/English schematic headers)
TITLE_NOISE = re.compile(
    r"(?i)^(page|seite|blatt|sheet|bmw|etm|wiring|schaltplan)\b"
)
