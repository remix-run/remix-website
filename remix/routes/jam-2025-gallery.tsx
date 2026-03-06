import { getPhotos } from "./jam-storefront.server";
import { JamGalleryNavigation } from "../assets/jam-gallery-navigation";
import { getRequestContext } from "../utils/request-context";
import { CACHE_CONTROL } from "../shared/cache-control";
import { transformShopifyImageUrl } from "../shared/jam-images";
import { getSelectedPhotoIndex as getSelectedPhotoIndexFromParams } from "../shared/jam-gallery-navigation";
import { routes } from "../routes";
import { ScrambleText, Title } from "./jam-shared";
import { renderJamPage } from "./jam-render";
import ogImageSrc from "../assets/jam/images/og-gallery.jpg";

type Photo = Awaited<ReturnType<typeof getPhotos>>[number];

export async function jam2025GalleryHandler() {
  let request = getRequestContext().request;
  let requestUrl = new URL(request.url);
  let pageUrl = `${requestUrl.origin}/jam/2025/gallery`;
  let previewImage = `${requestUrl.origin}${ogImageSrc}`;
  let photos = await getGalleryPhotos();
  let selectedPhotoIndex = getSelectedPhotoIndexFromParams(
    requestUrl.searchParams.get("photo"),
    photos.length,
  );

  return renderJamPage({
    request,
    cacheControl: CACHE_CONTROL.DEFAULT,
    title: "Photo Gallery | Remix Jam 2025",
    description: "Photos from Remix Jam 2025",
    pageUrl,
    previewImage,
    activePath: "/jam/2025/gallery",
    hideBackground: true,
    children: (
      <main
        class="mx-auto flex max-w-[1920px] flex-col items-center gap-12 py-20 pt-[120px] text-center md:pt-[200px] lg:pt-[210px]"
        tabIndex={-1}
      >
        <Title>
          <ScrambleText text="Photo" delay={100} color="blue" />
          <ScrambleText text="Gallery" delay={300} color="green" />
        </Title>

        {photos.length === 0 ? (
          <p class="text-lg text-white/70">No photos available yet.</p>
        ) : (
          <>
            <div class="w-full columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 2xl:columns-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.url}
                  class="mb-4 w-full break-inside-avoid md:mb-6"
                >
                  <a
                    href={`${routes.jam2025Gallery.href()}?photo=${index}`}
                    data-gallery-photo-link
                    data-gallery-photo-index={index}
                    class="block overflow-hidden rounded-lg bg-white/5 outline-none transition-opacity duration-300 hover:opacity-85 focus-visible:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-brand"
                  >
                    <PhotoImage {...photo} />
                  </a>
                </div>
              ))}
            </div>
            <JamGalleryNavigation
              photos={photos}
              initialSelectedPhotoIndex={selectedPhotoIndex}
            />
          </>
        )}
      </main>
    ),
  });
}

export async function jam2025GalleryDownloadHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let photos = await getGalleryPhotos();
  let selectedPhotoIndex = getSelectedPhotoIndexFromParams(
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

async function getGalleryPhotos() {
  return Promise.all([
    getPhotos("remix-jam-2025-photos-1"),
    getPhotos("remix-jam-2025-photos-2"),
  ]).then((p) => p.flat());
}

function getFileExtensionFromContentType(contentType: string) {
  if (contentType.includes("image/png")) return "png";
  if (contentType.includes("image/webp")) return "webp";
  return "jpg";
}

function PhotoImage() {
  return ({ url, altText, width, height }: Photo) => {
    let sizes = [400, 600, 800, 1200];
    let srcSet = sizes
      .map((size) => {
        let sizedUrl = transformShopifyImageUrl(url, {
          width: size,
          format: "webp",
          quality: 85,
        });
        return `${sizedUrl} ${size}w`;
      })
      .join(", ");

    let src = transformShopifyImageUrl(url, {
      width: 800,
      format: "webp",
      quality: 85,
    });

    return (
      <img
        src={src}
        srcSet={srcSet}
        alt={altText || ""}
        width={width}
        height={height}
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1535px) 33vw, 25vw"
        loading="lazy"
        class="w-full select-none transition-transform duration-300 hover:scale-105"
      />
    );
  };
}
