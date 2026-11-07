import { createBillHandler } from "./bill-extraction";
import { createOpenAIBillProvider } from "./bill-openai";

// Opt-in independently from LIVE/DEMO lead mode. A key alone never enables document transfer.
const enabled = process.env.BILL_AI_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY);
export const handleBillRequest = createBillHandler({
  enabled,
  provider: enabled ? createOpenAIBillProvider(process.env.OPENAI_API_KEY!) : null,
});
