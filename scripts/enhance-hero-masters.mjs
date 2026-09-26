import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function enhanceMasters() {
  console.log("🎨 Enhancing Desktop Hero Master to 2752x1536 (Ultra-HD / 2x Retina)...");
  const desktopSource = path.join(rootDir, "src/assets/home-hero-master.jpg");
  const desktopBuffer = await fs.readFile(desktopSource);

  await sharp(desktopBuffer)
    .resize(2752, 1536, { kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 1.01, saturation: 1.05 })
    .sharpen({ sigma: 1.3, m1: 0.05, m2: 2.4, x1: 2 })
    .jpeg({ quality: 98, mozjpeg: true })
    .toFile(desktopSource);

  console.log("🎨 Enhancing Mobile Hero Master to 1536x2752 (Ultra-HD 9:16 Portrait)...");
  const mobileSource = path.join(rootDir, "src/assets/home-hero-mobile-master.jpg");
  const mobileBuffer = await fs.readFile(mobileSource);

  await sharp(mobileBuffer)
    .resize(1536, 2752, { kernel: sharp.kernel.lanczos3 })
    .modulate({ brightness: 1.01, saturation: 1.05 })
    .sharpen({ sigma: 1.3, m1: 0.05, m2: 2.4, x1: 2 })
    .jpeg({ quality: 98, mozjpeg: true })
    .toFile(mobileSource);

  console.log("✨ Master hero images successfully upgraded to peak resolution and clarity!");
}

enhanceMasters().catch((err) => {
  console.error("Error enhancing masters:", err);
  process.exit(1);
});
