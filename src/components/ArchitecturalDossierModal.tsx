import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Printer, Share2, CheckCircle2, AlertTriangle } from "lucide-react";
import { BRAND_CONFIG } from "@/config/brand";
import { PRODUCTS_CONFIG } from "@/config/products";
import { project25Years, type YearProjectionPoint } from "@/config/solar";
import type { VerificationStatus } from "@/config/regulatory";

export interface DossierData {
  refCode: string;
  clientName?: string;
  phone?: string;
  address?: string;
  pinCode?: string;
  discomCode?: string;
  discomName?: string;
  jurisdictionStatus?: VerificationStatus;
  authorityLabel?: string;
  recommendedKw?: number;
  recommendedPanels?: number;
  isCustomPanelSelection?: boolean;
  systemKw: number;
  panelCount: number;
  batteryUnits: number;
  batteryKwh: number;
  monthlyBill: number;
  monthlyUnits?: number;
  grossCapex: number;
  subsidyInr: number;
  netPayable: number;
  paymentMode?: "cash" | "loan";
  monthlyEmi: number;
  initialMonthlyEmi?: number;
  customerDownPayment?: number;
  loanInterestRatePct?: number;
  loanTierLabel?: string;
  isLoanSchemeEligible?: boolean;
  paybackYears: number;
  annualSavings: number;
  twentyFiveYearSavings: number;
  annualGenKwh?: number;
  tariffInrPerKwh?: number;
  roofProfileLabel?: string;
  roofStatusLabel?: string;
  roofWarning?: string | null;
  sanctionedLoadStatusLabel?: string;
  sanctionedLoadWarning?: string | null;
  projection?: YearProjectionPoint[];
  dateStr?: string;
}

interface ArchitecturalDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DossierData;
}

function formatInr(val: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(val);
}

