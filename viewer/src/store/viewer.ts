import { create } from "zustand";
import type {
  ComponentIndexEntry,
  DocumentInfo,
  Manifest,
  ManifestPage,
  OverlayItem,
  PageData,
  SearchIndexEntry,
} from "@/types/data";
import {
  loadComponentsIndex,
  loadManifest,
  loadPageData,
  loadSearchIndex,
} from "@/lib/data";
import { createSearch, findPageBySheetCode, runSearch, type SearchHit } from "@/lib/search";
import type Fuse from "fuse.js";

type ViewerState = {
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  manifest: Manifest | null;
  allPages: ManifestPage[];
  allSearchEntries: SearchIndexEntry[];
  allComponents: ComponentIndexEntry[];
  /** Pages of the currently selected document only */
  pages: ManifestPage[];
  searchEntries: SearchIndexEntry[];
  components: ComponentIndexEntry[];
  fuse: Fuse<SearchIndexEntry> | null;
  selectedDocumentId: string | null;
  currentPageIndex: number;
  pageData: PageData | null;
  selectedOverlay: OverlayItem | null;
  selectedComponent: ComponentIndexEntry | null;
  searchQuery: string;
  searchHits: SearchHit[];
  showOverlays: boolean;
  zoom: number;
  panX: number;
  panY: number;
  load: () => Promise<void>;
  selectDocument: (documentId: string) => Promise<void>;
  clearDocument: () => void;
  openPage: (pageIndex: number) => Promise<void>;
  openSheet: (sheetCode: string) => Promise<void>;
  selectOverlay: (overlay: OverlayItem | null) => void;
  setSearchQuery: (query: string) => void;
  setShowOverlays: (value: boolean) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  currentDocument: () => DocumentInfo | null;
};

function scopeToDocument(
  documentId: string,
  allPages: ManifestPage[],
  allSearchEntries: SearchIndexEntry[],
  allComponents: ComponentIndexEntry[],
) {
  const pages = allPages.filter((p) => p.document_id === documentId);
  const searchEntries = allSearchEntries.filter((e) => e.document_id === documentId);
  const components = allComponents
    .map((c) => {
      const locs = c.pages.filter((p) => p.document_id === documentId);
      return { ...c, pages: locs, count: locs.length };
    })
    .filter((c) => c.count > 0);
  return {
    pages,
    searchEntries,
    components,
    fuse: createSearch(searchEntries),
  };
}

export const useViewerStore = create<ViewerState>((set, get) => ({
  status: "idle",
  error: null,
  manifest: null,
  allPages: [],
  allSearchEntries: [],
  allComponents: [],
  pages: [],
  searchEntries: [],
  components: [],
  fuse: null,
  selectedDocumentId: null,
  currentPageIndex: 0,
  pageData: null,
  selectedOverlay: null,
  selectedComponent: null,
  searchQuery: "",
  searchHits: [],
  showOverlays: true,
  zoom: 1,
  panX: 0,
  panY: 0,

  currentDocument: () => {
    const { manifest, selectedDocumentId } = get();
    if (!manifest || !selectedDocumentId) return null;
    return manifest.documents.find((d) => d.id === selectedDocumentId) ?? null;
  },

  load: async () => {
    set({ status: "loading", error: null });
    try {
      const [manifest, search, components] = await Promise.all([
        loadManifest(),
        loadSearchIndex(),
        loadComponentsIndex(),
      ]);
      set({
        status: "ready",
        manifest,
        allPages: manifest.pages,
        allSearchEntries: search.entries,
        allComponents: components.components,
        selectedDocumentId: null,
        pages: [],
        searchEntries: [],
        components: [],
        fuse: null,
        pageData: null,
        searchQuery: "",
        searchHits: [],
      });
      // One document → open it; several → show picker
      if (manifest.documents.length === 1) {
        await get().selectDocument(manifest.documents[0].id);
      }
    } catch (err) {
      set({
        status: "error",
        error: err instanceof Error ? err.message : "Failed to load data",
      });
    }
  },

  selectDocument: async (documentId) => {
    const { allPages, allSearchEntries, allComponents } = get();
    const scoped = scopeToDocument(
      documentId,
      allPages,
      allSearchEntries,
      allComponents,
    );
    set({
      selectedDocumentId: documentId,
      ...scoped,
      searchQuery: "",
      searchHits: [],
      selectedOverlay: null,
      selectedComponent: null,
      pageData: null,
    });
    if (scoped.pages.length > 0) {
      await get().openPage(scoped.pages[0].page_index);
    }
  },

  clearDocument: () => {
    set({
      selectedDocumentId: null,
      pages: [],
      searchEntries: [],
      components: [],
      fuse: null,
      pageData: null,
      currentPageIndex: 0,
      selectedOverlay: null,
      selectedComponent: null,
      searchQuery: "",
      searchHits: [],
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },

  openPage: async (pageIndex) => {
    const documentId = get().selectedDocumentId;
    if (!documentId) return;
    const page = get().pages.find((p) => p.page_index === pageIndex);
    if (!page) return;
    const pageData = await loadPageData(page.page_data_path);
    set({
      currentPageIndex: pageIndex,
      pageData,
      selectedOverlay: null,
      selectedComponent: null,
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },

  openSheet: async (sheetCode) => {
    const documentId = get().selectedDocumentId;
    if (!documentId) return;
    const hit = findPageBySheetCode(get().searchEntries, sheetCode, documentId);
    if (!hit) return;
    await get().openPage(hit.page_index);
  },

  selectOverlay: (overlay) => {
    if (!overlay) {
      set({ selectedOverlay: null, selectedComponent: null });
      return;
    }
    let selectedComponent: ComponentIndexEntry | null = null;
    if (overlay.kind === "component") {
      const code = String(overlay.meta.code ?? overlay.label);
      selectedComponent =
        get().components.find((c) => c.code === code) ?? null;
    }
    set({ selectedOverlay: overlay, selectedComponent });
  },

  setSearchQuery: (query) => {
    const hits = runSearch(get().fuse, query);
    set({ searchQuery: query, searchHits: hits });
  },

  setShowOverlays: (value) => set({ showOverlays: value }),
  setZoom: (zoom) => set({ zoom: Math.min(4, Math.max(0.25, zoom)) }),
  setPan: (x, y) => set({ panX: x, panY: y }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
}));
