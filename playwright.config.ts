import { defineConfig } from "@playwright/test";

export default defineConfig({
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  use: {
    actionTimeout: 10_000,
    navigationTimeout: 10_000,
  },
});
