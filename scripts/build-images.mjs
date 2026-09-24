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
    alt: "Contemporary residential villa with low-profile monocrystalline solar panels on flat terrace roof",
    isHero: true,
  },
  {
    slug: "home-design",
    source: path.resolve(rootDir, "src/assets/home-design-master.jpg"),
    alt: "Concealed mounting structure and seamless black solar panels integrated into rooftop terrace",
    isHero: false,
  },
  {
    slug: "home-outage",
    source: path.resolve(rootDir, "src/assets/home-outage-master.jpg"),
    alt: "Warmly illuminated residential home powered by Omnigrid battery storage during an evening grid disruption",
    isHero: false,
  },
  {
    slug: "home-heat",
    source: path.resolve(rootDir, "src/assets/og-hero-01.jpg"),
    alt: "High-efficiency N-type TOPCon bifacial solar cells capturing midday sunlight in extreme temperatures",
    isHero: false,
  },
  {
    slug: "home-final",
    source: path.resolve(rootDir, "src/assets/res-hero-02.jpg"),
    alt: "Architectural residential terrace with elevated solar pergola living canopy at twilight",
    isHero: false,
  },
  {
    slug: "omnigrid-hero",
    source: path.resolve(rootDir, "src/assets/og-core.jpg"),
    alt: "Omnigrid home battery energy storage system mounted cleanly on garage wall with live telemetry indicator",
    isHero: true,
  },
  {
    slug: "homes-hero",
    source: path.resolve(rootDir, "src/assets/res-hero-01.jpg"),
    alt: "Urban independent home with complete turnkey residential rooftop solar installation",
    isHero: true,
  },
  {
    slug: "commercial-hero",
    source: path.resolve(rootDir, "src/assets/enterprise_mw_rooftop.jpg"),
    alt: "Multi-megawatt industrial manufacturing facility rooftop solar array engineered for heavy load offset",
    isHero: true,
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
        if (kb > budgetKb) {
          console.warn(`  WARNING: ${shot.slug} exceeds size budget (${kb} KB > ${budgetKb} KB)`);
        }
      }
    }

    // Generate mobile portrait crop (aspect 4:5 - e.g. 800w x 1000h)
    const mobileWidth = 800;
    const mobileHeight = 1000;

    const mobileAvifFile = `${shot.slug}-mobile.avif`;
    await sharp(imgBuffer)
      .resize(mobileWidth, mobileHeight, { fit: "cover", position: "center" })
      .avif({ quality: 75, effort: 5 })
      .toFile(path.join(outDir, mobileAvifFile));

    const mobileWebpFile = `${shot.slug}-mobile.webp`;
    await sharp(imgBuffer)
      .resize(mobileWidth, mobileHeight, { fit: "cover", position: "center" })
      .webp({ quality: 80 })
      .toFile(path.join(outDir, mobileWebpFile));

    const mobileJpgFile = `${shot.slug}-mobile.jpg`;
    await sharp(imgBuffer)
      .resize(mobileWidth, mobileHeight, { fit: "cover", position: "center" })
      .jpeg({ quality: 82, mozjpeg: true })
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
