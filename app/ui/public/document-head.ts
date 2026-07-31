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
  fetchpriority?: "high" | "low" | "auto";
};

export function getManagedHeadTagKey(tag: ManagedHeadTag, index: number) {
  if (tag.kind === "meta") {
    return `meta:${tag.name ?? tag.property ?? index}:${tag.content}`;
  }

  return `link:${tag.rel}:${tag.href}:${tag.type ?? ""}:${tag.sizes ?? ""}:${tag.as ?? ""}:${tag.crossorigin ?? ""}:${tag.fetchpriority ?? ""}`;
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
  let existingNodes = Array.from(
    document.head.querySelectorAll<HTMLElement>("[data-remix-managed-head]"),
  );
  let desiredKeys = headTags.map((tag, index) =>
    getManagedHeadTagKey(tag, index),
  );
  let existingKeys = existingNodes.map((node, index) =>
    getManagedHeadNodeKey(node, index),
  );

  if (
    existingKeys.length === desiredKeys.length &&
    existingKeys.every((key, index) => key === desiredKeys[index])
  ) {
    return;
  }

  let reusableNodes = new Map<string, HTMLElement[]>();
  for (let index = 0; index < existingNodes.length; index++) {
    let key = existingKeys[index];
    let nodes = reusableNodes.get(key);
    if (nodes) {
      nodes.push(existingNodes[index]!);
    } else {
      reusableNodes.set(key, [existingNodes[index]!]);
    }
  }

  let fragment = document.createDocumentFragment();

  for (let index = 0; index < headTags.length; index++) {
    let tag = headTags[index]!;
    let key = desiredKeys[index]!;
    let existing = reusableNodes.get(key)?.shift();
    fragment.appendChild(existing ?? createManagedHeadElement(tag));
  }

  for (let nodes of reusableNodes.values()) {
    for (let node of nodes) {
      node.remove();
    }
  }

  document.head.appendChild(fragment);
}

function getManagedHeadNodeKey(node: HTMLElement, index: number) {
  if (node.tagName === "META") {
    return getManagedHeadTagKey(
      {
        kind: "meta",
        name: node.getAttribute("name") ?? undefined,
        property: node.getAttribute("property") ?? undefined,
        content: node.getAttribute("content") ?? "",
      },
      index,
    );
  }

  return getManagedHeadTagKey(
    {
      kind: "link",
      rel: node.getAttribute("rel") ?? "",
      href: node.getAttribute("href") ?? "",
      type: node.getAttribute("type") ?? undefined,
      sizes: node.getAttribute("sizes") ?? undefined,
      as: node.getAttribute("as") ?? undefined,
      crossorigin:
        (node.getAttribute("crossorigin") as
          | "anonymous"
          | "use-credentials"
          | null) ?? undefined,
      fetchpriority:
        (node.getAttribute("fetchpriority") as
          | "high"
          | "low"
          | "auto"
          | null) ?? undefined,
    },
    index,
  );
}

function createManagedHeadElement(tag: ManagedHeadTag) {
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
    if (tag.fetchpriority) {
      element.setAttribute("fetchpriority", tag.fetchpriority);
    }
  }

  return element;
}
