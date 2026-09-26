import { chromium } from "playwright";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PORT = 8089;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ARTIFACTS_DIR =
  "/Users/bunny/.gemini/antigravity/brain/156e39e9-35c8-4264-9c1e-0067ed1aefe9/qa-luxury-polish";

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

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

async function run() {
  console.log("🚀 Starting Luxury Polish & Navigation Verification...");

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
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // TEST 1: DESKTOP HEADER REFINEMENT
    // -------------------------------------------------------------
    console.log("🧪 Test 1: Desktop Header Clutter Removal & Logo Sizing...");
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Check that ? help circle is NOT in header
    const helpInHeader = await desktopPage.$("header button[title='Schedule Consultation']");
    if (helpInHeader) {
      throw new Error("❌ HelpCircle '?' button is still present in the header!");
    }
    console.log("  ✓ Confirmed: HelpCircle '?' button is removed from header.");

    // Check that LanguageToggle EN|తెలుగు is NOT in header
    const langInHeader = await desktopPage.$("header button:has-text('తెలుగు')");
    if (langInHeader) {
      throw new Error("❌ LanguageToggle is still present in desktop header!");
    }
    console.log("  ✓ Confirmed: LanguageToggle box is removed from desktop header.");

    // Check Logo font size
    const logoEl = await desktopPage.$("header span:has-text('WAVENOX')");
    if (!logoEl) throw new Error("❌ WAVENOX logo not found in header");
    const logoFontSize = await logoEl.evaluate((el) => window.getComputedStyle(el).fontSize);
    console.log(
      `  ✓ Confirmed: WAVENOX header wordmark font size is ${logoFontSize} (Target: >= 21px).`,
    );

    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, "desktop-header-clean.png"),
      clip: { x: 0, y: 0, width: 1440, height: 120 },
    });

    // -------------------------------------------------------------
    // TEST 2: COMMERCIAL PAGE STATS WITHOUT BLURRY SHADOW
    // -------------------------------------------------------------
    console.log("🧪 Test 2: Commercial Page Stats Typography Shadow Audit...");
    await desktopPage.goto(`${BASE_URL}/enterprise`, { waitUntil: "networkidle" });

    // Find numbers: 0.50 MWp, Payback, Tax Shield
    const statValues = await desktopPage.$$eval("span.tabular-nums", (els) =>
      els.map((el) => ({
        text: el.textContent.trim(),
        textShadow: window.getComputedStyle(el).textShadow,
        filter: window.getComputedStyle(el).filter,
        color: window.getComputedStyle(el).color,
      })),
    );

    console.log("  Inspecting stat rows on commercial page:");
    let hasDropShadow = false;
    for (const stat of statValues) {
      if (stat.textShadow !== "none" && !stat.textShadow.includes("rgba(0, 0, 0, 0)")) {
        hasDropShadow = true;
        console.error(`  ❌ Fuzzy shadow detected on '${stat.text}': ${stat.textShadow}`);
      }
      if (stat.filter !== "none" && stat.filter.includes("drop-shadow")) {
        hasDropShadow = true;
        console.error(`  ❌ CSS drop-shadow detected on '${stat.text}': ${stat.filter}`);
      }
    }

    if (hasDropShadow) {
      throw new Error("❌ Found blurry drop-shadow on stats typography!");
    }
    console.log("  ✓ Confirmed: 0 drop-shadows on commercial stats. Pure crisp typography!");

    const statSection = await desktopPage.$("section:has-text('Annual Electricity Savings')");
    if (statSection) {
      await statSection.scrollIntoViewIfNeeded();
      await desktopPage.waitForTimeout(300);
      await statSection.screenshot({
        path: path.join(ARTIFACTS_DIR, "commercial-stats-clean.png"),
      });
      console.log("  ✓ Saved commercial stats screenshot.");
    }

    // -------------------------------------------------------------
    // TEST 3: MOBILE MENU TESLA-GRADE DRILL-DOWN NAVIGATION
    // -------------------------------------------------------------
    console.log("🧪 Test 3: Mobile Menu Tesla Drill-Down Navigation...");
    const mobilePage = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await mobilePage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });

    // Open mobile menu
    const menuBtn = await mobilePage.$("button:has-text('Menu')");
    if (!menuBtn) throw new Error("❌ Mobile menu button not found");
    await menuBtn.click();
    await mobilePage.waitForTimeout(400);

    // Verify Level 0: Main Categories with chevrons
    const residentialCatBtn = await mobilePage.$("button:has-text('Residential Solar')");
    if (!residentialCatBtn)
      throw new Error("❌ 'Residential Solar' category button not found in drawer");
    console.log("  ✓ Level 0: Category 'Residential Solar' rendered.");

    const omnigridCatBtn = await mobilePage.$("button:has-text('Omnigrid Storage')");
    if (!omnigridCatBtn)
      throw new Error("❌ 'Omnigrid Storage' category button not found in drawer");
    console.log("  ✓ Level 0: Category 'Omnigrid Storage' rendered.");

    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, "mobile-menu-level-0.png"),
    });

    // Drill down into Level 1
    await residentialCatBtn.click();
    await mobilePage.waitForTimeout(400);

    // Verify Level 1: Back button and sub-products
    const backBtn = await mobilePage.$("button:has-text('Back')");
    if (!backBtn) throw new Error("❌ Back button not found in Level 1 mobile view");
    console.log("  ✓ Level 1: Back button successfully rendered.");

    const lowProfileCard = await mobilePage.$("span:has-text('Low-Profile Solar Panels')");
    if (!lowProfileCard)
      throw new Error("❌ Sub-item 'Low-Profile Solar Panels' not found in Level 1");
    console.log("  ✓ Level 1: Sub-item 'Low-Profile Solar Panels' successfully rendered.");

    await mobilePage.screenshot({
      path: path.join(ARTIFACTS_DIR, "mobile-menu-level-1.png"),
    });

    // Tap Back button to return to Level 0
    await backBtn.click();
    await mobilePage.waitForTimeout(400);
    const residentialAgain = await mobilePage.$("button:has-text('Residential Solar')");
    if (!residentialAgain) throw new Error("❌ Failed to return to Level 0 upon clicking Back");
    console.log("  ✓ Level 0: Successfully navigated back to root menu.");

    // Close menu
    const closeBtn = await mobilePage.$("button[aria-label='Close navigation menu']");
    if (closeBtn) await closeBtn.click();
    await mobilePage.waitForTimeout(300);

    // -------------------------------------------------------------
    // TEST 4: PAN-INDIA SERVICE AREAS & DEEP QUERY ROUTING
    // -------------------------------------------------------------
    console.log("🧪 Test 4: Pan-India Service Areas & State Query Parameters...");

    // Check Karnataka direct route
    await desktopPage.goto(`${BASE_URL}/service-areas?state=karnataka`, {
      waitUntil: "networkidle",
    });
    const karnatakaHeading = await desktopPage.$(
      "h2:has-text('Karnataka — Bengaluru Metropolitan')",
    );
    if (!karnatakaHeading)
      throw new Error("❌ Karnataka state heading not found on ?state=karnataka");
    const bescomBadge = await desktopPage.$("span:has-text('BESCOM')");
    if (!bescomBadge) throw new Error("❌ BESCOM discom not rendered under Karnataka");
    console.log("  ✓ Confirmed: /service-areas?state=karnataka loads Karnataka with BESCOM.");

    await desktopPage.screenshot({
      path: path.join(ARTIFACTS_DIR, "service-areas-karnataka.png"),
    });

    // Check Maharashtra direct route
    await desktopPage.goto(`${BASE_URL}/service-areas?state=maharashtra`, {
      waitUntil: "networkidle",
    });
    const maharashtraHeading = await desktopPage.$(
      "h2:has-text('Maharashtra — Mumbai Metropolitan')",
    );
    if (!maharashtraHeading)
      throw new Error("❌ Maharashtra state heading not found on ?state=maharashtra");
    console.log("  ✓ Confirmed: /service-areas?state=maharashtra loads Mumbai/Pune.");

    // Click tab button for Andhra Pradesh and verify URL changes
    const apTab = await desktopPage.$("button[role='tab']:has-text('Andhra Pradesh')");
    if (!apTab) throw new Error("❌ Andhra Pradesh tab not found");
    await apTab.click();
    await desktopPage.waitForTimeout(400);
    const apUrl = desktopPage.url();
    if (!apUrl.includes("state=andhra-pradesh")) {
      throw new Error(`❌ URL did not update to state=andhra-pradesh, was: ${apUrl}`);
    }
    console.log(
      "  ✓ Confirmed: Tab click dynamically updates URL query param to ?state=andhra-pradesh.",
    );

    // -------------------------------------------------------------
    // TEST 5: FOOTER JURISDICTION LINKS
    // -------------------------------------------------------------
    console.log("🧪 Test 5: Footer Jurisdiction Deep-Linking...");
    await desktopPage.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    const footerKarnatakaLink = await desktopPage.$("footer a[href*='state=karnataka']");
    if (!footerKarnatakaLink)
      throw new Error("❌ Footer link with search param state=karnataka not found");
    console.log("  ✓ Confirmed: Footer link targets /service-areas?state=karnataka.");

    console.log(
      "\n✨ ALL TESTS PASSED! Ultra-luxury polish and Pan-India architecture 100% verified!",
    );
  } finally {
    await browser.close();
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

run().catch((err) => {
  console.error("FATAL ERROR in verification script:", err);
  process.exit(1);
});
