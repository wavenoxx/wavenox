import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export interface SpecCategory {
  title: string;
  items: { label: string; value: string; verify?: boolean }[];
}

export interface SpecsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories?: SpecCategory[];
  title?: string;
  trigger?: React.ReactNode;
}

const defaultSolarSpecs: SpecCategory[] = [
  {
    title: "Photovoltaic Modules",
    items: [
      { label: "Cell Technology", value: "N-type TOPCon Monocrystalline Bifacial", verify: true },
      { label: "Nominal Module Power", value: "550W per panel", verify: true },
      { label: "Cell Efficiency", value: "Up to 22.8%", verify: true },
      { label: "Temperature Coefficient (Pmax)", value: "-0.30% / °C" },
      { label: "Front Surface", value: "3.2mm Anti-reflective tempered glass" },
      { label: "Listing & Compliance", value: "MNRE ALMM Approved / BIS Certified" },
    ],
  },
  {
    title: "Inverter & Power Electronics",
    items: [
      { label: "Architecture", value: "Smart Hybrid Inverter with Dual MPPT" },
      { label: "Maximum Efficiency", value: "98.4%" },
      { label: "Transfer Time", value: "< 10 milliseconds (Uninterrupted)" },
      { label: "Monitoring", value: "Wi-Fi + 4G LTE Live Telemetry" },
    ],
  },
  {
    title: "Mounting & Structural",
    items: [
      { label: "Structure Material", value: "HDG Anodized Aluminium (6063-T6)" },
      { label: "Wind Rating", value: "Engineered up to 170 km/h gusts" },
      { label: "Roof Attachment", value: "Non-penetrating chemical anchoring / ballast" },
    ],
  },
  {
    title: "Warranty & Protection",
    items: [
      { label: "Product Workmanship", value: "10 Years Turnkey WAVENOX Warranty" },
      { label: "Linear Power Output", value: "25 Years (≥ 84.8% output at Year 25)", verify: true },
      { label: "Battery Performance", value: "10 Years (≥ 70% capacity retention)" },
    ],
  },
];

export function SpecsDrawer({
  open,
  onOpenChange,
  categories = defaultSolarSpecs,
  title = "Technical Specifications",
  trigger,
}: SpecsDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg bg-[#FFFFFF] shadow-2xl flex flex-col focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E3E4E6]">
            <Dialog.Title className="text-[18px] font-medium tracking-tight text-[#171A20]">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="w-8 h-8 rounded-[4px] inline-flex items-center justify-center text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
                aria-label="Close specifications"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-[12px] font-medium uppercase tracking-wider text-[#5C5E62]">
                  {cat.title}
                </h3>
                <div className="divide-y divide-[#E3E4E6]/60 border-y border-[#E3E4E6]/60">
                  {cat.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="py-3 flex items-baseline justify-between gap-4 text-[14px]"
                    >
                      <span className="text-[#5C5E62] font-normal">{item.label}</span>
                      <span className="text-[#171A20] font-medium text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <p className="text-[12px] text-[#5C5E62] leading-relaxed pt-2">
              Specifications reflect standard WAVENOX turnkey residential & commercial
              configurations. Detailed engineering datasheets are provided during site survey and
              net metering sanctioning.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
