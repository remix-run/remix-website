import { getPhotos } from "../../../../data/jam-storefront.ts";

export type Photo = Awaited<ReturnType<typeof getGalleryPhotos>>[number];

export async function getGalleryPhotos() {
  let pages = await Promise.all([
    getPhotos("remix-jam-2025-photos-1"),
    getPhotos("remix-jam-2025-photos-2"),
  ]);
  return pages.flat();
}

/** Parses the `?photo=` index; `null` when it is missing or out of range. */
export function getSelectedPhotoIndex(
  photoParam: string | null,
  photosCount: number,
): number | null {
  if (!photoParam) return null;
  let parsed = Number.parseInt(photoParam, 10);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0 || parsed >= photosCount) return null;
  return parsed;
}

export function transformShopifyImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    format?: "webp" | "jpg" | "png";
    quality?: number;
  } = {},
) {
  try {
    let urlObj = new URL(url);
    let params = new URLSearchParams(urlObj.search);
    for (let [key, value] of Object.entries(options)) {
      if (value !== undefined) params.set(key, value.toString());
    }
    urlObj.search = params.toString();
    return urlObj.toString();
  } catch {
    return url;
  }
}
