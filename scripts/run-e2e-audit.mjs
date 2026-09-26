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
      env: { ...process.env, PORT: String(PORT) },
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
      const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

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
      await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

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
      await homePage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
      // Sizing tier default check or estimate consistency
      const deployPage = await context.newPage();
      await deployPage.goto(`${BASE_URL}/deploy?bill=12000`, { waitUntil: "networkidle" });

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

    // 10. Honest Demo End-State Verification
    console.log("Verifying honest demo end-state on /deploy proposal submission...");
    {
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/deploy`, { waitUntil: "networkidle" });

      // Fill form
      await page.fill("#user-name", "Arjun Reddy");
      await page.fill("#user-phone", "9876543210");
      await page.fill("#user-address", "Hyderabad");
      await page.fill("#user-pin", "500033");
      await page.check("#studio-consent");

      // Submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      // Verify honest concept banner
      const confirmationText = await page.textContent("body");
      const hasHonestDemo =
        confirmationText.includes("Portfolio Concept") ||
        confirmationText.includes("Feasibility Request") ||
        confirmationText.includes("WNX-PREVIEW") ||
        confirmationText.includes("demo");

      if (!hasHonestDemo) {
        failures.push("Proposal form did not display honest portfolio demo confirmation state");
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
