import type {
  ComponentsIndex,
  Manifest,
  PageData,
  SearchIndex,
} from "@/types/data";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const DATA_BASE = `${BASE_PATH}/data`;

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}/${path}`);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function loadManifest(): Promise<Manifest> {
  return fetchJson<Manifest>("manifest.json");
}

export function loadSearchIndex(): Promise<SearchIndex> {
  return fetchJson<SearchIndex>("search-index.json");
}

export function loadComponentsIndex(): Promise<ComponentsIndex> {
  return fetchJson<ComponentsIndex>("components.json");
}

export function loadPageData(pageDataPath: string): Promise<PageData> {
  const rel = pageDataPath.replace(/^\/?data\//, "");
  return fetchJson<PageData>(rel);
}

export function svgUrl(svgPath: string): string {
  const rel = svgPath.replace(/^\/?data\//, "");
  return `${DATA_BASE}/${rel}`;
}
