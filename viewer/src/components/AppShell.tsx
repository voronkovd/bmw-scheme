"use client";

import { DocumentPicker } from "@/components/DocumentPicker";
import { DocumentSidebar } from "@/components/DocumentSidebar";
import { SearchPanel } from "@/components/SearchPanel";
import { SchematicCanvas } from "@/components/SchematicCanvas";
import { ComponentCard } from "@/components/ComponentCard";
import { Toolbar } from "@/components/Toolbar";
import { useViewerStore } from "@/store/viewer";

export function AppShell() {
  const selectedDocumentId = useViewerStore((s) => s.selectedDocumentId);
  const doc = useViewerStore((s) => s.currentDocument());

  if (!selectedDocumentId) {
    return <DocumentPicker />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-elevated)]/90 px-4 py-3 backdrop-blur">
        <div className="min-w-0 pr-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            BMW ETM
          </p>
          <h1 className="truncate text-lg font-semibold tracking-tight">
            {doc?.title ?? "BMW Wiring Navigator"}
          </h1>
        </div>
        <Toolbar />
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="hidden min-h-0 border-r border-[var(--border)] bg-[var(--bg-panel)]/80 lg:block">
          <DocumentSidebar />
        </aside>

        <main className="relative min-h-0 bg-[var(--bg)]">
          <SchematicCanvas />
        </main>

        <aside className="hidden min-h-0 flex-col border-l border-[var(--border)] bg-[var(--bg-panel)]/80 lg:flex">
          <SearchPanel />
          <ComponentCard />
        </aside>
      </div>
    </div>
  );
}
