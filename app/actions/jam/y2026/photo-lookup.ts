import * as s from "remix/data-schema";
import { maxLength, minLength } from "remix/data-schema/checks";

import type {
  Photo,
  PhotoCard,
  PhotoViewerState,
} from "./public/shopify-photo.ts";

// How many photos the viewer's filmstrip shows on each side of the open one.
const TIMELINE_RADIUS = 4;
const MAX_TILT_DEGREES = 3;

let photoSlugSchema = s.string().pipe(minLength(1), maxLength(200));

export function parsePhotoSlug(value: string) {
  let result = s.parseSafe(photoSlugSchema, value);
  return result.success ? result.value : null;
}

/**
 * Names each photo for its card. A photo's slug, its URL segment, is its
 * filename without the extension.
 */
export function getPhotoCards(photos: Photo[]): PhotoCard[] {
  return photos.map((photo, index) => {
    let filename = getPhotoFilename(photo, index);
    return {
      ...photo,
      filename,
      slug: filename.replace(/\.[^.]+$/, ""),
      tilt: getPhotoTilt(filename),
    };
  });
}

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

function getPhotoFilename(photo: Photo, index: number) {
  try {
    let name = new URL(photo.url).pathname.split("/").at(-1);
    if (name) return decodeURIComponent(name);
  } catch {
    /* fall through to the numbered name */
  }
  return `PHOTO-${index + 1}.JPG`;
}

/**
 * Tilts each card by a hash of its filename, so a photo keeps its angle across
 * renders and reorderings without any client-side randomness.
 */
function getPhotoTilt(filename: string) {
  // FNV-1a, seeded so the spread can be reshuffled by changing the seed.
  let hash = 0x811c9dc5;
  for (let char of `remix-jam-2026:${filename}`) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193);
  }
  let unit = (hash >>> 0) / 0xffffffff;
  return Math.round((unit * 2 - 1) * MAX_TILT_DEGREES * 10) / 10;
}
