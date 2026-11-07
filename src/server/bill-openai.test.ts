import { afterEach, expect, it, vi } from "vitest";
import { createOpenAIBillProvider, BILL_EXTRACTION_MODEL } from "./bill-openai";
import { normalizeExtraction } from "@/lib/bill-intelligence";
afterEach(() => vi.unstubAllGlobals());
it("uses the official Responses API with private structured output and no tools or stored files", async () => {
  let sent: Record<string, unknown> | undefined;
  const fetcher = vi.fn(async (_url: RequestInfo | URL, options?: RequestInit) => {
    expect(String(_url)).toBe("https://api.openai.com/v1/responses");
    sent = JSON.parse(String(options?.body));
    return Response.json({
      id: "resp_fixture",
      object: "response",
      status: "completed",
      model: BILL_EXTRACTION_MODEL,
      output: [
        {
          id: "msg_fixture",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              annotations: [],
              text: JSON.stringify({
                fields: [
                  {
                    key: "consumption",
                    value: 840,
                    unit: "kWh",
                    quality: "clear",
                    page: 1,
                    region: "readings",
                    issue: "none",
                  },
                ],
              }),
            },
          ],
        },
      ],
    });
  });
  vi.stubGlobal("fetch", fetcher);
  const output = await createOpenAIBillProvider("synthetic-test-key").extract(
    [{ mime: "image/jpeg", data: "syntheticfixture" }],
    new AbortController().signal,
  );
  expect(sent?.store).toBe(false);
  expect(sent?.tools).toBeUndefined();
  expect(sent?.model).toBe(BILL_EXTRACTION_MODEL);
  expect(JSON.stringify(sent?.text)).toContain('"strict":true');
  expect(sent?.instructions).toContain("UNTRUSTED DATA");
  expect(normalizeExtraction(output, 1).fields.find((f) => f.key === "consumption")?.value).toBe(
    840,
  );
  expect(fetcher).toHaveBeenCalledTimes(1);
});
