/**
 * ============================================================================
 * STATUTORY & REGULATORY DATA ENGINE — SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 * All numbers, tariffs, subsidies, wind ratings, tax provisions, and physics
 * constants must be sourced from official government orders or manufacturer
 * datasheets with a verifiable title, URL, and verification date.
 */

export interface DataSource {
  title: string;
  url: string;
  verifiedOn: string; // ISO-8601 YYYY-MM
  section?: string;
  documentRef?: string;
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
  verifiedOn: "2026-08-15",
  documentRef: "MNRE File No. 318/331/2023-GCRT",
};

export const CFA_SUBSIDY_CONFIG = {
  generalCategory: {
    first2KwRatePerKw: 30000,
    thirdKwRate: 18000,
    maxCapInr: 78000,
  },
  specialCategory: {
    // Special category states/UTs: Uttarakhand, Himachal Pradesh, J&K, Ladakh,
    // North-East including Sikkim, Andaman & Nicobar, Lakshadweep
    first2KwRatePerKw: 33000,
    thirdKwRate: 19800,
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
    maxKw: 500, // Common facilities up to 500 kW (3 kW per resident)
  },
  commercial: {
    ratePerKw: 0,
  },
  disbursementMethod:
    "Direct Benefit Transfer (DBT) to beneficiary bank account post-commissioning",
  disbursementTimeframeEstimate:
    "Within 15 days of DISCOM commissioning and meter inspection approval (plan for 1–3 months overall)",
  dcrMandate:
    "Requires Domestic Content Requirement (DCR) compliant solar modules with Indian cells",
  source: PM_SURYA_GHAR_SOURCE,
};

export interface SubsidyOptions {
  segment?: "residential" | "commercial" | "rwa";
  specialCategory?: boolean;
}

/**
 * Calculates PM Surya Ghar CFA subsidy according to official August 2026 guidelines.
 */
