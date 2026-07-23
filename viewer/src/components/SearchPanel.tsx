"use client";

import { useViewerStore } from "@/store/viewer";

const TYPE_LABEL: Record<string, string> = {
  sheet: "Лист",
  component: "Компонент",
  link: "Ссылка",
  title: "Заголовок",
};

export function SearchPanel() {
  const searchQuery = useViewerStore((s) => s.searchQuery);
  const searchHits = useViewerStore((s) => s.searchHits);
  const setSearchQuery = useViewerStore((s) => s.setSearchQuery);
  const openPage = useViewerStore((s) => s.openPage);
  const openSheet = useViewerStore((s) => s.openSheet);

  return (
    <div className="border-b border-[var(--border)] p-3">
      <label className="mb-2 block text-sm font-medium" htmlFor="search">
        Поиск в схеме
      </label>
      <input
        id="search"
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Sheet code, компонент…"
        className="w-full rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm outline-none ring-[var(--accent)] placeholder:text-[var(--text-muted)] focus:ring-1"
      />
      <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto">
        {searchHits.map((hit) => (
          <li key={hit.id}>
            <button
              type="button"
              className="w-full rounded-md px-2 py-1.5 text-left hover:bg-white/5"
              onClick={() => {
                if (hit.type === "sheet" || hit.type === "link") {
                  void openSheet(hit.label);
                } else {
                  void openPage(hit.page_index);
                }
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm">{hit.label}</span>
                <span className="text-[10px] uppercase text-[var(--text-muted)]">
                  {TYPE_LABEL[hit.type] ?? hit.type}
                </span>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                стр. {hit.page_index + 1}
                {hit.sheet_code ? ` · ${hit.sheet_code}` : ""}
              </div>
            </button>
          </li>
        ))}
        {searchQuery && searchHits.length === 0 && (
          <li className="px-2 py-2 text-xs text-[var(--text-muted)]">Ничего не найдено</li>
        )}
      </ul>
    </div>
  );
}
