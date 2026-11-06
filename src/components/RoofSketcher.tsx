import * as React from "react";
import { ArrowRight, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { PRODUCTS_CONFIG } from "@/config/products";
import {
  calculateRoofSketcherGeometry,
  type RoofSketcherGeometryResult,
} from "@/config/recommendation";

export interface RoofSketcherProps {
  onApplyKw?: (kw: number, panels: number, areaSqft: number) => void;
  className?: string;
  initialGrossSqft?: number;
  discomCode?: string;
  targetPanels?: number;
}

interface SampleRoofPreset {
  name: string;
  cityKey: string;
  cityLabel: string;
  lat: number;
  lng: number;
  defaultSqft: number;
}

const SAMPLE_ROOF_PRESETS: SampleRoofPreset[] = [
  {
    name: "Jubilee Hills (Sample)",
    cityKey: "hyderabad",
    cityLabel: "Hyderabad",
    lat: 17.4325,
    lng: 78.4071,
    defaultSqft: 2400,
  },
  {
    name: "Gachibowli (Sample)",
    cityKey: "hyderabad",
    cityLabel: "Hyderabad",
    lat: 17.4401,
    lng: 78.3489,
    defaultSqft: 1800,
  },
  {
    name: "Kokapet (Sample)",
    cityKey: "hyderabad",
    cityLabel: "Hyderabad",
    lat: 17.3912,
    lng: 78.3245,
    defaultSqft: 3200,
  },
  {
    name: "MVP Colony Vizag (Sample)",
    cityKey: "visakhapatnam",
    cityLabel: "Visakhapatnam",
    lat: 17.7442,
    lng: 83.3311,
    defaultSqft: 2000,
  },
  {
    name: "Indiranagar BLR (Sample)",
    cityKey: "bengaluru",
    cityLabel: "Bengaluru",
    lat: 12.9784,
    lng: 77.6408,
    defaultSqft: 1800,
  },
  {
    name: "Juhu Mumbai (Sample)",
    cityKey: "mumbai",
    cityLabel: "Mumbai",
    lat: 19.1075,
    lng: 72.8263,
    defaultSqft: 1600,
  },
];

export function RoofSketcher({
  onApplyKw,
  className = "",
  initialGrossSqft = 1800,
  discomCode = "TGSPDCL",
  targetPanels,
}: RoofSketcherProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<SampleRoofPreset>(
    SAMPLE_ROOF_PRESETS[0],
  );
  const [grossAreaSqft, setGrossAreaSqft] = React.useState(initialGrossSqft);
  const [parapetMarginFt, setParapetMarginFt] = React.useState(2); // 2 ft setback perimeter
  const [waterTankSqft, setWaterTankSqft] = React.useState(120); // 120 sq.ft mumty / water tank
  const [walkwaySqft, setWalkwaySqft] = React.useState(100); // 100 sq.ft maintenance pathway
  const [activeTab, setActiveTab] = React.useState<"interactive" | "satellite">("interactive");

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const leafletMapRef = React.useRef<{ remove: () => void } | null>(null);

  const geometry: RoofSketcherGeometryResult = React.useMemo(() => {
    return calculateRoofSketcherGeometry({
      grossAreaSqft,
      parapetMarginFt,
      waterTankSqft,
      walkwaySqft,
      discomCode,
      targetPanels,
    });
  }, [grossAreaSqft, parapetMarginFt, waterTankSqft, walkwaySqft, discomCode, targetPanels]);

  const {
    setbackDeductionSqft,
    totalDeductionsSqft,
    netUsableSqft,
    maxFeasiblePanels,
    maxFeasibleKw,
    physicalModuleFootprintSqft,
    recommendedClearRoofSqft,
    estimatedMonthlyKwh,
    estimatedAnnualKwh,
    annualYieldKwhPerKw,
    city,
    yieldStatus,
    warning,
    isZeroOrNegativeUsable,
  } = geometry;

  // Initialize Leaflet satellite map dynamically on client ONLY when satellite tab is opened
  React.useEffect(() => {
    if (activeTab !== "satellite") return;
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      try {
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (!isMounted || !mapContainerRef.current) return;

        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [selectedPreset.lat, selectedPreset.lng],
          zoom: 19,
          maxZoom: 20,
          zoomControl: true,
        });

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a>',
            maxZoom: 20,
          },
        ).addTo(map);

        L.circle([selectedPreset.lat, selectedPreset.lng], {
          color: "#F57C00",
          fillColor: "#F57C00",
          fillOpacity: 0.25,
          radius: 12,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<b>Sample Reference: ${selectedPreset.name}</b><br/>Illustrative Usable Area: ${netUsableSqft} sq.ft (Not your surveyed roof)`,
          );

        leafletMapRef.current = map;
      } catch (err) {
        console.warn("[RoofSketcher] Leaflet initialization error:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [activeTab, selectedPreset, netUsableSqft]);

  const handleApply = () => {
    if (onApplyKw) {
      onApplyKw(maxFeasibleKw, maxFeasiblePanels, netUsableSqft);
    }
  };

  return (
    <div
      className={`rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] overflow-hidden shadow-xs ${className}`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 border-b border-[#E3E4E6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4F4F4]/60">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-[3px]">
              Terrace Geometry Planner
            </span>
            <span className="text-[12px] text-[#5C5E62]">
              {PRODUCTS_CONFIG.module.ratedPowerW}W Module · 100 sq.ft./kW Clear Area Basis
            </span>
          </div>
          <h3 className="text-[16px] sm:text-[18px] font-medium text-[#171A20] leading-snug">
            Rooftop Area &amp; Obstruction Deduction Planner
          </h3>
          <p className="text-[12px] text-[#5C5E62] mt-0.5">
            Enter your approximate gross terrace area, subtract parapet setbacks, water tanks, and
            walkways, and check how many {PRODUCTS_CONFIG.module.ratedPowerW}W panels fit.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div
          role="radiogroup"
          aria-label="Roof view mode"
          className="flex items-center gap-1.5 self-start sm:self-auto bg-[#FFFFFF] border border-[#E3E4E6] p-1 rounded-[6px] shrink-0"
        >
          <button
            type="button"
            role="radio"
            aria-checked={activeTab === "interactive"}
            onClick={() => setActiveTab("interactive")}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
              activeTab === "interactive"
                ? "bg-[#171A20] text-[#FFFFFF]"
                : "text-[#5C5E62] hover:text-[#171A20]"
            }`}
          >
            Geometry Model
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={activeTab === "satellite"}
            onClick={() => setActiveTab("satellite")}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
              activeTab === "satellite"
                ? "bg-[#171A20] text-[#FFFFFF]"
                : "text-[#5C5E62] hover:text-[#171A20]"
            }`}
          >
            Sample Satellite Map
          </button>
        </div>
      </div>

      {/* Stacked Responsive Container (prevents narrow-column cramping inside /deploy) */}
      <div className="divide-y divide-[#E3E4E6]">
        {/* Top Section: Visualizer or Sample Satellite Map */}
        <div className="p-4 sm:p-5 bg-[#F8F9FA] space-y-4">
          {activeTab === "satellite" ? (
            <div className="space-y-3">
              <div className="p-2.5 rounded-[4px] bg-[#FFF8E1] border border-[#F59E0B]/40 text-[12px] text-[#92400E] flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
                <span>
                  <strong>Illustrative Sample Map Only:</strong> Map presets below show sample
                  residential coordinates for visual reference. They do not represent your actual
                  roof, automatic rooftop detection, or satellite shade analysis.
                </span>
              </div>
              <div className="relative w-full h-[280px] sm:h-[320px] rounded-[6px] overflow-hidden border border-[#E3E4E6]">
                <div ref={mapContainerRef} className="w-full h-full z-0" />
                <div className="absolute bottom-2 left-2 z-10 bg-[#FFFFFF]/90 backdrop-blur-xs px-2.5 py-1 rounded-[4px] text-[12px] text-[#5C5E62] border border-[#E3E4E6]">
                  Sample Map Preview · Tiles &copy; Esri World Imagery
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Dimension Breakdown Header (separated above canvas so labels never overlap modules) */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-[6px] bg-[#FFFFFF] border border-[#E3E4E6] text-[12px]">
                <div>
                  <span className="text-[#5C5E62] block">Gross Terrace</span>
                  <span className="font-mono font-semibold text-[#171A20]">
                    {grossAreaSqft.toLocaleString("en-IN")} sq.ft.
                  </span>
                </div>
                <div>
                  <span className="text-[#5C5E62] block">Total Deductions</span>
                  <span className="font-mono font-semibold text-[#B42318]">
                    -{totalDeductionsSqft.toLocaleString("en-IN")} sq.ft.
                  </span>
                </div>
                <div>
                  <span className="text-[#5C5E62] block">Net Solar Zone</span>
                  <span
                    className={`font-mono font-semibold ${
                      isZeroOrNegativeUsable ? "text-[#B42318]" : "text-[#1B5E20]"
                    }`}
                  >
                    {netUsableSqft.toLocaleString("en-IN")} sq.ft.
                  </span>
                </div>
              </div>

              {/* Architectural Rooftop Simulation Canvas */}
              <div className="relative w-full min-h-[190px] bg-[#FFFFFF] rounded-[6px] border border-[#E3E4E6] p-4 flex flex-col justify-between overflow-hidden">
                <div className="border-2 border-dashed border-[#5C5E62]/40 rounded-[4px] p-3 min-h-[156px] flex flex-col justify-between bg-[#F9FAFB]">
                  <div className="flex items-center justify-between gap-2 text-[12px] text-[#5C5E62] mb-2">
                    <span>
                      Parapet Setback: {parapetMarginFt} ft ({setbackDeductionSqft} sq.ft.)
                    </span>
                    <span className="px-2 py-0.5 rounded-[3px] bg-[#EF4444]/10 border border-[#EF4444]/40 text-[#B42318] font-mono">
                      Mumty / Tank: {waterTankSqft} sq.ft.
                    </span>
                  </div>

                  {maxFeasiblePanels > 0 ? (
                    <div
                      aria-label={`Simulated layout of ${maxFeasiblePanels} solar modules`}
                      className="bg-[#171A20]/5 border border-[#171A20]/30 rounded-[4px] p-2.5 flex flex-wrap gap-1.5 content-start min-h-[96px]"
                    >
                      {Array.from({ length: Math.min(36, maxFeasiblePanels) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-4 h-7 sm:w-5 sm:h-8 bg-[#171A20] rounded-[1px] border border-white/25 shadow-2xs"
                          title={`${PRODUCTS_CONFIG.module.ratedPowerW}W ${PRODUCTS_CONFIG.module.cellTypeShort || "TOPCon"}`}
                        />
                      ))}
                      {maxFeasiblePanels > 36 && (
                        <span className="self-center text-[12px] font-mono text-[#171A20] px-1.5">
                          +{maxFeasiblePanels - 36} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-[4px] border border-[#F59E0B]/50 bg-[#FFF8E1] p-3 text-center text-[12px] text-[#92400E] min-h-[96px] flex flex-col items-center justify-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                      <span className="font-medium">
                        0 Feasible Modules ({netUsableSqft} sq.ft. Net Usable Area)
                      </span>
                      <span>
                        Obstructions and setbacks leave insufficient clear space (~
                        {Math.round(geometry.clearRoofPerPanelSqft)} sq.ft. needed per{" "}
                        {PRODUCTS_CONFIG.module.ratedPowerW}W module).
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sample Reference Presets (Explicitly labeled as examples) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[12px] text-[#5C5E62] font-medium">
              Sample Roof Sizes (Examples Only):
            </span>
            {SAMPLE_ROOF_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setSelectedPreset(preset);
                  setGrossAreaSqft(preset.defaultSqft);
                }}
                className={`px-2.5 py-1 text-[12px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                  selectedPreset.name === preset.name && grossAreaSqft === preset.defaultSqft
                    ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                    : "border-[#E3E4E6] bg-[#FFFFFF] text-[#5C5E62] hover:border-[#171A20]/40"
                }`}
              >
                {preset.name} · {preset.defaultSqft.toLocaleString("en-IN")} sq.ft.
              </button>
            ))}
          </div>

          {/* Results Summary Bar */}
          <div className="pt-3 border-t border-[#E3E4E6] grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center bg-[#FFFFFF] p-3 rounded-[6px] border">
            <div>
              <span className="text-[12px] text-[#5C5E62] block">Max Feasible Panels</span>
              <span className="text-[16px] sm:text-[18px] font-semibold text-[#171A20] tabular-nums">
                {maxFeasiblePanels} Units
              </span>
            </div>
            <div>
              <span className="text-[12px] text-[#5C5E62] block">Max Roof Capacity</span>
              <span className="text-[16px] sm:text-[18px] font-semibold text-[#B45309] tabular-nums">
                {maxFeasibleKw} kW
              </span>
            </div>
            <div>
              <span className="text-[12px] text-[#5C5E62] block">Module Footprint</span>
              <span className="text-[14px] sm:text-[16px] font-medium text-[#171A20] tabular-nums">
                {physicalModuleFootprintSqft.toLocaleString("en-IN")} sq.ft.
              </span>
              <span className="text-[12px] text-[#5C5E62] block">
                (~{recommendedClearRoofSqft} sq.ft. w/ spacing)
              </span>
            </div>
            <div>
              <span className="text-[12px] text-[#5C5E62] block">Est. Monthly Gen ({city})</span>
              <span className="text-[16px] sm:text-[18px] font-semibold text-[#171A20] tabular-nums">
                {yieldStatus === "UNAVAILABLE"
                  ? "Requires Review"
                  : `~${estimatedMonthlyKwh.toLocaleString("en-IN")} kWh`}
              </span>
              {yieldStatus !== "UNAVAILABLE" && (
                <span className="text-[12px] text-[#5C5E62] block">
                  ({annualYieldKwhPerKw} kWh/kWp/yr · ~{estimatedAnnualKwh.toLocaleString("en-IN")}{" "}
                  kWh/yr)
                </span>
              )}
            </div>
          </div>

          {/* Feasibility Warning or Confirmation Banner */}
          {warning ? (
            <div
              role="status"
              className="p-3 rounded-[6px] bg-[#FFF8E1] border border-[#F59E0B]/40 text-[12px] text-[#92400E] flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
              <span>{warning}</span>
            </div>
          ) : (
            <div
              role="status"
              className="p-3 rounded-[6px] bg-[#E8F5E9] border border-[#2E7D32]/30 text-[12px] text-[#1B5E20] flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#2E7D32]" />
              <span>
                Your {netUsableSqft.toLocaleString("en-IN")} sq.ft. net usable terrace area can
                accommodate up to <strong>{maxFeasiblePanels} modules</strong> (
                <strong>{maxFeasibleKw} kW</strong>) allowing ~
                {recommendedClearRoofSqft.toLocaleString("en-IN")} sq.ft. of shadow-free
                installation area (including inter-row tilt spacing around{" "}
                {physicalModuleFootprintSqft.toLocaleString("en-IN")} sq.ft. of physical glass
                area).
              </span>
            </div>
          )}
        </div>

        {/* Bottom Section: Deduction & Setback Controls */}
        <div className="p-4 sm:p-5 space-y-4 bg-[#FFFFFF]">
          <h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#171A20]">
            Terrace Boundary &amp; Obstruction Inputs
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Gross Rooftop Area Slider + Direct Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-[13px]">
                <label htmlFor="gross-terrace-slider" className="font-medium text-[#171A20]">
                  Gross Terrace Area
                </label>
                <span className="font-mono text-[#171A20] font-semibold">
                  {grossAreaSqft.toLocaleString("en-IN")} sq.ft.
                </span>
              </div>
              <input
                id="gross-terrace-slider"
                type="range"
                min={0}
                max={8000}
                step={50}
                value={grossAreaSqft}
                onChange={(e) => setGrossAreaSqft(Number(e.target.value))}
                aria-label="Gross Terrace Area in square feet"
                aria-valuetext={`${grossAreaSqft} square feet`}
                className="range-slider w-full"
              />
              <div className="flex justify-between text-[12px] text-[#5C5E62]">
                <span>0 sq.ft.</span>
                <span>8,000 sq.ft.</span>
              </div>
            </div>

            {/* 2. Parapet & Boundary Setback */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-[13px]">
                <label htmlFor="setback-slider" className="font-medium text-[#171A20]">
                  Parapet Setback Perimeter
                </label>
                <span className="font-mono text-[#5C5E62]">
                  {parapetMarginFt} ft (-{setbackDeductionSqft} sq.ft.)
                </span>
              </div>
              <input
                id="setback-slider"
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={parapetMarginFt}
                onChange={(e) => setParapetMarginFt(Number(e.target.value))}
                aria-label="Parapet setback in feet"
                aria-valuetext={`${parapetMarginFt} feet`}
                className="range-slider w-full"
              />
              <div className="flex justify-between text-[12px] text-[#5C5E62]">
                <span>0 ft</span>
                <span>5 ft perimeter</span>
              </div>
            </div>

            {/* 3. Water Tank & Mumty Footprint */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-[13px]">
                <label htmlFor="tank-slider" className="font-medium text-[#171A20]">
                  Water Tank &amp; Mumty Footprint
                </label>
                <span className="font-mono text-[#5C5E62]">-{waterTankSqft} sq.ft.</span>
              </div>
              <input
                id="tank-slider"
                type="range"
                min={0}
                max={600}
                step={10}
                value={waterTankSqft}
                onChange={(e) => setWaterTankSqft(Number(e.target.value))}
                aria-label="Water tank footprint deduction"
                aria-valuetext={`${waterTankSqft} square feet`}
                className="range-slider w-full"
              />
            </div>

            {/* 4. Maintenance Pathway */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-[13px]">
                <label htmlFor="walkway-slider" className="font-medium text-[#171A20]">
                  Maintenance Walkway Allowance
                </label>
                <span className="font-mono text-[#5C5E62]">-{walkwaySqft} sq.ft.</span>
              </div>
              <input
                id="walkway-slider"
                type="range"
                min={0}
                max={400}
                step={10}
                value={walkwaySqft}
                onChange={(e) => setWalkwaySqft(Number(e.target.value))}
                aria-label="Maintenance walkway deduction"
                aria-valuetext={`${walkwaySqft} square feet`}
                className="range-slider w-full"
              />
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleApply}
              className="w-full h-11 px-4 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[13px] sm:text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-[#171A20]/90 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#171A20]"
            >
              <span>
                {maxFeasiblePanels >= 6
                  ? `Apply Usable Roof (${netUsableSqft.toLocaleString("en-IN")} sq.ft. · Up to ${maxFeasibleKw} kW / ${maxFeasiblePanels} Panels)`
                  : `Apply Constrained Roof Area (${netUsableSqft.toLocaleString("en-IN")} sq.ft. Usable) to Studio`}
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <p className="text-[12px] text-[#5C5E62] bg-[#F4F4F4] p-2.5 rounded-[4px] mt-2.5 leading-relaxed">
              <strong>Engineering Note:</strong> Physical {PRODUCTS_CONFIG.module.ratedPowerW}W
              module area is {geometry.moduleFootprintPerPanelSqft} sq.ft./panel, while recommended
              clear installation area is ~{Math.round(geometry.clearRoofPerPanelSqft)} sq.ft./panel
              (100 sq.ft./kW) to prevent inter-row tilt shading. This 2D estimate does not replace a
              physical structural survey, 3D horizon shade analysis, or DISCOM sanction approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
