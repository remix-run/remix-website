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
  prefersReducedMotion,
  spring,
} from "@remix-run/ui/animation";

import { focusTrap } from "../../../../ui/public/focus-trap.ts";
import { Icon } from "../../../../ui/public/icon.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";
import { routes } from "../../../../routes.ts";
import { syncJam2026Head } from "./head-content.ts";
import { jam2026ModalConfig } from "./modal-contract.ts";
import { photoGallery } from "./photo-gallery.ts";
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
    // The photo just chosen (a card, a step, or the filmstrip), shown right
    // away from the gallery's cards while its frame request is in flight.
    let pendingSlug: string | undefined;
    // The filmstrip is being scrubbed past the shown photo (see showPhoto).
    let scrubbing = false;
    let lastSlug = handle.props.viewer?.photo.slug;
    // Starts out matching the server-rendered head; synced as photos change.
    let headSyncedFilename = handle.props.viewer?.photo.filename;
    let modalEffects = createJam2026ModalEffects(handle, {
      getModalRoot: getDialog,
      isActive: () => Boolean(getShownViewer()) && !closing,
      requestClose,
      // Back to the card of the photo being viewed, which may not be the one
      // that opened the viewer.
      getReturnFocus: getCurrentCard,
    });

    // The pending photo when there is one, else the server's.
    function getShownViewer() {
      let { viewer } = handle.props;
      if (!pendingSlug || pendingSlug === viewer?.photo.slug) return viewer;
      return findPhotoViewerState(photoGallery.cards, pendingSlug) ?? viewer;
    }

    // Shows a photo ahead of the server. A preview, for the photos the
    // filmstrip passes while it's scrubbed, skips the full-size images.
    function showPhoto(slug: string, { preview = false } = {}) {
      if (closing) return;
      pendingSlug = slug;
      scrubbing = preview;
      handle.update();
    }

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
      if (closing || !getShownViewer()) return;

      closing = true;
      let reduceMotion = prefersReducedMotion();
      exit = !reduceMotion && getCurrentCard() ? "shrink" : "roll";
      handle.update();

      let finish = (
        scrollX: number,
        scrollY: number,
        restoreCard?: () => void,
      ) => {
        // The viewer went away some other way while its window shrank.
        if (handle.signal.aborted) return;
        void navigate(routes.jam.y2026.index.href(), {
          ...frameNavigation,
          history: "replace",
        }).finally(() => {
          pendingSlug = undefined;
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

    // Shows the photo right away, then fetches the server's copy.
    function goToPhoto(slug: string) {
      if (closing) return;
      showPhoto(slug);
      navigate(routes.jam.y2026.photos.show.href({ photo: slug }), {
        ...frameNavigation,
        history: "replace",
        // A quicker next step cancels this one; the photo is already shown.
      }).catch(() => {});
    }

    function step(event: KeyboardEvent, direction: "previous" | "next") {
      let viewer = getShownViewer();
      if (!viewer || closing) return;
      event.preventDefault();
      // Like pressing that arrow in the title bar, which takes focus.
      getDialog()
        ?.querySelector<HTMLElement>(`a[data-step="${direction}"]`)
        ?.focus({ preventScroll: true });
      goToPhoto(viewer[direction].slug);
    }

    // Any link into the viewer (a gallery card, a step, a filmstrip card)
    // shows its photo before the runtime's frame navigation comes back.
    function showLinkedPhoto(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
      if (event.shiftKey || event.altKey) return;
      let link = (event.target as Element | null)?.closest?.("a");
      if (link?.dataset.rmxTarget !== jam2026ModalConfig.frameName) return;
      // Mid-close, the close's own navigation would undo the open.
      if (closing) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      let slug = new URL(link.href).pathname.match(
        /^\/jam\/2026\/photos\/([^/]+)$/,
      )?.[1];
      if (!slug) return;
      // Showing the photo re-renders the viewer's own links (the arrows now
      // point one further) before the runtime reads them, so the viewer
      // navigates to the one clicked itself.
      if (getDialog()?.contains(link)) {
        event.preventDefault();
        event.stopPropagation();
        goToPhoto(slug);
      } else {
        showPhoto(slug);
      }
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
      document.addEventListener("click", showLinkedPhoto, {
        capture: true,
        signal: handle.signal,
      });
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
          preloadViewerImage(neighbor.url);
        }
      });
    }

    return () => {
      if (pendingSlug === handle.props.viewer?.photo.slug) {
        pendingSlug = undefined;
      }
      let viewer = getShownViewer();
      // Opening ahead of the server: always animate, whatever the frame's
      // last response said.
      let openingAhead = Boolean(viewer) && !handle.props.viewer;

      if (!viewer) closing = false;
      if (viewer) lastSlug = viewer.photo.slug;

      modalEffects.queueStateSync();
      queueHeadSync(viewer?.photo.filename);
      if (viewer && !scrubbing) queueNeighborPreload(viewer);

      // The frame runtime needs a stable child when toggling between empty
      // frame content and the hydrated viewer.
      return (
        <div>
          {viewer ? (
            <PhotoViewerContent
              animateEntrance={
                openingAhead || (handle.props.animateEntrance ?? true)
              }
              closing={closing}
              exit={exit}
              onRequestClose={requestClose}
              onPreviewPhoto={(slug) => showPhoto(slug, { preview: true })}
              onSelectPhoto={goToPhoto}
              previewOnly={scrubbing}
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
    onPreviewPhoto: (slug: string) => void;
    onSelectPhoto: (slug: string) => void;
    /** Shows just the card-sized preview, while the filmstrip is scrubbed. */
    previewOnly: boolean;
    viewer: PhotoViewerState;
  }>,
) {
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
    let { closing, onRequestClose, viewer } = handle.props;
    let { photo } = viewer;
    let src = getViewerImageUrl(photo.url);
    let { previewOnly } = handle.props;
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
            closing={closing}
            onPreview={handle.props.onPreviewPhoto}
            onSelect={handle.props.onSelectPhoto}
            useEntranceMotion={useEntranceMotion}
            viewer={viewer}
          />
        </div>
      </div>
    );
  };
}

