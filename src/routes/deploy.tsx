import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SystemConfigurator } from "@/components/SystemConfigurator";
import { BRAND_CONFIG } from "@/config/brand";

export const Route = createFileRoute("/deploy")({
  validateSearch: (search: Record<string, unknown>): { bill?: number; discom?: string } => ({
    bill:
      typeof search.bill === "string" || typeof search.bill === "number"
        ? Number(search.bill)
        : undefined,
    discom: typeof search.discom === "string" ? search.discom : undefined,
  }),
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
      { property: "og:image", content: "/media/home-hero-1600w.jpg" },
      { property: "og:type", content: "website" },
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
