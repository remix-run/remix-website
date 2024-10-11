import { defineConfig, splitVendorChunkPlugin } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import arraybuffer from "vite-plugin-arraybuffer";

declare module "@remix-run/server-runtime" {
  interface Future {
    v3_singleFetch: true;
  }
}

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
    splitVendorChunkPlugin(),
    arraybuffer(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
        v3_optimizeDeps: true,
      },
    }),
  ],
});
