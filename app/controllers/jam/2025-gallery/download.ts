import { getRequestContext } from "../../../utils/request-context";
import { CACHE_CONTROL } from "../../../utils/cache-control";
import { transformShopifyImageUrl } from "../shared";
import { getGalleryPhotos, getSelectedPhotoIndex } from "./controller";

export async function jam2025GalleryDownloadHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let photos = await getGalleryPhotos();
  let selectedPhotoIndex = getSelectedPhotoIndex(
    requestUrl.searchParams.get("photo"),
    photos.length,
  );

  if (selectedPhotoIndex === null) {
    return new Response("Invalid photo index", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let selectedPhoto = photos[selectedPhotoIndex];
  let downloadSrc = transformShopifyImageUrl(selectedPhoto.url, {
    width: 1920,
    format: "jpg",
    quality: 90,
  });

  let upstreamResponse = await fetch(downloadSrc);
  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return new Response("Unable to download photo", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let contentType =
    upstreamResponse.headers.get("Content-Type") ?? "image/jpeg";
  let extension = getFileExtensionFromContentType(contentType);

  return new Response(upstreamResponse.body, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="remix-jam-2025-photo-${selectedPhotoIndex + 1}.${extension}"`,
    },
  });
}

function getFileExtensionFromContentType(contentType: string) {
  if (contentType.includes("image/png")) return "png";
  if (contentType.includes("image/webp")) return "webp";
  return "jpg";
}
