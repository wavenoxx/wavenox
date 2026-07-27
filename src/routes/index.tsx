import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Comparison } from "@/components/Comparison";
import { DataMatrix } from "@/components/DataMatrix";
import { Ecosystem } from "@/components/Ecosystem";
import { RoiEngine } from "@/components/RoiEngine";
import { Process } from "@/components/Process";
import { Portfolio } from "@/components/Portfolio";
import { Press } from "@/components/Press";
import { Certifications } from "@/components/Certifications";

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
    <main
      className="bg-black"
      style={{ backgroundImage: "none", backgroundColor: "#000000" }}
    >
      <Hero />
      <Features />
      <Comparison />
      <DataMatrix />
      <Ecosystem />
      <RoiEngine />
      <Process />
      <Portfolio />
      <Press />
      <Certifications />
    </main>
  );
}

