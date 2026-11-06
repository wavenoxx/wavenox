import * as React from "react";
import { ChevronDown, ChevronUp, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { decodeBill, type DetailedBillAnalysis } from "@/config/regulatory";

export interface BillDecoderProps {
  monthlyBill: number;
  discomCode?: string;
  sanctionedLoadKw?: number;
  sanctionedLoadConfirmed?: boolean;
  monthlyUnitsOverride?: number;
  onBillChange?: (bill: number) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export function BillDecoder({
  monthlyBill,
  discomCode = "TGSPDCL",
  sanctionedLoadKw,
  sanctionedLoadConfirmed,
  monthlyUnitsOverride,
  className = "",
  defaultExpanded = false,
}: BillDecoderProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const analysis: DetailedBillAnalysis = React.useMemo(() => {
    return decodeBill(discomCode, monthlyBill, sanctionedLoadKw);
  }, [discomCode, monthlyBill, sanctionedLoadKw]);

  const isVerified = analysis.status === "VERIFIED";
  const isUnavailable = analysis.status === "UNAVAILABLE";
  const isSanctionedLoadVerified =
    typeof sanctionedLoadConfirmed === "boolean"
      ? sanctionedLoadConfirmed
      : analysis.sanctionedLoadConfirmed;
  const displayedUnits =
    typeof monthlyUnitsOverride === "number" &&
    Number.isFinite(monthlyUnitsOverride) &&
    monthlyUnitsOverride > 0
      ? Math.round(monthlyUnitsOverride)
      : analysis.estimatedUnits;
  const hasUnitsOverride =
    typeof monthlyUnitsOverride === "number" &&
    Number.isFinite(monthlyUnitsOverride) &&
    monthlyUnitsOverride > 0;

  if (isUnavailable) {
    return (
      <div
        className={`rounded-[8px] border border-[#F59E0B]/40 bg-[#FFF8E1] p-4 sm:p-5 text-[12px] text-[#92400E] space-y-1.5 ${className}`}
      >
        <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-[#92400E]">
          <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
          <span>Utility Verification Required ({discomCode})</span>
        </div>
        <div className="text-[14px] font-medium text-[#171A20]">
          Detailed regional calculation unavailable — advisor assessment required.
        </div>
        <p className="text-[#5C5E62] leading-relaxed">
          Tariff slabs, fixed charges, and net-metering settlement rules for{" "}
          <strong>{discomCode}</strong> are not in the verified WAVENOX utility registry. Select a
          supported electricity board above or submit your details below for a custom engineering
          review.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] overflow-hidden shadow-xs ${className}`}
    >
      {/* Header Summary */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4F4F4]/50">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`text-[12px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[3px] ${
                isVerified ? "text-[#1B5E20] bg-[#E8F5E9]" : "text-[#92400E] bg-[#FEF3C7]"
              }`}
            >
              {isVerified
                ? `${analysis.authority} Verified Tariff Breakdown (${analysis.state})`
                : `Indicative Regional Tariff Benchmark (${analysis.state})`}
            </span>
            <span className="text-[12px] text-[#5C5E62] font-mono">{analysis.category}</span>
          </div>
          <div className="text-[16px] sm:text-[18px] font-medium text-[#171A20] leading-snug">
            {hasUnitsOverride ? (
              <>
                Customer-entered consumption:{" "}
                <span className="font-semibold text-[#171A20] tabular-nums">
                  {displayedUnits.toLocaleString("en-IN")} units/month
                </span>{" "}
                <span className="text-[13px] font-normal text-[#5C5E62]">
                  (₹{monthlyBill.toLocaleString("en-IN")} bill)
                </span>
              </>
            ) : (
              <>
                Your ₹{monthlyBill.toLocaleString("en-IN")} {discomCode} bill ≈{" "}
                <span className="font-semibold text-[#171A20] tabular-nums">
                  {displayedUnits.toLocaleString("en-IN")} units/month
                </span>
              </>
            )}
          </div>
          <div className="text-[12px] text-[#5C5E62] mt-0.5">
            Average effective tariff: ₹{analysis.averageRatePerKwh.toFixed(2)} / kWh ·{" "}
            {isSanctionedLoadVerified
              ? `Connected load: ${analysis.sanctionedLoadKw} kW (Customer-verified)`
              : `Assumed load: ${analysis.sanctionedLoadKw} kW (Unverified)`}{" "}
            · Avoidable energy/duty: ₹{analysis.avoidableChargesTotal.toLocaleString("en-IN")}/mo
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF] text-[12px] font-medium text-[#171A20] hover:bg-[#F4F4F4] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
        >
          <FileText className="w-3.5 h-3.5 text-[#5C5E62]" />
          <span>
            {isExpanded
              ? "Hide Breakdown"
              : isVerified
                ? "View Slabs & Charges"
                : "View Benchmark Basis"}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#5C5E62]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#5C5E62]" />
          )}
        </button>
      </div>

      {/* Expandable Slab Breakdown Table */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-[#E3E4E6] space-y-4 animate-in fade-in-0 duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] sm:text-[13px]">
              <thead>
                <tr className="border-b border-[#E3E4E6] text-[#5C5E62]">
                  <th className="pb-2 font-medium">
                    {isVerified ? "Telescopic Slab" : "Tariff Component"}
                  </th>
                  <th className="pb-2 font-medium text-right">Units</th>
                  <th className="pb-2 font-medium text-right">Rate / Unit</th>
                  <th className="pb-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E4E6]/50">
                {analysis.slabs.map((slab) => (
                  <tr key={slab.slab} className="tabular-nums">
                    <td className="py-2 text-[#171A20] font-medium">{slab.slab}</td>
                    <td className="py-2 text-right text-[#5C5E62]">{slab.units}</td>
                    <td className="py-2 text-right text-[#5C5E62]">
                      ₹{slab.ratePerUnit.toFixed(2)}
                    </td>
                    <td className="py-2 text-right font-medium text-[#171A20]">
                      ₹
                      {slab.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[#E3E4E6] text-[12px]">
                <tr className="tabular-nums">
                  <td colSpan={3} className="pt-2 text-[#5C5E62]">
                    Energy Charges Subtotal (Solar-Avoidable)
                  </td>
                  <td className="pt-2 text-right font-semibold text-[#171A20]">
                    ₹{analysis.energyChargesTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="tabular-nums">
                  <td colSpan={3} className="py-1 text-[#5C5E62]">
                    Monthly Customer Charge ({analysis.authority} Schedule · Unavoidable)
                  </td>
                  <td className="py-1 text-right text-[#5C5E62]">
                    ₹{analysis.customerCharge.toFixed(2)}
                  </td>
                </tr>
                {analysis.fixedCharge > 0 && (
                  <tr className="tabular-nums">
                    <td colSpan={3} className="py-1 text-[#5C5E62]">
                      Contracted Demand Fixed Charges ({analysis.sanctionedLoadKw} kW
                      {isSanctionedLoadVerified ? "" : " assumed"} · Unavoidable)
                    </td>
                    <td className="py-1 text-right text-[#5C5E62]">
                      ₹{analysis.fixedCharge.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="tabular-nums">
                  <td colSpan={3} className="py-1 text-[#5C5E62]">
                    {analysis.state} State Electricity Duty ({analysis.estimatedUnits} units)
                  </td>
                  <td className="py-1 text-right text-[#5C5E62]">
                    ₹{analysis.electricityDuty.toFixed(2)}
                  </td>
                </tr>
                <tr className="border-t border-[#171A20] tabular-nums font-semibold text-[13px] text-[#171A20]">
                  <td colSpan={3} className="pt-2">
                    Total Estimated DISCOM Bill
                  </td>
                  <td className="pt-2 text-right text-[#171A20]">
                    ₹{analysis.totalComputedBill.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* State-Specific Regulatory Note */}
          <div className="p-3 bg-[#F4F4F4] rounded-[4px] text-[12px] text-[#5C5E62] leading-relaxed flex items-start gap-2">
            {isVerified ? (
              <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#F57C00] shrink-0 mt-0.5" />
            )}
            <div>
              <strong className="text-[#171A20]">
                {isVerified
                  ? `${analysis.state} (${analysis.authority}) Regulatory Note:`
                  : `${analysis.state} Regional Benchmark Note:`}
              </strong>{" "}
              {analysis.regulatoryNote} Unavoidable monthly fixed &amp; customer charges (₹
              {analysis.unavoidableChargesTotal.toFixed(0)}/month) remain payable to {discomCode}{" "}
              even when solar generation offsets 100% of energy consumption.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
