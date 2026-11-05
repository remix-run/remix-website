import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import {
  getCanonicalOrigin,
  getCanonicalPageUrls,
  getCanonicalUrl,
} from "./canonical-url.ts";

describe("getCanonicalOrigin", () => {
  it("keeps the origin of local servers", () => {
    for (let origin of [
      "http://localhost:3000",
      "http://127.0.0.1:44100",
      "http://[::1]:3000",
    ]) {
      expect(getCanonicalOrigin(new URL(`${origin}/blog`))).toBe(origin);
    }
  });

  it("canonicalizes deployed hosts to remix.run", () => {
    expect(
      getCanonicalOrigin(new URL("https://remix-website-staging.fly.dev/x")),
    ).toBe("https://remix.run");
    expect(getCanonicalOrigin(new URL("https://remix.run/x"))).toBe(
      "https://remix.run",
    );
  });
});

describe("getCanonicalUrl", () => {
  it("drops the query and hash and accepts a pathname override", () => {
    let url = new URL("https://remix.run/blog/post?utm=1#intro");

    expect(getCanonicalUrl(url)).toBe("https://remix.run/blog/post");
    expect(getCanonicalUrl(url, "/blog")).toBe("https://remix.run/blog");
  });
});

describe("getCanonicalPageUrls", () => {
  it("resolves the page and relative image against the canonical origin", () => {
    let url = new URL("https://remix-website-staging.fly.dev/jam/2026?x=1");

    expect(getCanonicalPageUrls(url, "/assets/share.png")).toEqual({
      pageUrl: "https://remix.run/jam/2026",
      imageUrl: "https://remix.run/assets/share.png",
    });
  });

  it("keeps absolute image URLs", () => {
    let url = new URL("http://localhost:3000/blog");

    expect(getCanonicalPageUrls(url, "https://cdn.example.com/og.png")).toEqual(
      {
        pageUrl: "http://localhost:3000/blog",
        imageUrl: "https://cdn.example.com/og.png",
      },
    );
  });
});
