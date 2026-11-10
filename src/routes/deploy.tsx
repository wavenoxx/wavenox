import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SystemConfigurator } from "@/components/SystemConfigurator";
import { BRAND_CONFIG } from "@/config/brand";
import { media } from "@/config/media";

export const Route = createFileRoute("/deploy")({
  validateSearch: (search: Record<string, unknown>): { bill?: number; discom?: string } => {
    const rawBill =
      typeof search.bill === "string" || typeof search.bill === "number"
        ? Number(search.bill)
        : Number.NaN;
    const validBill =
      Number.isFinite(rawBill) && rawBill > 0
        ? Math.min(200000, Math.max(1000, Math.round(rawBill)))
        : undefined;
    const rawDiscom = typeof search.discom === "string" ? search.discom.trim() : "";
    return {
      bill: validBill,
      discom: rawDiscom.length > 0 ? rawDiscom : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: `Design Studio & System Sizing — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Design your custom architectural solar system. Interactive sizing tiers, Omnigrid battery storage, state DISCOM net-metering integration, and PM Surya Ghar subsidy calculation.",
      },
      { property: "og:title", content: `Design Studio — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Configure modular solar capacity, battery autonomy, and 25-year wealth generation.",
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/deploy` },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "canonical", href: `${BRAND_CONFIG.domain}/deploy` },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        href: media["res-hero"].mobileAvif,
        media: "(max-width: 768px)",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        as: "image",
        type: "image/avif",
        imageSrcSet: media["res-hero"].avif,
        imageSizes: "100vw",
        media: "(min-width: 769px)",
        fetchPriority: "high",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${BRAND_CONFIG.name} Solar Design Studio & Proposal Generator`,
          url: `${BRAND_CONFIG.domain}/deploy`,
          applicationCategory: "DesignApplication",
          operatingSystem: "All",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "INR",
          },
          description:
            "Interactive architectural rooftop solar sizing calculator with DISCOM net-metering integration and PM Surya Ghar subsidy modeling.",
        }),
      },
    ],
  }),
  component: DeployPage,
});

function DeployPage() {
  const search = Route.useSearch();

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-[#FFFFFF] flex flex-col justify-between">
      <Header />
      <main className="flex-1 pt-14">
        <SystemConfigurator initialBill={search.bill} initialDiscom={search.discom} />
      </main>
      <Footer />
    </div>
  );
}
