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
    'form[data-rmx-target="newsletter-subscribe"]',
  );
}

describe("Newsletter signup frame", () => {
  it("submits to /newsletter and shows success", async (t) => {
    let handler = swallowAbortErrors(
      createAppRouter({ newsletterRepository: emptyNewsletterRepository }),
    );
    let page = await t.serve(await createTestServer(handler));
    let submittedEmail: string | null = null;
    let releaseResponse!: () => void;
    let waitForResponse = new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    t.mock.method(globalThis, "fetch", async (_input, init) => {
      let body = JSON.parse(String(init?.body)) as { email?: string };
      submittedEmail = body.email ?? null;
      await waitForResponse;
      return Response.json({});
    });

    await page.goto(routes.newsletter.index.href());
    await waitForNewsletterHydration(page);

    let emailInput = page.getByPlaceholder("name@example.com");
    await expect(emailInput).toBeVisible();
    await emailInput.fill("hello@example.com");
    let submission = page.getByRole("button", { name: "Subscribe" }).click();
    await expect(
      page.getByRole("button", { name: "Subscribing..." }),
    ).toBeDisabled();
    releaseResponse();
    await submission;

    await expect(page.getByRole("status")).toContainText("Got it!");
    await expect(page.getByRole("status")).toContainText(/check your email/i);
    await expect(emailInput).toHaveValue("");
    await expect(page.getByRole("button", { name: "Subscribe" })).toBeEnabled();
    expect(submittedEmail).toBe("hello@example.com");
  });

  it("keeps a shared signup on its host page", async (t) => {
    let handler = swallowAbortErrors(
      createAppRouter({ newsletterRepository: emptyNewsletterRepository }),
    );
    let page = await t.serve(await createTestServer(handler));
    t.mock.method(globalThis, "fetch", () =>
      Promise.resolve(Response.json({})),
    );

    await page.goto(routes.remixHistory.index.href());
    await waitForNewsletterHydration(page);
    await page.getByPlaceholder("name@example.com").fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByRole("status")).toContainText("Got it!");
    await expect(page).toHaveURL(
      new RegExp(`${routes.remixHistory.index.href()}$`),
    );
  });

  it("keeps the landing signup on its host page", async (t) => {
    let handler = swallowAbortErrors(
      createAppRouter({ newsletterRepository: emptyNewsletterRepository }),
    );
    let page = await t.serve(await createTestServer(handler));
    let submittedEmail: string | null = null;
    t.mock.method(globalThis, "fetch", (_input, init) => {
      let submittedBody = JSON.parse(String(init?.body ?? "{}")) as {
        email?: string;
      };
      submittedEmail = submittedBody.email ?? null;
      return Promise.resolve(Response.json({}));
    });

    await page.goto(routes.home.href());
    await waitForNewsletterHydration(page);
    let form = page.locator('form[data-rmx-target="newsletter-subscribe"]');
    await expect(form).toHaveAttribute(
      "data-rmx-src",
      /\/newsletter\?frame=home$/,
    );
    await expect(form).toHaveAttribute("data-rmx-reset-scroll", "false");

    let emailInput = page.getByPlaceholder("name@example.com");
    await emailInput.fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(
      page.getByText(/Got it! Please check your email/i),
    ).toBeVisible();
    await expect(emailInput).toHaveValue("");
    await expect(page).toHaveURL(new RegExp(`${routes.home.href()}$`));
    expect(submittedEmail).toBe("hello@example.com");
  });

  it("shows server error UI when submission fails", async (t) => {
    let handler = swallowAbortErrors(
      createAppRouter({ newsletterRepository: emptyNewsletterRepository }),
    );
    let page = await t.serve(await createTestServer(handler));
    t.mock.method(console, "error", () => {});
    t.mock.method(globalThis, "fetch", () =>
      Promise.reject(new Error("network unavailable")),
    );

    await page.goto(routes.newsletter.index.href());
    await waitForNewsletterHydration(page);

    let emailInput = page.getByPlaceholder("name@example.com");
    await expect(emailInput).toBeVisible();
    await emailInput.fill("hello@example.com");
    await page.getByRole("button", { name: "Subscribe" }).click();

    await expect(page.getByRole("alert")).toContainText("Something went wrong");
    await expect(emailInput).toHaveValue("hello@example.com");
  });
});
