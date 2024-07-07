import { defineConfig, splitVendorChunkPlugin } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import arraybuffer from "vite-plugin-arraybuffer";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  plugins: [
    tsconfigPaths(),
    splitVendorChunkPlugin(),
    arraybuffer(),
    remix({
      future: {
        unstable_singleFetch: true,
        unstable_fogOfWar: true,
      },
    }),
  ],
});
