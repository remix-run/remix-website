import { test, expect, type Page } from "@playwright/test";

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
  await dismissViteAbortOverlay(page);
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

async function dismissViteAbortOverlay(page: Page) {
  let overlay = page.locator("vite-error-overlay");
  if ((await overlay.count()) === 0) return;

  let overlayText = (await overlay.textContent()) ?? "";
  if (!overlayText.includes("aborted")) return;

  await page.keyboard.press("Escape");
  await expect(overlay).toHaveCount(0);
}

async function clickWithViteAbortOverlayRetry(
  page: Page,
  locator: ReturnType<Page["locator"]>,
) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await dismissViteAbortOverlay(page);

    try {
      await locator.click({ timeout: 1_000 });
      return;
    } catch (error) {
      let overlay = page.locator("vite-error-overlay");
      let overlayText = (await overlay.textContent()) ?? "";
      if (!(await overlay.count()) || !overlayText.includes("aborted")) {
        throw error;
      }
    }
  }

  await dismissViteAbortOverlay(page);
  await locator.click();
}

function galleryPhotoLinks(page: Page) {
  return page.locator("[data-gallery-photo-link]").filter({
    has: page.locator("img"),
  });
}

async function skipIfGalleryHasFewerThan(page: Page, minimumPhotos: number) {
  let noPhotosMessage = page.getByText("No photos available yet.");
  if (await noPhotosMessage.isVisible()) {
    test.skip(true, "No gallery photos available in this environment");
  }

  let photoLinks = galleryPhotoLinks(page);
  let count = await photoLinks.count();
  if (count < minimumPhotos) {
    test.skip(
      true,
      `Need at least ${minimumPhotos} gallery photos in this environment`,
    );
  }
}

