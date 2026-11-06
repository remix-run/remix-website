import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { createRouter } from "remix/router";

import { STATIC_ASSET_SURROGATE_KEY } from "../utils/cache-control.ts";
import { rootPublicFiles } from "./root-public-files.ts";

describe("rootPublicFiles", () => {
  it("serves root public files tagged for static-asset purges", async () => {
    let response = await createRouter({
      middleware: [rootPublicFiles()],
    }).fetch("http://localhost/favicon.svg");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("image/svg+xml");
    expect(response.headers.get("Surrogate-Key")).toBe(
      STATIC_ASSET_SURROGATE_KEY,
    );
  });

  it("passes other requests through without the purge tag", async () => {
    let router = createRouter({ middleware: [rootPublicFiles()] });
    router.map("*", () => new Response("page"));

    let response = await router.fetch("http://localhost/blog");

    expect(await response.text()).toBe("page");
    expect(response.headers.has("Surrogate-Key")).toBe(false);
  });

  it("does not serve directory indexes", async () => {
    let router = createRouter({ middleware: [rootPublicFiles()] });
    router.map("*", () => new Response("page"));

    let response = await router.fetch("http://localhost/jam/");

    expect(await response.text()).toBe("page");
  });
});
