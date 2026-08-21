import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { beforeEach, describe, it } from "remix/test";

import { createAppRouter } from "../app/router.ts";
import { routes } from "../app/routes.ts";
import { ticketModalConfig } from "../app/actions/jam/y2026/public/tickets-modal-contract.ts";
import { env } from "../app/utils/env.ts";
import { newsletterTagIds } from "../app/utils/public/newsletter-tags.ts";
import {
  swallowAbortErrors,
  waitForClientEntryHydration,
} from "../test/setup.ts";

async function markPage(page: Page) {
  return page.evaluate(() => {
    let marker = Math.random().toString(36).slice(2);
    (window as Window & { __jamNavMarker?: string }).__jamNavMarker = marker;
    return marker;
  });
}

async function expectMarkerToStay(page: Page, marker: string) {
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __jamNavMarker?: string }).__jamNavMarker,
      ),
    )
    .toBe(marker);
}

async function clickJam2026TicketNavLink(page: Page) {
  let ticketLink = page
    .getByRole("navigation", { name: "Page navigation" })
    .getByRole("link", { name: "Get tickets" });
  await expect(ticketLink).toBeVisible();

  await ticketLink.click();
}

describe("Jam", () => {
  let router: ReturnType<typeof createAppRouter>;

  beforeEach(() => {
    router = createAppRouter();
  });

  it("jam 2026 ticket modal navigates in place and closes without remounting", async (t) => {
    mockStorefront(t);
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(routes.jam.y2026.index.href());

    let marker = await markPage(page);
    await clickJam2026TicketNavLink(page);
    await page.waitForURL(`**${routes.jam.y2026.ticket.index.href()}`);
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveTitle("Remix Jam 2026 Tickets");
    await expect(
      page.getByRole("dialog").getByRole("link", { name: "Close tickets" }),
    ).toBeFocused();

    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(
      page.getByRole("dialog").locator("[aria-live='polite']"),
    ).toHaveText("2");
    await expect(page.getByRole("button", { name: "Check out" })).toBeEnabled();

    await page.locator(`[${ticketModalConfig.attributes.backdrop}]`).click({
      position: { x: 8, y: 8 },
    });
    await page.waitForURL(`**${routes.jam.y2026.index.href()}`);
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveTitle("Remix Jam 2026");

    await clickJam2026TicketNavLink(page);
    await page.waitForURL(`**${routes.jam.y2026.ticket.index.href()}`);
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await page.waitForURL(`**${routes.jam.y2026.index.href()}`);
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveTitle("Remix Jam 2026");

    await clickJam2026TicketNavLink(page);
    await page.waitForURL(`**${routes.jam.y2026.ticket.index.href()}`);
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.goBack();
    await page.waitForURL(`**${routes.jam.y2026.index.href()}`);
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await clickJam2026TicketNavLink(page);
    await page.waitForURL(`**${routes.jam.y2026.ticket.index.href()}`);
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  it("jam 2026 mobile layout does not create horizontal document overflow", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(routes.jam.y2026.index.href());

    let overflow = await page.evaluate(() => {
      return (
        Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth,
        ) - window.innerWidth
      );
    });

    expect(overflow).toBeLessThanOrEqual(1);
  });

  it("jam 2025 newsletter submits through its signup frame", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    let submittedEmail: string | null = null;
    let submittedTag: string | null = null;
    t.mock.method(globalThis, "fetch", (_input, init) => {
      let submittedBody = JSON.parse(String(init?.body ?? "{}")) as {
        email?: string;
        tags?: number[];
      };
      submittedEmail = submittedBody.email ?? null;
      submittedTag = String(submittedBody.tags?.[0] ?? "");
      return Promise.resolve(Response.json({}));
    });

    await page.goto(routes.jam.y2025.index.href());
    await waitForClientEntryHydration(
      page,
      'form[data-rmx-target="newsletter-subscribe"]',
    );

    let emailInput = page.getByPlaceholder("your@email.com");
    await emailInput.fill("hello@example.com");
    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page.getByText(/You're good to go/i)).toBeVisible();
    await expect(emailInput).toHaveValue("");
    await expect(page).toHaveURL(
      new RegExp(`${routes.jam.y2025.index.href()}$`),
    );
    expect(submittedEmail).toBe("hello@example.com");
    expect(submittedTag).toBe(String(newsletterTagIds.jam2025Updates));
  });

  it("jam 2026 newsletter submits through its signup frame", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    let submittedEmail: string | null = null;
    let submittedTag: string | null = null;
    t.mock.method(globalThis, "fetch", (_input, init) => {
      let submittedBody = JSON.parse(String(init?.body ?? "{}")) as {
        email?: string;
        tags?: number[];
      };
      submittedEmail = submittedBody.email ?? null;
      submittedTag = String(submittedBody.tags?.[0] ?? "");
      return Promise.resolve(Response.json({}));
    });

    await page.goto(routes.jam.y2026.index.href());
    await waitForClientEntryHydration(page, "#newsletter");
    let newsletterForm = page.locator(
      'form[data-rmx-target="newsletter-subscribe"]',
    );
    await expect(newsletterForm).toHaveAttribute(
      "data-rmx-src",
      /\/newsletter\?frame=jam2026$/,
    );
    await expect(newsletterForm).toHaveAttribute(
      "data-rmx-reset-scroll",
      "false",
    );

    let emailInput = page.getByPlaceholder("your@email.com");
    let submitButton = page.getByRole("button", { name: "Sign up" });
    await emailInput.fill("hello@example.com");
    await submitButton.scrollIntoViewIfNeeded();
    let scrollYBeforeSubmit = await page.evaluate(() => window.scrollY);
    let submissionResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname === routes.newsletter.subscribe.href(),
    );
    await submitButton.click();

    await submissionResponse;
    await expect(page.getByText(/You're on the list/i)).toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }),
    );
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollYBeforeSubmit);
    await expect(emailInput).toHaveValue("");
    await expect(page).toHaveURL(
      new RegExp(`${routes.jam.y2026.index.href()}$`),
    );
    expect(submittedEmail).toBe("hello@example.com");
    expect(submittedTag).toBe(String(newsletterTagIds.jam2026Updates));
  });

  it("jam info navigation stays client-side without a full reload", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto(routes.jam.y2025.index.href());

    let marker = await markPage(page);
    await page.getByRole("link", { name: "Schedule & Lineup" }).first().click();

    await page.waitForURL(`**${routes.jam.y2025.lineup.href()}`);
    await expect(page).toHaveTitle(/Schedule and Lineup/i);
    await expect(page.getByText("Oct 10 2025", { exact: true })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as Window & { __jamNavMarker?: string }).__jamNavMarker,
        ),
      )
      .toBe(marker);

    await page.getByRole("link", { name: "FAQ" }).first().click();

    await page.waitForURL(`**${routes.jam.y2025.faq.href()}`);
    await expect(page).toHaveTitle(/FAQ/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByText("Where can I find the event lineup?", { exact: true }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () => (window as Window & { __jamNavMarker?: string }).__jamNavMarker,
        ),
      )
      .toBe(marker);
  });
});

