# BMW Wiring Navigator

Интерактивный просмотр электрических схем BMW ETM.

```text
PDF → Python Parser → SVG + JSON → Next.js Viewer (static)
```

Сайт после сборки — **только статика** (без API, БД и PDF.js).

## Структура

```text
bmw-scheme/
├── files/                  # исходные ETM PDF
├── parser/                 # CLI: PDF → SVG/JSON
├── viewer/                 # Next.js App Router
├── scripts/build-static.sh # локальная/CI сборка
├── Dockerfile              # nginx-раздача статики
└── .github/workflows/ci.yml
```

## Локальный запуск

```bash
# 1. Парсер + данные
cd parser
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
bmw-parse parse-dir ../files -o ../viewer/public/data

# 2. Viewer
cd ../viewer
npm install
npm run dev
```

Откройте http://localhost:3000 — сначала выбор документа, затем листы схемы.

## Команды

| Где | Команда | Назначение |
|-----|---------|------------|
| parser | `bmw-parse parse-dir ../files -o ../viewer/public/data` | разобрать все PDF |
| parser | `pytest` / `ruff` / `mypy` | тесты и линт |
| viewer | `npm run dev` | dev-сервер |
| viewer | `npm run build` | static export → `out/` |
| viewer | `npm test` | Vitest |
| root | `bash scripts/build-static.sh` | parse + build |

## CI / CD

При пуше в `main`:

1. тесты parser + viewer;
2. парсинг PDF из `files/`;
3. сборка Next.js (`BASE_PATH=/bmw-scheme`);
4. деплой на **GitHub Pages**.

Сайт: **https://voronkovd.github.io/bmw-scheme/**

> После первого пуша: Settings → Pages → Source = **GitHub Actions**.

### Почему не Heroku

Бесплатные dyno на Heroku отключили в 2022. Для статики удобнее:

| Хостинг | Как |
|---------|-----|
| **GitHub Pages** | уже в CI (основной) |
| **Render Static** | Blueprint `render.yaml` или New → Static Site |
| **Docker** (`Dockerfile`) | Fly.io / Render Web / любой VPS с nginx |

Render: подключите репозиторий, Build Command `bash scripts/build-static.sh ""`, Publish `viewer/out`.

## Ограничения

- Нужен текстовый слой PDF (без OCR сканы не распознаются).
- Sheet/component/link — regex-эвристики.
- Сгенерированные SVG/JSON (~500 MB) в git не хранятся — собираются в CI.
- PDF в `files/` могут быть защищены авторским правом; для публичного репо убедитесь, что имеете право на публикацию.
