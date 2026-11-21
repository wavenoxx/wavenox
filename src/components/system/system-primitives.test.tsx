import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Panel } from "./Panel";
import { StatRow } from "./StatRow";
import { Button } from "./Button";
import { Reveal } from "./Reveal";
import { QuietSection } from "./QuietSection";
import { EditorialFeature } from "./EditorialFeature";
import { EditorialCarousel } from "./EditorialCarousel";
import { SpecsGrid } from "./SpecsGrid";
import { BatteryHonestyAdvisor } from "../BatteryHonestyAdvisor";

describe("Phase 1 / Workstream 2 Design Foundation Primitives", () => {
  it("renders Panel with full and closing height variants while keeping SSR content visible", () => {
    const heroHtml = renderToStaticMarkup(
      <Panel
        id="solar-panels"
        as="h1"
        priority={true}
        tone="dark"
        title="Solar, Designed Around Your Home"
        lead="Explore rooftop solar engineered for Indian homes."
        disclaimer="*Central subsidy subject to portal sanctioning."
      />,
    );

    expect(heroHtml).toContain('data-panel-height="full"');
    expect(heroHtml).toContain("min-h-[100svh]");
    expect(heroHtml).toContain("<h1");
    expect(heroHtml).toContain('data-reveal="immediate"');
    expect(heroHtml).not.toContain("opacity:0");

    const closingHtml = renderToStaticMarkup(
      <Panel id="closing-cta" height="closing" tone="light" title="Closing Architectural Frame" />,
    );

    expect(closingHtml).toContain('data-panel-height="closing"');
    expect(closingHtml).toContain("min-h-[80svh]");
    expect(closingHtml).toContain("<h2");
    expect(closingHtml).toContain('data-theme="light"');
  });

  it("renders StatRow with tabular numerals, nowrap values, and hero-stat test identifiers", () => {
    const html = renderToStaticMarkup(
      <StatRow
        stats={[
          { value: "₹78,000", label: "Max Central Subsidy*" },
          { value: "25 Years", label: "OEM Module Warranty" },
          { value: "1,490 kWh", label: "Annual Yield / kWp" },
        ]}
      />,
    );

    const matches = html.match(/data-testid="hero-stat"/g) || [];
    expect(matches.length).toBe(3);
    expect(html).toContain("tabular-nums");
    expect(html).toContain("whitespace-nowrap");
    expect(html).toContain("grid-cols-3");
    expect(html).toContain("₹78,000");
    expect(html).toContain("25 Years");
    expect(html).toContain("1,490 kWh");
  });

  it("renders Button variants with 44px minimum target height and single-line nowrap discipline", () => {
    const darkPrimary = renderToStaticMarkup(
      <Button variant="primary" tone="dark" href="/deploy">
        Get Solar Estimate
      </Button>,
    );
    expect(darkPrimary).toContain("min-h-[44px]");
    expect(darkPrimary).toContain("whitespace-nowrap");
    expect(darkPrimary).toContain('href="/deploy"');

    const lightSecondary = renderToStaticMarkup(
      <Button variant="secondary" tone="light" type="button">
        Talk to a Solar Advisor
      </Button>,
    );
    expect(lightSecondary).toContain("min-h-[44px]");
    expect(lightSecondary).toContain("bg-[#F4F4F4]");
    expect(lightSecondary).toContain("text-[#171A20]");
  });

  it("renders Reveal SSR-safely without hiding content initially", () => {
    const html = renderToStaticMarkup(
      <Reveal delay={0.15} yOffset={12}>
        <p>Revealable architectural copy</p>
      </Reveal>,
    );

    expect(html).toContain('data-reveal="visible"');
    expect(html).not.toContain("opacity:0");
    expect(html).toContain("Revealable architectural copy");
  });

  it("supports white, surface, and dark variants on QuietSection", () => {
    const darkHtml = renderToStaticMarkup(
      <QuietSection bg="dark" title="Dark Quiet Frame" lead="Restrained section lead.">
        <div>Child block</div>
      </QuietSection>,
    );

    expect(darkHtml).toContain('data-theme="dark"');
    expect(darkHtml).toContain("bg-[#171A20]");
    expect(darkHtml).toContain("Dark Quiet Frame");
  });

  it("enforces Desktop 16:9 -> Mobile 4:5 on EditorialFeature and consistent 4:3 on EditorialCarousel", () => {
    const featureHtml = renderToStaticMarkup(
      <EditorialFeature
        id="test-feature"
        media={{
          src: "/media/home-design-1376w.jpg",
          webp: "/media/home-design-1376w.webp 1376w",
          mobileWebp: "/media/home-design-mobile-800w.webp 800w",
        }}
        title="Editorial Gallery"
        lead="Clean left-aligned copy."
      />,
    );
    expect(featureHtml).toContain("aspect-[4/5] md:aspect-[16/9]");
    expect(featureHtml).toContain("w-full px-0 md:px-8 lg:px-12");
    expect(featureHtml).toContain("md:max-h-[86dvh]");
    expect(featureHtml).not.toContain("max-w-[1344px]");
    expect(featureHtml).toContain('media="(max-width: 768px)"');
    expect(featureHtml).toContain('data-theme="light"');

    const carouselHtml = renderToStaticMarkup(
      <EditorialCarousel
        label="Feature gallery"
        slides={[
          {
            id: "s1",
            media: {
              src: "/media/res-hero-1376w.jpg",
              webp: "/media/res-hero-1376w.webp 1376w",
              mobileWebp: "/media/res-hero-mobile-614w.webp 614w",
            },
            title: "Slide One",
            description: "First detail.",
          },
        ]}
      />,
    );
    expect(carouselHtml).toContain("aspect-[4/3]");
    expect(carouselHtml).not.toContain('media="(max-width: 768px)"');
    expect(carouselHtml).toContain('aria-roledescription="carousel"');
    expect(carouselHtml).toContain('aria-label="1 of 1"');
  });

  it("renders Obsidian #000000 SpecsGrid and formatted kWh units in BatteryHonestyAdvisor", () => {
    const specsHtml = renderToStaticMarkup(
      <SpecsGrid
        id="specs-test"
        title="System Specs"
        categories={[{ title: "Modules", items: [{ label: "Power", value: "580W" }] }]}
      />,
    );
    expect(specsHtml).toContain('data-theme="dark"');
    expect(specsHtml).toContain("bg-[#000000]");
    expect(specsHtml).toContain("580W");

    const batteryHtml = renderToStaticMarkup(<BatteryHonestyAdvisor />);
    expect(batteryHtml).toContain("42.9 kWh");
    expect(batteryHtml).not.toContain("42.900000000000006");
  });
});
