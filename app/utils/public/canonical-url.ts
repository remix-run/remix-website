const CANONICAL_ORIGIN = "https://remix.run";

/**
 * Production and staging pages canonicalize to remix.run so search engines
 * consolidate duplicates there; local servers keep their own origin.
 */
export function getCanonicalOrigin(url: URL) {
  if (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]"
  ) {
    return url.origin;
  }
  return CANONICAL_ORIGIN;
}

export function getCanonicalUrl(url: URL, pathname = url.pathname) {
  return `${getCanonicalOrigin(url)}${pathname}`;
}

/**
 * Canonical page and share-image URLs for a page served at `url`, so social
 * tags agree with the page's `<link rel="canonical">`. Relative image paths
 * resolve against the canonical origin; absolute image URLs pass through.
 */
export function getCanonicalPageUrls(url: URL, image: string) {
  let origin = getCanonicalOrigin(url);

  return {
    pageUrl: getCanonicalUrl(url),
    imageUrl: /^https?:\/\//.test(image)
      ? image
      : new URL(image, origin).toString(),
  };
}