test.describe("Jam", () => {
  test("jam mobile menu opens and shows jam links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/jam/2025");

    let menuToggle = page
      .locator('details:has(nav[aria-label="Mobile"]) > summary')
      .first();
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    let mobileNav = page.getByRole("navigation", { name: "Mobile" });
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

  test("jam root redirects to jam 2025", async ({ page }) => {
    await page.goto("/jam");
    await page.waitForURL("**/jam/2025");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam 2025 page renders", async ({ page }) => {
    await page.goto("/jam/2025");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam 2025 after-event badge shows rewind icon", async ({ page }) => {
    await page.goto("/jam/2025");

    let heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Rewind");
    await expect(heading.locator('use[href$="#fast-forward"]')).toHaveCount(1);
  });

  test("jam 2025 newsletter submits and shows success state", async ({
    page,
  }) => {
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
    await page.waitForLoadState("networkidle");

    let emailInput = page.getByPlaceholder("your@email.com");
    await emailInput.fill("hello@example.com");
    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page.getByText(/You're good to go/i)).toBeVisible();
    await expect(emailInput).toHaveValue("");
    expect(submittedEmail).toBe("hello@example.com");
    expect(submittedTag).toBe("6280341");
  });

  test("jam 2025 newsletter shows error state for failed submissions", async ({
    page,
  }) => {
    await page.route("**/_actions/newsletter", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ ok: false, error: "Something went wrong" }),
      });
    });

    await page.goto("/jam/2025");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("your@email.com").fill("hello@example.com");
    await page.getByRole("button", { name: "Sign Up" }).click();

    await expect(page.getByText("Something went wrong")).toBeVisible();
    await expect(page.getByText(/please try again\./i)).toBeVisible();
  });

  test("jam 2025 newsletter shows loading state while submitting", async ({
    page,
  }) => {
    let resolveRequest: (() => void) | undefined;
    let requestReleased = new Promise<void>((resolve) => {
      resolveRequest = resolve;
    });
    await page.route("**/_actions/newsletter", async (route) => {
      await requestReleased;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, error: null }),
      });
    });

    await page.goto("/jam/2025");
    await page.waitForLoadState("networkidle");

    await page.getByPlaceholder("your@email.com").fill("hello@example.com");
    await page.getByRole("button", { name: "Sign Up" }).click();

    let pendingButton = page.getByRole("button", { name: "Signing Up..." });
    await expect(pendingButton).toBeVisible();
    await expect(pendingButton).toBeDisabled();

    resolveRequest?.();
    await expect(page.getByText(/You're good to go/i)).toBeVisible();
  });

  test("jam ticket page renders", async ({ page }) => {
    await page.goto("/jam/2025/ticket");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam lineup page renders", async ({ page }) => {
    await page.goto("/jam/2025/lineup");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam lineup desktop accordion toggles open and closed", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/jam/2025/lineup");

    let firstAccordion = page.locator("[data-accordion-item]").first();
    let firstSummary = firstAccordion.locator("summary");
    await expect(firstAccordion).not.toHaveAttribute("open", "");

    await firstSummary.click();
    await expect(firstAccordion).toHaveAttribute("open", "");

    await firstSummary.click();
    await expect(firstAccordion).not.toHaveAttribute("open", "");
  });

  test("jam lineup desktop accordion settles correctly after rapid toggles", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/jam/2025/lineup");

    let firstAccordion = page.locator("[data-accordion-item]").first();
    let firstSummary = firstAccordion.locator("summary");

    await firstSummary.click();
    await firstSummary.click();
    await expect(firstAccordion).not.toHaveAttribute("open", "");
  });

  test("jam faq page renders", async ({ page }) => {
    await page.goto("/jam/2025/faq");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam info navigation stays client-side without a full reload", async ({
    page,
  }) => {
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

  test("jam code of conduct page renders", async ({ page }) => {
    await page.goto("/jam/2025/coc");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam gallery page renders", async ({ page }) => {
    await page.goto("/jam/2025/gallery");
    await expect(page.locator("main")).toBeVisible();
  });

  test("jam gallery modal opens with query param and closes via controls", async ({
    page,
  }) => {
    await gotoGallery(page);
    await skipIfGalleryHasFewerThan(page, 1);

    let marker = await markPage(page);
    await galleryPhotoLinks(page).first().click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=0/);
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Close modal" })).toBeVisible();
    await expectMarkerToStay(page, marker);

    await page.getByRole("link", { name: "Next photo" }).click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=\d+/);
    await expectMarkerToStay(page, marker);

    await page.getByRole("link", { name: "Close modal" }).click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery$/);
    await expect(page.locator("[data-gallery-modal]")).toHaveCount(0);
    await expectMarkerToStay(page, marker);
  });

  test("jam gallery escape closes modal and restores focus to opened photo", async ({
    page,
  }) => {
    await gotoGallery(page);
    await skipIfGalleryHasFewerThan(page, 1);

    let firstPhotoLink = galleryPhotoLinks(page).first();
    let marker = await markPage(page);
    await firstPhotoLink.click();
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Close modal" })).toBeFocused();
    await expectMarkerToStay(page, marker);

    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/jam\/2025\/gallery$/);
    await expect(page.locator("[data-gallery-modal]")).toHaveCount(0);
    await expectMarkerToStay(page, marker);
    await expect(firstPhotoLink).toBeFocused();
  });

  test("jam gallery close button restores focus to opened photo", async ({
    page,
  }) => {
    await gotoGallery(page);
    await skipIfGalleryHasFewerThan(page, 1);

    let firstPhotoLink = galleryPhotoLinks(page).first();
    let marker = await markPage(page);
    await firstPhotoLink.click();
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Close modal" })).toBeFocused();
    await expectMarkerToStay(page, marker);
    await clickWithViteAbortOverlayRetry(
      page,
      page.getByRole("link", { name: "Close modal" }),
    );
    await expect(page).toHaveURL(/\/jam\/2025\/gallery$/);
    await expect(page.locator("[data-gallery-modal]")).toHaveCount(0);
    await expectMarkerToStay(page, marker);
    await expect(firstPhotoLink).toBeFocused();
  });

  test("jam gallery download link returns attachment response", async ({
    page,
  }) => {
    await gotoGallery(page);
    await skipIfGalleryHasFewerThan(page, 1);
    await page.goto("/jam/2025/gallery?photo=0");

    let downloadLink = page.getByRole("link", {
      name: "Download full resolution image",
    });
    await expect(downloadLink).toBeVisible();

    let downloadHref = await downloadLink.getAttribute("href");
    expect(downloadHref).toMatch(/^\/jam\/2025\/gallery\/download\?photo=\d+$/);
    await expect(downloadLink).toHaveAttribute(
      "download",
      /remix-jam-2025-photo-\d+\.jpg/,
    );

    let response = await page.request.get(downloadHref!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-disposition"]).toContain("attachment;");
  });

  test("jam gallery keyboard navigation moves between photos", async ({
    page,
  }) => {
    await gotoGallery(page);
    await skipIfGalleryHasFewerThan(page, 2);

    let marker = await markPage(page);
    await galleryPhotoLinks(page).first().click();
    await expectMarkerToStay(page, marker);
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Close modal" })).toBeFocused();
    await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=1/);
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();
    await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
    await expectMarkerToStay(page, marker);

    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=0/);
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();
    await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();
    await expectMarkerToStay(page, marker);

    await page.getByRole("link", { name: "Close modal" }).click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery$/);
    await expect(page.locator("[data-gallery-modal]")).toHaveCount(0);
    await expectMarkerToStay(page, marker);
  });

  test("jam gallery clears the current image while next photo is loading", async ({
    page,
  }) => {
    await gotoGallery(page);
    await skipIfGalleryHasFewerThan(page, 2);

    await page.route("**/jam/2025/gallery?photo=1", async (route) => {
      await page.waitForTimeout(250);
      await route.continue();
    });

    await galleryPhotoLinks(page).first().click();
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();
    await expect(page.locator("[data-gallery-modal-photo]")).toBeVisible();

    await page.getByRole("link", { name: "Next photo" }).click();

    await expect(page.locator("[data-gallery-modal]")).toHaveAttribute(
      "data-gallery-image-state",
      "pending",
    );
    await expect(page.locator("[data-gallery-modal-photo]")).toBeHidden();

    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=1/);
    await expect(page.locator("[data-gallery-modal]")).not.toHaveAttribute(
      "data-gallery-image-state",
      "pending",
    );
    await expect(page.locator("[data-gallery-modal-photo]")).toBeVisible();
  });

  test("jam gallery modal traps focus while open", async ({ page }) => {
    await gotoGallery(page);
    await skipIfGalleryHasFewerThan(page, 1);

    let firstPhotoLink = galleryPhotoLinks(page).first();
    await firstPhotoLink.click();
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();
    let closeLink = page.getByRole("link", { name: "Close modal" });
    let downloadLink = page.getByRole("link", {
      name: "Download full resolution image",
    });
    let previousLink = page.getByRole("link", { name: "Previous photo" });
    let nextLink = page.getByRole("link", { name: "Next photo" });

    await expect(closeLink).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(downloadLink).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(previousLink).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(nextLink).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(closeLink).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(nextLink).toBeFocused();
  });
});
