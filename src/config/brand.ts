import { BUSINESS, hubCityList } from "./business";

/**
 * ============================================================================
 * BRAND IDENTITY & CONTACT — single source of truth for WAVENOX identity.
 * ============================================================================
 * Environment variables (see .env.example) override these defaults at build
 * or server runtime. Service hubs and delivery model live in ./business.ts;
 * solar physics and financial constants live in ./solar.ts.
 */
export const DEFAULT_BRAND_NAME = "WAVENOX";
/**
 * Neutral brand name used until a statutory corporate entity (e.g. Pvt. Ltd. / LLP)
 * is explicitly configured and verified by the business owner via environment variables.
 * Never invent a corporate registration or label live customer pages as a "portfolio concept".
 */
export const DEFAULT_LEGAL_NAME = "WAVENOX";
export const DEFAULT_SITE_URL = "https://wavenox.in";
export const DEFAULT_TAGLINE = "Architectural solar for Indian residences and enterprises.";
export const DEFAULT_PHONE_DISPLAY = "+91 91546 26354";
export const DEFAULT_PHONE_DIAL = "+919154626354";
export const DEFAULT_SECONDARY_PHONE_DISPLAY = "+91 70758 70054";
export const DEFAULT_SECONDARY_PHONE_DIAL = "+917075870054";
export const DEFAULT_WHATSAPP_DISPLAY = "+91 70758 70054";
export const DEFAULT_WHATSAPP_DIAL = "917075870054";
export const DEFAULT_WHATSAPP_LINK = "https://wa.me/917075870054";
export const DEFAULT_EMAIL = "wavennox@gmail.com";
export const DEFAULT_ADDRESS = "Hyderabad, Telangana, India";

const DEFAULT_INSTAGRAM_URL = "";
const DEFAULT_LINKEDIN_URL = "";
const DEFAULT_YOUTUBE_URL = "";
const DEFAULT_TWITTER_URL = "";

/* ========================================================================== */

export type BrandSiteStatus = "pending" | "preview" | "active";
export type BrandLeadMode = "live" | "demo";

export interface BrandContactConfig {
  enabled: boolean;
  phoneDisplay: string;
  phoneDial: string;
  phoneHref: string;
  phone: {
    dial: string;
    display: string;
    href: string;
  };
  secondaryPhoneDisplay: string;
  secondaryPhoneDial: string;
  secondaryPhoneHref: string;
  secondaryPhone: {
    dial: string;
    display: string;
    href: string;
  };
  whatsappDisplay: string;
  whatsappDial: string;
  whatsappLink: string;
  whatsapp: {
    dial: string;
    display: string;
    link: string;
  };
  email: string;
  emailHref: string;
  address: string;
}

export interface BrandSocialsConfig {
  whatsappLink: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  twitter: string;
}

export interface BrandConfig {
  status: BrandSiteStatus;
  leadMode: BrandLeadMode;
  isDemoMode: boolean;
  name: string;
  legalName: string;
  legalEntityVerified: boolean;
  legalEntityNotice: string;
  deliveryModelNotice: string;
  tagline: string;
  description: string;
  domain: string;
  domainHost: string;
  hasMonitoringApp?: boolean;
  installDaysTypical?: number;
  contact: BrandContactConfig;
  socials: BrandSocialsConfig;
}

export type PublicEnvironment = Record<string, string | undefined>;

function clean(value: string | undefined): string {
  return value?.trim() ?? "";
}

function validSiteUrl(value: string): string {
  if (!value) return DEFAULT_SITE_URL;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString().replace(/\/$/, "")
      : DEFAULT_SITE_URL;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function normalizedDial(value: string): string {
  const compact = clean(value).replace(/[\s()-]/g, "");
  return /^\+?[1-9]\d{7,14}$/.test(compact) ? compact : "";
}

function normalizedWhatsAppDial(value: string): string {
  const digits = clean(value).replace(/\D/g, "");
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : "";
}

function validWhatsAppLink(value: string): { link: string; dial: string } | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["wa.me", "api.whatsapp.com"].includes(url.hostname)) {
      return null;
    }
    const dial =
      url.hostname === "wa.me"
        ? url.pathname.replace(/\D/g, "")
        : url.searchParams.get("phone") || "";
    return /^[1-9]\d{7,14}$/.test(dial) ? { link: url.toString(), dial } : null;
  } catch {
    return null;
  }
}

