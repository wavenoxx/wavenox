import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Zap,
  Code2,
  FileCheck,
  Compass,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Layers,
  ArrowRight,
  Cpu,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND_CONFIG } from "@/config/brand";
import { SOURCES_CATALOG } from "@/config/sources";
import { SourcePopover } from "@/components/SourcePopover";

export const Route = createFileRoute("/about-this-project")({
  head: () => ({
    meta: [
      { title: `Colophon & Engineering Case Study — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Comprehensive engineering case study and design colophon for WAVENOX: an architectural residential solar platform built with real Indian statutory tariffs, IS 875 structural metallurgy, and zero invented claims.",
      },
      { property: "og:title", content: `Colophon & Engineering Case Study — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "How WAVENOX blends Tesla-grade design restraint with Indian regulatory rigor and verified NASA POWER solar meteorology.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/about-this-project` },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_CONFIG.domain}/about-this-project` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "WAVENOX Engineering Case Study & Design Colophon",
          description:
            "Architectural solar platform case study exploring statutory tariff decoding, NASA POWER meteorology, and structural pergola engineering.",
          author: {
            "@type": "Person",
            name: "Bunny",
          },
          publisher: {
            "@type": "Organization",
            name: BRAND_CONFIG.name,
            logo: `${BRAND_CONFIG.domain}/favicon.ico`,
          },
        }),
      },
    ],
  }),
  component: AboutThisProjectPage,
});

const AUDIT_BEFORE_AFTER = [
  {
    dimension: "Corporate Identity & Governance",
    before:
      "Invented legal entities, fictional R&D labs in Gachibowli, and unverified 48-hour SLAs.",
    after:
      "Honest concept disclosure: a design portfolio & engineering demonstration created by Bunny.",
    badge: "100% Honest",
  },
  {
    dimension: "Electricity Bill Math",
    before: "Generic linear assumptions with flat per-unit rates that distorted savings.",
    after:
      "TGERC FY 2025-26 inverse slab decoder matching actual telescopic tariffs and Gruha Jyothi.",
    badge: "Exact Math",
  },
  {
    dimension: "Solar Yield & Meteorology",
    before: "Uniform static annual estimates with no regional monsoon variance.",
    after:
      "NASA POWER / PVWatts v8 monthly irradiance curves tailored to Hyderabad, Vizag & Bengaluru.",
    badge: "Sourced Data",
  },
  {
    dimension: "Terrace Usability & Sizing",
    before: "Single arbitrary square-foot text box ignoring rooftop obstacles.",
    after:
      "Interactive satellite terrace sketcher deducting parapet setbacks, mumty, and water tanks.",
    badge: "Geospatial",
  },
  {
    dimension: "Battery Storage Advice",
    before: "Fictional claims of '100% solar self-use pays for itself in 3 years'.",
    after:
      "Honest Battery Advisor explaining why batteries do not pay back under net metering; BEE-rated loads.",
    badge: "Honest ROI",
  },
  {
    dimension: "Accessibility & Code Quality",
    before: "162 contrast violations, heading-order skips, and unlabelled controls.",
    after:
      "Zero serious/critical axe violations, WCAG 2.1 AA compliance, and 12px minimum font size.",
    badge: "WCAG 2.1 AA",
  },
];

const TECH_STACK_ITEMS = [
  {
    category: "Frontend Framework",
    name: "React 18 & TypeScript",
    detail: "Type-safe modular UI with strict linting",
  },
  {
    category: "Routing Architecture",
    name: "TanStack Router",
    detail: "File-based routing with zero client layout shift",
  },
  {
    category: "Design & Typography",
    name: "Tailwind CSS & Inter Variable",
    detail: "Strict design token enforcement; no raw hex",
  },
  {
    category: "Geospatial Mapping",
    name: "Leaflet & Esri World Imagery",
    detail: "High-resolution satellite rooftop terrace sketcher",
  },
  {
    category: "Celestial Mechanics",
    name: "SunCalc Engine",
    detail: "Real-time solar azimuth, altitude, and shadow rendering",
  },
  {
    category: "Unit & Logic Testing",
    name: "Vitest (29 Tests)",
    detail: "Tariff decoders, subsidy brackets, and degradation curves",
  },
  {
    category: "Visual & A11y QA",
    name: "Playwright & Axe-Core",
    detail: "Automated multi-device visual regression and a11y testing",
  },
  {
    category: "Privacy & Protection",
    name: "DPDP 2023 & Turnstile",
    detail: "Zero marketing trackers, explicit consent records",
  },
];

function AboutThisProjectPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF] flex flex-col justify-between">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        {/* HERO SECTION */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full pt-10 pb-16 border-b border-[#E3E4E6]">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#F57C00] bg-[#F57C00]/10 px-2.5 py-0.5 rounded-[3px]">
              Engineering Case Study
            </span>
            <span className="text-[12px] text-[#5C5E62]">· Design Colophon &amp; Whitepaper</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#171A20] leading-[1.1] max-w-4xl">
            Architectural Solar, Grounded in Engineering Reality
          </h1>

          <p className="text-[16px] sm:text-[19px] text-[#5C5E62] max-w-3xl mt-6 leading-relaxed">
            WAVENOX is a design portfolio and technical demonstration exploring how residential
            rooftop solar in India can achieve Tesla-grade restraint, beauty, and craftsmanship
            without deceptive marketing, invented corporate facts, or opaque calculations.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 mt-10 border-t border-[#E3E4E6]">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#5C5E62]">
                Data Fidelity
              </div>
              <div className="text-[22px] font-semibold text-[#171A20] mt-1">100% Sourced</div>
              <div className="text-[12px] text-[#5C5E62] mt-0.5">TGERC, MNRE, NASA</div>
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#5C5E62]">
                Copy Integrity
              </div>
              <div className="text-[22px] font-semibold text-[#171A20] mt-1">0 Buzzwords</div>
              <div className="text-[12px] text-[#5C5E62] mt-0.5">Strict lexical audit</div>
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#5C5E62]">
                Accessibility
              </div>
              <div className="text-[22px] font-semibold text-[#171A20] mt-1">0 Violations</div>
              <div className="text-[12px] text-[#5C5E62] mt-0.5">Axe WCAG 2.1 AA</div>
            </div>
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-[#5C5E62]">
                Grid Switching
              </div>
              <div className="text-[22px] font-semibold text-[#171A20] mt-1">&lt;20 ms</div>
              <div className="text-[12px] text-[#5C5E62] mt-0.5">Microgrid islanding</div>
            </div>
          </div>
        </section>

        {/* SECTION 1: THE PROBLEM */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full py-16 border-b border-[#E3E4E6] space-y-6">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#F57C00]">
              01 · Context &amp; Motivation
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
              The Indian Rooftop Solar Paradox
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px] text-[#5C5E62] leading-relaxed">
            <p>
              In 2026, rooftop solar adoption across India is accelerating at breakneck speed,
              catalyzed by the Central Government’s{" "}
              <strong>PM Surya Ghar: Muft Bijli Yojana</strong>. However, the consumer experience
              remains plagued by aggressive sales aggregators, unsubstantiated promises, and
              structural negligence. Websites routinely proclaim "Free electricity forever" or
              "Guaranteed 48-hour DISCOM sanctions," ignoring the reality that distribution
              transformers (DTs) have statutory loading quotas and site inspections require
              scheduled junior engineer visits.
            </p>
            <p>
              Furthermore, standard rooftop solar mounting relies on crude galvanized diagonal
              scaffolding bolted directly into residential roof slabs. This destroys terrace
              usability, punctures waterproofing membranes, and creates monsoon ceiling leaks.
              WAVENOX was conceived as an antidote: an architectural standard where elevated
              pergolas preserve 100% of usable terrace area, and every single number shown to the
              homeowner is backed by official regulatory gazettes and verifiable physics.
            </p>
          </div>
        </section>

        {/* SECTION 2: REGULATORY GROUND TRUTH */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full py-16 border-b border-[#E3E4E6] space-y-8">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#F57C00]">
              02 · Statutory Rigor
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
              Built on Official Indian Regulatory Orders
            </h2>
            <p className="text-[14px] text-[#5C5E62] max-w-2xl">
              Unlike generic calculators that multiply monthly bill amounts by arbitrary factors,
              WAVENOX implements the exact telescopic mathematical formulas mandated by state
              electricity regulators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#171A20]">
                  TGERC FY 2025-26 Order
                </span>
                <SourcePopover sourceId="tgercTariffs" showIconOnly />
              </div>
              <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                Implements the 4-tier telescopic LT-I tariff structure (₹5.10, ₹7.70, ₹9.00, ₹9.50)
                plus customer charges, fixed charges, and 6 paise/unit electricity duty. Fully
                accounts for Telangana’s 200-unit Gruha Jyothi zero-bill threshold.
              </p>
            </div>

            <div className="p-5 rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#171A20]">
                  PM Surya Ghar Scheme
                </span>
                <SourcePopover sourceId="pmSuryaGharSubsidy" showIconOnly />
              </div>
              <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                Accurate Central Financial Assistance (CFA) math: ₹33,000 for 1 kW, ₹66,000 for 2
                kW, and ₹78,000 cap for ≥3 kW. Features the complete 5-step national workflow and
                statutory document checklist.
              </p>
            </div>

            <div className="p-5 rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#171A20]">
                  IS 875 (Part 3) Wind Codes
                </span>
                <SourcePopover sourceId="windRating" showIconOnly />
              </div>
              <p className="text-[13px] text-[#5C5E62] leading-relaxed">
                Elevated terrace pergola structures engineered for Basic Wind Speed Vb = 44 m/s
                (158.4 km/h) for Hyderabad (Zone II), utilizing 6005-T5 architectural aluminium and
                4.0mm HDG steel footings.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: DESIGN SYSTEM & TESLA RESTRAINT */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full py-16 border-b border-[#E3E4E6] space-y-8">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#F57C00]">
              03 · Visual Language
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
              The Tesla-Inspired Design System
            </h2>
            <p className="text-[14px] text-[#5C5E62] max-w-2xl">
              Clean, quiet, and monumental. WAVENOX adheres to strict design discipline to evoke
              architectural permanence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6] space-y-2">
              <div className="text-[12px] font-semibold uppercase text-[#171A20]">
                Monochrome Canvas
              </div>
              <p className="text-[12px] text-[#5C5E62] leading-relaxed">
                Pure white (`#FFFFFF`) and architectural dark (`#171A20`) surfaces provide cinematic
                contrast.
              </p>
            </div>
            <div className="p-4 rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6] space-y-2">
              <div className="text-[12px] font-semibold uppercase text-[#171A20]">
                Single Amber Accent
              </div>
              <p className="text-[12px] text-[#5C5E62] leading-relaxed">
                `#F57C00` is reserved strictly for electrical flow, sun azimuth paths, and
                regulatory disclosures.
              </p>
            </div>
            <div className="p-4 rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6] space-y-2">
              <div className="text-[12px] font-semibold uppercase text-[#171A20]">
                100svh Hero Panels
              </div>
              <p className="text-[12px] text-[#5C5E62] leading-relaxed">
                Centered typography, single-line lead, and bottom-docked stat rows with two pill
                action CTAs.
              </p>
            </div>
            <div className="p-4 rounded-[6px] bg-[#F4F4F4] border border-[#E3E4E6] space-y-2">
              <div className="text-[12px] font-semibold uppercase text-[#171A20]">
                Strict 12px Floor
              </div>
              <p className="text-[12px] text-[#5C5E62] leading-relaxed">
                Zero micro-text below 12px ensures comfortable reading across retina desktop and
                mobile screens.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: BEFORE VS AFTER TRANSFORMATION */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full py-16 border-b border-[#E3E4E6] space-y-8">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#F57C00]">
              04 · Architectural Audit
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
              The Transformation Matrix
            </h2>
            <p className="text-[14px] text-[#5C5E62] max-w-2xl">
              How the platform was methodically purged of marketing fluff, aligned with real
              datasheets, and upgraded.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] border border-[#E3E4E6] rounded-[6px] overflow-hidden">
              <thead className="bg-[#F4F4F4] text-[#171A20] font-semibold">
                <tr>
                  <th className="p-4 border-b border-[#E3E4E6] w-1/4">System Dimension</th>
                  <th className="p-4 border-b border-[#E3E4E6] w-3/8 text-[#B42318]">
                    Before Audit
                  </th>
                  <th className="p-4 border-b border-[#E3E4E6] w-3/8 text-[#16A34A]">
                    After (WAVENOX Standard)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E4E6]">
                {AUDIT_BEFORE_AFTER.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#F9FAFB]">
                    <td className="p-4 font-medium text-[#171A20] align-top">
                      <div>{item.dimension}</div>
                      <span className="inline-block mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#171A20] bg-[#F4F4F4] px-2 py-0.5 rounded">
                        {item.badge}
                      </span>
                    </td>
                    <td className="p-4 text-[#5C5E62] align-top leading-relaxed">{item.before}</td>
                    <td className="p-4 text-[#171A20] font-medium align-top leading-relaxed bg-[#F0FDF4]/30">
                      {item.after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 5: TECHNICAL STACK & ARCHITECTURE */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full py-16 border-b border-[#E3E4E6] space-y-8">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#F57C00]">
              05 · Technology Stack
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
              Software Architecture &amp; Tooling
            </h2>
            <p className="text-[14px] text-[#5C5E62] max-w-2xl">
              Engineered with modern frontend standards, full static typing, zero unnecessary
              runtime dependencies, and automated accessibility assertions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {TECH_STACK_ITEMS.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] space-y-1.5"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C5E62]">
                  {item.category}
                </span>
                <h3 className="text-[14px] font-medium text-[#171A20]">{item.name}</h3>
                <p className="text-[12px] text-[#5C5E62] leading-normal">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: SOURCED ASSUMPTIONS CATALOG */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full py-16 border-b border-[#E3E4E6] space-y-8">
          <div className="space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[#F57C00]">
              06 · Authoritative Citations
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#171A20]">
              Complete Verified Sources Catalog
            </h2>
            <p className="text-[14px] text-[#5C5E62] max-w-2xl">
              Every numerical claim and equation on this platform is linked to an official statutory
              document or verified meteorological dataset.
            </p>
          </div>

          <div className="space-y-3">
            {Object.values(SOURCES_CATALOG).map((source) => (
              <div
                key={source.id}
                className="p-4 rounded-[6px] border border-[#E3E4E6] bg-[#FFFFFF] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[#171A20]">{source.metric}</span>
                    <span className="text-[11px] text-[#16A34A] font-semibold bg-[#DCFCE7] px-2 py-0.5 rounded">
                      Verified {source.verifiedDate}
                    </span>
                  </div>
                  <div className="text-[12px] text-[#5C5E62]">
                    <span className="font-medium text-[#171A20]">{source.value}</span> ·{" "}
                    {source.sourceDoc} ({source.authority})
                  </div>
                  {source.formulaOrBasis && (
                    <div className="text-[11px] text-[#5C5E62] italic">
                      Basis: {source.formulaOrBasis}
                    </div>
                  )}
                </div>

                <a
                  href={source.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#171A20] hover:text-[#F57C00] shrink-0"
                >
                  <span>Open Gazette / Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: CREDITS & CONCEPT DISCLAIMER */}
        <section className="px-6 sm:px-12 max-w-5xl mx-auto w-full pt-16 space-y-6">
          <div className="p-8 rounded-[8px] bg-[#171A20] text-[#FFFFFF] space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[4px] bg-[#FFFFFF]/10 text-[12px] font-medium text-[#FFFFFF]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F57C00]" />
              <span>Portfolio Attribution &amp; Concept Scope</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-medium tracking-tight text-[#FFFFFF]">
              Designed &amp; Engineered by Bunny
            </h3>

            <p className="text-[14px] text-[#FFFFFF]/70 leading-relaxed max-w-3xl">
              WAVENOX is an architectural design exploration and full-stack engineering
              demonstration created by Bunny. It serves as a benchmark for how modern clean-tech
              platforms can combine minimal aesthetic restraint with exhaustive regulatory
              precision. All brand assets, 3D architectural renders, and interactive calculators are
              created for portfolio demonstration purposes.
            </p>

            <div className="pt-4 border-t border-[#FFFFFF]/15 flex flex-wrap items-center gap-4 text-[13px] text-[#FFFFFF]/80">
              <Link
                to="/deploy"
                className="px-4 py-2 rounded-[4px] bg-[#FFFFFF] text-[#171A20] font-medium hover:bg-[#FFFFFF]/90 transition-colors"
              >
                Launch Design Studio
              </Link>
              <Link
                to="/technology"
                className="px-4 py-2 rounded-[4px] border border-[#FFFFFF]/30 text-[#FFFFFF] font-medium hover:bg-[#FFFFFF]/10 transition-colors"
              >
                Inspect Sun-Path Simulator
              </Link>
              <Link
                to="/net-metering"
                className="px-4 py-2 rounded-[4px] border border-[#FFFFFF]/30 text-[#FFFFFF] font-medium hover:bg-[#FFFFFF]/10 transition-colors"
              >
                DISCOM Feasibility Guide
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
