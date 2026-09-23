import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Sun, Zap, Battery, Sparkles, Building2, Home, Layers, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ConsultationDrawer, openConsultationDrawer } from "@/components/ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";
import resHero01 from "@/assets/res-hero-01.jpg";
import resHero02 from "@/assets/res-hero-02.jpg";
import resTile from "@/assets/res-tile.jpg";

export const Route = createFileRoute("/residential")({
  head: () => ({
    meta: [
      { title: `Solar for Luxury Homes & Estates — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Autonomous architectural solar for the world's most exclusive residences. Seamless black-glass aesthetics, 100% net-metering offset, and Omnigrid blackout protection.",
      },
      { property: "og:title", content: `Solar for Luxury Homes & Estates — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Architectural solar elegance for luxury villas, penthouses, and private estates in India.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ResidentialPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

function ResidentialPage() {
  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-white">
      <Header />

      {/* =========================================================================
          HERO: 100vh Full-Bleed Twilight Estate Architecture
          ========================================================================= */}
      <section className="relative min-h-screen w-full overflow-hidden bg-[#171A20]">
        <img
          src={resHero01}
          alt="Ultra-modern luxury villa at twilight with seamless integrated solar roof"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-between px-6 pt-32 pb-16 text-center lg:px-12">
          {/* Centered Typography */}
          <div className="my-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/75">
                RESIDENTIAL SOLAR ARCHITECTURE
              </span>
              <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white">
                Solar for Luxury Estates
              </h1>
              <p className="mt-4 text-base sm:text-lg text-white/80 font-normal max-w-xl mx-auto leading-relaxed">
                Architectural elegance meets unyielding energy sovereignty. Zero visible conduits, 100% utility bill offset, and uninterrupted power.
              </p>
            </motion.div>
          </div>

          {/* Bottom Floating Specs Dock & Dual Pills */}
          <div className="w-full max-w-4xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-3 gap-4 text-center divide-x divide-white/20 text-white py-4 backdrop-blur-md bg-black/40 rounded-2xl border border-white/10"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">100%</div>
                <div className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider mt-0.5">
                  Monthly Bill Offset
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight">25-Year</div>
                <div className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider mt-0.5">
                  Linear Warranty
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-emerald-400">
                  ₹78,000
                </div>
                <div className="text-[11px] sm:text-xs text-white/70 uppercase tracking-wider mt-0.5">
                  PM Surya Ghar Credit
                </div>
              </div>
            </motion.div>

            {/* Dual CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/deploy" className="tesla-pill-primary w-full sm:w-auto text-sm cursor-pointer">
                Design Your System
              </Link>
              <button
                type="button"
                onClick={() => openConsultationDrawer("villa")}
                className="tesla-pill-glass w-full sm:w-auto text-sm cursor-pointer"
              >
                Schedule Virtual Consultation
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: Seamless Architectural Integration (Pure White #FFFFFF)
          ========================================================================= */}
      <section className="w-full bg-[#FFFFFF] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Frame */}
            <motion.div {...fadeUp} className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-[#F8F8FA]">
                <img
                  src={resTile}
                  alt="Precision engineering of WAVENOX liquid glass solar tile"
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>
            </motion.div>

            {/* Narrative & Feature Highlights */}
            <motion.div {...fadeUp} className="lg:col-span-5 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                DESIGN & ARCHITECTURE
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
                Engineered for the Modern Villa
              </h2>
              <p className="text-sm sm:text-base text-[#5C5E62] leading-relaxed">
                WAVENOX residential arrays integrate seamlessly into high-end architectural rooflines. Traditional bolt-on solar panels compromise your facade with exposed wires and silver rail clamps. WAVENOX re-engineers every millimeter for clean, monolithic beauty.
              </p>

              <div className="space-y-4 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#171A20] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#171A20]">
                      Obsidian Monolithic Finish
                    </h3>
                    <p className="text-xs text-[#5C5E62] mt-0.5">
                      Deep all-black glass tiles with concealed micro-busbars that visually mirror tinted architectural glass.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#171A20] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#171A20]">
                      Non-Penetrative Waterproof Mounting
                    </h3>
                    <p className="text-xs text-[#5C5E62] mt-0.5">
                      Precision structural ballast for RCC concrete terraces and interlocking concealed tile brackets. Zero punctures to your roof's waterproofing membrane.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#171A20] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-[#171A20]">
                      100% Usable Rooftop Terrace Living
                    </h3>
                    <p className="text-xs text-[#5C5E62] mt-0.5">
                      Elevated canopy engineering preserves complete walkability beneath, enabling luxury rooftop gardens, yoga decks, and sunset lounges.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: Uninterrupted Luxury Living with Omnigrid (Studio Gray #F8F8FA)
          ========================================================================= */}
      <section className="w-full bg-[#F8F8FA] py-20 lg:py-28 border-t border-b border-[#E2E8F0]">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Narrative & Metrics */}
            <motion.div {...fadeUp} className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
                STORAGE & OUTAGE DEFENSE
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
                Uninterrupted Luxury Living
              </h2>
              <p className="text-sm sm:text-base text-[#5C5E62] leading-relaxed">
                Indian grid infrastructure is susceptible to extreme weather interruptions and peak-hour brownouts. Pair your residential solar with Omnigrid battery storage to achieve autonomous backup that transfers in under 4 milliseconds.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                  <div className="text-2xl font-bold tracking-tight text-[#171A20]">&lt; 4ms</div>
                  <div className="text-xs font-medium text-[#5C5E62] mt-1">Sub-Cycle Islanding</div>
                  <div className="text-[11px] text-[#5C5E62]/80 mt-0.5">No flicker on servers or automation</div>
                </div>
                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white">
                  <div className="text-2xl font-bold tracking-tight text-[#171A20]">4–5 ACs</div>
                  <div className="text-xs font-medium text-[#5C5E62] mt-1">Continuous Cooling</div>
                  <div className="text-[11px] text-[#5C5E62]/80 mt-0.5">Powers high-load inverter compressors</div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Link to="/deploy" className="tesla-pill-primary text-xs cursor-pointer">
                  Configure Battery Storage
                </Link>
                <Link to="/omnigrid" className="tesla-pill-secondary text-xs cursor-pointer">
                  Explore Omnigrid →
                </Link>
              </div>
            </motion.div>

            {/* Visual Frame */}
            <motion.div {...fadeUp} className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-[#171A20]">
                <img
                  src={resHero02}
                  alt="Luxury estate with active solar and energy storage resilience"
                  className="w-full aspect-[16/10] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: Technical Specifications Table (Pure White #FFFFFF)
          ========================================================================= */}
      <section className="w-full bg-[#FFFFFF] py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
              SPECIFICATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#171A20]">
              Residential Technical Architecture
            </h2>
            <p className="text-sm sm:text-base text-[#5C5E62]">
              Engineered to surpass international photovoltaic benchmarks and withstand extreme Indian monsoon and summer climates.
            </p>
          </motion.div>

          <div className="mt-12 max-w-4xl mx-auto border-t border-[#E2E8F0] divide-y divide-[#E2E8F0]">
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Cell Technology</span>
              <span className="font-semibold text-[#171A20]">N-Type TOPCon Monocrystalline Bifacial</span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Module Efficiency</span>
              <span className="font-semibold text-[#171A20]">24.8% Peak Output Efficiency</span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Mechanical Wind & Hail Durability</span>
              <span className="font-semibold text-[#171A20]">Class 4 Hail Resistance / 250 km/h Cyclone Rated</span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Inverter Conversion Efficiency</span>
              <span className="font-semibold text-[#171A20]">98.6% European Weighted Multi-MPPT</span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Grid Net-Metering Compliance</span>
              <span className="font-semibold text-[#171A20]">100% Turnkey CEIG & State DISCOM Approval</span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Central Government Subsidy</span>
              <span className="font-semibold text-emerald-700">PM Surya Ghar Muft Bijli Yojana (Up to ₹78,000)</span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Fire & Safety Rating</span>
              <span className="font-semibold text-[#171A20]">Class A Fire Rating / BIS & IEC 61215 Certified</span>
            </div>
            <div className="py-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-[#5C5E62] font-medium">Comprehensive Warranty</span>
              <span className="font-semibold text-[#171A20]">25-Year Linear Performance & 25-Year Workmanship</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: Next-Generation Home Energy Action Bar (Studio Gray #F8F8FA)
          ========================================================================= */}
      <section className="w-full bg-[#F8F8FA] py-16 border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-5xl px-6 lg:px-12 text-center space-y-6">
          <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#171A20]">
            Experience Energy Sovereignty
          </h3>
          <p className="text-xs sm:text-sm text-[#5C5E62] max-w-xl mx-auto">
            Design your estate solar array in our interactive studio or speak directly with our senior architectural advisors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/deploy" className="tesla-pill-primary w-full sm:w-auto text-sm cursor-pointer">
              Launch Design Studio →
            </Link>
            <button
              type="button"
              onClick={() => openConsultationDrawer("villa")}
              className="tesla-pill-secondary w-full sm:w-auto text-sm cursor-pointer"
            >
              Book Site Architectural Audit
            </button>
          </div>
        </div>
      </section>

      <Footer />
      <ConsultationDrawer />
    </div>
  );
}