/**
 * Resolves the lead capture mode:
 * - "demo" ONLY when explicitly configured via LEAD_MODE="demo" or VITE_LEAD_MODE="demo".
 * - "live" in all other cases so live traffic never silently downgrades to demo.
 */
export function resolveBrandLeadMode(env: PublicEnvironment = {}): BrandLeadMode {
  const rawMode = clean(env.LEAD_MODE || env.VITE_LEAD_MODE).toLowerCase();
  return rawMode === "demo" ? "demo" : "live";
}

/**
 * Resolves site status ("pending" | "preview" | "active") coherently:
 * - If VITE_SITE_STATUS is explicitly "active", "preview", or "pending", honors it
 *   (unless LEAD_MODE="demo" forces "preview").
 * - If LEAD_MODE="demo" or VITE_LEAD_MODE="demo", returns "preview".
 * - Otherwise defaults to "pending" until statutory entity verification or VITE_SITE_STATUS="active" is set.
 */
export function resolveSiteStatus(env: PublicEnvironment = {}): BrandSiteStatus {
  const leadMode = resolveBrandLeadMode(env);
  const explicitStatus = clean(env.VITE_SITE_STATUS || env.VITE_APP_STATUS).toLowerCase();

  if (leadMode === "demo" || explicitStatus === "preview" || explicitStatus === "demo") {
    return "preview";
  }
  if (explicitStatus === "active" || explicitStatus === "live") {
    return "active";
  }
  if (explicitStatus === "pending") {
    return "pending";
  }
  return "pending";
}

