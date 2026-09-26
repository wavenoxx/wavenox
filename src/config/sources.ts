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
  verifiedDate: string; // e.g. "Aug 2026"
  notes?: string;
}

export const SOURCES_CATALOG: Record<string, SourcedDatum> = {
  pmSuryaGharSubsidy: {
    id: "pmSuryaGharSubsidy",
    metric: "Central Financial Assistance (CFA)",
    value: "Up to ₹78,000",
    formulaOrBasis:
      "₹33,000 for 1st kW + ₹33,000 for 2nd kW + ₹12,000 for 3rd kW (capped at ₹78,000 for ≥ 3 kW)",
    authority: "Ministry of New and Renewable Energy (MNRE), Govt. of India",
    sourceDoc: "PM Surya Ghar: Muft Bijli Yojana Operational Guidelines (Feb 2024)",
    sourceUrl: "https://pmsuryaghar.gov.in",
    verifiedDate: "Aug 2026",
    notes:
      "Direct Benefit Transfer credited directly to Aadhaar-linked consumer bank account after DISCOM meter commissioning.",
  },
  tgercTariffs: {
    id: "tgercTariffs",
    metric: "Telangana Residential Electricity Tariffs (LT-I C)",
    value: "₹5.10 to ₹9.50 / kWh",
    formulaOrBasis:
      "Telescopic slabs: 0–200 units @ ₹5.10; 201–300 @ ₹7.70; 301–400 @ ₹9.00; >400 @ ₹9.50 + Customer/Fixed Charges & 6 paise/unit duty",
    authority: "Telangana Electricity Regulatory Commission (TGERC)",
    sourceDoc: "Retail Supply Tariff Order for FY 2025-26",
    sourceUrl: "https://www.tgerc.telangana.gov.in",
    verifiedDate: "Aug 2026",
    notes:
      "Gruha Jyothi scheme waives billing up to 200 units/month for eligible residential households.",
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
    verifiedDate: "Aug 2026",
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
    verifiedDate: "Aug 2026",
    notes:
      "Structure engineered with 6005-T5 architectural aluminium and 4.0mm HDG steel footings for elevated pergola clearance.",
  },
  sbiSolarLoan: {
    id: "sbiSolarLoan",
    metric: "PM Surya Ghar Concessional Solar Loan",
    value: "7.00% p.a. floating",
    formulaOrBasis:
      "Equal Monthly Installment (EMI) calculated across 5-year (60 month) repayment tenure with nil collateral for systems up to 3 kW",
    authority: "State Bank of India (SBI)",
    sourceDoc: "SBI PM Surya Ghar Scheme Lending Terms & Circular",
    sourceUrl: "https://sbi.co.in",
    verifiedDate: "Aug 2026",
    notes:
      "Available to Indian residential applicants with sanctioned grid connection and PM Surya Ghar registration.",
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
    verifiedDate: "Aug 2026",
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
    verifiedDate: "Aug 2026",
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
    verifiedDate: "Aug 2026",
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
    verifiedDate: "Aug 2026",
    notes:
      "WAVENOX operates in demonstration concept mode; contact submissions are treated as portfolio inquiries.",
  },
};
