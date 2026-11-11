import {
  clientEntry,
  css,
  navigate,
  on,
  ref,
  type Handle,
} from "remix/component";
import { animateEntrance, prefersReducedMotion } from "@remix-run/ui/animation";

import { focusTrap } from "../../../../ui/public/focus-trap.ts";
import { Icon } from "../../../../ui/public/icon.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";
import { routes } from "../../../../routes.ts";
import { syncJam2026Head } from "./head-content.ts";
import { jam2026ModalConfig } from "./modal-contract.ts";
import { PhotoTimeline } from "./photo-filmstrip.tsx";
import { photoGallery } from "./photo-gallery.ts";
import {
  photoViewer,
  photoViewerFrameNavigation,
  selectOnClick,
} from "./photo-viewer-controller.ts";
import {
  PhotoViewerSessionProvider,
  type PhotoViewerSession,
  type ViewerPhase,
} from "./photo-viewer-session.ts";
import {
  animateWindowToCard,
  playEntrance,
} from "./photo-window-transition.ts";
import {
  createJam2026ModalEffects,
  jam2026ModalBackdropStyle,
  jam2026ModalScrimStyle,
  jam2026ModalTitleStyle,
  jam2026ModalTitlebarButtonStyle,
  jam2026ModalTitlebarIconStyle,
  jam2026ModalTitlebarStyle,
  jam2026ModalWindowStyle,
  restoreScrollPosition,
} from "./modal.ts";
import {
  findPhotoViewerState,
  getViewerImageUrl,
  preloadViewerImage,
  resizeShopifyImage,
  type PhotoViewerState,
} from "./shopify-photo.ts";
import { jamTheme } from "./theme.ts";

type Jam2026PhotoViewerProps = {
  animateEntrance?: boolean;
  /** The open photo; the viewer is closed without one. */
  viewer?: PhotoViewerState;
};

// The grid's thumbnail size, likely already cached, shown while the full
// image loads.
const PLACEHOLDER_IMAGE_WIDTH = 480;

