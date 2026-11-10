import { expect, it } from "vitest";
import { protectResponse } from "./response-policy";

it("protects private SSR, server-function and failed API responses without caching them", () => {
  for (const path of [
    "/portal/",
    "/ops",
    "/_serverFn/example",
    "/api/projects",
    "/order/received",
  ]) {
    const response = protectResponse(
      new Response("private", { status: 503 }),
      new Request(`https://example.invalid${path}`),
      true,
    );
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  }
});
it("adds production browser protections without overwriting public cache policy", () => {
  const response = protectResponse(
    new Response("public", { headers: { "cache-control": "public, max-age=60" } }),
    new Request("https://example.invalid/"),
    true,
  );
  expect(response.headers.get("cache-control")).toBe("public, max-age=60");
  expect(response.headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
  expect(response.headers.get("content-security-policy")).toContain("object-src 'none'");
  expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
});
