import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { spawn } from "node:child_process";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
const live = process.env.STEP7_BROWSER_LIVE === "true";
if (live) assert.equal(process.env.SUPABASE_URL, "http://127.0.0.1:54321");
const base = "http://127.0.0.1:8097",
  artifacts = new URL("../../qa-artifacts/step7/", import.meta.url);
await mkdir(artifacts, { recursive: true });
const server = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "8097", "--strictPort"],
  {
    env: {
      ...process.env,
      LEAD_MODE: live ? "live" : "demo",
      VITE_LEAD_MODE: live ? "live" : "demo",
      PORTAL_EMAIL_ENABLED: live ? "true" : "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "",
  browser;
server.stdout.on("data", (c) => (logs += c));
server.stderr.on("data", (c) => (logs += c));
const report = [];
try {
  let ready = false;
  for (let i = 0; i < 120; i++) {
    if (
      await fetch(base + "/portal")
        .then((r) => r.ok)
        .catch(() => false)
    ) {
      ready = true;
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  assert(ready, "Server starts");
  browser = await chromium.launch();
  const staffContext = await browser.newContext({ viewport: { width: 1440, height: 900 } }),
    customerContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
  const staff = await staffContext.newPage(),
    customer = await customerContext.newPage();
  const errors = [];
  for (const page of [staff, customer]) page.on("pageerror", (e) => errors.push(e.message));
  const initial = await customer.goto(base + "/portal");
  assert.match(initial.headers()["cache-control"], /no-store/);
  assert.doesNotMatch(
    await initial.text(),
    /Hyderabad residence|activation_evidence|portal-a@example/,
  );
  assert.equal((await customer.request.get(base + "/api/projects")).status(), 401);
  await staff.goto(base + "/ops");
  if (live) {
    await staff.locator("#ops-login-email").fill("fixture1@example.invalid");
    await staff
      .locator("#ops-login-password")
      .fill(await readFile(process.env.STEP5_BROWSER_CREDENTIAL_FILE, "utf8"));
    await staff.locator("#ops-login-submit").click();
  } else {
    const loginResponse = staff.waitForResponse(
      (r) =>
        r.request().method() === "POST" && r.request().postData()?.includes("demoPersonaEmail"),
    );
    await staff.getByTestId("demo-persona-owner_admin-active").click();
    assert.equal((await loginResponse).status(), 200, "DEMO sign-in transport");
  }
  await staff.locator("#ops-tab-projects").click();
  await staff.getByRole("heading", { name: "Installation projects", exact: true }).waitFor();
  let projectId, customerEmail, db;
  if (live) {
    db = createClient("http://127.0.0.1:54321", process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    customerEmail = "portal-browser@example.invalid";
    const created = await db.auth.admin.createUser({ email: customerEmail, email_confirm: true });
    assert.equal(created.error, null);
    const lead = crypto.randomUUID();
    const inserted = await db.from("consultations").insert({
      id: lead,
      reference_code: "WNX-S7-BROWSER",
      client_name: "Synthetic browser customer",
      phone: "9999912345",
      city: "Hyderabad",
      property_tier: "villa",
      source: "drawer",
      status: "contract_signed",
      consent_given: true,
      consent_version: "test",
      consent_at: new Date().toISOString(),
    });
    assert.equal(inserted.error, null);
    await staff.getByRole("button", { name: "Refresh projects", exact: true }).click();
    await staff.getByText("Activate a verified consultation", { exact: true }).click();
    const form = staff.getByRole("form", { name: "Create installation project" });
    await form.getByLabel("Eligible consultation").selectOption(lead);
    await form.getByLabel("Project title").fill("Synthetic browser installation");
    await form.getByLabel("City / jurisdiction").fill("Hyderabad");
    await form
      .getByLabel("Customer contact verification reference")
      .fill("Synthetic identity verification reference");
    await form
      .getByLabel("Commercial / operational authorization evidence")
      .fill("Synthetic approved commercial and operational prerequisites");
    await form.getByRole("checkbox").check();
    await form.getByRole("button", { name: "Create verified project" }).click();
    await staff.getByRole("status").filter({ hasText: "Project created" }).waitFor();
    projectId = (
      await db.from("installation_projects").select("id").eq("consultation_id", lead).single()
    ).data.id;
    await staff.getByLabel("Select project").selectOption(projectId);
    await staff.getByRole("button", { name: "Operations", exact: true }).click();
    const invite = staff.getByRole("form", { name: "Approve customer invitation" });
    await invite.getByLabel("Verified customer email").fill(customerEmail);
    await invite
      .getByLabel("Identity verification reference")
      .fill("Synthetic verified email ownership approval");
    await invite.getByRole("button", { name: "Approve invitation" }).click();
    await staff.getByRole("status").filter({ hasText: "Change recorded" }).waitFor();
    // Local Auth generates a real single-use code; no SMTP delivery success is claimed.
    const link = await db.auth.admin.generateLink({ type: "magiclink", email: customerEmail });
    assert.equal(link.error, null);
    await customer.getByLabel("Email used for the code").fill(customerEmail);
    await customer.getByLabel("One-time email code").fill(link.data.properties.email_otp);
    await customer.getByRole("button", { name: "Verify and sign in" }).click();
  } else {
    projectId = "00000000-0000-4000-8000-000000000701";
    await staff.getByLabel("Select project").selectOption(projectId);
    await customer.getByRole("button", { name: "Explore synthetic customer a" }).click();
  }
  await customer.getByRole("heading", { name: "Your projects", exact: true }).waitFor();
  await customer.getByLabel("Select project").waitFor({ state: "visible" });
  assert.equal(await customer.getByLabel("Select project").locator("option").count(), 1);
  const cookie = (await customerContext.cookies()).find((c) => c.name === "wavenox_portal_session");
  assert(cookie.httpOnly && cookie.sameSite === "Lax");
  const wrong = await customer.request.get(
    base + "/api/projects?projectId=00000000-0000-4000-8000-000000000702",
  );
  assert.equal(wrong.status(), 403);
  await staff.getByRole("button", { name: "Refresh projects", exact: true }).click();
  await staff.getByRole("button", { name: "Operations", exact: true }).click();
  const milestone = staff.getByRole("form", { name: "Update milestone" });
  await milestone.getByLabel("Milestone", { exact: true }).selectOption("survey");
  await milestone.getByLabel("New milestone state").selectOption("in_progress");
  await milestone
    .getByLabel("Customer-visible reason / next action")
    .fill("Survey coordination started; customer timing requested.");
  await milestone.getByRole("button", { name: "Save change" }).click();
  await staff.getByRole("status").filter({ hasText: "Change recorded" }).waitFor();
  const note = staff.getByRole("form", { name: "Record project note" });
  await note.getByLabel("Note visibility").selectOption("customer");
  await note.getByLabel("Note text").fill("Your coordinator is preparing the site assessment.");
  await note.getByRole("button", { name: "Save change" }).click();
  await staff.getByRole("status").filter({ hasText: "Change recorded" }).waitFor();
  await note.getByLabel("Note visibility").selectOption("internal");
  await note.getByLabel("Note text").fill("PRIVATE BROWSER STAFF SENTINEL");
  await note.getByRole("button", { name: "Save change" }).click();
  await staff.getByRole("status").filter({ hasText: "Change recorded" }).waitFor();
  await staff.getByRole("button", { name: "Appointments", exact: true }).click();
  const ap = staff.getByRole("form", { name: "Schedule or update appointment" });
  await ap.getByLabel("Appointment status").selectOption("confirmed");
  await ap.getByLabel("Start (IST)").fill("2027-12-03T10:00");
  await ap.getByLabel("End (IST)").fill("2027-12-03T11:00");
  await ap
    .getByLabel("Instructions or requested next action")
    .fill("Synthetic confirmed survey appointment.");
  await ap.getByRole("button", { name: "Record appointment" }).click();
  await staff.getByRole("status").filter({ hasText: "Change recorded" }).waitFor();
  await staff.getByRole("button", { name: "Documents", exact: true }).click();
  const upload = staff.getByRole("form", { name: "Upload private scan" });
  const scan = await sharp({
    create: { width: 800, height: 1000, channels: 3, background: "white" },
  })
    .composite([
      {
        input: Buffer.from(
          '<svg width="800" height="1000"><text x="60" y="100" font-size="32">SYNTHETIC SURVEY SCAN</text><text x="60" y="160" font-size="22">Test fixture. No real customer data.</text></svg>',
        ),
      },
    ])
    .png()
    .toBuffer();
  await upload
    .getByLabel("Scan file")
    .setInputFiles({ name: "synthetic-scan.png", mimeType: "image/png", buffer: scan });
  await upload.getByLabel("Document title").fill("Synthetic survey summary");
  await upload.getByLabel("Visibility after review").selectOption("customer");
  await upload.getByRole("button", { name: "Upload for review" }).click();
  await staff.getByRole("status").filter({ hasText: "Uploaded privately" }).waitFor();
  const review = staff.getByRole("form", { name: "Review document", exact: true });
  await review
    .getByLabel("Review evidence / reason")
    .fill("Synthetic scan independently reviewed for fixture purpose");
  await review.getByRole("button", { name: "Save change" }).click();
  await staff.getByRole("status").filter({ hasText: "Change recorded" }).waitFor();
  await customer.getByRole("button", { name: "Refresh projects", exact: true }).click();
  await customer.getByRole("button", { name: "Appointments", exact: true }).click();
  await customer.getByRole("heading", { name: "Survey · Confirmed", exact: true }).waitFor();
  await customer.screenshot({
    path: new URL(`${live ? "live" : "demo"}-appointments-390.png`, artifacts).pathname,
    fullPage: true,
  });
  await customer.getByRole("button", { name: "Documents", exact: true }).click();
  await customer.getByText("Synthetic survey summary", { exact: true }).waitFor();
  await customer.screenshot({
    path: new URL(`${live ? "live" : "demo"}-documents-390.png`, artifacts).pathname,
    fullPage: true,
  });
  const download = customer.waitForEvent("download");
  await customer.getByRole("button", { name: "Download scan" }).click();
  assert((await download).suggestedFilename().endsWith(".jpg"));
  const customerJson = await (
    await customer.request.get(base + "/api/projects?projectId=" + projectId)
  ).json();
  assert.doesNotMatch(
    JSON.stringify(customerJson),
    /PRIVATE BROWSER STAFF SENTINEL|storage_path|contact_reference/,
  );
  await customer.getByRole("button", { name: "Support", exact: true }).click();
  const support = customer.getByRole("form", { name: "New support request" });
  await support
    .getByLabel("How can the project team help?")
    .fill("Please confirm access requirements for the survey.");
  await support.getByRole("button", { name: "Submit support request" }).click();
  await customer.getByRole("status").filter({ hasText: "Change recorded" }).waitFor();
  await staff.getByRole("button", { name: "Refresh projects", exact: true }).click();
  await staff.getByRole("button", { name: "Support", exact: true }).click();
  const response = staff.getByRole("form", { name: "Respond to support request" });
  await response.getByLabel("Support status").selectOption("resolved");
  await response
    .getByLabel("Customer-visible response")
    .fill("Please keep the roof access clear for the confirmed survey.");
  await response.getByLabel("Internal staff note").fill("PRIVATE SUPPORT BROWSER SENTINEL");
  await response.getByRole("button", { name: "Save change" }).click();
  await staff.getByRole("status").filter({ hasText: "Change recorded" }).waitFor();
  await customer.getByRole("button", { name: "Refresh projects", exact: true }).click();
  await customer
    .getByText("Please keep the roof access clear for the confirmed survey.", { exact: true })
    .waitFor();
  assert(
    !(await customer.locator("body").innerText()).includes("PRIVATE SUPPORT BROWSER SENTINEL"),
  );
  await customer.screenshot({
    path: new URL(`${live ? "live" : "demo"}-support-390.png`, artifacts).pathname,
    fullPage: true,
  });
  await staff.screenshot({
    path: new URL(`${live ? "live" : "demo"}-staff.png`, artifacts).pathname,
    fullPage: true,
  });
  for (const [width, height] of [
    [320, 720],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1440, 900],
  ]) {
    await customer.setViewportSize({ width, height });
    await customer.getByRole("button", { name: "Journey", exact: true }).focus();
    await customer.keyboard.press("Enter");
    await customer.getByRole("list", { name: "Installation milestones" }).waitFor();
    const smallText = await customer
      .locator("main *")
      .evaluateAll((elements) =>
        elements
          .filter(
            (e) =>
              e.childElementCount === 0 &&
              e.textContent?.trim() &&
              e.getBoundingClientRect().height > 0 &&
              Number.parseFloat(getComputedStyle(e).fontSize) < 12,
          )
          .map((e) => e.tagName),
      );
    assert.deepEqual(smallText, [], "Visible text meets the 12px floor");
    assert(
      await customer.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      "No horizontal overflow",
    );
    assert.equal(await customer.locator("h1").count(), 1);
    assert.equal(await customer.locator("main").count(), 1);
    const violations = (await new AxeBuilder({ page: customer }).analyze()).violations.filter((v) =>
      ["serious", "critical"].includes(v.impact),
    );
    assert.deepEqual(violations, []);
    const path = `${live ? "live" : "demo"}-portal-${width}.png`;
    await customer.screenshot({ path: new URL(path, artifacts).pathname, fullPage: true });
    report.push({ width, height, screenshot: path, seriousCriticalAxe: 0 });
  }
  await customer.getByRole("button", { name: "Sign out", exact: true }).click();
  await customer.getByRole("heading", { name: "Sign in to your project", exact: true }).waitFor();
  assert.equal((await customer.request.get(base + "/api/projects")).status(), 401);
  await customerContext.addCookies([{ name: cookie.name, value: cookie.value, url: base }]);
  assert.equal(
    (await customer.request.get(base + "/api/projects")).status(),
    401,
    "Copied session invalid after logout",
  );
  assert.deepEqual(errors, []);
  await writeFile(
    new URL(`${live ? "live" : "demo"}-report.json`, artifacts),
    JSON.stringify(
      {
        mode: live ? "local-supabase-live" : "synthetic-demo",
        flows:
          "staff activation/invite (LIVE), milestone, notes, confirmed appointment, private upload/review/download, support/response, ownership and logout",
        viewports: report,
      },
      null,
      2,
    ),
  );
  console.log("Step 7 browser journeys passed across five viewports.");
} catch (error) {
  if (browser)
    for (const [c, context] of browser.contexts().entries())
      for (const [p, page] of context.pages().entries()) {
        await page
          .screenshot({
            path: new URL(`${live ? "live" : "demo"}-failure-${c}-${p}.png`, artifacts).pathname,
            fullPage: true,
          })
          .catch(() => {});
        await writeFile(
          new URL(`${live ? "live" : "demo"}-failure-${c}-${p}.txt`, artifacts),
          await page
            .locator("body")
            .innerText()
            .catch(() => ""),
        );
      }
  await writeFile(
    new URL(`${live ? "live" : "demo"}-failure.log`, artifacts),
    String(error) + "\n" + logs.slice(-10000),
  );
  throw error;
} finally {
  await browser?.close();
  server.kill();
}