export let Jam2026PhotoViewerFrame = clientEntry(
  import.meta.url,
  function Jam2026PhotoViewerFrame(handle: Handle<Jam2026PhotoViewerProps>) {
    let phase: ViewerPhase = { kind: "open" };
    let closeNavigationTimer: ReturnType<typeof setTimeout> | undefined;
    let lastSlug = handle.props.viewer?.photo.slug;
    // Starts out matching the server-rendered head; synced as photos change.
    let headSyncedFilename = handle.props.viewer?.photo.filename;
    let modalEffects = createJam2026ModalEffects(handle, {
      getModalRoot: getDialog,
      isActive: () => Boolean(getShownViewer()) && phase.kind === "open",
      requestClose,
      // Back to the card of the photo being viewed, which may not be the one
      // that opened the viewer.
      getReturnFocus: getCurrentCard,
    });

    let session: PhotoViewerSession = {
      get phase() {
        return phase;
      },
      get previewOnly() {
        return photoViewer.pending?.preview ?? false;
      },
      requestClose,
    };

    photoViewer.addEventListener("change", () => handle.update(), {
      signal: handle.signal,
    });

    // The pending photo when there is one, else the server's.
    function getShownViewer() {
      let { viewer } = handle.props;
      let pending = photoViewer.pending;
      if (!pending || pending.slug === viewer?.photo.slug) return viewer;
      return findPhotoViewerState(photoGallery.cards, pending.slug) ?? viewer;
    }

    function getDialog() {
      return document.querySelector<HTMLElement>(
        "[role='dialog'][aria-labelledby='photo-viewer-title']",
      );
    }

    // The link covering the current photo's card in the gallery, which is
    // where focus returns and what the window grows from and shrinks into.
    function getCurrentCard() {
      return lastSlug ? photoViewer.getCard(lastSlug) : null;
    }

    function requestClose(event?: Event) {
      event?.preventDefault();
      if (phase.kind === "closing" || !getShownViewer()) return;

      let reduceMotion = prefersReducedMotion();
      phase = {
        kind: "closing",
        exit: !reduceMotion && getCurrentCard() ? "shrink" : "roll",
      };
      photoViewer.setClosing(true);
      handle.update();

      let finish = (
        scrollX: number,
        scrollY: number,
        restoreCard?: () => void,
      ) => {
        // The viewer went away some other way while its window shrank.
        if (handle.signal.aborted) return;
        void navigate(routes.jam.y2026.index.href(), {
          ...photoViewerFrameNavigation,
          history: "replace",
        }).finally(() => {
          phase = { kind: "open" };
          photoViewer.setClosing(false);
          photoViewer.clear();
          handle.update();
          restoreScrollPosition(scrollX, scrollY, handle.signal);
          if (!restoreCard) {
            revealCurrentCard();
            return;
          }
          restoreCard();
          // The usual focus return ran while the card was hidden mid-shrink,
          // when it couldn't take focus.
          getCurrentCard()?.focus({ preventScroll: true });
        });
      };

      if (phase.exit === "roll") {
        let { scrollX, scrollY } = window;
        closeNavigationTimer = setTimeout(
          () => {
            closeNavigationTimer = undefined;
            finish(scrollX, scrollY);
          },
          reduceMotion ? 0 : 220,
        );
        return;
      }

      // Next frame, once closing has unlocked the page's scroll (which puts
      // it back where it was), so scrolling to the card sticks.
      window.requestAnimationFrame(() => {
        let section = getDialog()?.querySelector("section");
        let card = getCurrentCard()?.parentElement;
        if (handle.signal.aborted || !section || !card) {
          finish(window.scrollX, window.scrollY);
          return;
        }

        // Stepping can leave the photo's card far from where the viewer
        // opened; bring it on screen behind the scrim to shrink into.
        let box = card.getBoundingClientRect();
        if (box.bottom < 0 || box.top > window.innerHeight) {
          card.scrollIntoView({ block: "center", behavior: "instant" });
        }
        let { scrollX, scrollY } = window;

        let shrink = animateWindowToCard(section, card, "close");
        if (!shrink) {
          finish(scrollX, scrollY);
          return;
        }
        let { restoreCard } = shrink;
        shrink.animation.finished.then(
          () => finish(scrollX, scrollY, restoreCard),
          () => finish(scrollX, scrollY, restoreCard),
        );
      });
    }

    // Without a shrink (reduced motion), snap the photo's card on screen after
    // closing, as stepping may have left it far away.
    function revealCurrentCard() {
      window.requestAnimationFrame(() => {
        let card = getCurrentCard();
        if (!card || handle.signal.aborted) return;
        let box = card.getBoundingClientRect();
        if (box.bottom > 0 && box.top < window.innerHeight) return;
        card.scrollIntoView({
          block: "center",
          behavior: "instant",
        });
      });
    }

    function step(event: KeyboardEvent, direction: "previous" | "next") {
      let viewer = getShownViewer();
      if (!viewer || phase.kind === "closing") return;
      event.preventDefault();
      // Like pressing that arrow in the title bar, which takes focus.
      getDialog()
        ?.querySelector<HTMLElement>(`a[data-step="${direction}"]`)
        ?.focus({ preventScroll: true });
      photoViewer.select(viewer[direction].slug);
    }

    handle.queueTask(() => {
      document.addEventListener(
        "keydown",
        (event) => {
          if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;
          if (event.altKey || event.shiftKey) return;
          if (event.key === "ArrowLeft") step(event, "previous");
          if (event.key === "ArrowRight") step(event, "next");
        },
        { signal: handle.signal },
      );
    });

    handle.signal.addEventListener(
      "abort",
      () => {
        if (closeNavigationTimer) clearTimeout(closeNavigationTimer);
        // The controller outlives this viewer; don't leave it refusing photos
        // or holding one for the next viewer.
        photoViewer.setClosing(false);
        photoViewer.clear();
      },
      { once: true },
    );

    function queueHeadSync(filename: string | undefined) {
      if (headSyncedFilename === filename) return;
      headSyncedFilename = filename;

      handle.queueTask(() => syncJam2026Head({ photo: filename }));
    }

    // Warm the neighbors so stepping doesn't flash an empty frame.
    function queueNeighborPreload(viewer: PhotoViewerState) {
      handle.queueTask(() => {
        for (let neighbor of [viewer.previous, viewer.next]) {
          preloadViewerImage(neighbor.url);
        }
      });
    }

    return () => {
      if (handle.props.viewer)
        photoViewer.settle(handle.props.viewer.photo.slug);
      let viewer = getShownViewer();
      // Opening ahead of the server: always animate, whatever the frame's
      // last response said.
      let openingAhead = Boolean(viewer) && !handle.props.viewer;

      if (viewer) lastSlug = viewer.photo.slug;

      modalEffects.queueStateSync();
      queueHeadSync(viewer?.photo.filename);
      if (viewer && !photoViewer.pending?.preview) queueNeighborPreload(viewer);

      // The frame runtime needs a stable child when toggling between empty
      // frame content and the hydrated viewer.
      return (
        <div>
          {viewer ? (
            <PhotoViewerSessionProvider session={session}>
              <PhotoViewerContent
                animateEntrance={
                  openingAhead || (handle.props.animateEntrance ?? true)
                }
                viewer={viewer}
              />
            </PhotoViewerSessionProvider>
          ) : null}
        </div>
      );
    };
  },
);

