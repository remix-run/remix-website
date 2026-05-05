import * as path from "node:path";
import { createTestServer } from "remix/node-fetch-server/test";
import type { TestContext } from "remix/test";
import type { Page } from "playwright";

import { createAppRouter } from "../app/router.ts";

let hasPatchedAbortLogging = false;
let e2eEntry = path.resolve(import.meta.dirname, "../app/assets/entry.e2e.ts");

export async function createE2EPage(t: TestContext): Promise<Page> {
  suppressExpectedServerAbortLogs();

  let router = createAppRouter({ assetEntry: e2eEntry, logRequests: false });
  let server = await createTestServer(router.fetch);

  return t.serve(server);
}

export async function gotoRemixPage(page: Page, url: string) {
  return page.goto(url, { waitUntil: "domcontentloaded" });
}

export async function waitForRemixReady(page: Page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.remixReady === "true",
  );
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
