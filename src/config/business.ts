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
  /** Locality and installation tier, e.g. "Jubilee Hills, Hyderabad · 15 kW Residential Villa". */
  context: string;
  /** Where the review can be verified, e.g. "Google Business Profile". */
  source: string;
  rating?: number;
}

export interface DeliveryModelConfig {
  /** Customer-facing brand role. */
  brandRole: string;
  /** How physical surveys, mounting, and electrical commissioning are fulfilled. */
  fulfillmentModel: string;
  /** Contractual clarity statement for proposals, terms, and warranty pages. */
  contractualDisclosure: string;
}

export interface BusinessConfig {
  /** Human-readable operational territory, e.g. "Telangana & Pan-India". */
  regionLabel: string;
  /** Main coordination city used for LocalBusiness/Organization schema. */
  primaryCity: string;
  /** Region used for Organization address. */
  primaryRegion: string;
  /** Country code. */
  country: string;
  /** Map coordinates of the primary coordination hub for structured data. */
  geo: { latitude: number; longitude: number };
  /** Operational service hubs across India. */
  serviceHubs: ServiceHub[];
  /** Unified brand & authorized installation partner delivery model. */
  deliveryModel: DeliveryModelConfig;
  /** Real verified customer reviews. Keep empty until confirmed by the owner. */
  reviews: CustomerReview[];
}

export const BUSINESS: BusinessConfig = {
  regionLabel: "Telangana, Karnataka, Maharashtra, Andhra Pradesh, Delhi-NCR, Goa & Tamil Nadu",
  primaryCity: "Hyderabad",
  primaryRegion: "Telangana",
  country: "IN",
  geo: { latitude: 17.385, longitude: 78.4867 },

  deliveryModel: {
    brandRole:
      "WAVENOX is a customer-facing solar energy brand managing your end-to-end journey—from initial consultation, indicative feasibility sizing, and architectural solar design to quotation, installation scheduling, utility net-metering coordination, and post-commissioning support.",
    fulfillmentModel:
      "Physical site surveys, structural mounting, electrical installation, and DISCOM bi-directional meter commissioning may be executed by authorized installation partners operating within the WAVENOX delivery network.",
    contractualDisclosure:
      "Formal contracting entities, statutory registrations (GSTIN/CIN), OEM hardware serial numbers, and installer workmanship obligations are specified in your project-specific commercial quotation and installation agreement prior to execution.",
  },

  serviceHubs: [
    {
      city: "Hyderabad & Secunderabad",
      shortName: "Hyderabad",
      schemaName: "Hyderabad",
      state: "Telangana",
      tag: "PRIMARY COORDINATION HUB (TGSPDCL & TGNPDCL)",
      description:
        "Architectural rooftop solar design, feasibility modeling, and coordinated installation delivery for residential villas and commercial campuses across Greater Hyderabad.",
      keyProjects: ["Jubilee Hills", "Banjara Hills", "Kokapet", "Gandipet", "Mokila"],
    },
    {
      city: "Bengaluru & Mysuru",
      shortName: "Bengaluru",
      schemaName: "Bengaluru",
      state: "Karnataka",
      tag: "KARNATAKA SERVICE CORRIDOR (BESCOM)",
      description:
        "Low-profile rooftop solar and LFP battery storage systems coordinated through the WAVENOX delivery network for independent villas and commercial campuses across Bengaluru.",
      keyProjects: ["Indiranagar", "Sadashivanagar", "Whitefield", "Sarjapur", "North Bengaluru"],
    },
    {
      city: "Mumbai Metropolitan Region & Pune",
      shortName: "Mumbai",
      schemaName: "Mumbai",
      state: "Maharashtra",
      tag: "WESTERN SERVICE CORRIDOR (MSEDCL & TATA POWER)",
      description:
        "Marine-grade corrosion-resistant solar pergolas and terrace arrays engineered for coastal residences in Alibaug, Lonavala estates, and Mumbai-Pune rooftops.",
      keyProjects: ["Bandra", "Juhu", "Worli", "Alibaug Coastal", "Pune Baner"],
    },
    {
      city: "Visakhapatnam & Amaravati",
      shortName: "Andhra Pradesh",
      schemaName: "Visakhapatnam",
      state: "Andhra Pradesh",
      tag: "COASTAL SERVICE CORRIDOR (APEPDCL & APSPDCL)",
      description:
        "Cyclone-resilient rooftop solar arrays engineered for coastal wind zones and high-insolation yields across Andhra Pradesh.",
      keyProjects: ["Beach Road", "Rushikonda", "Amaravati Capital", "Vijayawada"],
    },
    {
      city: "Delhi-NCR (New Delhi & Gurugram)",
      shortName: "Delhi-NCR",
      schemaName: "New Delhi",
      state: "Delhi-NCR",
      tag: "NORTHERN SERVICE CORRIDOR (BRPL & DHBVN)",
      description:
        "High-efficiency N-Type TOPCon solar installations with anti-soiling glass coatings for residential estates and commercial facilities across Delhi-NCR.",
      keyProjects: ["Lutyens' Delhi", "DLF Phase 1-5", "Golf Course Road", "Vasant Vihar"],
    },
    {
      city: "Goa (North & South Coastal Estates)",
      shortName: "Goa",
      schemaName: "Goa",
      state: "Goa",
      tag: "GOA SERVICE CORRIDOR (GED)",
      description:
        "Low-profile solar roofing and hybrid storage designed for coastal villas and hospitality properties across North and South Goa.",
      keyProjects: ["Assagao", "Anjuna", "Moira", "Aldona", "Candolim"],
    },
    {
      city: "Chennai & Coimbatore",
      shortName: "Chennai",
      schemaName: "Chennai",
      state: "Tamil Nadu",
      tag: "TAMIL NADU SERVICE CORRIDOR (TANGEDCO)",
      description:
        "High-wind-rated rooftop solar engineering and commercial net-metering coordination for residential estates and industrial facilities across Tamil Nadu.",
      keyProjects: ["Boat Club", "Poes Garden", "East Coast Road (ECR)", "OMR"],
    },
  ],

  // Leave empty until genuine reviews are verified from the owner's Google Business Profile.
  // The UI cleanly hides any testimonial section when empty, adhering to CCPA 2022 guidelines.
  reviews: [],
};

export const hubCityList = BUSINESS.serviceHubs.map((h) => h.shortName).join(" · ");
