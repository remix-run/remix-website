import { test, expect } from "@playwright/test";

test.describe("Jam", () => {
  test("jam mobile menu opens and shows jam links", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/jam/2025");

    let menuToggle = page.locator('summary[aria-label="Open menu"]').first();
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

    let badge = page.locator("[data-jam-event-badge]");
    await expect(badge).toBeVisible();
    await expect(badge).toContainText("Rewind");
    await expect(badge.locator('use[href$="#fast-forward"]')).toHaveCount(1);
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

  test("jam ticket quantity controls update value", async ({ page }) => {
    await page.goto("/jam/2025/ticket");

    let soldOutButton = page.getByRole("button", { name: "Sold Out" });
    if (await soldOutButton.isVisible()) {
      test.skip(true, "Tickets are sold out in this environment");
    }

    let quantityInput = page
      .locator('main input[type="number"][readonly]')
      .first();
    await expect(quantityInput).toHaveValue("1");

    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(quantityInput).toHaveValue("2");

    await page.getByRole("button", { name: "Decrease quantity" }).click();
    await expect(quantityInput).toHaveValue("1");
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

  test("jam faq page renders", async ({ page }) => {
    await page.goto("/jam/2025/faq");
    await expect(page.locator("main")).toBeVisible();
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
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/jam/2025/gallery");

    let noPhotosMessage = page.getByText("No photos available yet.");
    if (await noPhotosMessage.isVisible()) {
      test.skip(true, "No gallery photos available in this environment");
    }

    await page.goto("/jam/2025/gallery?photo=0");
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=0/);
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();

    await page.getByRole("link", { name: "Next photo" }).click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=\d+/);

    await page.getByRole("link", { name: "Close modal" }).click();
    await expect(page).toHaveURL(/\/jam\/2025\/gallery$/);
    await expect(page.locator("[data-gallery-modal]")).toHaveCount(0);
  });

  test("jam gallery download link returns attachment response", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/jam/2025/gallery");

    let noPhotosMessage = page.getByText("No photos available yet.");
    if (await noPhotosMessage.isVisible()) {
      test.skip(true, "No gallery photos available in this environment");
    }

    await page.goto("/jam/2025/gallery?photo=0");
    let downloadLink = page.getByRole("link", {
      name: "Download full resolution image",
    });
    await expect(downloadLink).toBeVisible();

    let downloadHref = await downloadLink.getAttribute("href");
    expect(downloadHref).toMatch(/^\/jam\/2025\/gallery\/download\?photo=\d+$/);

    let response = await page.request.get(downloadHref!);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-disposition"]).toContain("attachment;");
  });

  test("jam gallery keyboard navigation moves and closes modal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/jam/2025/gallery");

    let noPhotosMessage = page.getByText("No photos available yet.");
    if (await noPhotosMessage.isVisible()) {
      test.skip(true, "No gallery photos available in this environment");
    }

    await page.goto("/jam/2025/gallery?photo=0");
    await expect(page.locator("[data-gallery-modal]")).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=1/);
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/\/jam\/2025\/gallery\?photo=0/);
    await page.waitForLoadState("networkidle");

    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/jam\/2025\/gallery$/);
    await expect(page.locator("[data-gallery-modal]")).toHaveCount(0);
  });
});