function PhotoViewerContent(
  handle: Handle<{ animateEntrance: boolean; viewer: PhotoViewerState }>,
) {
  let session = handle.context.get(PhotoViewerSessionProvider);
  // Decided once, when the viewer appears. Later frame responses can differ
  // (a server-rendered viewer arrives without entrance motion, while stepping
  // fetches one with it), and adding the entrance then would replay it.
  let useEntranceMotion =
    handle.props.animateEntrance && !prefersReducedMotion();
  // The full-size image that has finished loading, for the loading bar.
  let loadedSrc: string | undefined;
  let markLoaded = (img: HTMLImageElement) => {
    if (loadedSrc === img.getAttribute("src")) return;
    loadedSrc = img.getAttribute("src") ?? undefined;
    handle.update();
  };

  return () => {
    let { viewer } = handle.props;
    let { photo } = viewer;
    let src = getViewerImageUrl(photo.url);
    let { phase, previewOnly } = session;
    let closing = phase.kind === "closing";
    let state = closing ? "closing" : "open";
    let homeHref = routes.jam.y2026.index.href();
    let closeLinkProps = {
      href: homeHref,
      "data-rmx-target": jam2026ModalConfig.frameName,
      "data-rmx-reset-scroll": "manual",
      "data-rmx-history": "replace",
    } as const;

    return (
      <div
        data-state={state}
        mix={[
          jam2026ModalScrimStyle,
          viewerScrimStyle,
          useEntranceMotion
            ? animateEntrance({
                opacity: 0,
                duration: 100,
                easing: "ease-out",
              })
            : null,
        ]}
      >
        <a
          {...closeLinkProps}
          aria-label="Close photo"
          tabIndex={-1}
          mix={[
            jam2026ModalBackdropStyle,
            on("click", (event) => session.requestClose(event)),
          ]}
        />
        {/* The dialog spans the photo's window and the cards under it, so the
            focus trap includes both. */}
        <div
          aria-labelledby="photo-viewer-title"
          aria-modal="true"
          role="dialog"
          tabIndex={-1}
          mix={[viewerStageStyle, focusTrap(!closing)]}
        >
          <div mix={viewerWindowAreaStyle}>
            <section
              data-exit={phase.kind === "closing" ? phase.exit : undefined}
              data-state={state}
              mix={[
                jam2026ModalWindowStyle,
                viewerWindowStyle,
                useEntranceMotion
                  ? ref((section) => playEntrance(section, photo.slug))
                  : null,
              ]}
              style={{
                "--photo-ratio": String(photo.width / photo.height),
              }}
            >
              <div mix={jam2026ModalTitlebarStyle}>
                <a
                  {...closeLinkProps}
                  aria-label="Close photo"
                  mix={[
                    jam2026ModalTitlebarButtonStyle,
                    on("click", (event) => session.requestClose(event)),
                  ]}
                >
                  <Icon
                    name="x-mark"
                    aria-hidden="true"
                    focusable="false"
                    mix={jam2026ModalTitlebarIconStyle}
                    viewBox="0 0 14 14"
                  />
                </a>
                <p
                  id="photo-viewer-title"
                  mix={[jam2026ModalTitleStyle, viewerTitleStyle]}
                >
                  {photo.filename}
                </p>
                <StepLink
                  direction="previous"
                  slug={viewer.previous.slug}
                  label="Previous photo"
                />
                <p mix={[jam2026ModalTitleStyle, viewerCounterStyle]}>
                  {viewer.index + 1} / {viewer.count}
                </p>
                <StepLink
                  direction="next"
                  slug={viewer.next.slug}
                  label="Next photo"
                />
                <a
                  aria-label={`Download ${photo.filename}`}
                  download={photo.filename}
                  href={routes.jam.y2026.photos.download.href({
                    photo: photo.slug,
                  })}
                  mix={jam2026ModalTitlebarButtonStyle}
                >
                  <Icon
                    name="download"
                    aria-hidden="true"
                    focusable="false"
                    mix={jam2026ModalTitlebarIconStyle}
                  />
                </a>
              </div>
              <div
                data-loading={previewOnly || loadedSrc === src ? undefined : ""}
                mix={viewerBodyStyle}
                style={{
                  backgroundImage: `url("${resizeShopifyImage(photo.url, PLACEHOLDER_IMAGE_WIDTH)}")`,
                }}
              >
                {previewOnly ? null : (
                  <img
                    key={photo.url}
                    alt={
                      photo.altText ||
                      `Remix Jam 2026 photo ${viewer.index + 1}`
                    }
                    draggable={false}
                    height={photo.height}
                    src={src}
                    width={photo.width}
                    mix={[
                      on("load", (event) => markLoaded(event.currentTarget)),
                      // Already cached, as preloaded neighbors usually are.
                      ref((img) => {
                        if (img.complete) markLoaded(img);
                      }),
                    ]}
                  />
                )}
              </div>
            </section>
          </div>
          <PhotoTimeline
            useEntranceMotion={useEntranceMotion}
            viewer={viewer}
          />
        </div>
      </div>
    );
  };
}

