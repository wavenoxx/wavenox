/**
 * Sourced Regulatory, Meteorological, and Engineering Assumptions Catalog
 *
 * Every number displayed across WAVENOX is derived from or traceable to an entry
 * in this catalog with its issuing authority, publication date, and verification date.
 */

export interface SourcedDatum {
  id: string;
  metric: string;
  value: string;
  formulaOrBasis?: string;
  authority: string;
  sourceDoc: string;
  sourceUrl: string;
  verifiedDate: string; // e.g. "Nov 2026"
  notes?: string;
}

export const SOURCES_CATALOG: Record<string, SourcedDatum> = {
  pmSuryaGharSubsidy: {
    id: "pmSuryaGharSubsidy",
    metric: "Central Financial Assistance (CFA)",
    value: "Up to ₹78,000 (General) / ₹85,800 (Special Category)",
    formulaOrBasis:
      "₹30,000 for 1st kW + ₹30,000 for 2nd kW + ₹18,000 for 3rd kW (capped at ₹78,000 for ≥ 3 kW; ₹33,000/kW up to 2 kW + ₹19,800 for 3rd kW in Special Category States)",
    authority: "Ministry of New and Renewable Energy (MNRE), Govt. of India",
    sourceDoc: "PM Surya Ghar: Muft Bijli Yojana Operational Guidelines (No. 318/61/2024-GCRT)",
    sourceUrl: "https://pmsuryaghar.gov.in",
    verifiedDate: "Nov 2026",
    notes:
      "Direct Benefit Transfer credited post-commissioning after DISCOM net-meter activation. When financed via an SBI PM Surya Ghar loan linked on the National Portal, the subsidy is credited directly into the borrower's SBI loan account to prepay loan principal with zero prepayment penalty. Standalone battery storage and commercial installations are ineligible.",
  },
  tgercTariffs: {
    id: "tgercTariffs",
    metric: "Telangana Residential Tariffs & Rooftop Net-Metering (LT-I A/B/C)",
    value: "₹1.95 to ₹10.00 / kWh (Retail) · ₹2.65 / kWh (Indicative Surplus)",
    formulaOrBasis:
      "LT-I(A) ≤100 u: 0–50 @ ₹1.95, 51–100 @ ₹3.10; LT-I(B) 101–200 u: 0–100 @ ₹3.40, 101–200 @ ₹4.80; LT-I(C) >200 u: 0–200 @ ₹5.10, 201–300 @ ₹7.70, 301–400 @ ₹9.00, 401–800 @ ₹9.50, >800 @ ₹10.00 + Customer/Fixed Charges & ₹0.06/kWh duty",
    authority: "Telangana Electricity Regulatory Commission (TGERC)",
    sourceDoc:
      "Retail Supply Tariff Orders (FY 2025-26 & FY 2026-27) & TGERC Regulation No. 1 of 2025 (15 Nov 2025)",
    sourceUrl: "https://www.tgerc.telangana.gov.in",
    verifiedDate: "Nov 2026",
    notes:
      "Under TGERC Regulation No. 1 of 2025 (Clauses 8.1.1–8.1.5), import/export netting occurs per monthly billing period. Excess exported units in a billing period are valued at the lowest Section 63 competitive solar tariff discovered by Telangana DISCOMs in the preceding FY (₹2.65/kWh indicative benchmark). Permissible capacity: 100% of sanctioned load (Residential/Govt) and 80% of sanctioned load (C&I).",
  },
  apercTariffs: {
    id: "apercTariffs",
    metric: "Andhra Pradesh Residential Tariffs & Rooftop Net-Metering (LT-I A)",
    value: "₹1.90 to ₹9.75 / kWh (Retail) · ₹2.09 / kWh (Indicative Surplus)",
    formulaOrBasis:
      "Telescopic slabs across all domestic connections: 0–30 @ ₹1.90; 31–75 @ ₹3.00; 76–125 @ ₹4.50; 126–225 @ ₹6.00; 226–400 @ ₹8.75; >400 @ ₹9.75 + Customer/Fixed Charges & ₹0.06/kWh duty",
    authority: "Andhra Pradesh Electricity Regulatory Commission (APERC)",
    sourceDoc:
      "Retail Supply Tariff Orders (FY 2025-26 & FY 2026-27) & APERC Regulation No. 4 of 2023",
    sourceUrl: "https://aperc.gov.in",
    verifiedDate: "Nov 2026",
    notes:
      "Unified 6-tier telescopic domestic tariff schedule across APEPDCL & APSPDCL. Under APERC Regulation No. 4 of 2023 (Clauses 16.1 & 16.5), energy settlement is performed per monthly billing period (₹2.09/kWh indicative surplus export benchmark), with permissible capacity up to 100% of sanctioned load / contracted demand (80% DT hosting cap).",
  },
  hyderabadSolarYield: {
    id: "hyderabadSolarYield",
    metric: "Hyderabad Annual Solar Generation Yield",
    value: "1,490 kWh / kWp / year (~4.08 kWh/kWp/day)",
    formulaOrBasis:
      "Derived from multi-year monthly Global Horizontal Irradiance (GHI) and Direct Normal Irradiance (DNI) at 17.3850° N, 78.4867° E",
    authority: "NASA POWER Project / NREL PVWatts v8",
    sourceDoc: "NASA Langley Atmospheric Science Data Center Solar Meteorology Dataset",
    sourceUrl: "https://power.larc.nasa.gov",
    verifiedDate: "Nov 2026",
    notes: "Assumes South-facing fixed tilt at 14° latitude with standard system losses (14.08%).",
  },
  windRating: {
    id: "windRating",
    metric: "Structural Basic Wind Speed Resilience",
    value: "44 m/s (158.4 km/h)",
    formulaOrBasis:
      "Zone II Basic Wind Speed (Vb = 44 m/s) with terrain category 2, risk coefficient k1=1.0, topography factor k3=1.0",
    authority: "Bureau of Indian Standards (BIS)",
    sourceDoc: "IS 875 (Part 3): 2015 Design Loads for Buildings and Structures - Wind Loads",
    sourceUrl: "https://standardsbis.bsbedge.com",
    verifiedDate: "Nov 2026",
    notes:
      "Structure engineered with 6005-T5 architectural aluminium and 4.0mm HDG steel footings for elevated pergola clearance.",
  },
  sbiSolarLoan: {
    id: "sbiSolarLoan",
    metric: "PM Surya Ghar Concessional Solar Loan",
    value:
      "6.00% p.a. (≤ ₹2L, ≤ 3 kW) / 8.15% p.a. (₹2L–₹6L, > 3–10 kW) floating (eff. 15 Oct 2026)",
    formulaOrBasis:
      "90% financing of eligible rooftop solar turnkey cost (10% borrower margin) over 60 months. Post-commissioning MNRE central subsidy is credited directly into the borrower's linked SBI loan account (modeled in Month 3) to prepay loan principal with zero prepayment penalty, reducing remaining monthly EMI or shortening tenure.",
    authority: "State Bank of India (SBI)",
    sourceDoc:
      "SBI Green Loans — PM Surya Ghar Loan for Solar Roof Top (Effective 15 Oct 2026; older personal-banking page lists 5.75% / 7.90% as of 15 Dec 2025)",
    sourceUrl:
      "https://sbi.bank.in/web/sbi-green/green-loans/personal/pm-surya-ghar-loan-for-solar-roof-top",
    verifiedDate: "Nov 2026",
    notes:
      "Rates are floating (linked to SBI EBLR) and conditional on borrower CIBIL appraisal and bank sanction. Concessional PM Surya Ghar loan ceiling is ₹6,00,000 for systems up to 10 kW; standalone battery storage capex is excluded from scheme financing.",
  },
  section33TaxDepreciation: {
    id: "section33TaxDepreciation",
    metric: "Commercial Solar Accelerated Tax Depreciation",
    value: "40% Written Down Value (WDV) in Year 1",
    formulaOrBasis:
      "40% WDV deduction when commissioned and put to use ≥ 180 days in the financial year (20% if < 180 days); tax shield = Depreciation Deduction × Effective Corporate Tax Rate",
    authority: "Central Board of Direct Taxes (CBDT), Ministry of Finance",
    sourceDoc: "Income-tax Act, 2025 (Section 33) & Notified Income-tax Rules, 2026",
    sourceUrl: "https://www.incometaxindia.gov.in",
    verifiedDate: "Nov 2026",
    notes:
      "Depreciation reduces taxable business income and is not a direct cash grant; actual realization depends on profitable tax capacity and tax regime election.",
  },
  moduleDegradation: {
    id: "moduleDegradation",
    metric: "N-Type TOPCon 25-Year Performance Warranty",
    value: "1.0% Year 1 degradation, 0.40%/year thereafter (≥89.4% at Year 25)",
    formulaOrBasis:
      "Linear degradation curve per standard manufacturer tier-1 DCR monocrystalline TOPCon cell architecture",
    authority: "IEC 61215 / IEC 61730 International Standards",
    sourceDoc: "Standard ALMM DCR N-Type TOPCon Cell Reliability Datasheet",
    sourceUrl: "https://mnre.gov.in",
    verifiedDate: "Nov 2026",
    notes:
      "Zero light-induced degradation (LID) compared to conventional Boron-doped p-type PERC cells.",
  },
  temperatureCoefficient: {
    id: "temperatureCoefficient",
    metric: "TOPCon Temperature Coefficient of Pmax",
    value: "−0.30% / °C",
    formulaOrBasis:
      "Power derating above 25°C standard test condition (STC). At 70°C cell temp: −13.5% derating vs −18.0% on −0.40%/°C PERC (+5.49% real gain)",
    authority: "PV Module Engineering Physics (IEC 61215-2)",
    sourceDoc: "N-Type Passivated Contact Solar Cell Temperature Derating Characteristics",
    sourceUrl: "https://mnre.gov.in",
    verifiedDate: "Nov 2026",
    notes:
      "Superior hot-climate performance essential for Hyderabad summer ambient highs exceeding 42°C.",
  },
  beeApplianceRatings: {
    id: "beeApplianceRatings",
    metric: "Home Appliance Realistic Power Consumption",
    value: "BEE Star-Rated Standard Averages",
    formulaOrBasis:
      "1.5T 5-Star Inverter AC = 850W; BLDC Ceiling Fan = 28W; 5-Star Fridge = 80W; LED Lighting = 40W; Wi-Fi = 15W",
    authority: "Bureau of Energy Efficiency (BEE), Ministry of Power",
    sourceDoc: "BEE Standards and Labelling Program 2024 Schedule",
    sourceUrl: "https://beeindia.gov.in",
    verifiedDate: "Nov 2026",
    notes:
      "Used in Battery Honesty Advisor to provide realistic backup duration without misleading overstatements.",
  },
  dpdpConsent: {
    id: "dpdpConsent",
    metric: "Data Privacy & Statutory Protection",
    value: "DPDP Act 2023 & DPDP Rules 2025 Compliant",
    formulaOrBasis:
      "Explicit consent notice, minimal data collection, zero third-party marketing brokers, right to grievance withdrawal",
    authority: "Ministry of Electronics and Information Technology (MeitY)",
    sourceDoc: "Digital Personal Data Protection Act, 2023 & Notified Rules 2025",
    sourceUrl: "https://meity.gov.in",
    verifiedDate: "Nov 2026",
    notes:
      "WAVENOX operates in demonstration concept mode unless live Supabase credentials are configured; contact submissions are treated with strict privacy controls.",
  },
};
