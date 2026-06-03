import { getPhotos } from "../../../../data/jam-storefront.server.ts";
import type { AppContext } from "../../../../middleware/render.ts";
import { CACHE_CONTROL } from "../../../../utils/cache-control.ts";
import { routes } from "../../../../routes.ts";
import { JamDocument } from "../document.tsx";
import { ScrambleText, Title, transformShopifyImageUrl } from "../shared.tsx";
import {
  JamGalleryModalHost,
  type JamGalleryModalNav,
} from "../../../../assets/jam/2025/gallery-modal-host.tsx";
import { assetPaths } from "../../../../utils/asset-paths.ts";
import type { Handle, RemixNode } from "remix/ui";

type Photo = Awaited<ReturnType<typeof getPhotos>>[number];

export async function jam2025GalleryHandler({ render, request }: AppContext) {
  let requestUrl = new URL(request.url);
  let photos = await getGalleryPhotos();
  let selectedPhotoIndex = getSelectedPhotoIndex(
    requestUrl.searchParams.get("photo"),
    photos.length,
  );

  return render(
    <JamDocument
      title="Photo Gallery | Remix Jam 2025"
      description="Photos from Remix Jam 2025"
      previewImage={assetPaths.jam2025.ogGallery}
      requestUrl={request.url}
      activePath="/jam/2025/gallery"
      hideBackground
    >
      <main
        id="main-content"
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
          <div class="w-full">
            <div class="w-full columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 2xl:columns-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.url}
                  class="mb-4 w-full break-inside-avoid md:mb-6"
                >
                  <JamGalleryLink
                    href={`${routes.jam.y2025.gallery.index.href()}?photo=${index}`}
                    class="block overflow-hidden rounded-lg bg-white/5 outline-none transition-opacity duration-300 hover:opacity-85 focus-visible:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-brand"
                  >
                    <PhotoImage {...photo} />
                  </JamGalleryLink>
                </div>
              ))}
            </div>
            {selectedPhotoIndex !== null ? (
              <GalleryModal
                photos={photos}
                selectedPhotoIndex={selectedPhotoIndex}
              />
            ) : null}
          </div>
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

export { transformShopifyImageUrl };
export { getSelectedPhotoIndex };
export { getGalleryPhotos };

function GalleryModal(
  handle: Handle<{
    photos: Photo[];
    selectedPhotoIndex: number;
  }>,
) {
  return () => {
    let selectedPhoto = handle.props.photos[handle.props.selectedPhotoIndex];
    let nav = getJamGalleryModalNav(
      handle.props.selectedPhotoIndex,
      handle.props.photos.length,
    );
    let downloadHref = `${routes.jam.y2025.gallery.download.href()}?photo=${handle.props.selectedPhotoIndex}`;
    return (
      <JamGalleryModalHost
        photoCount={handle.props.photos.length}
        nav={nav}
        class="fixed inset-0 z-50 size-full select-none bg-black/70 backdrop-blur"
      >
        <JamGalleryLink
          href={nav.closeHref}
          tabindex={-1}
          ariaLabel="Close gallery backdrop"
          class="absolute inset-0 z-0 block"
        />
        <div class="relative z-10 flex h-full w-full flex-col gap-6 p-4 md:p-9">
          <div class="flex shrink-0 items-center justify-between">
            <IconLink href={nav.closeHref} icon="x-mark" label="Close modal" />
            <IconLink
              href={downloadHref}
              icon="download"
              label="Download full resolution image"
              download={`remix-jam-2025-photo-${handle.props.selectedPhotoIndex + 1}.jpg`}
            />
          </div>
          <div class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div class="absolute left-0 top-1/2 z-10 -translate-y-1/2">
              <IconLink
                href={nav.previousHref}
                icon="chevron-r"
                label="Previous photo"
                className="[&_svg]:rotate-180"
              />
            </div>
            <div class="absolute right-0 top-1/2 z-10 -translate-y-1/2">
              <IconLink
                href={nav.nextHref}
                icon="chevron-r"
                label="Next photo"
              />
            </div>
            <ModalImage key={selectedPhoto.url} photo={selectedPhoto} />
          </div>
          <div class="flex shrink-0 justify-center">
            <div class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
              {handle.props.selectedPhotoIndex + 1} /{" "}
              {handle.props.photos.length}
            </div>
          </div>
        </div>
      </JamGalleryModalHost>
    );
  };
}

function JamGalleryLink(
  handle: Handle<{
    href: string;
    class?: string;
    ariaLabel?: string;
    tabindex?: number;
    target?: string;
    rel?: string;
    children?: RemixNode;
  }>,
) {
  return () => (
    <a
      href={handle.props.href}
      rmx-reset-scroll="false"
      aria-label={handle.props.ariaLabel}
      tabindex={handle.props.tabindex}
      target={handle.props.target}
      rel={handle.props.rel}
      class={handle.props.class}
    >
      {handle.props.children}
    </a>
  );
}

