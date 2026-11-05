/**
 * ============================================================================
 * STATUTORY & REGULATORY DATA ENGINE — SINGLE SOURCE OF TRUTH (STEP 3)
 * ============================================================================
 *
 * All numbers, tariffs, subsidies, wind ratings, tax provisions, and physics
 * constants are categorized explicitly into:
 *   1. OFFICIAL_REGULATORY_FACT (verified against statutory orders/gazettes)
 *   2. ENGINEERING_MODEL_ASSUMPTION (documented physical/meteorological models)
 *   3. COMMERCIAL_PRICING_ASSUMPTION (indicative turnkey capex & financing benchmarks)
 *
 * Research & Verification Date: 2026-11-05
 */

export type VerificationStatus = "VERIFIED" | "INDICATIVE" | "REQUIRES_REVIEW" | "UNAVAILABLE";

export type DataCategory =
  "OFFICIAL_REGULATORY_FACT" | "ENGINEERING_MODEL_ASSUMPTION" | "COMMERCIAL_PRICING_ASSUMPTION";

export interface DataSource {
  title: string;
  url: string;
  verifiedOn: string; // ISO-8601 YYYY-MM-DD or YYYY-MM
  section?: string;
  documentRef?: string;
  authority?: string;
  state?: string;
  discom?: string;
  consumerCategory?: string;
  financialYear?: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  status?: VerificationStatus;
  category?: DataCategory;
  restrictions?: string;
}

export interface SourcedValue<T> {
  value: T;
  source: DataSource;
}

// ----------------------------------------------------------------------------
// 1. PM SURYA GHAR: MUFT BIJLI YOJANA (CENTRAL FINANCIAL ASSISTANCE / CFA)
// ----------------------------------------------------------------------------
export const PM_SURYA_GHAR_SOURCE: DataSource = {
  title: "PM Surya Ghar: Muft Bijli Yojana National Portal & MNRE Operational Guidelines",
  url: "https://pmsuryaghar.gov.in",
  verifiedOn: "2026-11-05",
  documentRef: "MNRE File No. 318/331/2023-GCRT & Operational Guidelines",
  authority: "Ministry of New and Renewable Energy (MNRE), Government of India",
  state: "All India",
  consumerCategory: "Residential Grid-Connected & RWA/GHS",
  financialYear: "FY 2026-27",
  effectiveFrom: "2024-02-13",
  status: "VERIFIED",
  category: "OFFICIAL_REGULATORY_FACT",
  restrictions:
    "Requires ALMM List-I & DCR-compliant Indian solar modules/cells, national portal registration, and DISCOM net-meter commissioning. Excludes commercial/industrial consumers and standalone battery costs.",
};

export const CFA_SUBSIDY_CONFIG = {
  generalCategory: {
    first2KwRatePerKw: 30000, // ₹30,000/kW up to 2 kW (₹60,000 at 2 kW)
    thirdKwRate: 18000, // ₹18,000/kW for >2 kW up to 3 kW (₹78,000 at ≥3 kW)
    maxCapInr: 78000,
  },
  specialCategory: {
    // Special category states/UTs: Uttarakhand, Himachal Pradesh, J&K, Ladakh,
    // North-East including Sikkim, Andaman & Nicobar, Lakshadweep
    first2KwRatePerKw: 33000, // ₹33,000/kW up to 2 kW (₹66,000 at 2 kW)
    thirdKwRate: 19800, // ₹19,800/kW for >2 kW up to 3 kW (₹85,800 at ≥3 kW)
    maxCapInr: 85800,
    states: [
      "Uttarakhand",
      "Himachal Pradesh",
      "Jammu and Kashmir",
      "Ladakh",
      "Sikkim",
      "Arunachal Pradesh",
      "Assam",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Tripura",
      "Andaman and Nicobar Islands",
      "Lakshadweep",
    ],
  },
  groupHousingRwa: {
    ratePerKw: 18000,
    maxKw: 500, // Common facilities up to 500 kW (@ 3 kW per resident cap)
  },
  commercial: {
    ratePerKw: 0,
  },
  disbursementMethod:
    "Direct Benefit Transfer (DBT) to beneficiary Aadhaar-linked bank account post-commissioning",
  disbursementTimeframeEstimate:
    "Dispatched by MNRE after DISCOM commissioning approval on the National Portal (typically 15–45 business days post-inspection)",
  dcrMandate:
    "Mandates Domestic Content Requirement (DCR) solar modules manufactured with domestic solar cells under ALMM",
  source: PM_SURYA_GHAR_SOURCE,
};

export interface SubsidyOptions {
  segment?: "residential" | "commercial" | "rwa";
  specialCategory?: boolean;
  state?: string;
  isGridConnected?: boolean;
  hasPriorSubsidy?: boolean;
  dcrCompliant?: boolean;
}

export type SubsidyEligibilityStatus =
  "POTENTIALLY_ELIGIBLE" | "INELIGIBLE" | "REQUIRES_VERIFICATION";

export interface SubsidyAssessment {
  eligibilityStatus: SubsidyEligibilityStatus;
  indicativeSubsidyInr: number;
  eligibleSolarKw: number;
  isSpecialCategoryState: boolean;
  schemeName: string;
  disbursementMode: string;
  conditions: string[];
  ineligibilityReason?: string;
  source: DataSource;
}

/**
 * Checks whether a state name belongs to MNRE Special Category States/UTs.
 */
export function isSpecialCategorySubsidyState(state?: string): boolean {
  if (!state) return false;
  const normalized = state.trim().toLowerCase();
  return CFA_SUBSIDY_CONFIG.specialCategory.states.some((s) => s.toLowerCase() === normalized);
}

/**
 * Calculates PM Surya Ghar CFA subsidy according to official MNRE guidelines.
 * Preserves backward compatibility for numeric callers while enforcing strict segment & bounds rules.
 */
export function calculateGovtSubsidyInr(kw: number, options: SubsidyOptions = {}): number {
  const segment = options.segment ?? "residential";
  if (segment === "commercial") return 0;
  if (options.isGridConnected === false || options.hasPriorSubsidy === true) return 0;
  if (options.dcrCompliant === false) return 0;
  if (!Number.isFinite(kw) || kw <= 0) return 0;

  if (segment === "rwa") {
    const cappedKw = Math.min(kw, CFA_SUBSIDY_CONFIG.groupHousingRwa.maxKw);
    return Math.round(cappedKw * CFA_SUBSIDY_CONFIG.groupHousingRwa.ratePerKw);
  }

  const isSpecial =
    Boolean(options.specialCategory) || isSpecialCategorySubsidyState(options.state);
  if (isSpecial) {
    const { first2KwRatePerKw, thirdKwRate, maxCapInr } = CFA_SUBSIDY_CONFIG.specialCategory;
    if (kw <= 1) return Math.round(kw * first2KwRatePerKw);
    if (kw <= 2) return Math.round(first2KwRatePerKw + (kw - 1) * first2KwRatePerKw);
    if (kw <= 3)
      return Math.min(maxCapInr, Math.round(first2KwRatePerKw * 2 + (kw - 2) * thirdKwRate));
    return maxCapInr;
  }

  const { first2KwRatePerKw, thirdKwRate, maxCapInr } = CFA_SUBSIDY_CONFIG.generalCategory;
  if (kw <= 1) return Math.round(kw * first2KwRatePerKw);
  if (kw <= 2) return Math.round(first2KwRatePerKw + (kw - 1) * first2KwRatePerKw);
  if (kw <= 3)
    return Math.min(maxCapInr, Math.round(first2KwRatePerKw * 2 + (kw - 2) * thirdKwRate));
  return maxCapInr;
}

/**
 * Structured subsidy eligibility evaluator (Phase D).
 * Explicitly separates eligibility status, statutory conditions, and DBT timing.
 */
