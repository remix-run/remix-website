/// <reference types="vite/client" />

import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Load all env vars (no prefix filter) from .env, .env.test, etc.
let env = loadEnv("test", process.cwd(), "");

console.log({ env });

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    {
      name: "mock-assets",
      enforce: "pre",
      resolveId(id) {
        if (id.includes("?assets")) {
          return "\0virtual:mock-asset";
        }
      },
      load(id) {
        if (id === "\0virtual:mock-asset") {
          return 'export default { entry: "/mock-entry", js: [{href:"/mock-entry"}, {href:"/mock-chunk"}], css: [{href:"/mock-css"}], merge() { return this; } };';
        }
      },
    },
  ],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
    exclude: ["e2e/**", "node_modules/**"],
    env,
  },
});
