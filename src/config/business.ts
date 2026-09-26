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
  regionLabel: "Telangana, Karnataka, Maharashtra, Andhra Pradesh, Delhi-NCR, Goa & Tamil Nadu",
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
      tag: "PRIMARY HEADQUARTERS (TGSPDCL & TGNPDCL)",
      description:
        "Architectural rooftop solar design and statutory feasibility calculations for luxury residential villas and commercial campuses across Greater Hyderabad.",
      keyProjects: ["Jubilee Hills", "Banjara Hills", "Kokapet", "Gandipet", "Mokila"],
    },
    {
      city: "Bengaluru & Mysuru",
      shortName: "Bengaluru",
      schemaName: "Bengaluru",
      state: "Karnataka",
      tag: "KARNATAKA HUB (BESCOM)",
      description:
        "Premium BIPV rooftop solar installations and energy storage architecture for independent villas and technology parks across Bengaluru.",
      keyProjects: ["Indiranagar", "Sadashivanagar", "Whitefield", "Sarjapur", "North Bengaluru"],
    },
    {
      city: "Mumbai Metropolitan Region & Pune",
      shortName: "Mumbai",
      schemaName: "Mumbai",
      state: "Maharashtra",
      tag: "WESTERN HUB (MSEDCL & TATA POWER)",
      description:
        "Marine-grade corrosion-resistant architectural solar pergolas for coastal luxury villas in Alibaug, Lonavala estates, and Mumbai luxury rooftops.",
      keyProjects: ["Bandra", "Juhu", "Worli", "Alibaug Coastal", "Pune Baner"],
    },
    {
      city: "Visakhapatnam & Amaravati",
      shortName: "Andhra Pradesh",
      schemaName: "Visakhapatnam",
      state: "Andhra Pradesh",
      tag: "COASTAL HUB (APEPDCL & APSPDCL)",
      description:
        "Cyclone-resilient architectural solar arrays engineered for coastal wind zones and high-insolation yields across Andhra Pradesh.",
      keyProjects: ["Beach Road", "Rushikonda", "Amaravati Capital", "Vijayawada"],
    },
    {
      city: "Delhi-NCR (New Delhi & Gurugram)",
      shortName: "Delhi-NCR",
      schemaName: "New Delhi",
      state: "Delhi-NCR",
      tag: "NCR HUB (BRPL & DHBVN)",
      description:
        "High-efficiency TOPCon solar installations with nano-coated dust resilience for luxury farmhouses and corporate headquarters.",
      keyProjects: ["Lutyens' Delhi", "DLF Phase 1-5", "Golf Course Road", "Vasant Vihar"],
    },
    {
      city: "Goa (North & South Coastal Estates)",
      shortName: "Goa",
      schemaName: "Goa",
      state: "Goa",
      tag: "GOA HUB (GED)",
      description:
        "Aesthetic solar roofing integrated harmoniously with heritage villa architecture and luxury coastal retreats across Goa.",
      keyProjects: ["Assagao", "Anjuna", "Moira", "Aldona", "Candolim"],
    },
    {
      city: "Chennai & Coimbatore",
      shortName: "Chennai",
      schemaName: "Chennai",
      state: "Tamil Nadu",
      tag: "TAMIL NADU HUB (TANGEDCO)",
      description:
        "Tropical storm-certified architectural solar engineering for beachfront luxury estates and industrial enterprises across Tamil Nadu.",
      keyProjects: ["Boat Club", "Poes Garden", "East Coast Road (ECR)", "OMR"],
    },
  ],

  // Leave empty until genuine reviews are verified from the buyer's Google Business Profile.
  // The UI will cleanly hide the testimonial section when empty, adhering to CCPA 2022 guidelines.
  reviews: [],
};

export const hubCityList = BUSINESS.serviceHubs.map((h) => h.shortName).join(" · ");
