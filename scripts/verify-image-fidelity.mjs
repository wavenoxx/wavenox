import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.resolve(rootDir, "public/media");

const MIN_SSIM = 0.985;
const MIN_PSNR_DB = 38.0;

const SHOTS = [
  {
    slug: "home-hero",
    prefix: "home-hero-v3",
    desktopMaster: "home-hero-master.webp",
    mobileMaster: "home-hero-mobile-master.webp",
  },
  {
    slug: "home-design",
    prefix: "home-design-v2",
    desktopMaster: "home-design-master.webp",
    mobileMaster: "home-design-mobile-master.webp",
  },
  {
    slug: "home-outage",
    prefix: "home-outage-v2",
    desktopMaster: "home-outage-master.webp",
    mobileMaster: "home-outage-mobile-master.webp",
  },
  {
    slug: "home-heat",
    prefix: "home-heat",
    desktopMaster: "home-heat-master.jpg",
    mobileMaster: null,
  },
  {
    slug: "home-final",
    prefix: "home-final-v2",
    desktopMaster: "home-final-master.webp",
    mobileMaster: "home-final-mobile-master.webp",
  },
  {
    slug: "res-hero",
    prefix: "res-hero-v2",
    desktopMaster: "res-hero-master.webp",
    mobileMaster: "res-hero-mobile-master.webp",
  },
  {
    slug: "res-terrace",
    prefix: "res-terrace-v2",
    desktopMaster: "res-terrace-master.webp",
    mobileMaster: "res-terrace-mobile-master.webp",
  },
  {
    slug: "res-weather",
    prefix: "res-weather-v2",
    desktopMaster: "res-weather-master.webp",
    mobileMaster: "res-weather-mobile-master.webp",
  },
  {
    slug: "res-turnkey",
    prefix: "res-turnkey-v2",
    desktopMaster: "res-turnkey-master.webp",
    mobileMaster: "res-turnkey-mobile-master.webp",
  },
  {
    slug: "omnigrid-hero",
    prefix: "omnigrid-hero-v2",
    desktopMaster: "omnigrid-hero-master.webp",
    mobileMaster: "omnigrid-hero-mobile-master.webp",
  },
  {
    slug: "omnigrid-switchover",
    prefix: "omnigrid-switchover-v2",
    desktopMaster: "omnigrid-switchover-master.webp",
    mobileMaster: "omnigrid-switchover-mobile-master.webp",
  },
  {
    slug: "omnigrid-night",
    prefix: "omnigrid-night-v2",
    desktopMaster: "omnigrid-night-master.webp",
    mobileMaster: "omnigrid-night-mobile-master.webp",
  },
  {
    slug: "commercial-hero",
    prefix: "commercial-hero-v2",
    desktopMaster: "commercial-hero-master.webp",
    mobileMaster: "commercial-hero-mobile-master.webp",
  },
  {
    slug: "commercial-industrial",
    prefix: "commercial-industrial-v2",
    desktopMaster: "commercial-industrial-master.webp",
    mobileMaster: "commercial-industrial-mobile-master.webp",
  },
  {
    slug: "commercial-campus",
    prefix: "commercial-campus-v2",
    desktopMaster: "commercial-campus-master.webp",
    mobileMaster: "commercial-campus-mobile-master.webp",
  },
  {
    slug: "commercial-closing",
    prefix: "commercial-closing-v2",
    desktopMaster: "commercial-closing-master.webp",
    mobileMaster: "commercial-closing-mobile-master.webp",
  },
  {
    slug: "studio-villa",
    prefix: "studio-villa-v2",
    desktopMaster: "studio-villa-master.webp",
    mobileMaster: null,
  },
  {
    slug: "studio-estate",
    prefix: "studio-estate-v2",
    desktopMaster: "studio-estate-master.webp",
    mobileMaster: null,
  },
];

function computePsnrAndSsim(origRgb, compRgb, width, height) {
  const totalPixels = width * height;
  const totalChannels = totalPixels * 3;
  let mseSum = 0;

  const lumOrig = new Float32Array(totalPixels);
  const lumComp = new Float32Array(totalPixels);

  for (let p = 0, c = 0; p < totalPixels; p++, c += 3) {
    const r1 = origRgb[c];
    const g1 = origRgb[c + 1];
    const b1 = origRgb[c + 2];
    const r2 = compRgb[c];
    const g2 = compRgb[c + 1];
    const b2 = compRgb[c + 2];

    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    mseSum += dr * dr + dg * dg + db * db;

    lumOrig[p] = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
    lumComp[p] = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;
  }

  const mse = mseSum / totalChannels;
  const psnr = mse === 0 ? 99.99 : 10 * Math.log10((255 * 255) / mse);

  // 8x8 windowed luminance SSIM
  const C1 = 6.5025; // (0.01 * 255)^2
  const C2 = 58.5225; // (0.03 * 255)^2
  const step = 8;
  let ssimSum = 0;
  let blockCount = 0;

  for (let y = 0; y + step <= height; y += step) {
    for (let x = 0; x + step <= width; x += step) {
      let sumX = 0;
      let sumY = 0;
      for (let dy = 0; dy < step; dy++) {
        const rowOffset = (y + dy) * width + x;
        for (let dx = 0; dx < step; dx++) {
          sumX += lumOrig[rowOffset + dx];
          sumY += lumComp[rowOffset + dx];
        }
      }
      const n = step * step;
      const muX = sumX / n;
      const muY = sumY / n;

      let varX = 0;
      let varY = 0;
      let covXY = 0;
      for (let dy = 0; dy < step; dy++) {
        const rowOffset = (y + dy) * width + x;
        for (let dx = 0; dx < step; dx++) {
          const dxVal = lumOrig[rowOffset + dx] - muX;
          const dyVal = lumComp[rowOffset + dx] - muY;
          varX += dxVal * dxVal;
          varY += dyVal * dyVal;
          covXY += dxVal * dyVal;
        }
      }
      varX /= n - 1;
      varY /= n - 1;
      covXY /= n - 1;

      const numerator = (2 * muX * muY + C1) * (2 * covXY + C2);
      const denominator = (muX * muX + muY * muY + C1) * (varX + varY + C2);
      ssimSum += numerator / denominator;
      blockCount++;
    }
  }

  const ssim = blockCount > 0 ? ssimSum / blockCount : 1;
  return { psnr, ssim };
}

