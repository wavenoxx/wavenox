import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const pathname = new URL(request.url).pathname;
    const isPrivate =
      pathname === "/portal" || pathname === "/ops" || pathname.startsWith("/api/project");
    try {
      if (
        pathname === "/api/projects" ||
        pathname === "/api/project-documents" ||
        pathname.startsWith("/api/project-documents/")
      ) {
        const { handleProjectRequest } = await import("./server/project-runtime");
        return await handleProjectRequest(request);
      }
      if (new URL(request.url).pathname === "/api/bill-extraction") {
        const { handleBillRequest } = await import("./server/bill-http");
        return await handleBillRequest(request);
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      if (isPrivate) {
        const headers = new Headers(response.headers);
        headers.set("cache-control", "private, no-store, max-age=0");
        headers.set("x-robots-tag", "noindex, nofollow");
        return new Response(response.body, { status: response.status, headers });
      }
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      if (!isPrivate) console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: {
          "content-type": "text/html; charset=utf-8",
          ...(isPrivate
            ? { "cache-control": "private, no-store", "x-robots-tag": "noindex, nofollow" }
            : {}),
        },
      });
    }
  },
};
