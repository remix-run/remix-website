/// <reference types="vite/client" />

import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Load all env vars (no prefix filter) from .env, .env.test, etc.
let env = loadEnv("test", process.cwd(), "");

console.log({ env });

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
    exclude: ["e2e/**", "node_modules/**"],
    env,
  },
});
