import { beforeEach, describe, expect, it, vi } from "vitest";
import { catchallHandler } from "./catchall";
import { renderNotFoundPage } from "../ui/not-found-page";

vi.mock("../ui/not-found-page", () => ({
  renderNotFoundPage: vi.fn(() => new Response("", { status: 404 })),
}));

function createContext(pathname: string) {
  return {
    request: new Request(`https://remix.run${pathname}`),
  };
}

describe("catchall route", () => {
  beforeEach(() => {
    vi.mocked(renderNotFoundPage).mockClear();
  });

  it("redirects trailing slash paths", async () => {
    let response = catchallHandler(createContext("/docs/"));
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://remix.run/docs");
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
    let response = catchallHandler(createContext("/not-real"));
    expect(response.status).toBe(404);
    expect(renderNotFoundPage).toHaveBeenCalledTimes(1);
  });
});
