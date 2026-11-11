import * as s from "remix/data-schema";
import { maxLength, minLength } from "remix/data-schema/checks";

import type { Photo, PhotoCard } from "./public/shopify-photo.ts";

export { findPhotoViewerState } from "./public/shopify-photo.ts";

// Filenames (and so slugs) are reduced to these characters when photos are
// read, so they're safe in URLs and download headers as is.
const SAFE_NAME = /^[A-Za-z0-9._-]+$/;

let photoSlugSchema = s
  .string()
  .pipe(minLength(1), maxLength(200))
  .refine((value) => SAFE_NAME.test(value), "Invalid photo");

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
    };
  });
}

/**
 * The photo's Shopify filename, reduced to letters, digits, dots, dashes, and
 * underscores (other runs become a dash). The result is safe to show, to use
 * as a URL segment, and to send in a `Content-Disposition` header.
 */
function getPhotoFilename(photo: Photo, index: number) {
  let name = "";
  try {
    name = decodeURIComponent(
      new URL(photo.url).pathname.split("/").at(-1) ?? "",
    );
  } catch {
    /* fall through to the numbered name */
  }
  let safe = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^[-.]+|-+$/g, "");
  return SAFE_NAME.test(safe) ? safe : `PHOTO-${index + 1}.JPG`;
}
