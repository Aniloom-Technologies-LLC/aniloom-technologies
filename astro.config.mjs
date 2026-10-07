import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://aniloom.tech",
  integrations: [react()],
  redirects: {
    "/playable-ads/development/": "/playable-ads/#development",
    "/playable-ads/qa-release-readiness/": "/playable-ads/#verification",
    "/playable-ads/how-we-work/": "/playable-ads/#workflow",
    "/playable-ads/case-studies/magic-thai-playables/": "/playable-ads/#demonstrations",
    "/playable-ads/release-quality-platform-readiness/": "/playable-ads/#verification",
  },
  build: {
    format: "directory",
  },
});