export function evaluateSubsidyEligibility(
  solarKw: number,
  options: SubsidyOptions = {},
): SubsidyAssessment {
  const segment = options.segment ?? "residential";
  const isSpecial =
    Boolean(options.specialCategory) || isSpecialCategorySubsidyState(options.state);

  const baseConditions = [
    "Requires ALMM List-I & DCR-compliant solar modules with domestically manufactured solar cells.",
    "Consumer must register on pmsuryaghar.gov.in and link an Aadhaar-seeded bank account.",
    "Subsidy is disbursed via Direct Benefit Transfer (DBT) post-DISCOM net-meter commissioning, never deducted upfront from the installer invoice.",
    "Standalone LiFePO4 battery storage capex is excluded from central subsidy calculation.",
  ];

  if (segment === "commercial") {
    return {
      eligibilityStatus: "INELIGIBLE",
      indicativeSubsidyInr: 0,
      eligibleSolarKw: 0,
      isSpecialCategoryState: isSpecial,
      schemeName: "PM Surya Ghar: Muft Bijli Yojana",
      disbursementMode: CFA_SUBSIDY_CONFIG.disbursementMethod,
      conditions: baseConditions,
      ineligibilityReason:
        "Commercial and industrial connections are ineligible for residential PM Surya Ghar Central Financial Assistance.",
      source: PM_SURYA_GHAR_SOURCE,
    };
  }

  if (options.isGridConnected === false) {
    return {
      eligibilityStatus: "INELIGIBLE",
      indicativeSubsidyInr: 0,
      eligibleSolarKw: 0,
      isSpecialCategoryState: isSpecial,
      schemeName: "PM Surya Ghar: Muft Bijli Yojana",
      disbursementMode: CFA_SUBSIDY_CONFIG.disbursementMethod,
      conditions: baseConditions,
      ineligibilityReason:
        "Off-grid solar installations without DISCOM net metering are ineligible.",
      source: PM_SURYA_GHAR_SOURCE,
    };
  }

  if (options.hasPriorSubsidy === true) {
    return {
      eligibilityStatus: "INELIGIBLE",
      indicativeSubsidyInr: 0,
      eligibleSolarKw: 0,
      isSpecialCategoryState: isSpecial,
      schemeName: "PM Surya Ghar: Muft Bijli Yojana",
      disbursementMode: CFA_SUBSIDY_CONFIG.disbursementMethod,
      conditions: baseConditions,
      ineligibilityReason:
        "Residential connections that have already availed central rooftop solar subsidy are ineligible for a repeat claim.",
      source: PM_SURYA_GHAR_SOURCE,
    };
  }

  if (options.dcrCompliant === false) {
    return {
      eligibilityStatus: "INELIGIBLE",
      indicativeSubsidyInr: 0,
      eligibleSolarKw: 0,
      isSpecialCategoryState: isSpecial,
      schemeName: "PM Surya Ghar: Muft Bijli Yojana",
      disbursementMode: CFA_SUBSIDY_CONFIG.disbursementMethod,
      conditions: baseConditions,
      ineligibilityReason:
        "Non-DCR (imported cell) solar modules are ineligible for PM Surya Ghar central subsidy.",
      source: PM_SURYA_GHAR_SOURCE,
    };
  }

  if (!Number.isFinite(solarKw) || solarKw <= 0) {
    return {
      eligibilityStatus: "INELIGIBLE",
      indicativeSubsidyInr: 0,
      eligibleSolarKw: 0,
      isSpecialCategoryState: isSpecial,
      schemeName: "PM Surya Ghar: Muft Bijli Yojana",
      disbursementMode: CFA_SUBSIDY_CONFIG.disbursementMethod,
      conditions: baseConditions,
      ineligibilityReason: "Valid positive solar DC capacity (kWp) is required.",
      source: PM_SURYA_GHAR_SOURCE,
    };
  }

  const indicativeSubsidyInr = calculateGovtSubsidyInr(solarKw, options);

  if (solarKw < 1) {
    return {
      eligibilityStatus: "REQUIRES_VERIFICATION",
      indicativeSubsidyInr,
      eligibleSolarKw: solarKw,
      isSpecialCategoryState: isSpecial,
      schemeName: "PM Surya Ghar: Muft Bijli Yojana",
      disbursementMode: CFA_SUBSIDY_CONFIG.disbursementMethod,
      conditions: [
        "Systems below 1 kW require DISCOM portal verification; standard residential sanctions begin at 1 kW.",
        ...baseConditions,
      ],
      source: PM_SURYA_GHAR_SOURCE,
    };
  }

  if (segment === "residential" && solarKw > 10) {
    return {
      eligibilityStatus: "REQUIRES_VERIFICATION",
      indicativeSubsidyInr,
      eligibleSolarKw: 3,
      isSpecialCategoryState: isSpecial,
      schemeName: "PM Surya Ghar: Muft Bijli Yojana",
      disbursementMode: CFA_SUBSIDY_CONFIG.disbursementMethod,
      conditions: [
        "Subsidy is capped at 3 kW (₹78,000 general / ₹85,800 special category). Systems above 10 kW require DISCOM distribution transformer (DT) technical feasibility approval.",
        ...baseConditions,
      ],
      source: PM_SURYA_GHAR_SOURCE,
    };
  }

  return {
    eligibilityStatus: "POTENTIALLY_ELIGIBLE",
    indicativeSubsidyInr,
    eligibleSolarKw: segment === "rwa" ? Math.min(solarKw, 500) : Math.min(solarKw, 3),
    isSpecialCategoryState: isSpecial,
    schemeName: "PM Surya Ghar: Muft Bijli Yojana",
    disbursementMode: CFA_SUBSIDY_CONFIG.disbursementMethod,
    conditions: baseConditions,
    source: PM_SURYA_GHAR_SOURCE,
  };
}

// ----------------------------------------------------------------------------
// 2. STATE-SPECIFIC ELECTRICITY TARIFFS (PHASE A)
//    - PRIORITY 1: TELANGANA (TGERC FY 2025-26 & FY 2026-27 ORDERS) [VERIFIED]
//    - PRIORITY 2: ANDHRA PRADESH (APERC FY 2025-26 & FY 2026-27 ORDERS) [VERIFIED]
//    - OTHER SERVICE CORRIDORS: INDICATIVE REGIONAL BENCHMARKS [INDICATIVE]
// ----------------------------------------------------------------------------
export const TGERC_TARIFF_SOURCE: DataSource = {
  title:
    "TGERC Retail Supply Tariff Orders FY 2025-26 & FY 2026-27 (Schedule of Retail Tariffs — LT-I Domestic)",
  url: "https://tgsouthernpower.org/resources/PDF/Tariffs/63tarifffile.pdf",
  verifiedOn: "2026-11-05",
  documentRef: "TGERC O.P. Nos. 102 & 103 of 2024; FY 2026-27 Retail Supply Tariff Order",
  authority: "Telangana Electricity Regulatory Commission (TGERC)",
  state: "Telangana",
  discom: "TGSPDCL / TGNPDCL",
  consumerCategory: "LT-I Domestic (A, B, C) & HT/LT Commercial",
  financialYear: "FY 2026-27",
  effectiveFrom: "2025-04-01",
  status: "VERIFIED",
  category: "OFFICIAL_REGULATORY_FACT",
  restrictions:
    "Excludes variable monthly Fuel Cost Adjustment (FCA) surcharges if notified separately. Gruha Jyothi zero-bill scheme applies up to 200 units/month for eligible White Ration Card households.",
};

export const APERC_TARIFF_SOURCE: DataSource = {
  title:
    "APERC Retail Supply Tariff Orders FY 2025-26 & FY 2026-27 (LT Category-I(A) Domestic Telescopic Schedule)",
  url: "https://aperc.gov.in/page/Tariff_Orders",
  verifiedOn: "2026-11-05",
  documentRef: "APERC Retail Supply Tariff Order for FY 2025-26 & FY 2026-27 (APEPDCL / APSPDCL)",
  authority: "Andhra Pradesh Electricity Regulatory Commission (APERC)",
  state: "Andhra Pradesh",
  discom: "APEPDCL / APSPDCL",
  consumerCategory: "LT Category-I(A) Domestic & LT Category-II Commercial",
  financialYear: "FY 2026-27",
  effectiveFrom: "2025-04-01",
  status: "VERIFIED",
  category: "OFFICIAL_REGULATORY_FACT",
  restrictions:
    "Models APERC 6-tier telescopic energy slabs, customer charges, ₹10/kW fixed charges, and ₹0.06/kWh baseline duty. Excludes variable FPPCA / fuel surcharge adjustments billed separately on utility invoices.",
};

export const INDICATIVE_REGIONAL_TARIFF_SOURCE: DataSource = {
  title: "Regional SERC Retail Tariff Benchmarks (Preliminary Sizing Reference)",
  url: "https://pmsuryaghar.gov.in",
  verifiedOn: "2026-11-05",
  documentRef: "SERC Published Domestic & Commercial Average Tariff Benchmarks (FY 2025-26)",
  authority: "Respective State Electricity Regulatory Commissions (SERCs)",
  state: "Multi-State Service Corridors",
  consumerCategory: "Domestic & Commercial (Indicative Blended Rate)",
  financialYear: "FY 2026-27",
  status: "INDICATIVE",
  category: "ENGINEERING_MODEL_ASSUMPTION",
  restrictions:
    "Uses regional blended tariff benchmarks for preliminary system sizing. Exact slab-by-slab billing, TOD adjustments, and FAC/FPPCA surcharges are verified from the consumer's utility bill during consultation.",
};

export type NetMeteringMechanism = "NET_METERING_1_TO_1" | "INDICATIVE_NET_METERING" | "UNVERIFIED";

export interface DiscomTariffProfile {
  code: string;
  name: string;
  state: string;
  cityKey: string;
  status: VerificationStatus;
  authority: string;
  financialYear: string;
  residentialBlendedTariffInr: number;
  commercialBlendedTariffInr: number;
  exportSettlementRateInr: number; // APPC surplus settlement rate at end of settlement period
  netMeteringMechanism: NetMeteringMechanism;
  fixedChargePerKwMonthInr: number;
  electricityDutyPerUnitInr: number;
  gruhaJyothiApplicable: boolean;
  regulatoryNote: string;
  source: DataSource;
}

