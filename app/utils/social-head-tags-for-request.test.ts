import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import type { ManagedHeadTag } from "../ui/public/document-head.ts";
import { assetPaths } from "./public/asset-paths.ts";
import { getSocialHeadTagsForRequest } from "./social-head-tags-for-request.ts";

describe("getSocialHeadTagsForRequest", () => {
  it("points the page and default image at the canonical origin", () => {
    let tags = getSocialHeadTagsForRequest({
      requestUrl: "https://remix-website-staging.fly.dev/blog?ref=x",
    });

    expect(content(tags, "og:url")).toBe("https://remix.run/blog");
    expect(content(tags, "og:image")).toBe(
      new URL(assetPaths.marketing.defaultOgImage, "https://remix.run").href,
    );
    expect(content(tags, "twitter:image")).toBe(content(tags, "og:image"));
  });

  it("keeps the local origin during development", () => {
    let tags = getSocialHeadTagsForRequest({
      requestUrl: "http://localhost:3000/jam",
      image: "/jam/og.png",
    });

    expect(content(tags, "og:url")).toBe("http://localhost:3000/jam");
    expect(content(tags, "og:image")).toBe("http://localhost:3000/jam/og.png");
  });

  it("uses explicit page and absolute image URLs as given", () => {
    let tags = getSocialHeadTagsForRequest({
      requestUrl: "https://remix.run/blog/post",
      url: "https://remix.run/blog",
      image: "https://cdn.example.com/og.png",
    });

    expect(content(tags, "og:url")).toBe("https://remix.run/blog");
    expect(content(tags, "og:image")).toBe("https://cdn.example.com/og.png");
  });

  it("only emits optional tags that have values", () => {
    let bare = getSocialHeadTagsForRequest({
      requestUrl: "https://remix.run/",
    });
    for (let key of [
      "og:title",
      "og:description",
      "twitter:title",
      "twitter:description",
      "twitter:image:alt",
      "twitter:creator",
      "twitter:site",
    ]) {
      expect(content(bare, key)).toBe(undefined);
    }

    let full = getSocialHeadTagsForRequest({
      requestUrl: "https://remix.run/",
      title: "Title",
      description: "Description",
      imageAlt: "Alt",
      twitterCreator: "@creator",
      twitterSite: "@site",
    });
    expect(content(full, "og:title")).toBe("Title");
    expect(content(full, "twitter:title")).toBe("Title");
    expect(content(full, "og:description")).toBe("Description");
    expect(content(full, "twitter:description")).toBe("Description");
    expect(content(full, "twitter:image:alt")).toBe("Alt");
    expect(content(full, "twitter:creator")).toBe("@creator");
    expect(content(full, "twitter:site")).toBe("@site");
  });
});

function content(tags: ManagedHeadTag[], key: string) {
  let tag = tags.find(
    (tag) =>
      tag.kind === "meta" &&
      ("property" in tag ? tag.property : tag.name) === key,
  );
  return tag && "content" in tag ? tag.content : undefined;
}