function ModalImage(handle: Handle<{ photo: Photo }>) {
  return () => {
    let imageSrc = getGalleryModalImageSrc(handle.props.photo);
    let aspectRatio = handle.props.photo.width / handle.props.photo.height;
    let isLandscape = handle.props.photo.width > handle.props.photo.height;

    return (
      <div
        class="-mx-6 bg-white/5 md:mx-0"
        style={{
          aspectRatio: String(aspectRatio),
          width: isLandscape ? "100%" : "auto",
          maxWidth: isLandscape ? `${GALLERY_MODAL_MAX_WIDTH}px` : "none",
          height: isLandscape ? "auto" : "100%",
          maxHeight: isLandscape ? "none" : `${GALLERY_MODAL_MAX_HEIGHT}px`,
        }}
      >
        <img
          src={imageSrc}
          alt={handle.props.photo.altText || ""}
          class="size-full object-contain"
        />
      </div>
    );
  };
}

function IconLink(
  handle: Handle<{
    href: string;
    icon: "chevron-r" | "x-mark" | "download";
    label: string;
    className?: string;
    download?: string;
    target?: string;
    rel?: string;
  }>,
) {
  return () =>
    handle.props.download ? (
      <a
        href={handle.props.href}
        aria-label={handle.props.label}
        download={handle.props.download}
        target={handle.props.target}
        rel={handle.props.rel}
        class={`focus-visible:outline-offset-3 m-1 flex items-center justify-center rounded-full bg-white p-3 text-black outline-none transition-colors duration-300 hover:bg-blue-brand hover:text-white focus-visible:bg-blue-brand focus-visible:text-white focus-visible:outline-2 focus-visible:outline-blue-brand ${handle.props.className ?? ""}`}
      >
        <svg class="pointer-events-none size-6" aria-hidden="true">
          <use href={`${assetPaths.iconsSprite}#${handle.props.icon}`} />
        </svg>
      </a>
    ) : (
      <JamGalleryLink
        href={handle.props.href}
        ariaLabel={handle.props.label}
        target={handle.props.target}
        rel={handle.props.rel}
        class={`focus-visible:outline-offset-3 m-1 flex items-center justify-center rounded-full bg-white p-3 text-black outline-none transition-colors duration-300 hover:bg-blue-brand hover:text-white focus-visible:bg-blue-brand focus-visible:text-white focus-visible:outline-2 focus-visible:outline-blue-brand ${handle.props.className ?? ""}`}
      >
        <svg class="pointer-events-none size-6" aria-hidden="true">
          <use href={`${assetPaths.iconsSprite}#${handle.props.icon}`} />
        </svg>
      </JamGalleryLink>
    );
}

function getJamGalleryModalNav(
  selectedPhotoIndex: number,
  photosLength: number,
): JamGalleryModalNav {
  let base = routes.jam.y2025.gallery.index.href();
  let previousPhotoIndex =
    selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photosLength - 1;
  let nextPhotoIndex =
    selectedPhotoIndex < photosLength - 1 ? selectedPhotoIndex + 1 : 0;
  return {
    closeHref: base,
    previousHref: `${base}?photo=${previousPhotoIndex}`,
    nextHref: `${base}?photo=${nextPhotoIndex}`,
  };
}

let GALLERY_MODAL_MAX_WIDTH = 1920;
let GALLERY_MODAL_MAX_HEIGHT = 1080;
let GALLERY_GRID_IMAGE_WIDTHS = [400, 600, 800, 1200];
let GALLERY_GRID_DEFAULT_WIDTH = 800;

function getGalleryModalImageSrc(photo: Photo) {
  return transformShopifyImageUrl(photo.url, {
    width: GALLERY_MODAL_MAX_WIDTH,
    height: GALLERY_MODAL_MAX_HEIGHT,
    format: "webp",
    quality: 90,
  });
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

function PhotoImage(handle: Handle<Photo>) {
  return () => {
    let srcSet = GALLERY_GRID_IMAGE_WIDTHS.map((size) => {
      let sizedUrl = transformShopifyImageUrl(handle.props.url, {
        width: size,
        format: "webp",
        quality: 85,
      });
      return `${sizedUrl} ${size}w`;
    }).join(", ");

    let src = transformShopifyImageUrl(handle.props.url, {
      width: GALLERY_GRID_DEFAULT_WIDTH,
      format: "webp",
      quality: 85,
    });

    return (
      <img
        src={src}
        srcSet={srcSet}
        alt={handle.props.altText || ""}
        width={handle.props.width}
        height={handle.props.height}
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, (max-width: 1535px) 33vw, 25vw"
        loading="lazy"
        class="w-full select-none transition-transform duration-300 hover:scale-105"
      />
    );
  };
}
