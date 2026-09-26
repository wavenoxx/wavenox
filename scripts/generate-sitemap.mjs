import fs from "node:fs";
import path from "node:path";

const SITE_URL = (process.env.VITE_SITE_URL || "https://wavenox.in").replace(/\/+$/, "");
const publicDir = path.resolve("public");

const ROUTES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/residential", priority: "0.9", changefreq: "weekly" },
  { path: "/omnigrid", priority: "0.9", changefreq: "weekly" },
  { path: "/enterprise", priority: "0.9", changefreq: "weekly" },
  { path: "/deploy", priority: "0.9", changefreq: "weekly" },
  { path: "/technology", priority: "0.8", changefreq: "monthly" },
  { path: "/warranty", priority: "0.8", changefreq: "monthly" },
  { path: "/service-areas", priority: "0.8", changefreq: "monthly" },
  { path: "/net-metering", priority: "0.8", changefreq: "monthly" },
  { path: "/architects", priority: "0.8", changefreq: "monthly" },
  { path: "/faq", priority: "0.8", changefreq: "weekly" },
  { path: "/our-story", priority: "0.7", changefreq: "monthly" },
  { path: "/legal/terms", priority: "0.5", changefreq: "yearly" },
  { path: "/legal/privacy", priority: "0.5", changefreq: "yearly" },
  { path: "/legal/disclosures", priority: "0.5", changefreq: "yearly" },
];

const today = new Date().toISOString().split("T")[0];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (r) => `  <url>
    <loc>${SITE_URL}${r.path === "/" ? "/" : r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
).join("\n")}
</urlset>
`;

const robotsTxt = `User-agent: *
Allow: /
Disallow: /order/received

Sitemap: ${SITE_URL}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml.trim() + "\n");
console.log(`Generated public/sitemap.xml for ${SITE_URL} (${ROUTES.length} routes)`);

fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt.trim() + "\n");
console.log(`Generated public/robots.txt with sitemap reference`);
