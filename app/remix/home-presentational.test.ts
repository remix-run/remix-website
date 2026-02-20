import { describe, expect, it } from "vitest";
import HomePresentationalRoute from "./home-presentational";

describe("Home presentational route", () => {
  it("renders expected content and metadata", async () => {
    const response = await HomePresentationalRoute({
      request: new Request("http://localhost:3000/remix-home-presentational"),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=300");

    const html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain("Remix Home (Presentational Preview)");
    expect(html).toContain("Remix 3 is under active development");
    expect(html).toContain("The story so far");
    expect(html).toContain("Timeline milestones");
    expect(html).toContain("og:title");
    expect(html).toContain("twitter:card");
  });
});
