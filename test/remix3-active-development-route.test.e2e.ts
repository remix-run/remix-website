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

describe("Remix 3 active development route", () => {
  it("renders key active-development content", async (t) => {
    let page = await t.serve(server);
    const response = await page.goto("/remix-3-active-development");
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
