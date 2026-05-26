import { expect, type Page } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { router } from "../app/router.ts";
import { ticketModalConfig } from "../app/controllers/jam/2026/tickets-modal-contract.ts";
import { swallowAbortErrors } from "../test/setup.ts";

async function markPage(page: Page) {
  return page.evaluate(() => {
    let marker = Math.random().toString(36).slice(2);
    (window as Window & { __jamNavMarker?: string }).__jamNavMarker = marker;
    return marker;
  });
}

async function gotoGallery(page: Page) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/jam/2025/gallery");
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

  let box = await ticketLink.boundingBox();
  if (!box) throw new Error("Expected Jam 2026 ticket link to have a box");

  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

function galleryPhotoLinks(page: Page) {
  return page.locator('main a[href^="/jam/2025/gallery?photo="]').filter({
    has: page.locator("img"),
  });
}

async function galleryHasAtLeast(page: Page, minimumPhotos: number) {
  let noPhotosMessage = page.getByText("No photos available yet.");
  if (await noPhotosMessage.isVisible()) {
    return false;
  }

  let photoLinks = galleryPhotoLinks(page);
  let count = await photoLinks.count();
  return count >= minimumPhotos;
}

describe("Jam", () => {
  it("jam mobile menu opens and shows jam links", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/jam/2025");

    let menu = page.locator('details:has(nav[aria-label="Mobile"])').filter({
      has: page.locator('a[href="/jam/2025/lineup"]'),
    });
    let menuToggle = menu.locator("summary");
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    let mobileNav = menu.locator('nav[aria-label="Mobile"]');
    await expect(mobileNav).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "Schedule & Lineup" }),
    ).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "Gallery" }),
    ).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "Code of Conduct" }),
    ).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "FAQ" })).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Ticket" })).toBeVisible();
  });

  it("jam root redirects to jam 2026", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/jam");
    await page.waitForURL("**/jam/2026");
    await expect(page.locator("main")).toBeVisible();
  });

  it("jam 2025 page renders", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/jam/2025");
    await expect(page.locator("main")).toBeVisible();
  });

  it("jam 2026 ticket modal navigates in place and closes without remounting", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/jam/2026");

    let marker = await markPage(page);
    await clickJam2026TicketNavLink(page);
    await page.waitForURL("**/jam/2026/ticket");
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveTitle("Remix Jam 2026 Tickets");

    await page.locator(`[${ticketModalConfig.attributes.backdrop}]`).click({
      position: { x: 8, y: 8 },
    });
    await page.waitForURL("**/jam/2026");
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveTitle("Remix Jam 2026");

    await clickJam2026TicketNavLink(page);
    await page.waitForURL("**/jam/2026/ticket");
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await page.waitForURL("**/jam/2026");
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveTitle("Remix Jam 2026");

    await clickJam2026TicketNavLink(page);
    await page.waitForURL("**/jam/2026/ticket");
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.goBack();
    await page.waitForURL("**/jam/2026");
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await clickJam2026TicketNavLink(page);
    await page.waitForURL("**/jam/2026/ticket");
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  it("jam 2026 mobile layout does not create horizontal document overflow", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/jam/2026");

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

  it("jam 2025 after-event badge shows rewind icon", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/jam/2025");

    let heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Rewind");
    await expect(heading.locator('use[href$="#fast-forward"]')).toHaveCount(1);
  });

  it("jam 2025 newsletter submits and shows success state", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    let submittedEmail: string | null = null;
    let submittedTag: string | null = null;
    await page.route("**/_actions/newsletter", async (route) => {
      let submittedBody = new URLSearchParams(route.request().postData() ?? "");
      submittedEmail = submittedBody.get("email");
      submittedTag = submittedBody.get("tag");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, error: null }),
      });
    });

    await page.goto("/jam/2025");

    let emailInput = page.getByPlaceholder("your@email.com");
    await emailInput.fill("hello@example.com");
    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page.getByText(/You're good to go/i)).toBeVisible();
    await expect(emailInput).toHaveValue("");
    expect(submittedEmail).toBe("hello@example.com");
    expect(submittedTag).toBe("6280341");
  });

  it("jam info navigation stays client-side without a full reload", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await page.goto("/jam/2025");

    let marker = await markPage(page);
    await page.getByRole("link", { name: "Schedule & Lineup" }).first().click();

    await page.waitForURL("**/jam/2025/lineup");
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

    await page.waitForURL("**/jam/2025/faq");
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

  it("jam gallery modal opens with query param and closes via controls", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await gotoGallery(page);
    if (!(await galleryHasAtLeast(page, 1))) return;

    let marker = await markPage(page);
    await galleryPhotoLinks(page).first().click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=0/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("link", { name: "Close modal" })).toBeVisible();
    await expectMarkerToStay(page, marker);

    await page.getByRole("link", { name: "Next photo" }).click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=\d+/);
    await expectMarkerToStay(page, marker);

    await page.getByRole("link", { name: "Close modal" }).click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expectMarkerToStay(page, marker);
  });

  it("jam gallery keyboard navigation moves between photos", async (t) => {
    let handler = swallowAbortErrors(router);
    let page = await t.serve(await createTestServer(handler));
    await gotoGallery(page);
    if (!(await galleryHasAtLeast(page, 2))) return;

    let marker = await markPage(page);
    await galleryPhotoLinks(page).first().click();
    await expectMarkerToStay(page, marker);
    await expect(page.getByRole("dialog")).toBeVisible();
    let previousLink = page.getByRole("link", { name: "Previous photo" });
    let nextLink = page.getByRole("link", { name: "Next photo" });
    await expect(page.getByRole("link", { name: "Close modal" })).toBeFocused();
    await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=1/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
    await expect(nextLink).toBeFocused();
    await expectMarkerToStay(page, marker);

    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=0/);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();
    await expect(previousLink).toBeFocused();
    await expectMarkerToStay(page, marker);

    await page.getByRole("link", { name: "Close modal" }).click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expectMarkerToStay(page, marker);
  });
});
