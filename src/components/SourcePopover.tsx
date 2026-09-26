import * as React from "react";
import { Info, ExternalLink, X, ShieldCheck } from "lucide-react";
import { SOURCES_CATALOG, type SourcedDatum } from "@/config/sources";

export interface SourcePopoverProps {
  sourceId?: keyof typeof SOURCES_CATALOG;
  customData?: SourcedDatum;
  label?: string;
  className?: string;
  showIconOnly?: boolean;
}

export function SourcePopover({
  sourceId,
  customData,
  label = "Source",
  className = "",
  showIconOnly = false,
}: SourcePopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const data: SourcedDatum | undefined =
    customData || (sourceId ? SOURCES_CATALOG[sourceId] : undefined);

  // Close when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!data) return null;

  return (
    <div className={`relative inline-flex items-center align-middle ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`View source and assumptions for ${data.metric}`}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5C5E62] hover:text-[#171A20] bg-[#F4F4F4] hover:bg-[#EAEAEA] px-1.5 py-0.5 rounded-[3px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#171A20]"
      >
        <Info className="w-3 h-3 text-[#F57C00] shrink-0" />
        {!showIconOnly && <span>{label}</span>}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Source & Assumptions: ${data.metric}`}
          className="absolute z-50 bottom-full left-0 mb-2 w-80 sm:w-96 p-4 rounded-[6px] bg-[#FFFFFF] border border-[#E3E4E6] shadow-xl text-left text-[#171A20] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E3E4E6]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#F57C00] shrink-0" />
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#171A20]">
                Verified Assumption
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close source details"
              className="text-[#5C5E62] hover:text-[#171A20] p-1 rounded hover:bg-[#F4F4F4] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metric & Value */}
          <div className="py-2.5 space-y-1">
            <div className="text-[12px] text-[#5C5E62] font-medium">{data.metric}</div>
            <div className="text-[14px] font-semibold text-[#171A20]">{data.value}</div>
            {data.formulaOrBasis && (
              <div className="text-[12px] text-[#5C5E62] bg-[#F4F4F4] p-2 rounded-[4px] mt-1 leading-relaxed">
                <span className="font-medium text-[#171A20]">Basis / Formula: </span>
                {data.formulaOrBasis}
              </div>
            )}
          </div>

          {/* Authority & Document */}
          <div className="pt-2 border-t border-[#E3E4E6] space-y-1 text-[12px]">
            <div className="flex justify-between text-[#5C5E62]">
              <span>Authority:</span>
              <span className="font-medium text-[#171A20] text-right">{data.authority}</span>
            </div>
            <div className="flex justify-between text-[#5C5E62]">
              <span>Document:</span>
              <span
                className="font-medium text-[#171A20] text-right max-w-[200px] truncate"
                title={data.sourceDoc}
              >
                {data.sourceDoc}
              </span>
            </div>
            <div className="flex justify-between text-[#5C5E62]">
              <span>Verified:</span>
              <span className="font-medium text-[#171A20]">{data.verifiedDate}</span>
            </div>
            {data.notes && (
              <p className="text-[11px] text-[#5C5E62] pt-1 leading-normal italic">*{data.notes}</p>
            )}
          </div>

          {/* Footer Action */}
          <div className="mt-3 pt-2.5 border-t border-[#E3E4E6] flex items-center justify-between">
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#F57C00] hover:underline"
            >
              <span>View Official Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[11px] text-[#5C5E62]">No sponsored data</span>
          </div>
        </div>
      )}
    </div>
  );
}
