# BMW Wiring Parser

Converts BMW ETM PDF wiring diagrams into static SVG + JSON for the Next.js viewer.

## Setup

```bash
cd parser
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Usage

```bash
bmw-parse parse path/to/etm.pdf -o ../viewer/public/data
# or
python -m bmw_wiring_parser.cli parse path/to/etm.pdf -o ../viewer/public/data
```

Generate the bundled demo dataset:

```bash
python scripts/generate_demo.py
```

## Tests

```bash
pytest
ruff check src tests
mypy src
```

## Output layout

```
data/
  manifest.json
  report.json
  search-index.json
  components.json
  pages/*.svg
  page-data/*.json
```
