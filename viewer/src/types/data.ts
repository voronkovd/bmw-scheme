export type BBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OverlayKind = "sheet_code" | "link" | "component";

export type OverlayItem = {
  id: string;
  kind: OverlayKind;
  label: string;
  bbox: BBox;
  meta: Record<string, unknown>;
};

export type PageData = {
  page_index: number;
  sheet_code: string | null;
  title: string | null;
  width: number;
  height: number;
  overlays: OverlayItem[];
  svg_path: string;
  components: Array<{
    code: string;
    bbox: BBox;
    label?: string | null;
    confidence?: number;
  }>;
  links: Array<{
    target_sheet: string;
    label: string;
    bbox: BBox;
    confidence?: number;
  }>;
};

export type ManifestPage = {
  document_id: string;
  page_index: number;
  sheet_code: string | null;
  title: string | null;
  svg_path: string;
  page_data_path: string;
  width: number;
  height: number;
  link_count: number;
  component_count: number;
};

export type DocumentInfo = {
  id: string;
  title: string;
  source_pdf: string;
  page_count: number;
  created_at: string;
};

export type Manifest = {
  version: string;
  documents: DocumentInfo[];
  pages: ManifestPage[];
};

export type SearchIndexEntry = {
  id: string;
  type: string;
  label: string;
  sheet_code: string | null;
  page_index: number;
  document_id: string;
  bbox?: BBox | null;
};

export type SearchIndex = {
  entries: SearchIndexEntry[];
};

export type ComponentIndexEntry = {
  code: string;
  count: number;
  pages: Array<{
    document_id?: string;
    page_index: number;
    sheet_code: string | null;
    bbox: BBox;
    confidence?: number;
  }>;
};

export type ComponentsIndex = {
  components: ComponentIndexEntry[];
};
