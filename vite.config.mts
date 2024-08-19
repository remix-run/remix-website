import { defineConfig, splitVendorChunkPlugin } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import arraybuffer from "vite-plugin-arraybuffer";
import { openGraphImagePlugin } from "remix-og-image/plugin";

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
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        unstable_singleFetch: true,
        unstable_lazyRouteDiscovery: true,
      },
    }),
    openGraphImagePlugin({
      elementSelector: "#og-image",
      outputDirectory: "public/og",
      format: "webp",
    }),
  ],
});
