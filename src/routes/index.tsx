import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SleekDesign } from "@/components/SleekDesign";
import { OutageProtection } from "@/components/OutageProtection";
import { Footer } from "@/components/Footer";
import { ConsultationDrawer } from "@/components/ConsultationDrawer";
import { BRAND_CONFIG } from "@/config/brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND_CONFIG.name} — Solar Panels for Existing Roofs` },
      {
        name: "description",
        content:
          "Wavenox deploys world-class low-profile residential and commercial architectural solar across India. Guaranteed lowest price, 25-year warranty, and 24/7 outage protection.",
      },
      { property: "og:title", content: `${BRAND_CONFIG.name} — Solar Panels for Existing Roofs` },
      {
        property: "og:description",
        content:
          "Ultra-luxury solar infrastructure for homes and businesses. Guaranteed lowest price, 25-year warranty, and 24/7 outage protection.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-white text-[#171A20] selection:bg-[#171A20] selection:text-white">
      <Header />
      <Hero />
      <SleekDesign />
      <OutageProtection />
      <Footer />
      <ConsultationDrawer />
    </main>
  );
}
