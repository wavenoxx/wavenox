import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Compass,
  Layers,
  Sparkles,
  Shield,
  ArrowRight,
  Eye,
  CheckCircle2,
  Building2,
  Cpu,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/system/Button";
import { Media } from "@/components/system/Media";
import { media } from "@/config/media";
import { BRAND_CONFIG } from "@/config/brand";
import { openConsultationDrawer } from "@/components/ConsultationDrawer";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: `Atelier Ethos & The Reimagination of the Rooftop — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "The founding philosophy of WAVENOX: Why we rejected conventional solar utility scaffolding to engineer monolithic, architectural clean energy for India’s finest residences.",
      },
      {
        property: "og:title",
        content: `Atelier Ethos & The Reimagination of the Rooftop — ${BRAND_CONFIG.name}`,
      },
      {
        property: "og:description",
        content:
          "Discover how WAVENOX transformed solar from an unsightly utility into an architectural crown for luxury residences.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-design-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/our-story` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_CONFIG.domain}/our-story` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "WAVENOX Atelier Ethos and Architectural History",
          description:
            "The founding principles of WAVENOX clean energy architecture, rooted in Hyderabad, Telangana.",
          publisher: {
            "@type": "Organization",
            name: BRAND_CONFIG.name,
            url: BRAND_CONFIG.domain,
            logo: `${BRAND_CONFIG.domain}/favicon.ico`,
          },
        }),
      },
    ],
  }),
  component: OurStoryPage,
});

function OurStoryPage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF]">
      <Header />

      <main className="pt-24 sm:pt-28 md:pt-32 pb-20">
        {/* 1. HERO HEADER */}
        <section className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-3">
            Atelier Ethos &amp; Heritage
          </span>
          <h1 className="text-[32px] sm:text-[44px] md:text-[54px] font-medium tracking-tight leading-[1.1] text-[#171A20] text-balance">
            The Reimagination of the Rooftop
          </h1>
          <p className="text-[15px] sm:text-[17px] font-normal leading-relaxed text-[#5C5E62] max-w-2xl mx-auto mt-3 sm:mt-4 text-balance">
            For three decades, rooftop solar was treated as an industrial utility afterthought:
            crude galvanized iron pipes, dangling orange wires, and punctured terraces. We founded
            WAVENOX to build an architectural sovereign alternative.
          </p>
        </section>

        {/* 2. VISUAL CANVAS */}
        <section className="max-w-5xl mx-auto px-6 mt-12 sm:mt-16">
          <div className="relative aspect-[16/9] w-full rounded-[12px] overflow-hidden border border-[#171A20]/10 shadow-2xl">
            <Media
              media={media["home-design"]}
              priority={true}
              fill={true}
              className="w-full h-full object-cover"
              alt="Architectural solar villa terrace at golden hour"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 p-6 sm:p-10 text-white z-10 max-w-xl">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#F57C00] block mb-1">
                Monolithic Vision
              </span>
              <h2 className="text-[20px] sm:text-[26px] font-medium tracking-tight leading-snug">
                Where Clean Energy Meets Architectural Permanence
              </h2>
            </div>
          </div>
        </section>

        {/* 3. THE THESIS */}
        <section className="max-w-3xl mx-auto px-6 mt-20 sm:mt-28 space-y-8 text-[15px] sm:text-[16px] leading-relaxed text-[#5C5E62]">
          <div className="space-y-4">
            <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#171A20] block">
              The Genesis
            </span>
            <h2 className="text-[26px] sm:text-[32px] font-medium tracking-tight text-[#171A20] leading-snug">
              Why Luxury Residences Deserved Better
            </h2>
            <p>
              When an architect designs an exquisite modern villa in Jubilee Hills or
              Sadashivanagar, every reveal, basalt stone texture, and floor-to-ceiling glass edge is
              deliberated for months. Yet the moment the owner seeks solar energy, generic utility
              contractors arrive with sledgehammers, piercing the slab membrane and bolting diagonal
              galvanized struts that ruin the skyline.
            </p>
            <p>
              We asked a simple engineering question:{" "}
              <strong className="text-[#171A20]">
                What if solar wasn’t mounted ON the house, but became the architectural crown OF the
                house?
              </strong>
            </p>
          </div>

          <div className="p-6 rounded-[8px] border-l-2 border-[#171A20] bg-[#F4F4F4]/50 space-y-2">
            <p className="font-medium text-[#171A20] text-[15px]">
              “The roof of an Indian luxury home is not an industrial mechanical yard. It is where
              families gather during monsoon evenings, host dinners beneath starlit skies, and take
              morning walks. Solar must respect and elevate that space.”
            </p>
            <span className="text-[12px] text-[#5C5E62] block">
              — WAVENOX Architectural Engineering Studio
            </span>
          </div>
        </section>

        {/* 4. FOUR PILLARS OF OUR DESIGN PHILOSOPHY */}
        <section className="max-w-5xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.2em] uppercase text-[#5C5E62] block mb-2">
              Our Principles
            </span>
            <h2 className="text-[28px] sm:text-[36px] font-medium tracking-tight text-[#171A20]">
              The Four Atelier Tenets
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="p-7 sm:p-8 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#171A20] text-white flex items-center justify-center">
                <Eye className="w-5 h-5 text-[#F57C00]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#171A20]">1. Absolute Restraint</h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                No visible matrix busbars. No garish silver aluminium frames. No zig-zagging exposed
                conduits. Every line is parallel to the architectural roof parapet. All DC wiring is
                internally routed through structural columns.
              </p>
            </div>

            <div className="p-7 sm:p-8 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#171A20] text-white flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#F57C00]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#171A20]">
                2. Structural Inviolability
              </h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                We refuse to puncture terrace waterproofing slabs. Through custom pre-cast ballast
                foundations and chemical epoxy anchors, we guarantee 100% leak-proof structural
                waterproofing backed by our 5-year remedial warranty.
              </p>
            </div>

            <div className="p-7 sm:p-8 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#171A20] text-white flex items-center justify-center">
                <Compass className="w-5 h-5 text-[#F57C00]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#171A20]">3. Indian Climatic Physics</h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                Solar engineered in Northern Europe fails in Indian 46°C heatwaves and coastal
                monsoons. We utilize N-Type TOPCon cells with ultra-low thermal derating (-0.30%/°C)
                and 170 km/h wind-rated pergola metallurgy.
              </p>
            </div>

            <div className="p-7 sm:p-8 rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-[6px] bg-[#171A20] text-white flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#F57C00]" />
              </div>
              <h3 className="text-[20px] font-medium text-[#171A20]">4. Sovereign Ownership</h3>
              <p className="text-[14px] text-[#5C5E62] leading-relaxed">
                Zero multi-tiered subcontracting. When you invest in WAVENOX, our in-house Hyderabad
                engineers perform the site survey, design the 3D model, handle DISCOM net-metering,
                and service the installation under a direct 48-hour SLA.
              </p>
            </div>
          </div>
        </section>

        {/* 5. HYDERABAD COMMAND HEADQUARTERS */}
        <section className="max-w-5xl mx-auto px-6 mt-20 sm:mt-28">
          <div className="border border-[#E3E4E6] rounded-[10px] bg-[#F4F4F4]/50 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#F57C00] block">
                Engineering Atelier
              </span>
              <h3 className="text-[22px] sm:text-[26px] font-medium text-[#171A20]">
                Headquartered in Hyderabad, Operating Regionally
              </h3>
              <p className="text-[14px] text-[#5C5E62] max-w-xl leading-relaxed">
                Our design studio, structural prototyping center, and 24/7 telemetry command hub are
                located in the Financial District, Gachibowli, Hyderabad, serving premier estates
                across Telangana, Andhra Pradesh, and Karnataka.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                onClick={() => openConsultationDrawer()}
                variant="primary"
                tone="light"
                className="w-full sm:w-auto"
              >
                Schedule Private Consultation
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
