import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, ArrowLeft, Info, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND_CONFIG } from "@/config/brand";
import { DISCOMS, SOLAR_ASSUMPTIONS } from "@/config/solar";
import { PRODUCTS_CONFIG } from "@/config/products";

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
              2. Self-Consumption vs. Net-Metering Feed-in Export
            </h2>
            <p>
              Power savings depend on whether generated kilowatt-hours offset high-tier retail
              consumption or are exported to the grid at DISCOM feed-in rates:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">
                  Without Battery ({SOLAR_ASSUMPTIONS.selfConsumptionNoBattery * 100}%
                  Self-Consumption):
                </strong>{" "}
                Assumes 70% of daytime solar power is consumed immediately by daytime household
                loads (ACs, pumps, appliances). The remaining 30% surplus is exported to the grid at
                the DISCOM&apos;s solar feed-in tariff (typically ₹3.00/kWh).
              </li>
              <li>
                <strong className="text-[#171A20]">
                  With Omnigrid Battery ({SOLAR_ASSUMPTIONS.selfConsumptionWithBattery * 100}%
                  Self-Consumption):
                </strong>{" "}
                Solar surplus charges the {SOLAR_ASSUMPTIONS.battery.unitCapacityKwh} kWh LiFePO4
                battery during the day to sustain evening and nighttime consumption, capturing
                maximum retail tariff value with minimal low-rate grid export.
              </li>
              <li>
                <strong className="text-[#171A20]">Savings Cap Guarantee:</strong> In all our
                algorithmic estimators, annual modeled solar savings are mathematically capped so
                they never exceed 100% of the customer&apos;s baseline annual electricity bill.
              </li>
            </ul>
          </section>

          {/* Section 3: DISCOM Tariffs & State ERC Schedules */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              3. State DISCOM Baseline Tariff Schedules
            </h2>
            <p>
              We maintain active regulatory tariff schedules across major regional electricity
              utilities. In multi-year financial forecasts, an annual grid tariff inflation rate of{" "}
              <strong className="text-[#171A20]">
                {SOLAR_ASSUMPTIONS.tariffEscalationPerYear * 100}%
              </strong>{" "}
              is applied based on historical ERC tariff review orders:
            </p>
            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F8FA] border-b border-[#E2E8F0] text-[#171A20]">
                    <th className="py-2.5 px-4 font-semibold">DISCOM Code</th>
                    <th className="py-2.5 px-4 font-semibold">State / Territory</th>
                    <th className="py-2.5 px-4 font-semibold">Residential Tariff</th>
                    <th className="py-2.5 px-4 font-semibold">Commercial Tariff</th>
                    <th className="py-2.5 px-4 font-semibold">Export Feed-in</th>
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
                        ₹{d.exportRateInr.toFixed(2)} / kWh
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-[#5C5E62]">
              Note: Slab rates reflect blended high-consumption tiers (typical for residences
              consuming &gt;500 kWh/month). Actual bills include fixed meter charges, electricity
              duty, and fuel surcharge adjustments (FSA).
            </p>
          </section>

          {/* Section 4: Commercial 40% Accelerated Depreciation */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              4. Commercial & Industrial Tax Depreciation
            </h2>
            <p>
              Under Section 32 of the Indian Income Tax Act, commercial enterprises investing in
              renewable energy assets are eligible for up to{" "}
              <strong className="text-[#171A20]">40% Accelerated Depreciation (AD)</strong> in Year
              1 on solar equipment installed before October 1st of the financial year (20% if
              commissioned in H2).
            </p>
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-1 text-xs">
              <div className="font-semibold text-[#171A20]">Tax Shield Disclaimer</div>
              <p className="text-[#5C5E62]">
                Tax benefits shown in commercial proposals are illustrative models based on a
                corporate tax rate of 25% (or 30% for partnership firms/proprietorships). The actual
                tax shield realized depends on the client company&apos;s taxable profit, tax regime
                chosen (Section 115BAA vs. old regime), and asset capitalization dates. Clients must
                consult their Chartered Accountant before financial commitment.
              </p>
            </div>
          </section>

          {/* Section 5: PM Surya Ghar Sizing & DBT Slab Schedule */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#171A20] border-b border-[#E2E8F0] pb-2">
              5. PM Surya Ghar: Muft Bijli Yojana Central Financial Assistance Slabs
            </h2>
            <p>
              In accordance with MNRE Order No. 318/17/2024-GCRT, residential solar Central
              Financial Assistance (CFA) is disbursed strictly as follows:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#5C5E62]">
              <li>
                <strong className="text-[#171A20]">First 2 kW:</strong> ₹33,000 per kW (₹66,000 for
                a 2 kW system).
              </li>
              <li>
                <strong className="text-[#171A20]">Additional 1 kW (2 kW to 3 kW):</strong> ₹12,000
                per kW.
              </li>
              <li>
                <strong className="text-[#171A20]">Maximum Residential Subsidy:</strong> ₹78,000 cap
                reached at 3 kW. Systems larger than 3 kW remain eligible for ₹78,000 maximum CFA.
              </li>
              <li>
                <strong className="text-[#171A20]">Commercial/Industrial Exemption:</strong> ₹0
                subsidy. Subsidies apply exclusively to individual residential grid-connected
                consumers.
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
              standard amortization at{" "}
              <strong className="text-[#171A20]">
                {(SOLAR_ASSUMPTIONS.loan.annualRate * 100).toFixed(1)}% annual interest
              </strong>{" "}
              over a{" "}
              <strong className="text-[#171A20]">
                {SOLAR_ASSUMPTIONS.loan.tenureMonths} month (5-year)
              </strong>{" "}
              tenure:
            </p>
            <p className="text-xs text-[#5C5E62]">
              Final loan sanctions, interest margins, processing charges, and required down payments
              are determined at the sole discretion of our partner lending institutions (SBI, HDFC,
              Canara, Tata Capital) based on customer credit scores (CIBIL ≥ 750) and income
              verification.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
