import {
  clientEntry,
  css,
  navigate,
  on,
  ref,
  type Handle,
} from "remix/component";
import {
  animateEntrance,
  animateLayout,
  prefersReducedMotion,
  spring,
} from "@remix-run/ui/animation";

import { focusTrap } from "../../../../ui/public/focus-trap.ts";
import { Icon } from "../../../../ui/public/icon.tsx";
import { routes } from "../../../../routes.ts";
import { syncJam2026Head } from "./head-content.ts";
import { jam2026ModalConfig } from "./modal-contract.ts";
import {
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./window-styles.ts";
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
import { resizeShopifyImage, type PhotoViewerState } from "./shopify-photo.ts";
import { jamTheme } from "./theme.ts";

type Jam2026PhotoViewerProps = {
  animateEntrance?: boolean;
  /** The open photo; the viewer is closed without one. */
  viewer?: PhotoViewerState;
};

const VIEWER_IMAGE_WIDTH = 1920;
// The grid's thumbnail size, likely already cached, shown while the full
// image loads.
const PLACEHOLDER_IMAGE_WIDTH = 480;
const TIMELINE_IMAGE_WIDTH = 200;

let frameNavigation = {
  target: jam2026ModalConfig.frameName,
  resetScroll: "manual",
  resetFocus: "manual",
} as const;

export let Jam2026PhotoViewerFrame = clientEntry(
  import.meta.url,
  function Jam2026PhotoViewerFrame(handle: Handle<Jam2026PhotoViewerProps>) {
    let closing = false;
    // How the window leaves: shrinking back into the photo's card, or rolling
    // up when there's no card to shrink into.
    let exit: "shrink" | "roll" = "roll";
    let closeNavigationTimer: ReturnType<typeof setTimeout> | undefined;
    let lastSlug = handle.props.viewer?.photo.slug;
    // Starts out matching the server-rendered head; synced as photos change.
    let headSyncedFilename = handle.props.viewer?.photo.filename;
    let modalEffects = createJam2026ModalEffects(handle, {
      getModalRoot: getDialog,
      isActive: () => Boolean(handle.props.viewer) && !closing,
      requestClose,
      // Back to the card of the photo being viewed, which may not be the one
      // that opened the viewer.
      getReturnFocus: getCurrentCard,
    });

    function getDialog() {
      return document.querySelector<HTMLElement>(
        "[role='dialog'][aria-labelledby='photo-viewer-title']",
      );
    }

    // The link covering the current photo's card in the gallery, which is
    // where focus returns and what the window grows from and shrinks into.
    function getCurrentCard() {
      if (!lastSlug) return null;
      return findGalleryCardLink(lastSlug);
    }

    function requestClose(event?: Event) {
      event?.preventDefault();
      if (closing || !handle.props.viewer) return;

      closing = true;
      let reduceMotion = prefersReducedMotion();
      exit = !reduceMotion && getCurrentCard() ? "shrink" : "roll";
      handle.update();

      let finish = (scrollX: number, scrollY: number, card?: HTMLElement) => {
        void navigate(routes.jam.y2026.index.href(), {
          ...frameNavigation,
          history: "replace",
        }).finally(() => {
          restoreScrollPosition(scrollX, scrollY, handle.signal);
          if (!card) {
            revealCurrentCard();
            return;
          }
          card.style.visibility = "";
          // The usual focus return ran while the card was hidden mid-shrink,
          // when it couldn't take focus.
          getCurrentCard()?.focus({ preventScroll: true });
        });
      };

      if (exit === "roll") {
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
        shrink.finished.then(
          () => finish(scrollX, scrollY, card),
          () => finish(scrollX, scrollY, card),
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
      let viewer = handle.props.viewer;
      if (!viewer || closing) return;
      event.preventDefault();
      void navigate(
        routes.jam.y2026.photos.show.href({ photo: viewer[direction].slug }),
        { ...frameNavigation, history: "replace" },
      );
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
          new Image().src = resizeShopifyImage(
            neighbor.url,
            VIEWER_IMAGE_WIDTH,
          );
        }
      });
    }

    return () => {
      let { viewer } = handle.props;

      if (!viewer) closing = false;
      if (viewer) lastSlug = viewer.photo.slug;

      modalEffects.queueStateSync();
      queueHeadSync(viewer?.photo.filename);
      if (viewer) queueNeighborPreload(viewer);

      // The frame runtime needs a stable child when toggling between empty
      // frame content and the hydrated viewer.
      return (
        <div>
          {viewer ? (
            <PhotoViewerContent
              animateEntrance={handle.props.animateEntrance ?? true}
              closing={closing}
              exit={exit}
              onRequestClose={requestClose}
              viewer={viewer}
            />
          ) : null}
        </div>
      );
    };
  },
);

