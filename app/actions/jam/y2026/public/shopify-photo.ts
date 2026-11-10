export type Photo = {
  url: string;
  altText?: string;
  width: number;
  height: number;
};

/** A photo with the filename, URL slug, and tilt its cards show. */
export type PhotoCard = Photo & {
  filename: string;
  slug: string;
  tilt: number;
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
