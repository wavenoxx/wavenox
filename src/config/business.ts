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
  regionLabel: "Telangana, Andhra Pradesh & Pan-India",
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
      tag: "HEADQUARTERS & R&D LAB",
      description:
        "Primary engineering hub, 24/7 technical monitoring command center, and residential villa deployment crews.",
      keyProjects: ["Jubilee Hills Estates", "Banjara Hills Villas", "Financial District Tech Parks", "Gachibowli High-Rises"],
    },
    {
      city: "Bengaluru",
      shortName: "Bengaluru",
      schemaName: "Bengaluru",
      state: "Karnataka",
      tag: "INNOVATION & ENTERPRISE",
      description:
        "Enterprise commercial rooftop solar, data centers, and luxury tech estate architectures.",
      keyProjects: ["Whitefield Commercial Hubs", "Indiranagar Luxury Estates", "Electronic City Campuses"],
    },
    {
      city: "Vijayawada & Amaravati",
      shortName: "Vijayawada",
      schemaName: "Vijayawada",
      state: "Andhra Pradesh",
      tag: "COASTAL & AGRI-SOLAR",
      description:
        "Cyclone-resilient Category 5 coastal installations, riverfront villas, and industrial cold storage solar roofs.",
      keyProjects: ["Bhavanipuram Commercial Hub", "Benz Circle Residences", "Amaravati Institutional Capital"],
    },
    {
      city: "Mumbai & Pune",
      shortName: "Mumbai",
      schemaName: "Mumbai",
      state: "Maharashtra",
      tag: "HIGH-RISE & INDUSTRIAL",
      description:
        "High-density urban solar glass facades, luxury penthouses, and Chakan manufacturing plant arrays.",
      keyProjects: ["Bandra Kurla Complex", "Alibaug Luxury Compounds", "Pune Industrial Belts"],
    },
    {
      city: "Delhi-NCR",
      shortName: "Delhi",
      schemaName: "Delhi",
      state: "Delhi",
      tag: "GOVERNMENT & DIPLOMATIC",
      description:
        "High-security diplomatic compound solar, farmhouse estates, and Gurgaon corporate towers.",
      keyProjects: ["Lutyens' Delhi Residences", "Gurgaon DLF Villas", "Noida Expressway Tech Parks"],
    },
  ],

  // Leave empty until genuine reviews are verified from the buyer's Google Business Profile.
  // The UI will cleanly hide the testimonial section when empty, adhering to CCPA 2022 guidelines.
  reviews: [],
};

export const hubCityList = BUSINESS.serviceHubs.map((h) => h.shortName).join(" · ");