export const DISCOM_TARIFF_PROFILES: Record<string, DiscomTariffProfile> = {
  TGSPDCL: {
    code: "TGSPDCL",
    name: "Telangana Southern Power Distribution Company",
    state: "Telangana",
    cityKey: "hyderabad",
    status: "VERIFIED",
    authority: "TGERC",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 9.2,
    commercialBlendedTariffInr: 10.5,
    exportSettlementRateInr: 3.55,
    netMeteringMechanism: "NET_METERING_1_TO_1",
    fixedChargePerKwMonthInr: 10,
    electricityDutyPerUnitInr: 0.06,
    gruhaJyothiApplicable: true,
    regulatoryNote:
      "Verified against TGERC LT-I(A/B/C) telescopic slabs (FY 2025-26 & FY 2026-27 unchanged domestic schedule). Telangana Gruha Jyothi waives bills up to 200 units/month for eligible households.",
    source: TGERC_TARIFF_SOURCE,
  },
  TGNPDCL: {
    code: "TGNPDCL",
    name: "Telangana Northern Power Distribution Company",
    state: "Telangana",
    cityKey: "hyderabad",
    status: "VERIFIED",
    authority: "TGERC",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 8.8,
    commercialBlendedTariffInr: 10.2,
    exportSettlementRateInr: 3.55,
    netMeteringMechanism: "NET_METERING_1_TO_1",
    fixedChargePerKwMonthInr: 10,
    electricityDutyPerUnitInr: 0.06,
    gruhaJyothiApplicable: true,
    regulatoryNote:
      "Verified against TGERC LT-I(A/B/C) telescopic slabs (FY 2025-26 & FY 2026-27 unchanged domestic schedule). Telangana Gruha Jyothi waives bills up to 200 units/month for eligible households.",
    source: TGERC_TARIFF_SOURCE,
  },
  APEPDCL: {
    code: "APEPDCL",
    name: "Eastern Power Distribution Company of AP (Visakhapatnam)",
    state: "Andhra Pradesh",
    cityKey: "visakhapatnam",
    status: "VERIFIED",
    authority: "APERC",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 8.9,
    commercialBlendedTariffInr: 10.4,
    exportSettlementRateInr: 3.6,
    netMeteringMechanism: "NET_METERING_1_TO_1",
    fixedChargePerKwMonthInr: 10,
    electricityDutyPerUnitInr: 0.06,
    gruhaJyothiApplicable: false,
    regulatoryNote:
      "Verified against APERC LT-I(A) 6-tier telescopic domestic tariff schedule (FY 2025-26 & FY 2026-27 Orders). Variable monthly FPPCA/fuel surcharges are excluded from baseline estimates.",
    source: APERC_TARIFF_SOURCE,
  },
  APSPDCL: {
    code: "APSPDCL",
    name: "Southern Power Distribution Company of AP (Amaravati / Tirupati)",
    state: "Andhra Pradesh",
    cityKey: "visakhapatnam",
    status: "VERIFIED",
    authority: "APERC",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 8.9,
    commercialBlendedTariffInr: 10.4,
    exportSettlementRateInr: 3.6,
    netMeteringMechanism: "NET_METERING_1_TO_1",
    fixedChargePerKwMonthInr: 10,
    electricityDutyPerUnitInr: 0.06,
    gruhaJyothiApplicable: false,
    regulatoryNote:
      "Verified against APERC LT-I(A) 6-tier telescopic domestic tariff schedule (FY 2025-26 & FY 2026-27 Orders). Variable monthly FPPCA/fuel surcharges are excluded from baseline estimates.",
    source: APERC_TARIFF_SOURCE,
  },
  BESCOM: {
    code: "BESCOM",
    name: "Bangalore Electricity Supply Company (Karnataka)",
    state: "Karnataka",
    cityKey: "bengaluru",
    status: "INDICATIVE",
    authority: "KERC (Indicative Benchmark)",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 8.8,
    commercialBlendedTariffInr: 10.2,
    exportSettlementRateInr: 3.82,
    netMeteringMechanism: "INDICATIVE_NET_METERING",
    fixedChargePerKwMonthInr: 120,
    electricityDutyPerUnitInr: 0.09,
    gruhaJyothiApplicable: false,
    regulatoryNote:
      "Detailed tariff calculation for this electricity board requires confirmation. Preliminary sizing uses indicative KERC/BESCOM blended tariff benchmarks; exact fixed charges and Gruha Jyothi eligibility are confirmed during site consultation.",
    source: INDICATIVE_REGIONAL_TARIFF_SOURCE,
  },
  MSEDCL: {
    code: "MSEDCL",
    name: "Maharashtra State Electricity Distribution (Mahavitaran)",
    state: "Maharashtra",
    cityKey: "mumbai",
    status: "INDICATIVE",
    authority: "MERC (Indicative Benchmark)",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 9.5,
    commercialBlendedTariffInr: 11.2,
    exportSettlementRateInr: 3.75,
    netMeteringMechanism: "INDICATIVE_NET_METERING",
    fixedChargePerKwMonthInr: 90,
    electricityDutyPerUnitInr: 0.16,
    gruhaJyothiApplicable: false,
    regulatoryNote:
      "Detailed tariff calculation for this electricity board requires confirmation. Preliminary sizing uses indicative MERC/MSEDCL tariff benchmarks; wheeling, FAC, and slab charges are verified during consultation.",
    source: INDICATIVE_REGIONAL_TARIFF_SOURCE,
  },
  TATA_MUMBAI: {
    code: "TATA_MUMBAI",
    name: "Tata Power Mumbai (MMR)",
    state: "Maharashtra",
    cityKey: "mumbai",
    status: "INDICATIVE",
    authority: "MERC (Indicative Benchmark)",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 9.8,
    commercialBlendedTariffInr: 11.5,
    exportSettlementRateInr: 3.9,
    netMeteringMechanism: "INDICATIVE_NET_METERING",
    fixedChargePerKwMonthInr: 100,
    electricityDutyPerUnitInr: 0.16,
    gruhaJyothiApplicable: false,
    regulatoryNote:
      "Detailed tariff calculation for this electricity board requires confirmation. Preliminary sizing uses indicative Mumbai MMR blended tariff benchmarks; exact slab and wheeling charges are verified during consultation.",
    source: INDICATIVE_REGIONAL_TARIFF_SOURCE,
  },
  BRPL: {
    code: "BRPL",
    name: "BSES Rajdhani Power Limited (New Delhi)",
    state: "Delhi-NCR",
    cityKey: "delhi",
    status: "INDICATIVE",
    authority: "DERC (Indicative Benchmark)",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 8.5,
    commercialBlendedTariffInr: 10.8,
    exportSettlementRateInr: 3.7,
    netMeteringMechanism: "INDICATIVE_NET_METERING",
    fixedChargePerKwMonthInr: 80,
    electricityDutyPerUnitInr: 0.05,
    gruhaJyothiApplicable: false,
    regulatoryNote:
      "Detailed tariff calculation for this electricity board requires confirmation. Preliminary sizing uses indicative DERC/BRPL tariff benchmarks; PPAC surcharges and sanctioned load charges are verified during consultation.",
    source: INDICATIVE_REGIONAL_TARIFF_SOURCE,
  },
  DHBVN: {
    code: "DHBVN",
    name: "Dakshin Haryana Bijli Vitran Nigam (Gurugram)",
    state: "Delhi-NCR",
    cityKey: "delhi",
    status: "INDICATIVE",
    authority: "HERC (Indicative Benchmark)",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 8.6,
    commercialBlendedTariffInr: 10.6,
    exportSettlementRateInr: 3.65,
    netMeteringMechanism: "INDICATIVE_NET_METERING",
    fixedChargePerKwMonthInr: 75,
    electricityDutyPerUnitInr: 0.1,
    gruhaJyothiApplicable: false,
    regulatoryNote:
      "Detailed tariff calculation for this electricity board requires confirmation. Preliminary sizing uses indicative HERC/DHBVN tariff benchmarks; exact slab and FSA charges are verified during consultation.",
    source: INDICATIVE_REGIONAL_TARIFF_SOURCE,
  },
  GED: {
    code: "GED",
    name: "Goa Electricity Department (Goa Coastal)",
    state: "Goa",
    cityKey: "goa",
    status: "INDICATIVE",
    authority: "JERC (Indicative Benchmark)",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 7.8,
    commercialBlendedTariffInr: 9.8,
    exportSettlementRateInr: 3.5,
    netMeteringMechanism: "INDICATIVE_NET_METERING",
    fixedChargePerKwMonthInr: 60,
    electricityDutyPerUnitInr: 0.06,
    gruhaJyothiApplicable: false,
    regulatoryNote:
      "Detailed tariff calculation for this electricity board requires confirmation. Preliminary sizing uses indicative JERC Goa tariff benchmarks; exact slab and FPPCA charges are verified during consultation.",
    source: INDICATIVE_REGIONAL_TARIFF_SOURCE,
  },
  TANGEDCO: {
    code: "TANGEDCO",
    name: "Tamil Nadu Generation & Distribution Corporation (Chennai)",
    state: "Tamil Nadu",
    cityKey: "chennai",
    status: "INDICATIVE",
    authority: "TNERC (Indicative Benchmark)",
    financialYear: "FY 2026-27",
    residentialBlendedTariffInr: 8.7,
    commercialBlendedTariffInr: 10.5,
    exportSettlementRateInr: 3.6,
    netMeteringMechanism: "INDICATIVE_NET_METERING",
    fixedChargePerKwMonthInr: 75,
    electricityDutyPerUnitInr: 0.06,
    gruhaJyothiApplicable: false,
    regulatoryNote:
      "Detailed tariff calculation for this electricity board requires confirmation. Tamil Nadu domestic billing follows bi-monthly TNERC slabs and solar net-feed/net-metering mechanisms verified during consultation.",
    source: INDICATIVE_REGIONAL_TARIFF_SOURCE,
  },
};

