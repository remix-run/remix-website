import { useEffect, useRef } from "react";
import { clsx } from "clsx";
import {
  Link,
  useNavigate,
  useSearchParams,
  type LinkProps,
  type MetaFunction,
  type ShouldRevalidateFunctionArgs,
} from "react-router";

import { getMeta } from "~/lib/meta";
import { useHydrated, useLayoutEffect } from "~/ui/primitives/utils";

import { getPhotos } from "../storefront.server";
import { Title, ScrambleText } from "../text";
import { transformShopifyImageUrl } from "../utils";
import ogImageSrc from "../images/og-gallery.jpg";
import type { Route } from "./+types/2025.gallery";

import iconsHref from "~/icons.svg";

export let handle = {
  hideBackground: true,
  showSeats: false,
};

export let meta: MetaFunction = ({ matches }) => {
  let [rootMatch] = matches;
  let { siteUrl } = rootMatch.data as { siteUrl: string };

  let image = `${siteUrl}${ogImageSrc}`;

  return getMeta({
    title: "Photo Gallery | Remix Jam 2025",
    description: "Photos from Remix Jam 2025",
    siteUrl: `${siteUrl}/jam/2025/gallery`,
    image,
  });
};

export async function loader() {
  let photos = await Promise.all([
    getPhotos("remix-jam-2025-photos-1"),
    getPhotos("remix-jam-2025-photos-2"),
  ]).then((p) => p.flat());
  return { photos };
}

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (currentUrl.pathname === nextUrl.pathname) {
    return false;
  }

  return defaultShouldRevalidate;
}

type Photo = Route.ComponentProps["loaderData"]["photos"][0];

function getPrevPhotoIndex(currentIndex: number, totalPhotos: number): number {
  return currentIndex > 0 ? currentIndex - 1 : totalPhotos - 1;
}

function getNextPhotoIndex(currentIndex: number, totalPhotos: number): number {
  return currentIndex < totalPhotos - 1 ? currentIndex + 1 : 0;
}

export default function GalleryPage({ loaderData }: Route.ComponentProps) {
  let { photos } = loaderData;
  let isHydrated = useHydrated();

  return (
    <main className="mx-auto flex max-w-[1920px] flex-col items-center gap-12 py-20 pt-[120px] text-center md:pt-[200px] lg:pt-[210px]">
      <Title>
        <ScrambleText
          text="Photo"
          delay={100}
          charDelay={70}
          cyclesToResolve={8}
          color="blue"
        />
        <ScrambleText text="Gallery" delay={300} color="green" />
      </Title>

      {photos.length === 0 ? (
        <p className="text-lg text-white/70">No photos available yet.</p>
      ) : (
        <div className="w-full columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 2xl:columns-4">
          {photos.map((photo, index) => (
            <Link
              key={photo.url}
              {...(!isHydrated
                ? {
                    to: photo.url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                  }
                : { to: `?photo=${index}` })}
              className="focus-visible:outline-offset-3 mb-4 block w-full break-inside-avoid overflow-hidden rounded-lg bg-white/5 outline-none transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-blue-300 md:mb-6"
            >
              <Photo {...photo} />
            </Link>
          ))}
        </div>
      )}

      {isHydrated ? <PhotoModal photos={photos} /> : null}
    </main>
  );
}

