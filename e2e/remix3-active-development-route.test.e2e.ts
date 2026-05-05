import { expect } from "@playwright/test";
import { describe, it } from "remix/test";

import { createE2EPage } from "../test/e2e.ts";

describe("Remix 3 active development route", () => {
  it("renders key active-development content", async (t) => {
    let page = await createE2EPage(t);
    const response = await page.goto("/remix-3-active-development", {
      waitUntil: "domcontentloaded",
    });
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
