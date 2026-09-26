import * as React from "react";
import { Media, type MediaDescriptor } from "./Media";
import { Reveal } from "./Reveal";

export interface PanelProps {
  id?: string;
  media?: MediaDescriptor | string;
  mediaSrc?: string;
  alt?: string;
  priority?: boolean;
  tone?: "dark" | "light";
  as?: "h1" | "h2";
  title?: React.ReactNode;
  lead?: React.ReactNode;
  topAddon?: React.ReactNode;
  stats?: React.ReactNode;
  actions?: React.ReactNode;
  disclaimer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  objectPosition?: string;
}

export function Panel({
  id,
  media,
  mediaSrc,
  alt = "",
  priority = false,
  tone = "dark",
  as = "h2",
  title,
  lead,
  topAddon,
  stats,
  actions,
  disclaimer,
  children,
  className = "",
  objectPosition = "center",
}: PanelProps) {
  const isDark = tone === "dark";
  const toneClasses = isDark ? "bg-[#171A20] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#171A20]";

  return (
    <section
      id={id}
      data-theme={tone}
      className={`relative w-full h-[100svh] min-h-[600px] flex flex-col justify-between overflow-hidden ${toneClasses} ${className}`}
    >
      {/* Background Media & Atmospheric Scrim */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        {(media || mediaSrc) && (
          <Media
            media={media}
            src={mediaSrc}
            alt={alt}
            priority={priority}
            fill
            objectPosition={objectPosition}
            className="w-full h-full object-cover"
          />
        )}

        {/* Unified Atmospheric Vignette for Pristine Legibility & Visual Glow */}
        {isDark ? (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.18) 32%, rgba(0,0,0,0.02) 50%, rgba(0,0,0,0.22) 70%, rgba(0,0,0,0.80) 100%)",
            }}
          />
        ) : (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 35%, transparent 60%, rgba(255,255,255,0.85) 100%)",
            }}
          />
        )}
      </div>

      {/* Top Section: Title & Lead */}
      <div className="relative pt-20 sm:pt-24 md:pt-32 px-5 sm:px-6 text-center z-20 w-full max-w-4xl mx-auto">
        <Reveal immediate={priority}>
          {title &&
            (as === "h1" ? (
              <h1 className="text-[28px] sm:text-[38px] md:text-[48px] font-medium tracking-[-0.015em] leading-[1.12] text-inherit text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                {title}
              </h1>
            ) : (
              <h2 className="text-[28px] sm:text-[38px] md:text-[48px] font-medium tracking-[-0.015em] leading-[1.12] text-inherit text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                {title}
              </h2>
            ))}
          {lead && (
            <p className="text-[13px] sm:text-[15px] md:text-[17px] font-normal leading-relaxed text-inherit/85 max-w-md sm:max-w-xl mx-auto mt-2 text-balance drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">
              {lead}
            </p>
          )}
          {topAddon && <div className="mt-2.5 sm:mt-3">{topAddon}</div>}
        </Reveal>
      </div>

      {/* Middle Custom Content if any */}
      {children && (
        <div className="relative flex-1 flex items-center justify-center px-6 z-20">{children}</div>
      )}

      {/* Bottom Dock: Stats, Actions, Disclaimer */}
      <div className="relative pb-8 sm:pb-12 md:pb-14 px-4 sm:px-6 flex flex-col items-center gap-4 sm:gap-5 md:gap-6 z-20 w-full max-w-4xl mx-auto text-center">
        {stats && (
          <Reveal immediate={priority} delay={0.1} className="w-full">
            {stats}
          </Reveal>
        )}

        {actions && (
          <Reveal immediate={priority} delay={0.15} className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 w-full max-w-[340px] sm:max-w-none mx-auto">
              {actions}
            </div>
          </Reveal>
        )}

        {disclaimer && (
          <p className="text-[12px] font-normal leading-normal text-inherit/60 max-w-xl mx-auto text-balance">
            {disclaimer}
          </p>
        )}
      </div>
    </section>
  );
}
