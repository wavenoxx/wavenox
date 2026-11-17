import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

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
      search?: Record<string, string | number | boolean>;
      children?: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const query =
        search && Object.keys(search).length > 0
          ? `?${new URLSearchParams(
              Object.entries(search).map(([k, v]) => [k, String(v)]),
            ).toString()}`
          : "";
      const href = `${to}${query}${hash ? `#${hash}` : ""}`;
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    },
    useNavigate: () => vi.fn(),
    useRouterState: () => ({
      location: { pathname: "/" },
      matches: [{ staticData: { headerTone: "overlay" } }],
    }),
  };
});

function decodeHtmlEntities(html: string): string {
  return html.replace(/&amp;/g, "&").replace(/&#x27;/g, "'");
}

import { Route } from "./index";

async function renderHomeHtml(): Promise<string> {
  const HomePage = Route.options.component as React.ComponentType & {
    preload?: () => Promise<unknown>;
  };
  if (typeof HomePage.preload === "function") {
    await HomePage.preload();
  }
  return decodeHtmlEntities(renderToStaticMarkup(<HomePage />));
}

describe("Phase 1 / Workstream 4 Eight-Scene Homepage", () => {
  it("preserves all 10 required legacy anchor IDs uniquely with 9 structural main sections (down from 10)", async () => {
    const html = await renderHomeHtml();

    const requiredIds = [
      "solar-panels",
      "solutions",
      "design",
      "heat-performance",
      "outage-protection",
      "monitoring",
      "savings",
      "process",
      "faq",
      "consultation",
    ];

    for (const id of requiredIds) {
      const matches = html.match(new RegExp(`id="${id}"`, "g")) || [];
      expect(matches.length, `Expected id="${id}" once`).toBe(1);
    }

    const sectionTags = html.match(/<section\b/g) || [];
    expect(sectionTags.length).toBe(9);
  });

  it("renders truthful monitoring illustration without Realtime/animate-pulse claims and uses closing height on Scene 8", async () => {
    const decoded = await renderHomeHtml();

    expect(decoded).toContain("Illustrative monitoring example");
    expect(decoded).not.toContain("Realtime");
    expect(decoded).not.toContain("animate-pulse");
    expect(decoded).toContain("Standard grid-tied solar shuts down during power cuts");
    expect(decoded).toContain('data-panel-height="closing"');
    expect(decoded).toContain("15 Mins");
    expect(decoded).toContain("₹0");
  });

  it("preserves Borderless Scene 2 CTAs, Scene 5 DISCOM Estimator contract, Scene 6 6 steps, and Scene 7 Governance + FAQ sync", async () => {
    const decoded = await renderHomeHtml();

    // Scene 2 product links + studio link without dense bullet lists
    expect(decoded).toContain('href="/residential"');
    expect(decoded).toContain('href="/omnigrid"');
    expect(decoded).toContain('href="/enterprise"');
    expect(decoded).toContain("Compare options in the Design Studio");

    // Scene 5 estimator defaults + search handoff
    expect(decoded).toContain("Verified TGERC Schedule");
    expect(decoded).toContain('href="/deploy?bill=8000&discom=TGSPDCL"');
    expect(decoded).toContain('href="/legal/disclosures#sources"');

    // Scene 6 milestones 01..06
    for (const num of ["01", "02", "03", "04", "05", "06"]) {
      expect(decoded).toContain(`STEP ${num}`);
    }

    // Scene 7 governance pillars + synced FAQ JSON-LD
    expect(decoded).toContain('href="/warranty"');
    expect(decoded).toContain('href="/our-story"');
    expect(decoded).toContain('href="/faq"');

    const headResult = await Route.options.head?.({} as never);
    const faqScript = headResult?.scripts?.find(
      (s) => typeof s?.children === "string" && s.children.includes('"FAQPage"'),
    );
    expect(faqScript).toBeDefined();
    const faqJson = JSON.parse(faqScript!.children as string) as {
      mainEntity: { name: string; acceptedAnswer: { text: string } }[];
    };
    expect(faqJson.mainEntity.length).toBe(6);
    expect(decoded).toContain(faqJson.mainEntity[0].acceptedAnswer.text);
    for (const q of faqJson.mainEntity) {
      expect(decoded).toContain(q.name);
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(40);
    }
  });
});
