import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Panel } from "./Panel";
import { StatRow } from "./StatRow";
import { Button } from "./Button";
import { Reveal } from "./Reveal";
import { QuietSection } from "./QuietSection";

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
});
