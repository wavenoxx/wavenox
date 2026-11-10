import { defineConfig } from "nitro/config";

export default defineConfig({
  // Precompress public assets for standalone SSR as well as CDN deployments.
  // Private responses remain dynamic and no-store.
  compressPublicAssets: { gzip: true, brotli: true },
});
