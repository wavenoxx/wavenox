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
  height?: "full" | "closing";
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
  mobileNaturalFrame?: boolean;
}

export function Panel({
  id,
  media,
  mediaSrc,
  alt = "",
  priority = false,
  tone = "dark",
  height = "full",
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
  mobileNaturalFrame = false,
}: PanelProps) {
  const isDark = tone === "dark";
  const toneClasses = isDark ? "bg-[#171A20] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#171A20]";
  const heightClasses = height === "closing" ? "min-h-[80svh] lg:min-h-[84svh]" : "min-h-[100svh]";

  return (
    <section
      id={id}
      data-theme={tone}
      data-panel-height={height}
      className={`relative w-full ${heightClasses} flex flex-col justify-between overflow-hidden ${toneClasses} ${className}`}
    >
      {/* Background Media & Calibrated Atmospheric Scrim */}
      <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
        {(media || mediaSrc) && (
          <Media
            media={media}
            src={mediaSrc}
            alt={alt}
            priority={priority}
            fill
            objectPosition={mobileNaturalFrame ? "center top" : objectPosition}
            className="w-full h-full object-cover"
          />
        )}

        {/* Calm directional scrims preserve middle photographic focal clarity */}
        {isDark ? (
          <div
            className={
              mobileNaturalFrame
                ? "hidden md:block absolute inset-0 pointer-events-none z-10"
                : "absolute inset-0 pointer-events-none z-10"
            }
            style={{
              background:
                "linear-gradient(180deg, rgba(11,14,19,0.62) 0%, rgba(11,14,19,0.20) 26%, rgba(11,14,19,0.0) 44%, rgba(11,14,19,0.04) 60%, rgba(11,14,19,0.64) 78%, rgba(11,14,19,0.88) 100%)",
            }}
          />
        ) : (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.18) 28%, rgba(255,255,255,0.0) 50%, rgba(255,255,255,0.88) 100%)",
            }}
          />
        )}
        {mobileNaturalFrame && isDark && (
          <div
            className="md:hidden absolute inset-x-0 top-0 h-56 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,14,19,0.74) 0%, rgba(11,14,19,0.48) 56%, rgba(11,14,19,0.0) 100%)",
            }}
          />
        )}
      </div>

      {/* Top Section: Title & Lead within upper safe zone */}
      <div className="relative pt-16 sm:pt-20 lg:pt-24 pb-2 px-4 sm:px-6 lg:px-12 text-center z-20 w-full max-w-4xl mx-auto">
        <Reveal immediate={priority}>
          {title &&
            (as === "h1" ? (
              <h1 className="text-[30px] min-[375px]:text-[34px] sm:text-[42px] lg:text-[48px] font-medium tracking-[-0.025em] leading-[1.08] text-inherit text-balance max-w-[22ch] mx-auto">
                {title}
              </h1>
            ) : (
              <h2 className="text-[26px] min-[375px]:text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.02em] leading-[1.12] text-inherit text-balance max-w-[24ch] mx-auto">
                {title}
              </h2>
            ))}
          {lead && (
            <p className="text-[14px] sm:text-[16px] lg:text-[17px] font-normal leading-[1.45] sm:leading-[1.55] text-inherit/90 max-w-[36ch] sm:max-w-[54ch] mx-auto mt-2 sm:mt-2.5 text-balance">
              {lead}
            </p>
          )}
          {topAddon && <div className="mt-2 sm:mt-3">{topAddon}</div>}
        </Reveal>
      </div>

      {/* Middle Photographic Focal Band */}
      <div className="relative flex-1 min-h-[140px] sm:min-h-[180px] flex items-center justify-center px-4 sm:px-6 z-20">
        {children}
      </div>

      {/* Bottom Dock: Stats, Actions, Disclaimer */}
      <div className="relative pb-5 sm:pb-8 lg:pb-10 pt-3 px-4 sm:px-6 lg:px-12 flex flex-col items-center gap-3 sm:gap-4 lg:gap-5 z-20 w-full max-w-4xl mx-auto text-center">
        {stats && (
          <Reveal immediate={priority} delay={0.08} className="w-full">
            {stats}
          </Reveal>
        )}

        {actions && (
          <Reveal immediate={priority} delay={0.14} className="w-full">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 w-full max-w-[320px] sm:max-w-none mx-auto">
              {actions}
            </div>
          </Reveal>
        )}

        {disclaimer && (
          <p className="text-[12px] font-normal leading-[1.4] tracking-[0.01em] text-inherit/75 max-w-[65ch] mx-auto text-balance">
            {disclaimer}
          </p>
        )}
      </div>
    </section>
  );
}
