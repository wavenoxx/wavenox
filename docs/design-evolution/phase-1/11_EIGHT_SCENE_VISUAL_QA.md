# Phase 1 Workstream 4 — Eight-Scene Visual & Responsive QA Report

## 1. Visual Critique & Issues Fixed During Workstream 4

Real desktop (`1440×900`) and mobile (`390×844`) production builds were inspected after initial implementation (Pass 6 / Pass 9), identifying three visual refinements that were fixed and re-verified:

1. **FAQ Accordion Double Hairline Elimination (Scene 07 `#faq`)**: Wrapped `<Faq>` in a clean `bg-[#FFFFFF]` container with `className="border-t-0 border-b-0"` so top and bottom edges do not double up with the outer `border-[#E3E4E6]` frame.
2. **Monitoring Phone Tile Overflow & Badge Wrap (`#monitoring`)**: Widened the illustrative phone frame from `max-w-[330px]` to `max-w-[356px]`, kept `"OEM Inverter App"` and `"Illustrative sample"` on a single non-wrapping top row, and formatted `Battery Reserve` as `98%` + `+2.2 kW` so text never touches the tile border on `320px` or `390px` viewports.
3. **Scene 03 Mobile Safe-Zone Compaction (`#design` on `390×844`)**: Shortened lead and disclaimer copy inside Scene 03 so all headline, badge, solar array visibility, 3-column `StatRow`, and dual action buttons stay balanced within mobile viewport proportions without occluding the solar roof array.

---

## 2. Multi-Viewport Matrix Verification (`verify_ws4_after.mjs`)

Executed against the standalone Node production build (`NITRO_PRESET=node-server npm run build`) across all required viewports, zoom levels, and reduced-motion states:

| Viewport / Mode                  | Width × Height | Main `<section>` Count | Broken Images (`0` target) | Horizontal Overflow (`px`) | Leaf Text `< 12px` | Axe Serious / Critical |
| -------------------------------- | -------------- | ---------------------- | -------------------------- | -------------------------- | ------------------ | ---------------------- |
| Small Mobile                     | `320 × 720`    | `9`                    | `0 / 7`                    | `0 px`                     | `0`                | `0`                    |
| Standard Mobile                  | `390 × 844`    | `9`                    | `0 / 7`                    | `0 px`                     | `0`                | `0`                    |
| Tablet Portrait                  | `768 × 1024`   | `9`                    | `0 / 7`                    | `0 px`                     | `0`                | `0`                    |
| Landscape / Small Desktop        | `1024 × 768`   | `9`                    | `0 / 7`                    | `0 px`                     | `0`                | `0`                    |
| Desktop                          | `1440 × 900`   | `9`                    | `0 / 7`                    | `0 px`                     | `0`                | `0`                    |
| Wide Desktop                     | `1920 × 1080`  | `9`                    | `0 / 7`                    | `0 px`                     | `0`                | `0`                    |
| Short Landscape                  | `640 × 360`    | `9`                    | `0 / 7`                    | `0 px`                     | `0`                | `0`                    |
| `200%` Desktop Zoom Proxy        | `720 × 450`    | `9`                    | `0 / 7`                    | `0 px`                     | `0`                | `0`                    |
| `prefers-reduced-motion: reduce` | `1440 × 900`   | `9`                    | `0 / 7`                    | `0 px`                     | `0`                | `0`                    |

- **Hero Network Delivery**: Single hero image request per viewport (`390×844`: `/media/home-hero-mobile.avif`, `56,519` bytes; `1440×900`: `/media/home-hero-1600w.avif`, `393,052` bytes).

---

## 3. Production Performance Before vs. After (Step 8 Release Audit)

Measured on loopback production Nitro server using `node scripts/step8-tests/release-audit.mjs` (Lighthouse `13.6.0`; lab conditions without field INP or CrUX traffic data):

| Metric (`/`)                   | Mobile Before (`89af6988`) | Mobile After (WS4)       | Desktop Before (`89af6988`) | Desktop After (WS4)        |
| ------------------------------ | -------------------------- | ------------------------ | --------------------------- | -------------------------- |
| Lighthouse Performance Score   | `100`                      | `100`                    | `100`                       | `100`                      |
| Largest Contentful Paint (LCP) | `1,223.9 ms`               | `1,223.9 ms`             | `284.7 ms`                  | `285.0 ms`                 |
| Cumulative Layout Shift (CLS)  | `0`                        | `0`                      | `0`                         | `0`                        |
| Total Blocking Time (TBT)      | `0 ms`                     | `0 ms`                   | `0 ms`                      | `0 ms`                     |
| Total Transfer Size            | `500,877 B`                | `494,191 B` (`-6,686 B`) | `1,650,545 B`               | `1,643,859 B` (`-6,686 B`) |

---

## 4. Visual Evidence Reference

Side-by-side comparison evidence (`workstream-4-homepage-eight-scene-qa.jpg`) under `docs/design-evolution/phase-1/evidence/` documents the before/after transformation across Scene 2 (`#solutions`), Mobile Scene 3 (`#design`), Monitoring split (`#monitoring`), Scene 6 open grid (`#process`), and Scene 7 governance + FAQ (`#faq`).
