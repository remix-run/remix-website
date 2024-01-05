import { defineConfig, splitVendorChunkPlugin } from "vite";
import { unstable_vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  plugins: [
    remix(),
    tsconfigPaths(),
    splitVendorChunkPlugin(),
  ],
});
