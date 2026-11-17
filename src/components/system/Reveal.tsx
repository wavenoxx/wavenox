import * as React from "react";

export interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
  immediate?: boolean;
}

type RevealState = "visible" | "pending" | "revealed";

export function Reveal({
  children,
  delay = 0,
  className = "",
  yOffset = 10,
  immediate = false,
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  // Start visible so SSR HTML, initial hydration, hero LCP, and non-JS contexts are never hidden.
  const [state, setState] = React.useState<RevealState>("visible");

  React.useEffect(() => {
    if (immediate) {
      setState("visible");
      return;
    }

    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    ) {
      setState("visible");
      return;
    }

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    // Elements already in or above the viewport at mount remain immediately visible.
    if (rect.top < window.innerHeight * 0.92) {
      setState("visible");
      return;
    }

    setState("pending");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("revealed");
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -16px 0px" },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [immediate]);

  const clampedY = Math.max(0, Math.min(16, yOffset));
  const clampedDelay = Math.max(0, Math.min(0.4, delay));

  let style: React.CSSProperties | undefined;
  if (state === "pending") {
    // Snap immediately without transition before entering viewport so axe/DOM checks never sample a fade-out.
    style = {
      opacity: 0,
      transform: `translate3d(0, ${clampedY}px, 0)`,
    };
  } else if (state === "revealed") {
    style = {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
      transition: `opacity 480ms cubic-bezier(0.16, 1, 0.3, 1) ${clampedDelay}s, transform 480ms cubic-bezier(0.16, 1, 0.3, 1) ${clampedDelay}s`,
    };
  }

  return (
    <div
      ref={ref}
      data-reveal={immediate ? "immediate" : state}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
