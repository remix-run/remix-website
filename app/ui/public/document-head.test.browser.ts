import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { syncManagedHeadTags, type ManagedHeadTag } from "./document-head.ts";

let preloadTag: ManagedHeadTag = {
  kind: "link",
  rel: "preload",
  href: "/hero.webp",
  as: "image",
  imageSrcSet: "/hero-1x.webp 1x, /hero-2x.webp 2x",
  imageSizes: "100vw",
  crossorigin: "anonymous",
  fetchpriority: "high",
};
let descriptionTag: ManagedHeadTag = {
  kind: "meta",
  name: "description",
  content: "First",
};

function managedNodes() {
  return Array.from(
    document.head.querySelectorAll<HTMLElement>("[data-remix-managed-head]"),
  );
}

describe("syncManagedHeadTags", () => {
  it("writes tag attributes and reuses matching nodes on later syncs", (t) => {
    t.after(() => syncManagedHeadTags([]));

    syncManagedHeadTags([descriptionTag, preloadTag]);
    let [meta, link] = managedNodes();
    expect(meta.getAttribute("name")).toBe("description");
    expect(meta.getAttribute("content")).toBe("First");
    expect(link.getAttribute("rel")).toBe("preload");
    expect(link.getAttribute("href")).toBe("/hero.webp");
    expect(link.getAttribute("as")).toBe("image");
    expect(link.getAttribute("imagesrcset")).toBe(
      "/hero-1x.webp 1x, /hero-2x.webp 2x",
    );
    expect(link.getAttribute("imagesizes")).toBe("100vw");
    expect(link.getAttribute("crossorigin")).toBe("anonymous");
    expect(link.getAttribute("fetchpriority")).toBe("high");
    expect(link.hasAttribute("type")).toBe(false);

    syncManagedHeadTags([
      { ...descriptionTag, content: "Second" },
      { ...preloadTag },
    ]);
    let [nextMeta, nextLink] = managedNodes();
    expect(nextMeta).not.toBe(meta);
    expect(nextMeta.getAttribute("content")).toBe("Second");
    expect(nextLink).toBe(link);
  });

  it("removes managed nodes that are no longer requested", (t) => {
    t.after(() => syncManagedHeadTags([]));

    syncManagedHeadTags([descriptionTag, preloadTag]);
    syncManagedHeadTags([preloadTag]);

    let nodes = managedNodes();
    expect(nodes.length).toBe(1);
    expect(nodes[0].tagName).toBe("LINK");
  });
});
