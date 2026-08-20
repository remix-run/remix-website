import { expect } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { createAppRouter } from "../app/router.ts";
import { routes } from "../app/routes.ts";
import type { NewsletterRepository } from "../app/actions/newsletter/archive.ts";
import {
  swallowAbortErrors,
  waitForClientEntryHydration,
} from "../test/setup.ts";

let emptyNewsletterRepository: NewsletterRepository = {
  async listSummaries() {
    return [];
  },
  async getIssue() {
    return null;
  },
  async getImage() {
    return null;
  },
};

function waitForNewsletterHydration(page: import("@playwright/test").Page) {
  return waitForClientEntryHydration(
    page,
    `form[action="${routes.newsletter.subscribe.href()}"]`,
  );
}

describe("Newsletter page (/newsletter)", () => {
  it("submits to /newsletter and shows success", async (t) => {
    let handler = swallowAbortErrors(
      createAppRouter({ newsletterRepository: emptyNewsletterRepository }),
    );
    let page = await t.serve(await createTestServer(handler));
    let submittedEmail: string | null = null;

    await page.route(
      `**${routes.newsletter.subscribe.href()}`,
      async (route) => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        let body = new URLSearchParams(route.request().postData() ?? "");
        submittedEmail = body.get("email");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true, error: null }),
        });
      },
    );

    await page.goto(routes.newsletter.index.href());
    await waitForNewsletterHydration(page);

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
    let handler = swallowAbortErrors(
      createAppRouter({ newsletterRepository: emptyNewsletterRepository }),
    );
    let page = await t.serve(await createTestServer(handler));
    await page.route(
      `**${routes.newsletter.subscribe.href()}`,
      async (route) => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ ok: false, error: "Something went wrong" }),
        });
      },
    );

    await page.goto(routes.newsletter.index.href());
    await waitForNewsletterHydration(page);

    await expect(page.getByPlaceholder("name@example.com")).toBeVisible();
    await page.getByPlaceholder("name@example.com").fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });
});
