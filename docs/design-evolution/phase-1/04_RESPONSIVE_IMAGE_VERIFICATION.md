# WAVENOX — Phase 1 / Workstream 1B: Responsive Image & SHA-256 Verification

**Date:** 2026-11-16  
**Pipeline Script:** `scripts/build-images.mjs`  
**Generated Manifest:** `src/config/media.ts`  
**Output Directory:** `public/media/`

---

## 1. SHA-256 Uniqueness & Physical vs. `srcset` Dimension Audit

Every entry in `src/config/media.ts` was verified programmatically with Node.js `crypto` (SHA-256) and `sharp.metadata()` to confirm:

1. **Zero duplicate SHA-256 hashes** across all 15 primary media slugs (`homes-hero` is the intentional backward-compatibility alias to `res-hero`).
2. **1:1 physical-to-`srcset` width correspondence** (`0` upscaled descriptors; no `1376×768` master claims `1600w`, `1920w`, or `2560w`).
3. **100% file existence** across all `src`, `avif`, `webp`, `mobileSrc`, `mobileWebp`, and `mobileAvif` URLs.

| Media Slug              | Master Dimensions | Default `src` Fallback                   | `srcset` Breakpoints               | Mobile Derivative Size | Default `src` SHA-256 (Prefix) |
| :---------------------- | :---------------: | :--------------------------------------- | :--------------------------------- | :--------------------: | :----------------------------: |
| `home-hero`             |    `2752×1536`    | `/media/home-hero-1600w.jpg`             | `640w, 1080w, 1600w, 1920w, 2560w` |       `540×960`        |       `8f814e9daf4c948e`       |
| `home-design`           |    `1376×768`     | `/media/home-design-1376w.jpg`           | `640w, 1080w, 1376w`               |       `432×768`        |       `01f0d5a3b9383864`       |
| `home-outage`           |    `1376×768`     | `/media/home-outage-1376w.jpg`           | `640w, 1080w, 1376w`               |       `432×768`        |       `baa5a926b2ba8957`       |
| `home-heat`             |    `1376×768`     | `/media/home-heat-1376w.jpg`             | `640w, 1080w, 1376w`               |       `432×768`        |       `1e414bcac7c30b87`       |
| `home-final`            |    `1376×768`     | `/media/home-final-1376w.jpg`            | `640w, 1080w, 1376w`               |       `432×768`        |       `922086162a0688f9`       |
| `res-hero`              |    `1376×768`     | `/media/res-hero-1376w.jpg`              | `640w, 1080w, 1376w`               |       `432×768`        |       `53a7703cc22c0799`       |
| `res-terrace`           |    `1376×768`     | `/media/res-terrace-1376w.jpg`           | `640w, 1080w, 1376w`               |       `432×768`        |       `92143316520bab09`       |
| `res-weather`           |    `1376×768`     | `/media/res-weather-1376w.jpg`           | `640w, 1080w, 1376w`               |       `540×960`        |       `a32eb3548e59449c`       |
| `omnigrid-hero`         |    `1376×768`     | `/media/omnigrid-hero-1376w.jpg`         | `640w, 1080w, 1376w`               |       `432×768`        |       `51a2351fd69553fc`       |
| `omnigrid-switchover`   |    `1376×768`     | `/media/omnigrid-switchover-1376w.jpg`   | `640w, 1080w, 1376w`               |       `432×768`        |       `f0ee5f0e0231256a`       |
| `omnigrid-night`        |    `1376×768`     | `/media/omnigrid-night-1376w.jpg`        | `640w, 1080w, 1376w`               |       `540×960`        |       `de99856ee86d90fe`       |
| `commercial-hero`       |    `1376×768`     | `/media/commercial-hero-1376w.jpg`       | `640w, 1080w, 1376w`               |       `432×768`        |       `f819e8b027258bf1`       |
| `commercial-industrial` |    `1376×768`     | `/media/commercial-industrial-1376w.jpg` | `640w, 1080w, 1376w`               |       `432×768`        |       `2261b372177ac397`       |
| `commercial-campus`     |    `1376×768`     | `/media/commercial-campus-1376w.jpg`     | `640w, 1080w, 1376w`               |       `432×768`        |       `ce3e7dd38963836e`       |
| `studio-estate`         |    `1376×768`     | `/media/studio-estate-1376w.jpg`         | `640w, 1080w, 1376w`               |       `432×768`        |       `e9ec0808364d3565`       |
| `homes-hero` _(alias)_  |    `1376×768`     | `/media/res-hero-1376w.jpg`              | `640w, 1080w, 1376w`               |       `432×768`        |       `53a7703cc22c0799`       |

