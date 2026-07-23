import Fuse from "fuse.js";
import type { SearchIndexEntry } from "@/types/data";

export type SearchHit = SearchIndexEntry & { score?: number };

export function createSearch(entries: SearchIndexEntry[]) {
  return new Fuse(entries, {
    keys: [
      { name: "label", weight: 0.7 },
      { name: "sheet_code", weight: 0.2 },
      { name: "type", weight: 0.1 },
    ],
    threshold: 0.35,
    includeScore: true,
  });
}

export function runSearch(
  fuse: Fuse<SearchIndexEntry> | null,
  query: string,
  limit = 20,
): SearchHit[] {
  const q = query.trim();
  if (!fuse || !q) return [];
  return fuse.search(q, { limit }).map((r) => ({
    ...r.item,
    score: r.score,
  }));
}

export function findPageBySheetCode(
  entries: SearchIndexEntry[],
  sheetCode: string,
  preferredDocumentId?: string,
): SearchIndexEntry | undefined {
  const sheets = entries.filter(
    (e) => e.type === "sheet" && e.label === sheetCode,
  );
  if (preferredDocumentId) {
    const preferred = sheets.find((e) => e.document_id === preferredDocumentId);
    if (preferred) return preferred;
  }
  return sheets[0];
}
