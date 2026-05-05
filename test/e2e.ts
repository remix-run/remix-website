import { createTestServer } from "remix/node-fetch-server/test";
import type { TestContext } from "remix/test";
import type { Page } from "playwright";

import { router } from "../app/router.ts";

let hasPatchedAbortLogging = false;

export async function createE2EPage(t: TestContext): Promise<Page> {
  suppressExpectedServerAbortLogs();

  let server = await createTestServer(router.fetch);
  let page = await t.serve(server);

  await page.addInitScript(() => {
    window.addEventListener(
      "remix:ready",
      () => {
        (window as Window & { __remixReady?: boolean }).__remixReady = true;
      },
      { once: true },
    );
  });

  return page;
}

export async function gotoRemixPage(page: Page, url: string) {
  return page.goto(url, { waitUntil: "domcontentloaded" });
}

export async function waitForRemixReady(page: Page) {
  await page.waitForFunction(() => {
    return (window as Window & { __remixReady?: boolean }).__remixReady === true;
  });
}

export async function waitForRemixNavigation(
  page: Page,
  navigate: () => Promise<void>,
) {
  await navigate();
  await page.waitForFunction(() => {
    let navigation = (
      window as Window & {
        navigation?: { transition?: unknown };
      }
    ).navigation;

    return !navigation?.transition;
  });
}

function suppressExpectedServerAbortLogs() {
  if (hasPatchedAbortLogging) return;
  hasPatchedAbortLogging = true;

  let error = console.error;
  console.error = (...args) => {
    let [first] = args;
    if (
      first instanceof DOMException &&
      first.name === "AbortError" &&
      first.message === "This operation was aborted"
    ) {
      return;
    }

    error(...args);
  };
}
