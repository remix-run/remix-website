import { expect } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { router } from "../app/router.ts";
import { swallowAbortErrors } from "../test/setup.ts";

describe("Newsletter page (/newsletter)", () => {
  it("submits to /_actions/newsletter and shows success", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
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

    await page.goto("/newsletter", { waitUntil: "networkidle" });

    let emailInput = page.getByPlaceholder("name@example.com");
    await expect(emailInput).toBeVisible();
    await emailInput.fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("Got it!")).toBeVisible();
    await expect(page.getByText(/check your email/i)).toBeVisible();
    await expect(emailInput).toHaveValue("");
    expect(submittedEmail).toBe("hello@example.com");
  });

  it("shows server error UI when submission fails", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.route("**/_actions/newsletter", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Something went wrong" }),
      });
    });

    await page.goto("/newsletter");

    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await page.getByPlaceholder("name@example.com").fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });
});
