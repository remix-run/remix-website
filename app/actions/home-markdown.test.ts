import { htmlEscape } from "escape-goat";
import { expect } from "remix/assert";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import rootController from "./controller.tsx";
import {
  landingContent,
  packageRunners,
} from "./public/remix-landing/landing-content.ts";
import { createAppRouter } from "../router.ts";
import { routes } from "../routes.ts";
import { CACHE } from "../utils/cache-control.ts";
import { createRouteTestRouter } from "../../test/setup.ts";

describe("homepage representations", () => {
  for (let [accept, format] of [
    [null, "html"],
    ["*/*", "html"],
    ["text/*", "html"],
    ["text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "html"],
    ["text/markdown", "markdown"],
    ["Text/Markdown; charset=utf-8", "markdown"],
    ["text/markdown,text/html", "markdown"],
    ["text/markdown;q=0.5,text/html;q=0.9", "html"],
    ["text/markdown;q=0.8,text/html;q=0.2", "markdown"],
    ["text/markdown;q=0.6,text/html;q=0.4,*/*;q=1", "markdown"],
    ["text/markdown;q=0,*/*;q=1", "html"],
    ["text/markdown;q=0.5,text/*;q=0.9", "html"],
    ["text/markdown;q=invalid", "html"],
    ["text/markdown;q=2", "html"],
  ] as const) {
    it(`serves ${format} for Accept: ${accept ?? "(absent)"}`, async () => {
      let router = createRouteTestRouter();
      router.map(routes, rootController);
      let response = await router.fetch("http://localhost/", {
        headers: accept === null ? {} : { Accept: accept },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")?.toLowerCase()).toBe(
        `text/${format}; charset=utf-8`,
      );
      expect(response.headers.get("Vary")).toBe("Accept");
      for (let [name, value] of Object.entries(CACHE.DOCUMENT)) {
        expect(response.headers.get(name)).toBe(value);
      }
      let body = await response.text();
      expect(body.startsWith("# ")).toBe(format === "markdown");
    });
  }

  it("serves the same Markdown at /index.md and /llms.txt regardless of Accept", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);
    let negotiated = await router.fetch("http://localhost/", {
      headers: { Accept: "text/markdown" },
    });
    let markdown = await negotiated.text();

    for (let [route, contentType] of [
      [routes.homeMarkdown, "text/markdown; charset=utf-8"],
      [routes.llms, "text/plain; charset=utf-8"],
    ] as const) {
      for (let accept of ["text/html", "text/markdown;q=0", "*/*"]) {
        let response = await router.fetch(
          new URL(route.href(), "http://localhost"),
          { headers: { Accept: accept } },
        );
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toBe(contentType);
        expect(response.headers.has("Vary")).toBe(false);
        for (let [name, value] of Object.entries(CACHE.DOCUMENT)) {
          expect(response.headers.get(name)).toBe(value);
        }
        expect(await response.text()).toBe(markdown);
      }
    }
  });

  it("opens like an llms.txt index and stays compact without page markup", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);
    let response = await router.fetch(
      new URL(routes.llms.href(), "http://localhost"),
    );
    let markdown = await response.text();

    expect(markdown).toMatch(/^# .+\n\n> /);
    expect(markdown).toContain(packageRunners[0].command);
    expect(markdown.length).toBeLessThan(5_000);
    expect(markdown).not.toContain("<script");
    expect(markdown).not.toContain("<form");
  });

  it("renders inline code from shared copy as code elements in HTML", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);
    let html = await (await router.fetch("http://localhost/")).text();
    let codeElements = [
      ...html.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/g),
    ].map((match) => match[1]);
    for (let item of landingContent.differentiators.items) {
      for (let match of item.body.matchAll(/`([^`]+)`/g)) {
        expect(codeElements).toContain(htmlEscape(match[1]!));
      }
    }
  });

  it("advertises the Markdown and llms.txt URLs from the homepage", async (t) => {
    let router = createAppRouter();
    let server = await createTestServer((request) => router.fetch(request));
    t.after(() => server.close());

    for (let accept of ["text/html", "text/markdown"]) {
      let homepage = await fetch(new URL(routes.home.href(), server.baseUrl), {
        headers: { Accept: accept },
        signal: t.signal,
      });
      let header = homepage.headers.get("Link");
      expect(header).toContain(`<${routes.homeMarkdown.href()}>`);
      expect(header).toContain(`<${routes.llms.href()}>`);
      let body = await homepage.text();
      if (accept === "text/html") {
        expect(body).toContain(`href="${routes.homeMarkdown.href()}"`);
        expect(body).toContain(`href="${routes.llms.href()}"`);
      }
    }
  });

  it("preserves the representation cache dimension alongside compression through HTTP", async (t) => {
    let router = createAppRouter();
    let server = await createTestServer((request) => router.fetch(request));
    t.after(() => server.close());

    for (let format of ["markdown", "html", "markdown"]) {
      let response = await fetch(new URL(routes.home.href(), server.baseUrl), {
        headers: { Accept: `text/${format}`, "Accept-Encoding": "gzip" },
        signal: t.signal,
      });
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")?.toLowerCase()).toBe(
        `text/${format}; charset=utf-8`,
      );
      expect(response.headers.get("Content-Encoding")).toBe("gzip");
      let vary = response.headers.get("Vary")!.toLowerCase().split(/,\s*/);
      expect(vary).toContain("accept");
      expect(vary).toContain("accept-encoding");
      expect(response.headers.get("Surrogate-Key")).toBe(
        CACHE.DOCUMENT["Surrogate-Key"],
      );
      expect((await response.text()).startsWith("# ")).toBe(
        format === "markdown",
      );
    }
  });
});
