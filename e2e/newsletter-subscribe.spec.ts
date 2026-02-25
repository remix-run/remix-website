import { test, expect } from "@playwright/test";

test.describe("Newsletter subscribe", () => {
  test("renders the newsletter form in the home page section", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Stay in the loop" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Remix Newsletter" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Subscribe" })).toBeVisible();
  });

  test("shows success UI and resets the form", async ({ page }) => {
    await page.route("**/_actions/newsletter", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, error: null }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const emailInput = page.getByPlaceholder("name@example.com");
    await emailInput.fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("Got it!")).toBeVisible();
    await expect(page.getByText(/check your email/i)).toBeVisible();
    await expect(emailInput).toHaveValue("");
  });

  test("shows server error UI when submission fails", async ({ page }) => {
    await page.route("**/_actions/newsletter", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Something went wrong" }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("name@example.com").fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  test("shows pending state while request is in flight", async ({ page }) => {
    let resolveRequest: (() => void) | undefined;
    const requestReleased = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });

    await page.route("**/_actions/newsletter", async (route) => {
      await requestReleased;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, error: null }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("name@example.com").fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    const pendingButton = page.getByRole("button", { name: "Subscribing..." });
    await expect(pendingButton).toBeVisible();
    await expect(pendingButton).toBeDisabled();

    resolveRequest?.();

    await expect(page.getByText("Got it!")).toBeVisible();
  });
});

test.describe("Newsletter page (/newsletter)", () => {
  test("renders the newsletter page with form", async ({ page }) => {
    await page.goto("/newsletter");

    await expect(page.getByText("Newsletter").first()).toBeVisible();
    await expect(
      page.getByText(/Stay up-to-date with news, announcements/i),
    ).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Subscribe" })).toBeVisible();
  });

  test("newsletter page form submits to /_actions/newsletter and shows success", async ({
    page,
  }) => {
    await page.route("**/_actions/newsletter", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, error: null }),
      });
    });

    await page.goto("/newsletter");
    await page.waitForLoadState("networkidle");

    const emailInput = page.getByPlaceholder("name@example.com");
    await emailInput.fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("Got it!")).toBeVisible();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});
