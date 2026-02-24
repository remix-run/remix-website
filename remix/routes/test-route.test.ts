import { describe, it, expect } from "vitest";
import { createRouter } from "remix/fetch-router";
import type { Router } from "remix/fetch-router";
import { asyncContext } from "remix/async-context-middleware";
import { routes } from "../routes";
import { ROUTER_STORAGE_KEY } from "../utils/request-context";

describe("remix/component rendering pipeline", () => {
  it("renders the test route to an HTML response", async () => {
    const { default: handler } = await import("./test-route");
    let router: Router;
    router = createRouter({
      middleware: [
        asyncContext(),
        (context, next) => {
          context.storage.set(ROUTER_STORAGE_KEY, router);
          return next();
        },
      ],
    });
    router.map(routes.dev.remixTest, handler);

    const response = await router.fetch("http://localhost:3000/remix-test");

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/html");

    const html = await response.text();

    // Has a proper document structure
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");

    // Has the expected title
    expect(html).toContain("<title>Remix 3 Test</title>");

    // Has meta tags from the document shell
    expect(html).toContain('charset="utf-8"');
    expect(html).toContain("viewport");
    expect(html).toContain('name="robots" content="noindex"');

    // Has CSS links
    expect(html).toContain("mock-css");

    // Has the page content
    expect(html).toContain("Hello from Remix 3");
    expect(html).toContain("remix/component");

    // Has the link back to homepage
    expect(html).toContain('href="/"');
  });
});
