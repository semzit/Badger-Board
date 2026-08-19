import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@badger-board": path.resolve(import.meta.dirname, "./src"),
    },
  },
  base: "/",
  optimizeDeps: {
    include: ["@badger/shared"],
  },
  build: {
    outDir: "docs",
    commonjsOptions: {
      include: [/node_modules/, /@badger[\\/]shared/, /packages[\\/]shared/],
    },
  },
});
