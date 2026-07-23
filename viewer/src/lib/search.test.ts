import { describe, expect, it } from "vitest";
import { createSearch, findPageBySheetCode, runSearch } from "@/lib/search";
import type { SearchIndexEntry } from "@/types/data";

const entries: SearchIndexEntry[] = [
  {
    id: "1",
    type: "sheet",
    label: "6100.0-01",
    sheet_code: "6100.0-01",
    page_index: 0,
    document_id: "demo",
  },
  {
    id: "2",
    type: "component",
    label: "A10",
    sheet_code: "6100.0-01",
    page_index: 0,
    document_id: "demo",
  },
  {
    id: "3",
    type: "sheet",
    label: "6110.0",
    sheet_code: "6110.0",
    page_index: 1,
    document_id: "demo",
  },
];

describe("search", () => {
  it("finds sheet by code", () => {
    const fuse = createSearch(entries);
    const hits = runSearch(fuse, "6100");
    expect(hits.some((h) => h.label === "6100.0-01")).toBe(true);
  });

  it("finds component", () => {
    const fuse = createSearch(entries);
    const hits = runSearch(fuse, "A10");
    expect(hits[0]?.label).toBe("A10");
  });

  it("resolves page by sheet code", () => {
    const hit = findPageBySheetCode(entries, "6110.0");
    expect(hit?.page_index).toBe(1);
  });

  it("prefers matching document id", () => {
    const multi = [
      ...entries,
      {
        id: "4",
        type: "sheet" as const,
        label: "6110.0",
        sheet_code: "6110.0",
        page_index: 9,
        document_id: "other",
      },
    ];
    const hit = findPageBySheetCode(multi, "6110.0", "other");
    expect(hit?.page_index).toBe(9);
  });
});
