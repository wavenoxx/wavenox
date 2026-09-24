import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.resolve(rootDir, "qa-artifacts/phase2/before");

const routes = [
  { name: "home", path: "/" },
  { name: "deploy", path: "/deploy" },
  { name: "residential", path: "/residential" },
  { name: "enterprise", path: "/enterprise" },
  { name: "omnigrid", path: "/omnigrid" },
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
  let serverAlreadyRunning = false;

  try {
    const res = await fetch(baseUrl);
    if (res.ok) {
      serverAlreadyRunning = true;
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
        // wait an extra 500ms for animations / images to settle
        await page.waitForTimeout(1000);

        const screenshotPath = path.join(outDir, `${route.name}-${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`Saved -> ${screenshotPath}`);
      }

      await context.close();
    }
    console.log("All baseline screenshots captured successfully!");
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill("SIGTERM");
    }
  }
}

main().catch((err) => {
  console.error("Baseline capture failed:", err);
  process.exit(1);
});
