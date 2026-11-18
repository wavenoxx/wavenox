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
  const heightClasses =
    height === "closing"
      ? "min-h-[80svh] lg:min-h-[84svh]"
      : mobileNaturalFrame
        ? "max-[769px]:min-h-0 max-[769px]:aspect-[1122/1402] min-[769px]:min-h-[100svh]"
        : "min-h-[100svh]";

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
                ? "hidden min-[769px]:block absolute inset-0 pointer-events-none z-10"
                : "absolute inset-0 pointer-events-none z-10"
            }
            style={{
              background: mobileNaturalFrame
                ? "linear-gradient(180deg, rgba(11,14,19,0.54) 0%, rgba(11,14,19,0.20) 24%, rgba(11,14,19,0.0) 42%, rgba(11,14,19,0.0) 80%, rgba(11,14,19,0.18) 100%)"
                : "linear-gradient(180deg, rgba(11,14,19,0.64) 0%, rgba(11,14,19,0.22) 24%, rgba(11,14,19,0.0) 40%, rgba(11,14,19,0.0) 62%, rgba(11,14,19,0.60) 80%, rgba(11,14,19,0.86) 100%)",
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
            className="min-[769px]:hidden absolute inset-x-0 top-0 h-40 pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,14,19,0.52) 0%, rgba(11,14,19,0.22) 55%, rgba(11,14,19,0.0) 100%)",
            }}
          />
        )}
      </div>

      {/* Top Section: Title & Lead within upper safe zone */}
      <div
        className={`relative ${
          mobileNaturalFrame
            ? "pt-14 min-[375px]:pt-[60px] sm:pt-20 lg:pt-[88px] pb-1"
            : "pt-10 sm:pt-12 lg:pt-14 pb-1.5"
        } px-5 sm:px-8 lg:px-12 text-center z-20 w-full max-w-5xl mx-auto`}
      >
        <Reveal immediate={priority}>
          {title &&
            (as === "h1" ? (
              <h1 className="text-[30px] min-[375px]:text-[34px] sm:text-[44px] lg:text-[52px] font-medium tracking-[-0.028em] leading-[1.06] text-inherit text-balance max-w-[22ch] mx-auto">
                {title}
              </h1>
            ) : (
              <h2 className="text-[25px] min-[375px]:text-[27px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.024em] leading-[1.1] text-inherit text-balance max-w-[24ch] sm:max-w-[36ch] mx-auto">
                {title}
              </h2>
            ))}
          {lead && (
            <p
              className={`${
                mobileNaturalFrame
                  ? "text-[13px] min-[375px]:text-[14px] sm:text-[16px] lg:text-[18px] mt-1.5 sm:mt-2.5 leading-[1.35] sm:leading-[1.5] max-w-[36ch] sm:max-w-[54ch] text-balance"
                  : "text-[13px] min-[375px]:text-[14px] sm:text-[15px] lg:text-[16px] mt-1.5 sm:mt-2 leading-[1.4] sm:leading-[1.5] max-w-[40ch] sm:max-w-[72ch] lg:max-w-[80ch] text-pretty"
              } font-normal text-inherit/90 mx-auto`}
            >
              {lead}
            </p>
          )}
          {topAddon && <div className="mt-2 sm:mt-3">{topAddon}</div>}
        </Reveal>
      </div>

      {/* Middle Photographic Focal Band */}
      <div
        className={`relative flex-1 ${
          mobileNaturalFrame
            ? "min-h-0 min-[769px]:min-h-[200px]"
            : "min-h-[140px] sm:min-h-[220px] lg:min-h-[260px]"
        } flex items-center justify-center px-5 sm:px-8 z-20`}
      >
        {children}
      </div>

      {/* Bottom Dock: Stats, Actions, Disclaimer */}
      <div
        className={`relative ${
          mobileNaturalFrame
            ? "pb-4 min-[375px]:pb-5 sm:pb-8 lg:pb-10 pt-2"
            : "pb-5 sm:pb-8 lg:pb-10 pt-2"
        } px-5 sm:px-8 lg:px-12 flex flex-col items-center gap-2.5 sm:gap-4 lg:gap-5 z-20 w-full max-w-4xl mx-auto text-center`}
      >
        {stats && (
          <Reveal immediate={priority} delay={0.08} className="w-full">
            {stats}
          </Reveal>
        )}

        {actions && (
          <Reveal immediate={priority} delay={0.14} className="w-full">
            <div
              className={
                mobileNaturalFrame
                  ? "grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-2 min-[375px]:gap-3 sm:gap-4 w-full max-w-[390px] sm:max-w-none mx-auto"
                  : "grid grid-cols-1 min-[375px]:grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 w-full max-w-[380px] sm:max-w-none mx-auto [&>*]:max-sm:min-w-0 [&>*]:max-sm:!px-3"
              }
            >
              {actions}
            </div>
          </Reveal>
        )}

        {disclaimer && (
          <p className="text-[12px] font-normal leading-[1.45] tracking-[0.01em] text-inherit/75 max-w-[66ch] mx-auto text-pretty">
            {disclaimer}
          </p>
        )}
      </div>
    </section>
  );
}
