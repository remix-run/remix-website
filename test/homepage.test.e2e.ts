import { expect } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { router } from "../app/router.ts";
import { swallowAbortErrors } from "../test/setup.ts";

describe("Homepage", () => {
  it("renders the page", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/");
    await expect(page).toHaveTitle(/Remix/i);
  });

  it("has a visible header with navigation", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/", { waitUntil: "networkidle" });
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  it("has a visible footer", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
