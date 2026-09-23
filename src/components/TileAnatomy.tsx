import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ShieldCheck, Zap, Thermometer, CheckCircle2, ChevronRight, Eye } from "lucide-react";
import liquidGlassMacro from "@/assets/liquid_glass_macro.jpg";
import { openConsultationDrawer } from "./ConsultationDrawer";

type LayerDetail = {
  id: string;
  number: string;
  name: string;
  category: string;
  thickness: string;
  headlineSpec: string;
  description: string;
  technicalSpecs: { label: string; value: string }[];
  hudCoords: { x: string; y: string };
};

const LAYERS: LayerDetail[] = [
  {
    id: "layer-1",
    number: "01",
    name: "Dual-Tempered Diamond Glass",
    category: "SURFACE ARMOR & LIGHT INTAKE",
    thickness: "3.2 mm",
    headlineSpec: "99.2% Photon Transmittance",
    description:
      "Low-iron ultra-clear solar glass treated with nano-scale hydrophobic self-cleaning etching. Eliminates sunlight glare for aesthetic integration while repelling tropical monsoon silt, pollution, and dirt automatically.",
    technicalSpecs: [
      { label: "Refractive Index", value: "1.51 @ 589nm" },
      { label: "Impact Standard", value: "Class 4 Hail (50mm @ 140 km/h)" },
      { label: "Surface Treatment", value: "Nano-Hydrophobic Anti-Glare" },
      { label: "Fire Rating", value: "UL 790 Class A Non-Combustible" },
    ],
    hudCoords: { x: "25%", y: "20%" },
  },
  {
    id: "layer-2",
    number: "02",
    name: "Hexagonal N-Type TOPCon Matrix",
    category: "PHOTOVOLTAIC ENERGY CORE",
    thickness: "140 µm",
    headlineSpec: "24.8% Active Cell Efficiency",
    description:
      "Monolithic obsidian silicon crystal cells arranged in a seamless hexagonal lattice. Proprietary Zero-Busbar (0BB) micro-wire technology captures diffuse oblique sun at dawn and dusk, delivering 18% higher daily yield than conventional mono panels.",
    technicalSpecs: [
      { label: "Cell Architecture", value: "N-Type TOPCon Bifacial" },
      { label: "Temperature Coeff.", value: "-0.29% / °C" },
      { label: "Busbar Geometry", value: "0BB Invisible Micro-Grid" },
      { label: "Spectral Capture", value: "380nm – 1100nm Spectrum" },
    ],
    hudCoords: { x: "50%", y: "45%" },
  },
  {
    id: "layer-3",
    number: "03",
    name: "Aerospace Polymeric Damping Matrix",
    category: "THERMAL & VIBRATION ISOLATION",
    thickness: "0.8 mm",
    headlineSpec: "-40°C to +85°C Operational Range",
    description:
      "Elastic cross-linked fluoropolymer layer that absorbs thermal expansion during intense tropical Indian heatwaves. Prevents mechanical shear stress and eliminates silicon micro-cracking across 25 years of continuous exposure.",
    technicalSpecs: [
      { label: "Elastic Modulus", value: "18.5 MPa Dampened" },
      { label: "Dielectric Strength", value: "> 35 kV/mm" },
      { label: "Cyclic Endurance", value: "10,000 Thermal Cycles" },
      { label: "Moisture Vapor", value: "< 0.01 g/m²/day (Hermetic)" },
    ],
    hudCoords: { x: "65%", y: "65%" },
  },
  {
    id: "layer-4",
    number: "04",
    name: "Titanium Interlocking Structural Rail",
    category: "SUBSTRUCTURE & HERMETIC SEAL",
    thickness: "2.5 mm",
    headlineSpec: "Category 5 Wind Uplift Resilience",
    description:
      "Precision-machined aeronautical grade titanium-aluminum alloy framing. Interlocks seamlessly with adjacent tiles to create a 100% watertight roof barrier with zero roof-penetrating anchor screws and concealed conduit cabling.",
    technicalSpecs: [
      { label: "Material Alloy", value: "Ti-6Al-4V + Al-6061-T6" },
      { label: "Wind Uplift Rating", value: "ASTM E330 (320 km/h)" },
      { label: "Junction Seal", value: "IP68 Submersible Dual-O-Ring" },
      { label: "Roof Penetration", value: "Zero (Direct Purlin Interlock)" },
    ],
    hudCoords: { x: "80%", y: "80%" },
  },
];

