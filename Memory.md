# WAVENOX — Persistent Project Memory & Brain (`Memory.md`)

---

## 1. Project Genesis & Strategic Direction

- **Brand Name**: WAVENOX
- **Tagline**: Absolute power. Zero compromise.
- **Strategic Mandate**: 
  - Transform WAVENOX into the **Tesla Solar Panels & Energy Design Studio of India (`https://www.tesla.com/solarpanels` & `https://www.tesla.com/energy/design`)**.
  - Eliminate all generic, busy, rainbow-glowing AI template elements and cluttered 4-column footers.
  - Deliver the restrained, confident, monolithic aesthetic of Tesla clean-tech, adapted exclusively for the Indian market (Rupees, DISCOM net-metering, PM Surya Ghar Muft Bijli Yojana subsidies).
- **The Tesla Color System Realignment**:
  - The founder explicitly pointed out that Tesla's website is NOT pitch-black throughout!
  - It uses **Pure White (`#FFFFFF`) & Soft Studio Light Gray (`#F8F8FA`)** for showroom content sections, calculators, and specs, contrasted against deep **Carbon Dark (`#171A20`)** typography, with dark contrast reserved for edge-to-edge photography viewports (like the Hero and hardware macro shots).
- **The 3-Layer Tesla Ecosystem**:
  - **Layer 1: The Main Solar Panels Showcase (`/` or `/solarpanels`)**: 12 clean sections from 100vh Hero to 1-line showroom footer.
  - **Layer 2: Interactive System Design Studio (`/deploy`)**: 6-step configurator mirroring `tesla.com/energy/design`.
  - **Layer 3: Dedicated Ecosystem Sub-Pages**: `/residential` (Homes), `/enterprise` (Commercial MW), `/omnigrid` (Storage).
- **The Reusable Masterpiece Strategy**:
  - The platform is engineered as a turnkey, white-label, sale-ready business asset.
  - When complete, the platform will be sold to a real-world solar EPC contractor or renewable energy developer in India.
  - Using the centralized configuration engine (`src/config/brand.ts`, `business.ts`, `solar.ts`), any new owner can rebrand the site, change phone/WhatsApp links, update service hubs, and adjust tariffs in under 30 minutes without altering UI code.
- **Reference Blueprint (`InvisProtect`)**:
  - Leverages the battle-tested configuration patterns from the founder's previous enterprise project at `/scratch/invisprotect`.

---

## 2. Technical Environment & Stack State

| Parameter | Current Value | Notes |
| :--- | :--- | :--- |
| **Operating System** | macOS (Darwin) | Local developer machine |
| **Node.js Version** | `v26.4.0` | Node 26 LTS runtime |
| **Package Tooling** | `npm` / `bun` | Scripts configured in `package.json` |
| **Meta-Framework** | TanStack Start (`^1.168.26`) | Nitro-based SSR + Vite 8 |
| **Routing** | TanStack Router (`^1.170.16`) | Type-safe, file-based (`src/routes/`) |
| **Styling** | Tailwind CSS v4 (`^4.2.1`) | `@theme inline`, OKLCH color space |
| **Animation Engine** | Framer Motion (`^12.42.2`) | GPU-accelerated spring physics |
| **Component Kit** | Radix UI + shadcn/ui | Headless accessible primitives |
| **Icons** | Lucide React (`^0.575.0`) | Clean line-art icons |
| **Local Dev Server** | `http://localhost:8080/` | Active on port 8080 |
| **Git Remote** | `https://github.com/wavenoxx/wavenox.git` | Clean `main` branch |

---

## 3. Visual Assets Inventory

| Asset Name | Path | Resolution | Description & Usage |
| :--- | :--- | :--- | :--- |
| `luxury_solar_villa.jpg` | `src/assets/luxury_solar_villa.jpg` | 1920 × 1080 | Cinema-grade modern concrete villa with flush solar roof at golden hour. 100vh Hero background. |
| `liquid_glass_macro.jpg` | `src/assets/liquid_glass_macro.jpg` | 1920 × 1080 | Extreme macro of hexagonal N-type TOPCon silicon cells under tempered glass. Sleek Design section. |
| `enterprise_mw_rooftop.jpg` | `src/assets/enterprise_mw_rooftop.jpg` | 1920 × 1080 | Aerial render of 1MW monolithic black solar roof on corporate campus. Commercial page. |
| Curated Lovable Assets | `src/assets/*.jpg` | Various | 32 pre-existing high-res assets for subpages and details. |

---

## 4. Critical Bug Fixes & Protection

- **Fixed `computeSolarYield`**:
  - Previously threw `TypeError: Cannot read properties of undefined (reading 'toFixed')` when called with object arguments in `/enterprise` and `/deploy`.
  - Now defensively handles both `{ roofAreaSqFt, tariffRatePerKwh }` object parameters and positional `(sqft, tariff)` numbers, returning all expected properties.
  - Zero runtime crashes across all routes.
