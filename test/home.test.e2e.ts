import { expect, type Page } from "@playwright/test";
import sharp from "sharp";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { createAppRouter } from "../app/router.ts";
import { routes } from "../app/routes.ts";
import { swallowAbortErrors } from "./setup.ts";

async function litPixelRatio(page: Page) {
  const viewport = page.viewportSize();
  if (!viewport) return 0;

  const width = Math.min(200, viewport.width);
  const height = Math.min(100, viewport.height);
  const screenshot = await page.screenshot({
    clip: { x: 0, y: viewport.height - height, width, height },
  });
  const { data } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // This corner contains only WebGL; a cleared canvas has almost no lit pixels.
  let litPixels = 0;
  for (let i = 0; i < data.length; i += 3) {
    if (data[i] + data[i + 1] + data[i + 2] > 15) litPixels++;
  }
  return litPixels / (data.length / 3);
}

describe("Home", () => {
  it("reveals the server-rendered page when browser assets fail", async (t) => {
    const page = await t.serve(
      await createTestServer(swallowAbortErrors(createAppRouter())),
    );
    await page.route("**/assets/**", (route) => route.abort("failed"));

    const response = await page.goto(routes.home.href());
    expect(response?.ok()).toBe(true);

    const overlay = page.locator(".loading-screen-overlay");
    await expect(overlay).toBeVisible();
    await overlay.evaluate((element) => {
      const animations = element.getAnimations();
      if (animations.length === 0) {
        throw new Error("Loading screen is missing its fail-safe animation");
      }
      for (const animation of animations) {
        const endTime = Number(animation.effect?.getComputedTiming().endTime);
        animation.currentTime = endTime + 1;
      }
    });

    await expect(overlay).toBeHidden();
    await expect(page.locator("main")).toBeVisible();
  });

  it("keeps the particle scene visible after resizing with reduced motion", async (t) => {
    const page = await t.serve(
      await createTestServer(swallowAbortErrors(createAppRouter())),
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 800, height: 500 });

    const response = await page.goto(routes.home.href());
    expect(response?.ok()).toBe(true);
    await expect(page.locator("canvas").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect.poll(() => litPixelRatio(page)).toBeGreaterThan(0.1);

    for (let i = 1; i <= 10; i++) {
      await page.setViewportSize({ width: 800 + i * 10, height: 500 + i * 10 });
      await page.waitForTimeout(10);
    }

    await expect.poll(() => litPixelRatio(page)).toBeGreaterThan(0.1);
  });
});
