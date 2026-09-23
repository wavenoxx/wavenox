# WAVENOX — Lead Generation & Acquisition Architecture

This document outlines the end-to-end inbound client acquisition pipeline for the WAVENOX solar web platform. It is engineered to capture high-net-worth (HNW) residential estate owners and commercial/industrial decision-makers with zero friction.

---

## 1. Overview of Inbound Conversion Vectors

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TRAFFIC ACQUISITION                             │
│   (Google Ads, Meta Ads, Organic Search, LinkedIn, Direct Referral)    │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    HIGH-INTENT TOUCHPOINTS                             │
│  • Global Hero Ghost CTA ("UNLOCK ENERGY INDEPENDENCE")                │
│  • Fixed Header ("VIP CONSULTATION")                                   │
│  • Global Architectural Footer ("Book Proposal")                       │
│  • Interactive Sizing Engine (`/deploy` & `/#roi-engine`)              │
│  • Commercial 40% Tax Calculator (`/enterprise`)                       │
│  • Defense Audit Trigger (`/defense`)                                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   DUAL-TRACK DISPATCH ENGINE                           │
│                                                                        │
│   ┌─────────────────────────────┐   ┌──────────────────────────────┐   │
│   │ Track A: Direct WhatsApp    │   │ Track B: Supabase Database   │   │
│   │ Instant connection directly │   │ Structured dossier stored in │   │
│   │ to the owner's WhatsApp     │   │ PostgreSQL for CRM sync      │   │
│   │ with pre-filled dossier     │   │ and automated qualification  │   │
│   └─────────────────────────────┘   └──────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Inbound Data Contract

Every consultation submission captures the following parameters:

| Field | Type | Description |
|---|---|---|
| `property_tier` | `string` | `villa` (30-50kW), `estate` (50-120kW), `commercial` (120-500kW+), `defense` |
| `roof_area_sqft` | `number` | Usable roof footprint (1,000 to 100,000 sq.ft) |
| `estimated_capacity_kw` | `number` | Derived via `computeSolarYield` (13 W/sq.ft) |
| `estimated_savings_inr` | `number` | 25-Year cumulative net wealth generated |
| `client_name` | `string` | Client full name |
| `phone` | `string` | WhatsApp/Mobile (+91 Indian mobile format) |
| `city` | `string` | Operating hub (e.g. Hyderabad, Bengaluru) |
| `battery_tier` | `string` | Omnigrid storage selection (20kWh, 40kWh, 100kWh) |
| `utm_source` | `string` | Campaign origin (e.g. `google`, `facebook`, `linkedin`) |
| `utm_campaign` | `string` | Specific marketing campaign identifier |

---

## 3. Track A: Instant VIP WhatsApp Dispatch

Because luxury residential solar sales in India close primarily over WhatsApp, WAVENOX features a zero-friction direct WhatsApp pipeline that operates without requiring third-party CRM servers:

1. When the client completes the 3-step inquiry or configures a roof on `/deploy`, clicking **"DISPATCH VIA WHATSAPP"** formats an encoded URL:
   ```
   https://wa.me/919999999999?text=Hello%20WAVENOX...
   ```
2. The formatted message presents a professional, structured executive dossier:
   ```
   Hello WAVENOX Architecture Team,

   I am inquiring about an architectural solar installation:
   • Client: Vikram Reddy
   • Contact: +91 98765 43210
   • Property Tier: LUXURY VILLA (Jubilee Hills)
   • Usable Roof Area: 4,500 sq.ft
   • Estimated Capacity: 58.5 kWp
   • 25-Yr Projected Net Gain: ₹1.4 Crores

   Please arrange an executive site survey and structural feasibility brief.
   ```
3. The solar company owner receives an immediate high-intent notification on their personal or business WhatsApp device within seconds of client action.

---

## 4. Track B: PostgreSQL Database Persistence (`supabase/migrations/`)

For formal lead tracking, lead deduplication, and export to CRM:

- **Anti-Spam Advisory**: A Postgres trigger rejects repeat submissions from the same telephone number within 60 seconds (`check_recent_submission`).
- **Status Lifecycle**: Leads progress through structured pipeline stages:
  `new` ➔ `contacted` ➔ `qualified` ➔ `survey_booked` ➔ `quoted` ➔ `contract_signed` ➔ `installed`.
- **Row Level Security**: Public can only perform rate-limited inserts; all reads and updates require authenticated business owner credentials.

---

## 5. Rebranding for a New Owner

To point all lead capture to a new business owner:
1. Open `.env` (or `src/config/brand.ts`).
2. Update:
   ```env
   VITE_BUSINESS_PHONE_DISPLAY="+91 91234 56789"
   VITE_BUSINESS_PHONE_DIAL="919123456789"
   VITE_BUSINESS_WHATSAPP_DIAL="919123456789"
   VITE_BUSINESS_EMAIL="sales@newsolarcompany.com"
   ```
3. Restart Vite dev server or deploy. All consultation buttons, WhatsApp links, and footer forms update automatically.
