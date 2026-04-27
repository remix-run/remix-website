import { test, expect } from "@playwright/test";

test.describe("Remix 3 active development route", () => {
  test("renders key active-development content", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBe(true);

    await expect(page).toHaveTitle(/Remix/i);
    await expect(
      page.getByRole("heading", {
        name: "Remix 3 is under active development",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Stay in the loop" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Remix Newsletter" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Watch the repo" }),
    ).toBeVisible();
  });
});
