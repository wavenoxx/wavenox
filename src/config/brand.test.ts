import { describe, it, expect } from "vitest";
import {
  buildBrandConfig,
  resolveBrandLeadMode,
  resolveSiteStatus,
  DEFAULT_BRAND_NAME,
  DEFAULT_LEGAL_NAME,
  DEFAULT_PHONE_DISPLAY,
  DEFAULT_SECONDARY_PHONE_DISPLAY,
  DEFAULT_EMAIL,
  DEFAULT_SITE_URL,
} from "./brand";
import { BUSINESS, hubCityList } from "./business";

describe("Brand & Business Configuration Integrity (Step 1)", () => {
  it("preserves core WAVENOX brand identity and contact defaults", () => {
    const config = buildBrandConfig({});

    expect(config.name).toBe(DEFAULT_BRAND_NAME);
    expect(config.name).toBe("WAVENOX");
    expect(config.contact.phone.display).toBe(DEFAULT_PHONE_DISPLAY);
    expect(config.contact.phone.dial).toBe("+919154626354");
    expect(config.contact.secondaryPhone.display).toBe(DEFAULT_SECONDARY_PHONE_DISPLAY);
    expect(config.contact.secondaryPhone.dial).toBe("+917075870054");
    expect(config.contact.whatsapp.display).toBe("+91 70758 70054");
    expect(config.contact.whatsapp.dial).toBe("917075870054");
    expect(config.contact.email).toBe(DEFAULT_EMAIL);
    expect(config.domain).toBe(DEFAULT_SITE_URL);
    expect(config.domainHost).toBe("wavenox.in");
  });

  it("uses neutral brand wording by default and does not treat unverified legal entity names as verified corporate registrations", () => {
    const defaultConfig = buildBrandConfig({});
    expect(defaultConfig.legalName).toBe(DEFAULT_LEGAL_NAME);
    expect(defaultConfig.legalName).not.toContain("Concept");
    expect(defaultConfig.legalEntityVerified).toBe(false);
    expect(defaultConfig.legalEntityNotice).toContain(
      "owner verification in platform configuration",
    );

    // Providing a custom legal name without explicit verification flag remains unverified
    const unverifiedCustom = buildBrandConfig({
      VITE_LEGAL_NAME: "Wavenox Energy Example Entity",
    });
    expect(unverifiedCustom.legalName).toBe("Wavenox Energy Example Entity");
    expect(unverifiedCustom.legalEntityVerified).toBe(false);

    // Explicitly verified custom legal entity
    const verifiedCustom = buildBrandConfig({
      VITE_LEGAL_NAME: "Wavenox Solar Systems LLP",
      VITE_LEGAL_ENTITY_VERIFIED: "true",
    });
    expect(verifiedCustom.legalName).toBe("Wavenox Solar Systems LLP");
    expect(verifiedCustom.legalEntityVerified).toBe(true);
    expect(verifiedCustom.legalEntityNotice).toContain("Operated by Wavenox Solar Systems LLP");
  });

  it("honors environment overrides for contact details and domain while rejecting invalid URLs", () => {
    const overridden = buildBrandConfig({
      VITE_SITE_URL: "https://solar.wavenox.in/",
      VITE_BUSINESS_PHONE_DISPLAY: "+91 98765 43210",
      VITE_BUSINESS_PHONE_DIAL: "+919876543210",
      VITE_BUSINESS_SECONDARY_PHONE_DISPLAY: "+91 91234 56789",
      VITE_BUSINESS_EMAIL: "concierge@wavenox.in",
    });

    expect(overridden.domain).toBe("https://solar.wavenox.in");
    expect(overridden.domainHost).toBe("solar.wavenox.in");
    expect(overridden.contact.phone.display).toBe("+91 98765 43210");
    expect(overridden.contact.phone.dial).toBe("+919876543210");
    expect(overridden.contact.secondaryPhone.display).toBe("+91 91234 56789");
    expect(overridden.contact.email).toBe("concierge@wavenox.in");

    const invalidDomain = buildBrandConfig({
      VITE_SITE_URL: "javascript:alert(1)",
    });
    expect(invalidDomain.domain).toBe(DEFAULT_SITE_URL);
  });

  it("resolves preview/pending/active site status and live/demo lead mode coherently", () => {
    // Default is live lead mode and pending entity status
    expect(resolveBrandLeadMode({})).toBe("live");
    expect(resolveSiteStatus({})).toBe("pending");

    // Explicit demo mode via LEAD_MODE or VITE_LEAD_MODE forces demo mode and preview status
    expect(resolveBrandLeadMode({ LEAD_MODE: "demo" })).toBe("demo");
    expect(resolveBrandLeadMode({ VITE_LEAD_MODE: "DEMO" })).toBe("demo");
    expect(resolveSiteStatus({ LEAD_MODE: "demo" })).toBe("preview");

    const demoBrand = buildBrandConfig({ LEAD_MODE: "demo" });
    expect(demoBrand.leadMode).toBe("demo");
    expect(demoBrand.isDemoMode).toBe(true);
    expect(demoBrand.status).toBe("preview");

    // Explicit active status in live mode
    const activeBrand = buildBrandConfig({
      LEAD_MODE: "live",
      VITE_SITE_STATUS: "active",
    });
    expect(activeBrand.leadMode).toBe("live");
    expect(activeBrand.isDemoMode).toBe(false);
    expect(activeBrand.status).toBe("active");
  });

  it("accurately describes WAVENOX's customer-facing coordinated delivery model", () => {
    expect(BUSINESS.deliveryModel.brandRole).toContain("WAVENOX");
    expect(BUSINESS.deliveryModel.fulfillmentModel).toContain("authorized installation partners");
    expect(BUSINESS.reviews).toEqual([]);
    expect(hubCityList).toContain("Hyderabad");
    expect(hubCityList).toContain("Bengaluru");
  });
});
