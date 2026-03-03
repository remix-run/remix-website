import { getPhotos } from "./jam-storefront.server";
import { getRequestContext } from "../utils/request-context";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control";
import { routes } from "../routes";
import {
  JamDocument,
  ScrambleText,
  Title,
  transformShopifyImageUrl,
} from "./jam-shared";
import { JamGalleryModalControls } from "../assets/jam-gallery-modal-controls";
import ogImageSrc from "../../app/routes/jam/images/og-gallery.jpg";
import iconsHref from "../../shared/icons.svg";

type Photo = Awaited<ReturnType<typeof getPhotos>>[number];

export async function jam2025GalleryHandler() {
  let requestUrl = new URL(getRequestContext().request.url);
  let pageUrl = `${requestUrl.origin}/jam/2025/gallery`;
  let previewImage = `${requestUrl.origin}${ogImageSrc}`;
  let photos = await getGalleryPhotos();
  let selectedPhotoIndex = getSelectedPhotoIndex(
    requestUrl.searchParams.get("photo"),
    photos.length,
  );

  return render.document(
    <JamDocument
      title="Photo Gallery | Remix Jam 2025"
      description="Photos from Remix Jam 2025"
      pageUrl={pageUrl}
      previewImage={previewImage}
      activePath="/jam/2025/gallery"
      hideBackground
    >
      <main class="mx-auto flex max-w-[1920px] flex-col items-center gap-12 py-20 pt-[120px] text-center md:pt-[200px] lg:pt-[210px]">
        <Title>
          <ScrambleText text="Photo Gallery" delay={100} color="blue" />
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
                    class="block overflow-hidden rounded-lg bg-white/5 outline-none transition-opacity duration-300 hover:opacity-85 focus-visible:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-brand"
                  >
                    <PhotoImage {...photo} />
                  </a>
                </div>
              ))}
            </div>
            {selectedPhotoIndex !== null ? (
              <GalleryModal
                photos={photos}
                selectedPhotoIndex={selectedPhotoIndex}
              />
            ) : null}
          </>
        )}
      </main>
    </JamDocument>,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}

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

  let contentType = upstreamResponse.headers.get("Content-Type") ?? "image/jpeg";
  let extension = getFileExtensionFromContentType(contentType);

  return new Response(upstreamResponse.body, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="remix-jam-2025-photo-${selectedPhotoIndex + 1}.${extension}"`,
    },
  });
}

function GalleryModal() {
  return ({
    photos,
    selectedPhotoIndex,
  }: {
    photos: Photo[];
    selectedPhotoIndex: number;
  }) => {
    let selectedPhoto = photos[selectedPhotoIndex];
    let previousPhotoIndex =
      selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1;
    let nextPhotoIndex =
      selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0;
    let closeHref = routes.jam2025Gallery.href();
    let previousHref = `${routes.jam2025Gallery.href()}?photo=${previousPhotoIndex}`;
    let nextHref = `${routes.jam2025Gallery.href()}?photo=${nextPhotoIndex}`;
    let downloadHref = `${routes.jam2025GalleryDownload.href()}?photo=${selectedPhotoIndex}`;

    return (
      <JamGalleryModalControls
        closeHref={closeHref}
        previousHref={previousHref}
        nextHref={nextHref}
        class="fixed inset-0 z-50 size-full select-none bg-black/70 backdrop-blur"
      >
        <a
          href={closeHref}
          aria-label="Close gallery backdrop"
          class="absolute inset-0 z-0 block"
        />
        <div class="relative z-10 flex h-full w-full flex-col gap-6 p-4 md:p-9">
          <div class="flex shrink-0 items-center justify-between">
            <IconLink
              href={closeHref}
              icon="x-mark"
              label="Close modal"
            />
            <IconLink
              href={downloadHref}
              icon="download"
              label="Download full resolution image"
              download={`remix-jam-2025-photo-${selectedPhotoIndex + 1}.jpg`}
            />
          </div>
          <div class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div class="absolute left-0 top-1/2 z-10 -translate-y-1/2">
              <IconLink
                href={previousHref}
                icon="chevron-r"
                label="Previous photo"
                className="[&_svg]:rotate-180"
              />
            </div>
            <div class="absolute right-0 top-1/2 z-10 -translate-y-1/2">
              <IconLink href={nextHref} icon="chevron-r" label="Next photo" />
            </div>
            <ModalImage photo={selectedPhoto} />
          </div>
          <div class="flex shrink-0 justify-center">
            <div class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
              {selectedPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      </JamGalleryModalControls>
    );
  };
}

function ModalImage() {
  return ({ photo }: { photo: Photo }) => {
    let maxWidth = 1920;
    let maxHeight = 1080;
    let imageSrc = transformShopifyImageUrl(photo.url, {
      width: maxWidth,
      height: maxHeight,
      format: "webp",
      quality: 90,
    });
    let aspectRatio = photo.width / photo.height;
    let isLandscape = photo.width > photo.height;

    return (
      <div
        class="-mx-6 bg-white/5 md:mx-0"
        style={{
          aspectRatio,
          ...(isLandscape
            ? { maxWidth, width: "100%" }
            : { maxHeight, height: "100%" }),
        }}
      >
        <img
          src={imageSrc}
          alt={photo.altText || ""}
          class="size-full object-contain"
        />
      </div>
    );
  };
}

function IconLink() {
  return (props: {
    href: string;
    icon: "chevron-r" | "x-mark" | "download";
    label: string;
    className?: string;
    download?: string;
    target?: string;
    rel?: string;
  }) => (
    <a
      href={props.href}
      aria-label={props.label}
      download={props.download}
      target={props.target}
      rel={props.rel}
      class={`m-1 flex items-center justify-center rounded-full bg-white p-3 text-black outline-none transition-colors duration-300 hover:bg-blue-brand hover:text-white focus-visible:bg-blue-brand focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-brand ${props.className ?? ""}`}
    >
      <svg class="size-6" aria-hidden="true">
        <use href={`${iconsHref}#${props.icon}`} />
      </svg>
    </a>
  );
}

function getSelectedPhotoIndex(
  photoParam: string | null,
  photosCount: number,
): number | null {
  if (!photoParam) return null;
  let parsed = Number.parseInt(photoParam, 10);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0 || parsed >= photosCount) return null;
  return parsed;
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
