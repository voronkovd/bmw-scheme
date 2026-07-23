"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { OverlayLayer } from "@/components/OverlayLayer";
import { svgUrl } from "@/lib/data";
import { useViewerStore } from "@/store/viewer";

export function SchematicCanvas() {
  const pageData = useViewerStore((s) => s.pageData);
  const showOverlays = useViewerStore((s) => s.showOverlays);
  const selectedOverlay = useViewerStore((s) => s.selectedOverlay);
  const selectOverlay = useViewerStore((s) => s.selectOverlay);
  const openSheet = useViewerStore((s) => s.openSheet);
  const zoom = useViewerStore((s) => s.zoom);
  const panX = useViewerStore((s) => s.panX);
  const panY = useViewerStore((s) => s.panY);
  const setZoom = useViewerStore((s) => s.setZoom);
  const setPan = useViewerStore((s) => s.setPan);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  useEffect(() => {
    if (!pageData) {
      setSvgMarkup(null);
      return;
    }
    let cancelled = false;
    const url = svgUrl(pageData.svg_path);
    void fetch(url)
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled) setSvgMarkup(text);
      })
      .catch(() => {
        if (!cancelled) setSvgMarkup(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pageData]);

  const onWheel = useCallback(
    (e: ReactWheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1 / 1.08 : 1.08;
      setZoom(zoom * factor);
    },
    [setZoom, zoom],
  );

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-overlay]")) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: panX,
      originY: panY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    setPan(
      drag.originX + (e.clientX - drag.startX),
      drag.originY + (e.clientY - drag.startY),
    );
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
    }
  };

  if (!pageData) {
    return (
      <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
        Нет страницы
      </div>
    );
  }

  return (
    <div
      ref={viewportRef}
      className="relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={() => selectOverlay(null)}
    >
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: pageData.width,
          height: pageData.height,
          transform: `translate(calc(-50% + ${panX}px), calc(-50% + ${panY}px)) scale(${zoom})`,
        }}
      >
        <div
          className="schematic-svg relative h-full w-full bg-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
          // Inline SVG keeps coordinates aligned with overlay bboxes.
          dangerouslySetInnerHTML={
            svgMarkup ? { __html: svgMarkup } : undefined
          }
        />
        {!svgMarkup && (
          <div className="absolute inset-0 flex items-center justify-center bg-white text-slate-500">
            Загрузка SVG…
          </div>
        )}
        {showOverlays && (
          <div data-overlay className="absolute inset-0">
            <OverlayLayer
              overlays={pageData.overlays}
              selectedId={selectedOverlay?.id ?? null}
              pageWidth={pageData.width}
              pageHeight={pageData.height}
              onSelect={(ov) => {
                selectOverlay(ov);
                // Links navigate immediately; components open the detail card.
                if (ov.kind === "link") {
                  const target = String(ov.meta.target_sheet ?? "");
                  if (target) void openSheet(target);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
