import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Info, ExternalLink } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND_CONFIG } from "@/config/brand";
import { DISCOMS, SOLAR_ASSUMPTIONS } from "@/config/solar";
import { PRODUCTS_CONFIG } from "@/config/products";
import {
  PM_SURYA_GHAR_SOURCE,
  TGERC_TARIFF_SOURCE,
  HYDERABAD_YIELD_SOURCE,
  IS_875_WIND_SOURCE,
  INCOME_TAX_SECTION_34_SOURCE,
  SBI_SOLAR_LOAN_SOURCE,
  MOP_ROOFTOP_RULES_SOURCE,
  MODULE_WARRANTY_SOURCE,
  CFA_SUBSIDY_CONFIG,
  SOLAR_LOAN_TERMS,
  TAX_DEPRECIATION_CONFIG,
} from "@/config/regulatory";

export const Route = createFileRoute("/legal/disclosures")({
  head: () => ({
    meta: [
      { title: `Financial Calculation Methodology & Disclosures — ${BRAND_CONFIG.name}` },
      {
        name: "description",
        content: `Transparent engineering assumptions, DISCOM tariff schedules, solar generation physics, and financial modeling methodologies used by ${BRAND_CONFIG.name}.`,
      },
      { property: "og:title", content: `Methodology & Disclosures — ${BRAND_CONFIG.name}` },
      {
        property: "og:description",
        content: `Transparent engineering assumptions, DISCOM tariff schedules, and financial modeling methodologies used by ${BRAND_CONFIG.name}.`,
      },
      { property: "og:image", content: `${BRAND_CONFIG.domain}/media/home-hero-1600w.jpg` },
      { property: "og:url", content: `${BRAND_CONFIG.domain}/legal/disclosures` },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: `${BRAND_CONFIG.domain}/legal/disclosures` }],
  }),
  component: DisclosuresPage,
});

function DisclosuresPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#171A20] selection:bg-[#171A20] selection:text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-28 pb-20 px-6 sm:px-12 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5C5E62] hover:text-[#171A20] transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
          <div className="text-xs font-semibold uppercase tracking-widest text-[#5C5E62]">
            Engineering Transparency & Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171A20] mt-2">
            Calculation Methodology & Consumer Disclosures
          </h1>
          <p className="text-xs text-[#5C5E62] mt-2">
            Single Source of Truth: Mathematical Models, DISCOM Tariffs & PM Surya Ghar Rules
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-[#393C41]">
          {/* Statutory Disclosure Banner */}
          <div className="p-5 rounded-2xl bg-[#F8F8FA] border border-[#E2E8F0]">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-[#171A20] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#171A20]">
                  Indicative Financial Model Notice
                </h2>
                <p className="text-xs text-[#5C5E62] mt-1 leading-relaxed">
                  These figures are indicative models based on standard irradiation data and current
                  DISCOM tariffs. Actual generation depends on shading, tilt angle, local weather,
                  and rooftop orientation. A certified site survey provides guaranteed engineering
                  projections.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Physics & Generation Yields */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              1. Solar Physics & Specific Generation Yield
            </h2>
            <p>
              Solar output calculations across our calculators and design studios are derived using
              the following standardized physics formulas:
            </p>
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2 text-xs font-mono">
              <div className="text-[#171A20] font-bold">
                Annual Energy Output (kWh) = System Capacity (kWp) × Specific Yield (kWh/kWp/yr)
              </div>
              <div className="text-[#5C5E62]">
                Monthly Energy Output (kWh) = Annual Energy Output ÷ 12
              </div>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">
                  Regional Specific Yield ({SOLAR_ASSUMPTIONS.yieldKwhPerKwYear} kWh/kWp/year):
                </strong>{" "}
                Calibrated for Central and Southern Indian solar insolation (approx. 4.0–4.5 peak
                sun hours per day) using BIS and MNRE solar radiation atlases.
              </li>
              <li>
                <strong className="text-[#171A20]">N-Type TOPCon Efficiency:</strong> Our models
                calibrate against {SOLAR_ASSUMPTIONS.panelWatt}W dual-glass bifacial panels with an
                operating temperature coefficient of -0.30%/°C, significantly outperforming legacy
                P-type PERC panels in high-ambient Indian summers.
              </li>
              <li>
                <strong className="text-[#171A20]">Degradation Multiplier:</strong> Year-1
                degradation is modeled at {PRODUCTS_CONFIG.module.degradationYear1Pct}%, followed by
                a linear annual degradation of {SOLAR_ASSUMPTIONS.degradationPerYear * 100}% per
                year over 25 years.
              </li>
            </ul>
          </section>

          {/* Section 2: Self-Consumption & Net-Metering Math */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              2. Self-Consumption & Net-Metering Economics
            </h2>
            <p>
              Power savings depend on utility net-metering regulations and monthly energy netting:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">Monthly Unit-for-Unit Netting:</strong> In
                Telangana (TGERC regulations), exported solar units offset imported electricity
                units 1:1 within the monthly billing period at the consumer&apos;s full retail slab
                tariff.
              </li>
              <li>
                <strong className="text-[#171A20]">Year-End Settlement:</strong> Unsettled net
                surplus credits at the conclusion of the annual settlement cycle (typically March
                31st) are compensated at the DISCOM&apos;s Average Pooled Purchase Cost (APPC) rate
                notified by TGERC (currently ₹3.55/kWh for TGSPDCL/TGNPDCL).
              </li>
              <li>
                <strong className="text-[#171A20]">Battery Value Proposition:</strong> For
                grid-connected residential consumers under domestic net-metering without Time-of-Day
                (ToD) tariffs, an energy storage battery does not increase monetary utility savings;
                its primary engineering purpose is uninterruptible backup resilience during power
                outages.
              </li>
              <li>
                <strong className="text-[#171A20]">Savings Cap:</strong> In all our algorithmic
                estimators, annual modeled solar savings are mathematically capped so they never
                exceed 100% of the customer&apos;s baseline annual electricity bill.
              </li>
            </ul>
          </section>

          {/* Section 3: DISCOM Tariffs & State ERC Schedules */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              3. State DISCOM Baseline Tariff Schedules (TGERC FY 2025-26)
            </h2>
            <p>
              We maintain active regulatory tariff schedules verified against the official TGERC
              Retail Supply Tariff Order for FY 2025-26. In multi-year financial forecasts, an
              annual grid tariff inflation rate of{" "}
              <strong className="text-[#171A20]">
                {SOLAR_ASSUMPTIONS.tariffEscalationPerYear * 100}%
              </strong>{" "}
              is applied:
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F8FA] border-b border-[#E2E8F0] text-[#171A20]">
                    <th className="py-2.5 px-4 font-semibold">DISCOM Code</th>
                    <th className="py-2.5 px-4 font-semibold">State</th>
                    <th className="py-2.5 px-4 font-semibold">Residential Base</th>
                    <th className="py-2.5 px-4 font-semibold">Commercial HT Base</th>
                    <th className="py-2.5 px-4 font-semibold">Annual Surplus Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {DISCOMS.map((d) => (
                    <tr key={d.code} className="hover:bg-[#FDFDFD]">
                      <td className="py-2.5 px-4 font-mono font-medium text-[#171A20]">{d.code}</td>
                      <td className="py-2.5 px-4 text-[#5C5E62]">{d.state}</td>
                      <td className="py-2.5 px-4 tabular-nums">
                        ₹{d.residentialTariffInr.toFixed(2)} / kWh
                      </td>
                      <td className="py-2.5 px-4 tabular-nums">
                        ₹{d.commercialTariffInr.toFixed(2)} / kWh
                      </td>
                      <td className="py-2.5 px-4 tabular-nums text-[#5C5E62]">
                        ₹{d.exportRateInr.toFixed(2)} / kWh (APPC)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F8FA] border border-[#E2E8F0] space-y-2 text-xs">
              <div className="font-semibold text-[#171A20]">
                Telangana LT-I Domestic Telescopic Slabs
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[#5C5E62]">
                <li>
                  <strong>LT-I(A) (≤ 100 units/mo):</strong> 0–50 @ ₹1.95, 51–100 @ ₹3.10
                </li>
                <li>
                  <strong>LT-I(B) (101–200 units/mo):</strong> 0–100 @ ₹3.40, 101–200 @ ₹4.80
                </li>
                <li>
                  <strong>LT-I(C) (&gt; 200 units/mo):</strong> 0–200 @ ₹5.10, 201–300 @ ₹7.70,
                  301–400 @ ₹9.00, 401–800 @ ₹9.50, &gt;800 @ ₹10.00
                </li>
                <li>
                  <strong>Fixed & Customer Charges:</strong> LT-I(C) fixed charge ₹10/kW/month;
                  customer charge ₹25–₹80/month; electricity duty ₹0.06/kWh.
                </li>
                <li>
                  <strong>Gruha Jyothi Scheme:</strong> Eligible domestic households in Telangana
                  receive zero electricity charges for consumption up to 200 units per month.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Commercial 40% Accelerated Depreciation */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              4. Commercial & Industrial Tax Depreciation (Section 34)
            </h2>
            <p>
              Under Section 34 of the Income-tax Act, 2025 (in force 1 April 2026, succeeding
              Section 32 of the 1961 Act), commercial and industrial enterprises investing in
              rooftop solar capital assets can claim{" "}
              <strong className="text-[#171A20]">40% Accelerated Depreciation (AD)</strong> in Year
              1 if the asset is put to use for 180 days or more in the financial year (20% if put to
              use for less than 180 days).
            </p>
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1 text-xs">
              <div className="font-semibold text-[#171A20]">Tax Shield Disclaimer</div>
              <p className="text-[#5C5E62]">
                Tax benefits shown in commercial proposals are illustrative models based on a
                corporate tax rate of 25.17% (Section 115BAA) or 30% for partnership firms. The
                actual tax shield realized depends on the company&apos;s taxable profit, tax regime,
                and asset capitalization date. Clients must consult their Chartered Accountant
                before financial commitment.
              </p>
            </div>
          </section>

          {/* Section 5: PM Surya Ghar Sizing & DBT Slab Schedule */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              5. PM Surya Ghar: Muft Bijli Yojana Central Financial Assistance Slabs
            </h2>
            <p>
              In accordance with official MNRE Operational Guidelines for PM Surya Ghar: Muft Bijli
              Yojana, Central Financial Assistance (CFA) is disbursed strictly as follows:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">First 2 kW:</strong> ₹30,000 per kW (₹60,000 for
                a 2 kW system).
              </li>
              <li>
                <strong className="text-[#171A20]">3rd kW (2 kW to 3 kW):</strong> ₹18,000 for the
                third kilowatt.
              </li>
              <li>
                <strong className="text-[#171A20]">Maximum Residential Subsidy:</strong> ₹78,000 cap
                reached at 3 kW. Systems larger than 3 kW remain eligible for ₹78,000 maximum CFA.
              </li>
              <li>
                <strong className="text-[#171A20]">Special Category States/UTs:</strong> ₹33,000/kW
                for first 2 kW and ₹19,800 for 3rd kW (cap ₹85,800) in Uttarakhand, Himachal
                Pradesh, J&amp;K, Ladakh, North-Eastern States, and Island UTs.
              </li>
              <li>
                <strong className="text-[#171A20]">Group Housing / RWA Common Areas:</strong>{" "}
                ₹18,000 per kW up to 500 kW capacity.
              </li>
              <li>
                <strong className="text-[#171A20]">Commercial/Industrial Exemption:</strong> ₹0
                subsidy. Subsidies apply exclusively to individual residential grid-connected
                consumers and RWAs.
              </li>
              <li>
                <strong className="text-[#171A20]">DBT Disbursement Protocol:</strong> The subsidy
                is not an upfront vendor discount; it is credited directly via Direct Benefit
                Transfer (DBT) to the beneficiary&apos;s Aadhaar-linked bank account after DISCOM
                meter synchronization and portal commissioning approval. MNRE dispatches DBT within
                ~15 business days of utility approval (consumers should plan for 1–3 months
                overall).
              </li>
            </ul>
          </section>

          {/* Section 6: Financing & EMI Terms */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              6. Indicative Solar Loan & EMI Computations
            </h2>
            <p>
              Where estimated monthly installments (EMI) are displayed, they are computed using
              national portal empanelled solar loan terms (e.g. State Bank of India PM Surya Ghar
              Retail Scheme):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">Financing Coverage:</strong> Up to 90% of gross
                turnkey project cost. The EMI principal is computed on this 90% gross capex; the
                government subsidy is credited separately post-commissioning and can be applied as a
                principal prepayment.
              </li>
              <li>
                <strong className="text-[#171A20]">Interest Rates:</strong> Floating EBLR-linked
                rates: up to ₹2,00,000 at ~5.75% p.a. (collateral-free); ₹2,00,000 to ₹6,00,000 at
                ~7.90% p.a.
              </li>
              <li>
                <strong className="text-[#171A20]">Tenure:</strong> Up to 120 months (10 years); our
                standard financial models use a conservative 60-month (5-year) tenure.
              </li>
            </ul>
            <p className="text-xs text-[#5C5E62]">
              WAVENOX maintains no exclusive banking partnerships. Customers may select any
              empanelled public or private sector lender directly on the national portal at{" "}
              <a
                href="https://pmsuryaghar.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[#171A20]"
              >
                pmsuryaghar.gov.in
              </a>
              . Final loan sanctions and terms remain at the sole discretion of the lending bank.
            </p>
          </section>

          {/* Section 7: Sourced Verification Index (#sources) */}
          <section id="sources" className="space-y-4 pt-6 border-t-2 border-[#171A20]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#B45309]">
                Single Source of Truth
              </div>
              <h2 className="text-xl font-bold text-[#171A20] mt-1">
                7. Statutory Verification & Sources Register
              </h2>
              <p className="text-xs text-[#5C5E62] mt-1">
                Every constant, tariff slab, subsidy formula, and physical assumption is verified
                against official regulatory orders and codes.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F8FA] border-b border-[#E2E8F0] text-[#171A20]">
                    <th className="py-2.5 px-4 font-semibold">Subject</th>
                    <th className="py-2.5 px-4 font-semibold">Statutory Reference & Document</th>
                    <th className="py-2.5 px-4 font-semibold">Verified</th>
                    <th className="py-2.5 px-4 font-semibold">Source Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">PM Surya Ghar CFA</td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {PM_SURYA_GHAR_SOURCE.title} ({PM_SURYA_GHAR_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {PM_SURYA_GHAR_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={PM_SURYA_GHAR_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Portal</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">Telangana Tariffs</td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {TGERC_TARIFF_SOURCE.title} ({TGERC_TARIFF_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {TGERC_TARIFF_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={TGERC_TARIFF_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Tariff Order</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Solar Yield &amp; Insolation
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">{HYDERABAD_YIELD_SOURCE.title}</td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {HYDERABAD_YIELD_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={HYDERABAD_YIELD_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>NASA POWER</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Wind Load Engineering
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {IS_875_WIND_SOURCE.title} ({IS_875_WIND_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {IS_875_WIND_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={IS_875_WIND_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>BIS Portal</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Commercial Depreciation
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {INCOME_TAX_SECTION_34_SOURCE.title}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {INCOME_TAX_SECTION_34_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={INCOME_TAX_SECTION_34_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Income Tax</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">Solar Financing</td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {SBI_SOLAR_LOAN_SOURCE.title} ({SBI_SOLAR_LOAN_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {SBI_SOLAR_LOAN_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={SBI_SOLAR_LOAN_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>SBI Portal</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Connection Feasibility
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {MOP_ROOFTOP_RULES_SOURCE.title} ({MOP_ROOFTOP_RULES_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {MOP_ROOFTOP_RULES_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={MOP_ROOFTOP_RULES_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Gazette</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[#171A20]">
                      Module Linear Degradation
                    </td>
                    <td className="py-2.5 px-4 text-[#5C5E62]">
                      {MODULE_WARRANTY_SOURCE.title} ({MODULE_WARRANTY_SOURCE.documentRef})
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#5C5E62]">
                      {MODULE_WARRANTY_SOURCE.verifiedOn}
                    </td>
                    <td className="py-2.5 px-4">
                      <a
                        href={MODULE_WARRANTY_SOURCE.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#171A20] hover:underline"
                      >
                        <span>Datasheet</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
