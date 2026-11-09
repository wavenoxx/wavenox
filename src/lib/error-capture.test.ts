import { afterEach, expect, it, vi } from "vitest";
import { describeError } from "./error-capture";

afterEach(() => vi.unstubAllEnvs());
it("omits arbitrary errors, causes, identifiers and secrets from production diagnostics", () => {
  vi.stubEnv("NODE_ENV", "production");
  const secret = "synthetic-private-token-and-customer@example.invalid";
  for (const value of [new Error(secret, { cause: { phone: secret } }), { body: secret }, secret]) {
    expect(describeError(value)).not.toContain(secret);
    expect(describeError(value)).toContain("server_error");
  }
});