// Matches the row's gap and the cards' horizontal padding.
const TIMELINE_GAP = 6;
const TIMELINE_CARD_PADDING = 8;
// How long the row must sit still before a scroll counts as settled, where
// the browser can't say so itself.
const TIMELINE_SETTLE_DELAY = 150;
// How stiff the row's glide to a chosen photo is: (2π / 300ms)², a spring
// that settles in about a third of a second.
const GLIDE_STIFFNESS = ((2 * Math.PI) / 0.3) ** 2;

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
 * Animates the viewer's window between its place and a gallery card's size
 * and spot: out of the card when opening, back into it when closing.
 * The card and the viewer's photo share an aspect ratio, so a single scale
 * maps one photo onto the other. Only the photo should look like it travels:
 * scaled along with it, the window's frame and title bar would end up far
 * smaller than the card's, so they cross-fade with the card's own instead.
 * The card's photo stays hidden meanwhile, so the photo looks lifted out of
 * the grid rather than copied.
 */
// The window's moves still playing, so closing mid-open can take over.
let windowMoves = new WeakMap<HTMLElement, Animation[]>();

function animateWindowToCard(
  section: HTMLElement,
  card: HTMLElement,
  direction: "open" | "close",
) {
  let titlebar = section.firstElementChild;
  let cardImage = card.lastElementChild;
  let body = section.lastElementChild;
  if (
    !(titlebar instanceof HTMLElement) ||
    !(cardImage instanceof HTMLElement) ||
    !(body instanceof HTMLElement)
  ) {
    return null;
  }

  // Interrupting a move: start from wherever it got to, then cancel it so the
  // window measures at its real place.
  let { backgroundColor, boxShadow, transform } = getComputedStyle(section);
  let titlebarOpacity = getComputedStyle(titlebar).opacity;
  let cardOpacity = getComputedStyle(card).opacity;
  for (let move of windowMoves.get(section) ?? []) move.cancel();

  // Offset sizes ignore transforms, so these hold for a lifted card.
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
  let atCard = `translate(${dx}px, ${dy}px) scale(${scale})`;

  cardImage.style.visibility = "hidden";
  // Show the image the card already has, so the window is never blank while
  // the viewer's own images load.
  let cardSrc = cardImage.querySelector("img")?.currentSrc;
  let placeholder = body.style.backgroundImage;
  if (direction === "open" && cardSrc) {
    body.style.backgroundImage = `url("${cardSrc}")`;
  }
  section.style.transformOrigin = `${bodyCenter.x - sectionBox.left}px ${bodyCenter.y - sectionBox.top}px`;

  let opening = direction === "open";
  let duration = opening ? 220 : 160;
  let animation = section.animate(
    opening
      ? [{ transform: atCard }, { transform: "none" }]
      : [{ transform }, { transform: atCard }],
    opening
      ? { ...spring({ duration, bounce: 0.1 }) }
      : // Stays on the card until the closing navigation removes the window,
        // which also brings the card back.
        { ...spring({ duration, bounce: 0.05 }), fill: "forwards" },
  );

  // The frame being left fades out over the first half of the move; the one
  // being reached fades in quickly ahead of the photo's arrival.
  let windowChrome = [
    { backgroundColor, boxShadow },
    { backgroundColor: "transparent", boxShadow: "none" },
  ];
  let near: KeyframeAnimationOptions = {
    duration: duration / 2,
    easing: "ease-out",
    fill: "both",
  };
  // Fading in waits a little, so the frame doesn't float far from the photo,
  // and is done before the photo lands rather than finishing after it.
  let far = { ...near, delay: duration * 0.2, duration: duration * 0.4 };
  let fades = opening
    ? [
        section.animate([...windowChrome].reverse(), far),
        titlebar.animate([{ opacity: 0 }, { opacity: 1 }], far),
        card.animate([{ opacity: 1 }, { opacity: 0 }], near),
      ]
    : [
        section.animate(windowChrome, near),
        titlebar.animate([{ opacity: titlebarOpacity }, { opacity: 0 }], near),
        card.animate([{ opacity: cardOpacity }, { opacity: 1 }], far),
      ];
  let moves = [animation, ...fades];
  windowMoves.set(section, moves);

  let restoreCard = () => {
    cardImage.style.visibility = "";
    for (let fade of fades) fade.cancel();
  };
  if (opening) {
    let reset = () => {
      // A close took over and puts things back itself.
      if (windowMoves.get(section) !== moves) return;
      restoreCard();
      section.style.transformOrigin = "";
      body.style.backgroundImage = placeholder;
    };
    animation.finished.then(reset, reset);
  }
  return { animation, restoreCard };
}

