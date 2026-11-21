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
    outputSlug: "home-design-v2",
    source: path.resolve(rootDir, "src/assets/home-design-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/home-design-mobile-master.webp"),
    alt: "Warm golden-hour Indian rooftop terrace featuring an elevated travertine plinth with a low-profile all-black solar array, concealed black conduit raceways, frameless glass balustrade, and shaded lounge pergola",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "home-outage",
    outputSlug: "home-outage-v2",
    source: path.resolve(rootDir, "src/assets/home-outage-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/home-outage-mobile-master.webp"),
    alt: "Contemporary two-storey Indian residence glowing warmly at blue-hour dusk with a flush all-black rooftop solar array, teakwood balcony soffit, illuminated living spaces, and covered carport",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "home-heat",
    source: path.resolve(rootDir, "src/assets/home-heat-master.jpg"),
    alt: "Close-up of anti-reflective tempered solar glass and dark-slate N-type monocrystalline silicon cell geometry",
    isHero: false,
  },
  {
    slug: "home-final",
    outputSlug: "home-final-v2",
    source: path.resolve(rootDir, "src/assets/home-final-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/home-final-mobile-master.webp"),
    alt: "Contemporary Indian courtyard residence at golden sunset with a full-span all-black rooftop solar array, glowing glass dining and living gallery, timber slat facade, and illuminated pool",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
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
    outputSlug: "omnigrid-hero-v2",
    source: path.resolve(rootDir, "src/assets/omnigrid-hero-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/omnigrid-hero-mobile-master.webp"),
    alt: "Five-module matte-graphite Omnigrid battery cabinet with warm amber edge accents alongside a wall-mounted hybrid solar inverter in a stone-clad residential utility gallery",
    isHero: true,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 74,
    mobileDownscaleQuality: 56,
  },
  {
    slug: "omnigrid-switchover",
    outputSlug: "omnigrid-switchover-v2",
    source: path.resolve(rootDir, "src/assets/omnigrid-switchover-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/omnigrid-switchover-mobile-master.webp"),
    alt: "Contemporary Indian residence illuminated warmly during an evening thunderstorm with rooftop solar panels and a wall-mounted hybrid inverter and battery cabinet on the veranda",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "omnigrid-night",
    outputSlug: "omnigrid-night-v2",
    source: path.resolve(rootDir, "src/assets/omnigrid-night-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/omnigrid-night-mobile-master.webp"),
    alt: "Two-storey contemporary Indian poolside residence at golden twilight with an integrated rooftop solar array and glowing floor-to-ceiling living rooms powered by battery reserve",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "commercial-hero",
    outputSlug: "commercial-hero-v2",
    source: path.resolve(rootDir, "src/assets/commercial-hero-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/commercial-hero-mobile-master.webp"),
    alt: "Aerial golden-sunrise view of a megawatt-scale Indian industrial manufacturing plant covered with organized rooftop solar panel arrays against Deccan hills",
    isHero: true,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 74,
    mobileDownscaleQuality: 56,
  },
  {
    slug: "commercial-industrial",
    outputSlug: "commercial-industrial-v2",
    source: path.resolve(rootDir, "src/assets/commercial-industrial-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/commercial-industrial-mobile-master.webp"),
    alt: "Elevated sunrise panorama of a large white commercial logistics and manufacturing hub topped with high-density rooftop solar arrays and freight loading bays",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "commercial-campus",
    outputSlug: "commercial-campus-v2",
    source: path.resolve(rootDir, "src/assets/commercial-campus-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/commercial-campus-mobile-master.webp"),
    alt: "Daylight elevated view of a modern industrial logistics facility with standing-seam rooftop solar arrays, loading docks, forklift operations, and solar-lit access roads",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "commercial-closing",
    outputSlug: "commercial-closing-v2",
    source: path.resolve(rootDir, "src/assets/commercial-closing-master.webp"),
    mobileSource: path.resolve(rootDir, "src/assets/commercial-closing-mobile-master.webp"),
    alt: "Sweeping golden-hour aerial view of a charcoal-clad megawatt-scale industrial complex with gleaming rooftop solar panels and dispatch bays beneath a clear twilight sky",
    isHero: false,
    preserveNativeWebpHero: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    mobileDownscaleQuality: 84,
  },
  {
    slug: "studio-villa",
    outputSlug: "studio-villa-v2",
    source: path.resolve(rootDir, "src/assets/studio-villa-master.webp"),
    alt: "Contemporary two-storey Indian villa at twilight with a flush all-black rooftop solar array, warm illuminated glass balconies, timber accents, and covered carport",
    isHero: true,
    preserveNativeWebpHero: true,
    preserveSquareAspect: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    desktopTinyQuality: 54,
  },
  {
    slug: "studio-estate",
    outputSlug: "studio-estate-v2",
    source: path.resolve(rootDir, "src/assets/studio-estate-master.webp"),
    alt: "Elevated golden-hour architectural perspective of a multi-wing contemporary Indian estate featuring organized all-black rooftop solar arrays, timber facade louvers, landscaped gardens, and poolside courtyard",
    isHero: false,
    preserveNativeWebpHero: true,
    preserveSquareAspect: true,
    desktopMidQuality: 92,
    desktopSmallQuality: 84,
    desktopTinyQuality: 80,
  },
];

