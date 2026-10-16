import { htmlEscape } from "escape-goat";
import { expect } from "remix/assert";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import rootController from "./controller.tsx";
import {
  landingContent,
  packageRunners,
} from "./public/remix-landing/landing-content.ts";
import { stackCategories } from "./public/remix-landing/components/stack-explorer-content.tsx";
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

  it("follows the llms.txt layout with setup guidance before the link lists", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);
    let response = await router.fetch(
      new URL(routes.llms.href(), "http://localhost"),
    );
    let markdown = await response.text();
    let quickstart = landingContent.storySections.find(
      (section) => section.id === "test-drive",
    )!;
    let guides = landingContent.resources.find(
      (resource) => resource.key === "G",
    )!;

    expect(markdown).toMatch(/^# [^\n]+\n\n> [^\n]+\n\n/);
    expect([...markdown.matchAll(/^#{1,6} /gm)]).toHaveLength(3);
    let [details, ...sections]: string[] = markdown.split(/^## /m);
    expect(sections.map((section) => section.split("\n")[0])).toEqual([
      landingContent.stackTitle,
      "Learn more",
    ]);
    for (let section of sections) {
      expect(
        section
          .trim()
          .split("\n")
          .slice(2)
          .every((line) => /^- \[[^\]]+\]\(https:\/\/[^)]+\): .+/.test(line)),
      ).toBe(true);
    }

    expect(details!.match(/```sh\n([\s\S]+?)\n```/)?.[1]?.split("\n")).toEqual([
      packageRunners[0].command,
      `cd ${landingContent.projectDirectory}`,
      "npm install",
    ]);
    expect(details).toContain(
      `[${quickstart.ctaLabel}](${guides.markdownHref})`,
    );
    let links = [...markdown.matchAll(/\]\(([^)]+)\)/g)].map(
      (match) => match[1],
    );
    expect(links).toContain("https://v2.remix.run/docs");
    expect(links).toContain(
      "https://raw.githubusercontent.com/remix-run/remix/main/.agents/skills/remix/SKILL.md",
    );
  });

  it("includes every stack overview and its Markdown docs without the example payloads", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);
    let response = await router.fetch(
      new URL(routes.homeMarkdown.href(), "http://localhost"),
    );
    let markdown = await response.text();
    let stack = markdown.split(/^## /m)[1]!;

    expect(
      [...stack.matchAll(/^- \[([^\]]+)\]\(([^)]+)\): (.+)$/gm)].map(
        (match) => [match[1], match[2], match[3]],
      ),
    ).toEqual(
      stackCategories.map((category) => [
        category.label,
        category.documentationHref,
        category.introBody,
      ]),
    );
    expect(markdown).toContain(landingContent.hero.body.join(" "));
    // Only the scaffold instructions need a fenced code block.
    expect([...markdown.matchAll(/^```/gm)]).toHaveLength(2);
    expect(markdown.length).toBeLessThan(10_000);
    expect(markdown).not.toContain("<script");
    expect(markdown).not.toContain("<form");
  });

  it("preserves shared inline code in both formats", async () => {
    let router = createRouteTestRouter();
    router.map(routes, rootController);
    let html = await (await router.fetch("http://localhost/")).text();
    let markdown = await (
      await router.fetch(
        new URL(routes.homeMarkdown.href(), "http://localhost"),
      )
    ).text();
    let codeElements = [
      ...html.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/g),
    ].map((match) => match[1]);
    for (let item of landingContent.differentiators.items) {
      for (let match of item.body.matchAll(/`([^`]+)`/g)) {
        expect(codeElements).toContain(htmlEscape(match[1]!));
        expect(markdown).toContain(match[0]);
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
      let header = homepage.headers.get("Link")!;
      expect(
        header.match(/<([^>]+)>; rel="alternate"; type="text\/markdown"/)?.[1],
      ).toBe(routes.homeMarkdown.href());
      expect(header.match(/<([^>]+)>; rel="describedby"/)?.[1]).toBe(
        routes.llms.href(),
      );
      await homepage.body?.cancel();
    }

    let html = await (
      await fetch(new URL(routes.home.href(), server.baseUrl), {
        signal: t.signal,
      })
    ).text();
    let linkTags = [...html.matchAll(/<link\b[^>]*>/g)].map(
      (match) => match[0],
    );
    expect(
      linkTags.some(
        (tag) =>
          tag.includes('rel="alternate"') &&
          tag.includes('type="text/markdown"') &&
          tag.includes(`href="${routes.homeMarkdown.href()}"`),
      ),
    ).toBe(true);
    expect(
      linkTags.some(
        (tag) =>
          tag.includes('rel="describedby"') &&
          tag.includes(`href="${routes.llms.href()}"`),
      ),
    ).toBe(true);

    let markdown = await fetch(
      new URL(routes.homeMarkdown.href(), server.baseUrl),
      { signal: t.signal },
    );
    expect(markdown.headers.get("Link")).toBe(
      `<${routes.llms.href()}>; rel="describedby"`,
    );
    await markdown.body?.cancel();
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
