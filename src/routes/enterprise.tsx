import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, TrendingUp, ShieldCheck, Zap, Building2, Factory, Warehouse } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";
import { computeSolarYield, SOLAR_SPECS } from "@/config/solar";
import { BRAND_CONFIG } from "@/config/brand";

const ENTERPRISE_ASSETS = {
  hero: "https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=2400&q=80",
  industrialPark: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1600&q=80",
  warehouse: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
  carport: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1600&q=80",
};

export const Route = createFileRoute("/enterprise")({
  head: () => ({
    meta: [
      { title: `Commercial & Industrial Megawatt Solar — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Turn idle industrial rooftops into high-yield capital assets. Accelerated 40% tax depreciation, zero-downtime microgrids, and guaranteed 25-year performance.",
      },
      { property: "og:title", content: `Commercial & Industrial Solar — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Megawatt-scale rooftop infrastructure, corporate ESG compliance, and 40% Section 32 tax write-offs.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: EnterprisePage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

function EnterpriseHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black flex items-center pt-28 pb-20">
      <img
        src={ENTERPRISE_ASSETS.hero}
        alt="Megawatt commercial solar rooftop array on corporate industrial headquarters"
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        loading="eager"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black"
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 w-full">
        <motion.div {...fadeUp} className="max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            COMMERCIAL & INDUSTRIAL INFRASTRUCTURE
          </span>
          <h1 className="mt-4 text-4xl font-bold uppercase leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            MEGAWATT SOLAR ASSETS. ZERO COMPROMISE.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
            Convert expansive corporate rooftops and manufacturing facilities into captive power plants.
            Cut operational electricity expenses by up to 80% while claiming 40% accelerated tax depreciation under Section 32.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => openConsultationDrawer("commercial")}
              className="cursor-pointer rounded-full bg-[#F57C00] px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white"
            >
              COMMISSION MW FEASIBILITY STUDY →
            </button>
            <a
              href="#commercial-calculator"
              className="rounded-full border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-white hover:bg-white/5"
            >
              ESTIMATE 25-YEAR ROI ↓
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const SECTORS = [
  {
    icon: Factory,
    title: "Heavy Manufacturing & Plants",
    desc: "300kW to 5MW captive solar installations designed for continuous 3-phase machinery, heavy peak-load shedding, and grid synchronised inverters.",
    stat: "Up to 80% Bill Slash",
  },
  {
    icon: Warehouse,
    title: "Warehousing & Logistics Hubs",
    desc: "Lightweight standing-seam clamp solar arrays engineered without roof penetration. Water-tight structural integrity guaranteed for 25 years.",
    stat: "Zero Roof Penetration",
  },
  {
    icon: Building2,
    title: "Corporate Tech Parks & Hospitals",
    desc: "Aesthetic glass-glass BIPV architectural solar facades and elevated solar carports with integrated EV supercharging stations.",
    stat: "40% Year 1 Tax Shield",
  },
];

function SectorMatrix() {
  return (
    <section className="bg-black py-24 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div {...fadeUp} className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            DEPLOYMENT PROFILES
          </span>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
            BUILT FOR INDUSTRIAL HEAVYWEIGHTS
          </h2>
          <p className="mt-4 text-sm text-white/60 md:text-base">
            Engineered to meet the stringent power stability and safety standards of Fortune 500 manufacturing plants and commercial real estate.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {SECTORS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                {...fadeUp}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="group relative border border-white/10 bg-white/[0.02] p-8 transition-colors duration-500 hover:border-[#F57C00]/50 hover:bg-white/[0.04]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black text-[#F57C00]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-bold uppercase tracking-tight text-white">
                  {s.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/60">
                  {s.desc}
                </p>
                <div className="mt-8 border-t border-white/10 pt-4">
                  <span className="font-mono text-xs font-semibold tracking-wider text-[#F57C00]">
                    {s.stat}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Section32TaxBenefit() {
  return (
    <section className="relative overflow-hidden bg-black py-24 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
              CORPORATE TAX ADVANTAGE
            </span>
            <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
              SECTION 32 ACCELERATED DEPRECIATION
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-white/70 md:text-base">
              Under Section 32 of the Indian Income Tax Act, commercial & industrial businesses can claim up to{" "}
              <strong className="text-white font-semibold">40% Accelerated Depreciation</strong> on commercial solar asset investments in Year 1.
            </p>
            <div className="mt-8 space-y-4">
              {[
                "Substantial immediate reduction in corporate income tax liability.",
                "Capital expenditure recovered within 3.2 to 3.8 operational years.",
                "Zero tariff escalation risk against state utility rate hikes for 25 years.",
                "Eligible for 100% Green Energy Open Access and ESG accreditation.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#F57C00] mt-0.5" />
                  <span className="text-sm text-white/80">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <button
                type="button"
                onClick={() => openConsultationDrawer("commercial")}
                className="cursor-pointer rounded-full border border-white/30 bg-transparent px-8 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-[#F57C00] hover:bg-[#F57C00] hover:text-black"
              >
                REQUEST CORPORATE TAX SCHEDULE →
              </button>
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="border border-white/10 bg-white/[0.02] p-8 md:p-12">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-white/50">
              ILLUSTRATIVE MW-TIER CAPITAL MODEL
            </h3>
            <div className="mt-8 space-y-6">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-sm text-white/60">Asset Capacity</span>
                <span className="font-mono text-sm font-bold text-white">500 kW Rooftop Array</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-sm text-white/60">Annual Generation</span>
                <span className="font-mono text-sm font-bold text-white">~800,000 Units (kWh)</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-sm text-white/60">Annual Power Cost Savings</span>
                <span className="font-mono text-sm font-bold text-[#F57C00]">₹72,00,000 / Year</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-sm text-white/60">Year 1 Tax Shield (40% Dep.)</span>
                <span className="font-mono text-sm font-bold text-white">₹78,00,000 Write-off</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-sm text-white/60">Estimated Payback Period</span>
                <span className="font-mono text-sm font-bold text-emerald-400">3.4 Years</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-sm text-white/60">25-Year Net Corporate Gain</span>
                <span className="font-mono text-lg font-bold text-[#F57C00]">₹18.4+ Crores</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CommercialCalculator() {
  const [roofArea, setRoofArea] = useState(25000); // 25,000 sq.ft default commercial roof
  const [tariff, setTariff] = useState(9.5); // ₹9.5/kWh industrial average

  const metrics = useMemo(() => {
    return computeSolarYield({
      roofAreaSqFt: roofArea,
      tariffRatePerKwh: tariff,
    });
  }, [roofArea, tariff]);

  const annualSavingsLakhs = (metrics.annualUnitsGenerated * tariff) / 100000;
  const twentyFiveYearCrores = (metrics.twentyFiveYearNetSavingsInr / 10000000).toFixed(2);

  return (
    <section id="commercial-calculator" className="bg-black py-24 md:py-36 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div {...fadeUp} className="text-center max-w-3xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#F57C00]">
            DYNAMIC MW FINANCIAL ENGINE
          </span>
          <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl">
            CALCULATE YOUR INDUSTRIAL RETURN
          </h2>
          <p className="mt-4 text-sm text-white/60 md:text-base">
            Slide your industrial rooftop or warehouse footprint to see instantaneous capacity, annual unit output, and 25-year corporate wealth generated.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Controls */}
          <div className="lg:col-span-6 border border-white/10 bg-white/[0.02] p-8 md:p-10">
            <div>
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-mono uppercase tracking-widest text-white/70">
                  Rooftop / Shed Surface Area
                </label>
                <span className="font-mono text-lg font-bold text-[#F57C00]">
                  {roofArea.toLocaleString("en-IN")} sq.ft
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="2500"
                value={roofArea}
                onChange={(e) => setRoofArea(Number(e.target.value))}
                className="mt-6 w-full accent-[#F57C00] cursor-pointer"
              />
              <div className="mt-2 flex justify-between text-[10px] font-mono text-white/40">
                <span>5,000 sq.ft</span>
                <span>50,000 sq.ft</span>
                <span>100,000 sq.ft</span>
              </div>
            </div>

            <div className="mt-12">
              <div className="flex justify-between items-baseline">
                <label className="text-xs font-mono uppercase tracking-widest text-white/70">
                  Commercial Tariff Rate
                </label>
                <span className="font-mono text-lg font-bold text-white">
                  ₹{tariff.toFixed(1)} / kWh
                </span>
              </div>
              <input
                type="range"
                min="7.0"
                max="14.0"
                step="0.5"
                value={tariff}
                onChange={(e) => setTariff(Number(e.target.value))}
                className="mt-6 w-full accent-[#F57C00] cursor-pointer"
              />
              <div className="mt-2 flex justify-between text-[10px] font-mono text-white/40">
                <span>₹7.0/kWh</span>
                <span>₹10.5/kWh</span>
                <span>₹14.0/kWh</span>
              </div>
            </div>

            <div className="mt-12 border-t border-white/10 pt-6">
              <p className="text-xs leading-relaxed text-white/50">
                * Based on {SOLAR_SPECS.annualSunlightHours} effective solar radiation hours/yr in Central & South India with {SOLAR_SPECS.annualDegradationPct}% annual cell degradation over 25 years.
              </p>
            </div>
          </div>

          {/* Results Display */}
          <div className="lg:col-span-6 flex flex-col justify-between border border-[#F57C00]/30 bg-black p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-[#F57C00]/10 blur-3xl pointer-events-none" />

            <div>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#F57C00]">
                PROJECTED METRICS
              </span>
              <div className="mt-8 grid grid-cols-2 gap-6 border-b border-white/10 pb-8">
                <div>
                  <span className="text-[11px] font-mono uppercase text-white/50">Array Capacity</span>
                  <div className="mt-2 font-mono text-3xl font-bold text-white">
                    {metrics.capacityKw.toFixed(1)} <span className="text-sm font-normal text-white/60">kWp</span>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-white/50">Annual Generation</span>
                  <div className="mt-2 font-mono text-3xl font-bold text-white">
                    {Math.round(metrics.annualUnitsGenerated).toLocaleString("en-IN")}{" "}
                    <span className="text-sm font-normal text-white/60">kWh</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-white/70">Annual Electricity Savings</span>
                  <span className="font-mono text-lg font-bold text-[#F57C00]">
                    ₹{annualSavingsLakhs.toFixed(2)} Lakhs / yr
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-white/70">25-Year Cumulative Wealth</span>
                  <span className="font-mono text-2xl font-bold text-white">
                    ₹{twentyFiveYearCrores} Crores
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => openConsultationDrawer("commercial")}
                className="w-full cursor-pointer rounded-full bg-[#F57C00] py-4 text-xs font-bold uppercase tracking-[0.25em] text-black transition-all duration-300 hover:bg-white"
              >
                REQUEST FORMAL EPC FEASIBILITY DOSSIER →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function EnterprisePage() {
  return (
    <main className="min-h-screen w-full bg-black">
      <Header />
      <EnterpriseHero />
      <SectorMatrix />
      <Section32TaxBenefit />
      <CommercialCalculator />
      <Footer />
    </main>
  );
}
