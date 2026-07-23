"use client";

import { displayLabel } from "@/lib/labels";
import { useViewerStore } from "@/store/viewer";

export function Toolbar() {
  const zoom = useViewerStore((s) => s.zoom);
  const setZoom = useViewerStore((s) => s.setZoom);
  const resetView = useViewerStore((s) => s.resetView);
  const showOverlays = useViewerStore((s) => s.showOverlays);
  const setShowOverlays = useViewerStore((s) => s.setShowOverlays);
  const pages = useViewerStore((s) => s.pages);
  const currentPageIndex = useViewerStore((s) => s.currentPageIndex);
  const openPage = useViewerStore((s) => s.openPage);
  const clearDocument = useViewerStore((s) => s.clearDocument);
  const pageData = useViewerStore((s) => s.pageData);
  const manifest = useViewerStore((s) => s.manifest);

  const flatIndex = pages.findIndex((p) => p.page_index === currentPageIndex);
  const prev = flatIndex > 0 ? pages[flatIndex - 1] : null;
  const next =
    flatIndex >= 0 && flatIndex < pages.length - 1 ? pages[flatIndex + 1] : null;
  const multiDoc = (manifest?.documents.length ?? 0) > 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {multiDoc && (
        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]"
          onClick={clearDocument}
          title="К списку схем"
        >
          ← Схемы
        </button>
      )}

      <div className="mr-2 hidden max-w-[280px] items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-sm md:flex">
        <span className="font-mono text-[var(--accent)]">
          {pageData?.sheet_code ?? "—"}
        </span>
        <span className="text-[var(--text-muted)]">·</span>
        <span className="max-w-[180px] truncate text-[var(--text-muted)]">
          {displayLabel(pageData?.title)}
        </span>
      </div>

      <button
        type="button"
        className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm hover:bg-[var(--accent-soft)] disabled:opacity-40"
        disabled={!prev}
        onClick={() => prev && void openPage(prev.page_index)}
      >
        ←
      </button>
      <span className="min-w-[4.5rem] text-center font-mono text-sm text-[var(--text-muted)]">
        {flatIndex >= 0 ? flatIndex + 1 : 0}/{pages.length}
      </span>
      <button
        type="button"
        className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm hover:bg-[var(--accent-soft)] disabled:opacity-40"
        disabled={!next}
        onClick={() => next && void openPage(next.page_index)}
      >
        →
      </button>

      <div className="mx-1 h-5 w-px bg-[var(--border)]" />

      <button
        type="button"
        className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm hover:bg-[var(--accent-soft)]"
        onClick={() => setZoom(zoom / 1.2)}
      >
        −
      </button>
      <button
        type="button"
        className="min-w-[3.5rem] rounded-md border border-[var(--border)] px-2 py-1.5 font-mono text-sm hover:bg-[var(--accent-soft)]"
        onClick={resetView}
        title="Сбросить вид"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-sm hover:bg-[var(--accent-soft)]"
        onClick={() => setZoom(zoom * 1.2)}
      >
        +
      </button>

      <button
        type="button"
        className={`rounded-md border px-2.5 py-1.5 text-sm ${
          showOverlays
            ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
            : "border-[var(--border)] text-[var(--text-muted)]"
        }`}
        onClick={() => setShowOverlays(!showOverlays)}
      >
        Overlay
      </button>
    </div>
  );
}
