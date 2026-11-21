import { BRAND_CONFIG } from "@/config/brand";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface SeoSocialMetaOptions {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
}

function normalizeUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${BRAND_CONFIG.domain}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Generates standardized OpenGraph and Twitter Card meta tags with explicit image dimensions.
 */
export function buildSeoSocialMeta({
  title,
  description,
  path,
  imagePath = "/media/home-hero-1600w.jpg",
}: SeoSocialMetaOptions) {
  const canonicalUrl = normalizeUrl(path);
  const fullImageUrl = normalizeUrl(imagePath);

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: fullImageUrl },
    { property: "og:image:width", content: "1600" },
    { property: "og:image:height", content: "900" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: fullImageUrl },
  ];
}

/**
 * Generates Schema.org BreadcrumbList JSON-LD script descriptor for inner routes.
 */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    type: "application/ld+json",
    children: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: item.name,
        item: normalizeUrl(item.path),
      })),
    }).replace(/</g, "\\u003c"),
  };
}
