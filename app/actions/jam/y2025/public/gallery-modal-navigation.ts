/** What a keydown inside the open gallery modal should do. */
export type GalleryKeyAction =
  | "trap-focus"
  | "close"
  | "previous"
  | "next"
  | "block-scroll";

type KeyLike = {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
};

let GALLERY_KEY_ACTIONS = new Map<
  string,
  { action: GalleryKeyAction; ignoreWhenModified: boolean }
>([
  ["Tab", { action: "trap-focus", ignoreWhenModified: false }],
  ["Escape", { action: "close", ignoreWhenModified: false }],
  ["ArrowLeft", { action: "previous", ignoreWhenModified: true }],
  ["ArrowRight", { action: "next", ignoreWhenModified: true }],
  ["ArrowUp", { action: "block-scroll", ignoreWhenModified: true }],
  ["ArrowDown", { action: "block-scroll", ignoreWhenModified: true }],
]);

/** Maps a keydown to a gallery action; arrow keys are ignored with Meta/Ctrl/Alt held. */
export function getGalleryKeyAction(event: KeyLike): GalleryKeyAction | null {
  let entry = GALLERY_KEY_ACTIONS.get(event.key);
  if (!entry) return null;
  let isModified = event.metaKey || event.ctrlKey || event.altKey;
  if (entry.ignoreWhenModified && isModified) return null;
  return entry.action;
}

/**
 * Reads the `?photo=` index from `href` when it points at the gallery page.
 * Falls back to 0 for other pages, malformed URLs, and out-of-range values.
 */
export function getGalleryPhotoIndex(
  href: string,
  closeHref: string,
  photoCount: number,
) {
  if (photoCount <= 0) return 0;
  try {
    let url = new URL(href);
    if (url.pathname !== closeHref.split("?")[0]) return 0;
    let parsed = Number.parseInt(url.searchParams.get("photo") ?? "", 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed >= photoCount) {
      return 0;
    }
    return parsed;
  } catch {
    return 0;
  }
}

/** Steps through photos by `delta`, wrapping around at both ends. */
export function wrapPhotoIndex(
  current: number,
  delta: number,
  photoCount: number,
) {
  return (current + delta + photoCount) % photoCount;
}

/**
 * Element Tab should move to so focus stays inside the modal, or `null` to let
 * the browser move focus normally. Without focusable children, the host itself
 * stands in for both boundaries.
 */
export function getTabTrapTarget<T>({
  host,
  focusableElements,
  activeElement,
  hostContainsActive,
  shiftKey,
}: {
  host: T;
  focusableElements: T[];
  activeElement: unknown;
  hostContainsActive: boolean;
  shiftKey: boolean;
}): T | null {
  let first = focusableElements[0] ?? host;
  let last = focusableElements.at(-1) ?? host;
  if (!hostContainsActive) return shiftKey ? last : first;
  if (shiftKey && activeElement === first) return last;
  if (!shiftKey && activeElement === last) return first;
  return null;
}

/** True for an unmodified primary-button click the page should handle itself. */
export function isPlainPrimaryClick(event: {
  defaultPrevented: boolean;
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
