import { clientEntry, type Handle } from "remix/component";
import assets from "./jam-gallery-navigation.tsx?assets=client";
import { routes } from "../routes";
import {
  APP_FRAME_NAME,
  APP_NAV_HISTORY_STATE,
} from "../shared/app-navigation";
import {
  getSelectedPhotoIndex,
  JAM_GALLERY_HYDRATION_READY_ATTRIBUTE,
  isJamGalleryPhotoNavigation,
} from "../shared/jam-gallery-navigation";
import { registerAppNavigationHandler } from "../shared/app-navigation-handlers";
import { transformShopifyImageUrl } from "../shared/jam-images";
import iconsHref from "../shared/icons.svg";

const GALLERY_NAVIGATION_MARKER_SELECTOR = "[data-jam-gallery-navigation]";

type Photo = {
  url: string;
  altText?: string;
  width: number;
  height: number;
};

export let JamGalleryNavigation = clientEntry(
  `${assets.entry}#JamGalleryNavigation`,
  (handle: Handle) => {
    let selectedPhotoIndex: number | null = null;
    let isModalImageReady = true;
    let modalImageLoadRequest = 0;
    let photos: Photo[] = [];
    let initialized = false;

    let getSelectedHref = (index: number | null) =>
      index === null ? routes.jam2025Gallery.href() : getPhotoHref(index);

    let getPhotoHref = (index: number) =>
      `${routes.jam2025Gallery.href()}?photo=${index}`;

    let getModal = () =>
      document.querySelector<HTMLElement>("[data-gallery-modal]");

    let getNavigationMarker = () =>
      document.querySelector<HTMLElement>(GALLERY_NAVIGATION_MARKER_SELECTOR);

    let getFocusable = () => {
      let modal = getModal();
      if (!modal) return [];
      return Array.from(
        modal.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    };

    let lockScroll = () => {
      if (selectedPhotoIndex === null) return;
      let y = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.width = "100%";
    };

    let unlockScroll = () => {
      let top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (top) {
        window.scrollTo(0, -parseInt(top, 10) || 0);
      }
    };

    let focusModal = () => {
      let primaryFocusTarget = document.querySelector<HTMLElement>(
        "[data-gallery-modal-primary-focus]",
      );
      primaryFocusTarget?.focus();
      if (primaryFocusTarget) return;
      getFocusable()[0]?.focus();
    };

    let restoreThumbnailFocus = (index: number) => {
      let selector = `[data-gallery-photo-index="${index}"]`;
      let target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      target.focus();
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
    };

    let syncToUrl = (url: string) => {
      let nextUrl = new URL(url, window.location.href);
      let nextIndex = getSelectedPhotoIndex(
        nextUrl.searchParams.get("photo"),
        photos.length,
      );
      let previousIndex = selectedPhotoIndex;
      if (nextIndex === previousIndex) return;

      modalImageLoadRequest += 1;
      let modalImageLoadId = modalImageLoadRequest;
      selectedPhotoIndex = nextIndex;
      isModalImageReady = nextIndex !== null ? false : true;
      handle.update();

      if (nextIndex !== null) {
        preloadModalImage(photos[nextIndex]).then(() => {
          if (handle.signal.aborted) return;
          if (modalImageLoadId !== modalImageLoadRequest) return;
          if (selectedPhotoIndex !== nextIndex) return;
          isModalImageReady = true;
          handle.update();
        });
      }

      handle.queueTask(() => {
        if (nextIndex === null) {
          unlockScroll();
          if (previousIndex !== null) {
            restoreThumbnailFocus(previousIndex);
          }
          return;
        }

        lockScroll();
        focusModal();
      });
    };

    let setHydrationReady = (ready: boolean) => {
      let marker = getNavigationMarker();
      if (!marker) return;
      if (ready) {
        marker.setAttribute(JAM_GALLERY_HYDRATION_READY_ATTRIBUTE, "");
        return;
      }
      marker.removeAttribute(JAM_GALLERY_HYDRATION_READY_ATTRIBUTE);
    };

    let navigate = (href: string) => {
      if (!href) return;
      let browserNavigation = window.navigation as
        | {
            navigate?: (
              url: string,
              options?: {
                history?: "auto" | "push" | "replace";
                state?: unknown;
              },
            ) => unknown;
          }
        | undefined;
      if (browserNavigation?.navigate) {
        browserNavigation.navigate(href, {
          state: {
            [APP_NAV_HISTORY_STATE]: APP_FRAME_NAME,
          },
        });
        return;
      }
      window.location.assign(href);
    };

    handle.queueTask(() => {
      let unregisterAppNavigationHandler = registerAppNavigationHandler({
        canHandle({ currentUrl, nextUrl }) {
          return isJamGalleryPhotoNavigation(currentUrl, nextUrl);
        },
        handle({ nextUrl }) {
          syncToUrl(nextUrl.toString());
        },
      });
      setHydrationReady(true);

      if (selectedPhotoIndex !== null) {
        lockScroll();
      }

      handle.on(window, {
        keydown(event) {
          if (selectedPhotoIndex === null) return;

          if (event.key === "Escape") {
            event.preventDefault();
            navigate(routes.jam2025Gallery.href());
            return;
          }

          if (event.key === "ArrowLeft") {
            event.preventDefault();
            navigate(getPhotoHref(getPreviousPhotoIndex(selectedPhotoIndex, photos)));
            return;
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            navigate(getPhotoHref(getNextPhotoIndex(selectedPhotoIndex, photos)));
            return;
          }

          if (event.key === "Tab") {
            let focusable = getFocusable();
            if (focusable.length === 0) return;

            let first = focusable[0];
            let last = focusable[focusable.length - 1];
            let modal = getModal();
            let outsideModal =
              !modal || !modal.contains(document.activeElement);

            if (event.shiftKey) {
              if (outsideModal || document.activeElement === first) {
                event.preventDefault();
                last.focus();
              }
              return;
            }

            if (outsideModal || document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }
        },
      });

      handle.signal.addEventListener(
        "abort",
        () => {
          unregisterAppNavigationHandler();
          setHydrationReady(false);
          unlockScroll();
        },
        { once: true },
      );
    });

    return (props: {
      photos: Photo[];
      initialSelectedPhotoIndex: number | null;
    }) => {
      photos = props.photos;
      if (!initialized) {
        initialized = true;
        selectedPhotoIndex = props.initialSelectedPhotoIndex;
      }

      return (
        <>
          <div hidden data-jam-gallery-navigation="" />
          {selectedPhotoIndex !== null ? (
            <GalleryModal
              photos={photos}
              selectedPhotoIndex={selectedPhotoIndex}
              isImageReady={isModalImageReady}
              onNavigate={navigate}
              getSelectedHref={getSelectedHref}
            />
          ) : null}
        </>
      );
    };
  },
);

function GalleryModal() {
  return (props: {
    photos: Photo[];
    selectedPhotoIndex: number;
    isImageReady: boolean;
    onNavigate: (href: string) => void;
    getSelectedHref: (index: number | null) => string;
  }) => {
    let selectedPhoto = props.photos[props.selectedPhotoIndex];
    let previousPhotoIndex = getPreviousPhotoIndex(
      props.selectedPhotoIndex,
      props.photos,
    );
    let nextPhotoIndex = getNextPhotoIndex(props.selectedPhotoIndex, props.photos);
    let closeHref = props.getSelectedHref(null);
    let previousHref = props.getSelectedHref(previousPhotoIndex);
    let nextHref = props.getSelectedHref(nextPhotoIndex);
    let downloadHref = `${routes.jam2025GalleryDownload.href()}?photo=${props.selectedPhotoIndex}`;

    return (
      <div
        data-gallery-modal
        class="fixed inset-0 z-50 size-full select-none bg-black/70 backdrop-blur"
      >
        <a
          href={closeHref}
          aria-label="Close gallery backdrop"
          aria-hidden="true"
          tabIndex={-1}
          class="absolute inset-0 z-0 block"
          on={{
            click(event) {
              event.preventDefault();
              props.onNavigate(closeHref);
            },
          }}
        />
        <div class="relative z-10 flex h-full w-full flex-col gap-6 p-4 md:p-9">
          <div class="flex shrink-0 items-center justify-between">
            <IconLink
              href={closeHref}
              icon="x-mark"
              label="Close modal"
              primaryFocus
              onNavigate={props.onNavigate}
            />
            <IconLink
              href={downloadHref}
              icon="download"
              label="Download full resolution image"
              download={`remix-jam-2025-photo-${props.selectedPhotoIndex + 1}.jpg`}
            />
          </div>
          <div class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
            <div class="absolute left-0 top-1/2 z-10 -translate-y-1/2">
              <IconLink
                href={previousHref}
                icon="chevron-r"
                label="Previous photo"
                className="[&_svg]:rotate-180"
                onNavigate={props.onNavigate}
              />
            </div>
            <div class="absolute right-0 top-1/2 z-10 -translate-y-1/2">
              <IconLink
                href={nextHref}
                icon="chevron-r"
                label="Next photo"
                onNavigate={props.onNavigate}
              />
            </div>
            <ModalImage photo={selectedPhoto} isReady={props.isImageReady} />
          </div>
          <div class="flex shrink-0 justify-center">
            <div class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
              {props.selectedPhotoIndex + 1} / {props.photos.length}
            </div>
          </div>
        </div>
      </div>
    );
  };
}

function ModalImage() {
  return ({ photo, isReady }: { photo: Photo; isReady: boolean }) => {
    let maxWidth = 1920;
    let maxHeight = 1080;
    let imageSrc = getModalImageSrc(photo);
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
        {isReady ? (
          <img
            key={imageSrc}
            src={imageSrc}
            alt={photo.altText || ""}
            class="size-full object-contain"
          />
        ) : null}
      </div>
    );
  };
}

function getModalImageSrc(photo: Photo) {
  return transformShopifyImageUrl(photo.url, {
    width: 1920,
    height: 1080,
    format: "webp",
    quality: 90,
  });
}

function preloadModalImage(photo: Photo) {
  return new Promise<void>((resolve) => {
    let image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = getModalImageSrc(photo);
  });
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
    primaryFocus?: boolean;
    onNavigate?: (href: string) => void;
  }) => (
    <a
      href={props.href}
      aria-label={props.label}
      data-gallery-modal-primary-focus={props.primaryFocus ? "" : undefined}
      download={props.download}
      target={props.target}
      rel={props.rel}
      class={`focus-visible:outline-offset-3 m-1 flex items-center justify-center rounded-full bg-white p-3 text-black outline-none transition-colors duration-300 hover:bg-blue-brand hover:text-white focus-visible:bg-blue-brand focus-visible:text-white focus-visible:outline-2 focus-visible:outline-blue-brand ${props.className ?? ""}`}
      on={
        props.onNavigate
          ? {
              click(event) {
                event.preventDefault();
                props.onNavigate?.(props.href);
              },
            }
          : undefined
      }
    >
      <svg class="size-6" aria-hidden="true">
        <use href={`${iconsHref}#${props.icon}`} />
      </svg>
    </a>
  );
}

function getPreviousPhotoIndex(selectedPhotoIndex: number, photos: Photo[]) {
  return selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1;
}

function getNextPhotoIndex(selectedPhotoIndex: number, photos: Photo[]) {
  return selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0;
}
