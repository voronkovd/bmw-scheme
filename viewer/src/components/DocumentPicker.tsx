"use client";

import { useViewerStore } from "@/store/viewer";

function shortLabel(title: string, sourcePdf: string): string {
  // Prefer concise names from filename when title is a long slug.
  const fromFile = sourcePdf.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ");
  if (title.length > 60) return fromFile;
  return title;
}

export function DocumentPicker() {
  const manifest = useViewerStore((s) => s.manifest);
  const allPages = useViewerStore((s) => s.allPages);
  const selectDocument = useViewerStore((s) => s.selectDocument);

  const docs = manifest?.documents ?? [];

  return (
    <div className="flex min-h-screen flex-col px-6 py-10 md:px-12">
      <header className="mx-auto w-full max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
          BMW Wiring Navigator
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Выберите схему
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--text-muted)]">
          Каждый документ — отдельная электрическая схема автомобиля. Откройте
          нужный ETM, затем листайте и ищите компоненты внутри него.
        </p>
      </header>

      <ul className="mx-auto mt-10 grid w-full max-w-5xl gap-4 sm:grid-cols-2">
        {docs.map((doc) => {
          const pageCount =
            allPages.filter((p) => p.document_id === doc.id).length ||
            doc.page_count;
          return (
            <li key={doc.id}>
              <button
                type="button"
                onClick={() => void selectDocument(doc.id)}
                className="group flex h-full w-full flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-panel)]/90 p-5 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
              >
                <span className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  ETM
                </span>
                <span className="mt-2 text-lg font-semibold leading-snug group-hover:text-[var(--accent)]">
                  {shortLabel(doc.title, doc.source_pdf)}
                </span>
                <span className="mt-3 font-mono text-sm text-[var(--text-muted)]">
                  {pageCount} стр.
                </span>
                <span className="mt-1 truncate text-xs text-[var(--text-muted)]">
                  {doc.source_pdf}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
