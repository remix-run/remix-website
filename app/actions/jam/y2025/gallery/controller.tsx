import { createController } from "remix/router";

import { getPhotos } from "../../../../data/jam-storefront.ts";
import { jam2025GalleryDownloadHandler } from "./download.ts";
import type { AppRenderer } from "../../../../middleware/render.ts";
import { CACHE_CONTROL } from "../../../../utils/cache-control.ts";
import { routes } from "../../../../routes.ts";
import { JamDocument } from "../document.tsx";
import {
  ScrambleText,
  Title,
  transformShopifyImageUrl,
} from "../public/shared.tsx";
import {
  JamGalleryModalHost,
  type JamGalleryModalNav,
} from "../public/gallery-modal-host.tsx";
import { assetPaths } from "../../../../utils/public/asset-paths.ts";
import { Icon } from "../../../../ui/public/icon.tsx";
import { css, type Handle, type Props, type RemixNode } from "remix/ui";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";

type Photo = Awaited<ReturnType<typeof getPhotos>>[number];

export default createController(routes.jam.y2025.gallery, {
  actions: {
    async index({ render, request }) {
      let photos = await getGalleryPhotos();
      let selectedPhotoIndex = getSelectedPhotoIndex(
        new URL(request.url).searchParams.get("photo"),
        photos.length,
      );

      return renderGalleryPage({ photos, render, request, selectedPhotoIndex });
    },

    download: jam2025GalleryDownloadHandler,
  },
});

