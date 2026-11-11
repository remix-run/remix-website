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

// How many photos the viewer's filmstrip shows on each side of the open one.
const TIMELINE_RADIUS = 4;

/** The photo with this slug and its neighbors, wrapping around the ends. */
export function findPhotoViewerState(
  cards: PhotoCard[],
  slug: string,
): PhotoViewerState | undefined {
  let index = cards.findIndex((card) => card.slug === slug);
  if (index === -1) return undefined;

  let count = cards.length;
  let at = (offset: number) =>
    cards[(((index + offset) % count) + count) % count];
  // Wraps around like stepping does, without repeating a photo when there
  // are too few to fill both sides.
  let radius = Math.min(TIMELINE_RADIUS, Math.floor((count - 1) / 2));
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

// The gallery's cards, registered by the photo deck, so the viewer can show a
// photo the moment it's chosen instead of waiting for the server's copy.
let galleryCards: PhotoCard[] = [];

export function setGalleryCards(cards: PhotoCard[]) {
  galleryCards = cards;
}

export function getGalleryCards() {
  return galleryCards;
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
