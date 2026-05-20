import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import mdx from "fumadocs-mdx/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    mdx(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        filter: (page) => !page.path.startsWith("/api/") && !page.path.includes("#"),
      },
      pages: [{ path: "/" }, { path: "/sitemap.xml" }, { path: "/llms.txt" }, { path: "/llms-full.txt" }],
    }),
    react(),
  ],
});
