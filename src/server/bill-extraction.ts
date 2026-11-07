import sharp from "sharp";
import { z } from "zod";
import {
  BILL_LIMITS,
  normalizeExtraction,
  inspectBillFile,
  inspectImageDimensions,
} from "@/lib/bill-intelligence";

export interface BillRasterPage {
  mime: "image/jpeg" | "image/png";
  data: string;
}
export interface BillExtractionProvider {
  extract(pages: BillRasterPage[], signal: AbortSignal): Promise<unknown>;
}
const pagesSchema = z
  .array(
    z
      .object({
        mime: z.enum(["image/jpeg", "image/png"]),
        data: z
          .string()
          .min(4)
          .max(BILL_LIMITS.pageBase64Chars)
          .regex(/^[A-Za-z0-9+/]+={0,2}$/),
      })
      .strict(),
  )
  .min(1)
  .max(BILL_LIMITS.pages);
const requestSchema = z.object({ consent: z.literal(true), pages: pagesSchema }).strict();
class IntakeError extends Error {
  constructor(readonly status: number) {
    super("Invalid bill intake.");
  }
}

export async function sanitizeBillPages(input: unknown): Promise<BillRasterPage[]> {
  if (!Array.isArray(input) || input.length < 1 || input.length > BILL_LIMITS.pages)
    throw new IntakeError(400);
  const pages = pagesSchema.parse(input);
  const clean: BillRasterPage[] = [];
  for (const page of pages) {
    const buffer = Buffer.from(page.data, "base64");
    inspectBillFile(page.mime, buffer.length, buffer);
    inspectImageDimensions(buffer, page.mime);
    const metadata = await sharp(buffer, {
      limitInputPixels: BILL_LIMITS.imagePixels,
      failOn: "warning",
    }).metadata();
    if (
      (metadata.format !== "jpeg" && metadata.format !== "png") ||
      `image/${metadata.format}` !== page.mime ||
      !metadata.width ||
      !metadata.height ||
      (metadata.pages ?? 1) !== 1
    )
      throw new IntakeError(400);
    // Decode fully and strip all metadata. The provider never receives caller filenames or URLs.
    const safe = await sharp(buffer, {
      limitInputPixels: BILL_LIMITS.imagePixels,
      failOn: "warning",
    })
      .rotate()
      .resize({
        width: BILL_LIMITS.rasterEdge,
        height: BILL_LIMITS.rasterEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "white" })
      .jpeg({ quality: 88 })
      .timeout({ seconds: 5 })
      .toBuffer();
    clean.push({ mime: "image/jpeg", data: safe.toString("base64") });
  }
  return clean;
}
async function boundedJson(request: Request, signal: AbortSignal): Promise<unknown> {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > BILL_LIMITS.requestBytes))
    throw new IntakeError(413);
  const reader = request.body?.getReader();
  if (!reader) throw new IntakeError(400);
  const cancel = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener("abort", cancel, { once: true });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      signal.throwIfAborted();
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > BILL_LIMITS.requestBytes) {
        cancel();
        throw new IntakeError(413);
      }
      chunks.push(next.value);
    }
    signal.throwIfAborted();
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } finally {
    signal.removeEventListener("abort", cancel);
    reader.releaseLock();
  }
}
const respond = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });
export function createBillHandler(options: {
  enabled: boolean;
  provider: BillExtractionProvider | null;
  maxRequests?: number;
}) {
  let started = Date.now();
  let requests = 0;
  let active = 0;
  return async (request: Request): Promise<Response> => {
    const available = options.enabled && options.provider !== null;
    if (request.method === "GET")
      return respond({
        available,
        provider: available ? "OpenAI" : null,
        maxPages: BILL_LIMITS.pages,
      });
    if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);
    if (request.signal.aborted) return respond({ error: "Processing cancelled." }, 499);
    if (
      request.headers.get("origin") !== new URL(request.url).origin ||
      request.headers.get("sec-fetch-site") === "cross-site"
    )
      return respond({ error: "Open the bill reader on this site to continue." }, 403);
    if (!available)
      return respond(
        { error: "Bill extraction is unavailable. Enter the readings manually." },
        503,
      );
    if (request.headers.get("content-type")?.split(";")[0] !== "application/json")
      return respond({ error: "Unsupported upload format." }, 415);
    if (Date.now() - started > 3_600_000) {
      requests = 0;
      started = Date.now();
    }
    if (requests >= (options.maxRequests ?? 20) || active >= 2)
      return respond(
        { error: "The bill reader is busy. Please use manual entry or try later." },
        429,
      );
    requests++;
    active++;
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(45_000)]);
    try {
      let raw: unknown;
      try {
        raw = await boundedJson(request, signal);
      } catch (error) {
        if (error instanceof IntakeError) throw error;
        if (signal.aborted) throw error;
        throw new IntakeError(400);
      }
      if (
        !raw ||
        typeof raw !== "object" ||
        !Array.isArray((raw as { pages?: unknown }).pages) ||
        (raw as { pages: unknown[] }).pages.length > BILL_LIMITS.pages
      )
        throw new IntakeError(400);
      const parsed = requestSchema.safeParse(raw);
      if (!parsed.success) throw new IntakeError(400);
      let pages: BillRasterPage[];
      try {
        pages = await sanitizeBillPages(parsed.data.pages);
      } catch {
        throw new IntakeError(400);
      }
      signal.throwIfAborted();
      const extracted = await options.provider!.extract(pages, signal);
      signal.throwIfAborted();
      return respond({
        provider: "OpenAI",
        extraction: normalizeExtraction(extracted, pages.length),
      });
    } catch (error) {
      // Never log upstream errors, validation payloads, documents, identifiers or credentials.
      if (signal.aborted)
        return respond(
          { error: "Processing stopped. You can enter the readings manually." },
          request.signal.aborted ? 499 : 504,
        );
      if (error instanceof IntakeError)
        return respond(
          {
            error:
              error.status === 413
                ? "Prepared pages exceed the upload limit. Reduce their size or use manual entry."
                : "The document could not be validated. Choose a clear image or use manual entry.",
          },
          error.status,
        );
      return respond(
        { error: "The provider could not read this bill reliably. Enter the readings manually." },
        502,
      );
    } finally {
      active--;
    }
  };
}
