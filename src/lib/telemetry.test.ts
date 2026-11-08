import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  sanitizeAttributionUrl,
  sanitizeReferrer,
  sanitizeAttributionValue,
  classifyAttributionChannel,
  recordTelemetryNavigation,
  getStoredTelemetry,
  sanitizeIncomingAttributionPayload,
} from "./telemetry";

function createMockBrowserWindow(initialHref = "https://wavenox.in/", initialReferrer = "") {
  const store = new Map<string, string>();
  const sessionStorageMock = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => {
      store.set(key, val);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
  };

  const win = {
    location: {
      href: initialHref,
      origin: "https://wavenox.in",
      pathname: new URL(initialHref).pathname,
      search: new URL(initialHref).search,
    },
    sessionStorage: sessionStorageMock,
  };

  const doc = {
    referrer: initialReferrer,
  };

  Object.defineProperty(globalThis, "window", {
    value: win,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "document", {
    value: doc,
    configurable: true,
    writable: true,
  });

  return {
    setLocation(href: string, referrer = "") {
      const parsed = new URL(href);
      win.location.href = href;
      win.location.origin = parsed.origin;
      win.location.pathname = parsed.pathname;
      win.location.search = parsed.search;
      doc.referrer = referrer;
    },
    store,
  };
}

describe("Marketing Attribution & Telemetry Privacy Engine (Step 5 — Phase B)", () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  beforeEach(() => {
    createMockBrowserWindow();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "window", {
      value: originalWindow,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "document", {
      value: originalDocument,
      configurable: true,
      writable: true,
    });
  });

  it.each(["/portal", "/portal/", "/ops"])(
    "does not capture private route attribution for %s",
    (path) => {
      const browser = createMockBrowserWindow("https://wavenox.in" + path + "?utm_source=private");
      expect(recordTelemetryNavigation()).toEqual({});
      expect(browser.store.size).toBe(0);
    },
  );

  it("1. strips phone numbers, emails, tokens, and non-campaign query parameters from landing URLs", () => {
    const dirtyUrl =
      "https://wavenox.in/deploy?utm_source=Google&utm_medium=CPC&utm_campaign=hyd_villas_2026&phone=9876543210&email=client@example.com&token=secret-jwt-123&name=Arjun+Reddy&bill=15000";

    const res = sanitizeAttributionUrl(dirtyUrl);
    expect(res).not.toBeNull();
    expect(res?.landingPath).toBe("/deploy");
    expect(res?.utm_source).toBe("google");
    expect(res?.utm_medium).toBe("cpc");
    expect(res?.utm_campaign).toBe("hyd_villas_2026");
    expect(res?.cleanLandingUrl).toBe(
      "/deploy?utm_source=google&utm_medium=cpc&utm_campaign=hyd_villas_2026",
    );
    expect(res?.cleanLandingUrl).not.toContain("9876543210");
    expect(res?.cleanLandingUrl).not.toContain("client@example.com");
    expect(res?.cleanLandingUrl).not.toContain("secret-jwt-123");
    expect(res?.cleanLandingUrl).not.toContain("Arjun");
  });

  it("2. rejects PII (email or phone number) stuffed inside allowlisted UTM parameters", () => {
    const piiInUtm =
      "https://wavenox.in/enterprise?utm_source=google&utm_campaign=user_vikram@example.com&utm_term=%2B919876543210";
    const res = sanitizeAttributionUrl(piiInUtm);

    expect(res?.utm_source).toBe("google");
    expect(res?.utm_campaign).toBeUndefined();
    expect(res?.utm_term).toBeUndefined();
    expect(res?.cleanLandingUrl).toBe("/enterprise?utm_source=google");
  });

  it("3. rejects oversized campaign values (>150 chars) and strips unsafe HTML/script characters", () => {
    const oversized = "a".repeat(160);
    expect(sanitizeAttributionValue(oversized)).toBeUndefined();

    const scriptAttempt = 'summer_solar<script>alert("xss")</script>';
    const cleaned = sanitizeAttributionValue(scriptAttempt);
    expect(cleaned).toBe("summer_solarscriptalert(xss)/script");
    expect(cleaned).not.toContain("<");
    expect(cleaned).not.toContain(">");
  });

  it("4. sanitizes external referrers and ignores internal same-origin referrers", () => {
    const internalRef = sanitizeReferrer(
      "https://wavenox.in/residential?phone=9876543210",
      "https://wavenox.in",
    );
    expect(internalRef).toBeNull();

    const externalGoogleRef = sanitizeReferrer(
      "https://www.google.co.in/search?q=solar+hyderabad&email=test@example.com",
      "https://wavenox.in",
    );
    expect(externalGoogleRef).not.toBeNull();
    expect(externalGoogleRef?.referrerDomain).toBe("google.co.in");
    expect(externalGoogleRef?.cleanReferrer).toBe("https://google.co.in/search");
    expect(externalGoogleRef?.cleanReferrer).not.toContain("test@example.com");
  });

  it("5. deterministically classifies paid search, paid social, organic search, referral, direct, and unknown without guessing paid traffic from organic referrers", () => {
    // Paid search via medium or gclid
    expect(classifyAttributionChannel({ utm_source: "google", utm_medium: "cpc" })).toBe(
      "paid_search",
    );
    expect(classifyAttributionChannel({ click_id_type: "gclid" })).toBe("paid_search");

    // Paid social via medium or fbclid
    expect(classifyAttributionChannel({ utm_source: "instagram", utm_medium: "paid_social" })).toBe(
      "paid_social",
    );
    expect(classifyAttributionChannel({ click_id_type: "fbclid" })).toBe("paid_social");
    expect(classifyAttributionChannel({ utm_source: "linkedin", utm_medium: "cpc" })).toBe(
      "paid_social",
    );

    // Organic search: Google referrer WITHOUT paid medium or gclid MUST be organic_search, never paid
    expect(
      classifyAttributionChannel({ referrer_domain: "google.com", hasLandingContext: true }),
    ).toBe("organic_search");
    expect(
      classifyAttributionChannel({ referrer_domain: "bing.com", hasLandingContext: true }),
    ).toBe("organic_search");

    // Referral: Facebook or LinkedIn referrer WITHOUT paid medium or fbclid MUST be referral, never paid_social
    expect(
      classifyAttributionChannel({ referrer_domain: "facebook.com", hasLandingContext: true }),
    ).toBe("referral");
    expect(
      classifyAttributionChannel({ referrer_domain: "linkedin.com", hasLandingContext: true }),
    ).toBe("referral");
    expect(
      classifyAttributionChannel({
        referrer_domain: "architecturaldigest.in",
        hasLandingContext: true,
      }),
    ).toBe("referral");

    // Ambiguous bare utm_source without medium must degrade to unknown rather than guessing paid
    expect(classifyAttributionChannel({ utm_source: "google", hasLandingContext: true })).toBe(
      "unknown",
    );
    expect(classifyAttributionChannel({ utm_source: "facebook", hasLandingContext: true })).toBe(
      "unknown",
    );

    // Direct when landing context exists with no UTMs/referrer
    expect(classifyAttributionChannel({ hasLandingContext: true })).toBe("direct");

    // Unknown when no context exists at all
    expect(classifyAttributionChannel({ hasLandingContext: false })).toBe("unknown");
  });

  it("6. preserves First Touch across multi-route SPA navigation while updating Last Touch only on eligible new campaign interactions", () => {
    const browser = createMockBrowserWindow(
      "https://wavenox.in/?utm_source=google&utm_medium=cpc&utm_campaign=telangana_search_q4&gclid=EAIaIQobChMI123",
      "https://www.google.com/",
    );

    // 1. Initial landing on / with Google Ads campaign
    const t1 = recordTelemetryNavigation(undefined, undefined, "2026-11-06T06:00:00.000Z");
    expect(t1.first_touch_source).toBe("google");
    expect(t1.first_touch_medium).toBe("cpc");
    expect(t1.first_touch_campaign).toBe("telangana_search_q4");
    expect(t1.first_touch_landing_path).toBe("/");
    expect(t1.last_touch_source).toBe("google");
    expect(t1.attribution_channel).toBe("paid_search");
    expect(t1.click_id_type).toBe("gclid");

    // 2. User navigates internally to /residential and then /deploy (no new UTMs)
    browser.setLocation("https://wavenox.in/residential", "https://wavenox.in/");
    recordTelemetryNavigation(undefined, undefined, "2026-11-06T06:02:00.000Z");

    browser.setLocation(
      "https://wavenox.in/deploy?bill=15000&discom=TGSPDCL",
      "https://wavenox.in/residential",
    );
    const t2 = recordTelemetryNavigation(undefined, undefined, "2026-11-06T06:05:00.000Z");

    // First touch and Last touch campaign MUST remain intact; conversion_path updates to /deploy
    expect(t2.first_touch_source).toBe("google");
    expect(t2.first_touch_campaign).toBe("telangana_search_q4");
    expect(t2.last_touch_source).toBe("google");
    expect(t2.last_touch_campaign).toBe("telangana_search_q4");
    expect(t2.conversion_path).toBe("/deploy");
    expect(t2.attribution_channel).toBe("paid_search");

    // 3. User later clicks a Meta Ads remarketing link in the same session
    browser.setLocation(
      "https://wavenox.in/omnigrid?utm_source=instagram&utm_medium=paid_social&utm_campaign=omnigrid_backup_2026&fbclid=IwAR987654",
      "https://l.instagram.com/",
    );
    const t3 = recordTelemetryNavigation(undefined, undefined, "2026-11-06T06:15:00.000Z");

    // First touch is still Google Ads; Last touch is now Instagram Paid Social!
    expect(t3.first_touch_source).toBe("google");
    expect(t3.first_touch_medium).toBe("cpc");
    expect(t3.first_touch_campaign).toBe("telangana_search_q4");
    expect(t3.first_touch_landing_path).toBe("/");

    expect(t3.last_touch_source).toBe("instagram");
    expect(t3.last_touch_medium).toBe("paid_social");
    expect(t3.last_touch_campaign).toBe("omnigrid_backup_2026");
    expect(t3.last_touch_landing_path).toBe("/omnigrid");
    expect(t3.attribution_channel).toBe("paid_social");
    expect(t3.click_id_type).toBe("fbclid");
    expect(t3.conversion_path).toBe("/omnigrid");

    // 4. Direct visit to /enterprise does NOT overwrite Last Touch
    browser.setLocation("https://wavenox.in/enterprise", "");
    const t4 = getStoredTelemetry();
    expect(t4.first_touch_source).toBe("google");
    expect(t4.last_touch_source).toBe("instagram");
    expect(t4.conversion_path).toBe("/enterprise");
  });

  it("7. sanitizes untrusted incoming server attribution payloads and degrades gracefully to unknown without throwing", () => {
    const sanitized = sanitizeIncomingAttributionPayload({
      utm_source: "a".repeat(300), // oversized -> stripped
      utm_medium: "invalid_custom_medium",
      landing_url: "https://wavenox.in/deploy?phone=9876543210&email=leak@example.com",
      referrer: "https://wavenox.in/home", // internal -> stripped
    });

    expect(sanitized.utm_source).toBeUndefined();
    expect(sanitized.landing_url).toBe("/deploy");
    expect(sanitized.referrer).toBeUndefined();
    expect(sanitized.attribution_channel).toBe("unknown");
  });
});
