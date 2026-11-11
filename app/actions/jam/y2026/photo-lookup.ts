import * as s from "remix/data-schema";
import { maxLength, minLength } from "remix/data-schema/checks";

import { getPhotos } from "../../../data/jam-storefront.ts";
import type { Photo, PhotoCard } from "./public/shopify-photo.ts";

export { findPhotoViewerState } from "./public/shopify-photo.ts";

// How long the photo list stays fresh. After that, the next request still
// gets the cached list straight away while a fresh one loads behind it.
const PHOTOS_FRESH_MS = 5 * 60 * 1000;

let cachedPhotos: { photos: Photo[]; fetchedAt: number } | undefined;
let photosRequest: Promise<Photo[]> | undefined;

/**
 * The Jam 2026 photos, cached in memory. Every viewer step renders from the
 * whole list, and Shopify takes about 100ms to send it. An empty list (no
 * photos, or a failed request) isn't cached, so it's retried next time.
 */
export async function getJam2026Photos() {
  if (!cachedPhotos) return requestPhotos();
  if (Date.now() - cachedPhotos.fetchedAt > PHOTOS_FRESH_MS) {
    void requestPhotos();
  }
  return cachedPhotos.photos;
}

/** Forgets the cached photos, for tests that swap in their own. */
export function clearJam2026PhotosCache() {
  cachedPhotos = undefined;
}

// One request at a time, shared by everyone waiting on it. getPhotos never
// rejects; it returns an empty list when Shopify fails.
function requestPhotos() {
  photosRequest ??= getPhotos("remix-jam-2026")
    .then((photos) => {
      if (photos.length > 0) {
        cachedPhotos = { photos, fetchedAt: Date.now() };
      }
      return cachedPhotos?.photos ?? photos;
    })
    .finally(() => {
      photosRequest = undefined;
    });
  return photosRequest;
}

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
