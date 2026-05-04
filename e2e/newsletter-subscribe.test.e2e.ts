import { expect } from "@playwright/test";
import { describe, it } from "remix/test";

import { createE2EPage } from "../test/e2e.ts";

describe("Newsletter subscribe", () => {
  it("renders the newsletter form in the Remix 3 active development section", async (t) => {
    let page = await createE2EPage(t);
    await page.goto("/remix-3-active-development");

    await expect(
      page.getByRole("heading", { name: "Stay in the loop" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Remix Newsletter" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Subscribe" })).toBeVisible();
  });

  it("shows success UI and resets the form", async (t) => {
    let page = await createE2EPage(t);
    await page.route("**/_actions/newsletter", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, error: null }),
      });
    });

    await page.goto("/remix-3-active-development");
    await page.waitForLoadState("networkidle");

    let emailInput = page.getByPlaceholder("name@example.com");
    await expect(async () => {
      await emailInput.fill("hello@example.com");
      await page.getByRole("button", { name: "Subscribe" }).click();
      await expect(page.getByText("Got it!")).toBeVisible({
        timeout: 1_000,
      });
    }).toPass({ timeout: 10_000 });

    await expect(page.getByText("Got it!")).toBeVisible();
    await expect(page.getByText(/check your email/i)).toBeVisible();
    await expect(emailInput).toHaveValue("");
  });

  it("shows server error UI when submission fails", async (t) => {
    let page = await createE2EPage(t);
    await page.route("**/_actions/newsletter", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Something went wrong" }),
      });
    });

    await page.goto("/remix-3-active-development");
    await page.waitForLoadState("networkidle");

    await expect(async () => {
      await page.getByPlaceholder("name@example.com").fill("hello@example.com");
      await page.getByRole("button", { name: "Subscribe" }).click();
      await expect(page.getByText("Something went wrong")).toBeVisible({
        timeout: 1_000,
      });
    }).toPass({ timeout: 10_000 });

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  it("shows pending state while request is in flight", async (t) => {
    let page = await createE2EPage(t);
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

    await page.goto("/remix-3-active-development");
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

describe("Homepage newsletter", () => {
  it("submits the start-building form through the newsletter action", async (t) => {
    let page = await createE2EPage(t);
    let submittedEmail: string | null = null;

    await page.route("**/_actions/newsletter", async (route) => {
      let body = new URLSearchParams(route.request().postData() ?? "");
      submittedEmail = body.get("email");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, error: null }),
      });
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    let startBuilding = page.locator("#start-building");
    let emailInput = startBuilding.getByPlaceholder("name@example.com");
    await expect(async () => {
      await emailInput.fill("hello@example.com");
      await startBuilding.getByRole("button", { name: "Subscribe" }).click();
      await expect(startBuilding.getByText("Got it!")).toBeVisible({
        timeout: 1_000,
      });
    }).toPass({ timeout: 10_000 });

    expect(submittedEmail).toBe("hello@example.com");
    await expect(startBuilding.getByText("Got it!")).toBeVisible();
    await expect(emailInput).toHaveValue("");
  });
});

describe("Newsletter page (/newsletter)", () => {
  it("renders the newsletter page with form", async (t) => {
    let page = await createE2EPage(t);
    await page.goto("/newsletter");

    await expect(page.getByText("Newsletter").first()).toBeVisible();
    await expect(
      page.getByText(/Stay up-to-date with news, announcements/i),
    ).toBeVisible();
    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: "Subscribe" })).toBeVisible();
  });

  it("newsletter page form submits to /_actions/newsletter and shows success", async (t) => {
    let page = await createE2EPage(t);
    await page.route("**/_actions/newsletter", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, error: null }),
      });
    });

    await page.goto("/newsletter");
    await page.waitForLoadState("networkidle");

    let emailInput = page.getByPlaceholder("name@example.com");
    await expect(async () => {
      await emailInput.fill("hello@example.com");
      await page.getByRole("button", { name: "Subscribe" }).click();
      await expect(page.getByText("Got it!")).toBeVisible({
        timeout: 1_000,
      });
    }).toPass({ timeout: 10_000 });

    await expect(page.getByText("Got it!")).toBeVisible();
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});
