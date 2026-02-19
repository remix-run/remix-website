import { defineConfig } from "vite";
import fullstack from "@hiogawa/vite-plugin-fullstack";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import arraybuffer from "vite-plugin-arraybuffer";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: [
            "app/entry.client.tsx",
            "app/remix/client.ts",
            "app/remix/counter.tsx",
          ],
        },
      },
    },
    ssr: {
      build: {
        rollupOptions: {
          input: "server/server.ts",
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
  // builder: {
  //   async buildApp(builder) {
  //     await builder.build(builder.environments.client);
  //     await builder.build(builder.environments.ssr);
  //   },
  // },
});
