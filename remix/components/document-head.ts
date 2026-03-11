export type ManagedHeadTag = ManagedMetaTag | ManagedLinkTag;

export type ManagedMetaTag = {
  kind: "meta";
  name?: string;
  property?: string;
  content: string;
};

export type ManagedLinkTag = {
  kind: "link";
  rel: string;
  href: string;
  type?: string;
  sizes?: string;
  as?: string;
  crossorigin?: "anonymous" | "use-credentials";
};

export function getManagedHeadTagKey(tag: ManagedHeadTag, index: number) {
  if (tag.kind === "meta") {
    return `meta:${tag.name ?? tag.property ?? index}:${tag.content}`;
  }

  return `link:${tag.rel}:${tag.href}:${tag.type ?? ""}:${tag.sizes ?? ""}:${tag.as ?? ""}:${tag.crossorigin ?? ""}`;
}

export function syncTitle(title?: string) {
  let titles = document.head.querySelectorAll("title");
  if (!title) {
    titles.forEach((element) => element.remove());
    return;
  }

  let current =
    titles[0] ?? document.head.appendChild(document.createElement("title"));
  current.textContent = title;
  for (let index = 1; index < titles.length; index++) {
    titles[index]?.remove();
  }
}

export function syncManagedHeadTags(headTags: ManagedHeadTag[]) {
  for (let node of document.head.querySelectorAll(
    "[data-remix-managed-head]",
  )) {
    node.remove();
  }

  let fragment = document.createDocumentFragment();

  for (let tag of headTags) {
    let element = document.createElement(tag.kind);
    element.setAttribute("data-remix-managed-head", "true");

    if (tag.kind === "meta") {
      if (tag.name) element.setAttribute("name", tag.name);
      if (tag.property) element.setAttribute("property", tag.property);
      element.setAttribute("content", tag.content);
    } else {
      element.setAttribute("rel", tag.rel);
      element.setAttribute("href", tag.href);
      if (tag.type) element.setAttribute("type", tag.type);
      if (tag.sizes) element.setAttribute("sizes", tag.sizes);
      if (tag.as) element.setAttribute("as", tag.as);
      if (tag.crossorigin) {
        element.setAttribute("crossorigin", tag.crossorigin);
      }
    }

    fragment.appendChild(element);
  }

  document.head.appendChild(fragment);
}
