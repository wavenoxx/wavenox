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
    outputSlug: "home-hero-v3",
    source: path.resolve(rootDir, "src/assets/home-hero-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/home-hero-mobile-master.webp"),
    alt: "Contemporary solar-powered eco-luxury residence with an all-black rooftop solar array, home battery storage, EV charger, and landscaped lawn",
    isHero: true,
    preserveNativeWebpHero: true,
  },
  {
    slug: "home-design",
    source: path.resolve(rootDir, "src/assets/home-design-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/home-design-mobile-master.jpg"),
    alt: "Contemporary Indian residence terrace in warm late-afternoon daylight with a low-profile all-black solar array on a sandstone plinth beside a frameless glass balustrade",
    isHero: false,
  },
  {
    slug: "home-outage",
    source: path.resolve(rootDir, "src/assets/home-outage-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/home-outage-mobile-master.jpg"),
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
    mobileSource: path.resolve(rootDir, "src/assets/home-final-mobile-master.jpg"),
    mobileCropPosition: "top",
    alt: "Contemporary Indian courtyard residence at warm twilight with a low-profile rooftop solar array, glowing interior windows, and reflection pool",
    isHero: false,
  },
  {
    slug: "res-hero",
    outputSlug: "res-hero-v2",
    source: path.resolve(rootDir, "src/assets/res-hero-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/res-hero-mobile-master.webp"),
    alt: "Contemporary two-storey Indian residence at twilight with a flush all-black rooftop solar array, warm teakwood porch soffit, and illuminated garden lawn",
    isHero: true,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 74,
    mobileDownscaleQuality: 56,
    mobileTinyQuality: 44,
  },
  {
    slug: "res-terrace",
    outputSlug: "res-terrace-v2",
    source: path.resolve(rootDir, "src/assets/res-terrace-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/res-terrace-mobile-master.webp"),
    alt: "Elevated matte-charcoal structural steel bifacial solar pergola shading a walkable Indian rooftop terrace dining and lounge deck at golden hour",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "res-weather",
    outputSlug: "res-weather-v2",
    source: path.resolve(rootDir, "src/assets/res-weather-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/res-weather-mobile-master.webp"),
    alt: "Heavy Indian monsoon rain pouring across all-black monocrystalline solar panels with water beading on tempered glass and anodized mounting clamps",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "res-turnkey",
    outputSlug: "res-turnkey-v2",
    source: path.resolve(rootDir, "src/assets/res-turnkey-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/res-turnkey-mobile-master.webp"),
    alt: "Completed two-storey contemporary Indian luxury home at golden sunset with an integrated all-black rooftop solar array, glowing glass living spaces, and landscaped lawn",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "omnigrid-hero",
    source: path.resolve(rootDir, "src/assets/og-core.jpg"),
    mobileCropLeftRatio: 0.52,
    alt: "Three stacked matte-graphite battery modules on a concrete plinth with a wall-mounted hybrid inverter above in a minimal utility room",
    isHero: true,
  },
  {
    slug: "omnigrid-switchover",
    source: path.resolve(rootDir, "src/assets/omnigrid-switchover-master.jpg"),
    mobileCropLeftRatio: 0.5,
    alt: "Wall-mounted matte-charcoal hybrid solar transfer inverter above a floor-standing modular lithium-iron-phosphate battery cabinet in a clean microcement utility room",
    isHero: false,
  },
  {
    slug: "omnigrid-night",
    source: path.resolve(rootDir, "src/assets/omnigrid-night-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/omnigrid-night-mobile-master.jpg"),
    mobileCropPosition: "top",
    alt: "Two-storey contemporary Indian residence at warm twilight with an integrated solar roof, glowing interior living spaces, and poolside terrace powered by battery reserve",
    isHero: false,
  },
  {
    slug: "commercial-hero",
    source: path.resolve(rootDir, "src/assets/enterprise_mw_rooftop.jpg"),
    mobileCropLeftRatio: 0.5,
    alt: "Deccan industrial manufacturing plant rooftop covered with neat rows of solar panels at sunrise",
    isHero: true,
  },
  {
    slug: "commercial-industrial",
    source: path.resolve(rootDir, "src/assets/commercial-industrial-master.jpg"),
    mobileCropLeftRatio: 0.5,
    alt: "Aerial view of a modern Indian industrial manufacturing warehouse with a megawatt-scale rooftop solar array and central inspection walkway",
    isHero: false,
  },
  {
    slug: "commercial-campus",
    source: path.resolve(rootDir, "src/assets/commercial-campus-master.jpg"),
    mobileCropLeftRatio: 0.52,
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
    const filePrefix = shot.outputSlug || shot.slug;
    console.log(`Processing shot: ${shot.slug} (${filePrefix})...`);
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
        const webpFileName = `${filePrefix}-${w}w.webp`;
        const webpPath = path.join(outDir, webpFileName);
        if (w === origWidth && path.extname(shot.source).toLowerCase() === ".webp") {
          await fs.writeFile(webpPath, imgBuffer);
        } else {
          const desktopWebpQuality =
            w <= 640 ? (shot.desktopSmallQuality ?? 94) : (shot.desktopMidQuality ?? 94);
          await sharp(imgBuffer)
            .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
            .webp({
              quality: desktopWebpQuality,
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
        const jpgFileName = `${filePrefix}-${w}w.jpg`;
        const jpgPath = path.join(outDir, jpgFileName);
        await sharp(imgBuffer)
          .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
          .jpeg({ quality: 92, mozjpeg: true })
          .toFile(jpgPath);
        desktopJpgList.push(`/media/${jpgFileName} ${w}w`);

        // Keep legacy og:image path /media/${shot.slug}-1600w.jpg updated when filePrefix differs
        if (shot.outputSlug && w === Math.min(1600, origWidth)) {
          await fs.copyFile(jpgPath, path.join(outDir, `${shot.slug}-${w}w.jpg`));
        }
      }
    } else {
      for (const w of activeBreakpoints) {
        const h = Math.round(w / aspectRatio);

        // AVIF
        const avifFileName = `${filePrefix}-${w}w.avif`;
        const avifPath = path.join(outDir, avifFileName);
        await sharp(imgBuffer)
          .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
          .sharpen({ sigma: 0.8, m1: 0.05, m2: 1.5, x1: 2 })
          .avif({ quality: shot.isHero ? 86 : 80, effort: 6 })
          .toFile(avifPath);
        desktopAvifList.push(`/media/${avifFileName} ${w}w`);

        // WebP
        const webpFileName = `${filePrefix}-${w}w.webp`;
        const webpPath = path.join(outDir, webpFileName);
        await sharp(imgBuffer)
          .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
          .sharpen({ sigma: 0.8, m1: 0.05, m2: 1.5, x1: 2 })
          .webp({ quality: shot.isHero ? 92 : 84, smartSubsample: true })
          .toFile(webpPath);
        desktopWebpList.push(`/media/${webpFileName} ${w}w`);

        // JPG fallback
        const jpgFileName = `${filePrefix}-${w}w.jpg`;
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

    // Generate mobile 4:5 portrait (exact 0.80 ratio matching WAVENOX responsive aspect rule)
    const maxMobileWidth = 800;
    const maxMobileHeight = 1000;

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
      // Focal-calibrated 4:5 (0.80) extraction from master canvas
      const targetH = origHeight;
      const targetW = Math.round(targetH * (4 / 5));
      const extractW = Math.min(targetW, origWidth);
      const centerRatio = shot.mobileCropLeftRatio ?? 0.5;
      const maxLeft = Math.max(0, origWidth - extractW);
      const left = Math.min(
        maxLeft,
        Math.max(0, Math.round(origWidth * centerRatio - extractW / 2)),
      );
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
      : Math.round((mobileWidth * 5) / 4);

    const mobileWebpFile = `${filePrefix}-mobile.webp`;
    const mobileJpgFile = `${filePrefix}-mobile.jpg`;
    let mobileAvifFile = null;
    let mobileWebpSrcSet = `/media/${mobileWebpFile}`;
    let mobileAvifSrcSet = undefined;

    if (shot.preserveNativeWebpHero) {
      const mobileBreakpoints = [480, 640, mobileOrigW].filter(
        (w, idx, arr) => w <= mobileOrigW && arr.indexOf(w) === idx,
      );
      const mobileAspectRatio = mobileOrigW / mobileOrigH;
      const mobileWebpEntries = [];
      const isNativeMobileWebp = path.extname(shot.mobileSource || "").toLowerCase() === ".webp";

      for (const mw of mobileBreakpoints) {
        const mh = Math.round(mw / mobileAspectRatio);
        const mwFile = `${filePrefix}-mobile-${mw}w.webp`;
        const mwPath = path.join(outDir, mwFile);
        if (mw === mobileOrigW && isNativeMobileWebp) {
          await fs.writeFile(mwPath, mobileImgBuffer);
        } else {
          await sharp(mobileImgBuffer)
            .resize(mw, mh, {
              fit: "cover",
              withoutEnlargement: true,
              kernel: sharp.kernel.lanczos3,
            })
            .webp({
              quality:
                mw <= 480
                  ? (shot.mobileTinyQuality ?? shot.mobileDownscaleQuality ?? 56)
                  : (shot.mobileDownscaleQuality ?? 56),
              alphaQuality: 100,
              smartSubsample: true,
              effort: 6,
              preset: "photo",
            })
            .toFile(mwPath);
        }
        mobileWebpEntries.push(`/media/${mwFile} ${mw}w`);
      }
      mobileWebpSrcSet = mobileWebpEntries.join(", ");

      // Also write canonical -mobile.webp and -mobile.jpg fallback
      if (isNativeMobileWebp) {
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
      const cropPos = shot.mobileCropPosition || "centre";
      mobileAvifFile = `${filePrefix}-mobile.avif`;
      const mobileWidths = [...new Set([480, 640, mobileWidth])]
        .filter((w) => w <= mobileWidth)
        .sort((a, b) => a - b);

      const avifEntries = [];
      const webpEntries = [];

      for (const mw of mobileWidths) {
        const mh = Math.round((mw * 5) / 4);
        const mwAvif = `${filePrefix}-mobile-${mw}w.avif`;
        const mwWebp = `${filePrefix}-mobile-${mw}w.webp`;

        await sharp(mobileImgBuffer)
          .resize(mw, mh, {
            fit: "cover",
            position: cropPos,
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3,
          })
          .sharpen({ sigma: 0.7, m1: 0.05, m2: 1.4, x1: 2 })
          .avif({ quality: shot.isHero ? 64 : 62, effort: 6 })
          .toFile(path.join(outDir, mwAvif));
        avifEntries.push(`/media/${mwAvif} ${mw}w`);

        await sharp(mobileImgBuffer)
          .resize(mw, mh, {
            fit: "cover",
            position: cropPos,
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3,
          })
          .sharpen({ sigma: 0.7, m1: 0.05, m2: 1.4, x1: 2 })
          .webp({ quality: shot.isHero ? 82 : 80, smartSubsample: true })
          .toFile(path.join(outDir, mwWebp));
        webpEntries.push(`/media/${mwWebp} ${mw}w`);
      }

      mobileAvifSrcSet = avifEntries.join(", ");
      mobileWebpSrcSet = webpEntries.join(", ");

      // Also write canonical -mobile.avif / -mobile.webp / -mobile.jpg fallbacks
      await sharp(mobileImgBuffer)
        .resize(mobileWidth, mobileHeight, {
          fit: "cover",
          position: cropPos,
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        })
        .sharpen({ sigma: 0.7, m1: 0.05, m2: 1.4, x1: 2 })
        .avif({ quality: shot.isHero ? 64 : 62, effort: 6 })
        .toFile(path.join(outDir, mobileAvifFile));

      await sharp(mobileImgBuffer)
        .resize(mobileWidth, mobileHeight, {
          fit: "cover",
          position: cropPos,
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        })
        .sharpen({ sigma: 0.7, m1: 0.05, m2: 1.4, x1: 2 })
        .webp({ quality: shot.isHero ? 82 : 80, smartSubsample: true })
        .toFile(path.join(outDir, mobileWebpFile));

      await sharp(mobileImgBuffer)
        .resize(mobileWidth, mobileHeight, {
          fit: "cover",
          position: cropPos,
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        })
        .jpeg({ quality: shot.isHero ? 84 : 80, mozjpeg: true })
        .toFile(path.join(outDir, mobileJpgFile));
    }

    // Master default jpg guaranteed to exist on disk without upscaling
    const fallbackWidth = shot.preserveNativeWebpHero
      ? Math.min(1600, origWidth)
      : activeBreakpoints.includes(1600)
        ? 1600
        : activeBreakpoints[activeBreakpoints.length - 1];
    const defaultJpg = `/media/${filePrefix}-${fallbackWidth}w.jpg`;

    manifestEntries.push({
      slug: shot.slug,
      alt: shot.alt,
      src: defaultJpg,
      width: origWidth,
      height: origHeight,
      avif: desktopAvifList.length > 0 ? desktopAvifList.join(", ") : undefined,
      webp: desktopWebpList.join(", "),
      mobileSrc: `/media/${mobileJpgFile}`,
      mobileWebp: mobileWebpSrcSet,
      mobileAvif: mobileAvifSrcSet || (mobileAvifFile ? `/media/${mobileAvifFile}` : undefined),
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
