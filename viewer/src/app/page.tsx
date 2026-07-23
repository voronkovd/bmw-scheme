"use client";

import { useEffect } from "react";
import { useViewerStore } from "@/store/viewer";
import { AppShell } from "@/components/AppShell";

export default function HomePage() {
  const load = useViewerStore((s) => s.load);
  const status = useViewerStore((s) => s.status);
  const error = useViewerStore((s) => s.error);

  useEffect(() => {
    void load();
  }, [load]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--text-muted)]">
        Загрузка схем…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold text-[var(--danger)]">Ошибка загрузки</h1>
        <p className="max-w-md text-[var(--text-muted)]">{error}</p>
        <p className="max-w-lg text-sm text-[var(--text-muted)]">
          Убедитесь, что в <code className="font-mono text-[var(--accent)]">public/data</code>{" "}
          есть manifest.json. Сгенерируйте демо:{" "}
          <code className="font-mono text-[var(--accent)]">
            python parser/scripts/generate_demo.py
          </code>
        </p>
      </div>
    );
  }

  return <AppShell />;
}
