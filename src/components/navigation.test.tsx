import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const mockUseRouterState = vi.fn(() => ({
  location: { pathname: "/" },
  matches: [{ staticData: { headerTone: "overlay" } }],
}));

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({
      to,
      hash,
      search,
      children,
      ...rest
    }: {
      to: string;
      hash?: string;
      search?: Record<string, string>;
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const query =
        search && Object.keys(search).length > 0
          ? `?${new URLSearchParams(search).toString()}`
          : "";
      const href = `${to}${query}${hash ? `#${hash}` : ""}`;
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    },
    useNavigate: () => vi.fn(),
    useRouterState: () => mockUseRouterState(),
  };
});

import { Header } from "./Header";
import { MegaMenu, type MegaMenuCategory } from "./MegaMenu";
import { Footer } from "./Footer";
import { BRAND_CONFIG } from "@/config/brand";

function extractHrefs(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&"));
}

describe("Phase 1 / Workstream 3 Navigation, MegaMenu & Footer Architecture", () => {
  it("renders null when MegaMenu activeCategory is null", () => {
    const html = renderToStaticMarkup(
      <MegaMenu
        activeCategory={null}
        onClose={() => {}}
        onMouseEnter={() => {}}
        onMouseLeave={() => {}}
      />,
    );
    expect(html).toBe("");
  });

  it("renders Header with 4 top-level labels, custom SVG BrandLogo, icon-only hero utilities, and no private routes", () => {
    mockUseRouterState.mockReturnValue({
      location: { pathname: "/" },
      matches: [{ staticData: { headerTone: "overlay" } }],
    });
    const html = renderToStaticMarkup(<Header />);
    const decoded = html.replace(/&amp;/g, "&");

    expect(decoded).toContain('aria-label="WAVENOX Home"');
    expect(decoded).toContain("<svg");
    expect(decoded).toContain('<span class="sr-only">WAVENOX</span>');

    expect(decoded).toContain('aria-label="Main Navigation"');
    const navMatch = decoded.match(
      /<nav\b[^>]*aria-label="Main Navigation"[^>]*>([\s\S]*?)<\/nav>/,
    );
    expect(navMatch).not.toBeNull();
    const navHtml = navMatch![1];

    const navLabels = [...navHtml.matchAll(/<a\b[^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);
    expect(navLabels).toEqual(["Solar Panels", "Solar + Storage", "Commercial", "Discover"]);
    expect(navHtml).not.toContain("Design Studio");

    expect(decoded).toContain('aria-label="Solar FAQ and Support"');
    expect(decoded).toContain('aria-label="Supported States and DISCOMs"');
    expect(decoded).not.toContain("Talk to Advisor");

    expect(html).toContain("hidden lg:flex");
    expect(html).toContain("lg:hidden");
    expect(html).not.toContain("/ops");
    expect(html).not.toContain("/portal");
  });

  it("renders Liquid Glass header with Get Solar Quote CTA on solid sub-pages", () => {
    mockUseRouterState.mockReturnValue({
      location: { pathname: "/deploy" },
      matches: [{ staticData: { headerTone: "solid" } }],
    });
    const html = renderToStaticMarkup(<Header />);
    const decoded = html.replace(/&amp;/g, "&");

    expect(decoded).toContain("header-liquid-glass-light");
    expect(decoded).toContain("Get Solar Quote");
    expect(decoded).not.toContain("Talk to Advisor");
  });

  it("renders unified clickable MegaMenu cards with lazy 640w imagery, zero nested links, and unique destinations per menu", () => {
    const categories: Exclude<MegaMenuCategory, null>[] = [
      "solar",
      "omnigrid",
      "commercial",
      "discover",
    ];

    for (const cat of categories) {
      const html = renderToStaticMarkup(
        <MegaMenu
          activeCategory={cat}
          onClose={() => {}}
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        />,
      );

      expect(html).toContain('id="wavenox-megamenu"');
      expect(html).not.toContain(">Learn</a>");
      expect(html).not.toContain(">Get Estimate</a>");
      expect(html).not.toContain("/ops");
      expect(html).not.toContain("/portal");

      if (cat !== "discover") {
        const imgs = [...html.matchAll(/<img\b([^>]*)>/g)];
        expect(imgs.length).toBe(3);
        for (const img of imgs) {
          expect(img[1]).toMatch(/src="\/media\/.+-640w\.webp"/);
          expect(img[1]).toContain('loading="lazy"');
          expect(img[1]).toContain('decoding="async"');
        }
      }

      const hrefs = extractHrefs(html);
      const uniqueHrefs = new Set(hrefs);
      expect(uniqueHrefs.size).toBe(hrefs.length);
      expect(hrefs.length).toBeGreaterThanOrEqual(7);
    }
  });

  it("renders Footer with 4 balanced columns, 20 unique directory destinations, contact strip, and zero private routes", () => {
    const html = renderToStaticMarkup(<Footer />);
    const decoded = html.replace(/&amp;/g, "&");

    const headings = [...decoded.matchAll(/<h2\b[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
    expect(headings).toEqual([
      "Solar & Storage",
      "Engineering & Guides",
      "Service & Company",
      "Legal & Governance",
    ]);

    // Extract only the 4-column directory grid links + advisor action button inside columns
    const gridMatch = decoded.match(
      /<div class="grid grid-cols-2 md:grid-cols-4[^"]*">([\s\S]*?)<\/div>\s*<div class="mt-12 pt-8 border-t border-\[#E3E4E6\]/,
    );
    expect(gridMatch).not.toBeNull();
    const gridHtml = gridMatch![1];
    const gridHrefs = extractHrefs(gridHtml);
    const gridButtons = [...gridHtml.matchAll(/<button\b[^>]*>([^<]+)<\/button>/g)].map(
      (m) => `btn:${m[1]}`,
    );

    const directoryDestinations = [...gridHrefs, ...gridButtons];
    expect(directoryDestinations.length).toBe(20);
    expect(new Set(directoryDestinations).size).toBe(20);

    expect(decoded).toContain(BRAND_CONFIG.contact.phone.display);
    expect(decoded).toContain(BRAND_CONFIG.contact.whatsapp.display);
    expect(decoded).toContain(BRAND_CONFIG.contact.email);
    expect(decoded).toContain('href="https://pmsuryaghar.gov.in"');
    expect(decoded).not.toContain("/ops");
    expect(decoded).not.toContain("/portal");
  });
});
