export const CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://connect.facebook.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com https://www.facebook.com; frame-src https://challenges.cloudflare.com https://www.googletagmanager.com https://bid.g.doubleclick.net; worker-src 'self' blob:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'";

/** Return true if the request advertises gzip encoding with non-zero weight. */
function acceptsGzip(request: Request): boolean {
  const header = request.headers.get("accept-encoding");
  if (!header) return false;
  for (const part of header.split(",")) {
    const [encodingRaw, ...params] = part.split(";").map((s) => s.trim().toLowerCase());
    if (encodingRaw !== "gzip") continue;
    const qParam = params.find((p) => p.startsWith("q="));
    if (!qParam) return true;
    const q = Number.parseFloat(qParam.slice(2));
    return Number.isFinite(q) && q > 0;
  }
  return false;
}

/** Merge a header token into Vary without duplicating existing values or altering '*'. */
function appendVary(headers: Headers, token: string): void {
  const current = headers.get("vary");
  if (!current) {
    headers.set("vary", token);
    return;
  }
  const tokens = current
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (tokens.includes("*")) return;
  const target = token.toLowerCase();
  if (!tokens.some((t) => t.toLowerCase() === target)) {
    headers.set("vary", `${current}, ${token}`);
  }
}

export function protectResponse(
  response: Response,
  request: Request,
  production = process.env.NODE_ENV === "production",
): Response {
  const headers = new Headers(response.headers);
  const path = new URL(request.url).pathname;
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "DENY");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  if (production) headers.set("content-security-policy", CSP);
  const isPrivateOrError =
    /^\/(ops|portal|api|_serverFn)(\/|$)/.test(path) ||
    path.startsWith("/order/received") ||
    response.status >= 400;
  if (isPrivateOrError) {
    headers.set("cache-control", "private, no-store, max-age=0");
    headers.set("x-robots-tag", "noindex, nofollow");
  }

  const contentType = headers.get("content-type") ?? "";
  const isNoStore = /\bno-store\b/i.test(headers.get("cache-control") ?? "");
  const shouldCompressHtml =
    !isPrivateOrError &&
    !isNoStore &&
    request.method !== "HEAD" &&
    response.status >= 200 &&
    response.status < 300 &&
    response.status !== 204 &&
    response.body !== null &&
    /^text\/html\b/i.test(contentType) &&
    !headers.has("content-encoding") &&
    acceptsGzip(request) &&
    typeof CompressionStream === "function";

  if (shouldCompressHtml && response.body) {
    headers.set("content-encoding", "gzip");
    headers.delete("content-length");
    appendVary(headers, "Accept-Encoding");
    return new Response(response.body.pipeThrough(new CompressionStream("gzip")), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
