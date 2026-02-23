import { test, expect } from "@playwright/test";

test.describe("Remix home preview", () => {
  test("loads without local asset/module failures", async ({ page, baseURL }) => {
    const failedRequests: string[] = [];
    const moduleLoadErrors: string[] = [];
    const appBaseUrl = baseURL ?? "http://localhost:5173";

    page.on("requestfailed", (request) => {
      const url = request.url();
      if (!url.startsWith(appBaseUrl)) return;

      // Focus on the migration surfaces that have regressed recently.
      if (
        url.includes("/remix/") ||
        url.includes("/app/icons.svg") ||
        url.includes("/marketing/")
      ) {
        failedRequests.push(`${request.method()} ${url}`);
      }
    });

    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();

      if (
        text.includes("Failed to fetch dynamically imported module") ||
        text.includes("[createFrame] Failed to load module")
      ) {
        moduleLoadErrors.push(text);
      }
    });

    const response = await page.goto("/remix-home");
    expect(response?.ok()).toBe(true);

    await expect(page).toHaveTitle(/Remix Home/);
    await expect(
      page.getByRole("heading", { name: "Remix 3 is under active development" }),
    ).toBeVisible();

    expect(failedRequests).toEqual([]);
    expect(moduleLoadErrors).toEqual([]);
  });
});
