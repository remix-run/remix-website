import { beforeEach, describe, expect, it, vi } from "vitest";
import { catchallHandler } from "./catchall";
import { renderNotFoundPage } from "./not-found";

vi.mock("./not-found", () => ({
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
