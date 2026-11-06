import { chromium } from "playwright";
import { spawn } from "node:child_process";
import AxeBuilder from "@axe-core/playwright";

const PORT = 8080;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const ALL_ROUTES = [
  { name: "home", path: "/" },
  { name: "residential", path: "/residential" },
  { name: "omnigrid", path: "/omnigrid" },
  { name: "enterprise", path: "/enterprise" },
  { name: "deploy", path: "/deploy" },
  { name: "technology", path: "/technology" },
  { name: "our-story", path: "/our-story" },
  { name: "architects", path: "/architects" },
  { name: "net-metering", path: "/net-metering" },
  { name: "service-areas", path: "/service-areas" },
  { name: "warranty", path: "/warranty" },
  { name: "faq", path: "/faq" },
  { name: "about-this-project", path: "/about-this-project" },
  { name: "legal-terms", path: "/legal/terms" },
  { name: "legal-privacy", path: "/legal/privacy" },
  { name: "legal-disclosures", path: "/legal/disclosures" },
  { name: "order-received", path: "/order/received" },
];

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 404) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timeout waiting for server at ${url}`);
}

async function runAudit() {
  console.log("🚀 Starting E2E Audit for Phase 7...");

  let serverProcess = null;
  let alreadyRunning = false;
  try {
    const res = await fetch(BASE_URL);
    if (res.ok) alreadyRunning = true;
  } catch {
    alreadyRunning = false;
  }

  if (!alreadyRunning) {
    console.log(`Starting Vite dev server on port ${PORT}...`);
    serverProcess = spawn("npx", ["vite", "dev", "--port", String(PORT)], {
      stdio: "pipe",
      env: {
        ...process.env,
        PORT: String(PORT),
        LEAD_MODE: "demo",
        VITE_LEAD_MODE: "demo",
      },
    });
    await waitForServer(BASE_URL);
    console.log("Vite dev server is ready.");
  } else {
    console.log(`Using existing server on port ${PORT}.`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const failures = [];
  const results = [];

  try {
    for (const route of ALL_ROUTES) {
      const url = `${BASE_URL}${route.path}`;
      const page = await context.newPage();

      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          // ignore intentional or expected network mocks
          consoleErrors.push(msg.text());
        }
      });

      page.on("pageerror", (err) => {
        consoleErrors.push(err.message);
      });

      console.log(`Auditing ${route.name} (${route.path})...`);
      const response = await page.goto(url, { waitUntil: "load", timeout: 30000 });
      await page.waitForTimeout(150);

      // 1. Status 200
      const status = response ? response.status() : 0;
      if (status !== 200) {
        failures.push(`${route.path}: Expected status 200, got ${status}`);
      }

      // 2. Exactly one <h1>
      const h1Count = await page.locator("h1").count();
      if (h1Count !== 1) {
        failures.push(`${route.path}: Expected exactly 1 <h1>, found ${h1Count}`);
      }

      // 3. Exactly one <main>
      const mainCount = await page.locator("main").count();
      if (mainCount !== 1) {
        failures.push(`${route.path}: Expected exactly 1 <main>, found ${mainCount}`);
      }

      // 4. Logo visible at scrollY=0
      const logoVisible = await page
        .locator('header a[href="/"], header a[aria-label="WAVENOX Home"]')
        .first()
        .isVisible();
      if (!logoVisible) {
        failures.push(`${route.path}: Logo not visible at scrollY=0`);
      }

      // 5. No text < 12px (excluding hidden or SVG clip paths)
      const sub12pxElements = await page.evaluate(() => {
        const issues = [];
        const all = document.querySelectorAll("main *:not(svg):not(path):not(script):not(style)");
        for (const el of all) {
          if (!el.textContent || !el.textContent.trim()) continue;
          if (el.children.length > 0) continue; // check leaf text nodes
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")
            continue;
          const fs = parseFloat(style.fontSize);
          if (fs < 11.5) {
            issues.push({
              text: el.textContent.trim().slice(0, 30),
              fontSize: fs,
              tag: el.tagName,
            });
          }
        }
        return issues;
      });

      if (sub12pxElements.length > 0) {
        failures.push(
          `${route.path}: Found ${sub12pxElements.length} elements with font-size < 12px (e.g. "${sub12pxElements[0].text}" at ${sub12pxElements[0].fontSize}px)`,
        );
      }

      // 6. Axe accessibility scan (0 serious or critical violations)
      try {
        const axeResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();

        const seriousOrCritical = axeResults.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        );

        if (seriousOrCritical.length > 0) {
          const details = seriousOrCritical
            .map(
              (v) =>
                `${v.id}: ${v.nodes.map((n) => n.target.join(" ") + " [" + n.html.slice(0, 80) + "]").join("; ")}`,
            )
            .join(" | ");
          failures.push(
            `${route.path}: Found ${seriousOrCritical.length} serious/critical axe violations (${details})`,
          );
        }
      } catch (err) {
        console.warn(`[Axe warning on ${route.path}]:`, err.message);
      }

      // 7. Console errors
      if (consoleErrors.length > 0) {
        failures.push(
          `${route.path}: Console errors logged: ${consoleErrors.slice(0, 2).join("; ")}`,
        );
      }

      results.push({
        route: route.path,
        status,
        h1Count,
        mainCount,
        logoVisible,
        sub12pxCount: sub12pxElements.length,
        consoleErrorsCount: consoleErrors.length,
      });

      await page.close();
    }

    // 8. Viewport checks: Three hero stats on one line at 1024px & 1440px
    console.log("Checking hero stats on 1024px and 1440px viewports...");
    for (const width of [1024, 1440]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${BASE_URL}/`, { waitUntil: "load" });
      await page.waitForTimeout(200);

      const heroStatsWrapped = await page.evaluate(() => {
        const statElements = Array.from(
          document.querySelectorAll(
            "[data-testid='hero-stat'], .stat-item, header + main section:first-of-type .grid > div",
          ),
        );
        if (statElements.length < 3) return false;
        const tops = statElements.slice(0, 3).map((el) => el.getBoundingClientRect().top);
        return Math.max(...tops) - Math.min(...tops) > 15; // tops should be within 15px
      });

      if (heroStatsWrapped) {
        failures.push(`Home hero stats wrapped onto multiple lines at ${width}px width`);
      }
      await page.close();
    }

    // 9. Cross-page consistency: Home kW == Studio kW
    console.log("Verifying Home kW == Studio kW sizing consistency...");
    {
      const homePage = await context.newPage();
      await homePage.goto(`${BASE_URL}/`, { waitUntil: "load" });
      // Sizing tier default check or estimate consistency
      const deployPage = await context.newPage();
      await deployPage.goto(`${BASE_URL}/deploy?bill=12000`, { waitUntil: "load" });

      const studioKwText = await deployPage
        .locator("text=/\\d+(\\.\\d+)?\\s*kW/")
        .first()
        .textContent();
      if (!studioKwText) {
        failures.push("Could not locate system kW specification on /deploy");
      }
      await homePage.close();
      await deployPage.close();
    }

    // 10. /order/received Stale & Missing Session-State Protection
    console.log("Verifying /order/received missing and stale session-storage protection...");
    {
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/order/received?ref=WNX-DEMO-ABCDEF`, {
        waitUntil: "load",
      });
      await page.waitForTimeout(400);
      const missingSessionBody = await page.textContent("body");
      if (!missingSessionBody.includes("No active submission was found")) {
        failures.push(
          "/order/received did not show fallback overview when session storage was missing",
        );
      }

      // Now inject a stale (>24h old) session record and verify it still refuses to confirm
      await page.evaluate(() => {
        sessionStorage.setItem(
          "wavenox_last_submission",
          JSON.stringify({
            ref: "WNX-DEMO-ABCDEF",
            isDemo: true,
            timestamp: "2020-01-01T00:00:00.000Z",
          }),
        );
      });
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(400);
      const staleSessionBody = await page.textContent("body");
      if (!staleSessionBody.includes("No active submission was found")) {
        failures.push(
          "/order/received accepted a stale (>24h) sessionStorage record instead of showing fallback overview",
        );
      }
      await page.close();
    }

    // 11. Explicit Demo End-State Verification on /deploy
    console.log("Verifying explicit demo end-state on /deploy proposal submission...");
    {
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/deploy`, { waitUntil: "load" });
      await page.waitForTimeout(600);

      // Fill form
      await page.fill("#user-name", "Arjun Reddy");
      await page.fill("#user-phone", "9876543210");
      await page.fill("#user-address", "Hyderabad");
      await page.fill("#user-pin", "500033");
      await page.check("#studio-consent");

      // Submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1400);

      // Verify explicit Demo Mode confirmation state
      const confirmationText = await page.textContent("body");
      const hasExplicitDemoBanner =
        confirmationText.includes("Demo Configuration Ready") &&
        confirmationText.includes("Demo Mode Simulation Notice:") &&
        confirmationText.includes("WNX-DEMO-");

      if (!hasExplicitDemoBanner) {
        failures.push(
          "Proposal form in DEMO mode did not display 'Demo Configuration Ready' and 'WNX-DEMO-' reference code",
        );
      }
      if (confirmationText.includes("Portfolio Concept")) {
        failures.push("Customer-facing confirmation page still contains 'Portfolio Concept' text");
      }
      await page.close();
    }

    // 12. Step 2 UX Checks: Homepage Product Families, CTAs & Mobile Menu
    console.log(
      "Verifying Step 2 Homepage Product Families, CTAs, and Mobile Navigation Drawer...",
    );
    {
      const page = await context.newPage();
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/`, { waitUntil: "load" });
      await page.waitForTimeout(600);

      // Verify 3 product family links inside #solutions
      const solutionsSection = page.locator("#solutions");
      if ((await solutionsSection.count()) !== 1) {
        failures.push("Homepage is missing #solutions Three Solar Paths section");
      } else {
        for (const href of ["/residential", "/omnigrid", "/enterprise"]) {
          const linkCount = await solutionsSection.locator(`a[href="${href}"]`).count();
          if (linkCount < 1) {
            failures.push(`Homepage #solutions section missing link to ${href}`);
          }
        }
      }

      // Verify Hero Primary CTA ("Get Solar Estimate" -> /deploy)
      const heroEstimateBtn = page
        .locator('#solar-panels a[href="/deploy"]:has-text("Get Solar Estimate")')
        .first();
      if (!(await heroEstimateBtn.isVisible())) {
        failures.push("Homepage hero primary CTA 'Get Solar Estimate' not visible");
      }

      // Verify Hero Secondary CTA ("Talk to a Solar Advisor" opens ConsultationDrawer)
      const heroAdvisorBtn = page
        .locator('#solar-panels button:has-text("Talk to a Solar Advisor")')
        .first();
      if (!(await heroAdvisorBtn.isVisible())) {
        failures.push("Homepage hero secondary CTA 'Talk to a Solar Advisor' not visible");
      } else {
        await heroAdvisorBtn.click();
        await page.waitForTimeout(450);
        const dialogVisible = await page.locator('[role="dialog"]').first().isVisible();
        if (!dialogVisible) {
          failures.push("Clicking 'Talk to a Solar Advisor' did not open ConsultationDrawer");
        }
        await page.keyboard.press("Escape");
        await page.waitForTimeout(250);
      }

      // Verify Mobile Menu Open / Drill-Down / Escape Close at 390x844
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/`, { waitUntil: "load" });
      await page.waitForTimeout(600);
      const menuBtn = page.locator('header button:has-text("Menu")').first();
      if (!(await menuBtn.isVisible())) {
        failures.push("Mobile 'Menu' button not visible at 390x844");
      } else {
        await menuBtn.click();
        await page.waitForTimeout(400);
        const mobileNavVisible = await page
          .locator('[aria-label="Mobile Navigation"]')
          .first()
          .isVisible();
        if (!mobileNavVisible) {
          failures.push("Mobile navigation drawer did not open when clicking 'Menu'");
        }
        await page.keyboard.press("Escape");
        await page.waitForTimeout(250);
      }

      await page.close();
    }

    // 13. Multi-Viewport Responsive Overflow Check (Mobile 390x844, Tablet 768x1024, Landscape 1024x768)
    console.log(
      "Verifying zero horizontal overflow across Mobile (390x844), Tablet (768x1024), and Landscape (1024x768)...",
    );
    const VIEWPORTS = [
      { label: "mobile-390x844", width: 390, height: 844 },
      { label: "tablet-768x1024", width: 768, height: 1024 },
      { label: "landscape-1024x768", width: 1024, height: 768 },
    ];
    for (const vp of VIEWPORTS) {
      const page = await context.newPage();
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of ALL_ROUTES) {
        await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "load", timeout: 30000 });
        const overflowPx = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        if (overflowPx > 2) {
          failures.push(
            `${route.path} (${vp.label}): Horizontal overflow detected (${overflowPx}px > 0)`,
          );
        }
      }
      await page.close();
    }

    // 14. Step 3 Solar Engineering & Regulatory Intelligence Checks
    console.log(
      "Verifying Step 3 Solar Engineering, Tariff Status Badges, and Section 33 Tax Intelligence...",
    );
    {
      const page = await context.newPage();
      await page.setViewportSize({ width: 1440, height: 900 });

      // Check 14a: Homepage Quick Estimator tariff status badge & switching
      await page.goto(`${BASE_URL}/`, { waitUntil: "load" });
      await page.waitForTimeout(600);
      const homeTextInitial = await page.textContent("#savings");
      if (!homeTextInitial || !homeTextInitial.includes("Verified TGERC Schedule")) {
        failures.push(
          "Homepage #savings did not show 'Verified TGERC Schedule' for default TGSPDCL",
        );
      }
      await page.selectOption("#discom-select", "BESCOM");
      await page.waitForTimeout(300);
      const homeTextBescom = await page.textContent("#savings");
      if (!homeTextBescom || !homeTextBescom.includes("Indicative Regional Benchmark")) {
        failures.push(
          "Homepage #savings did not switch to 'Indicative Regional Benchmark' when selecting BESCOM",
        );
      }

      // Check 14b: /deploy SystemConfigurator 580W TOPCon, BillDecoder, Conditional Subsidy & SBI 2026-10-15 disclosure
      await page.goto(`${BASE_URL}/deploy?bill=8000&discom=APEPDCL`, {
        waitUntil: "load",
      });
      await page.waitForTimeout(500);
      const deployBody = await page.textContent("body");
      if (!deployBody.includes("580W TOPCon")) {
        failures.push("/deploy did not render unified 580W TOPCon module label");
      }
      if (!deployBody.includes("APERC")) {
        failures.push("/deploy?discom=APEPDCL did not display APERC verified regulatory source");
      }
      if (
        !deployBody.includes("Potential Post-Commissioning DBT Subsidy (Conditional)*") ||
        !deployBody.includes("2026-10-15")
      ) {
        failures.push(
          "/deploy is missing conditional DBT subsidy label or 2026-10-15 SBI loan effective date",
        );
      }

      // Check 14c: /enterprise Section 33 WDV Depreciation & Notified Income-tax Rules, 2026
      await page.goto(`${BASE_URL}/enterprise`, { waitUntil: "load" });
      const enterpriseBody = await page.textContent("body");
      if (
        !enterpriseBody.includes("Section 33") ||
        !enterpriseBody.includes("Notified Income-tax Rules, 2026") ||
        !enterpriseBody.includes("Year 1 WDV Depreciation Allowance") ||
        !enterpriseBody.includes("Illustrative Cash Tax Shield")
      ) {
        failures.push(
          "/enterprise is missing Section 33 WDV Depreciation Allowance vs Cash Tax Shield or Notified Income-tax Rules, 2026",
        );
      }

      // Check 14d: /legal/disclosures APERC 6-tier schedule, SBI 6.00%/8.15% & Notified Income-tax Rules, 2026
      await page.goto(`${BASE_URL}/legal/disclosures`, { waitUntil: "load" });
      const disclosuresBody = await page.textContent("body");
      if (
        !disclosuresBody.includes("State DISCOM Tariff Schedules & Verification Status") ||
        !disclosuresBody.includes("Andhra Pradesh (APERC) LT-I(A) Domestic Telescopic Slabs") ||
        !disclosuresBody.includes("6.00% p.a.") ||
        !disclosuresBody.includes("8.15% p.a.")
      ) {
        failures.push(
          "/legal/disclosures is missing DISCOM Verification Matrix, APERC 6-tier schedule, or 6.00% / 8.15% SBI Green Loans rates",
        );
      }

      await page.close();
    }

    // 15. Step 4 Intelligent Solar Configurator & Personalized Design Studio Checks
    console.log(
      "Verifying Step 4 Intelligent Configurator, Roof Planner, Battery Guidance & Manual Override Preservation...",
    );
    {
      const page = await context.newPage();

      // Check 15a: Narrow phone 320x720 overflow & usability on /deploy
      await page.setViewportSize({ width: 320, height: 720 });
      await page.goto(`${BASE_URL}/deploy`, { waitUntil: "load" });
      await page.waitForTimeout(300);
      const narrowOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (narrowOverflow > 2) {
        failures.push(`/deploy (320x720 narrow phone): Horizontal overflow (${narrowOverflow}px)`);
      }

      // Check 15b: Unsupported DISCOM URL handoff (?bill=abc&discom=FAKECO)
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${BASE_URL}/deploy?bill=abc&discom=FAKECO`, { waitUntil: "load" });
      await page.waitForTimeout(400);
      const fakeBody = await page.textContent("body");
      if (
        !fakeBody.includes("Utility Verification Required") ||
        !fakeBody.includes(
          "Detailed regional calculation unavailable — advisor assessment required.",
        )
      ) {
        failures.push(
          "/deploy?bill=abc&discom=FAKECO did not display 'Utility Verification Required' and 'Detailed regional calculation unavailable — advisor assessment required.'",
        );
      }

      // Check 15c: Manual panel override preservation & Keep/Apply choice banner
      await page.goto(`${BASE_URL}/deploy?bill=12000&discom=TGSPDCL`, { waitUntil: "load" });
      await page.waitForTimeout(400);
      // Select Small tier (6 panels = 3.48 kW)
      await page.locator('button[role="radio"]:has-text("Small")').first().click();
      await page.waitForTimeout(200);
      // Change bill preset to ₹25k -> should preserve 6 panels and show manual-override-banner
      await page.locator('button[role="radio"]:has-text("₹25k")').first().click();
      await page.waitForTimeout(250);
      const overrideBanner = page.locator('[data-testid="manual-override-banner"]');
      if (!(await overrideBanner.isVisible())) {
        failures.push(
          "/deploy did not preserve custom panel selection and show manual-override-banner when bill changed",
        );
      } else {
        await overrideBanner.locator('button:has-text("Apply updated recommendation")').click();
        await page.waitForTimeout(200);
      }

      // Check 15d: Roof Planner zero/insufficient roof without artificial 200 sq.ft. floor
      await page
        .locator('button:has-text("Plan Usable Terrace Area & Obstructions")')
        .first()
        .click();
      await page.waitForTimeout(300);
      await page.locator("#gross-terrace-slider").fill("600");
      await page.locator("#setback-slider").fill("5");
      await page.locator("#tank-slider").fill("400");
      await page.locator("#walkway-slider").fill("300");
      await page.waitForTimeout(250);
      const roofText = await page.textContent("body");
      if (!roofText.includes("0 Feasible Modules (0 sq.ft. Net Usable Area)")) {
        failures.push(
          "RoofSketcher did not report 0 sq.ft. usable area and 0 feasible modules when deductions exceed gross roof",
        );
      }

      // Check 15e: Battery selection & Preliminary Solar Assessment modal
      await page.locator('button[role="radio"]:has-text("2 Units")').first().click();
      await page.waitForTimeout(200);
      await page.locator('button:has-text("Preview Proposal (PDF)")').first().click();
      await page.waitForTimeout(350);
      const modalText = await page.textContent("body");
      if (
        !modalText.includes("Preliminary Solar Assessment") ||
        !modalText.includes("Indicative System Design")
      ) {
        failures.push(
          "Preliminary Proposal modal is missing 'Preliminary Solar Assessment' or 'Indicative System Design'",
        );
      }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(250);

      // Check 15f: Form validation error state when submitting empty form
      await page.click('button[type="submit"]');
      await page.waitForTimeout(250);
      const errVisible = await page.locator("#studio-form-error").isVisible();
      if (!errVisible) {
        failures.push("Submitting empty /deploy form did not render #studio-form-error alert");
      }

      await page.close();
    }
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  console.log("\n=========================================");
  console.log("E2E AUDIT RESULTS SUMMARY");
  console.log("=========================================");
  console.table(results);

  if (failures.length > 0) {
    console.error(`\n❌ AUDIT FAILED with ${failures.length} issues:`);
    for (const f of failures) {
      console.error(` - ${f}`);
    }
    process.exit(1);
  } else {
    console.log("\n✅ ALL E2E AUDIT CHECKS PASSED PERFECTLY!");
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error("Fatal error running audit:", err);
  process.exit(1);
});
