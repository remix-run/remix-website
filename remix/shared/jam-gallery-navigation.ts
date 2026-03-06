import { routes } from "../routes";

export const JAM_GALLERY_HYDRATION_READY_ATTRIBUTE =
  "data-jam-gallery-navigation-ready";

export function isJamGalleryPhotoNavigation(currentUrl: URL, nextUrl: URL) {
  if (
    currentUrl.pathname !== routes.jam2025Gallery.href() ||
    nextUrl.pathname !== routes.jam2025Gallery.href()
  ) {
    return false;
  }

  return (
    getNormalizedSearch(currentUrl.searchParams) ===
      getNormalizedSearch(nextUrl.searchParams) &&
    currentUrl.searchParams.get("photo") !== nextUrl.searchParams.get("photo")
  );
}

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

function getNormalizedSearch(searchParams: URLSearchParams) {
  let normalized = new URLSearchParams();

  for (let [key, value] of Array.from(searchParams.entries()).sort((a, b) => {
    if (a[0] === b[0]) return a[1].localeCompare(b[1]);
    return a[0].localeCompare(b[0]);
  })) {
    if (key === "photo") continue;
    normalized.append(key, value);
  }

  return normalized.toString();
}
