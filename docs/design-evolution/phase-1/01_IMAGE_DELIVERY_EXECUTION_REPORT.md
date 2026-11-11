# WAVENOX — Phase 1 / Workstream 1A: Image Delivery Foundation Execution Report

**Document ID:** `WVX-P1-01`  
**Workstream:** Phase 1 / Workstream 1A (`P1-01` & `P1-02`)  
**Repository:** `https://github.com/wavenoxx/wavenox`  
**Branch:** `feat/wavenox-phase1-image-delivery-foundation`  
**Base Commit (`main`):** `c0cd46e56a087a5e69ad7823824798aca2b14542` (Phase 0 PR #14 merged)  
**Status:** Verified & Complete

---

## 1. Executive Summary

Workstream 1A executes the two foundational media performance tasks approved in the Phase 0 Blueprint ([`10_EXECUTION_ROADMAP.md`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/docs/design-evolution/phase-0/10_EXECUTION_ROADMAP.md)):

1. **`P1-01` — Image Pipeline Correction ([`scripts/build-images.mjs`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/scripts/build-images.mjs) & [`src/config/media.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/config/media.ts)):**
   - Eliminated synthetic image upscaling across all 15 photographic assets (`16` keys including the `homes-hero` compatibility alias).
   - Replaced the static `[640, 1080, 1600, 1920]` desktop breakpoint list with source-dimension-aware breakpoint generation (`candidateBreakpoints.filter((w) => w <= origWidth)` plus native `origWidth` cap when `< 2560px`) and enforced `withoutEnlargement: true` across all Sharp resize operations.
   - Aligned every `srcset` width descriptor (`640w`, `1024w`, `1080w`, `1088w`, `1200w`, `1376w`, `1440w`, `1600w`, `1920w`, `2560w`) 1:1 with the physical pixel width of its generated file on disk.
   - Updated fallback `MediaDescriptor.src` assignment to select `1600w` when supported by the source master (`>= 1600px`) or the largest native non-upscaled breakpoint (`1024w`, `1088w`, `1200w`, `1376w`, `1440w`), ensuring every referenced fallback JPEG exists on disk without upscaling.
   - Regenerated all mobile portrait derivatives (`-mobile.{avif,webp,jpg}`) with `withoutEnlargement: true` capped at `540×960` (and keeping `1376×768` center-extracted 9:16 crops at their true native `432×768`), reducing `home-hero-mobile.avif` from **`436.2 KB`** (`1080×1920`) to **`55.2 KB`** (`540×960`, **`-87.3%`**, meeting the `<= 65 KB` budget) and `home-hero-mobile.webp` from **`369.5 KB`** to **`83.8 KB`** (**`-77.3%`**, meeting the `<= 110 KB` budget).

2. **`P1-02` — Hero Image Preload Alignment (`src/routes/*.tsx`):**
   - Replaced legacy hardcoded `.webp` preload links (`href="/media/*-1600w.webp"` with `(min-width: 768px)` and `href="/media/*-mobile.webp"` with `(max-width: 767px)`) in [`src/routes/index.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/index.tsx), [`src/routes/residential.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/residential.tsx), [`src/routes/omnigrid.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/omnigrid.tsx), [`src/routes/enterprise.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/enterprise.tsx), and [`src/routes/technology.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/technology.tsx) with responsive `image/avif` preloads matching [`src/components/system/Media.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/components/system/Media.tsx) (`(max-width: 768px)` mobile AVIF `href` and `(min-width: 769px)` desktop AVIF `imageSrcSet` + `imageSizes="100vw"`).
   - Removed the unused `home-hero` preload declarations from [`src/routes/warranty.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/warranty.tsx), which renders no `<Media>` component.
   - Eliminated **100% of duplicate hero image downloads** across all routes and all 6 standard viewports (`320×720`, `390×844`, `768×1024`, `1024×768`, `1440×900`, `1920×1080`).

---

## 2. Exact Root Causes Identified

### 2.1 Root Causes in [`scripts/build-images.mjs`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/scripts/build-images.mjs) (`P1-01`)

1. **Unconditional Desktop Breakpoints Causing Synthetic Upscaling:**
   - Previously, `scripts/build-images.mjs` defined `const breakpoints = [640, 1080, 1600, 1920]` and used it for every master image with `origWidth < 2500`.
   - Because 12 of the 15 shots have master widths between `1024px` and `1440px` (`1024×1024`, `1088×1440`, `1200×1200`, `1376×768`, `1440×1440`), Sharp resized them **upward** to `1600w` and `1920w` without `withoutEnlargement: true`, inflating file sizes by 40%–95% with zero real detail gain.
2. **Stale & Upscaled Mobile Portrait Derivatives:**
   - Although `scripts/build-images.mjs` had been partially updated to `540×960` in an earlier commit (`3befc8a`), only `res-hero-mobile.*` and `studio-estate-mobile.*` had been regenerated. The remaining 13 shots on disk in `public/media/` were still `1080×1920` files from an older pipeline run (including `home-hero-mobile.avif` at **`436.2 KB`**).
   - Additionally, for `1376×768` landscape masters without a dedicated `mobileSource` (`res-hero`, `omnigrid-hero`, `commercial-hero`), the 9:16 center extraction produces a native **`432×768`** buffer. Calling `.resize(540, 960)` without `withoutEnlargement: true` upscaled `432×768` to `540×960`.
3. **Hardcoded `1600w.jpg` Fallback URL:**
   - Line 227 hardcoded `const defaultJpg = `/media/${shot.slug}-1600w.jpg`;` even when the master image was narrower than `1600px`.

### 2.2 Root Causes in Route `head()` Preload Declarations (`P1-02`)

1. **Codec Mismatch (`image/webp` Preload vs. `image/avif` `<picture>` Selection):**
   - [`src/components/system/Media.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/components/system/Media.tsx) orders `<source type="image/avif">` before `<source type="image/webp">`, causing modern browsers to select `.avif`.
   - However, [`src/routes/index.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/index.tsx), [`src/routes/residential.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/residential.tsx), [`src/routes/omnigrid.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/omnigrid.tsx), [`src/routes/enterprise.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/enterprise.tsx), and [`src/routes/technology.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/technology.tsx) preloaded `.webp` files (`type: "image/webp"`), forcing the browser to download both the preloaded `.webp` and the rendered `.avif` hero image on every page load.
2. **Breakpoint Off-by-One Mismatch at `768px` Tablet Portrait:**
   - Route preloads used `(max-width: 767px)` for mobile and `(min-width: 768px)` for desktop, whereas `<Media>` uses `media="(max-width: 768px)"` for mobile portrait sources. At `768×1024`, the preload fetched the `1600w` desktop `.webp` while `<picture>` rendered the mobile `.avif`.
3. **Static Desktop Width Preload (`-1600w`) Instead of `imageSrcSet`:**
   - Desktop preloads hardcoded `href="/media/*-1600w.webp"` instead of `imageSrcSet` + `imageSizes="100vw"`, mismatching `1080w`, `1376w`, and `1920w` selections across desktop viewports.
4. **Unused Hero Preload on `/warranty`:**
   - [`src/routes/warranty.tsx`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/routes/warranty.tsx) preloaded `home-hero-1600w.webp` / `home-hero-mobile.webp` (`451.6 KB`–`494.0 KB`) despite rendering zero images on the page.

---

## 3. Before vs. After Image Dimension & File Size Table

All dimensions and byte sizes below are verified directly from `src/assets/`, `public/media/`, and [`src/config/media.ts`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/src/config/media.ts):

| Media Slug                | Master Source Dimensions          | Before Desktop Breakpoints (`srcset`) | After Desktop Breakpoints (`srcset`, Non-Upscaled) | After Fallback `src` (Physical Size)           | Before Mobile Dimensions (`AVIF` / `WebP` KB) | After Mobile Dimensions (`AVIF` / `WebP` KB) | Mobile AVIF Delta                |
| :------------------------ | :-------------------------------- | :------------------------------------ | :------------------------------------------------- | :--------------------------------------------- | :-------------------------------------------- | :------------------------------------------- | :------------------------------- |
| `home-hero`               | `2752×1536` (mobile: `1536×2752`) | `640w, 1080w, 1600w, 1920w, 2560w`    | `640w, 1080w, 1600w, 1920w, 2560w`                 | `home-hero-1600w.jpg` (`1600×893`)             | `1080×1920` (`436.2 KB` / `369.5 KB`)         | `540×960` (`55.2 KB` / `83.8 KB`)            | **`-87.3%`** (`-381.0 KB`)       |
| `home-design`             | `1376×768` (mobile: `768×1376`)   | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1376w` (`109.7 KB` @ `1376w`)        | `home-design-1376w.jpg` (`1376×768`)           | `1080×1920*` (`233.4 KB` / `234.7 KB`)        | `540×960` (`33.6 KB` / `49.2 KB`)            | **`-85.6%`** (`-199.8 KB`)       |
| `home-outage`             | `1376×768` (mobile: `768×1376`)   | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1376w` (`131.7 KB` @ `1376w`)        | `home-outage-1376w.jpg` (`1376×768`)           | `1080×1920*` (`120.8 KB` / `118.4 KB`)        | `540×960` (`15.3 KB` / `20.1 KB`)            | **`-87.3%`** (`-105.5 KB`)       |
| `home-heat`               | `1200×1200`                       | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1200w` (`121.1 KB` @ `1200w`)        | `home-heat-1200w.jpg` (`1200×1200`)            | `1080×1920*` (`154.4 KB` / `144.7 KB`)        | `540×960` (`28.4 KB` / `38.9 KB`)            | **`-81.6%`** (`-126.0 KB`)       |
| `home-final`              | `1920×1088`                       | `640w, 1080w, 1600w, 1920w`           | `640w, 1080w, 1600w, 1920w`                        | `home-final-1600w.jpg` (`1600×907`)            | `1080×1920*` (`90.0 KB` / `97.9 KB`)          | `540×960` (`17.7 KB` / `22.1 KB`)            | **`-80.3%`** (`-72.3 KB`)        |
| `res-hero` / `homes-hero` | `1376×768`                        | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1376w` (`232.2 KB` @ `1376w`)        | `res-hero-1376w.jpg` (`1376×768`)              | `540×960*` (`22.5 KB` / `27.9 KB`)            | `432×768` (`18.0 KB` / `23.6 KB`)            | **`-20.0%`** (`-4.5 KB`, native) |
| `res-terrace`             | `1376×768` (mobile: `768×1376`)   | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1376w` (`109.7 KB` @ `1376w`)        | `res-terrace-1376w.jpg` (`1376×768`)           | `1080×1920*` (`233.4 KB` / `234.7 KB`)        | `540×960` (`33.6 KB` / `49.2 KB`)            | **`-85.6%`** (`-199.8 KB`)       |
| `res-weather`             | `1440×1440`                       | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1440w` (`111.4 KB` @ `1440w`)        | `res-weather-1440w.jpg` (`1440×1440`)          | `1080×1920*` (`110.4 KB` / `86.2 KB`)         | `540×960` (`14.9 KB` / `20.4 KB`)            | **`-86.5%`** (`-95.5 KB`)        |
| `omnigrid-hero`           | `1376×768`                        | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1376w` (`123.5 KB` @ `1376w`)        | `omnigrid-hero-1376w.jpg` (`1376×768`)         | `1080×1920*` (`88.5 KB` / `99.7 KB`)          | `432×768` (`14.0 KB` / `14.9 KB`)            | **`-84.2%`** (`-74.5 KB`)        |
| `omnigrid-switchover`     | `1088×1440`                       | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1088w` (`10.1 KB` @ `1088w`)         | `omnigrid-switchover-1088w.jpg` (`1088×1440`)  | `1080×1920*` (`16.2 KB` / `32.5 KB`)          | `540×960` (`2.9 KB` / `3.8 KB`)              | **`-82.1%`** (`-13.3 KB`)        |
| `omnigrid-night`          | `1376×768` (mobile: `768×1376`)   | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1376w` (`131.7 KB` @ `1376w`)        | `omnigrid-night-1376w.jpg` (`1376×768`)        | `1080×1920*` (`120.8 KB` / `118.4 KB`)        | `540×960` (`15.3 KB` / `20.1 KB`)            | **`-87.3%`** (`-105.5 KB`)       |
| `commercial-hero`         | `1376×768`                        | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1376w` (`180.5 KB` @ `1376w`)        | `commercial-hero-1376w.jpg` (`1376×768`)       | `1080×1920*` (`143.5 KB` / `184.0 KB`)        | `432×768` (`21.1 KB` / `33.8 KB`)            | **`-85.3%`** (`-122.4 KB`)       |
| `commercial-industrial`   | `1920×1088`                       | `640w, 1080w, 1600w, 1920w`           | `640w, 1080w, 1600w, 1920w`                        | `commercial-industrial-1600w.jpg` (`1600×907`) | `1080×1920*` (`36.6 KB` / `45.3 KB`)          | `540×960` (`6.8 KB` / `9.0 KB`)              | **`-81.4%`** (`-29.8 KB`)        |
| `commercial-campus`       | `1024×1024`                       | `640w, 1080w*, 1600w*, 1920w*`        | `640w, 1024w` (`186.1 KB` @ `1024w`)               | `commercial-campus-1024w.jpg` (`1024×1024`)    | `1080×1920*` (`297.6 KB` / `297.2 KB`)        | `540×960` (`43.4 KB` / `66.6 KB`)            | **`-85.4%`** (`-254.2 KB`)       |
| `studio-estate`           | `1440×1440`                       | `640w, 1080w, 1600w*, 1920w*`         | `640w, 1080w, 1440w` (`111.4 KB` @ `1440w`)        | `studio-estate-1440w.jpg` (`1440×1440`)        | `540×960` (`14.9 KB` / `20.4 KB`)             | `540×960` (`14.9 KB` / `20.4 KB`)            | `0.0%` (already `540×960`)       |

_\*Indicates derivatives that were previously upscaled beyond their source master or extracted 9:16 crop dimensions._

---

## 4. Before vs. After Network Request Comparison Across Viewports

Verified in headless Chromium against the production build (`NITRO_PRESET=node-server npm run build`) across `/`, `/residential`, `/omnigrid`, `/enterprise`, `/technology`, and `/warranty` at all 6 required viewports (`deviceScaleFactor: 1`):

| Route          | Viewport    | Before Hero Requests (`KB`)                                                                            | After Hero Requests (`KB`)                            | Hero Physical Dimensions (Before -> After) | Before Total Media Reqs (`KB`) | After Total Media Reqs (`KB`) | Total Media Transfer Delta   |
| :------------- | :---------- | :----------------------------------------------------------------------------------------------------- | :---------------------------------------------------- | :----------------------------------------- | :----------------------------- | :---------------------------- | :--------------------------- |
| `/`            | `320×720`   | **2** (`home-hero-mobile.avif` `436.2` + `home-hero-mobile.webp` `494.0` = **`930.2 KB`**)             | **1** (`home-hero-mobile.avif` = **`55.2 KB`**)       | `1080×1920` -> `540×960`                   | 6 (`1,418.1 KB`)               | 5 (`141.9 KB`)                | **`-90.0%`** (`-1,276.2 KB`) |
| `/`            | `390×844`   | **2** (`home-hero-mobile.avif` `436.2` + `home-hero-mobile.webp` `494.0` = **`930.2 KB`**)             | **1** (`home-hero-mobile.avif` = **`55.2 KB`**)       | `1080×1920` -> `540×960`                   | 7 (`1,538.9 KB`)               | 6 (`157.2 KB`)                | **`-89.8%`** (`-1,381.7 KB`) |
| `/`            | `768×1024`  | **2** (`home-hero-mobile.avif` `436.2` + `home-hero-1600w.webp` `451.6` = **`887.8 KB`**)              | **1** (`home-hero-mobile.avif` = **`55.2 KB`**)       | `1080×1920` -> `540×960`                   | 6 (`1,375.7 KB`)               | 5 (`141.9 KB`)                | **`-89.7%`** (`-1,233.8 KB`) |
| `/`            | `1024×768`  | **2** (`home-hero-1080w.avif` `213.2` + `home-hero-1600w.webp` `451.6` = **`664.8 KB`**)               | **1** (`home-hero-1080w.avif` = **`213.2 KB`**)       | `1080×603` -> `1080×603`                   | 7 (`1,177.5 KB`)               | 6 (`725.9 KB`)                | **`-38.4%`** (`-451.6 KB`)   |
| `/`            | `1440×900`  | **2** (`home-hero-1600w.avif` `383.8` + `home-hero-1600w.webp` `451.6` = **`835.4 KB`**)               | **1** (`home-hero-1600w.avif` = **`383.8 KB`**)       | `1600×893` -> `1600×893`                   | 7 (`1,692.5 KB`)               | 6 (`1,161.4 KB`)              | **`-31.4%`** (`-531.1 KB`)   |
| `/`            | `1920×1080` | **2** (`home-hero-1920w.avif` `495.7` + `home-hero-1600w.webp` `451.6` = **`947.3 KB`**)               | **1** (`home-hero-1920w.avif` = **`495.7 KB`**)       | `1920×1072` -> `1920×1072`                 | 7 (`2,010.8 KB`)               | 6 (`1,273.3 KB`)              | **`-36.7%`** (`-737.5 KB`)   |
| `/residential` | `320×720`   | **2** (`res-hero-mobile.avif` `22.5` + `res-hero-mobile.webp` `27.9` = **`50.4 KB`**)                  | **1** (`res-hero-mobile.avif` = **`18.0 KB`**)        | `540×960*` -> `432×768`                    | 5 (`484.2 KB`)                 | 4 (`84.2 KB`)                 | **`-82.6%`** (`-400.0 KB`)   |
| `/residential` | `390×844`   | **2** (`res-hero-mobile.avif` `22.5` + `res-hero-mobile.webp` `27.9` = **`50.4 KB`**)                  | **1** (`res-hero-mobile.avif` = **`18.0 KB`**)        | `540×960*` -> `432×768`                    | 5 (`484.2 KB`)                 | 4 (`84.2 KB`)                 | **`-82.6%`** (`-400.0 KB`)   |
| `/residential` | `768×1024`  | **2** (`res-hero-mobile.avif` `22.5` + `res-hero-1600w.webp` `286.9` = **`309.4 KB`**)                 | **1** (`res-hero-mobile.avif` = **`18.0 KB`**)        | `540×960*` -> `432×768`                    | 5 (`743.2 KB`)                 | 4 (`84.2 KB`)                 | **`-88.7%`** (`-659.0 KB`)   |
| `/residential` | `1024×768`  | **2** (`res-hero-1080w.avif` `149.1` + `res-hero-1600w.webp` `286.9` = **`436.0 KB`**)                 | **1** (`res-hero-1080w.avif` = **`149.1 KB`**)        | `1080×603` -> `1080×603`                   | 5 (`649.6 KB`)                 | 4 (`362.7 KB`)                | **`-44.2%`** (`-286.9 KB`)   |
| `/residential` | `1440×900`  | **2** (`res-hero-1600w.avif` `259.2` + `res-hero-1600w.webp` `286.9` = **`546.1 KB`**)                 | **1** (`res-hero-1376w.avif` = **`232.2 KB`**)        | `1600×893*` -> `1376×768`                  | 5 (`898.5 KB`)                 | 4 (`562.8 KB`)                | **`-37.4%`** (`-335.7 KB`)   |
| `/residential` | `1920×1080` | **2** (`res-hero-1920w.avif` `324.4` + `res-hero-1600w.webp` `286.9` = **`611.3 KB`**)                 | **1** (`res-hero-1376w.avif` = **`232.2 KB`**)        | `1920×1072*` -> `1376×768`                 | 5 (`1,039.0 KB`)               | 4 (`581.4 KB`)                | **`-44.0%`** (`-457.6 KB`)   |
| `/omnigrid`    | `320×720`   | **2** (`omnigrid-hero-mobile.avif` `88.5` + `omnigrid-hero-mobile.webp` `99.7` = **`188.2 KB`**)       | **1** (`omnigrid-hero-mobile.avif` = **`14.0 KB`**)   | `1080×1920*` -> `432×768`                  | 4 (`325.2 KB`)                 | 3 (`32.2 KB`)                 | **`-90.1%`** (`-293.0 KB`)   |
| `/omnigrid`    | `390×844`   | **2** (`omnigrid-hero-mobile.avif` `88.5` + `omnigrid-hero-mobile.webp` `99.7` = **`188.2 KB`**)       | **1** (`omnigrid-hero-mobile.avif` = **`14.0 KB`**)   | `1080×1920*` -> `432×768`                  | 4 (`325.2 KB`)                 | 3 (`32.2 KB`)                 | **`-90.1%`** (`-293.0 KB`)   |
| `/omnigrid`    | `768×1024`  | **2** (`omnigrid-hero-mobile.avif` `88.5` + `omnigrid-hero-1600w.webp` `130.4` = **`218.9 KB`**)       | **1** (`omnigrid-hero-mobile.avif` = **`14.0 KB`**)   | `1080×1920*` -> `432×768`                  | 4 (`355.9 KB`)                 | 3 (`32.2 KB`)                 | **`-91.0%`** (`-323.7 KB`)   |
| `/omnigrid`    | `1024×768`  | **2** (`omnigrid-hero-1080w.avif` `69.7` + `omnigrid-hero-1600w.webp` `130.4` = **`200.1 KB`**)        | **1** (`omnigrid-hero-1080w.avif` = **`69.7 KB`**)    | `1080×603` -> `1080×603`                   | 4 (`301.1 KB`)                 | 3 (`170.7 KB`)                | **`-43.3%`** (`-130.4 KB`)   |
| `/omnigrid`    | `1440×900`  | **2** (`omnigrid-hero-1600w.avif` `136.5` + `omnigrid-hero-1600w.webp` `130.4` = **`266.9 KB`**)       | **1** (`omnigrid-hero-1376w.avif` = **`123.5 KB`**)   | `1600×893*` -> `1376×768`                  | 4 (`428.8 KB`)                 | 3 (`265.3 KB`)                | **`-38.1%`** (`-163.5 KB`)   |
| `/omnigrid`    | `1920×1080` | **2** (`omnigrid-hero-1920w.avif` `176.6` + `omnigrid-hero-1600w.webp` `130.4` = **`307.0 KB`**)       | **1** (`omnigrid-hero-1376w.avif` = **`123.5 KB`**)   | `1920×1072*` -> `1376×768`                 | 4 (`507.4 KB`)                 | 3 (`265.3 KB`)                | **`-47.7%`** (`-242.1 KB`)   |
| `/enterprise`  | `320×720`   | **2** (`commercial-hero-mobile.avif` `143.5` + `commercial-hero-mobile.webp` `184.0` = **`327.5 KB`**) | **1** (`commercial-hero-mobile.avif` = **`21.1 KB`**) | `1080×1920*` -> `432×768`                  | 3 (`364.1 KB`)                 | 2 (`27.9 KB`)                 | **`-92.3%`** (`-336.2 KB`)   |
| `/enterprise`  | `390×844`   | **2** (`commercial-hero-mobile.avif` `143.5` + `commercial-hero-mobile.webp` `184.0` = **`327.5 KB`**) | **1** (`commercial-hero-mobile.avif` = **`21.1 KB`**) | `1080×1920*` -> `432×768`                  | 3 (`364.1 KB`)                 | 2 (`27.9 KB`)                 | **`-92.3%`** (`-336.2 KB`)   |
| `/enterprise`  | `768×1024`  | **2** (`commercial-hero-mobile.avif` `143.5` + `commercial-hero-1600w.webp` `241.0` = **`384.5 KB`**)  | **1** (`commercial-hero-mobile.avif` = **`21.1 KB`**) | `1080×1920*` -> `432×768`                  | 3 (`421.1 KB`)                 | 2 (`27.9 KB`)                 | **`-93.4%`** (`-393.2 KB`)   |
| `/enterprise`  | `1024×768`  | **2** (`commercial-hero-1080w.avif` `130.1` + `commercial-hero-1600w.webp` `241.0` = **`371.1 KB`**)   | **1** (`commercial-hero-1080w.avif` = **`130.1 KB`**) | `1080×603` -> `1080×603`                   | 3 (`391.0 KB`)                 | 2 (`150.0 KB`)                | **`-61.6%`** (`-241.0 KB`)   |
| `/enterprise`  | `1440×900`  | **2** (`commercial-hero-1600w.avif` `198.0` + `commercial-hero-1600w.webp` `241.0` = **`439.0 KB`**)   | **1** (`commercial-hero-1376w.avif` = **`180.5 KB`**) | `1600×893*` -> `1376×768`                  | 3 (`474.5 KB`)                 | 2 (`216.0 KB`)                | **`-54.5%`** (`-258.5 KB`)   |
| `/enterprise`  | `1920×1080` | **2** (`commercial-hero-1920w.avif` `236.6` + `commercial-hero-1600w.webp` `241.0` = **`477.6 KB`**)   | **1** (`commercial-hero-1376w.avif` = **`180.5 KB`**) | `1920×1072*` -> `1376×768`                 | 3 (`524.0 KB`)                 | 2 (`226.9 KB`)                | **`-56.7%`** (`-297.1 KB`)   |
| `/technology`  | `390×844`   | **2** (`home-heat-mobile.avif` `154.4` + `home-heat-mobile.webp` `144.7` = **`299.1 KB`**)             | **1** (`home-heat-mobile.avif` = **`28.4 KB`**)       | `1080×1920*` -> `540×960`                  | 2 (`299.1 KB`)                 | 1 (`28.4 KB`)                 | **`-90.5%`** (`-270.7 KB`)   |
| `/technology`  | `1440×900`  | **2** (`home-heat-1600w.avif` `172.7` + `home-heat-1600w.webp` `158.0` = **`330.7 KB`**)               | **1** (`home-heat-1200w.avif` = **`121.1 KB`**)       | `1600×1600*` -> `1200×1200`                | 3 (`449.5 KB`)                 | 2 (`230.8 KB`)                | **`-48.7%`** (`-218.7 KB`)   |
| `/warranty`    | All 6 VPs   | **1** (`home-hero-mobile.webp` `494.0` / `home-hero-1600w.webp` `451.6`)                               | **0** (`0 KB`)                                        | Unused preload -> Removed                  | 1 (`451.6–494.0 KB`)           | 0 (`0.0 KB`)                  | **`-100.0%`** (`-494.0 KB`)  |

---

## 5. Visual Quality Verification Summary

Rendered screenshots of the updated derivatives were inspected at both mobile (`390×844`) and desktop (`1440×900`) viewports across `/`, `/residential`, `/omnigrid`, and `/enterprise`:

- **Solar Panel Gridlines & Roof Geometry:** Fine dark N-type cell gridlines, anodized black mounting rails, and architectural roof edges remain crisp with zero ringing or mosquito noise.
- **Architectural Materials:** Sandstone/travertine facade textures, warm teakwood soffits, and Deccan granite boulders retain clean micro-contrast at `55.2 KB` (`home-hero-mobile.avif`) and `232.2 KB` (`res-hero-1376w.avif`).
- **Sky & Dusk Gradients:** Golden-hour and blue-hour sky transitions render smoothly without color banding or macro-blocking.
- **Typography & Scrim Legibility:** White hero display headlines, KPI overlays, and dual CTAs maintain full WCAG AA contrast against the top and bottom atmospheric scrims with zero layout shift (`CLS = 0.000`).

---

## 6. Test & Audit Results

All required automated test, typecheck, build, E2E, and release-audit suites were executed and verified:

| Command                                      | Status   | Summary                                                                                                                                  |
| :------------------------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run images`                             | **PASS** | Generated all non-upscaled responsive derivatives and updated `src/config/media.ts`                                                      |
| `npm test`                                   | **PASS** | 18 test files passed (`191` unit/integration tests passed, `35` live-env gated skipped, `0` failures)                                    |
| `npm run lint`                               | **PASS** | `0` ESLint errors, `0` banned marketing buzzwords in `scripts/copy-lint.mjs`                                                             |
| `npx tsc --noEmit`                           | **PASS** | `0` TypeScript errors                                                                                                                    |
| `npm run build`                              | **PASS** | Sitemap generated (`16` routes) and client/SSR production bundles compiled                                                               |
| `npm run test:e2e`                           | **PASS** | All `17` public routes × `6` viewports passed layout, horizontal overflow, console/pageerror, and axe-core WCAG 2.1 AA audits            |
| `npm run test:e2e:step6`                     | **PASS** | Step 6 Bill-to-Design AI extraction E2E browser suite passed                                                                             |
| `node scripts/step7-tests/browser.mjs`       | **PASS** | Step 7 Customer Portal E2E browser suite passed                                                                                          |
| `NITRO_PRESET=node-server npm run build`     | **PASS** | Standalone Node production server built cleanly in `.output/server/index.mjs`                                                            |
| `node scripts/step8-tests/release-audit.mjs` | **PASS** | Step 8 Release Audit passed (`100` Mobile & Desktop Lighthouse scores on `/`, `/residential`, `/enterprise`; `CLS = 0.000`, `TBT = 0ms`) |

### 6.1 Lighthouse 13.6.0 Performance Audit Results (`release-audit.mjs`)

| Route          | Form Factor | Performance Score | LCP (ms)   | CLS     | TBT (ms) | Total Transfer (Bytes)       |
| :------------- | :---------- | :---------------- | :--------- | :------ | :------- | :--------------------------- |
| `/`            | Mobile      | **100**           | `1,202 ms` | `0.000` | `0 ms`   | `483,686 B` (`472.3 KB`)     |
| `/`            | Desktop     | **100**           | `285 ms`   | `0.000` | `0 ms`   | `1,528,191 B` (`1,492.4 KB`) |
| `/residential` | Mobile      | **100**           | `902 ms`   | `0.000` | `0 ms`   | `354,949 B` (`346.6 KB`)     |
| `/residential` | Desktop     | **100**           | `244 ms`   | `0.000` | `0 ms`   | `845,149 B` (`825.3 KB`)     |
| `/enterprise`  | Mobile      | **100**           | `902 ms`   | `0.000` | `0 ms`   | `348,087 B` (`339.9 KB`)     |
| `/enterprise`  | Desktop     | **100**           | `244 ms`   | `0.000` | `0 ms`   | `540,782 B` (`528.1 KB`)     |
| `/deploy`      | Mobile      | **89**            | `3,752 ms` | `0.000` | `0 ms`   | `406,239 B` (`396.7 KB`)     |
| `/deploy`      | Desktop     | **99**            | `962 ms`   | `0.000` | `0 ms`   | `625,609 B` (`610.9 KB`)     |

---

## 7. Remaining Work Deferred to Workstream 1B

In strict compliance with Workstream 1A scope boundaries:

- **Master Photography Replacement (`P1-03` through `P1-07`):** Creating new native `>= 2560×1440` (`16:9`) desktop masters and `>= 1440×2560` (`9:16`) mobile masters to replace the existing `1376×768` / `1200×1200` / `1024×1024` masters in `src/assets/`, and eliminating duplicate visual reuse across `home-design` / `res-terrace`, `home-outage` / `omnigrid-night`, and `res-weather` / `studio-estate`, is deferred to **Workstream 1B**.
- **Design Token, Header/Navigation, and 8-Scene Homepage Architecture (`P2` & `P3`):** Deferred to Phases 2 and 3 per [`10_EXECUTION_ROADMAP.md`](file:///Users/bunny/.gemini/antigravity/scratch/wavenox-step8/docs/design-evolution/phase-0/10_EXECUTION_ROADMAP.md).
