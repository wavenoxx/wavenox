import * as React from "react";
import { ArrowRight, AlertTriangle, Ruler } from "lucide-react";
import { PRODUCTS_CONFIG } from "@/config/products";
import { SOLAR_ASSUMPTIONS } from "@/config/solar";
import { calculateRoofSketcherGeometry } from "@/config/recommendation";

export interface RoofSketcherProps {
  onApplyKw?: (kw: number, panels: number, areaSqft: number) => void;
  className?: string;
  initialGrossSqft?: number;
  discomCode?: string;
  targetPanels?: number;
}
const control =
  "w-full min-h-11 px-3 rounded border border-[#D1D5DB] bg-white text-sm focus:ring-2 focus:ring-[#171A20]";
export function RoofSketcher({
  onApplyKw,
  className = "",
  initialGrossSqft = 1800,
  discomCode = "TGSPDCL",
  targetPanels,
}: RoofSketcherProps) {
  const [shape, setShape] = React.useState<"area" | "rectangle" | "l-shape">("area");
  const [grossAreaSqft, setGrossAreaSqft] = React.useState(initialGrossSqft);
  const [length, setLength] = React.useState("40");
  const [width, setWidth] = React.useState("30");
  const [cutLength, setCutLength] = React.useState("10");
  const [cutWidth, setCutWidth] = React.useState("10");
  const [orientation, setOrientation] = React.useState("unknown");
  const [parapetMarginFt, setParapetMarginFt] = React.useState(2);
  const [waterTankSqft, setWaterTankSqft] = React.useState(120);
  const [walkwaySqft, setWalkwaySqft] = React.useState(100);
  const assessment = React.useMemo(() => {
    try {
      return {
        geometry: calculateRoofSketcherGeometry({
          grossAreaSqft,
          parapetMarginFt,
          waterTankSqft,
          walkwaySqft,
          discomCode,
          targetPanels,
          ...(shape !== "area"
            ? {
                lengthFt: Number(length),
                widthFt: Number(width),
                ...(shape === "l-shape"
                  ? { cutoutLengthFt: Number(cutLength), cutoutWidthFt: Number(cutWidth) }
                  : {}),
              }
            : {}),
        }),
        error: "",
      };
    } catch {
      return {
        geometry: calculateRoofSketcherGeometry({
          grossAreaSqft: 0,
          parapetMarginFt: 0,
          waterTankSqft: 0,
          walkwaySqft: 0,
          discomCode,
          targetPanels,
        }),
        error:
          "Enter positive dimensions up to 500 ft. A corner cutout must be smaller than both outer dimensions.",
      };
    }
  }, [
    shape,
    length,
    width,
    cutLength,
    cutWidth,
    grossAreaSqft,
    parapetMarginFt,
    waterTankSqft,
    walkwaySqft,
    discomCode,
    targetPanels,
  ]);
  const g = assessment.geometry;
  const inputs = [
    { label: "Roof length (ft)", value: length, set: setLength },
    { label: "Roof width (ft)", value: width, set: setWidth },
    ...(shape === "l-shape"
      ? [
          { label: "Corner cutout length (ft)", value: cutLength, set: setCutLength },
          { label: "Corner cutout width (ft)", value: cutWidth, set: setCutWidth },
        ]
      : []),
  ];
  return (
    <section
      className={`border border-[#E3E4E6] rounded-lg bg-white overflow-hidden ${className}`}
      aria-label="Preliminary roof assessment"
    >
      <div className="p-4 sm:p-5 bg-[#F8F8FA] space-y-2 border-b border-[#E3E4E6]">
        <div className="flex items-center gap-2">
          <Ruler className="h-4 w-4" />
          <h3 className="text-base font-medium">Rooftop Area &amp; Obstruction Planner</h3>
        </div>
        <p className="text-xs text-[#5C5E62]">
          Use your measurements for a preliminary area assessment. This is a manual geometry model.
          Customer satellite measurement and automatic roof detection are unavailable.
        </p>
      </div>
      <div className="p-4 sm:p-5 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Roof measurement method</span>
          <select
            className={control}
            value={shape}
            onChange={(e) => setShape(e.target.value as typeof shape)}
          >
            <option value="area">Approximate area (square assumption)</option>
            <option value="rectangle">Measured rectangle</option>
            <option value="l-shape">Measured L-shape with corner cutout</option>
          </select>
        </label>
        {shape !== "area" && (
          <div className="grid grid-cols-2 gap-3">
            {inputs.map((i) => (
              <label className="space-y-1" key={i.label}>
                <span className="text-xs font-medium">{i.label}</span>
                <input
                  type="number"
                  min={0}
                  max={500}
                  step="any"
                  className={control}
                  value={i.value}
                  onChange={(e) => i.set(e.target.value)}
                />
              </label>
            ))}
          </div>
        )}
        {shape === "area" && (
          <div className="space-y-2">
            <label htmlFor="gross-terrace-slider" className="text-sm font-medium">
              Gross Terrace Area · {grossAreaSqft.toLocaleString("en-IN")} sq.ft.
            </label>
            <input
              id="gross-terrace-slider"
              type="range"
              min={0}
              max={8000}
              step={50}
              value={grossAreaSqft}
              onChange={(e) => setGrossAreaSqft(Number(e.target.value))}
              className="range-slider w-full"
              aria-label="Gross Terrace Area in square feet"
            />
            <label className="block space-y-1">
              <span className="text-xs">Enter gross area (sq.ft.)</span>
              <input
                type="number"
                min={0}
                max={8000}
                className={control}
                value={grossAreaSqft}
                onChange={(e) =>
                  setGrossAreaSqft(Math.min(8000, Math.max(0, Number(e.target.value))))
                }
              />
            </label>
            <p className="text-xs text-[#5C5E62]">
              Area-only mode assumes a square perimeter. Choose measured dimensions for a long,
              narrow or L-shaped terrace. Irregular roofs need a survey.
            </p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Parapet setback · {parapetMarginFt} ft
            </span>
            <input
              id="setback-slider"
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={parapetMarginFt}
              onChange={(e) => setParapetMarginFt(Number(e.target.value))}
              className="range-slider w-full"
              aria-label="Parapet setback in feet"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Water tank / obstacles · {waterTankSqft} sq.ft.
            </span>
            <input
              id="tank-slider"
              type="range"
              min={0}
              max={600}
              step={10}
              value={waterTankSqft}
              onChange={(e) => setWaterTankSqft(Number(e.target.value))}
              className="range-slider w-full"
              aria-label="Water tank footprint deduction"
            />
          </label>
          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Maintenance access · {walkwaySqft} sq.ft.
            </span>
            <input
              id="walkway-slider"
              type="range"
              min={0}
              max={400}
              step={10}
              value={walkwaySqft}
              onChange={(e) => setWalkwaySqft(Number(e.target.value))}
              className="range-slider w-full"
              aria-label="Maintenance walkway deduction"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Intended panel orientation</span>
            <select
              className={control}
              value={orientation}
              onChange={(e) => setOrientation(e.target.value)}
            >
              <option value="unknown">Unknown / survey required</option>
              <option value="south">South</option>
              <option value="east-west">East–west</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <p className="text-xs text-[#5C5E62]">
          Setback and obstacle values start as editable planning assumptions. Deduct only distinct
          areas inside the roof boundary; overlapping deductions are conservative. Orientation is
          recorded for your local review and does not alter the existing regional yield model.
        </p>
        {shape === "l-shape" && (
          <p className="text-xs text-[#5C5E62]">
            The L-shape is an outer rectangle minus one corner. The full cutout is deducted from the
            inset rectangle, conservatively reserving additional space near the inner corner.
          </p>
        )}
        {assessment.error && (
          <p role="alert" className="text-sm text-[#B42318]">
            {assessment.error}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2 bg-[#F4F4F4] p-3 rounded text-xs">
          <div>
            Gross roof
            <strong className="block text-sm">
              {g.grossAreaSqft.toLocaleString("en-IN")} sq.ft.
            </strong>
          </div>
          <div>
            Deductions
            <strong className="block text-sm">
              {g.totalDeductionsSqft.toLocaleString("en-IN")} sq.ft.
            </strong>
          </div>
          <div>
            Usable area
            <strong className="block text-sm" data-testid="roof-usable-area">
              {g.netUsableSqft.toLocaleString("en-IN")} sq.ft.
            </strong>
          </div>
        </div>
        <div className="border-2 border-dashed border-[#9CA3AF] rounded p-3 bg-[#F8F8FA] space-y-3">
          <p className="text-xs text-[#5C5E62]">
            Approximate module count illustration · not a scaled placement plan
          </p>
          {g.maxFeasiblePanels > 0 ? (
            <div
              className="flex flex-wrap gap-2"
              role="img"
              aria-label={`Simulated layout of ${g.maxFeasiblePanels} solar modules`}
            >
              {Array.from({ length: Math.min(36, g.maxFeasiblePanels) }, (_, i) => (
                <span
                  key={i}
                  className="block w-5 h-9 bg-[#171A20] border border-white/30 rounded-sm"
                />
              ))}
              {g.maxFeasiblePanels > 36 && (
                <span className="text-xs">+{g.maxFeasiblePanels - 36} modules</span>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#92400E]">
              0 Feasible Modules ({g.netUsableSqft} sq.ft. Net Usable Area)
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            Indicative area capacity
            <strong className="block text-lg">
              {g.maxFeasibleKw} kW · {g.maxFeasiblePanels} panels
            </strong>
          </div>
          <div>
            Regional generation assumption
            <strong className="block text-base">
              {g.yieldStatus === "UNAVAILABLE"
                ? "Requires utility review"
                : `~${g.estimatedMonthlyKwh.toLocaleString("en-IN")} kWh/month`}
            </strong>
          </div>
        </div>
        {g.warning && (
          <p role="status" className="flex gap-2 text-xs text-[#92400E] p-3 bg-[#FFF8E1] rounded">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {g.warning}
          </p>
        )}
        <p className="text-xs text-[#5C5E62]">
          The existing {SOLAR_ASSUMPTIONS.clearRoofSqftPerKw} sq.ft./kW allowance gives ~
          {Math.round(g.clearRoofPerPanelSqft)} sq.ft. per {PRODUCTS_CONFIG.module.ratedPowerW}W
          module, including indicative spacing. Physical glass occupies{" "}
          {g.moduleFootprintPerPanelSqft} sq.ft. per module. Narrow roof dimensions, obstacle
          positions, shade and row orientation can further reduce capacity.
        </p>
        <button
          type="button"
          disabled={Boolean(assessment.error)}
          className="min-h-11 w-full px-4 py-3 rounded bg-[#171A20] text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          onClick={() => onApplyKw?.(g.maxFeasibleKw, g.maxFeasiblePanels, g.netUsableSqft)}
        >
          Apply usable roof ({g.netUsableSqft.toLocaleString("en-IN")} sq.ft.)
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
        <p className="text-xs text-[#5C5E62]">
          Physical survey required: roof structure, wind loading, shade, waterproofing, electrical
          safety, access and DISCOM hosting approval are not established by this planner.
        </p>
      </div>
    </section>
  );
}
