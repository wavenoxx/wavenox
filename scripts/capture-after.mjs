import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDirName = process.argv[2] || "phase-1";
const outDir = path.resolve(rootDir, `qa-artifacts/${outDirName}`);

const routes = [
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
  { name: "legal-terms", path: "/legal/terms" },
  { name: "legal-privacy", path: "/legal/privacy" },
  { name: "legal-disclosures", path: "/legal/disclosures" },
  { name: "order-received", path: "/order/received" },
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
  const baseUrl = `http://localhost:${port}`;

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

  try {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();

      for (const route of routes) {
        const fullUrl = `${baseUrl}${route.path}`;
        console.log(`Capturing [${vp.name}] ${route.name} (${fullUrl})...`);
        await page.goto(fullUrl, { waitUntil: "networkidle" });
        await page.waitForTimeout(1000);

        const screenshotPath = path.join(outDir, `${route.name}-${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Saved -> ${screenshotPath}`);
      }
      await context.close();
    }
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
  }

  console.log(`\nAll phase screenshots saved into ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
