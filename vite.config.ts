import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/**
 * LifeHub is intentionally a fully local application: all user data is kept
 * in IndexedDB, so it does not need a server-side runtime. A plain Vite build
 * makes the resulting PWA portable and dependable on Cloudflare Pages.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
