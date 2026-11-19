export type Photo = {
  url: string;
  altText?: string;
  width: number;
  height: number;
};

/** A photo with the filename and URL slug its cards show. */
export type PhotoCard = Photo & {
  filename: string;
  slug: string;
};

/** The photo open in the viewer, its position, and its neighbors. */
export type PhotoViewerState = {
  index: number;
  count: number;
  photo: PhotoCard;
  previous: PhotoCard;
  next: PhotoCard;
  /** The photos around this one, in order, for the viewer's filmstrip. */
  timeline: (PhotoCard & { current: boolean })[];
};

/** The photo with this slug and its neighbors, wrapping around the ends. */
export function findPhotoViewerState(
  cards: readonly PhotoCard[],
  slug: string,
): PhotoViewerState | undefined {
  let index = cards.findIndex((card) => card.slug === slug);
  if (index === -1) return undefined;

  let count = cards.length;
  let at = (offset: number) =>
    cards[(((index + offset) % count) + count) % count];
  // Up to four photos on each side of the open one, wrapping around like
  // stepping does, without repeating a photo when there are too few.
  let radius = Math.min(4, Math.floor((count - 1) / 2));
  let timeline = [];
  for (let offset = -radius; offset <= radius; offset++) {
    timeline.push({ ...at(offset), current: offset === 0 });
  }

  return {
    index,
    count,
    photo: cards[index],
    previous: at(-1),
    next: at(1),
    timeline,
  };
}

/** The URL of the photo at the size the viewer shows it. */
export function getViewerImageUrl(url: string) {
  return resizeShopifyImage(url, 1920);
}

let preloadedViewerImages = new Set<string>();

/** Starts loading the photo at viewer size, once, so it's ready to open. */
export function preloadViewerImage(url: string) {
  let src = getViewerImageUrl(url);
  if (preloadedViewerImages.has(src)) return;
  preloadedViewerImages.add(src);
  new Image().src = src;
}

export function resizeShopifyImage(url: string, width: number) {
  try {
    let resized = new URL(url);
    resized.searchParams.set("width", String(width));
    resized.searchParams.set("format", "webp");
    resized.searchParams.set("quality", "85");
    return resized.toString();
  } catch {
    return url;
  }
}