const candidateBreakpoints = [640, 1080, 1600, 1920, 2560];

function resolveAvifOptions(width, nativeWidth, nativeQuality) {
  if (width >= nativeWidth) {
    return { quality: nativeQuality, effort: 6, chromaSubsampling: "4:4:4" };
  }
  if (width <= 480) {
    return { quality: 62, effort: 6, chromaSubsampling: "4:2:0" };
  }
  if (width <= 640) {
    return { quality: 64, effort: 6, chromaSubsampling: "4:2:0" };
  }
  return { quality: 76, effort: 6, chromaSubsampling: "4:2:0" };
}

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
      // Generate Perceptually Lossless AVIF + Smart WebP + mozjpeg JPG across responsive widths.
      const baseWidths = shot.preserveSquareAspect
        ? [480, 640, 1080, origWidth]
        : [640, 1080, 1440, origWidth];
      const heroBreakpoints = [...new Set(baseWidths)]
        .filter((w) => w <= origWidth)
        .sort((a, b) => a - b);
      const jpgBreakpoints = [...new Set([...heroBreakpoints, Math.min(1600, origWidth)])].sort(
        (a, b) => a - b,
      );
      const desktopAvifQuality = shot.avifDesktopQuality ?? (shot.isHero ? 84 : 84);
      const desktopWebpBaseQuality = shot.isHero ? 92 : 90;

      for (const w of heroBreakpoints) {
        const h = Math.round(w / aspectRatio);
        const sourcePipeline =
          w < origWidth
            ? sharp(imgBuffer).resize(w, h, {
                fit: "cover",
                withoutEnlargement: true,
                kernel: sharp.kernel.lanczos3,
              })
            : sharp(imgBuffer);

        // 1. Perceptually Lossless AVIF at native width; compact responsive downscales
        const avifFileName = `${filePrefix}-${w}w.avif`;
        const avifPath = path.join(outDir, avifFileName);
        await sourcePipeline
          .clone()
          .avif(resolveAvifOptions(w, origWidth, desktopAvifQuality))
          .toFile(avifPath);
        desktopAvifList.push(`/media/${avifFileName} ${w}w`);

        // 2. Smart WebP (preserve exact native WebP pixels if re-encode isn't materially smaller & clean)
        const webpFileName = `${filePrefix}-${w}w.webp`;
        const webpPath = path.join(outDir, webpFileName);
        const targetWebpQuality =
          w <= 640
            ? Math.max(84, shot.desktopSmallQuality ?? desktopWebpBaseQuality)
            : Math.min(94, shot.desktopMidQuality ?? desktopWebpBaseQuality);
        const webpBuf = await sourcePipeline
          .clone()
          .webp({
            quality: targetWebpQuality,
            alphaQuality: 100,
            smartSubsample: false,
            effort: 6,
            preset: "photo",
          })
          .toBuffer();

        if (
          w === origWidth &&
          path.extname(shot.source).toLowerCase() === ".webp" &&
          webpBuf.length > imgBuffer.length * 0.85
        ) {
          await fs.writeFile(webpPath, imgBuffer);
        } else {
          await fs.writeFile(webpPath, webpBuf);
        }
        desktopWebpList.push(`/media/${webpFileName} ${w}w`);
      }

      for (const w of jpgBreakpoints) {
        const h = Math.round(w / aspectRatio);
        const jpgFileName = `${filePrefix}-${w}w.jpg`;
        const jpgPath = path.join(outDir, jpgFileName);
        await sharp(imgBuffer)
          .resize(w, h, { fit: "cover", withoutEnlargement: true, kernel: sharp.kernel.lanczos3 })
          .jpeg({ quality: 86, mozjpeg: true })
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
        const base = sharp(imgBuffer).resize(w, h, {
          fit: "cover",
          withoutEnlargement: true,
          kernel: sharp.kernel.lanczos3,
        });
        const processed =
          w < origWidth ? base.sharpen({ sigma: 0.6, m1: 0.05, m2: 1.4, x1: 2 }) : base;

        // AVIF
        const avifFileName = `${filePrefix}-${w}w.avif`;
        const avifPath = path.join(outDir, avifFileName);
        await processed
          .clone()
          .avif(resolveAvifOptions(w, origWidth, shot.avifDesktopQuality ?? 82))
          .toFile(avifPath);
        desktopAvifList.push(`/media/${avifFileName} ${w}w`);

        // WebP
        const webpFileName = `${filePrefix}-${w}w.webp`;
        const webpPath = path.join(outDir, webpFileName);
        await processed
          .clone()
          .webp({ quality: 90, smartSubsample: false, effort: 6, preset: "photo" })
          .toFile(webpPath);
        desktopWebpList.push(`/media/${webpFileName} ${w}w`);

        // JPG fallback
        const jpgFileName = `${filePrefix}-${w}w.jpg`;
        const jpgPath = path.join(outDir, jpgFileName);
        await processed.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(jpgPath);
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
    let mobileJpgFile = undefined;
    let mobileAvifFile = null;
    let mobileWebpSrcSet = undefined;
    let mobileAvifSrcSet = undefined;

    if (!shot.preserveSquareAspect) {
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
      mobileJpgFile = `${filePrefix}-mobile.jpg`;
      mobileWebpSrcSet = `/media/${mobileWebpFile}`;

      if (shot.preserveNativeWebpHero) {
        const mobileBreakpoints = [...new Set([480, 640, 828, mobileOrigW])]
          .filter((w) => w <= mobileOrigW)
          .sort((a, b) => a - b);
        const mobileAspectRatio = mobileOrigW / mobileOrigH;
        const mobileAvifEntries = [];
        const mobileWebpEntries = [];
        const isNativeMobileWebp = path.extname(shot.mobileSource || "").toLowerCase() === ".webp";
        const mobileAvifQuality = shot.avifMobileQuality ?? 84;
        const mobileWebpBaseQuality = shot.isHero ? 92 : 90;
        mobileAvifFile = `${filePrefix}-mobile.avif`;
        let canonicalWebpWritten = false;

        for (const mw of mobileBreakpoints) {
          const mh = Math.round(mw / mobileAspectRatio);
          const mobileSourcePipeline =
            mw < mobileOrigW
              ? sharp(mobileImgBuffer).resize(mw, mh, {
                  fit: "cover",
                  withoutEnlargement: true,
                  kernel: sharp.kernel.lanczos3,
                })
              : sharp(mobileImgBuffer);

          // 1. Perceptually Lossless Mobile AVIF at native width; compact downscales for Slow 4G
          const mwAvifFile = `${filePrefix}-mobile-${mw}w.avif`;
          const mwAvifPath = path.join(outDir, mwAvifFile);
          await mobileSourcePipeline
            .clone()
            .avif(resolveAvifOptions(mw, mobileOrigW, mobileAvifQuality))
            .toFile(mwAvifPath);
          mobileAvifEntries.push(`/media/${mwAvifFile} ${mw}w`);

          if (mw === mobileOrigW) {
            await fs.copyFile(mwAvifPath, path.join(outDir, mobileAvifFile));
          }

          // 2. Smart Mobile WebP (avoid generation loss vs native WebP master when savings < 10%)
          const mwFile = `${filePrefix}-mobile-${mw}w.webp`;
          const mwPath = path.join(outDir, mwFile);
          const targetMobileWebpQuality = mw <= 640 ? 86 : mw <= 828 ? 88 : 94;
          const mobileWebpBuf = await mobileSourcePipeline
            .clone()
            .webp({
              quality: targetMobileWebpQuality,
              alphaQuality: 100,
              smartSubsample: false,
              effort: 6,
              preset: "photo",
            })
            .toBuffer();

          const chosenMobileBuf =
            mw === mobileOrigW &&
            isNativeMobileWebp &&
            mobileWebpBuf.length > mobileImgBuffer.length * 0.9
              ? mobileImgBuffer
              : mobileWebpBuf;
          await fs.writeFile(mwPath, chosenMobileBuf);
          if (mw === mobileOrigW) {
            await fs.writeFile(path.join(outDir, mobileWebpFile), chosenMobileBuf);
            canonicalWebpWritten = true;
          }
          mobileWebpEntries.push(`/media/${mwFile} ${mw}w`);
        }

        mobileAvifSrcSet = mobileAvifEntries.join(", ");
        mobileWebpSrcSet = mobileWebpEntries.join(", ");

        if (!canonicalWebpWritten) {
          await sharp(mobileImgBuffer)
            .webp({
              quality: mobileWebpBaseQuality,
              alphaQuality: 100,
              smartSubsample: true,
              effort: 6,
              preset: "photo",
            })
            .toFile(path.join(outDir, mobileWebpFile));
        }

        await sharp(mobileImgBuffer)
          .jpeg({ quality: 86, mozjpeg: true })
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
            .avif(resolveAvifOptions(mw, mobileWidth, 84))
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
            .webp({ quality: 90, smartSubsample: false, preset: "photo" })
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
          .avif({ quality: 84, effort: 6, chromaSubsampling: "4:4:4" })
          .toFile(path.join(outDir, mobileAvifFile));

        await sharp(mobileImgBuffer)
          .resize(mobileWidth, mobileHeight, {
            fit: "cover",
            position: cropPos,
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3,
          })
          .sharpen({ sigma: 0.7, m1: 0.05, m2: 1.4, x1: 2 })
          .webp({ quality: 90, smartSubsample: false, preset: "photo" })
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
      mobileSrc: mobileJpgFile ? `/media/${mobileJpgFile}` : undefined,
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
    if (e.mobileSrc) lines.push(`    mobileSrc: ${JSON.stringify(e.mobileSrc)},`);
    if (e.mobileWebp) lines.push(`    mobileWebp: ${JSON.stringify(e.mobileWebp)},`);
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
