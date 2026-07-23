"use client";

import { displayLabel } from "@/lib/labels";
import { useViewerStore } from "@/store/viewer";

export function DocumentSidebar() {
  const pages = useViewerStore((s) => s.pages);
  const currentPageIndex = useViewerStore((s) => s.currentPageIndex);
  const openPage = useViewerStore((s) => s.openPage);
  const doc = useViewerStore((s) => s.currentDocument());

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-sm font-medium">Листы</h2>
        <p className="truncate text-xs text-[var(--text-muted)]" title={doc?.title}>
          {doc?.title ?? "—"} · {pages.length} стр.
        </p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto p-2">
        {pages.map((page) => {
          const active = page.page_index === currentPageIndex;
          return (
            <li key={page.page_index}>
              <button
                type="button"
                onClick={() => void openPage(page.page_index)}
                className={`mb-1 w-full rounded-md px-3 py-2 text-left transition ${
                  active
                    ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="font-mono text-sm text-[var(--accent)]">
                  {page.sheet_code ?? `page-${page.page_index}`}
                </div>
                <div className="truncate text-xs text-[var(--text-muted)]">
                  {displayLabel(page.title)}
                </div>
                <div className="mt-1 flex gap-2 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                  <span>{page.component_count} comp</span>
                  <span>{page.link_count} links</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