function StepLink(
  handle: Handle<{
    direction: "previous" | "next";
    label: string;
    slug: string;
  }>,
) {
  return () => (
    <a
      aria-label={handle.props.label}
      data-step={handle.props.direction}
      data-rmx-history="replace"
      data-rmx-reset-focus="manual"
      data-rmx-reset-scroll="manual"
      data-rmx-target={jam2026ModalConfig.frameName}
      href={routes.jam.y2026.photos.show.href({ photo: handle.props.slug })}
      mix={[
        jam2026ModalTitlebarButtonStyle,
        on<HTMLAnchorElement, "click">(
          "click",
          selectOnClick(() => handle.props.slug),
        ),
      ]}
    >
      <Icon
        name="chevron-r"
        aria-hidden="true"
        focusable="false"
        mix={[
          jam2026ModalTitlebarIconStyle,
          handle.props.direction === "previous" ? flippedIconStyle : null,
        ]}
      />
    </a>
  );
}

// Sized to the photo: on phones as large as the space above the cards allows,
// and wider up at the shared photo height, up to the window's widest. The
// 40px is the title bar and the window's bottom edge; 16px its side edges.
let viewerWindowStyle = css({
  position: "relative",
  width: "min(100cqw, (100cqh - 40px) * var(--photo-ratio) + 16px)",
  [breakpointMedia.sm]: {
    width:
      "min(100%, 1500px, calc(var(--photo-height) * var(--photo-ratio) + 16px))",
  },
});

