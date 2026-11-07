import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import sharp from "sharp";
const port = 8096,
  url = `http://127.0.0.1:${port}`;
const artifacts = new URL("../../qa-artifacts/step6/", import.meta.url);
await mkdir(artifacts, { recursive: true });
const server = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port)],
  {
    env: { ...process.env, BILL_AI_ENABLED: "false", LEAD_MODE: "demo", VITE_LEAD_MODE: "demo" },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let serverLog = "";
server.stdout.on("data", (c) => (serverLog += c));
server.stderr.on("data", (c) => (serverLog += c));
let browser;
try {
  let ready = false;
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(url)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  assert(ready, "Vite server must start");
  const capability = await fetch(`${url}/api/bill-extraction`);
  assert.equal(capability.status, 200);
  assert.equal((await capability.json()).available, false);
  const report = [];
  browser = await chromium.launch({ headless: true });
  for (const [device, viewport] of [
    ["desktop", { width: 1440, height: 1000 }],
    ["mobile", { width: 390, height: 844 }],
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    let mode = "success",
      posted = null,
      postCount = 0;
    const f = (key, value, unit = "none", region = "header") => ({
      key,
      value,
      unit,
      quality: "clear",
      page: 1,
      region,
      issue: "none",
    });
    const extraction = {
      fields: [
        f("state", "Telangana"),
        f("discom", "TGSPDCL"),
        f("periodStart", "2026-09-01", "date", "period"),
        f("periodEnd", "2026-10-31", "date", "period"),
        f("billingMonths", 2, "months", "period"),
        f("consumption", 840, "kWh", "readings"),
        f("totalPayable", 6000, "INR", "charges"),
        f("sanctionedLoad", 5, "kW", "connection"),
        f("consumerCategory", "residential"),
        f("connectionType", "three_phase"),
      ],
    };
    await page.route("**/api/bill-extraction", async (route) => {
      if (route.request().method() === "GET")
        return route.fulfill({ json: { available: true, provider: "OpenAI" } });
      postCount++;
      posted = route.request().postDataJSON();
      if (mode === "slow") await new Promise((r) => setTimeout(r, 1000));
      return route
        .fulfill(
          mode === "failure"
            ? { status: 502, json: { error: "unavailable" } }
            : { json: { provider: "OpenAI", extraction } },
        )
        .catch(() => {});
    });
    await page.goto(`${url}/deploy`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Read your electricity bill" }).click();
    const panel = page.getByRole("region", { name: "Bill intelligence" });
    const input = panel.getByLabel("Choose bill document");
    const fixture = (name) => new URL(`./fixtures/${name}`, import.meta.url).pathname;
    await input.setInputFiles(fixture("two-month.png"));
    await panel.getByText("Page 1 · local preview").waitFor();
    assert.equal(postCount, 0, "No transfer before explicit extraction");
    assert(await panel.getByRole("button", { name: "Extract readings with OpenAI" }).isDisabled());
    await panel.getByRole("button", { name: "Reveal locally to redact" }).click();
    await panel.getByRole("button", { name: "Read at full size" }).click();
    assert((await panel.locator("canvas").boundingBox()).width >= 1000);
    await panel.getByRole("button", { name: "Fit preview" }).click();
    await panel.getByRole("button", { name: "Hide bottom quarter" }).click();
    await panel.screenshot({
      style: "header, .fixed.bottom-0 { visibility: hidden !important; }",
      path: new URL(`${device}-redaction.png`, artifacts).pathname,
    });
    await panel.getByLabel(/I have reviewed the redactions/).check();
    await panel.getByRole("button", { name: "Extract readings with OpenAI" }).click();
    await panel.getByText("Readings extracted by OpenAI.", { exact: false }).waitFor();
    assert.equal(postCount, 1);
    assert.equal(posted.pages[0].mime, "image/jpeg");
    const transmitted = Buffer.from(posted.pages[0].data, "base64");
    const meta = await sharp(transmitted).metadata();
    const pixel = await sharp(transmitted)
      .extract({ left: 5, top: Math.floor(meta.height * 0.9), width: 1, height: 1 })
      .raw()
      .toBuffer();
    assert(
      [...pixel].every((value) => value < 30),
      "Redaction is burned into transmitted pixels",
    );
    assert(!JSON.stringify(posted).includes("two-month.png"));
    await panel
      .getByLabel("Period consumption (kWh for whole period)", { exact: false })
      .fill("900");
    await panel.getByLabel("Number of months").fill("1");
    await panel.getByLabel(/I checked the state/).check();
    await panel.getByRole("button", { name: "Confirm and apply bill readings" }).click();
    await panel.getByRole("alert").filter({ hasText: "do not span" }).waitFor();
    await panel.getByLabel("Number of months").fill("2");
    await page.getByRole("button", { name: "Increase panels", exact: true }).click();
    const beforePanels = await page.locator('[data-testid="manual-override-banner"]').count();
    void beforePanels;
    await panel.getByLabel(/I checked the state/).check();
    await panel.screenshot({
      style: "header, .fixed.bottom-0 { visibility: hidden !important; }",
      path: new URL(`${device}-review.png`, artifacts).pathname,
    });
    await panel.getByRole("button", { name: "Confirm and apply bill readings" }).click();
    await page.getByTestId("confirmed-bill-basis").waitFor();
    assert.equal(await page.locator("#studio-monthly-units").inputValue(), "450");
    assert.equal(await page.locator("#studio-discom").inputValue(), "TGSPDCL");
    assert(await page.getByTestId("manual-override-banner").isVisible());
    assert.equal(await input.inputValue(), "", "Original file reference cleared after applying");
    await input.setInputFiles(fixture("two-month.pdf"));
    await panel.getByText("Page 2 · local preview").waitFor({ timeout: 30000 });
    await panel.getByRole("button", { name: "Reveal locally to redact" }).first().click();
    await panel.screenshot({
      style: "header, .fixed.bottom-0 { visibility: hidden !important; }",
      path: new URL(`${device}-pdf.png`, artifacts).pathname,
    });
    await panel.getByRole("button", { name: "Clear / cancel" }).click();
    for (const file of ["corrupt.pdf", "too-many-pages.pdf", "active-content.pdf"]) {
      await input.setInputFiles(fixture(file));
      await panel.getByRole("alert").filter({ hasText: "could not be opened safely" }).waitFor();
    }
    await input.setInputFiles({
      name: "bad.png",
      mimeType: "image/png",
      buffer: Buffer.from("<script>alert(1)</script>"),
    });
    await panel.getByRole("alert").waitFor();
    await input.setInputFiles({
      name: "oversized.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 32),
    });
    await panel.getByRole("alert").waitFor();
    await input.setInputFiles(fixture("low-quality.png"));
    await panel.getByText("Low-resolution image.", { exact: false }).waitFor();
    mode = "failure";
    await panel.getByLabel(/I have reviewed the redactions/).check();
    await panel.getByRole("button", { name: "Extract readings with OpenAI" }).click();
    await panel.getByRole("alert").filter({ hasText: "Extraction is unavailable" }).waitFor();
    mode = "slow";
    await panel.getByRole("button", { name: "Extract readings with OpenAI" }).click();
    assert(
      await panel
        .getByLabel("Period consumption (kWh for whole period)", { exact: false })
        .isDisabled(),
      "Draft edits are locked while extraction is pending",
    );
    await panel.getByRole("button", { name: "Clear / cancel" }).click();
    await page.waitForTimeout(1500);
    assert.equal(
      await panel
        .getByLabel("Period consumption (kWh for whole period)", { exact: false })
        .inputValue(),
      "",
    );
    // Manual fallback and unknown utility must not substitute Telangana.
    await panel.getByLabel("State on bill").selectOption("OTHER");
    await panel.getByLabel("Electricity board on bill").selectOption("OTHER");
    await panel.getByLabel("Consumer category", { exact: false }).selectOption("residential");
    await panel.getByLabel("Number of months").fill("1");
    await panel.getByLabel("Total payable (₹ for whole period)", { exact: false }).fill("3000");
    await panel
      .getByLabel("Period consumption (kWh for whole period)", { exact: false })
      .fill("350");
    await panel.getByLabel(/I checked the state/).check();
    await panel.getByRole("button", { name: "Confirm and apply bill readings" }).click();
    assert.equal(await page.locator("#studio-discom").inputValue(), "UNSUPPORTED");
    await page.getByRole("button", { name: /Plan Usable Terrace Area & Obstructions/ }).click();
    const roof = page.getByRole("region", { name: "Preliminary roof assessment" });
    await roof.getByLabel("Roof measurement method").selectOption("rectangle");
    await roof.getByLabel("Roof length (ft)").fill("40");
    await roof.getByLabel("Roof width (ft)").fill("20");
    await roof.locator("#tank-slider").fill("20");
    await roof.locator("#walkway-slider").fill("30");
    assert.equal((await roof.getByTestId("roof-usable-area").textContent()).trim(), "526 sq.ft.");
    await roof.screenshot({
      style: "header, .fixed.bottom-0 { visibility: hidden !important; }",
      path: new URL(`${device}-roof.png`, artifacts).pathname,
    });
    await roof.getByLabel("Roof measurement method").selectOption("l-shape");
    await roof.getByLabel("Corner cutout length (ft)").fill("50");
    await roof.getByRole("alert").waitFor();
    assert(await roof.getByRole("button", { name: /Apply usable roof/ }).isDisabled());
    await roof.getByLabel("Corner cutout length (ft)").fill("10");
    const axe = await new AxeBuilder({ page })
      .include('section[aria-label="Bill intelligence"]')
      .include('section[aria-label="Preliminary roof assessment"]')
      .analyze();
    await writeFile(
      new URL(`${device}-accessibility.json`, artifacts),
      JSON.stringify(axe.violations, null, 2),
    );
    assert.deepEqual(
      axe.violations.filter((v) => ["critical", "serious"].includes(v.impact)).map((v) => v.id),
      [],
    );
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      "No horizontal overflow",
    );
    assert.deepEqual(errors, []);
    report.push({
      device,
      status: "passed",
      provider: "mocked transport; no real-provider verification in this browser test",
      screenshots: 4,
    });
    await context.close();
  }
  await writeFile(new URL("report.json", artifacts), JSON.stringify(report, null, 2));
  console.log(
    "Step 6 desktop/mobile intake, PDF, redaction, correction, period validation, fallback, cancellation, unknown utility, override and roof checks passed.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await writeFile(new URL("server.log", artifacts), serverLog);
}