/**
 * Every photo as a small card, in a row that scrolls like a native
 * filmstrip: it snaps each card to the middle, and the card there grows and
 * opens above as the row passes it. Once the row settles, that photo loads
 * for real. Stepping some other way (an arrow, a click) scrolls the row along
 * to match.
 */
function PhotoTimeline(
  handle: Handle<{
    closing: boolean;
    /** Shows a photo without fetching it, for the ones the row passes. */
    onPreview: (slug: string) => void;
    onSelect: (slug: string) => void;
    useEntranceMotion: boolean;
    viewer: PhotoViewerState;
  }>,
) {
  let row: HTMLOListElement | undefined;
  // What the row is doing. `reader`: the reader is scrolling it, so it isn't
  // scrolled for them; `scrubbed` once it has opened a photo the settle still
  // has to fetch. `jumping`: it's jumping to a photo chosen some other way,
  // which shouldn't open again when it lands. `gliding`: it's gliding to one
  // (see glideTo).
  let motion: RowMotion = { kind: "idle" };
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  // The server renders the photos near the open one; the whole gallery
  // takes over once it's in the page, registered by the photo deck.
  let useGallery = false;
  let shownPhotos: unknown;

  handle.queueTask(() => {
    useGallery = true;
    photoGallery.addEventListener("change", () => handle.update(), {
      signal: handle.signal,
    });
    if (photoGallery.cards.length > 0) handle.update();
  });
  handle.signal.addEventListener("abort", () => {
    clearTimeout(settleTimer);
    stopGlide();
  });

  let getCurrentSlug = () => handle.props.viewer.photo.slug;

  let getCenteredSlug = () => {
    if (!row) return undefined;
    let middle = row.scrollLeft + row.clientWidth / 2;
    let nearest: HTMLElement | undefined;
    let nearestDistance = Infinity;
    for (let item of row.children as HTMLCollectionOf<HTMLElement>) {
      let distance = Math.abs(item.offsetLeft + item.offsetWidth / 2 - middle);
      if (distance < nearestDistance) {
        nearest = item;
        nearestDistance = distance;
      }
    }
    return nearest?.dataset.slug;
  };

  let scrollToPhoto = (slug: string, behavior: "instant" | "glide") => {
    let item = row?.querySelector<HTMLElement>(
      `li[data-slug="${CSS.escape(slug)}"]`,
    );
    if (!row || !item) return;
    let left = item.offsetLeft + item.offsetWidth / 2 - row.clientWidth / 2;
    if (behavior === "glide") {
      glideTo(left);
      return;
    }
    stopGlide();
    if (Math.abs(row.scrollLeft - left) < 1) return;
    motion = { kind: "jumping" };
    row.scrollTo({ left, behavior: "instant" });
  };

  // Glides the row on a spring that keeps its speed when the target moves, so
  // holding an arrow key carries the row along at the photos' pace. A native
  // smooth scroll restarts from rest at every key repeat, and barely moves
  // until the keys stop. Snapping is off meanwhile, since the browser would
  // snap each frame's position, and comes back once the row lands.
  let glideTo = (target: number) => {
    if (!row) return;
    if (motion.kind === "gliding") {
      motion.target = target;
      return;
    }
    if (Math.abs(row.scrollLeft - target) < 1) return;
    delete row.dataset.snap;
    let glide: RowGlide = {
      kind: "gliding",
      x: row.scrollLeft,
      velocity: 0,
      target,
      time: performance.now(),
      frame: 0,
    };
    motion = glide;
    let step = (now: number) => {
      if (motion !== glide || !row) return;
      let elapsed = Math.min(0.05, (now - glide.time) / 1000);
      glide.time = now;
      // A critically damped spring: as quick as it can be without overshoot.
      let acceleration =
        GLIDE_STIFFNESS * (glide.target - glide.x) -
        2 * Math.sqrt(GLIDE_STIFFNESS) * glide.velocity;
      glide.velocity += acceleration * elapsed;
      glide.x += glide.velocity * elapsed;
      let landed =
        Math.abs(glide.target - glide.x) < 0.5 && Math.abs(glide.velocity) < 20;
      row.scrollLeft = landed ? glide.target : glide.x;
      if (landed) stopGlide();
      else glide.frame = requestAnimationFrame(step);
    };
    glide.frame = requestAnimationFrame(step);
  };

  let stopGlide = () => {
    if (motion.kind !== "gliding") return;
    cancelAnimationFrame(motion.frame);
    motion = { kind: "idle" };
    if (row) row.dataset.snap = "";
  };

  // A touch or wheel takes over from a scroll to a chosen photo.
  let takeOver = () => {
    if (motion.kind === "jumping") motion = { kind: "idle" };
    stopGlide();
  };

  let settle = () => {
    clearTimeout(settleTimer);
    if (motion.kind === "gliding") return;
    if (motion.kind === "jumping") {
      motion = { kind: "idle" };
      return;
    }
    let scrubbed = motion.kind === "reader" && motion.scrubbed;
    motion = { kind: "idle" };
    let slug = getCenteredSlug();
    if (slug && (scrubbed || slug !== getCurrentSlug())) {
      handle.props.onSelect(slug);
    }
  };

  let onScroll = () => {
    if (motion.kind === "gliding") return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, TIMELINE_SETTLE_DELAY);
    if (motion.kind === "jumping") return;
    let scrubbed = motion.kind === "reader" && motion.scrubbed;
    let slug = getCenteredSlug();
    if (slug && slug !== getCurrentSlug()) {
      scrubbed = true;
      handle.props.onPreview(slug);
    }
    motion = { kind: "reader", scrubbed };
  };

  return () => {
    let { viewer } = handle.props;
    let gallery = useGallery ? photoGallery.cards : [];
    let photos = gallery.length > 0 ? gallery : viewer.timeline;
    let current = viewer.photo.slug;

    // Keep the open photo in the middle: straight there when the row's
    // photos are new, gliding after, unless the reader is the one scrolling.
    let newPhotos = photos !== shownPhotos;
    shownPhotos = photos;
    handle.queueTask(() => {
      if (!row) return;
      // The row becomes a scroller here, already on the open photo, and only
      // then starts snapping and shows (see timelineStyle): a browser
      // re-snaps to the card it last snapped to when the layout changes,
      // which would otherwise be the first one.
      if (!("scroller" in row.dataset)) {
        row.dataset.scroller = "";
        scrollToPhoto(current, "instant");
        row.dataset.snap = "";
        return;
      }
      if (motion.kind === "reader" || handle.props.closing) return;
      let instant = newPhotos || prefersReducedMotion();
      scrollToPhoto(current, instant ? "instant" : "glide");
    });

    return (
      <ol
        aria-label="Nearby photos"
        data-state={handle.props.closing ? "closing" : "open"}
        mix={[
          timelineStyle,
          ref((element) => {
            row = element;
          }),
          on("scroll", onScroll),
          on("scrollend", settle),
          on("pointerdown", takeOver),
          on("wheel", takeOver),
          handle.props.useEntranceMotion
            ? animateEntrance({
                opacity: 0,
                transform: "translateY(16px)",
                ...spring("snappy"),
              })
            : null,
        ]}
      >
        {photos.map((item) => (
          <li
            key={item.slug}
            data-slug={item.slug}
            mix={timelineItemStyle}
            style={{ "--card-ratio": String(item.width / item.height) }}
          >
            <a
              aria-current={item.slug === current ? "true" : undefined}
              aria-label={`View ${item.filename}`}
              data-rmx-history="replace"
              data-rmx-reset-focus="manual"
              data-rmx-reset-scroll="manual"
              data-rmx-target={jam2026ModalConfig.frameName}
              draggable={false}
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
                  loading="lazy"
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

type RowGlide = {
  kind: "gliding";
  x: number;
  velocity: number;
  target: number;
  time: number;
  frame: number;
};

type RowMotion =
  | { kind: "idle" }
  | { kind: "reader"; scrubbed: boolean }
  | { kind: "jumping" }
  | RowGlide;

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

// A native horizontal scroller: momentum, rubber-banding, and snapping come
// from the browser, and half its width of padding on each end lets the first
// and last cards reach the middle. A scroller can't start scrolled to the open
// photo without script, so until the viewer hydrates and positions it, the
// row stays hidden, then fades in already in place. Without script, it's a
// plain row of the photos around the open one, centered.
let timelineStyle = css({
  alignItems: "center",
  display: "flex",
  flex: "0 0 var(--timeline-height)",
  gap: `${TIMELINE_GAP}px`,
  justifyContent: "center",
  listStyle: "none",
  margin: 0,
  padding: 0,
  position: "relative",
  overflowX: "clip",
  overflowY: "hidden",
  "&[data-scroller]": {
    justifyContent: "normal",
    overflowX: "auto",
    overscrollBehaviorX: "contain",
    paddingInline: "50%",
  },
  "&[data-snap]": { scrollSnapType: "x mandatory" },
  "@media (scripting: enabled)": { "&:not([data-scroller])": { opacity: 0 } },
  scrollbarWidth: "none",
  "&::-webkit-scrollbar": { display: "none" },
  // Cards past the edges fade out.
  maskImage:
    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
  // Scrollable from anywhere along it, gaps included.
  pointerEvents: "auto",
  userSelect: "none",
  transition: "opacity 160ms ease-out",
  "&[data-state='closing']": { opacity: 0 },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let timelineItemStyle = css({
  display: "flex",
  flex: "0 0 auto",
  scrollSnapAlign: "center",
});

// Full size and opaque in the middle of the row, smaller and fainter toward
// its ends, following the scroll. Without scroll-driven animations, or before
// the row scrolls, only the open photo's card stands out.
let timelineCardStyle = css({
  color: jamTheme.ink,
  display: "flex",
  flex: "0 0 auto",
  flexDirection: "column",
  gap: "3px",
  opacity: 0.8,
  outline: "none",
  padding: `${TIMELINE_CARD_PADDING / 2}px`,
  borderRadius: "6px",
  textDecoration: "none",
  transform: "scale(0.85)",
  transition: "translate 300ms cubic-bezier(0.22, 1.5, 0.36, 1)",
  "&[aria-current]": { opacity: 1, transform: "none" },
  // Once the row scrolls (see timelineStyle); before that there's no scroll
  // for the animation to follow.
  "@supports (animation-timeline: view())": {
    ":is(ol[data-scroller]) > li > &": {
      animationName: "jam-2026-filmstrip-focus",
      animationDuration: "auto",
      animationTimingFunction: "linear",
      animationFillMode: "both",
      animationTimeline: "view(inline)",
      // Full size only right at the middle, shrinking over about two cards.
      animationRange: "cover calc(50% - 180px) cover calc(50% + 180px)",
    },
  },
  "@keyframes jam-2026-filmstrip-focus": {
    "0%, 100%": { opacity: 0.6, transform: "scale(0.78)" },
    "50%": { opacity: 1, transform: "none" },
  },
  // The gallery cards' hover lift.
  ":is(li:hover) > &": { translate: "0 -3px" },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    ":is(li:hover) > &": { translate: "none" },
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
