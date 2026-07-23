"use client";

import type { OverlayItem } from "@/types/data";

const KIND_COLOR: Record<OverlayItem["kind"], string> = {
  sheet_code: "var(--sheet)",
  link: "var(--link)",
  component: "var(--component)",
};

type Props = {
  overlays: OverlayItem[];
  selectedId: string | null;
  pageWidth: number;
  pageHeight: number;
  onSelect: (overlay: OverlayItem) => void;
};

export function OverlayLayer({
  overlays,
  selectedId,
  pageWidth,
  pageHeight,
  onSelect,
}: Props) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${pageWidth} ${pageHeight}`}
      preserveAspectRatio="none"
    >
      {overlays.map((ov) => {
        const selected = ov.id === selectedId;
        const color = KIND_COLOR[ov.kind];
        const pad = 2;
        return (
          <g key={ov.id} className="pointer-events-auto">
            <rect
              x={ov.bbox.x - pad}
              y={ov.bbox.y - pad}
              width={Math.max(ov.bbox.width + pad * 2, 12)}
              height={Math.max(ov.bbox.height + pad * 2, 10)}
              fill={selected ? color : "transparent"}
              fillOpacity={selected ? 0.22 : 0}
              stroke={color}
              strokeWidth={selected ? 2 : 1.25}
              strokeOpacity={selected ? 1 : 0.75}
              rx={2}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(ov);
              }}
            >
              <title>{ov.label}</title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
}
