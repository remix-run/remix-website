import { expect } from "@playwright/test";
import { describe, it } from "remix/test";

import { createE2EPage, waitForRemixReady } from "../test/e2e.ts";

describe("Homepage", () => {
  it("renders the page", async (t) => {
    let page = await createE2EPage(t);
    await page.goto("/");
    await expect(page).toHaveTitle(/Remix/i);
  });

  it("has a visible header with navigation", async (t) => {
    let page = await createE2EPage(t);
    await page.goto("/");
    await waitForRemixReady(page);
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  it("has a visible footer", async (t) => {
    let page = await createE2EPage(t);
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
