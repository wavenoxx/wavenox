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

export interface IndianStateCoverageEntry {
  name: string;
  region: "North" | "West" | "South" | "East" | "Central" | "North-East";
  type: "State" | "Union Territory";
  defaultDiscomCode: string;
  discomsSummary: string;
}

export const INDIAN_STATES_AND_UTS: IndianStateCoverageEntry[] = [
  {
    name: "Andhra Pradesh",
    region: "South",
    type: "State",
    defaultDiscomCode: "APEPDCL",
    discomsSummary: "APEPDCL, APSPDCL, APCPDCL",
  },
  {
    name: "Arunachal Pradesh",
    region: "North-East",
    type: "State",
    defaultDiscomCode: "APDCL",
    discomsSummary: "Department of Power (Arunachal Pradesh)",
  },
  {
    name: "Assam",
    region: "North-East",
    type: "State",
    defaultDiscomCode: "APDCL",
    discomsSummary: "APDCL",
  },
  {
    name: "Bihar",
    region: "East",
    type: "State",
    defaultDiscomCode: "NBPDCL_SBPDCL",
    discomsSummary: "NBPDCL, SBPDCL",
  },
  {
    name: "Chhattisgarh",
    region: "Central",
    type: "State",
    defaultDiscomCode: "CSPDCL",
    discomsSummary: "CSPDCL",
  },
  {
    name: "Goa",
    region: "West",
    type: "State",
    defaultDiscomCode: "GED",
    discomsSummary: "Electricity Department Goa (GED)",
  },
  {
    name: "Gujarat",
    region: "West",
    type: "State",
    defaultDiscomCode: "UGVCL_PGVCL",
    discomsSummary: "UGVCL, PGVCL, MGVCL, DGVCL, Torrent Power",
  },
  {
    name: "Haryana",
    region: "North",
    type: "State",
    defaultDiscomCode: "DHBVN",
    discomsSummary: "DHBVN, UHBVN",
  },
  {
    name: "Himachal Pradesh",
    region: "North",
    type: "State",
    defaultDiscomCode: "HPSEBL",
    discomsSummary: "HPSEBL",
  },
  {
    name: "Jharkhand",
    region: "East",
    type: "State",
    defaultDiscomCode: "JBVNL",
    discomsSummary: "JBVNL",
  },
  {
    name: "Karnataka",
    region: "South",
    type: "State",
    defaultDiscomCode: "BESCOM",
    discomsSummary: "BESCOM, HESCOM, MESCOM, GESCOM, CESC Mysuru",
  },
  {
    name: "Kerala",
    region: "South",
    type: "State",
    defaultDiscomCode: "KSEB",
    discomsSummary: "KSEBL",
  },
  {
    name: "Madhya Pradesh",
    region: "Central",
    type: "State",
    defaultDiscomCode: "MPMKVVCL",
    discomsSummary: "MPMKVVCL, MPPKVVCL, MPPoKVVCL",
  },
  {
    name: "Maharashtra",
    region: "West",
    type: "State",
    defaultDiscomCode: "MSEDCL",
    discomsSummary: "MSEDCL, Tata Power, Adani Electricity, BEST",
  },
  {
    name: "Manipur",
    region: "North-East",
    type: "State",
    defaultDiscomCode: "APDCL",
    discomsSummary: "MSPDCL",
  },
  {
    name: "Meghalaya",
    region: "North-East",
    type: "State",
    defaultDiscomCode: "APDCL",
    discomsSummary: "MePDCL",
  },
  {
    name: "Mizoram",
    region: "North-East",
    type: "State",
    defaultDiscomCode: "APDCL",
    discomsSummary: "Power & Electricity Department Mizoram",
  },
  {
    name: "Nagaland",
    region: "North-East",
    type: "State",
    defaultDiscomCode: "APDCL",
    discomsSummary: "Department of Power Nagaland",
  },
  {
    name: "Odisha",
    region: "East",
    type: "State",
    defaultDiscomCode: "TPCODL",
    discomsSummary: "TPCODL, TPNODL, TPSODL, TPWODL",
  },
  {
    name: "Punjab",
    region: "North",
    type: "State",
    defaultDiscomCode: "PSPCL",
    discomsSummary: "PSPCL",
  },
  {
    name: "Rajasthan",
    region: "North",
    type: "State",
    defaultDiscomCode: "JVVNL",
    discomsSummary: "JVVNL, AVVNL, JdVVNL",
  },
  {
    name: "Sikkim",
    region: "North-East",
    type: "State",
    defaultDiscomCode: "APDCL",
    discomsSummary: "Sikkim Power Department",
  },
  {
    name: "Tamil Nadu",
    region: "South",
    type: "State",
    defaultDiscomCode: "TANGEDCO",
    discomsSummary: "TANGEDCO (TNPDCL)",
  },
  {
    name: "Telangana",
    region: "South",
    type: "State",
    defaultDiscomCode: "TGSPDCL",
    discomsSummary: "TGSPDCL, TGNPDCL",
  },
  {
    name: "Tripura",
    region: "North-East",
    type: "State",
    defaultDiscomCode: "APDCL",
    discomsSummary: "TSECL",
  },
  {
    name: "Uttar Pradesh",
    region: "North",
    type: "State",
    defaultDiscomCode: "UPPCL",
    discomsSummary: "UPPCL (PVVNL, MVVNL, DVVNL, PuVVNL, KESCO)",
  },
  {
    name: "Uttarakhand",
    region: "North",
    type: "State",
    defaultDiscomCode: "UPCL",
    discomsSummary: "UPCL",
  },
  {
    name: "West Bengal",
    region: "East",
    type: "State",
    defaultDiscomCode: "WBSEDCL",
    discomsSummary: "WBSEDCL, CESC Kolkata",
  },
  {
    name: "Andaman & Nicobar Islands",
    region: "South",
    type: "Union Territory",
    defaultDiscomCode: "OTHER_INDIA",
    discomsSummary: "Electricity Department A&N",
  },
  {
    name: "Chandigarh",
    region: "North",
    type: "Union Territory",
    defaultDiscomCode: "PSPCL",
    discomsSummary: "Chandigarh Electricity Dept",
  },
  {
    name: "Dadra & Nagar Haveli and Daman & Diu",
    region: "West",
    type: "Union Territory",
    defaultDiscomCode: "UGVCL_PGVCL",
    discomsSummary: "DNHPDCL / ED Daman & Diu",
  },
  {
    name: "Delhi (NCT)",
    region: "North",
    type: "Union Territory",
    defaultDiscomCode: "BRPL",
    discomsSummary: "BSES Rajdhani, BSES Yamuna, Tata Power-DDL, NDMC",
  },
  {
    name: "Jammu & Kashmir",
    region: "North",
    type: "Union Territory",
    defaultDiscomCode: "JPDCL",
    discomsSummary: "JPDCL, KPDCL",
  },
  {
    name: "Ladakh",
    region: "North",
    type: "Union Territory",
    defaultDiscomCode: "JPDCL",
    discomsSummary: "Ladakh Power Development Dept",
  },
  {
    name: "Lakshadweep",
    region: "South",
    type: "Union Territory",
    defaultDiscomCode: "OTHER_INDIA",
    discomsSummary: "Lakshadweep Electricity Dept",
  },
  {
    name: "Puducherry",
    region: "South",
    type: "Union Territory",
    defaultDiscomCode: "TANGEDCO",
    discomsSummary: "Electricity Department Puducherry",
  },
];

