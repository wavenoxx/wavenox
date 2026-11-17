import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.resolve(rootDir, "public/media");
const manifestPath = path.resolve(rootDir, "src/config/media.ts");

const shots = [
  {
    slug: "home-hero",
    source: path.resolve(rootDir, "src/assets/home-hero-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/home-hero-mobile-master.webp"),
    alt: "Contemporary solar-powered eco-luxury residence with an all-black rooftop solar array, home battery storage, EV charger, and landscaped lawn",
    isHero: true,
    preserveNativeWebpHero: true,
  },
  {
    slug: "home-design",
    source: path.resolve(rootDir, "src/assets/home-design-master.jpg"),
    alt: "Contemporary Indian residence terrace in warm late-afternoon daylight with a low-profile all-black solar array on a sandstone plinth beside a frameless glass balustrade",
    isHero: false,
  },
  {
    slug: "home-outage",
    source: path.resolve(rootDir, "src/assets/home-outage-master.jpg"),
    alt: "Contemporary two-storey Indian residence warmly lit at blue-hour twilight with a low-profile rooftop solar array",
    isHero: false,
  },
  {
    slug: "home-heat",
    source: path.resolve(rootDir, "src/assets/home-heat-master.jpg"),
    alt: "Close-up of anti-reflective tempered solar glass and dark-slate N-type monocrystalline silicon cell geometry",
    isHero: false,
  },
  {
    slug: "home-final",
    source: path.resolve(rootDir, "src/assets/home-final-master.jpg"),
    alt: "Contemporary Indian courtyard residence at warm twilight with a low-profile rooftop solar array, glowing interior windows, and reflection pool",
    isHero: false,
  },
  {
    slug: "res-hero",
    source: path.resolve(rootDir, "src/assets/luxury_solar_villa.jpg"),
    alt: "Front of a contemporary sandstone and teakwood villa at dusk with a low-profile black solar array along its flat roofline",
    isHero: true,
  },
  {
    slug: "res-terrace",
    source: path.resolve(rootDir, "src/assets/res-terrace-master.jpg"),
    alt: "Elevated matte-charcoal structural steel solar pergola canopy casting clean geometric shadow bands across a walkable Indian stone terrace lounge",
    isHero: false,
  },
  {
    slug: "res-weather",
    source: path.resolve(rootDir, "src/assets/res-weather-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/res-weather-mobile-master.jpg"),
    alt: "Low-profile all-black monocrystalline solar panels and anodized black mounting rails secured on a flat stone rooftop terrace",
    isHero: false,
  },
  {
    slug: "omnigrid-hero",
    source: path.resolve(rootDir, "src/assets/og-core.jpg"),
    alt: "Three stacked matte-graphite battery modules on a concrete plinth with a wall-mounted hybrid inverter above in a minimal utility room",
    isHero: true,
  },
  {
    slug: "omnigrid-switchover",
    source: path.resolve(rootDir, "src/assets/omnigrid-switchover-master.jpg"),
    alt: "Wall-mounted matte-charcoal hybrid solar transfer inverter above a floor-standing modular lithium-iron-phosphate battery cabinet in a clean microcement utility room",
    isHero: false,
  },
  {
    slug: "omnigrid-night",
    source: path.resolve(rootDir, "src/assets/omnigrid-night-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/omnigrid-night-mobile-master.jpg"),
    alt: "Two-storey contemporary Indian residence at warm twilight with an integrated solar roof, glowing interior living spaces, and poolside terrace powered by battery reserve",
    isHero: false,
  },
  {
    slug: "commercial-hero",
    source: path.resolve(rootDir, "src/assets/enterprise_mw_rooftop.jpg"),
    alt: "Deccan industrial manufacturing plant rooftop covered with neat rows of solar panels at sunrise",
    isHero: true,
  },
  {
    slug: "commercial-industrial",
    source: path.resolve(rootDir, "src/assets/commercial-industrial-master.jpg"),
    alt: "Aerial view of a modern Indian industrial manufacturing warehouse with a megawatt-scale rooftop solar array and central inspection walkway",
    isHero: false,
  },
  {
    slug: "commercial-campus",
    source: path.resolve(rootDir, "src/assets/commercial-campus-master.jpg"),
    alt: "Elevated view of a contemporary Indian commercial and industrial campus with landscaped tree-lined avenues and organized rooftop solar arrays",
    isHero: false,
  },
  {
    slug: "studio-estate",
    source: path.resolve(rootDir, "src/assets/studio-estate-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/studio-estate-mobile-master.jpg"),
    alt: "Elevated architectural rooftop perspective of an Indian residence showing two organized south-facing rows of all-black solar panels, tilt frames, central walkway, and parapet setbacks",
    isHero: false,
  },
];

