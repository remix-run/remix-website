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
  imageSizes?: string;
  imageSrcSet?: string;
  as?: string;
  crossorigin?: "anonymous" | "use-credentials";
  fetchpriority?: "high" | "low" | "auto";
};

// Optional link attributes, in key order, paired with their DOM attribute names.
const OPTIONAL_LINK_ATTRIBUTES = [
  ["type", "type"],
  ["sizes", "sizes"],
  ["imageSizes", "imagesizes"],
  ["imageSrcSet", "imagesrcset"],
  ["as", "as"],
  ["crossorigin", "crossorigin"],
  ["fetchpriority", "fetchpriority"],
] as const satisfies ReadonlyArray<readonly [keyof ManagedLinkTag, string]>;

export function getManagedHeadTagKey(tag: ManagedHeadTag, index: number) {
  if (tag.kind === "meta") {
    return `meta:${tag.name ?? tag.property ?? index}:${getCompactHeadKey(tag.content)}`;
  }

  return `link:${tag.rel}:${getCompactHeadKey(
    [
      tag.href,
      ...OPTIONAL_LINK_ATTRIBUTES.map(([property]) => tag[property]),
    ].join("\0"),
  )}`;
}

export function getCompactHeadKey(value: string) {
  // Length-prefixed FNV-1a keeps serialized keys compact and deterministic in
  // both the server and browser runtimes.
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return `${value.length.toString(36)}-${(hash >>> 0).toString(36)}`;
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

  let tag: ManagedLinkTag = {
    kind: "link",
    rel: node.getAttribute("rel") ?? "",
    href: node.getAttribute("href") ?? "",
  };
  for (let [property, attribute] of OPTIONAL_LINK_ATTRIBUTES) {
    // Managed nodes are only created from ManagedLinkTag values, so their
    // attributes already satisfy the narrower `crossorigin`/`fetchpriority` types.
    (tag as Record<string, string | undefined>)[property] =
      node.getAttribute(attribute) ?? undefined;
  }
  return getManagedHeadTagKey(tag, index);
}

function createManagedHeadElement(tag: ManagedHeadTag) {
  let element = document.createElement(tag.kind);
  element.setAttribute("data-remix-managed-head", "true");

  if (tag.kind === "meta") {
    if (tag.name) element.setAttribute("name", tag.name);
    if (tag.property) element.setAttribute("property", tag.property);
    element.setAttribute("content", tag.content);
    return element;
  }

  element.setAttribute("rel", tag.rel);
  element.setAttribute("href", tag.href);
  for (let [property, attribute] of OPTIONAL_LINK_ATTRIBUTES) {
    let value = tag[property];
    if (value) element.setAttribute(attribute, value);
  }
  return element;
}
