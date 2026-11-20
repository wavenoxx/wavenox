import * as React from "react";

export interface MediaDescriptor {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  avif?: string;
  webp?: string;
  mobileSrc?: string;
  mobileWebp?: string;
  mobileAvif?: string;
}

export interface MediaProps {
  media?: MediaDescriptor | string;
  src?: string;
  alt?: string;
  priority?: boolean;
  /** Deprioritize initially hidden / off-screen carousel slides above the fold */
  lowPriority?: boolean;
  /** Keep desktop landscape/square sources on mobile (for 4:3 and 1:1 containers) */
  preserveDesktopAspect?: boolean;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  objectPosition?: string;
}

export function Media({
  media,
  src,
  alt = "",
  priority = false,
  lowPriority = false,
  preserveDesktopAspect = false,
  className = "",
  fill = true,
  width,
  height,
  sizes,
  objectPosition = "center",
}: MediaProps) {
  const descriptor: MediaDescriptor =
    typeof media === "string" ? { src: media, alt } : media || { src: src || "", alt };

  const finalAlt = descriptor.alt || alt || "";
  const loading = priority ? "eager" : "lazy";
  const decoding = priority ? ("sync" as const) : ("async" as const);
  // Per modern-web-guidance optimize-image-priority: omit fetchPriority when default
  const fetchPriority = priority ? ("high" as const) : lowPriority ? ("low" as const) : undefined;

  const imgClasses = fill ? `w-full h-full object-cover ${className}` : className;

  const style: React.CSSProperties = {
    objectPosition,
  };

  const useMobileSources =
    !preserveDesktopAspect &&
    Boolean(descriptor.mobileAvif || descriptor.mobileWebp || descriptor.mobileSrc);

  const hasResponsive = Boolean(useMobileSources || descriptor.avif || descriptor.webp);

  if (!hasResponsive) {
    return (
      <img
        src={descriptor.src}
        alt={finalAlt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={decoding}
        width={width || descriptor.width}
        height={height || descriptor.height}
        className={imgClasses}
        style={style}
      />
    );
  }

  const desktopMedia = useMobileSources ? "(min-width: 769px)" : undefined;
  const desktopSizes = sizes || "100vw";
  const mobileSizes = sizes || (priority ? "(max-width: 420px) 360px, 100vw" : "100vw");

  return (
    <picture className={fill ? "block w-full h-full" : undefined}>
      {/* Dedicated 4:5 mobile sources (<= 768px) for 16:9 -> 4:5 responsive slots */}
      {useMobileSources && descriptor.mobileAvif && (
        <source
          media="(max-width: 768px)"
          srcSet={descriptor.mobileAvif}
          sizes={/\s\d+w\b/.test(descriptor.mobileAvif) ? mobileSizes : undefined}
          type="image/avif"
        />
      )}
      {useMobileSources && descriptor.mobileWebp && (
        <source
          media="(max-width: 768px)"
          srcSet={descriptor.mobileWebp}
          sizes={/\s\d+w\b/.test(descriptor.mobileWebp) ? mobileSizes : undefined}
          type="image/webp"
        />
      )}
      {useMobileSources && descriptor.mobileSrc && (
        <source media="(max-width: 768px)" srcSet={descriptor.mobileSrc} />
      )}

      {/* Desktop / Aspect-Preserving sources */}
      {descriptor.avif && (
        <source
          media={desktopMedia}
          srcSet={descriptor.avif}
          sizes={desktopSizes}
          type="image/avif"
        />
      )}
      {descriptor.webp && (
        <source
          media={desktopMedia}
          srcSet={descriptor.webp}
          sizes={desktopSizes}
          type="image/webp"
        />
      )}

      {/* Fallback img */}
      <img
        src={descriptor.src}
        alt={finalAlt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={decoding}
        width={width || descriptor.width}
        height={height || descriptor.height}
        className={imgClasses}
        style={style}
      />
    </picture>
  );
}
