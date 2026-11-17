# Phase 1 Workstream 4 — Homepage Anchor & CTA Inventory

All 10 baseline homepage anchor IDs remain uniquely present and cleanly positioned below the `56px` fixed header. No duplicate IDs exist (`count === 1` each in both unit SSR tests and Chromium DOM queries).

## 1. Anchor Deep-Link Preservation Matrix (Measured at `1440 × 900`)

| Legacy Hash          | Scene Location | Target Element                             | Bounding `top` After Hash Load | Scroll Offset Mechanism | Visibility & Focus Outcome                      |
| -------------------- | -------------- | ------------------------------------------ | ------------------------------ | ----------------------- | ----------------------------------------------- |
| `#solar-panels`      | Scene 01       | Opening `<Panel as="h1">`                  | `0 px`                         | Top-of-document hero    | Immediately visible                             |
| `#solutions`         | Scene 02       | `<QuietSection>` 3-Path Gallery            | `56 px`                        | `scroll-mt-14` (`56px`) | Clears `56px` header cleanly                    |
| `#design`            | Scene 03       | Consolidated `<Panel>`                     | `56.3 px`                      | `scroll-mt-14` (`56px`) | Clears `56px` header cleanly                    |
| `#heat-performance`  | Scene 03       | Visible Engineering Pill inside `topAddon` | `96.0 px`                      | `scroll-mt-24` (`96px`) | Lands directly on thermal badge inside Scene 03 |
| `#outage-protection` | Scene 04A      | Twilight Storage `<Panel>`                 | `56.3 px`                      | `scroll-mt-14` (`56px`) | Clears `56px` header cleanly                    |
| `#monitoring`        | Scene 04B      | `<QuietSection>` Monitoring Split          | `56.3 px`                      | `scroll-mt-14` (`56px`) | Clears `56px` header cleanly                    |
| `#savings`           | Scene 05       | `<QuietSection>` Calculator Card           | `55.8 px`                      | `scroll-mt-14` (`56px`) | Clears `56px` header cleanly                    |
| `#process`           | Scene 06       | `<QuietSection>` 6-Step Grid               | `55.6 px`                      | `scroll-mt-14` (`56px`) | Clears `56px` header cleanly                    |
| `#faq`               | Scene 07       | `<QuietSection>` Governance + Accordion    | `56 px`                        | `scroll-mt-14` (`56px`) | Clears `56px` header cleanly                    |
| `#consultation`      | Scene 08       | Closing `<Panel height="closing">`         | `55.8 px`                      | `scroll-mt-14` (`56px`) | Clears `56px` header cleanly                    |

---

## 2. Complete CTA & Link Destination Map (`src/routes/index.tsx`)

| Scene     | Element / Label                                    | Target Destination / Action                          | Preserved Contract                                         |
| --------- | -------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- |
| Scene 01  | `Get Solar Estimate`                               | `/deploy`                                            | Preserves Hero primary CTA selector in `run-e2e-audit.mjs` |
| Scene 01  | `Talk to a Solar Advisor`                          | `openConsultationDrawer()`                           | Opens Consultation Drawer                                  |
| Scene 02  | Image 1 & `Explore Solar Panels`                   | `/residential`                                       | Residential showcase                                       |
| Scene 02  | Image 2 & `Explore Battery Storage`                | `/omnigrid`                                          | Storage showcase                                           |
| Scene 02  | Image 3 & `Explore Commercial`                     | `/enterprise`                                        | Commercial showcase                                        |
| Scene 02  | `Unsure which system fits your roof?...`           | `/deploy`                                            | Single understated section path to Design Studio           |
| Scene 03  | `View Technical Specs`                             | `setSpecsOpen(true)`                                 | Opens `SpecsDrawer`                                        |
| Scene 03  | `Explore Solar Panels`                             | `/residential`                                       | Residential engineering exploration                        |
| Scene 04A | `Explore Battery Storage`                          | `/omnigrid`                                          | Storage product page                                       |
| Scene 04A | `Configure Solar + Storage`                        | `/deploy`                                            | System sizing studio                                       |
| Scene 04B | `Explore 24-hour energy flow modeling`             | `/omnigrid#flow-simulation`                          | Verified `#flow-simulation` section on `/omnigrid`         |
| Scene 05  | `Open in Design Studio`                            | `/deploy?bill={monthlyBill}&discom={selectedDiscom}` | Preserves DISCOM + bill search handoff                     |
| Scene 05  | `Talk to a Solar Advisor`                          | `openConsultationDrawer()`                           | Opens Consultation Drawer                                  |
| Scene 05  | `Inspect tariff sources & calculation methodology` | `/legal/disclosures#sources`                         | Verified disclosure source anchor                          |
| Scene 06  | `Review DISCOM net-metering workflow`              | `/net-metering`                                      | Net-metering regulatory guide                              |
| Scene 07  | `Review Warranty Scope`                            | `/warranty`                                          | Warranty boundaries page                                   |
| Scene 07  | `Inspect Calculation Sources`                      | `/legal/disclosures`                                 | Regulatory basis page                                      |
| Scene 07  | `Read Delivery Model`                              | `/our-story`                                         | Delivery model page                                        |
| Scene 07  | `Browse complete Knowledge Base (26 Topics)`       | `/faq`                                               | Full FAQ knowledge base                                    |
| Scene 07  | `Speak with a WAVENOX advisor`                     | `tel:${BRAND_CONFIG.contact.phone.dial}`             | Direct advisor telephone link                              |
| Scene 08  | `Get Solar Estimate`                               | `/deploy`                                            | Closing conversion action                                  |
| Scene 08  | `Request Consultation`                             | `openConsultationDrawer()`                           | Closing Consultation Drawer action                         |
