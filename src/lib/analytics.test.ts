import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  resolveAnalyticsConfig,
  isAdTrackingConfigured,
  trackLeadConversion,
  trackContactClick,
  resetAdTrackingForTests,
} from "./analytics";

describe("Ad Conversion & Enhanced Conversions Analytics", () => {
  beforeEach(() => {
    resetAdTrackingForTests();
    vi.restoreAllMocks();
  });

  it("acts as a zero-network no-op when no ad tracking env variables are configured", async () => {
    const cfg = resolveAnalyticsConfig({});
    expect(isAdTrackingConfigured(cfg)).toBe(false);

    const fired = await trackLeadConversion(
      {
        referenceCode: "WNX-LIVE-100",
        source: "solar_quote",
        valueInr: 250000,
        isDemo: false,
      },
      cfg,
    );
    expect(fired).toBe(false);
  });

  it("blocks Google Ads / Meta conversion dispatch on simulated DEMO leads", async () => {
    const gtagMock = vi.fn();
    const fbqMock = vi.fn();
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { href: "https://wavenox.in/solar-quote", pathname: "/solar-quote" },
        gtag: gtagMock,
        fbq: fbqMock,
        dataLayer: [],
      },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "document", {
      value: {
        title: "Solar Quote",
        head: { appendChild: vi.fn() },
        getElementById: () => null,
        createElement: () => ({}),
      },
      configurable: true,
      writable: true,
    });

    const cfg = resolveAnalyticsConfig({
      VITE_GOOGLE_ADS_ID: "AW-123456789",
      VITE_GOOGLE_ADS_CONVERSION_LABEL: "AbCdEfGhI",
      VITE_GA4_MEASUREMENT_ID: "G-TEST12345",
      VITE_META_PIXEL_ID: "9988776655",
    });

    const demoResult = await trackLeadConversion(
      {
        referenceCode: "WNX-DEMO-1234",
        source: "studio",
        phone: "9876543210",
        isDemo: true,
      },
      cfg,
    );
    expect(demoResult).toBe(false);
    expect(gtagMock).not.toHaveBeenCalled();
    expect(fbqMock).not.toHaveBeenCalled();
  });

  it("fires Google Ads conversion, GA4 generate_lead, Enhanced Conversions user_data, and Meta Lead on live submissions", async () => {
    const gtagMock = vi.fn();
    const fbqMock = vi.fn();
    Object.defineProperty(globalThis, "window", {
      value: {
        location: { href: "https://wavenox.in/solar-quote", pathname: "/solar-quote" },
        gtag: gtagMock,
        fbq: fbqMock,
        dataLayer: [],
      },
      configurable: true,
      writable: true,
    });
    Object.defineProperty(globalThis, "document", {
      value: {
        title: "Solar Quote",
        head: { appendChild: vi.fn() },
        getElementById: () => ({ id: "existing" }),
        createElement: () => ({}),
      },
      configurable: true,
      writable: true,
    });

    const cfg = resolveAnalyticsConfig({
      VITE_GOOGLE_ADS_ID: "AW-123456789",
      VITE_GOOGLE_ADS_CONVERSION_LABEL: "AbCdEfGhI",
      VITE_GA4_MEASUREMENT_ID: "G-TEST12345",
      VITE_META_PIXEL_ID: "9988776655",
    });

    const liveResult = await trackLeadConversion(
      {
        referenceCode: "WNX-LIVE-999",
        source: "solar_quote",
        propertyTier: "villa",
        discomCode: "UGVCL_PGVCL",
        valueInr: 450000,
        phone: "+91 98765 43210",
        email: "Buyer@Example.com",
        isDemo: false,
      },
      cfg,
    );
    expect(liveResult).toBe(true);

    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "conversion",
      expect.objectContaining({
        send_to: "AW-123456789/AbCdEfGhI",
        value: 450000,
        currency: "INR",
        transaction_id: "WNX-LIVE-999",
      }),
    );
    expect(gtagMock).toHaveBeenCalledWith(
      "event",
      "generate_lead",
      expect.objectContaining({
        discom_code: "UGVCL_PGVCL",
        lead_source: "solar_quote",
      }),
    );
    expect(fbqMock).toHaveBeenCalledWith(
      "track",
      "Lead",
      expect.objectContaining({ value: 450000, currency: "INR" }),
    );

    trackContactClick("whatsapp", "footer", cfg);
    expect(gtagMock).toHaveBeenCalledWith("event", "contact_click", {
      method: "whatsapp",
      link_location: "footer",
    });
    expect(fbqMock).toHaveBeenCalledWith("track", "Contact", {
      content_name: "whatsapp:footer",
    });
  });
});