- **Unique Primary Slugs:** `15 / 15`
- **Duplicate Primary Slugs:** `0`
- **Physical vs. `srcset` Width Mismatches:** `0`

---

## 2. Preload Alignment Verification (`Workstream 1A` Preservation)

All 5 route head `<link rel="preload" as="image" type="image/avif">` pairs introduced in Workstream 1A (`P1-02`) remain dynamically bound to `media["..."].mobileAvif` (`media="(max-width: 767px)"`) and `media["..."].avif` (`media="(min-width: 768px)"`, `imageSizes="100vw"`):

- `/` (`src/routes/index.tsx`): Preloads `media["home-hero"].mobileAvif` and `media["home-hero"].avif`
- `/residential` (`src/routes/residential.tsx`): Preloads `media["res-hero"].mobileAvif` and `media["res-hero"].avif`
- `/omnigrid` (`src/routes/omnigrid.tsx`): Preloads `media["omnigrid-hero"].mobileAvif` and `media["omnigrid-hero"].avif`
- `/enterprise` (`src/routes/enterprise.tsx`): Preloads `media["commercial-hero"].mobileAvif` and `media["commercial-hero"].avif`
- `/technology` (`src/routes/technology.tsx`): Preloads `media["home-heat"].mobileAvif` and `media["home-heat"].avif` (automatically updated to the new `640w, 1080w, 1376w` `home-heat` descriptor set via `media["home-heat"]`).

---

## 3. Production Lighthouse & Release Audit Verification

Executed via `NITRO_PRESET=node-server npm run build && node scripts/step8-tests/release-audit.mjs` (Lighthouse `13.6.0`):

| Route            | Form Factor | Performance Score | LCP (ms) | CLS | TBT (ms) | TTFB (ms) | Transfer Bytes |
| :--------------- | :---------: | :---------------: | :------: | :-: | :------: | :-------: | :------------: |
| `/`              |  `mobile`   |      **100**      | `1225.2` | `0` |   `0`    |    `5`    |   `467,541`    |
| `/`              |  `desktop`  |      **100**      | `284.7`  | `0` |   `0`    |    `3`    |  `1,639,446`   |
| `/residential`   |  `mobile`   |      **100**      | `902.1`  | `0` |   `0`    |    `2`    |   `377,489`    |
| `/residential`   |  `desktop`  |      **99**       | `1002.2` | `0` |   `0`    |    `2`    |  `1,101,681`   |
| `/enterprise`    |  `mobile`   |      **92**       | `3302.3` | `0` |   `0`    |    `3`    |   `375,059`    |
| `/enterprise`    |  `desktop`  |      **100**      | `243.8`  | `0` |   `0`    |    `2`    |   `822,072`    |
| `/deploy`        |  `mobile`   |      **89**       | `3752.0` | `0` |   `0`    |    `4`    |   `406,283`    |
| `/deploy`        |  `desktop`  |      **99**       | `962.1`  | `0` |   `0`    |    `4`    |   `625,653`    |
| `/net-metering`  |  `mobile`   |      **92**       | `3301.9` | `0` |   `0`    |    `2`    |   `326,229`    |
| `/net-metering`  |  `desktop`  |      **100**      | `721.7`  | `0` |   `0`    |    `2`    |   `326,229`    |
| `/architects`    |  `mobile`   |      **100**      | `901.6`  | `0` |   `0`    |    `2`    |   `286,328`    |
| `/architects`    |  `desktop`  |      **100**      | `243.6`  | `0` |   `0`    |    `2`    |   `286,328`    |
| `/legal/privacy` |  `mobile`   |      **100**      | `901.7`  | `0` |   `0`    |    `2`    |   `251,424`    |
| `/legal/privacy` |  `desktop`  |      **100**      | `601.3`  | `0` |   `0`    |    `1`    |   `251,424`    |
| `/legal/terms`   |  `mobile`   |      **100**      | `901.4`  | `0` |   `0`    |    `1`    |   `251,351`    |
| `/legal/terms`   |  `desktop`  |      **100**      | `243.6`  | `0` |   `0`    |    `2`    |   `251,351`    |
