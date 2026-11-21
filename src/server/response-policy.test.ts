import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { CSP, protectResponse } from "./response-policy";

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

it("streams gzip compression for public 2xx HTML responses when the client accepts gzip", async () => {
  const html = "<!doctype html><html><body><h1>WAVENOX</h1><p>Public showcase</p></body></html>";
  const response = protectResponse(
    new Response(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-length": String(html.length),
      },
    }),
    new Request("https://example.invalid/", {
      headers: { "accept-encoding": "gzip, deflate, br" },
    }),
    true,
  );
  expect(response.headers.get("content-encoding")).toBe("gzip");
  expect(response.headers.get("vary")).toContain("Accept-Encoding");
  expect(response.headers.get("content-length")).toBeNull();
  const decoded = await new Response(
    response.body!.pipeThrough(new DecompressionStream("gzip")),
  ).text();
  expect(decoded).toBe(html);
});

it("never compresses private, no-store, HEAD, disallowed-q, pre-encoded, or non-HTML responses", async () => {
  const cases: Array<{ response: Response; request: Request }> = [
    {
      response: new Response("<html>portal</html>", {
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
      request: new Request("https://example.invalid/portal", {
        headers: { "accept-encoding": "gzip, br" },
      }),
    },
    {
      response: new Response("<html>ops</html>", {
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
      request: new Request("https://example.invalid/ops", {
        headers: { "accept-encoding": "gzip" },
      }),
    },
    {
      response: new Response("<html>no-store</html>", {
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      }),
      request: new Request("https://example.invalid/", {
        headers: { "accept-encoding": "gzip" },
      }),
    },
    {
      response: new Response("<html>head</html>", {
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
      request: new Request("https://example.invalid/", {
        method: "HEAD",
        headers: { "accept-encoding": "gzip" },
      }),
    },
    {
      response: new Response("<html>q0</html>", {
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
      request: new Request("https://example.invalid/", {
        headers: { "accept-encoding": "gzip;q=0, br" },
      }),
    },
    {
      response: new Response("<html>encoded</html>", {
        headers: { "content-type": "text/html; charset=utf-8", "content-encoding": "br" },
      }),
      request: new Request("https://example.invalid/", {
        headers: { "accept-encoding": "gzip, br" },
      }),
    },
    {
      response: new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      }),
      request: new Request("https://example.invalid/", {
        headers: { "accept-encoding": "gzip" },
      }),
    },
  ];

  for (const { response, request } of cases) {
    const out = protectResponse(response, request, true);
    expect(out.headers.get("content-encoding")).not.toBe("gzip");
  }
});

it("allows Pan-India Google Ads, GA4, GTM, Meta Pixel, and Turnstile origins identically in server CSP and _headers", () => {
  for (const origin of [
    "https://challenges.cloudflare.com",
    "https://www.googletagmanager.com",
    "https://www.googleadservices.com",
    "https://googleads.g.doubleclick.net",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://stats.g.doubleclick.net",
    "https://www.google.com",
    "https://connect.facebook.net",
    "https://www.facebook.com",
    "https://bid.g.doubleclick.net",
  ]) {
    expect(CSP).toContain(origin);
  }

  const headersFile = readFileSync(resolve(process.cwd(), "public/_headers"), "utf-8");
  const cspLine = headersFile
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("Content-Security-Policy:"));
  expect(cspLine).toBeDefined();
  const staticCsp = cspLine!.replace(/^Content-Security-Policy:\s*/, "").trim();
  expect(staticCsp).toBe(CSP);
});
