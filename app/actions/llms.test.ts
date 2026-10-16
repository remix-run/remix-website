import { expect } from "remix/assert";
import { createTestServer } from "remix/node-fetch-server/test";
import { describe, it } from "remix/test";

import { createAppRouter } from "../router.ts";
import { routes } from "../routes.ts";
import { CACHE } from "../utils/cache-control.ts";
import {
  landingContent,
  packageRunners,
} from "./public/remix-landing/landing-content.ts";
import { stackCategories } from "./public/remix-landing/components/stack-explorer-content.tsx";

describe("agent discovery", () => {
  it("serves a compact Markdown index regardless of Accept with document cache tags", async () => {
    let router = createAppRouter();
    let bodies: string[] = [];

    for (let accept of ["*/*", "text/html", "text/markdown"]) {
      let response = await router.fetch(
        new URL(routes.llms.href(), "https://remix.run"),
        { headers: { Accept: accept, "Accept-Encoding": "identity" } },
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe(
        "text/plain; charset=utf-8",
      );
      let vary =
        response.headers.get("Vary")?.toLowerCase().split(/,\s*/) ?? [];
      expect(vary).not.toContain("accept");
      for (let [name, value] of Object.entries(CACHE.DOCUMENT)) {
        expect(response.headers.get(name)).toBe(value);
      }
      bodies.push(await response.text());
    }

    expect(new Set(bodies).size).toBe(1);
    let markdown = bodies[0]!;
    expect(markdown).toMatch(/^# [^\n]+\n\n> /);
    expect(markdown.length).toBeLessThan(8_000);
    let guidance = markdown.split(/^## /m)[0]!;
    expect(guidance.match(/```sh\n([\s\S]+?)\n```/)?.[1]?.split("\n")).toEqual([
      packageRunners[0].command,
      `cd ${landingContent.projectDirectory}`,
      "npm install",
      "npm run dev",
    ]);
    let sections = markdown.split(/^## /m).slice(1);
    expect(sections.length).toBeGreaterThan(0);
    for (let section of sections) {
      // Each index section is a list of links with descriptions.
      expect(
        section
          .trim()
          .split("\n")
          .slice(2)
          .every((line) => /^- \[[^\]]+\]\(https:\/\/[^)]+\): .+/.test(line)),
      ).toBe(true);
    }
    let links = [...markdown.matchAll(/\]\(([^)]+)\)/g)].map(
      (match) => match[1],
    );
    expect(links).toContain(`https://remix.run${routes.homeMarkdown.href()}`);
    expect(links).toContain("https://v2.remix.run/docs");
    expect(links).toContain(
      "https://raw.githubusercontent.com/remix-run/remix/main/.agents/skills/remix/SKILL.md",
    );
    for (let category of stackCategories) {
      expect(links).toContain(category.documentationHref);
    }
  });

  it("leads from homepage HTML and HTTP links to Markdown and agent guidance", async (t) => {
    let router = createAppRouter();
    let server = await createTestServer((request) => router.fetch(request));
    t.after(() => server.close());
    let homepage = await fetch(new URL(routes.home.href(), server.baseUrl), {
      headers: { Accept: "text/html" },
      signal: t.signal,
    });
    expect(homepage.status).toBe(200);
    let header = homepage.headers.get("Link")!;
    let markdownHref = header.match(
      /<([^>]+)>; rel="alternate"; type="text\/markdown"/,
    )?.[1];
    let indexHref = header.match(/<([^>]+)>; rel="describedby"/)?.[1];
    expect(markdownHref).toBe(routes.homeMarkdown.href());
    expect(indexHref).toBe(routes.llms.href());

    let html = await homepage.text();
    let linkTags = [...html.matchAll(/<link\b[^>]*>/g)].map(
      (match) => match[0],
    );
    expect(
      linkTags.some(
        (tag) =>
          tag.includes('rel="alternate"') &&
          tag.includes('type="text/markdown"') &&
          tag.includes(`href="${markdownHref}"`),
      ),
    ).toBe(true);
    expect(
      linkTags.some(
        (tag) =>
          tag.includes('rel="describedby"') &&
          tag.includes(`href="${indexHref}"`),
      ),
    ).toBe(true);

    let markdown = await fetch(new URL(markdownHref!, homepage.url), {
      headers: { Accept: "text/html" },
      signal: t.signal,
    });
    expect(markdown.status).toBe(200);
    expect(markdown.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(markdown.headers.get("Link")).toContain(
      `<${indexHref}>; rel="describedby"`,
    );
    expect((await markdown.text()).startsWith("# ")).toBe(true);

    let index = await fetch(new URL(indexHref!, homepage.url), {
      signal: t.signal,
    });
    expect(index.status).toBe(200);
    expect(index.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
    expect((await index.text()).startsWith("# ")).toBe(true);
  });
});
