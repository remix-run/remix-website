import { defineConfig } from "vite";
import fullstack from "@hiogawa/vite-plugin-fullstack";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import arraybuffer from "vite-plugin-arraybuffer";
import { globSync } from "tinyglobby";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: [
            "./remix/lib/entry.client.ts",
            ...globSync("./remix/assets/**/*.tsx"),
          ],
        },
      },
    },
    ssr: {
      build: {
        rollupOptions: {
          input: "remix/server.ts",
        },
      },
      resolve: {
        noExternal: ["@docsearch/react"],
      },
    },
  },
  optimizeDeps: { exclude: ["svg2img"] },
  plugins: [
    tsconfigPaths(),
    arraybuffer(),
    fullstack({
      serverEnvironments: ["ssr"],
    }),
    reactRouter(),
  ],
});
