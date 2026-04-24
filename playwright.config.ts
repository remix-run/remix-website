import { defineConfig, devices } from "@playwright/test";

let playwrightBaseUrl = "http://localhost:44101";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: playwrightBaseUrl,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "pnpm exec cross-env PLAYWRIGHT_TEST=1 NODE_ENV=development PORT=44101 tsx watch server.ts",
    url: playwrightBaseUrl,
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "ignore",
    stderr: process.env.PLAYWRIGHT_WEB_SERVER_LOGS === "1" ? "pipe" : "ignore",
  },
});
