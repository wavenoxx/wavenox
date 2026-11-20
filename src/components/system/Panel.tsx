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
  /** Retained for backward compatibility; all Panels now enforce exact 4:5 mobile framing */
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
  const isHero = as === "h1";
  const toneClasses = isDark ? "bg-[#171A20] text-[#FFFFFF]" : "bg-[#FFFFFF] text-[#171A20]";

  // Universal WAVENOX responsive ratio law:
  // Desktop (>=769px): full-bleed viewport hero / closing showcase
  // Mobile (<=768px): exact 4:5 portrait framing matching native 4:5 mobile masters
  const heightClasses =
    height === "closing"
      ? "max-[768px]:min-h-0 max-[768px]:aspect-[4/5] min-[769px]:min-h-[80svh] lg:min-h-[84svh]"
      : "max-[768px]:min-h-0 max-[768px]:aspect-[4/5] min-[769px]:min-h-[100svh]";

  const topSafePadding = isHero
    ? "pt-[66px] min-[375px]:pt-[68px] sm:pt-24 lg:pt-[108px] pb-1"
    : "pt-[64px] sm:pt-16 lg:pt-24 pb-1";

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

        {/* Calibrated upper sky scrim + subtle bottom action edge — middle photography stays unobstructed */}
        {isDark ? (
          <>
            <div
              className="hidden min-[769px]:block absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,14,19,0.58) 0%, rgba(11,14,19,0.22) 26%, rgba(11,14,19,0.0) 44%, rgba(11,14,19,0.0) 74%, rgba(11,14,19,0.44) 100%)",
              }}
            />
            <div
              className="min-[769px]:hidden absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,14,19,0.58) 0%, rgba(11,14,19,0.22) 30%, rgba(11,14,19,0.0) 48%, rgba(11,14,19,0.0) 76%, rgba(11,14,19,0.34) 100%)",
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.18) 28%, rgba(255,255,255,0.0) 50%, rgba(255,255,255,0.88) 100%)",
            }}
          />
        )}
      </div>

      {/* Upper Safe Zone: Title & Crisp Subtitle */}
      <div
        className={`relative ${topSafePadding} px-5 sm:px-8 lg:px-12 text-center z-20 w-full max-w-[960px] mx-auto`}
      >
        <Reveal immediate={priority}>
          {title &&
            (isHero ? (
              <h1 className="text-[32px] min-[375px]:text-[36px] sm:text-[48px] lg:text-[60px] font-medium tracking-[-0.03em] leading-[1.06] text-inherit text-balance max-w-[18ch] mx-auto">
                {title}
              </h1>
            ) : (
              <h2 className="text-[28px] min-[375px]:text-[32px] sm:text-[42px] lg:text-[52px] font-medium tracking-[-0.028em] leading-[1.08] text-inherit text-balance max-w-[20ch] sm:max-w-[26ch] mx-auto">
                {title}
              </h2>
            ))}
          {lead && (
            <p className="text-[13px] min-[375px]:text-[14px] sm:text-[17px] lg:text-[19px] mt-2 sm:mt-3 leading-[1.4] sm:leading-[1.48] max-w-[36ch] sm:max-w-[54ch] text-balance font-normal text-inherit/92 mx-auto">
              {lead}
            </p>
          )}
          {topAddon && <div className="mt-2 sm:mt-3">{topAddon}</div>}
        </Reveal>
      </div>

      {/* Unobstructed Middle Photographic Focal Band */}
      <div className="relative flex-1 min-h-0 min-[769px]:min-h-[200px] flex items-center justify-center px-5 sm:px-8 z-20">
        {children}
      </div>

      {/* Bottom Dock: Optional Quiet Stats, Standardized 2-Button Actions, Optional Disclaimer */}
      <div className="relative pb-4 min-[375px]:pb-5 sm:pb-8 lg:pb-11 pt-2 px-5 sm:px-8 lg:px-12 flex flex-col items-center gap-2.5 sm:gap-4 lg:gap-5 z-20 w-full max-w-4xl mx-auto text-center">
        {stats && (
          <Reveal immediate={priority} delay={0.08} className="w-full">
            {stats}
          </Reveal>
        )}

        {actions && (
          <Reveal immediate={priority} delay={0.14} className="w-full">
            <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-2 min-[375px]:gap-3 sm:gap-4 w-full max-w-[390px] sm:max-w-none mx-auto [&>*]:max-sm:min-w-0 [&>*]:max-sm:!px-2.5 [&>*]:max-sm:text-[12px] [&>*]:max-sm:min-[375px]:text-[13px]">
              {actions}
            </div>
          </Reveal>
        )}

        {disclaimer && (
          <p className="hidden sm:block text-[12px] font-normal leading-[1.45] tracking-[0.01em] text-inherit/75 max-w-[66ch] mx-auto text-pretty">
            {disclaimer}
          </p>
        )}
      </div>
    </section>
  );
}
