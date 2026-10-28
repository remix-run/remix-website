import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { catchallHandler } from "./catchall.tsx";
import type { AppRenderer } from "../middleware/render.ts";

function createContext(pathname: string) {
  return {
    request: new Request(`https://remix.run${pathname}`),
    render: {} as AppRenderer,
  };
}

describe("catchall route", () => {
  it("redirects trailing slash paths without dropping the query", async () => {
    let response = catchallHandler(createContext("/blog/?q=routes"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://remix.run/blog?q=routes",
    );
  });

  it("sends trailing-slash legacy paths straight to their final destination", async () => {
    let response = catchallHandler(createContext("/docs/en/main/guides/"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://v2.remix.run/docs/guides/",
    );
  });

  it("redirects the docs root to the Remix 3 guides", async () => {
    let response = catchallHandler(createContext("/docs"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://docs.remix.run/");
  });

  it("redirects legacy docs refs to v2", async () => {
    for (let pathname of [
      "/docs/en/main/guides/spa-mode",
      "/docs/en/release-next/guides/spa-mode",
      "/docs/en/2/guides/spa-mode",
      "/docs/main/guides/spa-mode",
    ]) {
      let response = catchallHandler(createContext(pathname));
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(
        "https://v2.remix.run/docs/guides/spa-mode/",
      );
    }
  });

  it("redirects unprefixed docs paths to v2 only for v2 docs sections", async () => {
    for (let [pathname, location] of [
      [
        "/docs/hooks/use-fetcher",
        "https://v2.remix.run/docs/hooks/use-fetcher/",
      ],
      ["/docs/getting-started", "https://docs.remix.run/"],
    ]) {
      let response = catchallHandler(createContext(pathname));
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(location);
    }
  });

  it("redirects /docs/en/v1 docs paths to the final v1 GitHub snapshot", async () => {
    let response = catchallHandler(
      createContext("/docs/en/v1/guides/data-loading"),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://github.com/remix-run/remix/blob/remix%401.19.3/docs/guides/data-loading.md",
    );
  });

  it("redirects /docs/v1 docs paths to the final v1 GitHub snapshot", async () => {
    let response = catchallHandler(
      createContext("/docs/v1/guides/data-loading"),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://github.com/remix-run/remix/blob/remix%401.19.3/docs/guides/data-loading.md",
    );
  });

  it("redirects arbitrary 1.x.x docs paths to their matching GitHub tag", async () => {
    let response = catchallHandler(
      createContext("/docs/en/1.19.2/guides/data-loading"),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://github.com/remix-run/remix/blob/remix%401.19.2/docs/guides/data-loading.md",
    );
  });

  it("redirects <=1.6.4 docs paths using the legacy v-prefixed tag", async () => {
    let response = catchallHandler(
      createContext("/docs/en/1.6.4/guides/data-loading"),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://github.com/remix-run/remix/blob/v1.6.4/docs/guides/data-loading.md",
    );
  });

  it("redirects resources paths to v2 with the query intact", async () => {
    let response = catchallHandler(createContext("/resources?q=sessions"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://v2.remix.run/resources?q=sessions",
    );
  });

  it("returns a blank 404 for missing static assets", async () => {
    let response = catchallHandler(createContext("/missing.js"));
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });
});
