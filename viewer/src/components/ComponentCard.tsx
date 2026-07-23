"use client";

import { useViewerStore } from "@/store/viewer";

export function ComponentCard() {
  const selectedOverlay = useViewerStore((s) => s.selectedOverlay);
  const selectedComponent = useViewerStore((s) => s.selectedComponent);
  const openPage = useViewerStore((s) => s.openPage);
  const openSheet = useViewerStore((s) => s.openSheet);
  const selectOverlay = useViewerStore((s) => s.selectOverlay);

  if (!selectedOverlay) {
    return (
      <div className="flex flex-1 items-start p-4 text-sm text-[var(--text-muted)]">
        Выберите overlay на схеме — ссылку или компонент.
      </div>
    );
  }

  const isLink = selectedOverlay.kind === "link";
  const isComponent = selectedOverlay.kind === "component";
  const targetSheet = String(selectedOverlay.meta.target_sheet ?? "");

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {selectedOverlay.kind}
          </p>
          <h3 className="font-mono text-xl font-semibold text-[var(--component)]">
            {selectedOverlay.label}
          </h3>
        </div>
        <button
          type="button"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
          onClick={() => selectOverlay(null)}
        >
          Закрыть
        </button>
      </div>

      {isLink && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
          <p className="mb-2 text-sm text-[var(--text-muted)]">Переход на лист</p>
          <button
            type="button"
            className="rounded-md bg-[var(--link)]/20 px-3 py-2 font-mono text-[var(--link)] ring-1 ring-[var(--link)]/40 hover:bg-[var(--link)]/30"
            onClick={() => void openSheet(targetSheet)}
          >
            → {targetSheet}
          </button>
        </div>
      )}

      {isComponent && selectedComponent && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3">
          <p className="mb-1 text-sm">
            В этой схеме: <strong>{selectedComponent.count}</strong>
          </p>
          <ul className="mt-2 space-y-1">
            {selectedComponent.pages.map((loc, i) => (
              <li key={`${loc.page_index}-${i}`}>
                <button
                  type="button"
                  className="w-full rounded px-2 py-1.5 text-left font-mono text-sm hover:bg-white/5"
                  onClick={() => void openPage(loc.page_index)}
                >
                  {loc.sheet_code ?? `page ${loc.page_index}`}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
        <div>
          <dt>X</dt>
          <dd className="font-mono text-[var(--text)]">
            {selectedOverlay.bbox.x.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt>Y</dt>
          <dd className="font-mono text-[var(--text)]">
            {selectedOverlay.bbox.y.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt>W</dt>
          <dd className="font-mono text-[var(--text)]">
            {selectedOverlay.bbox.width.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt>H</dt>
          <dd className="font-mono text-[var(--text)]">
            {selectedOverlay.bbox.height.toFixed(1)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
