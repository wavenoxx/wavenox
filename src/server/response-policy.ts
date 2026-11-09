const CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; worker-src 'self' blob:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'";

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
  if (
    /^\/(ops|portal|api|_serverFn)(\/|$)/.test(path) ||
    path.startsWith("/order/received") ||
    response.status >= 400
  ) {
    headers.set("cache-control", "private, no-store, max-age=0");
    headers.set("x-robots-tag", "noindex, nofollow");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
