import * as React from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { DISCOMS } from "@/config/solar";
import {
  BILL_LIMITS,
  BILL_STATES,
  billStateForDiscom,
  BILL_ISSUES,
  FIELD_LABELS,
  confirmBillReview,
  emptyBillFields,
  normalizeExtraction,
  type BillFieldKey,
  type ConfirmedBillInputs,
  type ExtractedBillField,
} from "@/lib/bill-intelligence";
import type { BillPage, Redaction } from "@/lib/bill-document";

const BillPagePreview = React.lazy(() =>
  import("./BillPagePreview").then((m) => ({ default: m.BillPagePreview })),
);
const inputStyle =
  "w-full min-h-11 px-3 border border-[#D1D5DB] rounded bg-white text-sm text-[#171A20] focus:outline-none focus:ring-2 focus:ring-[#171A20]";
const buttonStyle =
  "min-h-11 px-4 rounded bg-[#171A20] text-white text-sm font-medium disabled:opacity-50";
const blankValues = () =>
  Object.fromEntries(emptyBillFields().map((f) => [f.key, ""])) as Record<BillFieldKey, string>;
export function BillIntelligence({
  onConfirm,
}: {
  onConfirm: (input: ConfirmedBillInputs) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [available, setAvailable] = React.useState(false);
  const [pages, setPages] = React.useState<BillPage[]>([]);
  const [marks, setMarks] = React.useState<Redaction[][]>([]);
  const [fields, setFields] = React.useState<ExtractedBillField[]>(emptyBillFields);
  const [values, setValues] = React.useState(blankValues);
  const [periodMode, setPeriodMode] = React.useState<"months" | "days">("months");
  const [periodLength, setPeriodLength] = React.useState("");
  const [loadUnit, setLoadUnit] = React.useState<"kW" | "kVA" | "HP">("kW");
  const [busy, setBusy] = React.useState<"preparing" | "extracting" | null>(null);
  const [consent, setConsent] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [error, setError] = React.useState("");
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [extractionComplete, setExtractionComplete] = React.useState(false);
  const [changed, setChanged] = React.useState<Set<BillFieldKey>>(new Set());
  const controller = React.useRef<AbortController | null>(null);
  const version = React.useRef(0);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const clear = React.useCallback(() => {
    version.current++;
    controller.current?.abort();
    controller.current = null;
    setExtractionComplete(false);
    setPages([]);
    setMarks([]);
    setFields(emptyBillFields());
    setValues(blankValues());
    setChanged(new Set());
    setPeriodLength("");
    setPeriodMode("months");
    setLoadUnit("kW");
    setBusy(null);
    setConsent(false);
    setConfirmed(false);
    setError("");
    setWarnings([]);
    if (fileInput.current) fileInput.current.value = "";
  }, []);
  React.useEffect(
    () => () => {
      version.current++;
      controller.current?.abort();
    },
    [],
  );
  React.useEffect(() => {
    if (!open) return;
    const abort = new AbortController();
    void fetch("/api/bill-extraction", { cache: "no-store", signal: abort.signal })
      .then((r) => r.json())
      .then((r: { available?: boolean }) => setAvailable(r.available === true))
      .catch(() => setAvailable(false));
    return () => abort.abort();
  }, [open]);
  React.useEffect(() => {
    if (!pages.length) return;
    const timer = setTimeout(() => {
      clear();
      setNotice(
        "Document and draft readings cleared after 15 minutes. Reopen the file or use manual entry.",
      );
    }, BILL_LIMITS.idleMs);
    return () => clearTimeout(timer);
  }, [pages, clear]);
  function edit(key: BillFieldKey, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setChanged((s) => new Set(s).add(key));
    setConfirmed(false);
    setError("");
  }
  async function chooseFile(file?: File) {
    if (!file) return;
    clear();
    setNotice("");
    setBusy("preparing");
    const current = version.current;
    const abort = new AbortController();
    controller.current = abort;
    try {
      const { prepareBillDocument } = await import("@/lib/bill-document");
      const prepared = await prepareBillDocument(file, abort.signal);
      if (current !== version.current) return;
      setPages(prepared.pages);
      setMarks(prepared.pages.map(() => []));
      setWarnings(prepared.warnings);
    } catch {
      if (current === version.current)
        setError(
          "The file could not be opened safely. Use a clear JPEG/PNG up to 10 MB, or a plain, unencrypted PDF with at most 3 pages. You can enter readings manually.",
        );
    } finally {
      if (current === version.current) setBusy(null);
    }
  }
  async function extract() {
    if (!consent || !pages.length || busy) return;
    const current = ++version.current;
    const abort = new AbortController();
    controller.current = abort;
    setBusy("extracting");
    setError("");
    setNotice("");
    setConfirmed(false);
    try {
      const { redactBillPage } = await import("@/lib/bill-document");
      const data = await Promise.all(
        pages.map(async (p, i) => ({
          mime: "image/jpeg",
          data: await redactBillPage(p, marks[i] ?? []),
        })),
      );
      abort.signal.throwIfAborted();
      const response = await fetch("/api/bill-extraction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consent: true, pages: data }),
        signal: abort.signal,
      });
      if (!response.ok) throw new Error("unavailable");
      const raw: { extraction?: unknown } = await response.json();
      const result = normalizeExtraction(raw.extraction, pages.length);
      if (current !== version.current) return;
      setFields(result.fields);
      setExtractionComplete(true);
      // Explicit extraction replaces this review draft only, never the live Studio values.
      const next = blankValues();
      for (const field of result.fields)
        next[field.key] = field.value === null ? "" : String(field.value);
      setValues(next);
      setChanged(new Set());
      const load = result.fields.find((f) => f.key === "sanctionedLoad");
      if (load && ["kW", "kVA", "HP"].includes(load.unit))
        setLoadUnit(load.unit as "kW" | "kVA" | "HP");
      if (next.billingMonths) {
        setPeriodMode("months");
        setPeriodLength(next.billingMonths);
      } else if (next.billingDays) {
        setPeriodMode("days");
        setPeriodLength(next.billingDays);
      } else setPeriodLength("");
      setNotice(
        "Readings extracted by OpenAI. They are unconfirmed. Check the period, units and every value before applying.",
      );
    } catch {
      if (current === version.current)
        setError(
          "Extraction is unavailable or the bill could not be read reliably. Your Studio is unchanged. Enter or correct the readings below.",
        );
    } finally {
      if (current === version.current) setBusy(null);
    }
  }
  function apply() {
    try {
      const result = confirmBillReview({
        discomCode: values.discom,
        state: values.state,
        periodMode,
        periodLength: Number(periodLength),
        periodStart: values.periodStart,
        periodEnd: values.periodEnd,
        consumptionKwh: values.consumption.trim() ? Number(values.consumption) : undefined,
        totalPayableInr: values.totalPayable.trim() ? Number(values.totalPayable) : NaN,
        loadValue: values.sanctionedLoad.trim() ? Number(values.sanctionedLoad) : undefined,
        loadUnit,
        consumerCategory: values.consumerCategory,
        confirmed,
      });
      onConfirm(result);
      clear();
      setNotice(
        "Confirmed readings applied. Document and review draft cleared. Your panel, battery and roof choices are preserved.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check your readings.");
    }
  }
  const provenance = (key: BillFieldKey) => {
    if (changed.has(key)) return "Customer edited — awaiting confirmation";
    const f = fields.find((f) => f.key === key)!;
    return f.value === null
      ? "Not found — enter manually if known"
      : `${f.quality === "clear" ? "Clear reading" : "Uncertain reading"} · page ${f.page}, ${f.region} · unconfirmed${f.issue !== "none" ? ` · ${BILL_ISSUES[f.issue]}` : ""}`;
  };
  function field(key: BillFieldKey, type = "number") {
    return (
      <label className="block space-y-1" key={key}>
        <span className="text-sm font-medium">
          {FIELD_LABELS[key]}
          {key === "consumption"
            ? " (kWh for whole period)"
            : ["totalPayable", "energyCharges", "fixedCharges"].includes(key)
              ? " (₹ for whole period)"
              : ""}
        </span>
        <input
          className={inputStyle}
          type={type}
          min={type === "number" ? 0 : undefined}
          step={type === "number" ? "any" : undefined}
          value={values[key]}
          onChange={(e) => edit(key, e.target.value)}
        />
        <span className="block text-xs text-[#5C5E62]">{provenance(key)}</span>
      </label>
    );
  }
  return (
    <section
      className="rounded-lg border border-[#E3E4E6] bg-[#F8F8FA]"
      aria-label="Bill intelligence"
    >
      <button
        type="button"
        className="w-full min-h-14 p-4 flex items-center gap-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <FileText className="w-5 h-5 shrink-0" />
        <span>
          <span className="block text-base font-medium">Read your electricity bill</span>
          <span className="block text-xs text-[#5C5E62]">
            Upload privately, review the readings, then apply them.
          </span>
        </span>
      </button>
      {open && (
        <div className="p-4 pt-0 space-y-5">
          <p className="text-sm text-[#5C5E62]">
            Manual entry is always available below. Nothing changes your recommendation until you
            confirm.
          </p>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Choose bill document</span>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf"
              className="block w-full text-sm file:min-h-11 file:mr-3 file:px-3 file:border-0 file:rounded file:bg-[#EEEEEE]"
              disabled={busy !== null}
              onChange={(e) => void chooseFile(e.target.files?.[0])}
            />
            <span className="block text-xs text-[#5C5E62]">
              JPEG / PNG / PDF · up to 10 MB · up to 3 pages · images up to 24 megapixels. Originals
              stay in this browser.
            </span>
          </label>
          {busy && (
            <p role="status" className="flex items-center gap-2 text-sm">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {busy === "preparing" ? "Preparing private preview…" : "Reading the redacted pages…"}
            </p>
          )}
          {warnings.map((w) => (
            <p className="text-xs text-[#92400E]" key={w}>
              {w}
            </p>
          ))}
          {pages.map((p, i) => (
            <React.Suspense
              key={`${i}-${extractionComplete}`}
              fallback={<p role="status">Loading page preview…</p>}
            >
              <BillPagePreview
                page={p}
                disabled={busy !== null}
                index={i}
                marks={marks[i] ?? []}
                onChange={(m) => {
                  setMarks((old) => old.map((v, j) => (j === i ? m : v)));
                  setConsent(false);
                }}
              />
            </React.Suspense>
          ))}
          {pages.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[#5C5E62]">
                Review and hide identifiers before processing. Documents and draft readings remain
                in memory for up to 15 minutes. Clear removes this browser copy. Cancellation stops
                waiting but cannot recall data already received by a provider.
              </p>
              {available ? (
                <>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={consent}
                      disabled={busy !== null}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    <span>
                      I have reviewed the redactions and consent to sending these pages to OpenAI
                      for bill extraction. OpenAI may retain abuse-monitoring data for up to 30
                      days, subject to its policy and exceptions.{" "}
                      <a
                        className="underline"
                        href="https://developers.openai.com/api/docs/guides/your-data"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Provider data policy
                      </a>
                    </span>
                  </label>
                  <button
                    type="button"
                    className={buttonStyle}
                    disabled={!consent || busy !== null}
                    onClick={() => void extract()}
                  >
                    Extract readings with OpenAI
                  </button>
                </>
              ) : (
                <p role="status" className="text-sm">
                  AI extraction is not enabled here. Use the private preview and enter your readings
                  below.
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            className="min-h-11 px-3 text-sm underline"
            onClick={() => {
              clear();
              setNotice(
                "Document, processing and draft readings cleared. Studio values are unchanged.",
              );
            }}
          >
            Clear / cancel
          </button>
          {notice && (
            <p role="status" className="text-sm text-[#393C41]">
              {notice}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-[#B42318]">
              {error}
            </p>
          )}
          <fieldset
            disabled={busy !== null}
            className="min-w-0 space-y-4 border-t border-[#E3E4E6] pt-4"
            aria-label="Review bill readings"
          >
            <h3 className="text-base font-medium">Review bill readings</h3>
            <p className="text-xs text-[#5C5E62]">
              Reading quality is a qualitative AI assessment, not a calibrated probability. Missing
              values are never invented. This Studio applies residential tariffs; other categories
              need a professional assessment.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-sm font-medium">State on bill</span>
                <select
                  className={inputStyle}
                  value={values.state}
                  onChange={(e) => edit("state", e.target.value)}
                >
                  <option value="">Select state</option>
                  {BILL_STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                  <option value="OTHER">Other / unsupported</option>
                </select>
                <span className="block text-xs text-[#5C5E62]">{provenance("state")}</span>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Electricity board on bill</span>
                <select
                  className={inputStyle}
                  value={values.discom}
                  onChange={(e) => edit("discom", e.target.value)}
                >
                  <option value="">Select board</option>
                  {DISCOMS.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.code} · {billStateForDiscom(d)}
                    </option>
                  ))}
                  <option value="OTHER">Other / unsupported</option>
                </select>
                <span className="block text-xs text-[#5C5E62]">{provenance("discom")}</span>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Consumer category</span>
                <select
                  className={inputStyle}
                  value={values.consumerCategory}
                  onChange={(e) => edit("consumerCategory", e.target.value)}
                >
                  <option value="">Confirm category</option>
                  <option value="residential">Residential / domestic</option>
                  <option value="commercial">Commercial</option>
                  <option value="other">Other / unknown</option>
                </select>
                <span className="block text-xs text-[#5C5E62]">
                  {provenance("consumerCategory")}
                </span>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Connection type (optional)</span>
                <select
                  className={inputStyle}
                  value={values.connectionType}
                  onChange={(e) => edit("connectionType", e.target.value)}
                >
                  <option value="">Unknown</option>
                  <option value="single_phase">Single phase</option>
                  <option value="three_phase">Three phase</option>
                  <option value="other">Other</option>
                </select>
                <span className="block text-xs text-[#5C5E62]">{provenance("connectionType")}</span>
              </label>
              {field("periodStart", "date")}
              {field("periodEnd", "date")}
              <label className="space-y-1">
                <span className="text-sm font-medium">Billing duration unit</span>
                <select
                  className={inputStyle}
                  value={periodMode}
                  onChange={(e) => {
                    setPeriodMode(e.target.value as "months" | "days");
                    setError("");
                    setConfirmed(false);
                  }}
                >
                  <option value="months">Whole billing months</option>
                  <option value="days">Actual billing days</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium">Number of {periodMode}</span>
                <input
                  className={inputStyle}
                  type="number"
                  min={1}
                  max={periodMode === "months" ? 12 : 366}
                  value={periodLength}
                  onChange={(e) => {
                    setPeriodLength(e.target.value);
                    setError("");
                    setConfirmed(false);
                  }}
                />
                <span className="block text-xs text-[#5C5E62]">
                  {provenance(periodMode === "months" ? "billingMonths" : "billingDays")}
                </span>
              </label>
              {field("consumption")}
              {field("totalPayable")}
              {field("sanctionedLoad")}
              <label className="space-y-1">
                <span className="text-sm font-medium">Sanctioned load unit</span>
                <select
                  className={inputStyle}
                  value={loadUnit}
                  onChange={(e) => {
                    setLoadUnit(e.target.value as "kW" | "kVA" | "HP");
                    setError("");
                    setConfirmed(false);
                  }}
                >
                  <option>kW</option>
                  <option>kVA</option>
                  <option>HP</option>
                </select>
              </label>
            </div>
            <details className="text-sm">
              <summary className="min-h-11 py-3 cursor-pointer">Optional charge breakdown</summary>
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {field("energyCharges")}
                {field("fixedCharges")}
              </div>
              <p className="text-xs text-[#5C5E62] mt-2">
                For your review only; these do not replace the regional tariff engine.
              </p>
            </details>
            <p className="text-xs text-[#5C5E62]">
              Dates, if provided, include both endpoints. Confirm the actual period; a two-month
              bill is divided by two. Day-based periods use a disclosed 365.25/12-day planning
              month. kWh takes priority over the total payable, which may include arrears or
              credits. kVA/HP is not converted to kW.
            </p>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={confirmed}
                disabled={busy !== null}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <span>
                I checked the state, board, category, billing period, units and readings against my
                bill. Apply these values to my recommendation.
              </span>
            </label>
            <button
              type="button"
              className={buttonStyle + " w-full"}
              disabled={!confirmed || busy !== null}
              onClick={apply}
            >
              Confirm and apply bill readings
            </button>
          </fieldset>
        </div>
      )}
    </section>
  );
}
