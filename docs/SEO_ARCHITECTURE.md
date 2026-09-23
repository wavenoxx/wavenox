# WAVENOX — Search Engine Optimization & Structured Data Architecture

This document specifies the technical SEO framework, metadata hierarchy, and Schema.org JSON-LD microdata implementations for the WAVENOX platform.

---

## 1. Core Technical SEO Principles

1. **Server-Side Rendered Meta & Head**:
   Every route defines clean `head` metadata via TanStack Router's `createFileRoute.head()` configuration, dynamically pulling brand tokens from `src/config/brand.ts` and `src/config/business.ts`.
2. **Dynamic OpenGraph & Twitter Cards**:
   All pages provide `og:title`, `og:description`, `og:url`, `og:type: website`, and `twitter:card: summary_large_image` to ensure luxury visual presentation across WhatsApp, iMessage, LinkedIn, and Twitter shares.
3. **Zero Hardcoded Company Names**:
   The brand name, legal entity, telephone, address, and primary service hubs flow from the configuration engine, ensuring that when the site is resold to a solar EPC, all SEO entities re-index cleanly without code edits.

---

## 2. Schema.org JSON-LD Entities

### 2.1. LocalBusiness / HomeAndConstructionBusiness Schema
Injected into the root layout to establish high local search authority in major metropolitan hubs (Hyderabad, Bengaluru, etc.):

```json
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "WAVENOX Solar Architecture",
  "image": "https://wavenox.com/og-image.jpg",
  "@id": "https://wavenox.com/#organization",
  "url": "https://wavenox.com",
  "telephone": "+91 99999 99999",
  "priceRange": "₹₹₹₹",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Road No. 36, Jubilee Hills",
    "addressLocality": "Hyderabad",
    "addressRegion": "Telangana",
    "postalCode": "500033",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 17.4326,
    "longitude": 78.4071
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "09:00",
    "closes": "19:00"
  },
  "areaServed": [
    { "@type": "City", "name": "Hyderabad" },
    { "@type": "City", "name": "Bengaluru" },
    { "@type": "City", "name": "Vijayawada" },
    { "@type": "City", "name": "Mumbai" },
    { "@type": "City", "name": "Delhi-NCR" }
  ]
}
```

---

### 2.2. Product Schema (Liquid Glass Monolithic Solar Tiles)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "WAVENOX Liquid Glass Solar Roof Tiles",
  "image": "https://wavenox.com/assets/lg-hero-01.jpg",
  "description": "Architectural solar glass tiles engineered with aerospace-grade durability, Category 5 wind resistance, and 25-year linear performance warranty.",
  "brand": {
    "@type": "Brand",
    "name": "WAVENOX"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "INR",
    "lowPrice": "450000",
    "highPrice": "15000000",
    "offerCount": "4"
  }
}
```

---

## 3. Route Index & Sizing Keywords

| Route | Primary Keyword | Search Intent | Target Persona |
|---|---|---|---|
| `/` | Luxury Solar Architecture | Commercial / Brand | High-Net-Worth Estate Owners |
| `/residential` | Solar Roof Tiles for Luxury Villas | Commercial Investigation | Villa Owners, Architects |
| `/enterprise` | Commercial Rooftop Solar MW Scale | B2B Commercial | Factory Owners, CFOs, ESG Heads |
| `/liquid-glass` | BIPV Solar Glass Tiles | Technical / Product | Structural Engineers, Architects |
| `/omnigrid` | Whole-House Energy Storage Battery | Transactional / Hardware | Off-Grid Compounds, Estate Managers |
| `/defense` | Hurricane Ballistic Rated Solar | High-Security / Continuity | Industrial & Compound Security |
| `/intelligence` | AI Energy Management System EMS | Technical Innovation | Tech Founders, CleanTech Investors |
| `/brand` | Monolithic Solar Manifesto | Informational / Brand | Discerning Clients, Media |
| `/deploy` | Solar Roof Sizing & Subsidy Calculator | High-Intent Lead | Active Home & Business Owners |

---

## 4. Search Console & Sitemap Guidelines

1. **Sitemap Generation**: Ensure `sitemap.xml` lists all 9 production routes with priority `1.0` for `/` and `/deploy`, and `0.8` for subpages.
2. **Robots.txt**: Allow full crawling on all public routes while excluding internal API routes or admin callbacks.
3. **Geo-Targeting**: Set international targeting to India (`IN`) in Google Search Console, emphasizing local entity markers for Telangana, Andhra Pradesh, and Karnataka.
