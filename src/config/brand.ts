import { BUSINESS, hubCityList } from "./business";

/**
 * ============================================================================
 * BRAND IDENTITY & CONTACT — edit this block for each new solar business owner.
 * ============================================================================
 * Environment variables (see .env.example) override these defaults at build
 * time. Service hubs and reviews live in ./business.ts; solar physics and
 * financial constants live in ./solar.ts.
 */
export const DEFAULT_BRAND_NAME = "WAVENOX";
const DEFAULT_LEGAL_NAME = "WAVENOX Technologies Private Limited";
const DEFAULT_SITE_URL = "https://wavenox.com";
const DEFAULT_TAGLINE = "Absolute power. Zero compromise.";
const DEFAULT_PHONE_DISPLAY = "+91 91546 26354";
const DEFAULT_PHONE_DIAL = "+919154626354";
const DEFAULT_WHATSAPP_DISPLAY = "+91 70758 70054";
const DEFAULT_WHATSAPP_DIAL = "917075870054";
const DEFAULT_WHATSAPP_LINK = "https://wa.me/917075870054";
const DEFAULT_EMAIL = "advisory@wavenox.com";
const DEFAULT_ADDRESS = "WAVENOX Innovation Lab, Financial District, Gachibowli, Hyderabad, Telangana 500032";

const DEFAULT_INSTAGRAM_URL = "https://instagram.com/wavenox.solar";
const DEFAULT_LINKEDIN_URL = "https://linkedin.com/company/wavenox";
const DEFAULT_YOUTUBE_URL = "https://youtube.com/@wavenox";
const DEFAULT_TWITTER_URL = "https://x.com/wavenox";

/* ========================================================================== */

export interface BrandContactConfig {
  enabled: boolean;
  phoneDisplay: string;
  phoneDial: string;
  phoneHref: string;
  whatsappDisplay: string;
  whatsappDial: string;
  whatsappLink: string;
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
  status: "pending" | "active";
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  domain: string;
  domainHost: string;
  contact: BrandContactConfig;
  socials: BrandSocialsConfig;
}

type PublicEnvironment = Record<string, string | undefined>;

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
    const dial = url.hostname === "wa.me" ? url.pathname.replace(/\D/g, "") : url.searchParams.get("phone") || "";
    return /^[1-9]\d{7,14}$/.test(dial) ? { link: url.toString(), dial } : null;
  } catch {
    return null;
  }
}

export function buildBrandConfig(env: PublicEnvironment = {}): BrandConfig {
  const status = clean(env.VITE_SITE_STATUS).toLowerCase() === "active" ? "active" : "pending";
  const name = clean(env.VITE_BRAND_NAME) || DEFAULT_BRAND_NAME;
  const legalName = clean(env.VITE_LEGAL_NAME) || DEFAULT_LEGAL_NAME;
  const tagline = clean(env.VITE_TAGLINE) || DEFAULT_TAGLINE;
  const domain = validSiteUrl(clean(env.VITE_SITE_URL) || DEFAULT_SITE_URL);
  let domainHost = "wavenox.com";
  try {
    domainHost = new URL(domain).host;
  } catch {
    domainHost = "wavenox.com";
  }

  const phoneDisplay = clean(env.VITE_BUSINESS_PHONE_DISPLAY) || DEFAULT_PHONE_DISPLAY;
  const phoneDial = normalizedDial(env.VITE_BUSINESS_PHONE_DIAL || DEFAULT_PHONE_DIAL);

  const parsedWhatsAppLink = validWhatsAppLink(clean(env.VITE_BUSINESS_WHATSAPP_LINK));
  const whatsappDial =
    normalizedWhatsAppDial(env.VITE_BUSINESS_WHATSAPP_DIAL || "") ||
    parsedWhatsAppLink?.dial ||
    DEFAULT_WHATSAPP_DIAL;
  const whatsappDisplay =
    clean(env.VITE_BUSINESS_WHATSAPP_DISPLAY) || DEFAULT_WHATSAPP_DISPLAY;
  const whatsappLink =
    parsedWhatsAppLink?.link ||
    (whatsappDial ? `https://wa.me/${whatsappDial}` : DEFAULT_WHATSAPP_LINK);

  const email = clean(env.VITE_BUSINESS_EMAIL) || DEFAULT_EMAIL;
  const address = clean(env.VITE_BUSINESS_ADDRESS) || DEFAULT_ADDRESS;

  const contactEnabled =
    clean(env.VITE_CONTACT_ENABLED).toLowerCase() === "true" ||
    Boolean(phoneDial && whatsappDial);

  const description =
    clean(env.VITE_BRAND_DESCRIPTION) ||
    `${name} deploys world-class monolithic solar infrastructure for residential estates and commercial assets across ${hubCityList}. Absolute power. Zero compromise.`;

  return {
    status,
    name,
    legalName,
    tagline,
    description,
    domain,
    domainHost,
    contact: {
      enabled: contactEnabled,
      phoneDisplay,
      phoneDial,
      phoneHref: phoneDial ? `tel:${phoneDial}` : "#",
      whatsappDisplay,
      whatsappDial,
      whatsappLink,
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

export const BRAND_CONFIG = buildBrandConfig(
  typeof import.meta !== "undefined" && import.meta.env ? (import.meta.env as unknown as PublicEnvironment) : {},
);
