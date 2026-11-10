import * as s from "remix/data-schema";
import { maxLength, minLength } from "remix/data-schema/checks";

import {
  getPhotoFilename,
  getPhotoSlug,
  getPhotoTilt,
  type Photo,
  type PhotoViewerState,
  type ViewerPhoto,
} from "./public/shopify-photo.ts";

// How many photos the viewer's filmstrip shows on each side of the open one.
const TIMELINE_RADIUS = 4;

let photoSlugSchema = s.string().pipe(minLength(1), maxLength(200));

export function parsePhotoSlug(value: string) {
  let result = s.parseSafe(photoSlugSchema, value);
  return result.success ? result.value : null;
}

/** The photo with this slug and its neighbors, wrapping around the ends. */
export function findPhotoViewerState(
  photos: Photo[],
  slug: string,
): PhotoViewerState | null {
  let viewerPhotos = photos.map((photo, index): ViewerPhoto => {
    let filename = getPhotoFilename(photo, index);
    return {
      ...photo,
      filename,
      slug: getPhotoSlug(filename),
      tilt: getPhotoTilt(filename),
    };
  });
  let index = viewerPhotos.findIndex((photo) => photo.slug === slug);
  if (index === -1) return null;

  let count = viewerPhotos.length;
  let at = (offset: number) =>
    viewerPhotos[(((index + offset) % count) + count) % count];
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
    photo: viewerPhotos[index],
    previous: at(-1),
    next: at(1),
    timeline,
  };
}
