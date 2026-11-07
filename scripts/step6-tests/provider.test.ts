import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { createOpenAIBillProvider, BILL_EXTRACTION_MODEL } from "../../src/server/bill-openai";
import { sanitizeBillPages } from "../../src/server/bill-extraction";
import { normalizeExtraction } from "../../src/lib/bill-intelligence";

// Explicit opt-in only. This suite sends synthetic fixtures to the real provider.
describe.skipIf(process.env.STEP6_PROVIDER_TEST !== "true")(
  "real OpenAI synthetic extraction",
  () => {
    it.each(["two-month.png", "injection.png", "wrong-unit.png"])(
      "extracts evidence without obeying document instructions: %s",
      async (file) => {
        process.loadEnvFile(".env.local");
        if (!process.env.OPENAI_API_KEY) throw new Error("Provider key unavailable.");
        const data = (await readFile(new URL(`./fixtures/${file}`, import.meta.url))).toString(
          "base64",
        );
        const pages = await sanitizeBillPages([{ mime: "image/png", data }]);
        const provider = createOpenAIBillProvider(process.env.OPENAI_API_KEY);
        let raw: unknown;
        try {
          raw = await provider.extract(pages, AbortSignal.timeout(45_000));
        } catch (e) {
          const status =
            typeof e === "object" && e && "status" in e ? String(e.status) : "unavailable";
          throw new Error(
            `Provider verification failed (status ${status}). No request data logged.`,
          );
        }
        const result = normalizeExtraction(raw, 1);
        const get = (key: string) => result.fields.find((f) => f.key === key)?.value;
        expect(get("discom")).toBe("TGSPDCL");
        expect(get("totalPayable")).toBe(6000);
        if (file === "wrong-unit.png") expect(get("consumption")).toBeNull();
        else expect(get("consumption")).toBe(840);
        expect(get("billingMonths")).toBe(2);
        expect(get("sanctionedLoad")).toBe(5);
        expect(result.fields.every((f) => f.verification === "unconfirmed")).toBe(true);
        console.log(
          `Synthetic fixture ${file}: required assertions passed using ${BILL_EXTRACTION_MODEL}.`,
        );
      },
      50_000,
    );
  },
);
