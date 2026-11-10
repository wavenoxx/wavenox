import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";
import { gzipSync } from "node:zlib";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

const base = "http://127.0.0.1:45745";
const output = "qa-artifacts/step8";
const pages = [
  "/",
  "/residential",
  "/enterprise",
  "/deploy",
  "/net-metering",
  "/architects",
  "/legal/privacy",
  "/legal/terms",
];
const sizes = [
  [320, 720],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
];
const failures = [];
const report = {
  configuration:
    "Node production build, loopback, LIVE fail-closed, AI/email disabled; synthetic lab measurements, no production traffic",
  seo: [],
  accessibility: [],
  performance: [],
  assets: {},
  limitations: [
    "No field INP or CrUX traffic data",
    "Lighthouse TBT is a lab responsiveness proxy, not INP",
    "Loopback TTFB is not hosting latency",
    "Automated axe/keyboard checks do not replace a full assistive-technology audit",
  ],
};
await mkdir(output, { recursive: true });
const server = spawn(process.execPath, [".output/server/index.mjs"], {
  env: {
    ...process.env,
    NODE_ENV: "production",
    HOST: "127.0.0.1",
    PORT: "45745",
    LEAD_MODE: "live",
    VITE_LEAD_MODE: "live",
    SUPABASE_URL: "",
    VITE_SUPABASE_URL: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    SUPABASE_SECRET_KEY: "",
    BILL_AI_ENABLED: "false",
    PORTAL_EMAIL_ENABLED: "false",
  },
  stdio: "ignore",
});
let browser, chrome;
try {
  let ready = false;
  for (let n = 0; n < 100; n++) {
    if (
      await fetch(base)
        .then((r) => r.ok)
        .catch(() => false)
    ) {
      ready = true;
      break;
    }
    await setTimeout(300);
  }
  assert.ok(ready, "production server must start");
  for (const path of [
    "/ops",
    "/portal",
    "/api/projects",
    "/api/bill-extraction",
    "/order/received",
    "/does-not-exist-release-audit",
  ]) {
    const response = await fetch(base + path);
    assert.match(response.headers.get("cache-control") || "", /no-store/, path);
    assert.match(response.headers.get("x-robots-tag") || "", /noindex/, path);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    if (path.includes("does-not-exist")) assert.equal(response.status, 404);
    if (path === "/api/projects")
      assert.equal(response.status, 503, "LIVE unconfigured must not substitute DEMO");
  }
  const sitemap = await (await fetch(base + "/sitemap.xml")).text();
  const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  assert.equal(routes.length, 16);
  assert.doesNotMatch(sitemap, /<lastmod>|\/portal|\/ops|\/api\//);
  const robots = await (await fetch(base + "/robots.txt")).text();
  for (const path of ["/portal", "/ops", "/api/", "/_serverFn/"])
    assert.ok(robots.includes(`Disallow: ${path}`));
  browser = await chromium.launch();
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  const titles = new Set(),
    descriptions = new Set();
  for (const path of routes) {
    const response = await page.goto(base + path, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200, path);
    const data = await page.evaluate(() => ({
      title: document.title,
      descriptions: [...document.querySelectorAll('meta[name="description"]')].map(
        (e) => e.content,
      ),
      canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map((e) => e.href),
      schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map((e) =>
        JSON.parse(e.textContent),
      ),
    }));
    if (titles.has(data.title) || !data.title) failures.push(`${path}: duplicate/missing title`);
    titles.add(data.title);
    if (
      data.descriptions.length !== 1 ||
      !data.descriptions[0] ||
      descriptions.has(data.descriptions[0])
    )
      failures.push(`${path}: duplicate/missing description`);
    descriptions.add(data.descriptions[0]);
    if (data.canonicals.length !== 1 || new URL(data.canonicals[0]).pathname !== path)
      failures.push(`${path}: canonical mismatch`);
    report.seo.push({ path, ...data });
  }
  for (const path of pages) {
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await page.goto(base + path, { waitUntil: "networkidle" });
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        h1: document.querySelectorAll("h1").length,
        main: document.querySelectorAll("main").length,
        smallText: [...document.querySelectorAll("body *")].filter(
          (e) =>
            e.getBoundingClientRect().width &&
            e.getBoundingClientRect().height &&
            [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) &&
            parseFloat(getComputedStyle(e).fontSize) < 12,
        ).length,
      }));
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      const serious = axe.violations.filter((v) => ["serious", "critical"].includes(v.impact));
      if (
        layout.overflow > 2 ||
        layout.h1 !== 1 ||
        layout.main !== 1 ||
        layout.smallText ||
        serious.length
      )
        failures.push(`${path} ${width}: layout/axe failure`);
      await page.keyboard.press("Tab");
      const keyboard = await page.evaluate(() => document.activeElement !== document.body);
      if (!keyboard) failures.push(`${path} ${width}: no keyboard focus`);
      report.accessibility.push({
        path,
        width,
        height,
        ...layout,
        keyboard,
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          targets: v.nodes.map((n) => n.target),
        })),
      });
      if (width === 390 || width === 1440)
        await page.screenshot({
          path: `${output}/${path.replaceAll("/", "_") || "home"}-${width}.png`,
          fullPage: true,
        });
    }
  }
  await browser.close();
  browser = null;
  chrome = await launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
  });
  for (const path of pages) {
    for (const formFactor of ["mobile", "desktop"]) {
      const desktop = formFactor === "desktop";
      const result = await lighthouse(base + path, {
        port: chrome.port,
        output: "json",
        logLevel: "error",
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        formFactor,
        screenEmulation: desktop
          ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }
          : undefined,
        throttlingMethod: "simulate",
        ...(desktop
          ? {
              throttling: {
                rttMs: 40,
                throughputKbps: 10240,
                cpuSlowdownMultiplier: 1,
                requestLatencyMs: 0,
                downloadThroughputKbps: 0,
                uploadThroughputKbps: 0,
              },
            }
          : {}),
      });
      const { lhr } = result;
      const metrics = {
        path,
        formFactor,
        performance: Math.round(lhr.categories.performance.score * 100),
        lcpMs: lhr.audits["largest-contentful-paint"].numericValue,
        cls: lhr.audits["cumulative-layout-shift"].numericValue,
        tbtMs: lhr.audits["total-blocking-time"].numericValue,
        ttfbMs: lhr.audits["server-response-time"]?.numericValue,
        transferBytes: lhr.audits["total-byte-weight"].numericValue,
        lighthouseVersion: lhr.lighthouseVersion,
      };
      report.performance.push(metrics);
      await writeFile(
        `${output}/lighthouse-${path.replaceAll("/", "_") || "home"}-${formFactor}.json`,
        result.report,
      );
      if (
        lhr.runtimeError ||
        metrics.performance < (desktop ? 85 : 70) ||
        metrics.lcpMs > (desktop ? 2500 : 4000) ||
        metrics.cls > 0.1 ||
        metrics.tbtMs > (desktop ? 300 : 600)
      )
        failures.push(`${path} ${formFactor}: performance budget exceeded`);
    }
  }
  const assets = [];
  for (const file of await readdir(".output/public/assets"))
    if (file.endsWith(".js")) {
      const data = await readFile(`.output/public/assets/${file}`);
      assets.push({ file, bytes: data.length, gzipBytes: gzipSync(data).length });
    }
  report.assets = {
    javascriptFiles: assets.length,
    totalBytes: assets.reduce((a, b) => a + b.bytes, 0),
    largest: assets.sort((a, b) => b.gzipBytes - a.gzipBytes).slice(0, 8),
  };
  // All chunks are not initial load: PDF parsing intentionally remains lazy.
  console.table(report.performance);
} finally {
  await browser?.close();
  await chrome?.kill();
  server.kill();
  await writeFile(
    `${output}/release-report.json`,
    JSON.stringify({ ...report, failures }, null, 2),
  );
}
assert.deepEqual(failures, [], "Release audit budgets and checks");
