import type { RemixTestConfig } from "remix/test";

export default {
  glob: {
    test: "app/**/*.test.{ts,tsx,mts}",
    exclude: ["e2e/**", "node_modules/**"],
  },
  setup: "./test/setup-test-env.ts",
  type: ["server"],
} satisfies RemixTestConfig;