export function calculateGovtSubsidyInr(kw: number, options: SubsidyOptions = {}): number {
  const segment = options.segment ?? "residential";
  if (segment === "commercial") return 0;
  if (!Number.isFinite(kw) || kw <= 0) return 0;

  if (segment === "rwa") {
    const cappedKw = Math.min(kw, CFA_SUBSIDY_CONFIG.groupHousingRwa.maxKw);
    return Math.round(cappedKw * CFA_SUBSIDY_CONFIG.groupHousingRwa.ratePerKw);
  }

  const isSpecial = Boolean(options.specialCategory);
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

// ----------------------------------------------------------------------------
// 2. TELANGANA ELECTRICITY TARIFFS (TGERC RETAIL SUPPLY TARIFF ORDER FY 2025-26)
// ----------------------------------------------------------------------------
export const TGERC_TARIFF_SOURCE: DataSource = {
  title: "TGERC Retail Supply Tariff Order FY 2025-26 & Schedule of Retail Tariffs",
  url: "https://tgsouthernpower.org/resources/PDF/Tariffs/63tarifffile.pdf",
  verifiedOn: "2026-08-15",
  documentRef: "TGERC O.P. Nos. 102 & 103 of 2024",
};

/**
 * Telangana LT-I Domestic Telescopic Slabs (FY 2025-26):
 * LT-I(A) ≤ 100 units/mo:
 *   0–50 units:   ₹1.95/kWh
 *   51–100 units: ₹3.10/kWh
 *
 * LT-I(B) 101–200 units/mo:
 *   0–100 units:   ₹3.40/kWh
 *   101–200 units: ₹4.80/kWh
 *
 * LT-I(C) > 200 units/mo:
 *   0–200 units:   ₹5.10/kWh
 *   201–300 units: ₹7.70/kWh
 *   301–400 units: ₹9.00/kWh
 *   401–800 units: ₹9.50/kWh
 *   > 800 units:   ₹10.00/kWh
 */
export function energyCharge(discomCode: string, units: number): number {
  if (!Number.isFinite(units) || units <= 0) return 0;
  const u = Math.round(units);

  // LT-I(A): Monthly consumption <= 100
  if (u <= 100) {
    if (u <= 50) return u * 1.95;
    return 50 * 1.95 + (u - 50) * 3.1;
  }

  // LT-I(B): Monthly consumption 101 to 200
  if (u <= 200) {
    return 100 * 3.4 + (u - 100) * 4.8;
  }

  // LT-I(C): Monthly consumption > 200
  let cost = 200 * 5.1; // 1020
  if (u <= 300) {
    cost += (u - 200) * 7.7;
    return cost;
  }
  cost += 100 * 7.7; // 770 -> total 1790 at 300 units

  if (u <= 400) {
    cost += (u - 300) * 9.0;
    return cost;
  }
  cost += 100 * 9.0; // 900 -> total 2690 at 400 units

  if (u <= 800) {
    cost += (u - 400) * 9.5;
    return cost;
  }
  cost += 400 * 9.5; // 3800 -> total 6490 at 800 units

  cost += (u - 800) * 10.0;
  return cost;
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
  const u = Math.round(units);
  const ec = energyCharge(discomCode, u);

  // Customer Charges per month (TGERC Schedule)
  let customerCharge = 70;
  if (u <= 100) customerCharge = 25;
  else if (u <= 200) customerCharge = 50;
  else if (u <= 300) customerCharge = 60;
  else if (u <= 400) customerCharge = 70;
  else customerCharge = 80;

  // Fixed Charges: LT-I(C) has fixed charge of ₹10 per kW of contracted load per month
  const fixedCharge = u > 200 ? Math.max(1, sanctionedLoadKw) * 10 : 0;

  // Electricity Duty (Telangana): ₹0.06 per kWh
  const duty = u * 0.06;

  return Math.round(ec + customerCharge + fixedCharge + duty);
}

/**
 * Inverse bill-to-units conversion via binary search.
 * Computes the units consumed per month given a monthly bill in INR.
 */
export function unitsForBill(
  discomCode: string,
  billInr: number,
  sanctionedLoadKw: number = 5,
): number {
  if (!Number.isFinite(billInr) || billInr <= 0) return 0;

  let low = 0;
  let high = 15000;
  let bestUnits = 0;

  for (let i = 0; i < 40; i++) {
    const mid = (low + high) / 2;
    const computedBill = calculateMonthlyElectricityBill(discomCode, mid, sanctionedLoadKw);

    if (Math.abs(computedBill - billInr) < 1) {
      return Math.round(mid);
    }
    if (computedBill < billInr) {
      bestUnits = mid;
      low = mid;
    } else {
      high = mid;
    }
  }

  return Math.round(bestUnits);
}

export interface BillSlabBreakdown {
  slab: string;
  units: number;
  ratePerUnit: number;
  amount: number;
}

export interface DetailedBillAnalysis {
  monthlyBillInr: number;
  estimatedUnits: number;
  discomCode: string;
  sanctionedLoadKw: number;
  category: "LT-I(A)" | "LT-I(B)" | "LT-I(C)";
  slabs: BillSlabBreakdown[];
  energyChargesTotal: number;
  customerCharge: number;
  fixedCharge: number;
  electricityDuty: number;
  totalComputedBill: number;
  averageRatePerKwh: number;
}

/**
 * Detailed bill decoder providing an exact slab-by-slab breakdown
 * for Telangana domestic electricity bills under TGERC FY 2025-26 tariff order.
 */
export function decodeBill(
  discomCode: string,
  billInr: number,
  sanctionedLoadKw: number = 5,
): DetailedBillAnalysis {
  const units = unitsForBill(discomCode, billInr, sanctionedLoadKw);
  const u = Math.max(1, units);

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

  const energyChargesTotal = Math.round(slabs.reduce((acc, s) => acc + s.amount, 0));

  let customerCharge = 70;
  if (u <= 100) customerCharge = 25;
  else if (u <= 200) customerCharge = 50;
  else if (u <= 300) customerCharge = 60;
  else if (u <= 400) customerCharge = 70;
  else customerCharge = 80;

  const fixedCharge = u > 200 ? Math.max(1, sanctionedLoadKw) * 10 : 0;
  const electricityDuty = Math.round(u * 0.06 * 100) / 100;
  const totalComputedBill = Math.round(
    energyChargesTotal + customerCharge + fixedCharge + electricityDuty,
  );
  const averageRatePerKwh = Number((totalComputedBill / u).toFixed(2));

  return {
    monthlyBillInr: billInr,
    estimatedUnits: u,
    discomCode,
    sanctionedLoadKw,
    category,
    slabs,
    energyChargesTotal,
    customerCharge,
    fixedCharge,
    electricityDuty,
    totalComputedBill,
    averageRatePerKwh,
  };
}

// ----------------------------------------------------------------------------
// 3. TELANGANA DISCOMS DIRECTORY
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
    surplusRateInr: 3.55, // TGERC APPC average pooled purchase cost
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
};

// ----------------------------------------------------------------------------
// 4. SOLAR YIELD & IRRADIANCE (HYDERABAD METEOROLOGY)
// ----------------------------------------------------------------------------
export const HYDERABAD_YIELD_SOURCE: DataSource = {
  title:
    "NASA POWER & NREL PVWatts v8 Meteorological Surface Solar Irradiance (Hyderabad 17.3850° N, 78.4867° E)",
  url: "https://power.larc.nasa.gov",
  verifiedOn: "2026-08-15",
  documentRef: "NASA POWER SSE Release 8 / NREL NSRDB PSM v3",
};

