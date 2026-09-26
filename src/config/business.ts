/**
 * ============================================================================
 * BUSINESS CONTENT CONFIG — edit this file for each new solar business owner.
 * ============================================================================
 *
 * Identity and contact details (name, phone, WhatsApp, email, domain, socials)
 * live in `src/config/brand.ts`. Solar physics and financial models live in
 * `src/config/solar.ts`. The brand accent color lives in `src/styles.css`.
 *
 * Everything here is read by the header, footer, service-area displays,
 * homepage, structured data (SEO) and lead capture, so updating this file
 * updates the entire site.
 */

export interface ServiceHub {
  /** Display name, e.g. "Hyderabad & Secunderabad". */
  city: string;
  /** Short name used in compact lists, e.g. "Hyderabad". */
  shortName: string;
  /** Name used in schema.org `areaServed`, e.g. "Hyderabad". */
  schemaName: string;
  state: string;
  tag: string;
  description: string;
  keyProjects: string[];
}

export interface CustomerReview {
  quote: string;
  name: string;
  /** Locality and installation tier, e.g. "Jubilee Hills, Hyderabad · 50kW Liquid Glass Villa". */
  context: string;
  /** Where the review can be verified, e.g. "Google Business Profile". */
  source: string;
  rating?: number;
}

export interface BusinessConfig {
  /** Human-readable operational territory, e.g. "Telangana & Pan-India". */
  regionLabel: string;
  /** Main headquarters city used for LocalBusiness schema. */
  primaryCity: string;
  /** Region used for LocalBusiness address. */
  primaryRegion: string;
  /** Country code. */
  country: string;
  /** Map coordinates of the headquarters for structured data. */
  geo: { latitude: number; longitude: number };
  /** Operational service hubs. */
  serviceHubs: ServiceHub[];
  /** Real verified customer reviews. Keep empty until confirmed by the owner. */
  reviews: CustomerReview[];
}

export const BUSINESS: BusinessConfig = {
  regionLabel: "Hyderabad, Telangana (TGSPDCL & TGNPDCL)",
  primaryCity: "Hyderabad",
  primaryRegion: "Telangana",
  country: "IN",
  geo: { latitude: 17.385, longitude: 78.4867 },

  serviceHubs: [
    {
      city: "Hyderabad & Secunderabad",
      shortName: "Hyderabad",
      schemaName: "Hyderabad",
      state: "Telangana",
      tag: "PRIMARY REGION (TGSPDCL & TGNPDCL)",
      description:
        "Architectural rooftop solar design and statutory feasibility calculations for residential villas and commercial rooftops across Greater Hyderabad.",
      keyProjects: [],
    },
  ],

  // Leave empty until genuine reviews are verified from the buyer's Google Business Profile.
  // The UI will cleanly hide the testimonial section when empty, adhering to CCPA 2022 guidelines.
  reviews: [],
};

export const hubCityList = BUSINESS.serviceHubs.map((h) => h.shortName).join(" · ");
