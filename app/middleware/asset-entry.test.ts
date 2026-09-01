import * as path from "node:path";
import { expect } from "remix/assert";
import { createRouter } from "remix/router";
import { describe, it } from "remix/test";

import { loadAssetEntry } from "./asset-entry.ts";

describe("asset entry middleware", () => {
  it("does not resolve the document asset graph for health or asset requests", async () => {
    let missingEntry = path.join(import.meta.dirname, "missing-entry.ts");
    let router = createRouter({ middleware: [loadAssetEntry(missingEntry)] });
    router.get("/healthcheck", () => new Response("OK"));
    router.get("/assets/*path", () => new Response("asset"));

    for (let pathname of ["/healthcheck", "/assets/app/entry.ts"]) {
      let response = await router.fetch(new URL(pathname, "http://localhost"));
      expect(response.status).toBe(200);
    }
  });
});