function PhotoViewerContent(
  handle: Handle<{
    animateEntrance: boolean;
    closing: boolean;
    exit: "shrink" | "roll";
    onRequestClose: (event: Event) => void;
    viewer: PhotoViewerState;
  }>,
) {
  // Decided once, when the viewer appears. Later frame responses can differ
  // (a server-rendered viewer arrives without entrance motion, while stepping
  // fetches one with it), and adding the entrance then would replay it.
  let useEntranceMotion =
    handle.props.animateEntrance && !prefersReducedMotion();

  return () => {
    let { closing, onRequestClose, viewer } = handle.props;
    let { photo } = viewer;
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
            on("click", (event) => onRequestClose(event)),
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
              data-exit={handle.props.exit}
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
                    on("click", (event) => onRequestClose(event)),
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
                mix={viewerBodyStyle}
                style={{
                  backgroundImage: `url("${resizeShopifyImage(photo.url, PLACEHOLDER_IMAGE_WIDTH)}")`,
                }}
              >
                <img
                  key={photo.url}
                  alt={
                    photo.altText || `Remix Jam 2026 photo ${viewer.index + 1}`
                  }
                  draggable={false}
                  height={photo.height}
                  src={resizeShopifyImage(photo.url, VIEWER_IMAGE_WIDTH)}
                  width={photo.width}
                />
              </div>
            </section>
          </div>
          <PhotoTimeline
            closing={closing}
            useEntranceMotion={useEntranceMotion}
            viewer={viewer}
          />
        </div>
      </div>
    );
  };
}

// Each card's size and opacity by its distance from the open photo.
const TIMELINE_SCALES = [1, 0.74, 0.6, 0.5, 0.42];
const TIMELINE_OPACITIES = [1, 0.92, 0.8, 0.66, 0.5];
// Matches the row's gap and the cards' horizontal padding.
const TIMELINE_GAP = 6;
const TIMELINE_CARD_PADDING = 8;

function findGalleryCardLink(slug: string) {
  let href = routes.jam.y2026.photos.show.href({ photo: slug });
  return (
    document
      .getElementById(jam2026ModalConfig.pageBackgroundId)
      ?.querySelector<HTMLElement>(`a[href="${href}"]`) ?? null
  );
}

/**
 * Grows the viewer out of the gallery card that opened it. Without that card
 * on screen (opened another way), the window rolls down instead, like the
 * tickets modal.
 */
function playEntrance(section: HTMLElement, slug: string) {
  let card = findGalleryCardLink(slug)?.parentElement;
  let box = card?.getBoundingClientRect();
  let onScreen = box && box.bottom > 0 && box.top < window.innerHeight;
  if (card && onScreen && animateWindowToCard(section, card, "open")) return;

  section.animate(
    [
      { clipPath: "inset(0 0 100% 0 round 8px)" },
      { clipPath: "inset(0 0 0 0 round 8px)" },
    ],
    { ...spring("snappy", { duration: 220 }) },
  );
}

/**
 * Animates the viewer's window between its place and a gallery card's size,
 * spot, and tilt: out of the card when opening, back into it when closing.
 * The card and the viewer's photo share an aspect ratio, so a single scale
 * maps one onto the other. The card is hidden meanwhile, so the photo looks
 * lifted out of the grid rather than copied.
 */
function animateWindowToCard(
  section: HTMLElement,
  card: HTMLElement,
  direction: "open" | "close",
) {
  let cardImage = card.lastElementChild;
  let body = section.lastElementChild;
  if (!(cardImage instanceof HTMLElement) || !(body instanceof HTMLElement)) {
    return null;
  }

  // Box centers don't change with rotation, and offset sizes ignore it, so
  // these hold for a tilted card.
  let cardBox = cardImage.getBoundingClientRect();
  let sectionBox = section.getBoundingClientRect();
  let bodyBox = body.getBoundingClientRect();
  let bodyCenter = {
    x: bodyBox.left + bodyBox.width / 2,
    y: bodyBox.top + bodyBox.height / 2,
  };
  let dx = cardBox.left + cardBox.width / 2 - bodyCenter.x;
  let dy = cardBox.top + cardBox.height / 2 - bodyCenter.y;
  let scale = cardImage.offsetWidth / body.offsetWidth;
  let { a, b } = new DOMMatrix(getComputedStyle(card).transform);
  let angle = (Math.atan2(b, a) * 180) / Math.PI;
  let atCard = `translate(${dx}px, ${dy}px) rotate(${angle}deg) scale(${scale})`;

  card.style.visibility = "hidden";
  // Show the image the card already has, so the window is never blank while
  // the viewer's own images load.
  let cardSrc = cardImage.querySelector("img")?.currentSrc;
  let placeholder = body.style.backgroundImage;
  if (direction === "open" && cardSrc) {
    body.style.backgroundImage = `url("${cardSrc}")`;
  }
  section.style.transformOrigin = `${bodyCenter.x - sectionBox.left}px ${bodyCenter.y - sectionBox.top}px`;

  let animation = section.animate(
    direction === "open"
      ? [{ transform: atCard }, { transform: "none" }]
      : [{ transform: "none" }, { transform: atCard }],
    direction === "open"
      ? { ...spring({ duration: 220, bounce: 0.1 }) }
      : // Stays on the card until the closing navigation removes the window,
        // which also brings the card back.
        { ...spring({ duration: 160, bounce: 0.05 }), fill: "forwards" },
  );
  if (direction === "open") {
    let reset = () => {
      card.style.visibility = "";
      section.style.transformOrigin = "";
      body.style.backgroundImage = placeholder;
    };
    animation.finished.then(reset, reset);
  }
  return animation;
}