function mockStorefront(t: { after(cleanup: () => void): void }) {
  let previousEnv = { ...env };
  let originalFetch = globalThis.fetch;
  Reflect.set(env, "PUBLIC_STOREFRONT_API_TOKEN", ["test", "token"].join("-"));
  globalThis.fetch = async (input, init) => {
    let url = String(input);
    if (url !== "https://jam.remix.run/api/2026-04/graphql.json") {
      return originalFetch(input, init);
    }

    let body = JSON.parse(String(init?.body ?? "{}"));
    if (body.query.includes("cartCreate")) {
      return Response.json({
        data: {
          cartCreate: {
            cart: {
              id: "gid://shopify/Cart/2026",
              checkoutUrl: "https://jam.remix.run/checkouts/2026",
              discountCodes: [],
            },
            userErrors: [],
            warnings: [],
          },
        },
      });
    }

    return Response.json({
      data: {
        product: {
          id: "gid://shopify/Product/2026",
          variants: {
            edges: [
              {
                node: {
                  id: "gid://shopify/ProductVariant/2026",
                  price: { amount: "299.00" },
                  availableForSale: true,
                },
              },
            ],
          },
        },
      },
    });
  };

  t.after(() => {
    Object.assign(env, previousEnv);
    globalThis.fetch = originalFetch;
  });
}
