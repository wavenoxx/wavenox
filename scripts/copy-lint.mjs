import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "../src");

const BANNED_TERMS = [
  "Atelier",
  "Monolithic",
  "Sovereign",
  "Bespoke",
  "Institutional",
  "Obsidian",
  "Quantum",
  "Dossier",
  "Seamless",
  "Apex",
  "Kinetic",
  "Nocturnal",
  "Charter",
  "Pillars",
  "Command Center",
  "Masterpiece",
  "Ultra-luxury",
  "Unparalleled",
  "Elevate",
  "Unleash",
  "Absolute power",
  "Zero compromise",
  "Tesla",
  "Powerwall",
  "portfolio concept",
  "without subcontractor",
  "guaranteed engineering",
  "100% solar self-consumption",
  "24/7 outage protection",
];

// Pattern rules requiring negative lookahead (e.g., preserve SBI's official "Solar Roof Top" loan title)
const EXTRA_BANNED_REGEXES = [/\bSolar Roof\b(?!\s+Top)/gi];

const BANNED_REGEX = new RegExp(
  `\\b(${BANNED_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi",
);

async function scanDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await scanDir(fullPath)));
    } else if (
      entry.isFile() &&
      /\.(tsx?|jsx?|md)$/.test(entry.name) &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test.tsx") &&
      !entry.name.includes("routeTree.gen")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const files = await scanDir(srcDir);
  const violations = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      for (const regex of [BANNED_REGEX, ...EXTRA_BANNED_REGEXES]) {
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(line)) !== null) {
          violations.push({
            file: path.relative(path.resolve(__dirname, ".."), filePath),
            line: index + 1,
            word: match[0],
            text: line.trim(),
          });
        }
      }
    });
  }

  if (violations.length > 0) {
    console.error(`\n❌ Found ${violations.length} banned copy terms in src/:\n`);
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line} -> "${v.word}": ${v.text}`);
    }
    console.error(
      "\nPlease replace banned buzzwords or unverified claims with calm, plain Pan-India solar engineering language.",
    );
    process.exit(1);
  } else {
    console.log(
      "✅ Copy lint passed: 0 banned marketing buzzwords, trademark terms, or unverified claims found in src/.",
    );
  }
}

main().catch((err) => {
  console.error("Error in copy-lint:", err);
  process.exit(1);
});