export function buildBrandConfig(env: PublicEnvironment = {}): BrandConfig {
  const leadMode = resolveBrandLeadMode(env);
  const status = resolveSiteStatus(env);
  const name = clean(env.VITE_BRAND_NAME) || DEFAULT_BRAND_NAME;

  const customLegalName = clean(env.VITE_LEGAL_NAME || env.VITE_COMPANY_LEGAL_NAME);
  const explicitEntityVerified =
    clean(
      env.VITE_LEGAL_ENTITY_VERIFIED || env.VITE_COMPANY_LEGAL_ENTITY_VERIFIED,
    ).toLowerCase() === "true";

  // Never silently treat an unverified legal entity name as a registered corporate entity
  const legalEntityVerified =
    Boolean(customLegalName) && customLegalName !== DEFAULT_LEGAL_NAME && explicitEntityVerified;

  const legalName = customLegalName || DEFAULT_LEGAL_NAME;
  const legalEntityNotice = legalEntityVerified
    ? `Operated by ${legalName}. Project-specific installation and EPC execution scopes are governed by your formal execution agreement.`
    : `${name} operates as a customer-facing solar energy brand. Formal contracting entity registration (CIN/GSTIN) and assigned execution partner details require owner verification in platform configuration and are specified directly on your project-specific commercial quotation and installation agreement prior to contract execution.`;

  const tagline = clean(env.VITE_TAGLINE) || DEFAULT_TAGLINE;
  const domain = validSiteUrl(clean(env.VITE_SITE_URL) || DEFAULT_SITE_URL);
  let domainHost = "wavenox.in";
  try {
    domainHost = new URL(domain).host;
  } catch {
    domainHost = "wavenox.in";
  }

  const phoneDisplay =
    clean(env.VITE_BUSINESS_PHONE_DISPLAY || env.VITE_CONTACT_PHONE) || DEFAULT_PHONE_DISPLAY;
  const phoneDial =
    normalizedDial(env.VITE_BUSINESS_PHONE_DIAL || phoneDisplay) || DEFAULT_PHONE_DIAL;

  const secondaryPhoneDisplay =
    clean(env.VITE_BUSINESS_SECONDARY_PHONE_DISPLAY || env.VITE_CONTACT_SECONDARY_PHONE) ||
    DEFAULT_SECONDARY_PHONE_DISPLAY;
  const secondaryPhoneDial =
    normalizedDial(env.VITE_BUSINESS_SECONDARY_PHONE_DIAL || secondaryPhoneDisplay) ||
    DEFAULT_SECONDARY_PHONE_DIAL;

  const parsedWhatsAppLink = validWhatsAppLink(clean(env.VITE_BUSINESS_WHATSAPP_LINK));
  const whatsappDial =
    normalizedWhatsAppDial(env.VITE_BUSINESS_WHATSAPP_DIAL || "") ||
    parsedWhatsAppLink?.dial ||
    DEFAULT_WHATSAPP_DIAL;
  const whatsappDisplay = clean(env.VITE_BUSINESS_WHATSAPP_DISPLAY) || DEFAULT_WHATSAPP_DISPLAY;
  const whatsappLink =
    parsedWhatsAppLink?.link ||
    (whatsappDial ? `https://wa.me/${whatsappDial}` : DEFAULT_WHATSAPP_LINK);

  const email = clean(env.VITE_BUSINESS_EMAIL || env.VITE_CONTACT_EMAIL) || DEFAULT_EMAIL;
  const address = clean(env.VITE_BUSINESS_ADDRESS) || DEFAULT_ADDRESS;

  const contactEnabled =
    clean(env.VITE_CONTACT_ENABLED).toLowerCase() === "true" || Boolean(phoneDial && whatsappDial);

  const description =
    clean(env.VITE_BRAND_DESCRIPTION) ||
    `${name} coordinates architectural rooftop solar and battery storage systems for residential and commercial properties across ${hubCityList}.`;

  return {
    status,
    leadMode,
    isDemoMode: leadMode === "demo",
    name,
    legalName,
    legalEntityVerified,
    legalEntityNotice,
    deliveryModelNotice: `${BUSINESS.deliveryModel.brandRole} ${BUSINESS.deliveryModel.fulfillmentModel}`,
    tagline,
    description,
    domain,
    domainHost,
    hasMonitoringApp: false,
    installDaysTypical: 3,
    contact: {
      enabled: contactEnabled,
      phoneDisplay,
      phoneDial,
      phoneHref: phoneDial ? `tel:${phoneDial}` : "#",
      phone: {
        dial: phoneDial,
        display: phoneDisplay,
        href: phoneDial ? `tel:${phoneDial}` : "#",
      },
      secondaryPhoneDisplay,
      secondaryPhoneDial,
      secondaryPhoneHref: secondaryPhoneDial ? `tel:${secondaryPhoneDial}` : "#",
      secondaryPhone: {
        dial: secondaryPhoneDial,
        display: secondaryPhoneDisplay,
        href: secondaryPhoneDial ? `tel:${secondaryPhoneDial}` : "#",
      },
      whatsappDisplay,
      whatsappDial,
      whatsappLink,
      whatsapp: {
        dial: whatsappDial,
        display: whatsappDisplay,
        link: whatsappLink,
      },
      email,
      emailHref: email ? `mailto:${email}` : "#",
      address,
    },
    socials: {
      whatsappLink,
      instagram: clean(env.VITE_SOCIAL_INSTAGRAM_URL) || DEFAULT_INSTAGRAM_URL,
      linkedin: clean(env.VITE_SOCIAL_LINKEDIN_URL) || DEFAULT_LINKEDIN_URL,
      youtube: clean(env.VITE_SOCIAL_YOUTUBE_URL) || DEFAULT_YOUTUBE_URL,
      twitter: clean(env.VITE_SOCIAL_TWITTER_URL) || DEFAULT_TWITTER_URL,
    },
  };
}

function readRuntimePublicEnv(): PublicEnvironment {
  const metaEnv =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env as unknown as PublicEnvironment)
      : {};
  const procEnv =
    typeof process !== "undefined" && process.env
      ? (process.env as unknown as PublicEnvironment)
      : {};
  return {
    ...procEnv,
    ...metaEnv,
    LEAD_MODE: procEnv.LEAD_MODE ?? metaEnv.LEAD_MODE,
    VITE_LEAD_MODE: metaEnv.VITE_LEAD_MODE ?? procEnv.VITE_LEAD_MODE,
  };
}

export const BRAND_CONFIG = buildBrandConfig(readRuntimePublicEnv());
