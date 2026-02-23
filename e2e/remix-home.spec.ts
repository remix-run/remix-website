import { test, expect } from "@playwright/test";

test.describe("Remix home preview", () => {
  test("renders key homepage content", async ({ page }) => {
    const response = await page.goto("/remix-home");
    expect(response?.ok()).toBe(true);

    await expect(page).toHaveTitle(/Remix Home/);
    await expect(
      page.getByRole("heading", { name: "Remix 3 is under active development" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Stay in the loop" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Watch the repo" }),
    ).toBeVisible();
  });
});
