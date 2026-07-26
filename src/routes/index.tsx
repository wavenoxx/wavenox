import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Comparison } from "@/components/Comparison";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WAVENOX — Absolute Power. Zero Compromise." },
      {
        name: "description",
        content:
          "Wavenox deploys world-class residential and commercial solar infrastructure across Hyderabad. Tier-1 performance, 25-year warranty, absolute energy independence.",
      },
      { property: "og:title", content: "WAVENOX — Absolute Power. Zero Compromise." },
      {
        property: "og:description",
        content:
          "Ultra-premium solar infrastructure for homes and businesses. Engineered for the future.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-black">
      <Hero />
      <Features />
    </main>
  );
}
