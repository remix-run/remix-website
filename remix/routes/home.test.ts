import { describe, expect, it } from "vitest";
import HomeRoute from "./home";

describe("Home route preview", () => {
  it("renders expected content and metadata", async () => {
    const response = await HomeRoute({
      request: new Request("http://localhost:3000/remix-home"),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=300");

    const html = await response.text();

    expect(html).toContain("<html");
    expect(html).toContain("Remix Home (Preview)");
    expect(html).toContain('class="marketing-home"');
    expect(html).toContain("#github");
    expect(html).toContain("og:title");
    expect(html).toContain("twitter:card");
  });
});
