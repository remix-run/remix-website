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
    let response = catchallHandler(createContext("/docs/?q=routes"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://remix.run/docs?q=routes",
    );
  });

  it("redirects the docs root to api docs", async () => {
    let response = catchallHandler(createContext("/docs"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://api.remix.run/");
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
