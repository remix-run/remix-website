import { createTestServer } from "remix/node-fetch-server/test";
import type { TestContext } from "remix/test";
import type { Page } from "playwright";

import { createAppRouter } from "../app/router.ts";

let hasPatchedAbortLogging = false;

export async function createE2EPage(t: TestContext): Promise<Page> {
  suppressExpectedServerAbortLogs();

  let router = createAppRouter();
  let server = await createTestServer(router.fetch);

  return t.serve(server);
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
