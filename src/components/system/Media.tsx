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
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  objectPosition?: string;
}

export function Media({
  media,
  src,
  alt = "",
  priority = false,
  className = "",
  fill = true,
  width,
  height,
  objectPosition = "center",
}: MediaProps) {
  const descriptor: MediaDescriptor =
    typeof media === "string" ? { src: media, alt } : media || { src: src || "", alt };

  const finalAlt = descriptor.alt || alt || "";
  const loading = priority ? "eager" : "lazy";
  // React 19 supports fetchPriority
  const fetchPriority = priority ? ("high" as const) : ("auto" as const);

  const imgClasses = fill ? `w-full h-full object-cover ${className}` : className;

  const style: React.CSSProperties = {
    objectPosition,
  };

  const hasResponsive = Boolean(
    descriptor.mobileAvif ||
    descriptor.mobileWebp ||
    descriptor.mobileSrc ||
    descriptor.avif ||
    descriptor.webp,
  );

  if (!hasResponsive) {
    return (
      <img
        src={descriptor.src}
        alt={finalAlt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={priority ? "sync" : "async"}
        width={width || descriptor.width}
        height={height || descriptor.height}
        className={imgClasses}
        style={style}
      />
    );
  }

  return (
    <picture className={fill ? "block w-full h-full" : undefined}>
      {/* Mobile crop (<= 768px) */}
      {descriptor.mobileAvif && (
        <source media="(max-width: 768px)" srcSet={descriptor.mobileAvif} type="image/avif" />
      )}
      {descriptor.mobileWebp && (
        <source media="(max-width: 768px)" srcSet={descriptor.mobileWebp} type="image/webp" />
      )}
      {descriptor.mobileSrc && <source media="(max-width: 768px)" srcSet={descriptor.mobileSrc} />}

      {/* Desktop / Default sources */}
      {descriptor.avif && <source srcSet={descriptor.avif} sizes="100vw" type="image/avif" />}
      {descriptor.webp && <source srcSet={descriptor.webp} sizes="100vw" type="image/webp" />}

      {/* Fallback img */}
      <img
        src={descriptor.src}
        alt={finalAlt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={priority ? "sync" : "async"}
        width={width || descriptor.width}
        height={height || descriptor.height}
        className={imgClasses}
        style={style}
      />
    </picture>
  );
}