/**
 * The photos around the open one, as small versions of the gallery's cards:
 * the open photo largest, straight, and in front, its neighbors smaller and
 * tilted toward the edges. Each card keeps its key, so stepping slides the
 * row along instead of redrawing it.
 */
function PhotoTimeline(
  handle: Handle<{
    closing: boolean;
    useEntranceMotion: boolean;
    viewer: PhotoViewerState;
  }>,
) {
  return () => {
    let { timeline } = handle.props.viewer;
    let currentPosition = timeline.findIndex((item) => item.current);
    let animate = !prefersReducedMotion();
    let cards = timeline.map((item, position) => {
      let distance = Math.min(
        Math.abs(position - currentPosition),
        TIMELINE_SCALES.length - 1,
      );
      return { item, distance, scale: TIMELINE_SCALES[distance] };
    });

    // Shift the row so the open photo's card sits dead center, however wide
    // its neighbors are. A card's width is its image (a multiple of the card
    // height) plus padding, all scaled; the shift is half the difference
    // between what's to the right and to the left of it.
    let heightShift = 0;
    let pixelShift = 0;
    for (let [position, { item, scale }] of cards.entries()) {
      if (position === currentPosition) continue;
      let side = position > currentPosition ? 1 : -1;
      heightShift += (side * (item.width / item.height) * scale) / 2;
      pixelShift += (side * (TIMELINE_CARD_PADDING * scale + TIMELINE_GAP)) / 2;
    }

    return (
      <ol
        aria-label="Nearby photos"
        data-state={handle.props.closing ? "closing" : "open"}
        style={{
          translate: `calc(var(--timeline-card-height) * ${heightShift.toFixed(4)} + ${pixelShift.toFixed(2)}px) 0`,
        }}
        mix={[
          timelineStyle,
          handle.props.useEntranceMotion
            ? animateEntrance({
                opacity: 0,
                transform: "translateY(16px)",
                ...spring("snappy"),
              })
            : null,
        ]}
      >
        {cards.map(({ item, distance, scale }) => (
          <li
            key={item.slug}
            mix={[
              animateLayout(animate && { size: false, ...spring("snappy") }),
              timelineItemStyle,
            ]}
            style={{
              "--card-ratio": String(item.width / item.height),
              "--card-scale": String(scale),
              "--card-opacity": String(TIMELINE_OPACITIES[distance]),
              "--card-tilt": item.current ? "0deg" : `${item.tilt}deg`,
              zIndex: TIMELINE_SCALES.length - distance,
            }}
          >
            <a
              aria-current={item.current ? "true" : undefined}
              aria-label={`View ${item.filename}`}
              data-rmx-history="replace"
              data-rmx-reset-focus="manual"
              data-rmx-reset-scroll="manual"
              data-rmx-target={jam2026ModalConfig.frameName}
              href={routes.jam.y2026.photos.show.href({ photo: item.slug })}
              mix={[jam2026WindowSurfaceStyle, timelineCardStyle]}
            >
              <span
                aria-hidden="true"
                mix={[jam2026WindowTitleStyle, timelineCardTitleStyle]}
              >
                {item.filename}
              </span>
              <span mix={timelineCardImageStyle}>
                <img
                  alt=""
                  decoding="async"
                  draggable={false}
                  height={item.height}
                  src={resizeShopifyImage(item.url, TIMELINE_IMAGE_WIDTH)}
                  width={item.width}
                />
              </span>
            </a>
          </li>
        ))}
      </ol>
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
      data-rmx-history="replace"
      data-rmx-reset-focus="manual"
      data-rmx-reset-scroll="manual"
      data-rmx-target={jam2026ModalConfig.frameName}
      href={routes.jam.y2026.photos.show.href({ photo: handle.props.slug })}
      mix={jam2026ModalTitlebarButtonStyle}
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

// Sized to the photo at the shared photo height, up to the window's widest.
let viewerWindowStyle = css({
  position: "relative",
  width:
    "min(100%, 1500px, calc(var(--photo-height) * var(--photo-ratio) + 16px))",
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
  "& img": {
    display: "block",
    height: "100%",
    objectFit: "contain",
    userSelect: "none",
    width: "100%",
  },
});

// The row of cards takes a fixed band at the bottom of the screen, so it stays
// put whether the open photo is landscape or portrait.
let viewerScrimStyle = css({
  "--timeline-height": "104px",
  "--timeline-card-height": "56px",
  // Room left over below the cards (and as much above the window), so the
  // cards don't hug the bottom of the screen.
  "--viewer-breathing-room": "24px",
  // The tallest a photo gets. Fixed per screen, not per photo, so the cards
  // under it stay put. The subtraction covers the scrim's padding, the
  // breathing room, the gap and band for the cards, and the window's title
  // bar and bottom edge.
  "--photo-max-height":
    "min(1000px, 100svh - 32px - var(--viewer-breathing-room) - 12px - var(--timeline-height) - 40px)",
  // Every photo is as tall as a 3:2 landscape shot is here, so portrait
  // photos match landscape ones instead of standing taller or shorter. On
  // narrow screens that's set by the width, not the height.
  "--photo-height":
    "min(var(--photo-max-height), (min(100vw - 32px, 1500px) - 16px) / 1.5)",
  alignItems: "stretch",
  flexDirection: "column",
  "@media (min-width: 640px)": {
    "--timeline-height": "160px",
    "--timeline-card-height": "100px",
    "--viewer-breathing-room": "64px",
  },
});

// A fixed height, centered on screen: the photo area, the gap, and the cards.
let viewerStageStyle = css({
  display: "flex",
  flex: "0 0 auto",
  height: "calc(var(--photo-height) + 40px + 12px + var(--timeline-height))",
  flexDirection: "column",
  gap: "12px",
  minHeight: 0,
  outline: "none",
  // Empty space falls through to the backdrop, which closes the viewer.
  pointerEvents: "none",
});

let viewerWindowAreaStyle = css({
  alignItems: "center",
  display: "flex",
  flex: "1 1 auto",
  justifyContent: "center",
  minHeight: 0,
  "& > *": { pointerEvents: "auto" },
});

let timelineStyle = css({
  alignItems: "center",
  display: "flex",
  flex: "0 0 var(--timeline-height)",
  gap: `${TIMELINE_GAP}px`,
  justifyContent: "center",
  listStyle: "none",
  margin: 0,
  padding: 0,
  // Cards past the edges fade out; tilted corners may still rise above.
  overflowX: "clip",
  maskImage:
    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
  transition: "opacity 160ms ease-out",
  "&[data-state='closing']": { opacity: 0 },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

// Takes the card's scaled width, so the row spaces cards by how big they look.
let timelineItemStyle = css({
  alignItems: "center",
  display: "flex",
  flex: "0 0 auto",
  justifyContent: "center",
  position: "relative",
  width: `calc((var(--timeline-card-height) * var(--card-ratio) + ${TIMELINE_CARD_PADDING}px) * var(--card-scale))`,
});

let timelineCardStyle = css({
  color: jamTheme.ink,
  display: "flex",
  flex: "0 0 auto",
  flexDirection: "column",
  gap: "3px",
  opacity: "var(--card-opacity)",
  outline: "none",
  padding: `${TIMELINE_CARD_PADDING / 2}px`,
  borderRadius: "6px",
  pointerEvents: "auto",
  textDecoration: "none",
  transform: "rotate(var(--card-tilt)) scale(var(--card-scale))",
  transition:
    "transform 300ms cubic-bezier(0.22, 1.5, 0.36, 1), opacity 160ms ease",
  // The gallery cards' hover nudge.
  ":is(li:hover) > &": {
    opacity: 1,
    transform: "rotate(calc(var(--card-tilt) + 2deg)) scale(var(--card-scale))",
  },
  "&:focus-visible": {
    opacity: 1,
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    ":is(li:hover) > &": {
      transform: "rotate(var(--card-tilt)) scale(var(--card-scale))",
    },
  },
});

let timelineCardTitleStyle = css({
  fontSize: "7px",
  maxWidth: "calc(var(--timeline-card-height) * var(--card-ratio))",
});

let timelineCardImageStyle = css({
  aspectRatio: "var(--card-ratio)",
  background: jamTheme.inkWash,
  borderRadius: "3px",
  display: "block",
  height: "var(--timeline-card-height)",
  overflow: "hidden",
  "& img": {
    display: "block",
    height: "100%",
    objectFit: "cover",
    userSelect: "none",
    width: "100%",
  },
});

let flippedIconStyle = css({ transform: "scaleX(-1)" });