export function getDiscomTariffProfile(discomCode?: string): DiscomTariffProfile | null {
  if (!discomCode) return null;
  return DISCOM_TARIFF_PROFILES[discomCode.trim().toUpperCase()] ?? null;
}

/**
 * Telangana LT-I Domestic Telescopic Slabs (TGERC FY 2025-26 & FY 2026-27):
 * LT-I(A) ≤ 100 units/mo: 0–50 @ ₹1.95, 51–100 @ ₹3.10
 * LT-I(B) 101–200 units/mo: 0–100 @ ₹3.40, 101–200 @ ₹4.80
 * LT-I(C) > 200 units/mo: 0–200 @ ₹5.10, 201–300 @ ₹7.70, 301–400 @ ₹9.00, 401–800 @ ₹9.50, >800 @ ₹10.00
 */
function calculateTelanganaDomesticEnergyCharge(u: number): {
  category: "LT-I(A)" | "LT-I(B)" | "LT-I(C)";
  energyCharge: number;
  customerCharge: number;
  slabs: BillSlabBreakdown[];
} {
  const slabs: BillSlabBreakdown[] = [];
  let category: "LT-I(A)" | "LT-I(B)" | "LT-I(C)" = "LT-I(C)";

  if (u <= 100) {
    category = "LT-I(A)";
    const u1 = Math.min(u, 50);
    slabs.push({
      slab: "0 – 50 units",
      units: u1,
      ratePerUnit: 1.95,
      amount: Math.round(u1 * 1.95 * 100) / 100,
    });
    if (u > 50) {
      const u2 = u - 50;
      slabs.push({
        slab: "51 – 100 units",
        units: u2,
        ratePerUnit: 3.1,
        amount: Math.round(u2 * 3.1 * 100) / 100,
      });
    }
  } else if (u <= 200) {
    category = "LT-I(B)";
    const u1 = Math.min(u, 100);
    slabs.push({
      slab: "0 – 100 units",
      units: u1,
      ratePerUnit: 3.4,
      amount: Math.round(u1 * 3.4 * 100) / 100,
    });
    if (u > 100) {
      const u2 = u - 100;
      slabs.push({
        slab: "101 – 200 units",
        units: u2,
        ratePerUnit: 4.8,
        amount: Math.round(u2 * 4.8 * 100) / 100,
      });
    }
  } else {
    category = "LT-I(C)";
    const u1 = Math.min(u, 200);
    slabs.push({
      slab: "0 – 200 units",
      units: u1,
      ratePerUnit: 5.1,
      amount: Math.round(u1 * 5.1 * 100) / 100,
    });
    if (u > 200) {
      const u2 = Math.min(u - 200, 100);
      slabs.push({
        slab: "201 – 300 units",
        units: u2,
        ratePerUnit: 7.7,
        amount: Math.round(u2 * 7.7 * 100) / 100,
      });
    }
    if (u > 300) {
      const u3 = Math.min(u - 300, 100);
      slabs.push({
        slab: "301 – 400 units",
        units: u3,
        ratePerUnit: 9.0,
        amount: Math.round(u3 * 9.0 * 100) / 100,
      });
    }
    if (u > 400) {
      const u4 = Math.min(u - 400, 400);
      slabs.push({
        slab: "401 – 800 units",
        units: u4,
        ratePerUnit: 9.5,
        amount: Math.round(u4 * 9.5 * 100) / 100,
      });
    }
    if (u > 800) {
      const u5 = u - 800;
      slabs.push({
        slab: "> 800 units",
        units: u5,
        ratePerUnit: 10.0,
        amount: Math.round(u5 * 10.0 * 100) / 100,
      });
    }
  }

  const energyCharge = slabs.reduce((acc, s) => acc + s.amount, 0);

  let customerCharge = 70;
  if (u <= 100) customerCharge = 25;
  else if (u <= 200) customerCharge = 50;
  else if (u <= 300) customerCharge = 60;
  else if (u <= 400) customerCharge = 70;
  else customerCharge = 80;

  return { category, energyCharge, customerCharge, slabs };
}

/**
 * Andhra Pradesh LT-I(A) Domestic Telescopic Slabs (APERC FY 2025-26 & FY 2026-27):
 *   0 – 30 units:    ₹1.90/kWh
 *   31 – 75 units:   ₹3.00/kWh
 *   76 – 125 units:  ₹4.50/kWh
 *   126 – 225 units: ₹6.00/kWh
 *   226 – 400 units: ₹8.75/kWh
 *   > 400 units:     ₹9.75/kWh
 */
function calculateAndhraPradeshDomesticEnergyCharge(u: number): {
  category: "LT-I(A)";
  energyCharge: number;
  customerCharge: number;
  slabs: BillSlabBreakdown[];
} {
  const slabs: BillSlabBreakdown[] = [];
  const brackets: Array<{ label: string; min: number; max: number; rate: number }> = [
    { label: "0 – 30 units", min: 0, max: 30, rate: 1.9 },
    { label: "31 – 75 units", min: 30, max: 75, rate: 3.0 },
    { label: "76 – 125 units", min: 75, max: 125, rate: 4.5 },
    { label: "126 – 225 units", min: 125, max: 225, rate: 6.0 },
    { label: "226 – 400 units", min: 225, max: 400, rate: 8.75 },
    { label: "> 400 units", min: 400, max: Infinity, rate: 9.75 },
  ];

  for (const b of brackets) {
    if (u > b.min) {
      const slabUnits = Math.min(u, b.max) - b.min;
      slabs.push({
        slab: b.label,
        units: slabUnits,
        ratePerUnit: b.rate,
        amount: Math.round(slabUnits * b.rate * 100) / 100,
      });
    }
  }

  const energyCharge = slabs.reduce((acc, s) => acc + s.amount, 0);

  let customerCharge = 55;
  if (u <= 50) customerCharge = 25;
  else if (u <= 100) customerCharge = 30;
  else if (u <= 200) customerCharge = 45;
  else if (u <= 300) customerCharge = 50;
  else customerCharge = 55;

  return { category: "LT-I(A)", energyCharge, customerCharge, slabs };
}

/**
 * State-aware energy charge computation.
 * - Telangana (TGSPDCL, TGNPDCL): Verified TGERC LT-I(A/B/C) telescopic slabs.
 * - Andhra Pradesh (APEPDCL, APSPDCL): Verified APERC LT-I(A) 6-tier telescopic slabs.
 * - Other listed DISCOMs: Indicative blended energy rate (never silently reuses Telangana slabs).
 * - Unknown DISCOM code: Returns 0.
 */
export function energyCharge(discomCode: string, units: number): number {
  if (!Number.isFinite(units) || units <= 0) return 0;
  const profile = getDiscomTariffProfile(discomCode);
  if (!profile) return 0;

  const u = Math.round(units);
  if (profile.code === "TGSPDCL" || profile.code === "TGNPDCL") {
    return Math.round(calculateTelanganaDomesticEnergyCharge(u).energyCharge * 100) / 100;
  }
  if (profile.code === "APEPDCL" || profile.code === "APSPDCL") {
    return Math.round(calculateAndhraPradeshDomesticEnergyCharge(u).energyCharge * 100) / 100;
  }

  // Indicative regional DISCOMs: use their own indicative energy rate (less duty component)
  const netEnergyRate = Math.max(
    1,
    profile.residentialBlendedTariffInr - profile.electricityDutyPerUnitInr,
  );
  return Math.round(u * netEnergyRate * 100) / 100;
}

export interface BillCalculationContext {
  sanctionedLoadKw?: number;
  segment?: "residential" | "commercial";
}

export interface ElectricityBillResult {
  status: VerificationStatus;
  discomCode: string;
  authority: string;
  units: number;
  sanctionedLoadKw: number;
  energyChargeInr: number;
  customerChargeInr: number;
  fixedChargeInr: number;
  electricityDutyInr: number;
  unavoidableChargesInr: number;
  avoidableChargesInr: number;
  totalBillInr: number;
  averageRatePerKwh: number;
  slabs: BillSlabBreakdown[];
  categoryLabel: "LT-I(A)" | "LT-I(B)" | "LT-I(C)" | "INDICATIVE-LT" | "UNAVAILABLE";
  warnings: string[];
  source: DataSource;
}

