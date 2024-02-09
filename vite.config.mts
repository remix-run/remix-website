import { defineConfig, splitVendorChunkPlugin } from "vite";
import { unstable_vitePlugin as remix } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import arraybuffer from "vite-plugin-arraybuffer";

export default defineConfig({
  ssr: {
    noExternal: ["@docsearch/react"],
  },
  plugins: [tsconfigPaths(), splitVendorChunkPlugin(), arraybuffer(), remix()],
});
