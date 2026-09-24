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
    alt: "Contemporary residential villa in Jubilee Hills with low-profile flush-mounted monocrystalline solar array at golden hour",
    isHero: true,
  },
  {
    slug: "home-design",
    source: path.resolve(rootDir, "src/assets/home-design-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/home-design-mobile-master.jpg"),
    alt: "Architectural macro detail of concealed mounting structure and matte-black solar panels on rooftop terrace",
    isHero: false,
  },
  {
    slug: "home-outage",
    source: path.resolve(rootDir, "src/assets/home-outage-master.jpg"),
    mobileSource: path.resolve(rootDir, "src/assets/home-outage-mobile-master.jpg"),
    alt: "Cinematic dusk neighborhood during power outage with residential villa warmly illuminated by stored solar power",
    isHero: false,
  },
  {
    slug: "home-heat",
    source: path.resolve(rootDir, "src/assets/og-hero-01.jpg"),
    alt: "Studio macro shot of N-type TOPCon bifacial cell architecture under precision golden edge illumination",
    isHero: false,
  },
  {
    slug: "home-final",
    source: path.resolve(rootDir, "src/assets/res-hero-02.jpg"),
    alt: "Architectural residential terrace with elevated solar pergola living canopy at twilight",
    isHero: false,
  },
  {
    slug: "res-hero",
    source: path.resolve(rootDir, "src/assets/luxury_solar_villa.jpg"),
    alt: "Ultra-luxury modern villa residence with floor-to-ceiling glass and monolithic flush all-black solar array",
    isHero: true,
  },
  {
    slug: "res-terrace",
    source: path.resolve(rootDir, "src/assets/res-hero-01.jpg"),
    alt: "Urban independent residence rooftop terrace featuring flush-mounted solar array and pristine usable area",
    isHero: false,
  },
  {
    slug: "res-weather",
    source: path.resolve(rootDir, "src/assets/res-tile.jpg"),
    alt: "Severe weather durability testing on anti-reflective hydrophobic tempered glass solar module",
    isHero: false,
  },
  {
    slug: "omnigrid-hero",
    source: path.resolve(rootDir, "src/assets/og-core.jpg"),
    alt: "Brushed titanium and obsidian black Omnigrid home battery energy storage system mounted in modern architect garage",
    isHero: true,
  },
  {
    slug: "omnigrid-switchover",
    source: path.resolve(rootDir, "src/assets/og-module.jpg"),
    alt: "Solid-state microgrid transfer switchgear and high-speed telemetry pulse indicator",
    isHero: false,
  },
  {
    slug: "omnigrid-night",
    source: path.resolve(rootDir, "src/assets/og-hero-02.jpg"),
    alt: "Modern luxury home living area illuminated seamlessly after sunset using daytime stored solar energy",
    isHero: false,
  },
  {
    slug: "commercial-hero",
    source: path.resolve(rootDir, "src/assets/enterprise_mw_rooftop.jpg"),
    alt: "2 MW commercial technology campus rooftop solar array at sunrise engineered for industrial load offset",
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
    alt: "Architectural 3D CAD multi-roof estate layout model engineered for comprehensive solar generation",
    isHero: false,
  },
  {
    slug: "liquid-glass",
    source: path.resolve(rootDir, "src/assets/liquid-glass-master.jpg"),
    alt: "Liquid anti-reflective tempered glass coating reflecting sky and capturing oblique sun rays",
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
