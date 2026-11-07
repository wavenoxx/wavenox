import { z } from "zod";
import { DISCOMS } from "@/config/solar";

// The existing calculation registry groups these boards under Delhi-NCR.
// Bill evidence uses their actual states; do not alter the engineering region.
// Sources: dhbvn.org.in/web/portal/about-dhbvn; rts.bsesdelhi.com/about-us.
export function billStateForDiscom(discom: { code: string; state: string }): string {
  if (discom.code === "DHBVN") return "Haryana";
  if (discom.code === "BRPL") return "Delhi";
  return discom.state;
}
export const BILL_STATES = [...new Set(DISCOMS.map(billStateForDiscom))];

export const BILL_LIMITS = {
  originalBytes: 10 * 1024 * 1024,
  pages: 3,
  imagePixels: 24_000_000,
  rasterEdge: 1800,
  requestBytes: 3_500_000,
  pageBase64Chars: 1_100_000,
  idleMs: 15 * 60_000,
} as const;
export const BILL_FIELD_KEYS = [
  "state",
  "discom",
  "periodStart",
  "periodEnd",
  "billingMonths",
  "billingDays",
  "consumption",
  "totalPayable",
  "energyCharges",
  "fixedCharges",
  "sanctionedLoad",
  "consumerCategory",
  "connectionType",
] as const;
export type BillFieldKey = (typeof BILL_FIELD_KEYS)[number];
export const FIELD_LABELS: Record<BillFieldKey, string> = {
  state: "State",
  discom: "Electricity board",
  periodStart: "Period start",
  periodEnd: "Period end",
  billingMonths: "Billing months",
  billingDays: "Billing days",
  consumption: "Period consumption",
  totalPayable: "Total payable",
  energyCharges: "Energy charges",
  fixedCharges: "Fixed / customer charges",
  sanctionedLoad: "Sanctioned load",
  consumerCategory: "Consumer category",
  connectionType: "Connection type",
};
export const BILL_ISSUES = {
  none: "",
  unreadable: "Not readable",
  ambiguous: "Ambiguous reading — check the original",
  unit_mismatch: "Unit cannot be used for this field",
  missing: "Not found",
  inconsistent: "Conflicting values — check the original",
  unsupported: "Not in the supported registry",
} as const;
export const extractionFieldSchema = z.object({
  key: z.enum(BILL_FIELD_KEYS),
  value: z.union([z.number().finite(), z.string().max(40)]).nullable(),
  unit: z.enum(["none", "kWh", "kVAh", "kW", "kVA", "HP", "INR", "months", "days", "date"]),
  quality: z.enum(["clear", "uncertain", "missing"]),
  page: z.number().int().min(1).max(BILL_LIMITS.pages).nullable(),
  region: z.enum(["header", "readings", "charges", "connection", "period", "unknown"]),
  issue: z.enum([
    "none",
    "unreadable",
    "ambiguous",
    "unit_mismatch",
    "missing",
    "inconsistent",
    "unsupported",
  ]),
});
export const extractionSchema = z.object({
  fields: z.array(extractionFieldSchema).max(BILL_FIELD_KEYS.length),
});
export type ExtractedBillField = z.infer<typeof extractionFieldSchema> & {
  verification: "unconfirmed";
};
export interface BillExtraction {
  fields: ExtractedBillField[];
}
export function emptyBillFields(): ExtractedBillField[] {
  return BILL_FIELD_KEYS.map((key) => ({
    key,
    value: null,
    unit: "none",
    quality: "missing",
    page: null,
    region: "unknown",
    issue: "missing",
    verification: "unconfirmed",
  }));
}
function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value &&
    Number(value.slice(0, 4)) >= 2000 &&
    Number(value.slice(0, 4)) <= 2100
  );
}
export function normalizeExtraction(raw: unknown, pageCount: number): BillExtraction {
  if (
    !raw ||
    typeof raw !== "object" ||
    !Array.isArray((raw as { fields?: unknown }).fields) ||
    (raw as { fields: unknown[] }).fields.length > BILL_FIELD_KEYS.length
  )
    throw new Error("Invalid extraction envelope.");
  const parsed = extractionSchema.parse(raw);
  const keys = new Set<string>();
  const fields = emptyBillFields();
  for (const field of parsed.fields) {
    if (keys.has(field.key) || (field.page !== null && field.page > pageCount))
      throw new Error("Invalid extraction provenance.");
    keys.add(field.key);
    const numericUnits: Partial<Record<BillFieldKey, string[]>> = {
      consumption: ["kWh"],
      totalPayable: ["INR"],
      energyCharges: ["INR"],
      fixedCharges: ["INR"],
      sanctionedLoad: ["kW", "kVA", "HP"],
      billingMonths: ["months"],
      billingDays: ["days"],
    };
    if (field.value !== null) {
      if (numericUnits[field.key]) {
        if (typeof field.value !== "number" || field.value < 0 || field.value > 1_000_000)
          throw new Error("Invalid reading.");
        if (!numericUnits[field.key]!.includes(field.unit)) {
          field.value = null;
          field.issue = "unit_mismatch";
          field.quality = "missing";
        }
      } else {
        const allowed: Partial<Record<BillFieldKey, string[]>> = {
          state: [...BILL_STATES, "OTHER"],
          discom: [...DISCOMS.map((d) => d.code), "OTHER"],
          consumerCategory: ["residential", "commercial", "other"],
          connectionType: ["single_phase", "three_phase", "other"],
        };
        if (
          typeof field.value !== "string" ||
          (field.key === "periodStart" || field.key === "periodEnd"
            ? !validDate(field.value)
            : !allowed[field.key]?.includes(field.value))
        )
          throw new Error("Unsupported extracted value.");
      }
      if (field.value !== null && (field.page === null || field.quality === "missing")) {
        field.value = null;
        field.quality = "missing";
        field.issue = "missing";
      }
    }
    fields[BILL_FIELD_KEYS.indexOf(field.key)] = { ...field, verification: "unconfirmed" };
  }
  return { fields };
}
export function inspectBillFile(
  mime: string,
  size: number,
  bytes: Uint8Array,
): "image/png" | "image/jpeg" | "application/pdf" {
  if (size <= 0 || size > BILL_LIMITS.originalBytes)
    throw new Error("Choose a non-empty document up to 10 MB.");
  const begins = (signature: number[]) => signature.every((n, i) => bytes[i] === n);
  const detected = begins([137, 80, 78, 71, 13, 10, 26, 10])
    ? "image/png"
    : begins([255, 216, 255])
      ? "image/jpeg"
      : begins([37, 80, 68, 70, 45])
        ? "application/pdf"
        : null;
  if (!detected || (mime && mime !== detected))
    throw new Error("Choose a valid JPEG, PNG or PDF. The file type and contents must match.");
  return detected;
}
const reviewSchema = z.object({
  discomCode: z.string().min(1).max(60),
  state: z.string().max(40),
  periodMode: z.enum(["months", "days"]),
  periodLength: z.number().finite().int().min(1).max(366),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  consumptionKwh: z.number().finite().min(0).max(300_000).optional(),
  totalPayableInr: z.number().finite().min(0).max(2_400_000),
  loadValue: z.number().finite().positive().max(500).optional(),
  loadUnit: z.enum(["kW", "kVA", "HP"]),
  consumerCategory: z.enum(["residential", "commercial", "other"]),
  confirmed: z.literal(true),
});
export interface BillReviewInput {
  discomCode: string;
  state: string;
  periodMode: "months" | "days";
  periodLength: number;
  periodStart?: string;
  periodEnd?: string;
  consumptionKwh?: number;
  totalPayableInr: number;
  loadValue?: number;
  loadUnit: "kW" | "kVA" | "HP";
  consumerCategory: string;
  confirmed: boolean;
}
export interface ConfirmedBillInputs {
  discomCode: string;
  monthlyBillInr: number;
  monthlyUnitsOverride?: number;
  sanctionedLoadKw?: number;
  sanctionedLoadConfirmed: boolean;
  basis: string;
}
export function confirmBillReview(raw: BillReviewInput): ConfirmedBillInputs {
  const data = reviewSchema.safeParse(raw);
  if (!data.success)
    throw new Error(
      "Review the bill amount, consumption, period and confirmation. Use finite, non-negative values.",
    );
  const v = data.data;
  if (v.consumerCategory !== "residential")
    throw new Error(
      "This Design Studio uses residential tariffs. Request a professional commercial assessment.",
    );
  if (v.periodMode === "months" && v.periodLength > 12)
    throw new Error("Use 1–12 whole billing months, or enter the actual number of days.");
  const discom = DISCOMS.find((d) => d.code === v.discomCode);
  if (discom && v.state !== billStateForDiscom(discom))
    throw new Error("The state and electricity board do not match. Confirm both from your bill.");
  const start = v.periodStart?.trim();
  const end = v.periodEnd?.trim();
  if (start || end) {
    if (!start || !end || !validDate(start) || !validDate(end) || end < start)
      throw new Error(
        "Enter valid start and end dates, or clear both and confirm the printed billing duration.",
      );
    const days = (Date.parse(end) - Date.parse(start)) / 86400000 + 1;
    if (v.periodMode === "days" && days !== v.periodLength)
      throw new Error("The day count must match the dates (both dates included).");
    if (v.periodMode === "months") {
      const next = new Date(start);
      next.setUTCMonth(next.getUTCMonth() + v.periodLength);
      next.setUTCDate(next.getUTCDate() - 1);
      if (next.toISOString().slice(0, 10) !== end)
        throw new Error(
          "These dates do not span the selected whole months. Use the actual days or correct the dates.",
        );
    }
  }
  const divisor = v.periodMode === "months" ? v.periodLength : v.periodLength / (365.25 / 12);
  const monthlyBillInr = Math.round(v.totalPayableInr / divisor);
  const monthlyUnitsOverride =
    v.consumptionKwh === undefined
      ? undefined
      : Math.round((v.consumptionKwh / divisor) * 100) / 100;
  if (
    monthlyBillInr > 200_000 ||
    (monthlyUnitsOverride !== undefined && monthlyUnitsOverride > 25_000)
  )
    throw new Error("These readings exceed the residential planning range. Request an assessment.");
  return {
    discomCode: discom?.code ?? "UNSUPPORTED",
    monthlyBillInr,
    monthlyUnitsOverride,
    sanctionedLoadKw: v.loadUnit === "kW" ? v.loadValue : undefined,
    sanctionedLoadConfirmed: v.loadUnit === "kW" && v.loadValue !== undefined,
    basis:
      v.periodMode === "months"
        ? `Customer confirmed ${v.periodLength} billing month(s); period values divided by ${v.periodLength}.`
        : `Customer confirmed ${v.periodLength} days; normalized to a 30.4375-day planning month (365.25/12), not an actual future bill.`,
  };
}

/** Header-only bounds check before browser image decoding; full decoding still validates corruption. */
export function inspectImageDimensions(
  bytes: Uint8Array,
  mime: "image/png" | "image/jpeg",
): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let width = 0;
  let height = 0;
  if (mime === "image/png" && bytes.length >= 24) {
    width = view.getUint32(16);
    height = view.getUint32(20);
  } else if (mime === "image/jpeg") {
    let offset = 2;
    while (offset + 4 < bytes.length) {
      if (bytes[offset] !== 255) throw new Error("Invalid image header.");
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) break;
      const size = view.getUint16(offset);
      if (size < 2 || offset + size > bytes.length) break;
      if (
        [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(
          marker,
        ) &&
        size >= 7
      ) {
        height = view.getUint16(offset + 3);
        width = view.getUint16(offset + 5);
        break;
      }
      offset += size;
    }
  }
  if (!width || !height || width * height > BILL_LIMITS.imagePixels)
    throw new Error("Image dimensions are missing or exceed 24 megapixels.");
  return { width, height };
}
