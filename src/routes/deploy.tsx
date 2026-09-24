import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SystemConfigurator } from "@/components/SystemConfigurator";
import { BRAND_CONFIG } from "@/config/brand";

export const Route = createFileRoute("/deploy")({
  validateSearch: (search: Record<string, unknown>): { bill?: number; discom?: string } => ({
    bill: typeof search.bill === "string" || typeof search.bill === "number" ? Number(search.bill) : undefined,
    discom: typeof search.discom === "string" ? search.discom : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Solar System Design Studio & Sizing — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content:
          "Design your custom architectural solar system. Interactive sizing tiers, Omnigrid battery storage configuration, state DISCOM net-metering integration, and instant PM Surya Ghar subsidy calculation.",
      },
      { property: "og:title", content: `Solar System Design Studio — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content:
          "Configure modular solar capacity, battery autonomy, and 25-year wealth generation.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: DeployPage,
});

function DeployPage() {
  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] text-[#171A20] selection:bg-[#171A20] selection:text-white">
      <Header />
      <main className="pt-20">
        <SystemConfigurator />
      </main>
      <Footer />
    </div>
  );
}