export function TileAnatomy() {
  const [activeLayerIndex, setActiveLayerIndex] = useState(1);
  const activeLayer = LAYERS[activeLayerIndex];

  return (
    <section className="relative overflow-hidden bg-black py-28 md:py-40 border-t border-white/10">
      {/* Background ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#F57C00]/10 blur-[180px]"
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            <Layers className="h-3.5 w-3.5" />
            <span>LIQUID GLASS™ MONOLITHIC ANATOMY</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
            THE 4 LAYERS OF ARCHITECTURAL PERFECTION
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-white/70 md:text-base">
            Conventional solar is a fragile laminate of plastic backsheets and exposed copper busbars.
            WAVENOX Liquid Glass fuses four aerospace-grade materials into a monolithic, impermeable tile
            engineered to outlast the building it powers.
          </p>
        </div>

        {/* Main Interactive Stage (2-Column Grid) */}
        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          {/* Left Column: Visual Macro Inspection Viewer (Col 7) */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden border border-white/10 bg-black">
              {/* Macro Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={liquidGlassMacro}
                  alt="High-resolution macro inspection of WAVENOX hexagonal monocrystalline silicon crystal matrix"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />

                {/* Soft gradient mask overlay */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"
                  aria-hidden
                />

                {/* High-Tech HUD Pins */}
                {LAYERS.map((layer, idx) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setActiveLayerIndex(idx)}
                    style={{ left: layer.hudCoords.x, top: layer.hudCoords.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur-md transition-all duration-300 ${
                      activeLayerIndex === idx
                        ? "bg-[#F57C00] text-black ring-4 ring-[#F57C00]/30 shadow-lg shadow-[#F57C00]/40"
                        : "bg-black/70 border border-white/20 text-white/80 hover:border-white"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold">{layer.number}</span>
                    <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider">
                      {layer.name.split(" ")[0]}
                    </span>
                  </button>
                ))}

                {/* Live Inspection Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/80 px-3.5 py-1.5 backdrop-blur-md">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-white/80">
                    OPTICAL SCAN: {activeLayer.headlineSpec}
                  </span>
                </div>
              </div>

              {/* Technical Telemetry Panel Below Image */}
              <div className="border-t border-white/10 bg-white/[0.02] p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#F57C00]">
                      LAYER {activeLayer.number} / {activeLayer.category}
                    </span>
                    <h3 className="mt-1 text-xl font-bold uppercase tracking-tight text-white">
                      {activeLayer.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-white/50">LAYER DEPTH</span>
                    <div className="font-mono text-lg font-bold text-white">
                      {activeLayer.thickness}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-white/70">
                  {activeLayer.description}
                </p>

                {/* 4 Technical Data Rows */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/10 pt-6">
                  {activeLayer.technicalSpecs.map((spec) => (
                    <div
                      key={spec.label}
                      className="border border-white/5 bg-black/40 px-4 py-3"
                    >
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                        {spec.label}
                      </div>
                      <div className="mt-1 font-mono text-xs font-bold text-white">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Layer Stepper (Col 5) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-white/50 block mb-4">
              SELECT LAYER TO EXPLODE:
            </span>

            {LAYERS.map((layer, idx) => {
              const isSelected = activeLayerIndex === idx;
              return (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => setActiveLayerIndex(idx)}
                  className={`w-full text-left p-6 border transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? "border-[#F57C00] bg-white/[0.04] shadow-lg shadow-[#F57C00]/10"
                      : "border-white/10 bg-white/[0.01] hover:border-white/30 hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Subtle active left glow line */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F57C00]" />
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-mono text-sm font-bold ${
                          isSelected ? "text-[#F57C00]" : "text-white/40"
                        }`}
                      >
                        {layer.number}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-wide text-white">
                          {layer.name}
                        </h4>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                          {layer.headlineSpec}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isSelected
                          ? "translate-x-1 text-[#F57C00]"
                          : "text-white/30 group-hover:translate-x-0.5 group-hover:text-white"
                      }`}
                    />
                  </div>
                </button>
              );
            })}

            {/* VIP Action Block */}
            <div className="mt-8 border border-white/10 bg-white/[0.02] p-6">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#F57C00]">
                ARCHITECTURAL MATERIAL AUDIT
              </span>
              <p className="mt-2 text-xs leading-relaxed text-white/60">
                Experience the monolithic weight, optical clarity, and titanium lock of WAVENOX Liquid Glass firsthand. We dispatch physical sample presentation cases to accredited architects and estate principals.
              </p>
              <button
                type="button"
                onClick={() => openConsultationDrawer("villa")}
                className="mt-6 w-full cursor-pointer rounded-full bg-white py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-[#F57C00] hover:text-black"
              >
                REQUEST ARCHITECTURAL SAMPLE CASE →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