/**
 * Pure state-aware electricity bill calculator (Phase A).
 */
export function calculateElectricityBill(
  profileOrCode: string | DiscomTariffProfile,
  units: number,
  context: BillCalculationContext = {},
): ElectricityBillResult {
  const profile =
    typeof profileOrCode === "string" ? getDiscomTariffProfile(profileOrCode) : profileOrCode;
  const sanctionedLoadKw =
    typeof context.sanctionedLoadKw === "number" &&
    Number.isFinite(context.sanctionedLoadKw) &&
    context.sanctionedLoadKw > 0
      ? context.sanctionedLoadKw
      : 5;

  if (!profile) {
    return {
      status: "UNAVAILABLE",
      discomCode: typeof profileOrCode === "string" ? profileOrCode : "UNKNOWN",
      authority: "Unsupported Utility",
      units: 0,
      sanctionedLoadKw,
      energyChargeInr: 0,
      customerChargeInr: 0,
      fixedChargeInr: 0,
      electricityDutyInr: 0,
      unavoidableChargesInr: 0,
      avoidableChargesInr: 0,
      totalBillInr: 0,
      averageRatePerKwh: 0,
      slabs: [],
      categoryLabel: "UNAVAILABLE",
      warnings: ["Detailed tariff calculation for this electricity board is unavailable."],
      source: INDICATIVE_REGIONAL_TARIFF_SOURCE,
    };
  }

  if (!Number.isFinite(units) || units <= 0) {
    return {
      status: profile.status,
      discomCode: profile.code,
      authority: profile.authority,
      units: 0,
      sanctionedLoadKw,
      energyChargeInr: 0,
      customerChargeInr: 0,
      fixedChargeInr: 0,
      electricityDutyInr: 0,
      unavoidableChargesInr: 0,
      avoidableChargesInr: 0,
      totalBillInr: 0,
      averageRatePerKwh: 0,
      slabs: [],
      categoryLabel: profile.status === "VERIFIED" ? "LT-I(A)" : "INDICATIVE-LT",
      warnings: [],
      source: profile.source,
    };
  }

  const u = Math.round(units);

  // 1. Telangana (TGSPDCL / TGNPDCL) — Verified TGERC LT-I(A/B/C)
  if (profile.code === "TGSPDCL" || profile.code === "TGNPDCL") {
    const tg = calculateTelanganaDomesticEnergyCharge(u);
    const fixedChargeInr = u > 200 ? Math.max(1, sanctionedLoadKw) * 10 : 0;
    const electricityDutyInr = Math.round(u * 0.06 * 100) / 100;
    const energyChargeRounded = Math.round(tg.energyCharge);
    const totalBillInr = Math.round(
      tg.energyCharge + tg.customerCharge + fixedChargeInr + electricityDutyInr,
    );
    const unavoidableChargesInr = Math.round(tg.customerCharge + fixedChargeInr);
    const avoidableChargesInr = Math.max(0, totalBillInr - unavoidableChargesInr);

    return {
      status: "VERIFIED",
      discomCode: profile.code,
      authority: "TGERC",
      units: u,
      sanctionedLoadKw,
      energyChargeInr: energyChargeRounded,
      customerChargeInr: tg.customerCharge,
      fixedChargeInr,
      electricityDutyInr,
      unavoidableChargesInr,
      avoidableChargesInr,
      totalBillInr,
      averageRatePerKwh: Number((totalBillInr / u).toFixed(2)),
      slabs: tg.slabs,
      categoryLabel: tg.category,
      warnings: [],
      source: profile.source,
    };
  }

  // 2. Andhra Pradesh (APEPDCL / APSPDCL) — Verified APERC LT-I(A)
  if (profile.code === "APEPDCL" || profile.code === "APSPDCL") {
    const ap = calculateAndhraPradeshDomesticEnergyCharge(u);
    const fixedChargeInr = Math.max(1, sanctionedLoadKw) * 10;
    const electricityDutyInr = Math.round(u * 0.06 * 100) / 100;
    const energyChargeRounded = Math.round(ap.energyCharge);
    const totalBillInr = Math.round(
      ap.energyCharge + ap.customerCharge + fixedChargeInr + electricityDutyInr,
    );
    const unavoidableChargesInr = Math.round(ap.customerCharge + fixedChargeInr);
    const avoidableChargesInr = Math.max(0, totalBillInr - unavoidableChargesInr);

    return {
      status: "VERIFIED",
      discomCode: profile.code,
      authority: "APERC",
      units: u,
      sanctionedLoadKw,
      energyChargeInr: energyChargeRounded,
      customerChargeInr: ap.customerCharge,
      fixedChargeInr,
      electricityDutyInr,
      unavoidableChargesInr,
      avoidableChargesInr,
      totalBillInr,
      averageRatePerKwh: Number((totalBillInr / u).toFixed(2)),
      slabs: ap.slabs,
      categoryLabel: ap.category,
      warnings: [
        "Excludes variable monthly Fuel and Power Purchase Cost Adjustment (FPPCA) charges.",
      ],
      source: profile.source,
    };
  }

  // 3. Indicative Regional DISCOMs (BESCOM, MSEDCL, TATA_MUMBAI, BRPL, DHBVN, GED, TANGEDCO)
  const netEnergyRate = Number(
    Math.max(1, profile.residentialBlendedTariffInr - profile.electricityDutyPerUnitInr).toFixed(2),
  );
  const energyAmt = Math.round(u * netEnergyRate * 100) / 100;
  const customerChargeInr = 50;
  const fixedChargeInr = Math.round(Math.max(1, sanctionedLoadKw) * 20);
  const electricityDutyInr = Math.round(u * profile.electricityDutyPerUnitInr * 100) / 100;
  const totalBillInr = Math.round(
    energyAmt + customerChargeInr + fixedChargeInr + electricityDutyInr,
  );
  const unavoidableChargesInr = customerChargeInr + fixedChargeInr;
  const avoidableChargesInr = Math.max(0, totalBillInr - unavoidableChargesInr);

  return {
    status: "INDICATIVE",
    discomCode: profile.code,
    authority: profile.authority,
    units: u,
    sanctionedLoadKw,
    energyChargeInr: Math.round(energyAmt),
    customerChargeInr,
    fixedChargeInr,
    electricityDutyInr,
    unavoidableChargesInr,
    avoidableChargesInr,
    totalBillInr,
    averageRatePerKwh: Number((totalBillInr / u).toFixed(2)),
    slabs: [
      {
        slab: `Indicative Regional Rate (${profile.state})`,
        units: u,
        ratePerUnit: netEnergyRate,
        amount: energyAmt,
      },
    ],
    categoryLabel: "INDICATIVE-LT",
    warnings: [profile.regulatoryNote],
    source: profile.source,
  };
}

/**
 * Computes full monthly bill including customer charges, fixed charges, and duty.
 */
export function calculateMonthlyElectricityBill(
  discomCode: string,
  units: number,
  sanctionedLoadKw: number = 5,
): number {
  if (!Number.isFinite(units) || units <= 0) return 0;
  const res = calculateElectricityBill(discomCode, units, { sanctionedLoadKw });
  if (res.status === "UNAVAILABLE") return 0;
  return res.totalBillInr;
}

/**
 * Inverse bill-to-units conversion via binary search (Phase A).
 * - For VERIFIED DISCOMs (TGSPDCL, TGNPDCL, APEPDCL, APSPDCL): inverts the exact state telescopic tariff schedule.
 * - For INDICATIVE DISCOMs: estimates consumption using the regional tariff profile after deducting indicative fixed charges.
 * - For UNKNOWN DISCOMs: returns 0.
 */
