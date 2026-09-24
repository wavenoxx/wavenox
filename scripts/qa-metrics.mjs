import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.resolve(rootDir, "qa-artifacts/phase2/after");

const routes = [
  { name: "home", path: "/", maxWords: 450, maxIcons: 8, maxOrderCtas: 6, maxConsultCtas: 3 },
  { name: "residential", path: "/residential", maxWords: 350 },
  { name: "omnigrid", path: "/omnigrid", maxWords: 350 },
  { name: "enterprise", path: "/enterprise", maxWords: 450 }, // has detailed RFP form
  { name: "deploy", path: "/deploy", maxWords: 600 }, // configurator with multi-tier specs
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404 || res.status === 200) {
        return true;
      }
    } catch {
      // wait and retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for server at ${url}`);
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const port = 8080;
  const baseUrl = `http://127.0.0.1:${port}`;

  let serverProcess = null;

  try {
    const res = await fetch(baseUrl);
    if (res.ok) {
      console.log(`Server already running at ${baseUrl}`);
    }
  } catch {
    console.log(`Starting dev server on port ${port}...`);
    serverProcess = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
      cwd: rootDir,
      stdio: "pipe",
      detached: false,
    });

    serverProcess.stdout.on("data", (d) => process.stdout.write(d));
    serverProcess.stderr.on("data", (d) => process.stderr.write(d));

    await waitForServer(baseUrl);
    console.log(`Server ready at ${baseUrl}`);
  }

  const browser = await chromium.launch({ headless: true });
  const results = [];
  let overallPassed = true;

  try {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      for (const route of routes) {
        const fullUrl = `${baseUrl}${route.path}`;
        console.log(`\nEvaluating [${vp.name}] ${route.name} (${fullUrl})...`);
        await page.goto(fullUrl, { waitUntil: "networkidle" });
        await page.waitForTimeout(1000);

        // Capture screenshot
        const screenshotPath = path.join(outDir, `${route.name}-${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        // Evaluate metrics on the page
        const metrics = await page.evaluate(() => {
          // Word count across visible text
          const bodyText = document.body.innerText || "";
          const words = bodyText
            .trim()
            .split(/\s+/)
            .filter((w) => w.length > 0);

          // Count SVG icons
          const svgs = document.querySelectorAll("svg");
          // Visible icons only
          let visibleIcons = 0;
          svgs.forEach((s) => {
            const rect = s.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) visibleIcons++;
          });

          // Count CTAs
          const buttonsAndLinks = Array.from(document.querySelectorAll("button, a"));
          let orderCtas = 0;
          let consultCtas = 0;
          buttonsAndLinks.forEach((el) => {
            const t = (el.textContent || "").toLowerCase().trim();
            if (t.includes("order now") || t.includes("configure")) orderCtas++;
            if (t.includes("consultation")) consultCtas++;
          });

          // Check text < 12px
          const allElements = Array.from(document.querySelectorAll("body *"));
          const tinyTextElements = [];
          allElements.forEach((el) => {
            const tag = el.tagName.toLowerCase();
            if (["script", "style", "svg", "path", "noscript"].includes(tag)) return;
            const style = window.getComputedStyle(el);
            if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0")
              return;
            const text = el.innerText?.trim();
            if (!text) return;

            const fontSize = parseFloat(style.fontSize);
            if (fontSize < 12) {
              // Ignore if element is just a container and direct children have proper sizes
              const hasDirectText = Array.from(el.childNodes).some(
                (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim().length > 0,
              );
              if (hasDirectText) {
                tinyTextElements.push({
                  tag,
                  text: text.slice(0, 30),
                  fontSize,
                });
              }
            }
          });

          // Check horizontal overflow
          const docEl = document.documentElement;
          const hasHorizontalOverflow = docEl.scrollWidth > docEl.clientWidth + 2;

          // Check font loading
          const isInterLoaded = document.fonts.check("16px 'Inter Variable'");

          return {
            wordCount: words.length,
            iconCount: visibleIcons,
            orderCtas,
            consultCtas,
            tinyTextCount: tinyTextElements.length,
            tinyTextSamples: tinyTextElements.slice(0, 3),
            hasHorizontalOverflow,
            scrollWidth: docEl.scrollWidth,
            clientWidth: docEl.clientWidth,
            isInterLoaded,
          };
        });

        // Verification checks
        const checks = {
          wordBudget: route.maxWords ? metrics.wordCount <= route.maxWords : true,
          iconBudget: route.maxIcons ? metrics.iconCount <= route.maxIcons : true,
          orderCtaBudget: route.maxOrderCtas ? metrics.orderCtas <= route.maxOrderCtas : true,
          consultCtaBudget: route.maxConsultCtas
            ? metrics.consultCtas <= route.maxConsultCtas
            : true,
          zeroTinyText: metrics.tinyTextCount === 0,
          zeroOverflow: !metrics.hasHorizontalOverflow,
        };

        const passed = Object.values(checks).every(Boolean);
        if (!passed) overallPassed = false;

        results.push({
          route: route.name,
          viewport: vp.name,
          passed,
          metrics,
          checks,
        });

        console.log(
          `  Words: ${metrics.wordCount} (max: ${route.maxWords || "N/A"}) -> ${checks.wordBudget ? "PASS" : "FAIL"}`,
        );
        console.log(
          `  Icons: ${metrics.iconCount} (max: ${route.maxIcons || "N/A"}) -> ${checks.iconBudget ? "PASS" : "FAIL"}`,
        );
        console.log(
          `  Tiny Text (<12px): ${metrics.tinyTextCount} -> ${checks.zeroTinyText ? "PASS" : "FAIL"}`,
        );
        console.log(
          `  Horizontal Overflow: ${metrics.hasHorizontalOverflow ? "YES" : "NO"} (${metrics.scrollWidth} vs ${metrics.clientWidth}) -> ${checks.zeroOverflow ? "PASS" : "FAIL"}`,
        );
      }

      await context.close();
    }

    console.log("\n========================================================");
    console.log("            QA VERIFICATION SUMMARY TABLE               ");
    console.log("========================================================");
    console.table(
      results.map((r) => ({
        Route: r.route,
        VP: r.viewport,
        Status: r.passed ? "PASS" : "FAIL",
        Words: r.metrics.wordCount,
        Icons: r.metrics.iconCount,
        TinyText: r.metrics.tinyTextCount,
        Overflow: r.metrics.hasHorizontalOverflow ? "OVERFLOW" : "NONE",
      })),
    );

    if (!overallPassed) {
      console.warn("One or more QA checks failed. Please review details above.");
    } else {
      console.log("\nAll visual QA budgets and rules passed cleanly!");
    }
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
  }
}

main().catch((err) => {
  console.error("QA script failed:", err);
  process.exit(1);
});
