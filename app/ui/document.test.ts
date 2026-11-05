import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { getDocumentHeadTags } from "./document.tsx";
import type { ManagedHeadTag } from "./public/document-head.ts";

let url = new URL("https://remix-website-staging.fly.dev/blog?page=2");

describe("getDocumentHeadTags", () => {
  it("adds the description and a canonical link for indexable pages", () => {
    let { otherHeadTags } = getDocumentHeadTags({
      description: "About the blog",
      headTags: [],
      noIndex: false,
      url,
    });

    expect(otherHeadTags).toEqual([
      { kind: "meta", name: "description", content: "About the blog" },
      { kind: "link", rel: "canonical", href: "https://remix.run/blog" },
    ]);
  });

  it("marks noIndex pages for robots and gives them no canonical link", () => {
    let { otherHeadTags } = getDocumentHeadTags({
      headTags: [],
      noIndex: true,
      url,
    });

    expect(otherHeadTags).toEqual([
      { kind: "meta", name: "robots", content: "noindex" },
    ]);
  });

  it("keeps a route-provided canonical instead of adding the default", () => {
    let canonical: ManagedHeadTag = {
      kind: "link",
      rel: "canonical",
      href: "https://remix.run/blog/original",
    };

    let { otherHeadTags } = getDocumentHeadTags({
      headTags: [canonical],
      noIndex: false,
      url,
    });

    expect(otherHeadTags).toEqual([canonical]);
  });

  it("splits preloads out so they render before other head tags", () => {
    let preload: ManagedHeadTag = {
      kind: "link",
      rel: "preload",
      href: "/hero.webp",
      as: "image",
    };
    let ogTitle: ManagedHeadTag = {
      kind: "meta",
      property: "og:title",
      content: "Blog",
    };

    let { priorityHeadTags, otherHeadTags } = getDocumentHeadTags({
      headTags: [ogTitle, preload],
      noIndex: true,
      url,
    });

    expect(priorityHeadTags).toEqual([preload]);
    expect(otherHeadTags).toEqual([
      { kind: "meta", name: "robots", content: "noindex" },
      ogTitle,
    ]);
  });
});