export function estimateConsumptionFromBill(
  profileOrCode: string | DiscomTariffProfile,
  billInr: number,
  context: BillCalculationContext = {},
): {
  status: VerificationStatus;
  estimatedUnits: number;
  warnings: string[];
} {
  const profile =
    typeof profileOrCode === "string" ? getDiscomTariffProfile(profileOrCode) : profileOrCode;
  if (!profile) {
    return {
      status: "UNAVAILABLE",
      estimatedUnits: 0,
      warnings: ["Unknown DISCOM code; cannot infer electricity consumption."],
    };
  }
  if (!Number.isFinite(billInr) || billInr <= 0) {
    return {
      status: profile.status,
      estimatedUnits: 0,
      warnings: [],
    };
  }

  const sanctionedLoadKw = context.sanctionedLoadKw ?? 5;

  // If bill is smaller than unavoidable fixed charges, return minimal positive or 0 units
  const minBillAt1Unit = calculateMonthlyElectricityBill(profile.code, 1, sanctionedLoadKw);
  if (billInr <= minBillAt1Unit) {
    return {
      status: profile.status,
      estimatedUnits: 1,
      warnings: ["Monthly bill is near or below baseline fixed/customer charges."],
    };
  }

  let low = 0;
  let high = 25000;
  let bestUnits = 0;

  for (let i = 0; i < 45; i++) {
    const mid = (low + high) / 2;
    const computedBill = calculateMonthlyElectricityBill(profile.code, mid, sanctionedLoadKw);

    if (Math.abs(computedBill - billInr) < 1) {
      bestUnits = mid;
      break;
    }
    if (computedBill < billInr) {
      bestUnits = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return {
    status: profile.status,
    estimatedUnits: Math.round(bestUnits),
    warnings: profile.status === "INDICATIVE" ? [profile.regulatoryNote] : [],
  };
}

/**
 * Backward-compatible inverse bill-to-units helper.
 */
export function unitsForBill(
  discomCode: string,
  billInr: number,
  sanctionedLoadKw: number = 5,
): number {
  return estimateConsumptionFromBill(discomCode, billInr, { sanctionedLoadKw }).estimatedUnits;
}

export interface BillSlabBreakdown {
  slab: string;
  units: number;
  ratePerUnit: number;
  amount: number;
}

export interface DetailedBillAnalysis {
  status: VerificationStatus;
  authority: string;
  state: string;
  monthlyBillInr: number;
  estimatedUnits: number;
  discomCode: string;
  sanctionedLoadKw: number;
  category: "LT-I(A)" | "LT-I(B)" | "LT-I(C)" | "INDICATIVE-LT" | "UNAVAILABLE";
  slabs: BillSlabBreakdown[];
  energyChargesTotal: number;
  customerCharge: number;
  fixedCharge: number;
  electricityDuty: number;
  unavoidableChargesTotal: number;
  avoidableChargesTotal: number;
  totalComputedBill: number;
  averageRatePerKwh: number;
  regulatoryNote: string;
  warnings: string[];
}

/**
 * Detailed bill decoder (Phase A).
 * - Verified TGERC slab breakdown for TGSPDCL & TGNPDCL.
 * - Verified APERC slab breakdown for APEPDCL & APSPDCL.
 * - Honest indicative breakdown for non-Telangana/AP service corridors (never fakes TGERC slabs).
 */
export function decodeBill(
  discomCode: string,
  billInr: number,
  sanctionedLoadKw: number = 5,
): DetailedBillAnalysis {
  const profile = getDiscomTariffProfile(discomCode);
  if (!profile || !Number.isFinite(billInr) || billInr <= 0) {
    return {
      status: profile ? profile.status : "UNAVAILABLE",
      authority: profile ? profile.authority : "Unsupported Utility",
      state: profile ? profile.state : "Unknown",
      monthlyBillInr: Number.isFinite(billInr) && billInr > 0 ? billInr : 0,
      estimatedUnits: 0,
      discomCode,
      sanctionedLoadKw,
      category: "UNAVAILABLE",
      slabs: [],
      energyChargesTotal: 0,
      customerCharge: 0,
      fixedCharge: 0,
      electricityDuty: 0,
      unavoidableChargesTotal: 0,
      avoidableChargesTotal: 0,
      totalComputedBill: 0,
      averageRatePerKwh: 0,
      regulatoryNote:
        "Detailed tariff calculation for this electricity board requires confirmation during consultation.",
      warnings: ["Detailed tariff calculation for this electricity board requires confirmation."],
    };
  }

  const units = Math.max(1, unitsForBill(profile.code, billInr, sanctionedLoadKw));
  const billRes = calculateElectricityBill(profile, units, { sanctionedLoadKw });

  return {
    status: billRes.status,
    authority: billRes.authority,
    state: profile.state,
    monthlyBillInr: billInr,
    estimatedUnits: units,
    discomCode: profile.code,
    sanctionedLoadKw,
    category: billRes.categoryLabel,
    slabs: billRes.slabs,
    energyChargesTotal: billRes.energyChargeInr,
    customerCharge: billRes.customerChargeInr,
    fixedCharge: billRes.fixedChargeInr,
    electricityDuty: billRes.electricityDutyInr,
    unavoidableChargesTotal: billRes.unavoidableChargesInr,
    avoidableChargesTotal: billRes.avoidableChargesInr,
    totalComputedBill: billRes.totalBillInr,
    averageRatePerKwh: billRes.averageRatePerKwh,
    regulatoryNote: profile.regulatoryNote,
    warnings: billRes.warnings,
  };
}

// ----------------------------------------------------------------------------
// 3. VERIFIED DISCOMS DIRECTORY (TELANGANA & ANDHRA PRADESH)
// ----------------------------------------------------------------------------
export interface DiscomRegulatoryInfo {
  code: string;
  name: string;
  state: string;
  portalUrl: string;
  portalName: string;
  surplusRateInr: number; // APPC net-metering settlement rate
  commercialTariffAvgInr: number;
  source: DataSource;
}

export const VERIFIED_DISCOMS: Record<string, DiscomRegulatoryInfo> = {
  TGSPDCL: {
    code: "TGSPDCL",
    name: "Telangana Southern Power Distribution Company Limited",
    state: "Telangana",
    portalUrl: "https://tgsouthernpower.org",
    portalName: "TGSPDCL Official Consumer Portal",
    surplusRateInr: 3.55,
    commercialTariffAvgInr: 10.5,
    source: TGERC_TARIFF_SOURCE,
  },
  TGNPDCL: {
    code: "TGNPDCL",
    name: "Telangana Northern Power Distribution Company Limited",
    state: "Telangana",
    portalUrl: "https://tgnpdcl.com",
    portalName: "TGNPDCL Official Portal",
    surplusRateInr: 3.55,
    commercialTariffAvgInr: 10.2,
    source: TGERC_TARIFF_SOURCE,
  },
  APEPDCL: {
    code: "APEPDCL",
    name: "Eastern Power Distribution Company of Andhra Pradesh Limited",
    state: "Andhra Pradesh",
    portalUrl: "https://www.apeasternpower.com",
    portalName: "APEPDCL Official Portal",
    surplusRateInr: 3.6,
    commercialTariffAvgInr: 10.4,
    source: APERC_TARIFF_SOURCE,
  },
  APSPDCL: {
    code: "APSPDCL",
    name: "Southern Power Distribution Company of Andhra Pradesh Limited",
    state: "Andhra Pradesh",
    portalUrl: "https://apspdcl.in",
    portalName: "APSPDCL Official Portal",
    surplusRateInr: 3.6,
    commercialTariffAvgInr: 10.4,
    source: APERC_TARIFF_SOURCE,
  },
};

// ----------------------------------------------------------------------------
// 4. SOLAR YIELD & IRRADIANCE (REGIONAL METEOROLOGY — PHASE B)
// ----------------------------------------------------------------------------
export const HYDERABAD_YIELD_SOURCE: DataSource = {
  title:
    "NASA POWER & NREL PVWatts v8 Meteorological Surface Solar Irradiance (Hyderabad 17.3850° N, 78.4867° E)",
  url: "https://power.larc.nasa.gov",
  verifiedOn: "2026-11-05",
  documentRef: "NASA POWER SSE Release 8 / NREL NSRDB PSM v3 (14.08% system loss derate)",
  authority: "NASA Langley Atmospheric Science Data Center / NREL",
  state: "Telangana",
  status: "VERIFIED",
  category: "ENGINEERING_MODEL_ASSUMPTION",
};

/**
 * 12-Month specific solar yield in kWh/kWp for Hyderabad tilted arrays at latitude tilt (18°).
 * Distinguishes satellite irradiance from simulated AC output after 14.08% system loss derating.
 */
export const HYDERABAD_MONTHLY_YIELD_KWH_PER_KW = [
  { month: "Jan", yieldKwh: 125 },
  { month: "Feb", yieldKwh: 130 },
  { month: "Mar", yieldKwh: 148 },
  { month: "Apr", yieldKwh: 152 },
  { month: "May", yieldKwh: 155 },
  { month: "Jun", yieldKwh: 110 },
  { month: "Jul", yieldKwh: 98 }, // Monsoon cloud cover minimum
  { month: "Aug", yieldKwh: 95 }, // Monsoon cloud cover minimum
  { month: "Sep", yieldKwh: 108 },
  { month: "Oct", yieldKwh: 124 },
  { month: "Nov", yieldKwh: 122 },
  { month: "Dec", yieldKwh: 123 },
] as const;

export const HYDERABAD_ANNUAL_YIELD_KWH_PER_KW = HYDERABAD_MONTHLY_YIELD_KWH_PER_KW.reduce(
  (sum, m) => sum + m.yieldKwh,
  0,
); // Exactly 1490 kWh/kWp/year

export interface CitySolarYieldProfile {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  optimalTiltDeg: number;
  systemLossDeratePct: number;
  annualKwhPerKw: number;
  status: VerificationStatus;
  source: DataSource;
  monthlyYield: { month: string; yieldKwh: number }[];
}

export const CITY_SOLAR_METEOROLOGY: Record<string, CitySolarYieldProfile> = {
  hyderabad: {
    city: "Hyderabad",
    state: "Telangana",
    latitude: 17.385,
    longitude: 78.4867,
    optimalTiltDeg: 18,
    systemLossDeratePct: 14.08,
    annualKwhPerKw: 1490,
    status: "VERIFIED",
    source: HYDERABAD_YIELD_SOURCE,
    monthlyYield: [...HYDERABAD_MONTHLY_YIELD_KWH_PER_KW],
  },
  visakhapatnam: {
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    latitude: 17.6868,
    longitude: 83.2185,
    optimalTiltDeg: 18,
    systemLossDeratePct: 14.08,
    annualKwhPerKw: 1460,
    status: "VERIFIED",
    source: {
      title: "NASA POWER Surface Solar Irradiance (Visakhapatnam 17.6868° N, 83.2185° E)",
      url: "https://power.larc.nasa.gov",
      verifiedOn: "2026-11-05",
      documentRef: "NASA POWER SSE Release 8 (14.08% system loss derate)",
      authority: "NASA POWER / NREL PVWatts v8",
      state: "Andhra Pradesh",
      status: "VERIFIED",
      category: "ENGINEERING_MODEL_ASSUMPTION",
    },
    monthlyYield: [
      { month: "Jan", yieldKwh: 128 },
      { month: "Feb", yieldKwh: 132 },
      { month: "Mar", yieldKwh: 144 },
      { month: "Apr", yieldKwh: 146 },
      { month: "May", yieldKwh: 140 },
      { month: "Jun", yieldKwh: 102 },
      { month: "Jul", yieldKwh: 94 },
      { month: "Aug", yieldKwh: 92 },
      { month: "Sep", yieldKwh: 105 },
      { month: "Oct", yieldKwh: 120 },
      { month: "Nov", yieldKwh: 125 },
      { month: "Dec", yieldKwh: 132 },
    ],
  },
  bengaluru: {
    city: "Bengaluru",
    state: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    optimalTiltDeg: 13,
    systemLossDeratePct: 14.08,
    annualKwhPerKw: 1440,
    status: "VERIFIED",
    source: {
      title: "NASA POWER Surface Solar Irradiance (Bengaluru 12.9716° N, 77.5946° E)",
      url: "https://power.larc.nasa.gov",
      verifiedOn: "2026-11-05",
      documentRef: "NASA POWER SSE Release 8 (14.08% system loss derate)",
      authority: "NASA POWER / NREL PVWatts v8",
      state: "Karnataka",
      status: "VERIFIED",
      category: "ENGINEERING_MODEL_ASSUMPTION",
    },
    monthlyYield: [
      { month: "Jan", yieldKwh: 130 },
      { month: "Feb", yieldKwh: 135 },
      { month: "Mar", yieldKwh: 150 },
      { month: "Apr", yieldKwh: 142 },
      { month: "May", yieldKwh: 132 },
      { month: "Jun", yieldKwh: 96 },
      { month: "Jul", yieldKwh: 90 },
      { month: "Aug", yieldKwh: 92 },
      { month: "Sep", yieldKwh: 108 },
      { month: "Oct", yieldKwh: 118 },
      { month: "Nov", yieldKwh: 122 },
      { month: "Dec", yieldKwh: 125 },
    ],
  },
  mumbai: {
    city: "Mumbai",
    state: "Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
    optimalTiltDeg: 19,
    systemLossDeratePct: 14.5,
    annualKwhPerKw: 1450,
    status: "INDICATIVE",
    source: {
      title: "NASA POWER Surface Solar Irradiance (Mumbai 19.0760° N, 72.8777° E)",
      url: "https://power.larc.nasa.gov",
      verifiedOn: "2026-11-05",
      documentRef: "NASA POWER SSE Release 8 (Coastal monsoon cloud adjustment)",
      authority: "NASA POWER",
      state: "Maharashtra",
      status: "INDICATIVE",
      category: "ENGINEERING_MODEL_ASSUMPTION",
    },
    monthlyYield: [
      { month: "Jan", yieldKwh: 132 },
      { month: "Feb", yieldKwh: 136 },
      { month: "Mar", yieldKwh: 152 },
      { month: "Apr", yieldKwh: 154 },
      { month: "May", yieldKwh: 150 },
      { month: "Jun", yieldKwh: 92 },
      { month: "Jul", yieldKwh: 74 },
      { month: "Aug", yieldKwh: 78 },
      { month: "Sep", yieldKwh: 104 },
      { month: "Oct", yieldKwh: 128 },
      { month: "Nov", yieldKwh: 124 },
      { month: "Dec", yieldKwh: 126 },
    ],
  },
  delhi: {
    city: "Delhi-NCR",
    state: "Delhi-NCR",
    latitude: 28.6139,
    longitude: 77.209,
    optimalTiltDeg: 28,
    systemLossDeratePct: 15.0,
    annualKwhPerKw: 1420,
    status: "INDICATIVE",
    source: {
      title: "NASA POWER Surface Solar Irradiance (New Delhi 28.6139° N, 77.2090° E)",
      url: "https://power.larc.nasa.gov",
      verifiedOn: "2026-11-05",
      documentRef: "NASA POWER SSE Release 8 (Winter fog & aerosol derating)",
      authority: "NASA POWER",
      state: "Delhi-NCR",
      status: "INDICATIVE",
      category: "ENGINEERING_MODEL_ASSUMPTION",
    },
    monthlyYield: [
      { month: "Jan", yieldKwh: 96 },
      { month: "Feb", yieldKwh: 112 },
      { month: "Mar", yieldKwh: 142 },
      { month: "Apr", yieldKwh: 150 },
      { month: "May", yieldKwh: 154 },
      { month: "Jun", yieldKwh: 132 },
      { month: "Jul", yieldKwh: 110 },
      { month: "Aug", yieldKwh: 108 },
      { month: "Sep", yieldKwh: 118 },
      { month: "Oct", yieldKwh: 116 },
      { month: "Nov", yieldKwh: 94 },
      { month: "Dec", yieldKwh: 88 },
    ],
  },
  goa: {
    city: "Goa",
    state: "Goa",
    latitude: 15.4909,
    longitude: 73.8278,
    optimalTiltDeg: 15,
    systemLossDeratePct: 14.5,
    annualKwhPerKw: 1430,
    status: "INDICATIVE",
    source: {
      title: "NASA POWER Surface Solar Irradiance (Panaji, Goa 15.4909° N, 73.8278° E)",
      url: "https://power.larc.nasa.gov",
      verifiedOn: "2026-11-05",
      documentRef: "NASA POWER SSE Release 8",
      authority: "NASA POWER",
      state: "Goa",
      status: "INDICATIVE",
      category: "ENGINEERING_MODEL_ASSUMPTION",
    },
    monthlyYield: [
      { month: "Jan", yieldKwh: 134 },
      { month: "Feb", yieldKwh: 138 },
      { month: "Mar", yieldKwh: 150 },
      { month: "Apr", yieldKwh: 148 },
      { month: "May", yieldKwh: 140 },
      { month: "Jun", yieldKwh: 86 },
      { month: "Jul", yieldKwh: 76 },
      { month: "Aug", yieldKwh: 82 },
      { month: "Sep", yieldKwh: 104 },
      { month: "Oct", yieldKwh: 122 },
      { month: "Nov", yieldKwh: 124 },
      { month: "Dec", yieldKwh: 126 },
    ],
  },
  chennai: {
    city: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    optimalTiltDeg: 13,
    systemLossDeratePct: 14.08,
    annualKwhPerKw: 1470,
    status: "INDICATIVE",
    source: {
      title: "NASA POWER Surface Solar Irradiance (Chennai 13.0827° N, 80.2707° E)",
      url: "https://power.larc.nasa.gov",
      verifiedOn: "2026-11-05",
      documentRef: "NASA POWER SSE Release 8 (NE monsoon Oct-Dec profile)",
      authority: "NASA POWER",
      state: "Tamil Nadu",
      status: "INDICATIVE",
      category: "ENGINEERING_MODEL_ASSUMPTION",
    },
    monthlyYield: [
      { month: "Jan", yieldKwh: 126 },
      { month: "Feb", yieldKwh: 136 },
      { month: "Mar", yieldKwh: 154 },
      { month: "Apr", yieldKwh: 150 },
      { month: "May", yieldKwh: 146 },
      { month: "Jun", yieldKwh: 122 },
      { month: "Jul", yieldKwh: 114 },
      { month: "Aug", yieldKwh: 116 },
      { month: "Sep", yieldKwh: 118 },
      { month: "Oct", yieldKwh: 100 },
      { month: "Nov", yieldKwh: 90 },
      { month: "Dec", yieldKwh: 98 },
    ],
  },
};

export function getSolarYieldProfileForDiscom(discomCode?: string): CitySolarYieldProfile {
  const profile = getDiscomTariffProfile(discomCode);
  if (profile && CITY_SOLAR_METEOROLOGY[profile.cityKey]) {
    return CITY_SOLAR_METEOROLOGY[profile.cityKey];
  }
  return CITY_SOLAR_METEOROLOGY.hyderabad;
}

// ----------------------------------------------------------------------------
// 5. WIND LOAD SPECIFICATION (IS 875 PART 3: 2015)
// ----------------------------------------------------------------------------
export const IS_875_WIND_SOURCE: DataSource = {
  title: "Bureau of Indian Standards (BIS) IS 875 (Part 3): 2015 — Design Loads: Wind Loads",
  url: "https://standardsbis.bsbedge.com",
  verifiedOn: "2026-11-05",
  documentRef: "IS 875 (Part 3): 2015 Clause 6.2 Basic Wind Speed Map",
  authority: "Bureau of Indian Standards (BIS)",
  status: "VERIFIED",
  category: "OFFICIAL_REGULATORY_FACT",
};

export const WIND_SPEED_STANDARDS = {
  hyderabad: {
    city: "Hyderabad",
    basicWindSpeedMs: 44, // 44 m/s
    basicWindSpeedKmh: 158.4,
    designStandard: "IS 875 (Part 3): 2015 basic wind speed (44 m/s)",
  },
  visakhapatnam: {
    city: "Visakhapatnam",
    basicWindSpeedMs: 50, // 50 m/s
    basicWindSpeedKmh: 180.0,
    designStandard: "IS 875 (Part 3): 2015 basic wind speed (50 m/s)",
  },
  vijayawada: {
    city: "Vijayawada",
    basicWindSpeedMs: 50,
    basicWindSpeedKmh: 180.0,
    designStandard: "IS 875 (Part 3): 2015 basic wind speed (50 m/s)",
  },
  source: IS_875_WIND_SOURCE,
};

// ----------------------------------------------------------------------------
// 6. COMMERCIAL TAX DEPRECIATION (INCOME-TAX ACT, 2025 — SECTION 33)
// ----------------------------------------------------------------------------
export const INCOME_TAX_SECTION_33_SOURCE: DataSource = {
  title:
    "Income-tax Act, 2025 (in force 1 April 2026) — Section 33 Depreciation & Income-tax Rules, 2026",
  url: "https://incometaxindia.gov.in",
  verifiedOn: "2026-11-05",
  documentRef:
    "Income-tax Act, 2025 Section 33 (succeeding Section 32 of 1961 Act) & Appendix I Renewable Energy Devices Block",
  authority: "Central Board of Direct Taxes (CBDT), Ministry of Finance",
  consumerCategory: "Commercial & Industrial Assessees",
  financialYear: "FY 2026-27 (Tax Year 2026-27)",
  effectiveFrom: "2026-04-01",
  status: "VERIFIED",
  category: "OFFICIAL_REGULATORY_FACT",
  restrictions:
    "Requires asset ownership and active business use. Put-to-use < 180 days restricts Year 1 allowance to 50% of block rate (20% WDV). Actual tax savings require sufficient taxable business income.",
};

/**
 * Deprecated alias retained solely for backward compatibility with legacy imports.
 * Prefer INCOME_TAX_SECTION_33_SOURCE.
 */
export const INCOME_TAX_SECTION_34_SOURCE: DataSource = INCOME_TAX_SECTION_33_SOURCE;

export const TAX_DEPRECIATION_CONFIG = {
  sectionName: "Section 33",
  actName: "Income-tax Act, 2025",
  rulesName:
    "Income-tax Rules, 2026 (Appendix I — Renewable Energy Devices: Solar Power Generating Systems)",
  solarAssetRatePct: 40, // 40% Written Down Value (WDV) for >= 180 days usage
  halfYearRatePct: 20, // 50% of 40% = 20% WDV when put to use < 180 days in financial year
  minDaysForFullRate: 180,
  applicableEntity: "Commercial and Industrial business tax filers with taxable profit",
  disclaimer:
    "Depreciation under Section 33 is a deduction from taxable business income, not a direct cash rebate. Actual tax savings depend on corporate entity status, applicable 2026 block schedules, taxable profit capacity, and tax regime. Consult your Chartered Accountant.",
  source: INCOME_TAX_SECTION_33_SOURCE,
};

// ----------------------------------------------------------------------------
// 7. FINANCING & SBI PM SURYA GHAR SOLAR LOAN (PHASE E)
// ----------------------------------------------------------------------------
export const SBI_SOLAR_LOAN_SOURCE: DataSource = {
  title: "State Bank of India (SBI) Surya Ghar — Loan for Solar Rooftop Scheme",
  url: "https://sbi.bank.in",
  verifiedOn: "2026-11-05",
  documentRef: "SBI PM Surya Ghar Retail Solar Loan Schedule (EBLR-linked floating tiers)",
  authority: "State Bank of India (SBI) / JanSamarth National Portal",
  consumerCategory: "Individual Residential Rooftop Solar Applicants",
  financialYear: "FY 2026-27",
  status: "VERIFIED",
  category: "COMMERCIAL_PRICING_ASSUMPTION",
  restrictions:
    "Floating interest rates linked to SBI EBLR/Repo rate as of Nov 2026; subject to credit underwriting, CIBIL >= 650 for Tier 2, and 10% minimum borrower margin. Concessional scheme cap is ₹6,00,000.",
};

export const SOLAR_LOAN_TERMS = {
  provider: "National Portal Empanelled Lenders (e.g. State Bank of India)",
  asOfDate: "2026-11-05",
  rateType: "Floating (linked to External Benchmark Lending Rate / EBLR)",
  maxFinancingPct: 0.9, // Up to 90% of project cost (10% minimum customer margin)
  minCustomerMarginPct: 0.1,
  tier1: {
    maxAmountInr: 200000,
    annualInterestRate: 0.0575, // 5.75% p.a. floating up to ₹2,00,000 (up to 3 kW)
    collateralFree: true,
  },
  tier2: {
    minAmountInr: 200000,
    maxAmountInr: 600000,
    annualInterestRate: 0.079, // 7.90% p.a. floating for >₹2,00,000 up to ₹6,00,000 (3 kW to 10 kW)
  },
  aboveCapIndicativeRate: 0.0915, // 9.15% p.a. indicative non-concessional retail solar/home-improvement rate above ₹6,00,000
  maxTenureMonths: 120, // Up to 10 years
  defaultTenureMonths: 60, // 5 years default model
  portalLenderDirectoryUrl: "https://pmsuryaghar.gov.in",
  source: SBI_SOLAR_LOAN_SOURCE,
};

// ----------------------------------------------------------------------------
// 8. ROOFTOP CONNECTION & STATUTORY TIME LIMITS (MINISTRY OF POWER)
// ----------------------------------------------------------------------------
export const MOP_ROOFTOP_RULES_SOURCE: DataSource = {
  title: "Ministry of Power Electricity (Rights of Consumers) Amendment Rules, 2024",
  url: "https://powermin.gov.in",
  verifiedOn: "2026-11-05",
  documentRef: "Gazette Notification G.S.R. 138(E) dated 23 Feb 2024",
  authority: "Ministry of Power, Government of India",
  status: "VERIFIED",
  category: "OFFICIAL_REGULATORY_FACT",
};

export const STATUTORY_CONNECTION_RULES = {
  feasibilityExemptionKw: 10, // Technical feasibility study waived up to 10 kW
  deemedLoadEnhancementKw: 10, // Sanctioned load deemed enhanced up to 10 kW
  statutoryCommissioningDays: 15, // Complete inspection, meter replacement & sync within 15 days
  source: MOP_ROOFTOP_RULES_SOURCE,
};

// ----------------------------------------------------------------------------
// 9. MODULE PERFORMANCE & LINEAR WARRANTY MATHEMATICS
// ----------------------------------------------------------------------------
export const MODULE_WARRANTY_SOURCE: DataSource = {
  title: "Tier-1 N-Type TOPCon Dual-Glass Bifacial PV Module Engineering Datasheet",
  url: "https://wavenox.in/technology",
  verifiedOn: "2026-11-05",
  documentRef: "IEC 61215 / IEC 61730 / BIS IS 14286 ALMM Compliant Specification",
  authority: "IEC / BIS Standards & Tier-1 OEM Specification",
  status: "VERIFIED",
  category: "ENGINEERING_MODEL_ASSUMPTION",
};

export const MODULE_WARRANTY_TERMS = {
  ratedWatt: 580,
  year1MaxDegradationPct: 1.0, // Retains >= 99.0% at year 1
  annualDegradationPct: 0.4, // Max 0.40% linear degradation per year thereafter
  year25MinOutputPct: 89.4, // 100 - 1.0 - (24 * 0.40) = 89.4%
  source: MODULE_WARRANTY_SOURCE,
};

/**
 * Returns expected minimum guaranteed power retention percentage for a given year.
 */
export function calculateModuleDegradation(year: number): number {
  if (year <= 0) return 100;
  if (year === 1) return 100 - MODULE_WARRANTY_TERMS.year1MaxDegradationPct; // 99.0%
  const deg =
    MODULE_WARRANTY_TERMS.year1MaxDegradationPct +
    (year - 1) * MODULE_WARRANTY_TERMS.annualDegradationPct;
  return Number((100 - Math.min(25, deg)).toFixed(2));
}
