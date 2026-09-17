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

  it("keeps the server-rendered page visible when browser assets arrive late", async (t) => {
    const page = await t.serve(
      await createTestServer(swallowAbortErrors(createAppRouter())),
    );
    let releaseParticleCanvas = () => {};
    const particleCanvasReleased = new Promise<void>((resolve) => {
      releaseParticleCanvas = resolve;
    });
    let markParticleCanvasRequested = () => {};
    const particleCanvasRequested = new Promise<void>((resolve) => {
      markParticleCanvasRequested = resolve;
    });
    await page.route("**/assets/**", async (route) => {
      if (route.request().url().includes("particle-canvas")) {
        markParticleCanvasRequested();
        await particleCanvasReleased;
      }
      await route.continue();
    });

    const response = await page.goto(routes.home.href());
    expect(response?.ok()).toBe(true);
    await particleCanvasRequested;
    const overlay = page.locator(".loading-screen-overlay");
    await expect(overlay).toBeVisible();
    await expect(overlay).toBeHidden({ timeout: 10_000 });
    await expect(page.locator("main")).toBeVisible();
    await page.evaluate(() => {
      const root = document.documentElement;
      root.dataset.loadingScreenReappeared = "false";
      const checkOverlay = () => {
        const element = document.querySelector(".loading-screen-overlay");
        if (!element) return;
        const style = getComputedStyle(element);
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity) > 0
        ) {
          root.dataset.loadingScreenReappeared = "true";
        }
      };
      new MutationObserver(checkOverlay).observe(root, {
        attributes: true,
        childList: true,
        subtree: true,
      });
      const sampleAnimationFrames = () => {
        checkOverlay();
        requestAnimationFrame(sampleAnimationFrames);
      };
      requestAnimationFrame(sampleAnimationFrames);
    });

    releaseParticleCanvas();
    await expect(page.locator("canvas").first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(overlay).toBeHidden();
    expect(
      await page.locator("html").getAttribute("data-loading-screen-reappeared"),
    ).toBe("false");
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

  it("navigates stack layers and examples with the keyboard", async (t) => {
    const page = await t.serve(
      await createTestServer(swallowAbortErrors(createAppRouter())),
    );
    const response = await page.goto(routes.home.href());
    expect(response?.ok()).toBe(true);

    await expect(
      page.locator('nav[aria-label="Primary"] a[href="/blog"]').first(),
    ).toBeVisible();

    const stackLayers = page.getByRole("tablist", {
      name: "Remix stack layers",
    });
    const server = stackLayers.getByRole("tab", {
      name: "Server",
      exact: true,
    });
    const data = stackLayers.getByRole("tab", { name: "Data", exact: true });
    const auth = stackLayers.getByRole("tab", { name: "Auth", exact: true });
    const assets = stackLayers.getByRole("tab", {
      name: "Assets",
      exact: true,
    });

    await server.focus();
    await server.press("ArrowRight");
    await expect(data).toBeFocused();
    await expect(data).toHaveAttribute("aria-selected", "true");
    await data.press("ArrowRight");
    await expect(auth).toBeFocused();
    await auth.press("ArrowRight");
    await expect(assets).toBeFocused();
    await expect(assets).toHaveAttribute("aria-selected", "true");

    const assetExamples = page.getByRole("tablist", {
      name: "Assets examples",
    });
    const assetServer = assetExamples.getByRole("tab", {
      name: "Server",
      exact: true,
    });
    const typescript = assetExamples.getByRole("tab", {
      name: "TypeScript",
      exact: true,
    });
    const caching = assetExamples.getByRole("tab", {
      name: "Caching",
      exact: true,
    });

    await expect(assetServer).toHaveAttribute("aria-selected", "true");
    await assetServer.focus();
    await assetServer.press("ArrowRight");
    await expect(typescript).toBeFocused();
    await typescript.press("ArrowRight");
    await expect(caching).toBeFocused();
    await expect(caching).toHaveAttribute("aria-selected", "true");
  });
});
