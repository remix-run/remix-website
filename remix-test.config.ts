import type { RemixTestConfig } from "remix/test";

export default {
  concurrency: 1,
  coverage: process.env.NODE_ENV === "test",
  playwrightConfig: {
    projects: [{ name: "chromium", use: { browserName: "chromium" } }],
    use: {
      actionTimeout: 10_000,
      navigationTimeout: 10_000,
    },
  },
  setup: "./test/setup.ts",
} satisfies RemixTestConfig;
