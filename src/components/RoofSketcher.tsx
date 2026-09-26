import * as React from "react";
import {
  Compass,
  MapPin,
  Ruler,
  Layers,
  ArrowRight,
  Maximize2,
  Trash2,
  ShieldAlert,
  Info,
} from "lucide-react";
import { PRODUCTS_CONFIG } from "@/config/products";

export interface RoofSketcherProps {
  onApplyKw?: (kw: number, panels: number, areaSqft: number) => void;
  className?: string;
  initialGrossSqft?: number;
}

const HYDERABAD_PRESETS = [
  { name: "Jubilee Hills", lat: 17.4325, lng: 78.4071, defaultSqft: 2400 },
  { name: "Gachibowli", lat: 17.4401, lng: 78.3489, defaultSqft: 1800 },
  { name: "Banjara Hills", lat: 17.4156, lng: 78.4352, defaultSqft: 2800 },
  { name: "Kokapet", lat: 17.3912, lng: 78.3245, defaultSqft: 3200 },
  { name: "Madhapur", lat: 17.4483, lng: 78.3915, defaultSqft: 1500 },
];

export function RoofSketcher({
  onApplyKw,
  className = "",
  initialGrossSqft = 2200,
}: RoofSketcherProps) {
  const [selectedPreset, setSelectedPreset] = React.useState(HYDERABAD_PRESETS[0]);
  const [grossAreaSqft, setGrossAreaSqft] = React.useState(initialGrossSqft);
  const [parapetMarginFt, setParapetMarginFt] = React.useState(2); // 2 ft setback perimeter
  const [waterTankSqft, setWaterTankSqft] = React.useState(120); // 120 sq.ft mumty / water tank
  const [walkwaySqft, setWalkwaySqft] = React.useState(100); // 100 sq.ft maintenance pathway
  const [activeTab, setActiveTab] = React.useState<"interactive" | "satellite">("interactive");

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const leafletMapRef = React.useRef<{ remove: () => void } | null>(null);

  // Net usable area computation
  const setbackDeductionSqft = React.useMemo(() => {
    // Approximate perimeter of terrace = 4 * sqrt(grossArea)
    const approxPerimeter = 4 * Math.sqrt(grossAreaSqft);
    return Math.round(approxPerimeter * parapetMarginFt);
  }, [grossAreaSqft, parapetMarginFt]);

  const netUsableSqft = React.useMemo(() => {
    const net = grossAreaSqft - setbackDeductionSqft - waterTankSqft - walkwaySqft;
    return Math.max(200, net);
  }, [grossAreaSqft, setbackDeductionSqft, waterTankSqft, walkwaySqft]);

  // Sizing physics: 1 x 550W panel = ~28 sq.ft + spacing allowance = 32 sq.ft/panel
  const SQFT_PER_PANEL = 32;
  const panelCount = Math.floor(netUsableSqft / SQFT_PER_PANEL);
  const estimatedKw = Number(((panelCount * PRODUCTS_CONFIG.module.ratedPowerW) / 1000).toFixed(2));
  const estimatedMonthlyKwh = Math.round(estimatedKw * (1490 / 12));

  // Initialize Leaflet satellite map dynamically on client
  React.useEffect(() => {
    if (activeTab !== "satellite") return;
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      try {
        const L = (await import("leaflet")).default;
        // Import leaflet stylesheet dynamically
        await import("leaflet/dist/leaflet.css");

        if (!isMounted || !mapContainerRef.current) return;

        // Clean up previous instance
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

        // Esri World Imagery Satellite Tiles
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              'Tiles &copy; <a href="https://www.esri.com" target="_blank" rel="noreferrer">Esri</a>',
            maxZoom: 20,
          },
        ).addTo(map);

        // Marker for target rooftop
        L.circle([selectedPreset.lat, selectedPreset.lng], {
          color: "#F57C00",
          fillColor: "#F57C00",
          fillOpacity: 0.25,
          radius: 12,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<b>${selectedPreset.name} Rooftop</b><br/>Usable Area: ${netUsableSqft} sq.ft`,
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
      onApplyKw(estimatedKw, panelCount, netUsableSqft);
    }
  };

  return (
    <div
      className={`rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] overflow-hidden shadow-xs ${className}`}
    >
      {/* Header Bar */}
      <div className="p-5 border-b border-[#E3E4E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4F4F4]/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[12px] font-semibold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded-[3px]">
              Terrace Geometry Engine
            </span>
            <span className="text-[12px] text-[#5C5E62]">Satellite Roof Sizer</span>
          </div>
          <h3 className="text-[16px] sm:text-[18px] font-medium text-[#171A20] leading-snug">
            Satellite Roof Layout &amp; Obstruction Deduction
          </h3>
          <p className="text-[12px] text-[#5C5E62] mt-0.5">
            Draw or adjust your terrace boundary, subtract setbacks &amp; water tank footprints, and
            calculate maximum solar capacity.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div
          role="radiogroup"
          aria-label="Roof view mode"
          className="flex items-center gap-1.5 self-start sm:self-auto bg-[#FFFFFF] border border-[#E3E4E6] p-1 rounded-[6px]"
        >
          <button
            type="button"
            role="radio"
            aria-checked={activeTab === "interactive"}
            onClick={() => setActiveTab("interactive")}
            className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
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
            className={`px-3 py-1 text-[12px] font-medium rounded-[4px] transition-colors cursor-pointer ${
              activeTab === "satellite"
                ? "bg-[#171A20] text-[#FFFFFF]"
                : "text-[#5C5E62] hover:text-[#171A20]"
            }`}
          >
            Satellite View
          </button>
        </div>
      </div>

      {/* Main Grid: Visualizer + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E3E4E6]">
        {/* Left Column: Interactive Diagram or Satellite Map */}
        <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-[#F8F9FA] min-h-[380px]">
          {activeTab === "satellite" ? (
            <div className="relative w-full h-[340px] rounded-[6px] overflow-hidden border border-[#E3E4E6]">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              <div className="absolute bottom-2 left-2 z-10 bg-[#FFFFFF]/90 backdrop-blur-xs px-2.5 py-1 rounded-[4px] text-[12px] text-[#5C5E62] border border-[#E3E4E6]">
                Map Tiles &copy; Esri World Imagery
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Architectural Rooftop Simulation Canvas */}
              <div className="relative w-full aspect-[16/10] bg-[#FFFFFF] rounded-[6px] border border-[#E3E4E6] p-4 flex flex-col justify-between overflow-hidden">
                {/* Terrace Perimeter Visualizer */}
                <div className="absolute inset-4 border-2 border-dashed border-[#5C5E62]/40 rounded-[4px] flex items-center justify-center">
                  {/* Solar Array Zone */}
                  <div className="w-[82%] h-[78%] bg-[#171A20]/5 border border-[#171A20] rounded-[3px] p-2 relative flex flex-wrap gap-1 content-start overflow-hidden">
                    {/* Simulated Solar Panel Modules */}
                    {Array.from({ length: Math.min(36, panelCount) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-5 h-8 bg-[#171A20] rounded-[1px] border border-white/20 shadow-2xs"
                        title="550W Monocrystalline TOPCon"
                      />
                    ))}

                    {/* Water Tank Footprint Overlay */}
                    <div className="absolute top-2 right-2 w-14 h-14 bg-[#EF4444]/15 border border-[#EF4444] rounded-[2px] flex items-center justify-center text-[12px] text-[#DC2626] font-mono text-center p-1 leading-none">
                      Mumty / Tank
                    </div>
                  </div>
                </div>

                {/* Overlaid Dimension Badges */}
                <div className="relative z-10 flex justify-between items-center text-[12px] text-[#5C5E62] font-mono">
                  <span>Gross: {grossAreaSqft.toLocaleString("en-IN")} sq.ft</span>
                  <span className="text-[#171A20] font-semibold">
                    Net Solar Zone: {netUsableSqft.toLocaleString("en-IN")} sq.ft
                  </span>
                </div>
              </div>

              {/* District Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[12px] text-[#5C5E62] font-medium uppercase tracking-wider">
                  Hyderabad Hubs:
                </span>
                {HYDERABAD_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(preset);
                      setGrossAreaSqft(preset.defaultSqft);
                    }}
                    className={`px-2.5 py-1 text-[12px] font-medium rounded-[4px] border transition-colors cursor-pointer ${
                      selectedPreset.name === preset.name
                        ? "border-[#171A20] bg-[#171A20] text-[#FFFFFF]"
                        : "border-[#E3E4E6] bg-[#FFFFFF] text-[#5C5E62] hover:border-[#171A20]/40"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Summary Bar */}
          <div className="mt-4 pt-3 border-t border-[#E3E4E6] grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[12px] text-[#5C5E62] block">Usable Panels</span>
              <span className="text-[18px] font-medium text-[#171A20] tabular-nums">
                {panelCount} Units
              </span>
            </div>
            <div>
              <span className="text-[12px] text-[#5C5E62] block">Maximum Capacity</span>
              <span className="text-[18px] font-medium text-[#F57C00] tabular-nums">
                {estimatedKw} kW
              </span>
            </div>
            <div>
              <span className="text-[12px] text-[#5C5E62] block">Est. Monthly Gen</span>
              <span className="text-[18px] font-medium text-[#171A20] tabular-nums">
                {estimatedMonthlyKwh} kWh
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Deduction & Setback Controls */}
        <div className="lg:col-span-5 p-6 space-y-5 bg-[#FFFFFF]">
          <h4 className="text-[14px] font-semibold uppercase tracking-wider text-[#171A20]">
            Terrace Boundary &amp; Obstruction Inputs
          </h4>

          {/* 1. Gross Rooftop Area Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-[13px]">
              <label htmlFor="gross-terrace-slider" className="font-medium text-[#171A20]">
                Gross Terrace Area
              </label>
              <span className="font-mono text-[#171A20] font-semibold">
                {grossAreaSqft.toLocaleString("en-IN")} sq.ft
              </span>
            </div>
            <input
              id="gross-terrace-slider"
              type="range"
              min={600}
              max={8000}
              step={50}
              value={grossAreaSqft}
              onChange={(e) => setGrossAreaSqft(Number(e.target.value))}
              aria-label="Gross Terrace Area in square feet"
              aria-valuetext={`${grossAreaSqft} square feet`}
              className="range-slider w-full"
            />
            <div className="flex justify-between text-[12px] text-[#5C5E62]">
              <span>600 sq.ft</span>
              <span>8,000 sq.ft</span>
            </div>
          </div>

          {/* 2. Parapet & Boundary Setback */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-[13px]">
              <label htmlFor="setback-slider" className="font-medium text-[#171A20]">
                Parapet Setback Perimeter
              </label>
              <span className="font-mono text-[#5C5E62]">
                {parapetMarginFt} ft ({setbackDeductionSqft} sq.ft deducted)
              </span>
            </div>
            <input
              id="setback-slider"
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={parapetMarginFt}
              onChange={(e) => setParapetMarginFt(Number(e.target.value))}
              aria-label="Parapet setback in feet"
              aria-valuetext={`${parapetMarginFt} feet`}
              className="range-slider w-full"
            />
          </div>

          {/* 3. Water Tank & Mumty Footprint */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-[13px]">
              <label htmlFor="tank-slider" className="font-medium text-[#171A20]">
                Water Tank &amp; Mumty Footprint
              </label>
              <span className="font-mono text-[#5C5E62]">{waterTankSqft} sq.ft</span>
            </div>
            <input
              id="tank-slider"
              type="range"
              min={0}
              max={400}
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
              <span className="font-mono text-[#5C5E62]">{walkwaySqft} sq.ft</span>
            </div>
            <input
              id="walkway-slider"
              type="range"
              min={0}
              max={300}
              step={10}
              value={walkwaySqft}
              onChange={(e) => setWalkwaySqft(Number(e.target.value))}
              aria-label="Maintenance walkway deduction"
              aria-valuetext={`${walkwaySqft} square feet`}
              className="range-slider w-full"
            />
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleApply}
              className="w-full h-11 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-[#171A20]/90 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#171A20]"
            >
              <span>Size Solar Studio to {estimatedKw} kW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[12px] text-[#5C5E62] text-center mt-2">
              Transfers roof dimensions directly to the design studio calculation engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
