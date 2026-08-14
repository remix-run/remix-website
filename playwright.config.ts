import { defineConfig } from "@playwright/test";

export default defineConfig({
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  use: {
    actionTimeout: 10_000,
    colorScheme: "light",
    locale: "en-US",
    navigationTimeout: 10_000,
    timezoneId: "America/New_York",
    viewport: { width: 1280, height: 720 },
  },
});
