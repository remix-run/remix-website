import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { catchallHandler } from "./catchall.tsx";
import { router } from "../router.ts";
import type { AppRenderer } from "../middleware/render.ts";

function createContext(pathname: string) {
  return {
    request: new Request(`https://remix.run${pathname}`),
    render: {} as AppRenderer,
  };
}

describe("catchall route", () => {
  it("redirects trailing slash paths", async () => {
    let response = catchallHandler(createContext("/docs/"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://remix.run/docs");
  });

  it("serves the docs root before the legacy catchall", async () => {
    let response = await router.fetch("https://remix.run/docs");
    expect(response.status).toBe(200);

    let html = await response.text();
    expect(html).toContain("Learn Remix from the request up.");
  });

  it("redirects docs paths to v2", async () => {
    let response = catchallHandler(createContext("/docs/en/main/guides"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://v2.remix.run/docs/guides",
    );
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

  it("redirects resources paths to v2", async () => {
    let response = catchallHandler(createContext("/resources"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://v2.remix.run/resources",
    );
  });

  it("returns 404 for unknown paths", async () => {
    let response = await router.fetch(
      new Request("https://remix.run/not-real"),
    );
    expect(response.status).toBe(404);
  });
});