export const BUSINESS: BusinessConfig = {
  regionLabel: "Pan-India — All 28 States & 8 Union Territories",
  primaryCity: "Hyderabad",
  primaryRegion: "India",
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
    {
      city: "Ahmedabad, Surat & Vadodara",
      shortName: "Gujarat",
      schemaName: "Ahmedabad",
      state: "Gujarat",
      tag: "GUJARAT SERVICE CORRIDOR (UGVCL / PGVCL / TORRENT)",
      description:
        "High-insolation rooftop solar and industrial net-metering installations coordinated across Ahmedabad, Gandhinagar, Vadodara, Surat, and Rajkot.",
      keyProjects: ["SG Highway", "Bopal", "Vesu Surat", "Alkapuri Vadodara"],
    },
    {
      city: "Jaipur, Udaipur & Jodhpur",
      shortName: "Rajasthan",
      schemaName: "Jaipur",
      state: "Rajasthan",
      tag: "RAJASTHAN SERVICE CORRIDOR (JVVNL / AVVNL / JdVVNL)",
      description:
        "High-ambient-temperature N-Type TOPCon rooftop arrays engineered for desert heat tolerance across Jaipur, Udaipur, and Jodhpur.",
      keyProjects: ["C-Scheme", "Vaishali Nagar", "Fateh Sagar", "Jodhpur"],
    },
    {
      city: "Lucknow, Noida & Kanpur",
      shortName: "Uttar Pradesh",
      schemaName: "Lucknow",
      state: "Uttar Pradesh",
      tag: "UP SERVICE CORRIDOR (UPPCL / PVVNL / MVVNL)",
      description:
        "Residential PM Surya Ghar and hybrid LFP storage systems coordinated across Noida, Greater Noida, Lucknow, Ghaziabad, Varanasi, and Kanpur.",
      keyProjects: ["Gomti Nagar", "Noida Sector 44–150", "Indirapuram", "Swaroop Nagar"],
    },
    {
      city: "Kochi, Thiruvananthapuram & Kozhikode",
      shortName: "Kerala",
      schemaName: "Kochi",
      state: "Kerala",
      tag: "KERALA SERVICE CORRIDOR (KSEB)",
      description:
        "Monsoon-sealed marine-grade rooftop solar and battery backup engineered for high-humidity coastal corridors across Kerala.",
      keyProjects: ["Panampilly Nagar", "Kakkanad", "Kowdiar", "Calicut Beach"],
    },
    {
      city: "Chandigarh Tricity, Ludhiana & Bhopal",
      shortName: "Punjab & MP",
      schemaName: "Chandigarh",
      state: "Punjab, Haryana & MP",
      tag: "NORTH-CENTRAL SERVICE CORRIDOR (PSPCL / MPMKVVCL)",
      description:
        "Residential and industrial C&I solar installations across Chandigarh, Mohali, Ludhiana, Indore, and Bhopal via our authorized regional execution network.",
      keyProjects: ["Chandigarh Sectors", "Sarabha Nagar", "Vijay Nagar Indore", "Arera Colony"],
    },
    {
      city: "Kolkata, Bhubaneswar & Guwahati",
      shortName: "East & North-East",
      schemaName: "Kolkata",
      state: "West Bengal, Odisha & NE",
      tag: "EASTERN SERVICE CORRIDOR (WBSEDCL / TPCODL / APDCL)",
      description:
        "Cyclone-rated IS 875 Part 3 structural solar arrays and hybrid backup deployments across Kolkata, Bhubaneswar, Patna, Raipur, and Guwahati.",
      keyProjects: ["Salt Lake", "New Town", "Patia Bhubaneswar", "GS Road Guwahati"],
    },
  ],

  // Leave empty until genuine reviews are verified from the owner's Google Business Profile.
  // The UI cleanly hides any testimonial section when empty, adhering to CCPA 2022 guidelines.
  reviews: [],
};

export const hubCityList = BUSINESS.serviceHubs.map((h) => h.shortName).join(" · ");
