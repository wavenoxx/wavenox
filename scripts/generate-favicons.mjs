import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.resolve("public");

// Precision geometric WAVENOX mark
// Deep obsidian background (#111215) with precision-beveled architectural 'W' and amber energy facet
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="108" fill="#111215"/>
  <!-- Subtle ambient inner glow -->
  <rect x="12" y="12" width="488" height="488" rx="96" fill="none" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="2"/>
  
  <g transform="translate(0, 8)">
    <!-- Architectural W Monogram -->
    <!-- Left outer wing -->
    <path d="M 104 168 L 168 360 H 204 L 140 168 Z" fill="#FFFFFF"/>
    <!-- Left inner diagonal -->
    <path d="M 188 360 L 256 168 H 220 L 160 336 Z" fill="#E2E4E8"/>
    <!-- Right inner diagonal with precision cut -->
    <path d="M 256 168 L 324 360 H 288 L 228 192 Z" fill="#E2E4E8"/>
    <!-- Right outer wing -->
    <path d="M 372 168 L 308 360 H 344 L 408 168 Z" fill="#FFFFFF"/>

    <!-- Center apex solar beam facet (amber accent) -->
    <polygon points="256,128 274,158 238,158" fill="#F57C00"/>
    
    <!-- Clean horizontal datum baseline -->
    <line x1="168" y1="360" x2="344" y2="360" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-opacity="0.3"/>
  </g>
</svg>`;

async function main() {
  fs.writeFileSync(path.join(publicDir, "favicon.svg"), svgContent.trim());
  console.log("Created public/favicon.svg");

  const svgBuffer = Buffer.from(svgContent);

  // 1. 512x512 icon
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, "icon-512.png"));
  console.log("Created public/icon-512.png");

  // 2. 192x192 icon (for PWA webmanifest)
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, "icon-192.png"));
  console.log("Created public/icon-192.png");

  // 3. 180x180 apple-touch-icon
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, "apple-touch-icon.png"));
  console.log("Created public/apple-touch-icon.png");

  // 4. 32x32 favicon.ico (PNG format in .ico container or 32x32 PNG)
  // Modern browsers accept 32x32 PNG as favicon.ico
  await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(publicDir, "favicon.ico"));
  console.log("Created public/favicon.ico (32x32)");

  // 5. site.webmanifest
  const manifest = {
    name: "WAVENOX Clean Energy",
    short_name: "WAVENOX",
    description: "Architectural rooftop solar and energy storage systems.",
    start_url: "/",
    display: "standalone",
    background_color: "#111215",
    theme_color: "#171A20",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };

  fs.writeFileSync(
    path.join(publicDir, "site.webmanifest"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log("Created public/site.webmanifest");
}

main().catch((err) => {
  console.error("Failed to generate favicons:", err);
  process.exit(1);
});
