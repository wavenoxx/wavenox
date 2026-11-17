# Phase 1 Workstream 3 — Complete Navigation & Footer Route Inventory

Every link, anchor hash, and consultation drawer trigger exposed by Workstream 3 resolves to a verified TanStack Router route or section ID. No routes were removed, and every individual surface avoids duplicate effective URLs.

## 1. Desktop Top Header Rail (`1024px+`, `src/components/Header.tsx`)

| Slot           | Label             | Direct Destination                        | Flyout Category          |
| -------------- | ----------------- | ----------------------------------------- | ------------------------ |
| Brand Wordmark | `WAVENOX`         | `/`                                       | None                     |
| Nav 1          | `Solar Panels`    | `/residential`                            | `solar`                  |
| Nav 2          | `Solar + Storage` | `/omnigrid`                               | `omnigrid`               |
| Nav 3          | `Commercial`      | `/enterprise`                             | `commercial`             |
| Nav 4          | `Design Studio`   | `/deploy`                                 | None (Direct Navigation) |
| Nav 5          | `Discover`        | `/our-story`                              | `discover`               |
| Utility 1      | Globe Icon        | Region Modal (`/service-areas?state=...`) | Dialog                   |
| Utility 2      | `Talk to Advisor` | Consultation Drawer                       | Dialog                   |

---

## 2. Desktop MegaMenu Destinations (`src/components/MegaMenu.tsx`)

### 2.1 `Solar Panels` (`solar` — 3 Cards + 5 Quick Links = 8 Unique Destinations)

- **Card 1**: `Residential Rooftop Solar` -> `/residential` (`/media/res-hero-640w.webp`)
- **Card 2**: `Elevated Terrace Pergola` -> `/residential#terrace-design` (`/media/res-terrace-640w.webp`)
- **Card 3**: `Severe Weather Engineering` -> `/residential#home-resilience` (`/media/res-weather-640w.webp`)
- **Quick Link 1**: `Get Solar Estimate` -> `/deploy`
- **Quick Link 2**: `Subsidy & Net-Metering Guide` -> `/net-metering`
- **Quick Link 3**: `25-Year Warranty Coverage` -> `/warranty`
- **Quick Link 4**: `Service Areas & Priority Hubs` -> `/service-areas`
- **Quick Link 5**: `Talk to a Solar Advisor` -> `openConsultationDrawer("residential")`

### 2.2 `Solar + Storage` (`omnigrid` — 3 Cards + 5 Quick Links = 8 Unique Destinations)

- **Card 1**: `Omnigrid Home Storage` -> `/omnigrid` (`/media/omnigrid-hero-640w.webp`)
- **Card 2**: `Automatic Outage Switchover` -> `/omnigrid#outage-defense` (`/media/omnigrid-switchover-640w.webp`)
- **Card 3**: `Solar After Sunset` -> `/omnigrid#sunset-power` (`/media/omnigrid-night-640w.webp`)
- **Quick Link 1**: `Configure Solar + Storage` -> `/deploy`
- **Quick Link 2**: `Backup Duration Estimator` -> `/omnigrid#estimator`
- **Quick Link 3**: `24-Hour Energy Flow` -> `/omnigrid#flow-simulation`
- **Quick Link 4**: `10-Year Battery Warranty` -> `/warranty`
- **Quick Link 5**: `Talk to a Storage Advisor` -> `openConsultationDrawer("omnigrid")`

### 2.3 `Commercial` (`commercial` — 3 Cards + 5 Quick Links = 8 Unique Destinations)

- **Card 1**: `Commercial & Industrial Solar` -> `/enterprise` (`/media/commercial-hero-640w.webp`)
- **Card 2**: `Daytime Tariff Reduction` -> `/enterprise#operating-costs` (`/media/commercial-industrial-640w.webp`)
- **Card 3**: `Campus & Enterprise Assessment` -> `/enterprise#assessment` (`/media/commercial-campus-640w.webp`)
- **Quick Link 1**: `Commercial Yield & Tax Calculator` -> `/enterprise#calculator`
- **Quick Link 2**: `Interactive Sizing Studio` -> `/deploy`
- **Quick Link 3**: `For Architects & Builders` -> `/architects`
- **Quick Link 4**: `DISCOM Grid Approvals` -> `/net-metering`
- **Quick Link 5**: `Talk to a Commercial Advisor` -> `openConsultationDrawer("commercial")`

### 2.4 `Discover` (`discover` — 3 × 4 Columns = 12 Unique Destinations)

- **Guides & Feasibility**: `Solar Design Studio` (`/deploy`), `Net-Metering & Subsidies` (`/net-metering`), `Service Areas & Hubs` (`/service-areas`), `Frequently Asked Questions` (`/faq`)
- **Engineering & Warranties**: `Solar Engineering Standards` (`/technology`), `Warranties & Support Scope` (`/warranty`), `For Architects & Builders` (`/architects`), `Calculation Methodology` (`/legal/disclosures`)
- **Company & Governance**: `Our Story & Delivery Model` (`/our-story`), `Engineering Case Study` (`/about-this-project`), `Privacy & Data Protection` (`/legal/privacy`), `Talk to a Solar Advisor` (`openConsultationDrawer()`)

---

## 3. Footer 4×5 Directory & Utility Links (`src/components/Footer.tsx`)

| Column 1: Solar & Storage                 | Column 2: Engineering & Guides                | Column 3: Service & Company                                                  | Column 4: Legal & Governance                          |
| ----------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- |
| `Rooftop Solar Overview` (`/`)            | `Solar Engineering Standards` (`/technology`) | `Service Areas & Hubs` (`/service-areas`)                                    | `Calculation Disclosures` (`/legal/disclosures`)      |
| `Solar Panels for Homes` (`/residential`) | `Net-Metering & Subsidies` (`/net-metering`)  | `Telangana (TGSPDCL / TGNPDCL)` (`/service-areas?state=telangana`)           | `Privacy Policy (DPDP 2023)` (`/legal/privacy`)       |
| `Solar + Battery Storage` (`/omnigrid`)   | `Warranties & Support` (`/warranty`)          | `Andhra Pradesh (APEPDCL / APSPDCL)` (`/service-areas?state=andhra-pradesh`) | `Terms of Service` (`/legal/terms`)                   |
| `Commercial Solar` (`/enterprise`)        | `For Architects & Builders` (`/architects`)   | `Our Story & Delivery Model` (`/our-story`)                                  | `Engineering Case Study` (`/about-this-project`)      |
| `Solar Design Studio` (`/deploy`)         | `Frequently Asked Questions` (`/faq`)         | `Talk to a Solar Advisor` (Consultation Drawer)                              | `PM Surya Ghar Portal` (`https://pmsuryaghar.gov.in`) |

- **Top Identity Actions**: `Design Your System` (`/deploy`), `Talk to a Solar Advisor` (Consultation Drawer)
- **Bottom Legal Bar**: `Privacy` (`/legal/privacy`), `Terms` (`/legal/terms`), `Disclosures` (`/legal/disclosures`), `Colophon` (`/about-this-project`), `FAQ` (`/faq`)