function renderGalleryPage({
  photos,
  render,
  request,
  selectedPhotoIndex,
}: {
  photos: Photo[];
  render: AppRenderer;
  request: Request;
  selectedPhotoIndex: number | null;
}) {
  return render(
    <JamDocument
      title="Photo Gallery | Remix Jam 2025"
      description="Photos from Remix Jam 2025"
      previewImage={assetPaths.jam2025.ogGallery}
      requestUrl={request.url}
      activePath={routes.jam.y2025.gallery.index.href()}
      hideBackground
    >
      <main
        id="main-content"
        mix={css({
          display: "flex",
          maxWidth: "1920px",
          marginInline: "auto",
          flexDirection: "column",
          alignItems: "center",
          gap: "48px",
          paddingBlock: "80px",
          paddingTop: "120px",
          textAlign: "center",
          [breakpointMedia.md]: { paddingTop: "200px" },
          [breakpointMedia.lg]: { paddingTop: "210px" },
        })}
        tabIndex={-1}
      >
        <Title>
          <ScrambleText text="Photo" delay={100} color="blue" />
          <ScrambleText text="Gallery" delay={300} color="green" />
        </Title>

        {photos.length === 0 ? (
          <p
            mix={css({
              color: "rgb(255 255 255 / 0.7)",
              fontSize: "1.125rem",
              lineHeight: 1.556,
            })}
          >
            No photos available yet.
          </p>
        ) : (
          <div mix={css({ width: "100%" })}>
            <div
              mix={css({
                width: "100%",
                columnCount: 1,
                columnGap: "16px",
                [breakpointMedia.md]: { columnCount: 2, columnGap: "24px" },
                [breakpointMedia.lg]: { columnCount: 3 },
                [breakpointMedia["2xl"]]: { columnCount: 4 },
              })}
            >
              {photos.map((photo, index) => (
                <div
                  key={photo.url}
                  mix={css({
                    width: "100%",
                    marginBottom: "16px",
                    breakInside: "avoid",
                    [breakpointMedia.md]: { marginBottom: "24px" },
                  })}
                >
                  <JamGalleryLink
                    href={`${routes.jam.y2025.gallery.index.href()}?photo=${index}`}
                    mix={css({
                      display: "block",
                      overflow: "hidden",
                      borderRadius: "8px",
                      backgroundColor: "rgb(255 255 255 / 0.05)",
                      outline: "none",
                      transition: "opacity 300ms",
                      "&:is(:hover, :focus-visible)": { opacity: 0.85 },
                      "&:focus-visible": {
                        outline: `2px solid ${theme.colors.brand.blue}`,
                        outlineOffset: "2px",
                      },
                      "@media (prefers-reduced-motion: reduce)": {
                        transition: "none",
                      },
                    })}
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
      <JamGalleryModalHost photoCount={handle.props.photos.length} nav={nav}>
        <JamGalleryLink
          href={nav.closeHref}
          tabindex={-1}
          ariaLabel="Close gallery backdrop"
          mix={css({
            position: "absolute",
            inset: 0,
            zIndex: 0,
            display: "block",
          })}
        />
        <div
          mix={css({
            position: "relative",
            zIndex: 10,
            display: "flex",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            gap: "24px",
            padding: "16px",
            [breakpointMedia.md]: { padding: "36px" },
          })}
        >
          <div
            mix={css({
              display: "flex",
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "space-between",
            })}
          >
            <IconLink href={nav.closeHref} icon="x-mark" label="Close modal" />
            <IconLink
              href={downloadHref}
              icon="download"
              label="Download full resolution image"
              download={`remix-jam-2025-photo-${handle.props.selectedPhotoIndex + 1}.jpg`}
            />
          </div>
          <div
            mix={css({
              position: "relative",
              display: "flex",
              minHeight: 0,
              flex: "1",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            })}
          >
            <div mix={[modalChevronStyle, css({ left: 0 })]}>
              <IconLink
                href={nav.previousHref}
                icon="chevron-r"
                label="Previous photo"
                flip
              />
            </div>
            <div mix={[modalChevronStyle, css({ right: 0 })]}>
              <IconLink
                href={nav.nextHref}
                icon="chevron-r"
                label="Next photo"
              />
            </div>
            <ModalImage key={selectedPhoto.url} photo={selectedPhoto} />
          </div>
          <div
            mix={css({
              display: "flex",
              flexShrink: 0,
              justifyContent: "center",
            })}
          >
            <div
              mix={css({
                borderRadius: theme.radius.full,
                padding: "8px 16px",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontSize: "0.875rem",
                fontWeight: theme.fontWeight.semibold,
                lineHeight: 1.425,
              })}
            >
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
    mix?: Props<"a">["mix"];
    ariaLabel?: string;
    tabindex?: number;
    children?: RemixNode;
  }>,
) {
  return () => (
    <a
      href={handle.props.href}
      rmx-reset-scroll="false"
      aria-label={handle.props.ariaLabel}
      tabindex={handle.props.tabindex}
      mix={handle.props.mix}
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
        mix={css({
          marginInline: "-24px",
          backgroundColor: "rgb(255 255 255 / 0.05)",
          [breakpointMedia.md]: { marginInline: 0 },
        })}
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
          mix={css({
            width: "100%",
            height: "100%",
            objectFit: "contain",
          })}
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
    flip?: boolean;
    download?: string;
  }>,
) {
  return () =>
    handle.props.download ? (
      <a
        href={handle.props.href}
        aria-label={handle.props.label}
        download={handle.props.download}
        mix={iconLinkStyle}
      >
        <Icon
          name={handle.props.icon}
          mix={
            handle.props.flip
              ? [iconLinkIconStyle, flippedIconStyle]
              : iconLinkIconStyle
          }
          aria-hidden="true"
        />
      </a>
    ) : (
      <JamGalleryLink
        href={handle.props.href}
        ariaLabel={handle.props.label}
        mix={iconLinkStyle}
      >
        <Icon
          name={handle.props.icon}
          mix={
            handle.props.flip
              ? [iconLinkIconStyle, flippedIconStyle]
              : iconLinkIconStyle
          }
          aria-hidden="true"
        />
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
        mix={css({
          width: "100%",
          userSelect: "none",
          transition: "transform 300ms",
          "&:hover": { transform: "scale(1.05)" },
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
            "&:hover": { transform: "none" },
          },
        })}
      />
    );
  };
}

let modalChevronStyle = css({
  position: "absolute",
  top: "50%",
  zIndex: 10,
  transform: "translateY(-50%)",
});

let iconLinkStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "4px",
  borderRadius: theme.radius.full,
  padding: "12px",
  backgroundColor: "#ffffff",
  color: "#000000",
  outline: "none",
  transition: "color 300ms, background-color 300ms",
  "&:is(:hover, :focus-visible)": {
    backgroundColor: theme.colors.brand.blue,
    color: "#ffffff",
  },
  "&:focus-visible": {
    outline: `2px solid ${theme.colors.brand.blue}`,
    outlineOffset: "3px",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let iconLinkIconStyle = css({
  width: "24px",
  height: "24px",
  pointerEvents: "none",
});

let flippedIconStyle = css({ transform: "rotate(180deg)" });