let viewerTitleStyle = css({
  flex: "1 1 auto",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
});

let viewerCounterStyle = css({
  flex: "0 0 auto",
  fontVariantNumeric: "tabular-nums",
});

let viewerBodyStyle = css({
  aspectRatio: "var(--photo-ratio)",
  backgroundColor: jamTheme.inkWash,
  backgroundPosition: "center",
  backgroundSize: "cover",
  borderRadius: "0.25rem",
  margin: "0 8px 8px",
  overflow: "hidden",
  position: "relative",
  // A bar slides across the top while the full-size image loads, appearing
  // only if that takes a moment.
  "&[data-loading]::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "35%",
    height: "3px",
    borderRadius: theme.radius.full,
    background: jamTheme.brandRed,
    opacity: 0,
    animation: "jam-2026-photo-loading 900ms ease-in-out 150ms infinite",
  },
  "@keyframes jam-2026-photo-loading": {
    "0%": { opacity: 1, translate: "-100% 0" },
    "100%": { opacity: 1, translate: "300% 0" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    "&[data-loading]::after": {
      animation: "none",
      opacity: 1,
      width: "100%",
    },
  },
  "& img": {
    display: "block",
    height: "100%",
    objectFit: "contain",
    userSelect: "none",
    width: "100%",
  },
});

let viewerScrimStyle = css({
  "--timeline-height": "104px",
  "--timeline-card-height": "56px",
  alignItems: "stretch",
  flexDirection: "column",
  // On phones the cards sit at the bottom of the screen, and the photo takes
  // whatever room is left above them.
  paddingBottom: "max(8px, env(safe-area-inset-bottom))",
  [breakpointMedia.sm]: {
    "--timeline-height": "160px",
    "--timeline-card-height": "100px",
    // Room left over below the cards (and as much above the window), so the
    // cards don't hug the bottom of the screen.
    "--viewer-breathing-room": "64px",
    // The tallest a photo gets. Fixed per screen, not per photo, so the
    // cards under it stay put. The subtraction covers the scrim's padding,
    // the breathing room, the gap and band for the cards, and the window's
    // title bar and bottom edge.
    "--photo-max-height":
      "min(1000px, 100svh - 32px - var(--viewer-breathing-room) - 12px - var(--timeline-height) - 40px)",
    // Every photo is as tall as a 3:2 landscape shot is here, so portrait
    // photos match landscape ones instead of standing taller or shorter.
    "--photo-height":
      "min(var(--photo-max-height), (min(100vw - 32px, 1500px) - 16px) / 1.5)",
    paddingBottom: "16px",
  },
});

let viewerStageStyle = css({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  gap: "12px",
  minHeight: 0,
  outline: "none",
  // Empty space falls through to the backdrop, which closes the viewer.
  pointerEvents: "none",
  [breakpointMedia.sm]: {
    flex: "0 0 auto",
    height: "calc(var(--photo-height) + 40px + 12px + var(--timeline-height))",
  },
});

let viewerWindowAreaStyle = css({
  alignItems: "center",
  // The window sizes itself to this space (see viewerWindowStyle).
  containerType: "size",
  display: "flex",
  flex: "1 1 auto",
  justifyContent: "center",
  minHeight: 0,
  "& > *": { pointerEvents: "auto" },
});

let flippedIconStyle = css({ transform: "scaleX(-1)" });
