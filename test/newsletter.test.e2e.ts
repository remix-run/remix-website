import { expect } from "@playwright/test";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { createAppRouter } from "../app/router.ts";
import { routes } from "../app/routes.ts";
import type { NewsletterRepository } from "../app/actions/newsletter/archive.ts";
import { swallowAbortErrors } from "../test/setup.ts";

const newsletterRepository: NewsletterRepository = {
  async listSummaries() {
    return [
      {
        number: 1,
        date: new Date("2024-01-01T00:00:00.000Z"),
        preview: "The latest Remix news.",
        image: {
          src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
          alt: "Newsletter header",
        },
      },
    ];
  },
  async getIssue(number) {
    if (number !== 1) return null;
    return {
      number: 1,
      date: new Date("2024-01-01T00:00:00.000Z"),
      title: "Remix Newsletter #1",
      markdown: `# Remix Newsletter #1

![Newsletter image](cover.png)
`,
    };
  },
  async getImage() {
    return null;
  },
};

describe("Newsletter archive", () => {
  it("opens issue images in the lightbox", async (t) => {
    let handler = swallowAbortErrors(createAppRouter({ newsletterRepository }));
    let page = await t.serve(await createTestServer(handler));

    await page.goto(routes.newsletter.issue.href({ number: 1 }));

    let trigger = page.locator(".md-prose img").first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("role", "button");
    await expect(trigger).toHaveAttribute("tabindex", "0");
    await trigger.focus();
    await page.keyboard.press("Enter");

    let dialog = page.locator('[role="dialog"][aria-label="Image preview"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("img")).toHaveAttribute(
      "src",
      new URL(
        routes.newsletter.image.href({ number: 1, filename: "cover.png" }),
        page.url(),
      ).href,
    );
    await expect(dialog.locator("img")).toHaveAttribute(
      "alt",
      "Newsletter image",
    );

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  it("shows hover, pressed, and keyboard focus states across the card", async (t) => {
    let handler = swallowAbortErrors(createAppRouter({ newsletterRepository }));
    let page = await t.serve(await createTestServer(handler));

    await page.goto(routes.newsletter.index.href());

    let card = page.locator(
      `a[href="${routes.newsletter.issue.href({ number: 1 })}"]`,
    );
    let image = card.locator("img");
    await expect(card).toBeVisible();
    await expect(image).toBeVisible();

    let cardGeometry = await card.evaluate((element) => {
      let style = getComputedStyle(element);
      return {
        margin: style.margin,
        padding: style.padding,
        borderRadius: style.borderRadius,
      };
    });
    expect(cardGeometry.margin).toBe("-24px");
    expect(cardGeometry.padding).toBe("24px");
    expect(cardGeometry.borderRadius).toBe("12px");

    let idleBackground = await card.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    expect(idleBackground).toBe("rgba(0, 0, 0, 0)");
    await card.hover();
    await expect
      .poll(() =>
        card.evaluate((element) => getComputedStyle(element).backgroundColor),
      )
      .not.toBe(idleBackground);
    let hoverBackground = await card.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );

    await page.mouse.down();
    await expect
      .poll(() =>
        card.evaluate((element) => getComputedStyle(element).backgroundColor),
      )
      .not.toBe(hoverBackground);
    await page.mouse.up();
    await page.goto(routes.newsletter.index.href());

    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
    let cardFocused = false;
    for (let index = 0; index < 20; index++) {
      await page.keyboard.press("Tab");
      if (
        await card.evaluate((element) => element === document.activeElement)
      ) {
        cardFocused = true;
        break;
      }
    }
    expect(cardFocused).toBe(true);

    let focusOutline = await card.evaluate((element) => {
      let style = getComputedStyle(element);
      return { width: style.outlineWidth, style: style.outlineStyle };
    });
    expect(focusOutline.width).not.toBe("0px");
    expect(focusOutline.style).not.toBe("none");
  });
});
