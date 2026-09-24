# Customizing WAVENOX for a New Solar Business Owner (`CUSTOMIZE.md`)

This platform is architected as an **end-to-end, reusable, luxury clean-tech master template**. When you sell or license this platform to a real-world solar EPC company, rooftop solar installer, or green-energy conglomerate, follow this 15-minute guide to completely rebrand and configure the site for their business.

---

## 1. Brand Identity & Contact Configuration (~5 Minutes)

File: `src/config/brand.ts` (or via `.env` variables)

| Setting                    | Default Value                        | Example for New Owner                  |
| :------------------------- | :----------------------------------- | :------------------------------------- |
| `DEFAULT_BRAND_NAME`       | `"WAVENOX"`                          | `"SolTerra Architecture"`              |
| `DEFAULT_LEGAL_NAME`       | `"WAVENOX Technologies Pvt Ltd"`     | `"SolTerra Energy Solutions Pvt Ltd"`  |
| `DEFAULT_SITE_URL`         | `"https://wavenox.com"`              | `"https://solterra.in"`                |
| `DEFAULT_TAGLINE`          | `"Absolute power. Zero compromise."` | `"Architectural Solar Infrastructure"` |
| `DEFAULT_PHONE_DISPLAY`    | `"+91 91546 26354"`                  | The owner's official office number     |
| `DEFAULT_PHONE_DIAL`       | `"+919154626354"`                    | Dial-ready E.164 number                |
| `DEFAULT_WHATSAPP_DISPLAY` | `"+91 70758 70054"`                  | Owner's VIP sales WhatsApp             |
| `DEFAULT_WHATSAPP_DIAL`    | `"917075870054"`                     | Numbers only with country code         |
| `DEFAULT_EMAIL`            | `"advisory@wavenox.com"`             | Owner's sales email                    |
| `DEFAULT_ADDRESS`          | `"Gachibowli, Hyderabad..."`         | Owner's registered office address      |

> [!TIP]
> Setting environment variables in `.env` (e.g. `VITE_BRAND_NAME="SolTerra"`) automatically overrides these defaults without modifying code.

---

## 2. Operational Cities & Service Hubs (~10 Minutes)

File: `src/config/business.ts`

- **`primaryCity` & `primaryRegion`**: Set the owner's headquarters (e.g., `"Hyderabad"`, `"Telangana"` or `"Bengaluru"`, `"Karnataka"`).
- **`geo`**: Update the latitude and longitude for Google Maps and `LocalBusiness` structured data SEO.
- **`serviceHubs`**: List only the cities the business **actually serves**. The footer, service area badges, SEO schemas, and contact drawers derive dynamically from this array.
- **`reviews`**: Copy genuine reviews from the owner's Google Business Profile. **Keep the list empty until real reviews exist**; the reviews section will cleanly hide itself to comply with consumer protection regulations.

---

## 3. Solar Tariffs & Financial Assumptions (~5 Minutes)

File: `src/config/solar.ts`

- **`defaultTariffInrPerKwh`**: Adjust according to the local DISCOM tariff (e.g., ₹10.5/kWh for Telangana commercial or ₹8.5/kWh for residential).
- **`warrantyYears`**: Change to the owner's confirmed warranty terms (e.g., 25 Years).
- **`discoms`**: Enable or update state electricity boards applicable to the owner's territory.

---

## 4. Brand Accent Color (~1 Minute)

File: `src/styles.css`

If the new owner's brand color is different from Sunburst Orange (`#F57C00`), update the primary theme token in `:root`:

```css
:root {
  --primary: oklch(0.72 0.18 55); /* Change to owner's brand hue */
  --accent: oklch(0.72 0.18 55);
}
```

---

## 5. Replacing Placeholder Visuals with Real Client Media

1. Save the owner's real rooftop solar photographs as high-quality `.webp` or `.jpg` files in `src/assets/`.
2. Follow standard aspect ratios:
   - Hero Carousel: `16:9` (1920 × 1080 px)
   - Product Tiles & Macro: `4:3` or `1:1` (1200 × 900 px)
   - Residential Estates: `16:10` (1600 × 1000 px)
3. Keep the file names matching or update imports cleanly.

---

## 6. Lead Generation & Owner WhatsApp Alerts

1. Create a Supabase project and apply migrations in `supabase/migrations/`.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in deployment environment secrets.
3. Configure the owner's Meta WhatsApp Cloud API credentials (`WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `OWNER_WHATSAPP_PHONE`) to receive real-time lead alerts whenever a visitor submits a quote request.

---

## 7. Pre-Handover Checklist

- [ ] All phone and WhatsApp buttons tested on a mobile device.
- [ ] Operating cities match the owner's real deployment areas.
- [ ] No placeholder or unverified customer reviews.
- [ ] Test lead submitted through the consultation drawer and confirmed in the database.
- [ ] Owner WhatsApp alert received successfully.
- [ ] `npm run build` succeeds with zero errors.
