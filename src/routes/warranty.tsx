import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Zap,
  Clock,
  Sparkles,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Layers,
  Wrench,
  Headphones,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/system/Button";
import { Media } from "@/components/system/Media";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { PRODUCTS_CONFIG } from "@/config/products";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: `25-Year Sovereign Asset Warranty Charter — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "The WAVENOX 25-Year Comprehensive Asset Warranty: 25-year linear power guarantee (≥84.8%), 10-year battery capacity retention (≥70%), 5-year terrace waterproofing guarantee, and 48-hour SLA.",
      },
      {
        property: "og:title",
        content: `25-Year Sovereign Asset Warranty Charter — ${BRAND_CONFIG.name}`,
      },
      {
        property: "og:description",
        content:
          "Explore our institutional-grade guarantees: 25-year power curve, 10-year storage warranty, and zero terrace slab damage assurance.",
      },
      { property: "og:image", content: "/media/home-hero-1600w.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "preload",
        as: "image",
        href: "/media/home-hero-1600w.webp",
        media: "(min-width: 768px)",
        type: "image/webp",
      },
      {
        rel: "preload",
        as: "image",
        href: "/media/home-hero-mobile.webp",
        media: "(max-width: 767px)",
        type: "image/webp",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "WAVENOX 25-Year Asset Protection Charter and Degradation Warranties",
          description:
            "Institutional guarantee schedule covering 25-year linear solar power degradation, 10-year LiFePO4 battery capacity, 5-year terrace slab structural waterproofing, and 48-hour on-site dispatch SLA.",
          author: {
            "@type": "Organization",
            name: BRAND_CONFIG.name,
            url: "https://wavenox.in",
          },
          publisher: {
            "@type": "Organization",
            name: BRAND_CONFIG.name,
            logo: "https://wavenox.in/favicon.ico",
          },
        }),
      },
    ],
  }),
  component: WarrantyPage,
});

function WarrantyPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main className="pt-24 sm:pt-28 md:pt-32 pb-20">
        {/* 1. HERO HEADER */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-3">
            Institutional Asset Protection
          </span>
          <h1 className="text-[32px] sm:text-[44px] md:text-[54px] font-medium tracking-tight leading-[1.1] text-[#171A20] text-balance">
            The 25-Year Sovereign Warranty Charter
          </h1>
          <p className="text-[15px] sm:text-[17px] font-normal leading-relaxed text-[#5C5E62] max-w-2xl mx-auto mt-3 sm:mt-4 text-balance">
            Solar is a quarter-century financial asset. We stand behind every kilowatt with
            tier-one linear power guarantees, non-penetrating waterproofing bonds, and 48-hour field
            dispatch.
          </p>

          {/* Quick Metrics Ribbon */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
            {[
              { value: "25 Years", label: "Linear Power", sub: "≥ 84.8% Output" },
              { value: "10 Years", label: "Battery Pack", sub: "≥ 70% Retained" },
              { value: "5 Years", label: "Waterproofing", sub: "Zero Slab Leak" },
              { value: "48 Hours", label: "Dispatch SLA", sub: "Regional Fleet" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#F4F4F4]/50 flex flex-col items-center justify-center text-center"
              >
                <span className="text-[22px] sm:text-[24px] font-semibold tracking-tight text-[#171A20] tabular-nums">
                  {stat.value}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#5C5E62] mt-0.5">
                  {stat.label}
                </span>
                <span className="text-[11px] text-[#5C5E62]/70">{stat.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. THE 4 CORNERSTONE GUARANTEES */}
        <section className="max-w-5xl mx-auto px-6 mt-16 sm:mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-2">
              Comprehensive Coverage
            </span>
            <h2 className="text-[28px] sm:text-[36px] font-medium tracking-tight text-[#171A20]">
              Four Pillars of Sovereign Ownership
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[#5C5E62] mt-2">
              Every WAVENOX installation includes all four pillars under a single institutional SLA
              — zero finger-pointing between equipment manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* PILLAR 1 */}
            <div className="p-7 sm:p-8 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#171A20] text-white flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#F57C00]" />
              </div>
              <h3 className="text-[20px] sm:text-[22px] font-medium text-[#171A20]">
                25-Year Linear Power Production
              </h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                Conventional panels degrade rapidly under harsh 44°C Indian summers. WAVENOX N-Type
                TOPCon dual-glass panels are legally warranted to maintain at least 99.0% rated power
                in Year 1, with annual degradation strictly capped at ≤ 0.55% per year, ensuring at
                least 84.8% nameplate capacity in Year 25.
              </p>
              <div className="pt-2 border-t border-[#E3E4E6] flex items-center justify-between text-[12px] text-[#5C5E62]">
                <span>Yr 1: ≥ 99.0%</span>
                <span>Yr 10: ≥ 93.5%</span>
                <span>Yr 25: ≥ 84.8%</span>
              </div>
            </div>

            {/* PILLAR 2 */}
            <div className="p-7 sm:p-8 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#171A20] text-white flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#F57C00]" />
              </div>
              <h3 className="text-[20px] sm:text-[22px] font-medium text-[#171A20]">
                10-Year Omnigrid Battery Retention
              </h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                Automotive-grade Lithium Iron Phosphate (LiFePO4) chemistry ensures cobalt-free
                thermal stability. Omnigrid is guaranteed to maintain at least 70% of its initial 14.3
                kWh usable capacity for 10 continuous years or 6,000 full daily cycles, whichever
                comes first.
              </p>
              <div className="pt-2 border-t border-[#E3E4E6] flex items-center justify-between text-[12px] text-[#5C5E62]">
                <span>Cycle Life: 6,000 cycles</span>
                <span>Chemistry: LiFePO4</span>
                <span>Capacity: ≥ 70% Retained</span>
              </div>
            </div>

            {/* PILLAR 3 */}
            <div className="p-7 sm:p-8 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#171A20] text-white flex items-center justify-center">
                <Layers className="w-5 h-5 text-[#F57C00]" />
              </div>
              <h3 className="text-[20px] sm:text-[22px] font-medium text-[#171A20]">
                5-Year Terrace Waterproofing Warranty
              </h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                The biggest fear of luxury homeowners is ceiling water leakage. WAVENOX installs
                elevated pergolas using non-penetrating ballast footings or marine-grade chemical
                epoxy anchors with 4-coat elastomeric waterproofing membranes. If moisture leaks
                occur due to our mount, repair and remediation are 100% covered.
              </p>
              <div className="pt-2 border-t border-[#E3E4E6] flex items-center justify-between text-[12px] text-[#5C5E62]">
                <span>Mount Type: Non-penetrating / Epoxy</span>
                <span>Membrane: Elastomeric</span>
                <span>Remediation: 100% Covered</span>
              </div>
            </div>

            {/* PILLAR 4 */}
            <div className="p-7 sm:p-8 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#171A20] text-white flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#F57C00]" />
              </div>
              <h3 className="text-[20px] sm:text-[22px] font-medium text-[#171A20]">
                48-Hour Technical Service SLA
              </h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                Solar monitoring without local response is meaningless. Every WAVENOX system is
                monitored 24/7 by our Hyderabad Command Center. In the event of an inverter anomaly,
                string trip, or grid synchronization error, an authorized service engineer is
                dispatched to your residence within 48 business hours.
              </p>
              <div className="pt-2 border-t border-[#E3E4E6] flex items-center justify-between text-[12px] text-[#5C5E62]">
                <span>Monitoring: 24/7 Cellular IoT</span>
                <span>On-Site SLA: &lt; 48 Hours</span>
                <span>Hubs: HYD, BLR, VIZ</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. VISUAL DEGRADATION COMPARISON TABLE */}
        <section className="max-w-5xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="border border-[#E3E4E6] rounded-[8px] bg-[#FFFFFF] overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8 border-b border-[#E3E4E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#5C5E62] block mb-1">
                  Linear Output Degradation
                </span>
                <h3 className="text-[20px] sm:text-[24px] font-medium text-[#171A20]">
                  WAVENOX vs Industry Standard Output Retention
                </h3>
              </div>
              <div className="text-[12px] font-medium text-[#5C5E62] bg-[#F4F4F4] px-3 py-1.5 rounded-[4px]">
                N-Type TOPCon Dual-Glass Standard
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] sm:text-[14px] border-collapse">
                <thead>
                  <tr className="border-b border-[#E3E4E6] bg-[#F4F4F4]/60 text-[11px] font-semibold text-[#5C5E62] uppercase tracking-wider">
                    <th className="py-3.5 px-6">Milestone</th>
                    <th className="py-3.5 px-6">Conventional Poly/Mono</th>
                    <th className="py-3.5 px-6 text-[#171A20]">WAVENOX N-Type TOPCon</th>
                    <th className="py-3.5 px-6 text-right">Protection Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E4E6]">
                  <tr>
                    <td className="py-4 px-6 font-medium text-[#171A20]">Year 1 Initial</td>
                    <td className="py-4 px-6 text-[#5C5E62]">97.0% (LID degradation)</td>
                    <td className="py-4 px-6 font-semibold text-[#171A20]">≥ 99.0%</td>
                    <td className="py-4 px-6 text-right font-medium text-[#F57C00]">+2.0% Zero LID</td>
                  </tr>
                  <tr className="bg-[#F4F4F4]/30">
                    <td className="py-4 px-6 font-medium text-[#171A20]">Annual Degradation</td>
                    <td className="py-4 px-6 text-[#5C5E62]">0.70% / year</td>
                    <td className="py-4 px-6 font-semibold text-[#171A20]">≤ 0.55% / year</td>
                    <td className="py-4 px-6 text-right font-medium text-[#F57C00]">21% Lower Loss</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-[#171A20]">Year 10 Output</td>
                    <td className="py-4 px-6 text-[#5C5E62]">90.7%</td>
                    <td className="py-4 px-6 font-semibold text-[#171A20]">≥ 93.5%</td>
                    <td className="py-4 px-6 text-right font-medium text-[#F57C00]">+2.8% Yield Gain</td>
                  </tr>
                  <tr className="bg-[#F4F4F4]/30">
                    <td className="py-4 px-6 font-medium text-[#171A20]">Year 20 Output</td>
                    <td className="py-4 px-6 text-[#5C5E62]">83.7%</td>
                    <td className="py-4 px-6 font-semibold text-[#171A20]">≥ 88.0%</td>
                    <td className="py-4 px-6 text-right font-medium text-[#F57C00]">+4.3% Yield Gain</td>
                  </tr>
                  <tr className="bg-[#171A20] text-white">
                    <td className="py-4 px-6 font-semibold">Year 25 Guaranteed</td>
                    <td className="py-4 px-6 text-white/70">80.2% (Often unserviceable)</td>
                    <td className="py-4 px-6 font-bold text-white">≥ 84.8%</td>
                    <td className="py-4 px-6 text-right font-bold text-[#F57C00]">+4.6% More Power</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. HASSLE-FREE CLAIMS PROCESS */}
        <section className="max-w-5xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-2">
              Autonomous Support
            </span>
            <h2 className="text-[28px] sm:text-[36px] font-medium tracking-tight text-[#171A20]">
              How Warranty Claims Are Resolved
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[#5C5E62] mt-2">
              No warranty cards to lose, no distributor middle-men. Your system’s encrypted telemetry
              serves as its own transparent ledger.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] space-y-3">
              <span className="text-[12px] font-bold text-[#5C5E62] uppercase tracking-widest">
                Step 01
              </span>
              <h4 className="text-[18px] font-medium text-[#171A20]">Automated Detection</h4>
              <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                If an inverter trips or a string shows voltage variance outside normal limits, our
                cloud fleet monitor flags the anomaly automatically without requiring you to file a
                ticket.
              </p>
            </div>

            <div className="p-6 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] space-y-3">
              <span className="text-[12px] font-bold text-[#5C5E62] uppercase tracking-widest">
                Step 02
              </span>
              <h4 className="text-[18px] font-medium text-[#171A20]">Direct SLA Dispatch</h4>
              <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                A factory-trained WAVENOX field engineer contacts you and arrives with pre-tested
                OEM replacement modules or inverter boards within the 48-hour service window.
              </p>
            </div>

            <div className="p-6 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] space-y-3">
              <span className="text-[12px] font-bold text-[#5C5E62] uppercase tracking-widest">
                Step 03
              </span>
              <h4 className="text-[18px] font-medium text-[#171A20]">Zero Out-of-Pocket</h4>
              <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                All certified repairs, component replacements, labor, and re-commissioning tests are
                completed under your sovereign warranty charter with ₹0 out-of-pocket fees.
              </p>
            </div>
          </div>
        </section>

        {/* 5. DIRECT CTA DOCK */}
        <section className="max-w-4xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="p-8 sm:p-12 rounded-[12px] bg-[#171A20] text-white text-center space-y-5 shadow-2xl">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#F57C00] block">
              Long-Term Energy Independence
            </span>
            <h2 className="text-[26px] sm:text-[34px] md:text-[40px] font-medium tracking-tight text-white text-balance leading-snug">
              Invest with Institutional Certainty
            </h2>
            <p className="text-[14px] sm:text-[16px] text-white/80 max-w-xl mx-auto leading-relaxed text-balance">
              Review your residence’s solar potential, net-metering eligibility, and obtain a formal
              warranty schedule customized to your roof.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
              <Button to="/deploy" variant="primary" tone="dark" className="w-full sm:w-auto">
                Design Your System Online
              </Button>
              <Button
                onClick={() => openConsultationDrawer()}
                variant="secondary"
                tone="dark"
                className="w-full sm:w-auto"
              >
                Schedule Advisor Consultation
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