function PhotoModal({ photos }: { photos: Photo[] }) {
  let dialogRef = useRef<HTMLDialogElement>(null);

  let [searchParams] = useSearchParams();
  let navigate = useNavigate();

  let photoParam = searchParams.get("photo");
  let photoIndex = photoParam ? parseInt(photoParam, 10) : null;
  let selectedPhoto =
    photoIndex !== null && photoIndex >= 0 && photoIndex < photos.length
      ? photos[photoIndex]
      : null;

  useDialogAccessibility(dialogRef, selectedPhoto !== null);

  useEffect(() => {
    if (photoIndex === null) return;

    let handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(`?photo=${getPrevPhotoIndex(photoIndex, photos.length)}`);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigate(`?photo=${getNextPhotoIndex(photoIndex, photos.length)}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photoIndex, photos.length, navigate]);

  if (!selectedPhoto || photoIndex === null) {
    return null;
  }

  let closeModal = () =>
    navigate(".", { replace: true, preventScrollReset: true });

  let handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  let downloadImage = async (url: string, filename: string) => {
    try {
      let downloadUrl = transformShopifyImageUrl(url, {
        width: 1200,
        format: "png",
        quality: 85,
      });
      let response = await fetch(downloadUrl);
      let blob = await response.blob();
      let blobUrl = URL.createObjectURL(blob);

      let link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(url, "_blank");
    }
  };

  let prevPhotoIndex = getPrevPhotoIndex(photoIndex, photos.length);
  let nextPhotoIndex = getNextPhotoIndex(photoIndex, photos.length);

  return (
    <dialog
      ref={dialogRef}
      onClose={closeModal}
      onClick={handleBackdropClick}
      className="h-dvh w-dvw select-none bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur"
    >
      <div
        className="relative flex h-full w-full flex-col gap-6 p-0 md:p-6"
        onClick={handleBackdropClick}
      >
        <div className="flex shrink-0 items-center justify-between">
          <IconLink
            to="."
            icon="x-mark"
            aria-label="Close modal"
            preventScrollReset
          />

          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              downloadImage(
                selectedPhoto.url,
                `remix-jam-2025-photo-${photoIndex + 1}.png`,
              );
            }}
            icon="download"
            aria-label="Download full resolution image"
          />
        </div>
        <div
          className="relative flex flex-1 items-center justify-center overflow-hidden"
          onClick={handleBackdropClick}
        >
          <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2">
            <IconLink
              to={`?photo=${prevPhotoIndex}`}
              aria-label="Previous photo"
              icon="chevron-r"
              className="[&>svg]:rotate-180"
            />
          </div>
          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
            <IconLink
              to={`?photo=${nextPhotoIndex}`}
              aria-label="Next photo"
              icon="chevron-r"
            />
          </div>

          <ModalImage
            photo={selectedPhoto}
            prevPhoto={photos[prevPhotoIndex]}
            nextPhoto={photos[nextPhotoIndex]}
          />
        </div>
        <div className="flex shrink-0 justify-center">
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
            {photoIndex + 1} / {photos.length}
          </div>
        </div>
      </div>
    </dialog>
  );
}

let ICON_BUTTON_STYLES =
  "flex items-center justify-center rounded-full bg-white p-3 text-black transition-colors duration-300 hover:bg-blue-brand hover:text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-blue-brand m-1 focus-visible:bg-blue-brand focus-visible:text-white";

function IconLink({
  to,
  className,
  icon,
  ...props
}: Omit<LinkProps, "children"> & {
  icon: "chevron-r" | "x-mark" | "download";
}) {
  return (
    <Link to={to} className={clsx(ICON_BUTTON_STYLES, className)} {...props}>
      <svg className="size-6">
        <use href={`${iconsHref}#${icon}`} />
      </svg>
    </Link>
  );
}

function IconButton({
  className,
  icon,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: "chevron-r" | "x-mark" | "download";
}) {
  return (
    <button className={clsx(ICON_BUTTON_STYLES, className)} {...props}>
      <svg className="size-6">
        <use href={`${iconsHref}#${icon}`} />
      </svg>
    </button>
  );
}

function Photo({ url, altText, width, height }: Photo) {
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
      className="w-full select-none transition-transform duration-300 hover:scale-105"
    />
  );
}

function ModalImage({
  photo,
  prevPhoto,
  nextPhoto,
}: {
  photo: Photo;
  prevPhoto: Photo;
  nextPhoto: Photo;
}) {
  let maxWidth = 1920;
  let maxHeight = 1080;
  let imgSrc = (src: string) =>
    transformShopifyImageUrl(src, {
      width: maxWidth,
      height: maxHeight,
      format: "webp",
      quality: 90,
    });

  let aspectRatio = photo.width / photo.height;
  let isLandscape = photo.width > photo.height;

  return (
    <>
      {[prevPhoto, nextPhoto].map(({ url }) => (
        <img
          key={url}
          src={imgSrc(url)}
          alt=""
          loading="eager"
          className="hidden"
          aria-hidden="true"
        />
      ))}
      <div
        className="-mx-6 bg-white/5 md:mx-0"
        style={{
          aspectRatio,
          ...(isLandscape
            ? { maxWidth, width: "100%" }
            : { maxHeight, height: "100%" }),
        }}
      >
        <img
          key={photo.url}
          src={imgSrc(photo.url)}
          alt={photo.altText || ""}
          loading="eager"
          className="size-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </>
  );
}

function useDialogAccessibility(
  dialogRef: React.RefObject<HTMLDialogElement>,
  isOpen: boolean,
) {
  useLayoutEffect(() => {
    let dialogNode = dialogRef.current;
    if (!dialogNode) return;

    let lockScroll = () => {
      let y = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
    };

    let unlockScroll = () => {
      let top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      if (top) {
        window.scrollTo(0, -parseInt(top, 10) || 0);
      }
    };

    let focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let getFocusableElements = () =>
      Array.from(dialogNode.querySelectorAll<HTMLElement>(focusableSelector));

    let handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      let focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      let firstElement = focusableElements[0];
      let lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    if (isOpen) {
      dialogNode.showModal();
      lockScroll();
      dialogNode.addEventListener("keydown", handleFocusTrap);
    } else {
      dialogNode.close();
      unlockScroll();
    }

    return () => {
      unlockScroll();
      dialogNode?.removeEventListener("keydown", handleFocusTrap);
    };
  }, [dialogRef, isOpen]);
}
