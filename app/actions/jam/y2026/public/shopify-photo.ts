export type Photo = {
  url: string;
  altText?: string;
  width: number;
  height: number;
};

export type ViewerPhoto = Photo & {
  filename: string;
  slug: string;
  tilt: number;
};

/** The photo open in the viewer, its position, and its neighbors. */
export type PhotoViewerState = {
  index: number;
  count: number;
  photo: ViewerPhoto;
  previous: ViewerPhoto;
  next: ViewerPhoto;
  /** The photos around this one, in order, for the viewer's filmstrip. */
  timeline: (ViewerPhoto & { current: boolean })[];
};

const MAX_TILT_DEGREES = 3;

export function getPhotoFilename(photo: Photo, index: number) {
  try {
    let name = new URL(photo.url).pathname.split("/").at(-1);
    if (name) return decodeURIComponent(name);
  } catch {
    /* fall through to the numbered name */
  }
  return `PHOTO-${index + 1}.JPG`;
}

/** A photo's URL segment: its filename without the extension. */
export function getPhotoSlug(filename: string) {
  return filename.replace(/\.[^.]+$/, "");
}

/**
 * Tilts each card by a hash of its filename, so a photo keeps its angle across
 * renders and reorderings without any client-side randomness.
 */
export function getPhotoTilt(filename: string) {
  // FNV-1a, seeded so the spread can be reshuffled by changing the seed.
  let hash = 0x811c9dc5;
  for (let char of `remix-jam-2026:${filename}`) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193);
  }
  let unit = (hash >>> 0) / 0xffffffff;
  return Math.round((unit * 2 - 1) * MAX_TILT_DEGREES * 10) / 10;
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
