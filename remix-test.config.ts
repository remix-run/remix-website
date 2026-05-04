import type { RemixTestConfig } from "remix/test";

export default {
  browser: {
    echo: false,
    open: false,
  },
  concurrency: 1,
  glob: {
    test: "**/*.test{,.browser,.e2e}.{ts,tsx}",
    e2e: "e2e/**/*.test.e2e.{ts,tsx}",
    exclude: ["node_modules/**", "e2e/**/*.spec.ts"],
  },
  playwrightConfig: {
    projects: [{ name: "chromium", use: { browserName: "chromium" } }],
    use: {
      navigationTimeout: 10_000,
      actionTimeout: 10_000,
    },
  },
  project: "chromium",
  setup: "./test/setup-test-env.ts",
  type: ["server"],
} satisfies RemixTestConfig;