/**
 * 12-Month specific solar yield in kWh/kWp for Hyderabad tilted arrays at latitude tilt (18°).
 * Note the realistic monsoon dip in June–August.
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
  annualKwhPerKw: number;
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
    annualKwhPerKw: 1490,
    source: HYDERABAD_YIELD_SOURCE,
    monthlyYield: [...HYDERABAD_MONTHLY_YIELD_KWH_PER_KW],
  },
  visakhapatnam: {
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    latitude: 17.6868,
    longitude: 83.2185,
    optimalTiltDeg: 18,
    annualKwhPerKw: 1460,
    source: {
      title: "NASA POWER Surface Solar Irradiance (Visakhapatnam 17.6868° N, 83.2185° E)",
      url: "https://power.larc.nasa.gov",
      verifiedOn: "2026-08-15",
      documentRef: "NASA POWER SSE Release 8",
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
    annualKwhPerKw: 1440,
    source: {
      title: "NASA POWER Surface Solar Irradiance (Bengaluru 12.9716° N, 77.5946° E)",
      url: "https://power.larc.nasa.gov",
      verifiedOn: "2026-08-15",
      documentRef: "NASA POWER SSE Release 8",
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
};

// ----------------------------------------------------------------------------
// 5. WIND LOAD SPECIFICATION (IS 875 PART 3: 2015)
// ----------------------------------------------------------------------------
export const IS_875_WIND_SOURCE: DataSource = {
  title: "Bureau of Indian Standards (BIS) IS 875 (Part 3): 2015 — Design Loads: Wind Loads",
  url: "https://standardsbis.bsbedge.com",
  verifiedOn: "2026-08-15",
  documentRef: "IS 875 (Part 3): 2015 Clause 6.2 Basic Wind Speed Map",
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
// 6. COMMERCIAL TAX DEPRECIATION (INCOME-TAX ACT, 2025 — SECTION 34)
// ----------------------------------------------------------------------------
export const INCOME_TAX_SECTION_34_SOURCE: DataSource = {
  title: "Income-tax Act, 2025 (in force 1 April 2026) — Section 34 Depreciation Allowances",
  url: "https://incometaxindia.gov.in",
  verifiedOn: "2026-08-15",
  documentRef: "Income-tax Act, 2025 Section 34 (formerly Section 32 of 1961 Act)",
};

export const TAX_DEPRECIATION_CONFIG = {
  sectionName: "Section 34",
  actName: "Income-tax Act, 2025",
  solarAssetRatePct: 40,
  halfYearRatePct: 20, // Put to use < 180 days in financial year
  applicableEntity: "Commercial and Industrial corporate tax filers",
  disclaimer:
    "Tax benefits depend on corporate entity status and tax slab. Consult your Chartered Accountant.",
  source: INCOME_TAX_SECTION_34_SOURCE,
};

// ----------------------------------------------------------------------------
// 7. FINANCING & SBI PM SURYA GHAR SOLAR LOAN
// ----------------------------------------------------------------------------
export const SBI_SOLAR_LOAN_SOURCE: DataSource = {
  title: "State Bank of India (SBI) PM Surya Ghar Solar Loan Scheme",
  url: "https://sbi.co.in",
  verifiedOn: "2026-08-15",
  documentRef: "SBI PM Surya Ghar Retail Scheme circular 2025-26",
};

export const SOLAR_LOAN_TERMS = {
  provider: "National Portal Empanelled Lenders (e.g. State Bank of India)",
  maxFinancingPct: 0.9, // Up to 90% of gross project cost
  tier1: {
    maxAmountInr: 200000,
    annualInterestRate: 0.0575, // 5.75% p.a.
    collateralFree: true,
  },
  tier2: {
    minAmountInr: 200000,
    maxAmountInr: 600000,
    annualInterestRate: 0.079, // 7.90% p.a.
  },
  maxTenureMonths: 120, // Up to 10 years
  defaultTenureMonths: 60, // 5 years
  portalLenderDirectoryUrl: "https://pmsuryaghar.gov.in",
  source: SBI_SOLAR_LOAN_SOURCE,
};

// ----------------------------------------------------------------------------
// 8. ROOFTOP CONNECTION & STATUTORY TIME LIMITS (MINISTRY OF POWER)
// ----------------------------------------------------------------------------
export const MOP_ROOFTOP_RULES_SOURCE: DataSource = {
  title: "Ministry of Power Electricity (Rights of Consumers) Amendment Rules, 2024",
  url: "https://pmsuryaghar.gov.in",
  verifiedOn: "2026-08-15",
  documentRef: "Gazette Notification G.S.R. 138(E) dated 23 Feb 2024",
};

export const STATUTORY_CONNECTION_RULES = {
  feasibilityExemptionKw: 10, // Technical feasibility study waived up to 10 kW
  deemedLoadEnhancementKw: 10, // Sanctioned load deemed enhanced up to 10 kW without delay
  statutoryCommissioningDays: 15, // Complete inspection, meter replacement & sync within 15 days
  source: MOP_ROOFTOP_RULES_SOURCE,
};

// ----------------------------------------------------------------------------
// 9. MODULE PERFORMANCE & LINEAR WARRANTY MATHEMATICS
// ----------------------------------------------------------------------------
export const MODULE_WARRANTY_SOURCE: DataSource = {
  title: "Tier-1 N-Type TOPCon Dual-Glass Bifacial PV Module Engineering Datasheet",
  url: "https://wavenox.in/technology",
  verifiedOn: "2026-08-15",
  documentRef: "IEC 61215 / IEC 61730 ALMM Compliant Specification",
};

export const MODULE_WARRANTY_TERMS = {
  ratedWatt: 550,
  year1MaxDegradationPct: 1.0, // Retains >= 99.0% at year 1
  annualDegradationPct: 0.4, // Max 0.40% linear degradation per year
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
