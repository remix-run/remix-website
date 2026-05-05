import type { RemixTestConfig } from "remix/test";

export default {
  coverage: process.env.NODE_ENV === "test",
  playwrightConfig: {
    projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  },
  setup: "./test/setup-test-env.ts",
} satisfies RemixTestConfig;
