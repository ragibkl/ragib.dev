// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://ragib.dev",
  integrations: [sitemap()],
  // Compression drops the space between a line of text and a link that starts
  // the next line ("an<a>"). The pages are small, and nginx gzips them anyway.
  compressHTML: false,
  // Dev and preview run behind the Coder workspace proxy, whose hostnames vary.
  // Production is served by nginx, so this has no effect there.
  server: { allowedHosts: true },
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
    },
  },
});
