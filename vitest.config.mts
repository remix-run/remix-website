import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Load all env vars (no prefix filter) from .env, .env.test, etc.
let env = loadEnv("test", process.cwd(), "");

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
    include: ["app/**/*.test.{ts,tsx,mts}"],
    exclude: ["e2e/**", "node_modules/**"],
    env,
  },
});
