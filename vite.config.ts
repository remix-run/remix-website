import { defineConfig } from "vite";
import fullstack from "@hiogawa/vite-plugin-fullstack";
import { globSync } from "tinyglobby";

export default defineConfig({
  build: {
    outDir: "build/client",
    sourcemap: true,
  },
  environments: {
    client: {
      build: {
        outDir: "build/client",
        rollupOptions: {
          input: globSync("./app/assets/**/*.{ts,tsx}").filter(
            (f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"),
          ),
        },
      },
    },
    ssr: {
      build: {
        outDir: "build/server",
        rollupOptions: {
          input: {
            index: "app/router.ts",
          },
          output: {
            entryFileNames: "index.js",
          },
        },
      },
    },
  },
  plugins: [
    fullstack({
      serverEnvironments: ["ssr"],
    }),
  ],
  builder: {
    async buildApp(builder) {
      // fullstack plugin requires ssr -> client order to emit its assets manifest.
      await builder.build(builder.environments.ssr!);
      await builder.build(builder.environments.client!);
      await builder.writeAssetsManifest();
    },
  },
});
