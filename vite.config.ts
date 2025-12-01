import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import arraybuffer from "vite-plugin-arraybuffer";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  optimizeDeps: { exclude: ["svg2img"] },
  plugins: [
    tsconfigPaths(),
    arraybuffer(),
    reactRouter(),
    visualizer({
      filename: "./build/stats.html",
      open: process.env.ANALYZE === "true",
      gzipSize: true,
      brotliSize: true,
      template: "treemap", // or "sunburst", "network"
    }),
  ],
});
