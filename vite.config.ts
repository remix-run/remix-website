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
          input: globSync("./remix/assets/**/*.{ts,tsx}").filter(
            (f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx"),
          ),
        },
      },
    },
    ssr: {
      build: {
        rollupOptions: {
          input: "remix/server.ts",
        },
      },
    },
  },
  plugins: [
    tsconfigPaths({ projects: ["./app/tsconfig.json"] }),
    arraybuffer(),
    fullstack({
      serverEnvironments: ["ssr"],
    }),
    reactRouter(),
  ],
});
