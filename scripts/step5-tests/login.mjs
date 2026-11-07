import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { setTimeout } from "node:timers/promises";
import { chromium } from "playwright";

// The CI fixture creates the Auth account. All requests stay on loopback.
assert.equal(process.env.SUPABASE_URL, "http://127.0.0.1:54321");
const base = "http://127.0.0.1:45731";
const server = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "45731", "--strictPort"],
  { stdio: "inherit" },
);
let browser;
try {
  let ready = false;
  for (let n = 0; n < 100; n++) {
    if (
      await fetch(base + "/ops")
        .then((r) => r.ok)
        .catch(() => false)
    ) {
      ready = true;
      break;
    }
    await setTimeout(300);
  }
  assert.ok(ready, "LIVE server readiness");
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const ssr = await page.goto(base + "/ops");
  assert.doesNotMatch(await ssr.text(), /Database Fixture|restricted@example\.invalid/);
  await page.locator("#ops-login-email").fill("fixture1@example.invalid");
  await page
    .locator("#ops-login-password")
    .fill(await readFile(process.env.STEP5_BROWSER_CREDENTIAL_FILE, "utf8"));
  const signedIn = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.request().postData()?.includes("fixture1@example.invalid"),
  );
  await page.locator("#ops-login-submit").click();
  const loginResponse = await signedIn;
  assert.equal(loginResponse.status(), 200, "Password sign-in transport");
  assert.ok(
    (await loginResponse.headersArray()).some(
      (header) =>
        header.name.toLowerCase() === "set-cookie" &&
        header.value.startsWith("wavenox_crm_session="),
    ),
    "Successful password sign-in must issue the staff session cookie: " +
      (
        await page.locator("#ops-login-error, #ops-permission-denied-banner").allTextContents()
      ).join(" "),
  );
  await page.locator("#ops-tab-leads").waitFor();
  await page.locator("#ops-view-overview").waitFor();
  const session = (await page.context().cookies()).find((c) => c.name === "wavenox_crm_session");
  assert.ok(
    session?.httpOnly && session.sameSite === "Lax" && session.path === "/",
    "Staff session cookie flags",
  );
  await page.reload();
  await page.locator("#ops-tab-leads").click();
  await page.getByRole("button", { name: "Inspect", exact: true }).first().click();
  await page.locator("#ops-note-textarea").fill("LIVE browser audit fixture");
  const requestPromise = page.waitForRequest(
    (r) => r.method() === "POST" && r.postData()?.includes("LIVE browser audit fixture"),
  );
  await page.locator("#ops-note-submit-btn").click();
  const request = await requestPromise;
  assert.equal((await request.response()).status(), 200);
  const replay = await page.request.fetch(request.url(), {
    method: "POST",
    headers: await request.allHeaders(),
    data: request.postDataBuffer(),
  });
  assert.equal(replay.status(), 409, "stale replay must receive HTTP 409");
  await page.locator("#ops-close-detail-btn").click();
  await page.locator("#ops-signout-btn").click();
  await page.locator("#ops-login-email").waitFor();
  assert.equal(
    (await page.context().cookies()).some((c) => c.name === "wavenox_crm_session"),
    false,
  );
  console.log(
    "LIVE staff password login, private reads, HttpOnly cookie, audited note, stale replay and logout passed.",
  );
} finally {
  await browser?.close();
  server.kill();
}
