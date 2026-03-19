import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./test/setup-test-env.ts"],
    include: ["remix/**/*.test.ts", "remix/**/*.test.tsx"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
