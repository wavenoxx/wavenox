import * as React from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        },
      ) => string;
      remove?: (widgetId: string) => void;
      reset?: (widgetId: string) => void;
    };
  }
}

export interface TurnstileWidgetProps {
  onToken: (token: string | undefined) => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const TURNSTILE_SCRIPT_ID = "wnx-turnstile-script";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve();
  }
  if (window.turnstile) return Promise.resolve();
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise<void>((resolve) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

/**
 * Optional Cloudflare Turnstile CAPTCHA / Bot Protection widget.
 * Renders cleanly to `null` when VITE_TURNSTILE_SITE_KEY is not configured.
 */
export function TurnstileWidget({
  onToken,
  theme = "light",
  className = "",
}: TurnstileWidgetProps) {
  const siteKey =
    typeof import.meta !== "undefined"
      ? String((import.meta.env as Record<string, unknown>)?.VITE_TURNSTILE_SITE_KEY || "").trim()
      : "";
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const onTokenRef = React.useRef(onToken);
  onTokenRef.current = onToken;

  React.useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;
    let widgetId: string | undefined;

    loadTurnstileScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      try {
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size: "flexible",
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(undefined),
          "error-callback": () => onTokenRef.current(undefined),
        });
      } catch {
        onTokenRef.current(undefined);
      }
    });

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetId);
        } catch {
          // Ignore unmount cleanup errors
        }
      }
    };
  }, [siteKey, theme]);

  if (!siteKey) return null;

  return <div ref={containerRef} className={className} />;
}