const candidateBreakpoints = [640, 1080, 1600, 1920, 2560];

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const manifestEntries = [];

  for (const shot of shots) {
    console.log(`Processing shot: ${shot.slug}...`);
    const imgBuffer = await fs.readFile(shot.source);
    const metadata = await sharp(imgBuffer).metadata();
    const origWidth = metadata.width || 1920;
    const origHeight = metadata.height || 1080;
    const aspectRatio = origWidth / origHeight;

    const desktopAvifList = [];
    const desktopWebpList = [];
    const desktopJpgList = [];

    const activeBreakpoints = candidateBreakpoints.filter((w) => w <= origWidth);
    if (origWidth < 2560 && !activeBreakpoints.includes(origWidth)) {
      activeBreakpoints.push(origWidth);
    }

    if (shot.preserveNativeWebpHero) {
      // Preserve native hero pixels and avoid double-lossy re-encoding at native width.
      const heroBreakpoints = [640, 1080, origWidth].filter(
        (w, idx, arr) => w <= origWidth && arr.indexOf(w) === idx,
      );
      const jpgBreakpoints = [...new Set([...heroBreakpoints, Math.min(1600, origWidth)])].sort(
        (a, b) => a - b,
      );

      for (const w of heroBreakpoints) {
        const h = Math.round(w / aspectRatio);
        const webpFileName = `${shot.slug}-${w}w.webp`;
        const webpPath = path.join(outDir, webpFileName);
        if (w === origWidth && path.extname(shot.source).toLowerCase() === ".webp") {
          await fs.writeFile(webpPath, imgBuffer);
        } else {
          await sharp(imgBuffer)
            .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
            .webp({
              quality: 94,
              alphaQuality: 100,
              smartSubsample: true,
              effort: 6,
              preset: "photo",
            })
            .toFile(webpPath);
        }
        desktopWebpList.push(`/media/${webpFileName} ${w}w`);
      }

      for (const w of jpgBreakpoints) {
        const h = Math.round(w / aspectRatio);
        const jpgFileName = `${shot.slug}-${w}w.jpg`;
        const jpgPath = path.join(outDir, jpgFileName);
        await sharp(imgBuffer)
          .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
          .jpeg({ quality: 92, mozjpeg: true })
          .toFile(jpgPath);
        desktopJpgList.push(`/media/${jpgFileName} ${w}w`);
      }
    } else {
      for (const w of activeBreakpoints) {
        const h = Math.round(w / aspectRatio);

        // AVIF
        const avifFileName = `${shot.slug}-${w}w.avif`;
        const avifPath = path.join(outDir, avifFileName);
        await sharp(imgBuffer)
          .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
          .sharpen({ sigma: 0.8, m1: 0.05, m2: 1.5, x1: 2 })
          .avif({ quality: shot.isHero ? 86 : 80, effort: 6 })
          .toFile(avifPath);
        desktopAvifList.push(`/media/${avifFileName} ${w}w`);

        // WebP
        const webpFileName = `${shot.slug}-${w}w.webp`;
        const webpPath = path.join(outDir, webpFileName);
        await sharp(imgBuffer)
          .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
          .sharpen({ sigma: 0.8, m1: 0.05, m2: 1.5, x1: 2 })
          .webp({ quality: shot.isHero ? 92 : 84, smartSubsample: true })
          .toFile(webpPath);
        desktopWebpList.push(`/media/${webpFileName} ${w}w`);

        // JPG fallback
        const jpgFileName = `${shot.slug}-${w}w.jpg`;
        const jpgPath = path.join(outDir, jpgFileName);
        await sharp(imgBuffer)
          .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
          .jpeg({ quality: shot.isHero ? 90 : 84, mozjpeg: true })
          .toFile(jpgPath);
        desktopJpgList.push(`/media/${jpgFileName} ${w}w`);

        // Check size budget at 1600w (or largest native width when < 1600w)
        if (w === 1600 || (origWidth < 1600 && w === origWidth)) {
          const avifStat = await fs.stat(avifPath);
          const kb = Math.round(avifStat.size / 1024);
          const budgetKb = shot.isHero ? 250 : 180;
          console.log(`  ${shot.slug} ${w}w AVIF: ${kb} KB (budget: ≤ ${budgetKb} KB)`);
        }
      }
    }

    // Generate mobile portrait
    const maxMobileWidth = 540;
    const maxMobileHeight = 960;

    let mobileImgBuffer = null;
    if (shot.mobileSource) {
      try {
        mobileImgBuffer = await fs.readFile(shot.mobileSource);
        console.log(`  Using dedicated mobile master for ${shot.slug}`);
      } catch {
        mobileImgBuffer = null;
      }
    }

    if (!mobileImgBuffer) {
      // High-precision 9:16 extraction from master canvas
      const targetH = origHeight;
      const targetW = Math.round(targetH * (9 / 16));
      const extractW = Math.min(targetW, origWidth);
      const left = Math.max(0, Math.round((origWidth - extractW) / 2));
      mobileImgBuffer = await sharp(imgBuffer)
        .extract({ left, top: 0, width: extractW, height: targetH })
        .toBuffer();
    }

    const mobileMeta = await sharp(mobileImgBuffer).metadata();
    const mobileOrigW = mobileMeta.width || maxMobileWidth;
    const mobileOrigH = mobileMeta.height || maxMobileHeight;
    const mobileWidth = shot.preserveNativeWebpHero
      ? mobileOrigW
      : Math.min(maxMobileWidth, mobileOrigW);
    const mobileHeight = shot.preserveNativeWebpHero
      ? mobileOrigH
      : Math.min(maxMobileHeight, mobileOrigH);

    const mobileWebpFile = `${shot.slug}-mobile.webp`;
    const mobileJpgFile = `${shot.slug}-mobile.jpg`;
    let mobileAvifFile = null;

    if (shot.preserveNativeWebpHero) {
      if (path.extname(shot.mobileSource || "").toLowerCase() === ".webp") {
        await fs.writeFile(path.join(outDir, mobileWebpFile), mobileImgBuffer);
      } else {
        await sharp(mobileImgBuffer)
          .webp({
            quality: 94,
            alphaQuality: 100,
            smartSubsample: true,
            effort: 6,
            preset: "photo",
          })
          .toFile(path.join(outDir, mobileWebpFile));
      }
      await sharp(mobileImgBuffer)
        .jpeg({ quality: 92, mozjpeg: true })
        .toFile(path.join(outDir, mobileJpgFile));
    } else {
      mobileAvifFile = `${shot.slug}-mobile.avif`;
      await sharp(mobileImgBuffer)
        .resize(mobileWidth, mobileHeight, {
          fit: "cover",
          position: "center",
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        })
        .avif({ quality: shot.isHero ? 56 : 54, effort: 6 })
        .toFile(path.join(outDir, mobileAvifFile));

      await sharp(mobileImgBuffer)
        .resize(mobileWidth, mobileHeight, {
          fit: "cover",
          position: "center",
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        })
        .webp({ quality: shot.isHero ? 78 : 74, smartSubsample: true })
        .toFile(path.join(outDir, mobileWebpFile));

      await sharp(mobileImgBuffer)
        .resize(mobileWidth, mobileHeight, {
          fit: "cover",
          position: "center",
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        })
        .jpeg({ quality: shot.isHero ? 80 : 76, mozjpeg: true })
        .toFile(path.join(outDir, mobileJpgFile));
    }

    // Master default jpg guaranteed to exist on disk without upscaling
    const fallbackWidth = shot.preserveNativeWebpHero
      ? Math.min(1600, origWidth)
      : activeBreakpoints.includes(1600)
        ? 1600
        : activeBreakpoints[activeBreakpoints.length - 1];
    const defaultJpg = `/media/${shot.slug}-${fallbackWidth}w.jpg`;

    manifestEntries.push({
      slug: shot.slug,
      alt: shot.alt,
      src: defaultJpg,
      width: origWidth,
      height: origHeight,
      avif: desktopAvifList.length > 0 ? desktopAvifList.join(", ") : undefined,
      webp: desktopWebpList.join(", "),
      mobileSrc: `/media/${mobileJpgFile}`,
      mobileWebp: `/media/${mobileWebpFile}`,
      mobileAvif: mobileAvifFile ? `/media/${mobileAvifFile}` : undefined,
    });
  }

  // Also alias homes-hero to res-hero for backward compatibility
  const resHeroEntry = manifestEntries.find((e) => e.slug === "res-hero");
  if (resHeroEntry) {
    manifestEntries.push({
      ...resHeroEntry,
      slug: "homes-hero",
    });
  }

  // Write TypeScript manifest
  const manifestTs = `// WAVENOX Responsive Media Manifest
// Generated automatically by scripts/build-images.mjs. Do not edit manually.
import type { MediaDescriptor } from "@/components/system/Media";

export const media = {
${manifestEntries
  .map((e) => {
    const lines = [
      `    src: ${JSON.stringify(e.src)},`,
      `    alt: ${JSON.stringify(e.alt)},`,
      `    width: ${e.width},`,
      `    height: ${e.height},`,
    ];
    if (e.avif) lines.push(`    avif: ${JSON.stringify(e.avif)},`);
    if (e.webp) lines.push(`    webp: ${JSON.stringify(e.webp)},`);
    lines.push(`    mobileSrc: ${JSON.stringify(e.mobileSrc)},`);
    lines.push(`    mobileWebp: ${JSON.stringify(e.mobileWebp)},`);
    if (e.mobileAvif) lines.push(`    mobileAvif: ${JSON.stringify(e.mobileAvif)},`);
    return `  ${JSON.stringify(e.slug)}: {\n${lines.join("\n")}\n  } as MediaDescriptor,`;
  })
  .join("\n")}
} as const;

export type MediaKey = keyof typeof media;
`;

  await fs.writeFile(manifestPath, manifestTs, "utf8");
  console.log(`Manifest written to ${manifestPath}`);
  console.log("Image pipeline completed successfully!");
}

main().catch((err) => {
  console.error("Image build failed:", err);
  process.exit(1);
});
