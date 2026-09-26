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
    source: path.resolve(rootDir, "src/assets/home-hero-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/home-hero-mobile-master.jpg"),
    alt: "Contemporary villa at golden hour with black solar panels on its flat roof and a pool in the garden",
    isHero: true,
  },
  {
    slug: "home-design",
    source: path.resolve(rootDir, "src/assets/home-design-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/home-design-mobile-master.jpg"),
    alt: "All-black solar panels on a low black frame beside a glass balustrade on a stone terrace",
    isHero: false,
  },
  {
    slug: "home-outage",
    source: path.resolve(rootDir, "src/assets/home-outage-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/home-outage-mobile-master.jpg"),
    alt: "Blue-hour street during a power cut: one house lit, its neighbours and streetlights dark",
    isHero: false,
  },
  {
    slug: "home-heat",
    source: path.resolve(rootDir, "src/assets/og-hero-01.jpg"),
    alt: "Low-angle close-up of a black solar panel under harsh midday sun and heat shimmer",
    isHero: false,
  },
  {
    slug: "home-final",
    source: path.resolve(rootDir, "src/assets/res-hero-02.jpg"),
    alt: "A family dining at twilight under a solar pergola on a rooftop terrace with city lights beyond",
    isHero: false,
  },
  {
    slug: "res-hero",
    source: path.resolve(rootDir, "src/assets/luxury_solar_villa.jpg"),
    alt: "Front of a stone-clad villa at dusk with a low black solar array along its roofline",
    isHero: true,
  },
  {
    slug: "res-terrace",
    source: path.resolve(rootDir, "src/assets/res-hero-01.jpg"),
    alt: "Rooftop terrace with an elevated solar structure shading a swing, plants and a water tank",
    isHero: false,
  },
  {
    slug: "res-weather",
    source: path.resolve(rootDir, "src/assets/res-tile.jpg"),
    alt: "Heavy monsoon rain running off a tilted solar array, with bolted clamps in the foreground",
    isHero: false,
  },
  {
    slug: "omnigrid-hero",
    source: path.resolve(rootDir, "src/assets/og-core.jpg"),
    alt: "A stack of three graphite battery modules with an inverter above, in a minimal utility room",
    isHero: true,
  },
  {
    slug: "omnigrid-switchover",
    source: path.resolve(rootDir, "src/assets/og-module.jpg"),
    alt: "Battery status light and inverter display glowing in a dark utility room at night",
    isHero: false,
  },
  {
    slug: "omnigrid-night",
    source: path.resolve(rootDir, "src/assets/og-hero-02.jpg"),
    alt: "A warmly lit living room at night while the neighbourhood outside is dark",
    isHero: false,
  },
  {
    slug: "commercial-hero",
    source: path.resolve(rootDir, "src/assets/enterprise_mw_rooftop.jpg"),
    alt: "Patancheru manufacturing plant rooftop covered with neat rows of solar panels at sunrise",
    isHero: true,
  },
  {
    slug: "commercial-industrial",
    source: path.resolve(rootDir, "src/assets/def-grid.jpg"),
    alt: "Heavy manufacturing and pharmaceutical facility rooftop equipped with high-yield bifacial solar panels",
    isHero: false,
  },
  {
    slug: "commercial-campus",
    source: path.resolve(rootDir, "src/assets/eco-01-grid.jpg"),
    alt: "Contemporary corporate headquarters atrium overlooking an expansive clean-energy rooftop solar microgrid",
    isHero: false,
  },
  {
    slug: "studio-estate",
    source: path.resolve(rootDir, "src/assets/def-tile.jpg"),
    alt: "Rooftop estate layout model engineered for comprehensive solar generation",
    isHero: false,
  },
];

const breakpoints = [640, 1080, 1600, 1920];

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

    for (const w of breakpoints) {
      const h = Math.round(w / aspectRatio);

      // AVIF
      const avifFileName = `${shot.slug}-${w}w.avif`;
      const avifPath = path.join(outDir, avifFileName);
      await sharp(imgBuffer)
        .resize(w, h, { fit: "cover" })
        .avif({ quality: 75, effort: 5 })
        .toFile(avifPath);
      desktopAvifList.push(`/media/${avifFileName} ${w}w`);

      // WebP
      const webpFileName = `${shot.slug}-${w}w.webp`;
      const webpPath = path.join(outDir, webpFileName);
      await sharp(imgBuffer).resize(w, h, { fit: "cover" }).webp({ quality: 80 }).toFile(webpPath);
      desktopWebpList.push(`/media/${webpFileName} ${w}w`);

      // JPG fallback
      const jpgFileName = `${shot.slug}-${w}w.jpg`;
      const jpgPath = path.join(outDir, jpgFileName);
      await sharp(imgBuffer)
        .resize(w, h, { fit: "cover" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(jpgPath);
      desktopJpgList.push(`/media/${jpgFileName} ${w}w`);

      // Check size budget at 1600w
      if (w === 1600) {
        const avifStat = await fs.stat(avifPath);
        const kb = Math.round(avifStat.size / 1024);
        const budgetKb = shot.isHero ? 250 : 180;
        console.log(`  ${shot.slug} 1600w AVIF: ${kb} KB (budget: ≤ ${budgetKb} KB)`);
      }
    }

    // Generate mobile portrait (True 9:16 aspect ratio - 800w x 1422h)
    const mobileWidth = 800;
    const mobileHeight = 1422;

    let mobileImgBuffer = null;
    if (shot.mobileSource) {
      try {
        mobileImgBuffer = await fs.readFile(shot.mobileSource);
        console.log(`  Using dedicated 9:16 mobile master for ${shot.slug}`);
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

    const mobileAvifFile = `${shot.slug}-mobile.avif`;
    await sharp(mobileImgBuffer)
      .resize(mobileWidth, mobileHeight, { fit: "cover", position: "center" })
      .avif({ quality: 78, effort: 5 })
      .toFile(path.join(outDir, mobileAvifFile));

    const mobileWebpFile = `${shot.slug}-mobile.webp`;
    await sharp(mobileImgBuffer)
      .resize(mobileWidth, mobileHeight, { fit: "cover", position: "center" })
      .webp({ quality: 82 })
      .toFile(path.join(outDir, mobileWebpFile));

    const mobileJpgFile = `${shot.slug}-mobile.jpg`;
    await sharp(mobileImgBuffer)
      .resize(mobileWidth, mobileHeight, { fit: "cover", position: "center" })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(path.join(outDir, mobileJpgFile));

    // Master default jpg guaranteed to exist on disk
    const defaultJpg = `/media/${shot.slug}-1600w.jpg`;

    manifestEntries.push({
      slug: shot.slug,
      alt: shot.alt,
      src: defaultJpg,
      width: origWidth,
      height: origHeight,
      avif: desktopAvifList.join(", "),
      webp: desktopWebpList.join(", "),
      mobileSrc: `/media/${mobileJpgFile}`,
      mobileWebp: `/media/${mobileWebpFile}`,
      mobileAvif: `/media/${mobileAvifFile}`,
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
  .map(
    (e) => `  ${JSON.stringify(e.slug)}: {
    src: ${JSON.stringify(e.src)},
    alt: ${JSON.stringify(e.alt)},
    width: ${e.width},
    height: ${e.height},
    avif: ${JSON.stringify(e.avif)},
    webp: ${JSON.stringify(e.webp)},
    mobileSrc: ${JSON.stringify(e.mobileSrc)},
    mobileWebp: ${JSON.stringify(e.mobileWebp)},
    mobileAvif: ${JSON.stringify(e.mobileAvif)},
  } as MediaDescriptor,`,
  )
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