async function decodeRgb(filePath, targetWidth, targetHeight) {
  let pipe = sharp(filePath).removeAlpha();
  if (targetWidth && targetHeight) {
    pipe = pipe.resize(targetWidth, targetHeight, { fit: "fill" });
  }
  return pipe.raw().toBuffer({ resolveWithObject: true });
}

async function evaluatePair(label, masterFile, outFile) {
  const masterPath = path.join(rootDir, "src/assets", masterFile);
  const outPath = path.join(outDir, outFile);

  const [masterStat, outStat, masterDecoded] = await Promise.all([
    fs.stat(masterPath),
    fs.stat(outPath),
    decodeRgb(masterPath),
  ]);
  const outDecoded = await decodeRgb(outPath, masterDecoded.info.width, masterDecoded.info.height);
  const { psnr, ssim } = computePsnrAndSsim(
    masterDecoded.data,
    outDecoded.data,
    masterDecoded.info.width,
    masterDecoded.info.height,
  );

  const masterKb = Math.round(masterStat.size / 1024);
  const outKb = Math.round(outStat.size / 1024);
  const savingsPct = Math.round(((masterStat.size - outStat.size) / masterStat.size) * 100);
  const pass = ssim >= MIN_SSIM && psnr >= MIN_PSNR_DB;

  console.log(
    `${pass ? "PASS" : "FAIL"} | ${label.padEnd(28)} | ${String(masterKb).padStart(4)}KB -> ${String(outKb).padStart(4)}KB (${String(savingsPct).padStart(3)}%) | SSIM ${ssim.toFixed(4)} | PSNR ${psnr.toFixed(2)} dB`,
  );

  return { label, masterKb, outKb, savingsPct, ssim, psnr, pass };
}

async function main() {
  console.log(
    `Verifying perceptual fidelity against masters (Min SSIM >= ${MIN_SSIM}, Min PSNR >= ${MIN_PSNR_DB} dB)...`,
  );
  const results = [];

  for (const shot of SHOTS) {
    const masterMeta = await sharp(path.join(rootDir, "src/assets", shot.desktopMaster)).metadata();
    const w = masterMeta.width;
    results.push(
      await evaluatePair(
        `${shot.slug} desktop AVIF`,
        shot.desktopMaster,
        `${shot.prefix}-${w}w.avif`,
      ),
    );
    results.push(
      await evaluatePair(
        `${shot.slug} desktop WebP`,
        shot.desktopMaster,
        `${shot.prefix}-${w}w.webp`,
      ),
    );

    if (shot.mobileMaster) {
      const mobMeta = await sharp(path.join(rootDir, "src/assets", shot.mobileMaster)).metadata();
      const mw = mobMeta.width;
      results.push(
        await evaluatePair(
          `${shot.slug} mobile AVIF`,
          shot.mobileMaster,
          `${shot.prefix}-mobile-${mw}w.avif`,
        ),
      );
      results.push(
        await evaluatePair(
          `${shot.slug} mobile WebP`,
          shot.mobileMaster,
          `${shot.prefix}-mobile-${mw}w.webp`,
        ),
      );
    }
  }

  const totalMasterKb = results
    .filter((r) => r.label.endsWith("AVIF"))
    .reduce((sum, r) => sum + r.masterKb, 0);
  const totalAvifKb = results
    .filter((r) => r.label.endsWith("AVIF"))
    .reduce((sum, r) => sum + r.outKb, 0);
  const totalWebpKb = results
    .filter((r) => r.label.endsWith("WebP"))
    .reduce((sum, r) => sum + r.outKb, 0);

  const failed = results.filter((r) => !r.pass);
  console.log("\nSummary:");
  console.log(
    `  Masters (32 assets): ${totalMasterKb} KB -> AVIF: ${totalAvifKb} KB (${Math.round(((totalMasterKb - totalAvifKb) / totalMasterKb) * 100)}% reduction) | Smart WebP: ${totalWebpKb} KB (${Math.round(((totalMasterKb - totalWebpKb) / totalMasterKb) * 100)}% reduction)`,
  );

  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} output(s) failed fidelity threshold!`);
    process.exit(1);
  }
  console.log(
    `✅ All ${results.length} outputs passed SSIM >= ${MIN_SSIM} and PSNR >= ${MIN_PSNR_DB} dB.`,
  );
}

main().catch((err) => {
  console.error("Fidelity verification error:", err);
  process.exit(1);
});
