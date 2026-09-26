import * as React from "react";
import { ChevronDown, ChevronUp, FileText, CheckCircle2 } from "lucide-react";
import { decodeBill, type DetailedBillAnalysis } from "@/config/regulatory";

export interface BillDecoderProps {
  monthlyBill: number;
  discomCode?: string;
  sanctionedLoadKw?: number;
  onBillChange?: (bill: number) => void;
  className?: string;
  defaultExpanded?: boolean;
}

export function BillDecoder({
  monthlyBill,
  discomCode = "TGSPDCL",
  sanctionedLoadKw = 5,
  onBillChange,
  className = "",
  defaultExpanded = false,
}: BillDecoderProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const analysis: DetailedBillAnalysis = React.useMemo(() => {
    return decodeBill(discomCode, monthlyBill, sanctionedLoadKw);
  }, [discomCode, monthlyBill, sanctionedLoadKw]);

  return (
    <div
      className={`rounded-[8px] border border-[#E3E4E6] bg-[#FFFFFF] overflow-hidden shadow-xs ${className}`}
    >
      {/* Header Summary */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4F4F4]/50">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F57C00] bg-[#F57C00]/10 px-2 py-0.5 rounded-[3px]">
              TGERC Sourced Tariff Breakdown
            </span>
            <span className="text-[12px] text-[#5C5E62] font-mono">{analysis.category}</span>
          </div>
          <div className="text-[16px] sm:text-[18px] font-medium text-[#171A20] leading-snug">
            Your ₹{monthlyBill.toLocaleString("en-IN")} {discomCode} bill ≈{" "}
            <span className="font-semibold text-[#171A20] tabular-nums">
              {analysis.estimatedUnits.toLocaleString("en-IN")} units/month
            </span>
          </div>
          <div className="text-[12px] text-[#5C5E62] mt-0.5">
            Average effective tariff: ₹{analysis.averageRatePerKwh.toFixed(2)} / kWh · Connected
            load: {sanctionedLoadKw} kW
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[#E3E4E6] bg-[#FFFFFF] text-[12px] font-medium text-[#171A20] hover:bg-[#F4F4F4] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#171A20]"
        >
          <FileText className="w-3.5 h-3.5 text-[#5C5E62]" />
          <span>{isExpanded ? "Hide Slabs" : "View Slabs & Charges"}</span>
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
                  <th className="pb-2 font-medium">Telescopic Slab</th>
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
                    Energy Charges Subtotal
                  </td>
                  <td className="pt-2 text-right font-semibold text-[#171A20]">
                    ₹{analysis.energyChargesTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="tabular-nums">
                  <td colSpan={3} className="py-1 text-[#5C5E62]">
                    Monthly Customer Charge (TGERC Schedule)
                  </td>
                  <td className="py-1 text-right text-[#5C5E62]">
                    ₹{analysis.customerCharge.toFixed(2)}
                  </td>
                </tr>
                {analysis.fixedCharge > 0 && (
                  <tr className="tabular-nums">
                    <td colSpan={3} className="py-1 text-[#5C5E62]">
                      Contracted Demand Fixed Charges ({sanctionedLoadKw} kW @ ₹10/kW)
                    </td>
                    <td className="py-1 text-right text-[#5C5E62]">
                      ₹{analysis.fixedCharge.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="tabular-nums">
                  <td colSpan={3} className="py-1 text-[#5C5E62]">
                    Telangana State Electricity Duty ({analysis.estimatedUnits} units @ ₹0.06/unit)
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

          {/* Statutory Scheme Note */}
          <div className="p-3 bg-[#F4F4F4] rounded-[4px] text-[11px] sm:text-[12px] text-[#5C5E62] leading-relaxed flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#F57C00] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#171A20]">Telangana Gruha Jyothi Note:</strong> Domestic
              households consuming ≤ 200 units with an active White Ration Card / Food Security Card
              receive zero-electricity bills. When consumption exceeds 200 units, the consumer is
              billed under standard telescopic LT-I(C) rates shown above.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
