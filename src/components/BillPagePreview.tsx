import * as React from "react";
import type { BillPage, Redaction } from "@/lib/bill-document";
export function BillPagePreview({
  page,
  index,
  marks,
  onChange,
  disabled = false,
}: {
  page: BillPage;
  index: number;
  marks: Redaction[];
  onChange: (marks: Redaction[]) => void;
  disabled?: boolean;
}) {
  const [visible, setVisible] = React.useState(false);
  const [fullSize, setFullSize] = React.useState(false);
  const [start, setStart] = React.useState<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = React.useState<Redaction | null>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const el = canvas.current;
    if (!el || !visible) return;
    const ctx = el.getContext("2d")!;
    let cancelled = false;
    const img = new Image();
    img.src = page.dataUrl;
    void img.decode().then(() => {
      if (cancelled) return;
      ctx.drawImage(img, 0, 0, el.width, el.height);
      ctx.fillStyle = "#111111";
      for (const r of [...marks, ...(draft ? [draft] : [])])
        ctx.fillRect(r.x * el.width, r.y * el.height, r.width * el.width, r.height * el.height);
    });
    return () => {
      cancelled = true;
    };
  }, [page, visible, marks, draft]);
  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - box.left) / box.width)),
      y: Math.min(1, Math.max(0, (e.clientY - box.top) / box.height)),
    };
  }
  return (
    <div className="space-y-2 border border-[#E3E4E6] rounded p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">Page {index + 1} · local preview</span>
        <button
          type="button"
          disabled={disabled}
          className="min-h-11 px-3 text-sm underline"
          onClick={() => setVisible(!visible)}
        >
          {visible ? "Hide private preview" : "Reveal locally to redact"}
        </button>
      </div>
      {visible ? (
        <>
          <p className="text-xs text-[#5C5E62]">
            Drag over names, account numbers, addresses and QR codes to hide them before processing.
            Black areas will be removed from the transmitted image.
          </p>
          <button
            type="button"
            disabled={disabled}
            className="min-h-11 px-3 bg-[#EEEEEE] rounded text-xs"
            onClick={() => setFullSize(!fullSize)}
          >
            {fullSize ? "Fit preview" : "Read at full size"}
          </button>
          {fullSize && (
            <p className="text-xs text-[#5C5E62]">
              Scroll to read small digits. Return to fit view to draw redactions.
            </p>
          )}
          <div
            className={fullSize ? "max-h-[500px] overflow-auto" : ""}
            role="region"
            aria-label={`Scrollable bill page ${index + 1}`}
            tabIndex={fullSize ? 0 : undefined}
          >
            <canvas
              role="img"
              ref={canvas}
              width={page.width}
              height={page.height}
              aria-label={`Private bill page ${index + 1}, drag to redact`}
              className={
                fullSize
                  ? "max-w-none h-auto border touch-auto"
                  : "w-full h-auto border touch-none cursor-crosshair"
              }
              style={fullSize ? { width: page.width } : undefined}
              onPointerDown={(e) => {
                if (disabled || fullSize) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                setStart(point(e));
              }}
              onPointerMove={(e) => {
                if (disabled || fullSize || !start) return;
                const p = point(e);
                setDraft({
                  x: Math.min(start.x, p.x),
                  y: Math.min(start.y, p.y),
                  width: Math.abs(p.x - start.x),
                  height: Math.abs(p.y - start.y),
                });
              }}
              onPointerUp={() => {
                if (!disabled && draft && draft.width > 0.003 && draft.height > 0.003)
                  onChange([...marks, draft]);
                setStart(null);
                setDraft(null);
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled}
              className="min-h-11 px-3 bg-[#EEEEEE] rounded text-xs"
              onClick={() => onChange([...marks, { x: 0, y: 0, width: 1, height: 0.25 }])}
            >
              Hide top quarter
            </button>
            <button
              type="button"
              disabled={disabled}
              className="min-h-11 px-3 bg-[#EEEEEE] rounded text-xs"
              onClick={() => onChange([...marks, { x: 0, y: 0.75, width: 1, height: 0.25 }])}
            >
              Hide bottom quarter
            </button>
            <button
              type="button"
              disabled={disabled}
              className="min-h-11 px-3 text-xs underline"
              onClick={() => onChange(marks.slice(0, -1))}
            >
              Undo last redaction
            </button>
          </div>
        </>
      ) : (
        <div className="h-24 flex items-center justify-center bg-[#F4F4F4] text-xs text-[#5C5E62]">
          Preview hidden for privacy · {marks.length} redaction(s)
        </div>
      )}
    </div>
  );
}
