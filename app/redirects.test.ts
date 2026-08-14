import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { createRouter } from "remix/router";
import {
  createRedirectRoutes,
  loadRedirectsFromFile,
  parseRedirectsFile,
} from "./redirects.ts";

let redirects = loadRedirectsFromFile();
let { redirectController, redirectRoutes } = createRedirectRoutes(redirects);
let router = createRouter();
router.map(redirectRoutes, redirectController);

async function getRedirectResult(
  pathname: string,
  targetRouter: ReturnType<typeof createRouter> = router,
) {
  let url = `https://example.com${pathname || "/"}`;
  let response = await targetRouter.fetch(url);

  if (response.status >= 300 && response.status < 400) {
    return {
      redirect: response,
      url: response.headers.get("Location"),
      status: response.status,
    };
  }
  return { redirect: null as null, url: null, status: null };
}

describe("redirects (fetch-router)", () => {
  describe("parser", () => {
    it("skips invalid lines and defaults invalid status codes", () => {
      let redirects = parseRedirectsFile(`
        # comment
        /one /target 301
        /two /target-two not-a-code
        /three /target-three 301oops
        /broken-only-one-token
      `);

      expect(redirects).toHaveLength(3);
      expect(redirects.map(({ status }) => status)).toEqual([301, 302, 302]);
    });
  });

  describe("exact matches", () => {
    it("uses the configured redirect status", async () => {
      let configured = createRedirectRoutes(
        parseRedirectsFile("/permanent /new-home 301"),
      );
      let configuredRouter = createRouter();
      configuredRouter.map(
        configured.redirectRoutes,
        configured.redirectController,
      );

      let { url, status } = await getRedirectResult(
        "/permanent",
        configuredRouter,
      );
      expect(url).toBe("/new-home");
      expect(status).toBe(301);
    });

    it("redirects /login to the legacy app", async () => {
      let { url, status } = await getRedirectResult("/login");
      expect(url).toBe("https://remix-run.web.app/login");
      expect(status).toBe(302);
    });

    it("redirects /features to root", async () => {
      let { url, status } = await getRedirectResult("/features");
      expect(url).toBe("/");
      expect(status).toBe(302);
    });
  });

  describe("splat matches (* and :splat)", () => {
    let splatRedirects = parseRedirectsFile(
      "/conf/2023/* https://v2.remix.run/conf/2023/:splat 302",
    );
    let splatModule = createRedirectRoutes(splatRedirects);
    let splatRouter = createRouter();
    splatRouter.map(splatModule.redirectRoutes, splatModule.redirectController);

    it("redirects /conf/2023/any/nested/path", async () => {
      let { url } = await getRedirectResult(
        "/conf/2023/any/nested/path",
        splatRouter,
      );
      expect(url).toBe("https://v2.remix.run/conf/2023/any/nested/path");
    });

    it("keeps non-wildcard :splat destinations as one encoded segment", async () => {
      let segmentRedirects = parseRedirectsFile("/:splat /docs/:splat 302");
      let segmentModule = createRedirectRoutes(segmentRedirects);
      let segmentRouter = createRouter();
      segmentRouter.map(
        segmentModule.redirectRoutes,
        segmentModule.redirectController,
      );

      let { url } = await getRedirectResult("/a%2Fb", segmentRouter);
      expect(url).toBe("/docs/a%2Fb");
    });
  });

  describe("no redirect", () => {
    it("leaves unmatched paths for the app fallback", async () => {
      let response = await router.fetch("https://example.com/some/random/path");
      expect(response.status).toBe(404);
      expect(response.headers.get("Location")).toBe(null);
    });
  });
});
