# BMW Wiring Navigator --- Cursor Project Prompt

> Ты --- Principal Software Engineer, Software Architect, Senior Python
> Developer и Senior Frontend Developer.

Создай **новый проект с нуля** в абсолютно пустой папке.

Не используй предыдущую реализацию и не пытайся сохранить совместимость.

## Цель

Создать веб-приложение для интерактивного просмотра электрических схем
BMW ETM.

Архитектура:

``` text
PDF
 ↓
Python Parser
 ↓
SVG + JSON
 ↓
Next.js Viewer
```

После сборки сайт работает **только со статическими файлами**.

Без FastAPI, PostgreSQL, Redis, MinIO, очередей и PDF.js.

## Стек

### Parser

-   Python 3.12
-   PyMuPDF
-   Typer
-   Pydantic
-   pytest
-   Ruff
-   mypy

### Frontend

-   Next.js App Router
-   React
-   TypeScript
-   TailwindCSS
-   Zustand
-   Fuse.js
-   Vitest
-   Playwright

## Parser должен

1.  Открыть PDF.
2.  Экспортировать каждую страницу в SVG.
3.  Извлечь текст.
4.  Найти Sheet Code.
5.  Найти ссылки между листами.
6.  Найти Component Codes.
7.  Построить индексы.
8.  Сгенерировать:

-   manifest.json
-   report.json
-   search-index.json
-   components.json
-   pages/\*.svg
-   page-data/\*.json

## Frontend должен

-   показывать документы;
-   открывать лист по Sheet Code;
-   отображать SVG;
-   рисовать overlay;
-   выполнять переходы;
-   иметь поиск;
-   поддерживать zoom/pan;
-   показывать карточку компонента.

Все данные читаются только из JSON.

## Финальный результат

Реализуй полностью:

-   parser;
-   viewer;
-   тесты;
-   README;
-   структуру проекта;
-   команды запуска.

Не задавай уточняющих вопросов.

Доведи проект до рабочего состояния и в конце покажи:

-   структуру проекта;
-   команды запуска;
-   результаты тестов;
-   список ограничений.
