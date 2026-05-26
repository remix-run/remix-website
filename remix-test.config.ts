import type { RemixTestConfig } from "remix/test";

export default {
  concurrency: process.env.CI ? 1 : undefined,
  coverage: process.env.COVERAGE === "1" || process.argv.includes("--coverage"),
  playwrightConfig: {
    projects: [{ name: "chromium", use: { browserName: "chromium" } }],
    use: {
      actionTimeout: 10_000,
      navigationTimeout: 10_000,
    },
  },
  setup: "./test/setup.ts",
} satisfies RemixTestConfig;