export function ArchitecturalDossierModal({
  isOpen,
  onClose,
  data,
}: ArchitecturalDossierModalProps) {
  const currentDate =
    data.dateStr ||
    new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handlePrint = () => {
    window.print();
  };

  const whatsappText = `Hello WAVENOX Engineering Team, I am reviewing my Preliminary Solar Assessment (${data.refCode}) for a ${data.systemKw} kW system in ${data.address || "my city"} (PIN: ${data.pinCode || "to be confirmed"}). I would like to schedule an advisor consultation and site survey.`;
  const whatsappUrl = `${BRAND_CONFIG.contact.whatsappLink}?text=${encodeURIComponent(whatsappText)}`;

  const isUnavailable = data.jurisdictionStatus === "UNAVAILABLE";
  const annualGenKwh = data.annualGenKwh ?? (isUnavailable ? 0 : Math.round(data.systemKw * 1490));
  const tariffInrPerKwh = data.tariffInrPerKwh ?? (isUnavailable ? 0 : 9.2);

  // Unified 25-Year Financial Schedule from single engine (zero duplicate formula drift)
  const fullProjection = React.useMemo(() => {
    if (data.projection && data.projection.length === 25) {
      return data.projection;
    }
    return project25Years({
      annualBillInr: isUnavailable ? 0 : data.monthlyBill * 12,
      annualSavingsInr: isUnavailable ? 0 : data.annualSavings,
      annualGenKwh,
      netInvestmentInr: isUnavailable ? 0 : data.netPayable,
      tariffPerKwh: tariffInrPerKwh,
    });
  }, [
    data.projection,
    data.monthlyBill,
    data.annualSavings,
    annualGenKwh,
    data.netPayable,
    tariffInrPerKwh,
    isUnavailable,
  ]);

  const matrixYears = [1, 5, 10, 15, 20, 25];
  const compoundMatrix = matrixYears.map((yr) => {
    const point = fullProjection[yr - 1];
    return {
      year: yr,
      tariffPerKwh:
        point?.tariffPerKwh ?? Number((tariffInrPerKwh * Math.pow(1.03, yr - 1)).toFixed(2)),
      cumulativeSavings: point?.cumSavings ?? 0,
      netRetainedWealth: point?.netCumulativeCashflow ?? 0,
    };
  });

  const statusBadgeText =
    data.jurisdictionStatus === "VERIFIED"
      ? `Verified ${data.authorityLabel || "SERC"} Tariff Schedule`
      : data.jurisdictionStatus === "UNAVAILABLE"
        ? "Utility Verification Required"
        : "Indicative Regional Tariff Benchmark";

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 no-print" />

        <Dialog.Content className="fixed inset-2 sm:inset-6 md:inset-10 z-50 overflow-y-auto bg-[#FBFBFC] rounded-lg shadow-2xl focus:outline-none flex flex-col no-print-dialog">
          <Dialog.Title className="sr-only">
            {BRAND_CONFIG.name} Preliminary Solar Assessment — Indicative System Design (
            {data.refCode})
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Preliminary non-binding solar configuration summary, hardware specifications, indicative
            savings, and feasibility disclosures subject to on-site survey and formal quotation.
          </Dialog.Description>

          {/* Action Header bar (Hidden in Print) */}
          <div className="sticky top-0 z-20 flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 bg-[#FFFFFF] border-b border-[#E3E4E6] shadow-xs no-print">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#171A20] shrink-0" />
              <span className="text-[12px] sm:text-[13px] font-semibold tracking-wider uppercase text-[#171A20] truncate">
                {BRAND_CONFIG.name} · Preliminary Solar Assessment
              </span>
              <span className="hidden md:inline-block px-2 py-0.5 text-[12px] uppercase font-bold tracking-widest bg-[#F4F4F4] text-[#5C5E62] rounded shrink-0">
                Ref: {data.refCode}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#171A20] text-[#FFFFFF] text-[12px] sm:text-[13px] font-medium hover:bg-[#2C3038] transition-colors cursor-pointer whitespace-nowrap"
                title="Open browser print dialog to print or save a local PDF copy"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span>Print / Save PDF</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#E3E4E6] text-[#171A20] bg-[#FFFFFF] text-[12px] sm:text-[13px] font-medium hover:bg-[#F4F4F4] transition-colors whitespace-nowrap"
                title="Share configuration with a WAVENOX Solar Advisor on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5 text-[#F57C00] shrink-0" />
                <span>Discuss on WhatsApp</span>
              </a>

              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1.5 rounded-[4px] text-[#5C5E62] hover:text-[#171A20] hover:bg-[#F4F4F4] transition-colors cursor-pointer"
                  aria-label="Close Proposal"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Proposal Document Container (Visible in Screen & Print) */}
          <div className="flex-1 p-3 sm:p-8 md:p-12 max-w-4xl mx-auto w-full text-[#171A20] print:p-0 print:m-0 print:max-w-none">
            <div className="bg-[#FFFFFF] p-5 sm:p-10 border border-[#E3E4E6] rounded-[4px] shadow-sm print:border-none print:shadow-none print:p-0">
              {/* Document Master Header */}
              <div className="border-b-2 border-[#171A20] pb-5 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-[22px] sm:text-[24px] font-bold tracking-[0.18em] text-[#171A20] uppercase font-mono">
                    {BRAND_CONFIG.name}
                  </div>
                  <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5C5E62] mt-0.5">
                    Preliminary Solar Assessment · Indicative System Design
                  </div>
                  <div className="text-[12px] text-[#5C5E62] mt-1 font-mono">
                    Coordinated by {BRAND_CONFIG.name} · Subject to Site Survey and Formal Quotation
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-[12px] space-y-1">
                  <div className="text-[#171A20] font-bold tracking-wider">
                    REFERENCE ID: {data.refCode}
                  </div>
                  <div className="text-[#5C5E62]">DATE OF ISSUE: {currentDate}</div>
                  <div className="text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded inline-block font-semibold">
                    NON-BINDING PRELIMINARY ESTIMATE
                  </div>
                </div>
              </div>

              {/* Client, Utility & Sizing Basis Grid */}
              <div className="mb-6 p-4 bg-[#F8F9FA] rounded-[4px] border border-[#E9ECEF] grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px]">
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wider text-[#5C5E62]">
                    Customer / Property
                  </div>
                  <div className="font-semibold text-[#171A20] mt-0.5">
                    {data.clientName || "Prospective Homeowner"}
                  </div>
                  {data.phone && (
                    <div className="text-[#5C5E62] text-[12px] font-mono mt-0.5">
                      Tel: {data.phone}
                    </div>
                  )}
                  <div className="text-[#5C5E62] text-[12px] mt-0.5">
                    {data.address || "Location to be confirmed during consultation"} · PIN:{" "}
                    {data.pinCode || "Pending"}
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wider text-[#5C5E62]">
                    Selected Electricity Board
                  </div>
                  <div className="font-semibold text-[#171A20] mt-0.5">
                    {data.discomCode ? `${data.discomCode} — ` : ""}
                    {data.discomName || "Regional Electricity Utility"}
                  </div>
                  <div className="text-[#5C5E62] text-[12px] font-medium mt-0.5">
                    Status: {statusBadgeText}
                  </div>
                </div>

                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wider text-[#5C5E62]">
                    Recommendation vs Selection
                  </div>
                  <div className="font-semibold text-[#171A20] mt-0.5">
                    Selected: {data.systemKw.toFixed(2)} kW ({data.panelCount} Modules)
                  </div>
                  {typeof data.recommendedKw === "number" &&
                    typeof data.recommendedPanels === "number" && (
                      <div className="text-[#5C5E62] text-[12px] mt-0.5">
                        Engine Recommended: {data.recommendedKw.toFixed(2)} kW (
                        {data.recommendedPanels} Modules) ·{" "}
                        {data.isCustomPanelSelection ? "Customer Selected" : "Recommended Match"}
                      </div>
                    )}
                </div>
              </div>

              {/* Feasibility & Constraint Notices */}
              {(data.roofStatusLabel ||
                data.sanctionedLoadStatusLabel ||
                data.roofWarning ||
                data.sanctionedLoadWarning) && (
                <div className="mb-6 space-y-2 text-[12px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-[4px] border border-[#E3E4E6] bg-[#FAFAFA]">
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[#5C5E62] block">
                        Rooftop Feasibility Status
                      </span>
                      <span className="font-medium text-[#171A20] mt-0.5 block">
                        {data.roofStatusLabel || "Requires Physical Site Survey"}
                        {data.roofProfileLabel ? ` · ${data.roofProfileLabel}` : ""}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-wider text-[#5C5E62] block">
                        Sanctioned Load Status
                      </span>
                      <span className="font-medium text-[#171A20] mt-0.5 block">
                        {data.sanctionedLoadStatusLabel ||
                          "Requires Electricity Bill Load Verification"}
                      </span>
                    </div>
                  </div>
                  {data.roofWarning && (
                    <div className="p-3 rounded-[4px] bg-[#FFF8E1] border border-[#F59E0B]/40 text-[#92400E] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
                      <span>{data.roofWarning}</span>
                    </div>
                  )}
                  {data.sanctionedLoadWarning && (
                    <div className="p-3 rounded-[4px] bg-[#FFF8E1] border border-[#F59E0B]/40 text-[#92400E] flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
                      <span>{data.sanctionedLoadWarning}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Section I: Sizing & Bill of Materials */}
              <div className="mb-8 avoid-break">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E4E6] pb-2 mb-3">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#171A20]">
                    I. Preliminary Hardware Configuration (Indicative System Design)
                  </h3>
                  <span className="text-[12px] font-mono text-[#5C5E62]">
                    Total Array: {data.systemKw.toFixed(2)} kWp DC ·{" "}
                    {PRODUCTS_CONFIG.indicativeDisclaimer}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#E3E4E6] text-[12px] uppercase font-bold text-[#5C5E62]">
                        <th className="py-2 pr-3">Component</th>
                        <th className="py-2 px-3">Indicative Specification</th>
                        <th className="py-2 pl-3 text-right whitespace-nowrap">
                          Quantity / Capacity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9ECEF] text-[#171A20]">
                      <tr>
                        <td className="py-2.5 pr-3 font-medium align-top">Solar PV Modules</td>
                        <td className="py-2.5 px-3 text-[#5C5E62] align-top">
                          {PRODUCTS_CONFIG.module.modelName} ({PRODUCTS_CONFIG.module.cellType}),{" "}
                          {PRODUCTS_CONFIG.module.efficiencyPct}% efficiency,{" "}
                          {PRODUCTS_CONFIG.module.certifications.join(", ")}.
                        </td>
                        <td className="py-2.5 pl-3 text-right font-mono font-medium align-top whitespace-nowrap">
                          {data.panelCount} × {PRODUCTS_CONFIG.module.ratedPowerW}W (
                          {data.systemKw.toFixed(2)} kW)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-3 font-medium align-top">
                          Grid-Interactive Inverter
                        </td>
                        <td className="py-2.5 px-3 text-[#5C5E62] align-top">
                          {PRODUCTS_CONFIG.inverter.type}, {PRODUCTS_CONFIG.inverter.efficiencyPct}%
                          efficiency, {PRODUCTS_CONFIG.inverter.protectionRating} enclosure,{" "}
                          {PRODUCTS_CONFIG.inverter.warrantyYears}-year OEM warranty.
                        </td>
                        <td className="py-2.5 pl-3 text-right font-mono font-medium align-top whitespace-nowrap">
                          1 Unit (Sized to Array)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-3 font-medium align-top">
                          Omnigrid Battery Storage
                        </td>
                        <td className="py-2.5 px-3 text-[#5C5E62] align-top">
                          {data.batteryUnits > 0
                            ? `${PRODUCTS_CONFIG.battery.modelName} (${PRODUCTS_CONFIG.battery.chemistry}), ${PRODUCTS_CONFIG.battery.islandingTransferSpeedMs} transfer on wired backup sub-panel.`
                            : "Solar-only grid-tied configuration (0 battery units selected). Shuts down during utility grid outages per anti-islanding safety rules."}
                        </td>
                        <td className="py-2.5 pl-3 text-right font-mono font-medium align-top whitespace-nowrap">
                          {data.batteryUnits > 0
                            ? `${data.batteryUnits} × ${PRODUCTS_CONFIG.battery.usableCapacityKwh} kWh (${data.batteryKwh.toFixed(1)} kWh)`
                            : "0 Units (Solar Only)"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 pr-3 font-medium align-top">
                          Mounting &amp; Balance of System
                        </td>
                        <td className="py-2.5 px-3 text-[#5C5E62] align-top">
                          {data.roofProfileLabel || "RCC / Terrace Mounting Structure"}, AC/DC surge
                          protection (SPD), earthing, UV-resistant cabling, and DISCOM net-meter
                          coordination.
                        </td>
                        <td className="py-2.5 pl-3 text-right font-mono font-medium align-top whitespace-nowrap">
                          Subject to Site Survey
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section II: Financial Economics & PM Surya Ghar Ledger */}
              <div className="mb-8 avoid-break">
                <div className="flex items-center justify-between border-b border-[#E3E4E6] pb-2 mb-3">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#171A20]">
                    II. Indicative Cost, Conditional Subsidy &amp; Savings Summary
                  </h3>
                  <span className="text-[12px] font-mono text-[#5C5E62]">Currency: INR (₹)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 rounded-[4px] border border-[#E3E4E6] bg-[#FAFAFA] space-y-2 text-[12px]">
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                      <span className="text-[#5C5E62]">Gross Installed System Cost:</span>
                      <span className="font-mono font-semibold">₹{formatInr(data.grossCapex)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA] text-[#2E7D32]">
                      <span className="font-medium">
                        Potential Central Subsidy (Conditional DBT)*:
                      </span>
                      <span className="font-mono font-bold">-₹{formatInr(data.subsidyInr)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-[13px] font-bold text-[#171A20] pt-1">
                      <span>Conditional Cost After Potential DBT:</span>
                      <span className="font-mono text-[15px]">₹{formatInr(data.netPayable)}</span>
                    </div>
                    {data.paymentMode === "loan" && (
                      <div className="pt-2 border-t border-[#EAEAEA] space-y-1 text-[#5C5E62]">
                        <div className="font-semibold text-[#171A20]">
                          Selected Mode: Indicative 5-Year Financing Scenario
                        </div>
                        {typeof data.customerDownPayment === "number" && (
                          <div className="flex justify-between">
                            <span>Est. Year-0 Down Payment:</span>
                            <span className="font-mono text-[#171A20]">
                              ₹{formatInr(data.customerDownPayment)}
                            </span>
                          </div>
                        )}
                        {typeof data.initialMonthlyEmi === "number" && (
                          <div className="flex justify-between">
                            <span>Initial Monthly EMI (Pre-Subsidy):</span>
                            <span className="font-mono text-[#171A20]">
                              ~₹{formatInr(data.initialMonthlyEmi)}/mo
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>
                            {data.isLoanSchemeEligible === false
                              ? "Illustrative Post-DBT Recast EMI (Subject to Lender):"
                              : "Indicative Post-DBT Recast EMI:"}
                          </span>
                          <span className="font-mono font-semibold text-[#171A20]">
                            ~₹{formatInr(data.monthlyEmi)}/mo
                          </span>
                        </div>
                        {data.loanTierLabel && (
                          <div className="text-[12px] text-[#5C5E62] pt-0.5">
                            Basis: {data.loanTierLabel}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-[12px] text-[#5C5E62] pt-1">
                      * Central subsidy is not an upfront invoice discount; it is disbursed via
                      Direct Benefit Transfer (DBT) after DISCOM net-meter commissioning and
                      National Portal verification.
                    </p>
                  </div>

                  <div className="p-4 rounded-[4px] border border-[#E3E4E6] bg-[#FAFAFA] space-y-2 text-[12px]">
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                      <span className="text-[#5C5E62]">Monthly Electricity Bill Input:</span>
                      <span className="font-mono font-semibold">
                        ₹{formatInr(data.monthlyBill)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA]">
                      <span className="text-[#5C5E62]">Indicative Annual Solar Generation:</span>
                      <span className="font-mono font-semibold">
                        {isUnavailable
                          ? "Requires Advisor Assessment"
                          : `~${formatInr(annualGenKwh)} kWh/yr`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#EAEAEA] text-[#2E7D32]">
                      <span className="font-medium">Indicative Year-1 Bill Savings:</span>
                      <span className="font-mono font-bold">
                        {isUnavailable
                          ? "Detailed regional calculation unavailable"
                          : `~₹${formatInr(data.annualSavings)}/yr`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-[13px] font-bold text-[#171A20] pt-1">
                      <span>Indicative Simple Payback:</span>
                      <span className="font-mono text-[#F57C00]">
                        {isUnavailable || data.paybackYears <= 0
                          ? "Advisor Review Required"
                          : `~${data.paybackYears.toFixed(1)} Years`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section III: 25-Year Cumulative Projection (only when regional calculation is supported) */}
              {!isUnavailable && (
                <div className="mb-8 avoid-break page-break-after">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E4E6] pb-2 mb-3">
                    <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#171A20]">
                      III. Indicative 25-Year Cumulative Projection
                    </h3>
                    <span className="text-[12px] text-[#5C5E62] font-mono">
                      Modeled at 3.0% Annual Tariff Escalation · 0.40%/yr Module Degradation
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px] border-collapse">
                      <thead>
                        <tr className="border-b border-[#E3E4E6] text-[12px] uppercase font-bold text-[#5C5E62] bg-[#F8F9FA]">
                          <th className="py-2 px-3">Horizon</th>
                          <th className="py-2 px-3">Modeled Tariff</th>
                          <th className="py-2 px-3">Cumulative Bill Offset</th>
                          <th className="py-2 px-3 text-right">
                            Indicative Net Cumulative Cashflow
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E9ECEF] text-[#171A20]">
                        {compoundMatrix.map((row) => (
                          <tr key={row.year} className="hover:bg-[#FAFAFA]">
                            <td className="py-2 px-3 font-semibold">
                              Year {row.year} {row.year === 25 ? "(25-Yr Performance Horizon)" : ""}
                            </td>
                            <td className="py-2 px-3 text-[#5C5E62] font-mono">
                              ₹{row.tariffPerKwh.toFixed(2)} / kWh
                            </td>
                            <td className="py-2 px-3 font-mono font-medium">
                              ₹{formatInr(row.cumulativeSavings)}
                            </td>
                            <td
                              className={`py-2 px-3 text-right font-mono font-bold ${
                                row.netRetainedWealth > 0 ? "text-[#2E7D32]" : "text-[#5C5E62]"
                              }`}
                            >
                              ₹{formatInr(row.netRetainedWealth)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Section IV: What Happens Next */}
              <div className="mb-8 avoid-break">
                <div className="flex items-center justify-between border-b border-[#E3E4E6] pb-2 mb-3">
                  <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#171A20]">
                    IV. Next Steps After Requesting Your Assessment
                  </h3>
                  <span className="text-[12px] font-mono text-[#5C5E62]">
                    Full-Service Delivery Process
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[12px]">
                  <div className="p-3 rounded-[4px] bg-[#F8F9FA] border border-[#E9ECEF]">
                    <div className="font-bold text-[#171A20]">1. Advisor Review</div>
                    <p className="text-[#5C5E62] mt-1">
                      Verification of your 12-month DISCOM bill history, sanctioned load, and phase
                      connection.
                    </p>
                  </div>
                  <div className="p-3 rounded-[4px] bg-[#F8F9FA] border border-[#E9ECEF]">
                    <div className="font-bold text-[#171A20]">2. On-Site Survey</div>
                    <p className="text-[#5C5E62] mt-1">
                      Physical terrace measurement, structural check, obstacle shading check, and
                      inverter routing.
                    </p>
                  </div>
                  <div className="p-3 rounded-[4px] bg-[#F8F9FA] border border-[#E9ECEF]">
                    <div className="font-bold text-[#171A20]">3. Formal Quotation</div>
                    <p className="text-[#5C5E62] mt-1">
                      Finalized engineering layout, confirmed BoM datasheets, and binding project
                      contract.
                    </p>
                  </div>
                  <div className="p-3 rounded-[4px] bg-[#F8F9FA] border border-[#E9ECEF]">
                    <div className="font-bold text-[#171A20]">4. Commissioning</div>
                    <p className="text-[#5C5E62] mt-1">
                      Installation via authorized partners, DISCOM bi-directional meter test, and
                      portal documentation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warranties & Non-Binding Notice */}
              <div className="pt-6 border-t border-[#E3E4E6] grid grid-cols-1 sm:grid-cols-2 gap-6 items-end avoid-break">
                <div className="space-y-2 text-[12px] text-[#5C5E62]">
                  <div className="font-bold uppercase tracking-wider text-[#171A20]">
                    OEM Hardware &amp; Installation Warranty Distinction:
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171A20]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span>
                      Tier-1 OEM {PRODUCTS_CONFIG.module.performanceWarrantyYears}-Year Linear
                      Module Performance Warranty ({PRODUCTS_CONFIG.module.productWarrantyYears}-Yr
                      Product)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171A20]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span>
                      {PRODUCTS_CONFIG.inverter.warrantyYears}-Year OEM Inverter &amp;{" "}
                      {PRODUCTS_CONFIG.battery.warrantyYears}-Year LFP Battery OEM Warranty
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171A20]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32] shrink-0" />
                    <span>
                      Authorized Partner Workmanship Coverage governed by signed project contract
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#F8F9FA] rounded-[4px] border border-[#E9ECEF] text-center font-mono">
                  <div className="text-[12px] uppercase font-bold tracking-widest text-[#5C5E62]">
                    {data.refCode?.startsWith("WNX-DEMO-")
                      ? "WAVENOX DEMO SIMULATION"
                      : "PRELIMINARY SOLAR ASSESSMENT"}
                  </div>
                  <div className="text-[12px] font-semibold text-[#171A20] my-1">
                    INDICATIVE SYSTEM DESIGN — SUBJECT TO SITE SURVEY &amp; FORMAL QUOTATION
                  </div>
                  <div className="text-[12px] text-[#5C5E62]">
                    Generated {currentDate} · Use browser Print / Save as PDF for a local reference
                    copy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
