import { expect } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { afterAll, beforeAll, describe, it } from "remix/test";

import { router } from "../app/router.ts";
import { swallowAbortErrors } from "../test/setup.ts";

let server!: { baseUrl: string; close: () => Promise<void> };
let closeServer: () => Promise<void>;

beforeAll(async () => {
  let handler = swallowAbortErrors(router);
  let realServer = await createTestServer(handler);
  server = { baseUrl: realServer.baseUrl, close: async () => {} };
  closeServer = () => realServer.close();
});

afterAll(async () => {
  await closeServer();
});

describe("Homepage", () => {
  it("renders the page", async (t) => {
    let page = await t.serve(server);
    await page.goto("/");
    await expect(page).toHaveTitle(/Remix/i);
  });

  it("has a visible header with navigation", async (t) => {
    let page = await t.serve(server);
    await page.goto("/", { waitUntil: "networkidle" });
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  it("has a visible footer", async (t) => {
    let page = await t.serve(server);
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
