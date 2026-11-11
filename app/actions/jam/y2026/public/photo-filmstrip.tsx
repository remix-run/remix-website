import { css, on, ref, type Handle } from "remix/component";
import {
  animateEntrance,
  prefersReducedMotion,
  spring,
} from "@remix-run/ui/animation";

import { routes } from "../../../../routes.ts";
import { jam2026ModalConfig } from "./modal-contract.ts";
import { photoGallery } from "./photo-gallery.ts";
import { photoViewer, selectOnClick } from "./photo-viewer-controller.ts";
import { PhotoViewerSessionProvider } from "./photo-viewer-session.ts";
import { ScrollGlide } from "./scroll-animation.ts";
import { resizeShopifyImage, type PhotoViewerState } from "./shopify-photo.ts";
import { jamTheme } from "./theme.ts";
import {
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./window-styles.ts";

const TIMELINE_IMAGE_WIDTH = 200;
// Matches the row's gap and the cards' horizontal padding.
const TIMELINE_GAP = 6;
const TIMELINE_CARD_PADDING = 8;
// How long the row must sit still before a scroll counts as settled, where
// the browser can't say so itself.
const TIMELINE_SETTLE_DELAY = 150;
// How stiff the row's glide to a chosen photo is: (2π / 300ms)², a spring
// that settles in about a third of a second.
const GLIDE_STIFFNESS = ((2 * Math.PI) / 0.3) ** 2;

/**
 * Every photo as a small card, in a row that scrolls like a native
 * filmstrip: it snaps each card to the middle, and the card there grows and
 * opens above as the row passes it. Once the row settles, that photo loads
 * for real. Stepping some other way (an arrow, a click) scrolls the row along
 * to match.
 */
export function PhotoTimeline(
  handle: Handle<{ useEntranceMotion: boolean; viewer: PhotoViewerState }>,
) {
  let session = handle.context.get(PhotoViewerSessionProvider);
  let isClosing = () => session.phase.kind === "closing";
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

  // Glides the row to a photo chosen some other way, so holding an arrow
  // key carries the row along at the photos' pace. Snapping is off meanwhile,
  // since the browser would snap each frame's position, and comes back once
  // the row lands.
  let glide = new ScrollGlide(
    {
      get: () => row?.scrollLeft ?? 0,
      set: (position) => {
        if (row) row.scrollLeft = position;
      },
    },
    GLIDE_STIFFNESS,
    () => {
      motion = { kind: "idle" };
      if (row) row.dataset.snap = "";
    },
  );

  let glideTo = (target: number) => {
    if (!row) return;
    if (motion.kind !== "gliding") {
      if (Math.abs(row.scrollLeft - target) < 1) return;
      delete row.dataset.snap;
      motion = { kind: "gliding" };
    }
    glide.to(target);
  };

  let stopGlide = () => glide.stop();

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
      photoViewer.select(slug);
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
      // Shown without fetching, for the photos the row passes.
      photoViewer.show(slug, { preview: true });
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
      if (motion.kind === "reader" || isClosing()) return;
      let instant = newPhotos || prefersReducedMotion();
      scrollToPhoto(current, instant ? "instant" : "glide");
    });

    return (
      <ol
        aria-label="Nearby photos"
        data-state={isClosing() ? "closing" : "open"}
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
              mix={[
                jam2026WindowSurfaceStyle,
                timelineCardStyle,
                on<HTMLAnchorElement, "click">(
                  "click",
                  selectOnClick(() => item.slug),
                ),
              ]}
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

type RowMotion =
  | { kind: "idle" }
  | { kind: "reader"; scrubbed: boolean }
  | { kind: "jumping" }
  | { kind: "gliding" };

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
