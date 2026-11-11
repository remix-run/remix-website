import { clientEntry, css, on, ref, type Handle } from "remix/component";
import {
  animateLayout,
  prefersReducedMotion,
  spring,
} from "@remix-run/ui/animation";
import { jamTheme } from "./theme.ts";
import { jam2026ModalConfig } from "./modal-contract.ts";
import { photoGallery } from "./photo-gallery.ts";
import { pageScrollY, scrollAlongCurve } from "./scroll-animation.ts";
import { photoViewer } from "./photo-viewer-controller.ts";
import {
  preloadViewerImage,
  resizeShopifyImage,
  type PhotoCard,
} from "./shopify-photo.ts";
import {
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./window-styles.ts";
import { Icon } from "../../../../ui/public/icon.tsx";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";
import { routes } from "../../../../routes.ts";

type Jam2026PhotoDeckProps = {
  cards: PhotoCard[];
  /** Start with the cards dealt, as when a photo link opens the page. */
  initiallyDealt?: boolean;
};

const THUMBNAIL_WIDTHS = [320, 480, 640];
// How many cards show in the stack (and load their images) before the deal.
const STACK_SIZE = 10;
// The deal sends cards out in a wave: each later card, up to `staggerCap`,
// takes `stagger` ms longer. Gathering brings them all back at once.
const DEAL = { duration: 350, stagger: 19, staggerCap: 20, bounce: 0.2 };
const GATHER = { duration: 350, bounce: 0 };
// The list grows and shrinks without bounce, so the page below doesn't wobble.
const RESIZE_DURATION = { deal: 400, gather: 300 };
// The stack's shape at rest and while hovered: how much of the livestream's
// width it spreads across, and how far apart its rows sit.
const STACK_REST = { spread: 0.49, rowSpacing: 35 };
const STACK_HOVER = { spread: 0.65, rowSpacing: 62 };
// How far each stacked card's fixed jitter can move it.
const JITTER = { x: 50, y: 32 };

export let Jam2026PhotoDeck = clientEntry(
  import.meta.url,
  function Jam2026PhotoDeck(handle: Handle<Jam2026PhotoDeckProps>) {
    let dealt = handle.props.initiallyDealt ?? false;
    let hasDealt = dealt;
    let list: HTMLUListElement | null = null;

    // The stacked blob reaches above and below the single row it sits in.
    // Padding the list by that much keeps the space around the photos the same
    // stacked as dealt, so the deal doesn't shift what's above or below.
    let padStack = () => {
      if (!list) return;
      let { top, bottom } = dealt
        ? { top: 0, bottom: 0 }
        : getStackOverflow(list);
      list.style.setProperty("--stack-pad-top", `${top}px`);
      list.style.setProperty("--stack-pad-bottom", `${bottom}px`);
    };

    let setDealt = (next: boolean) => {
      if (dealt === next) return;
      let startHeight = list?.offsetHeight ?? 0;
      dealt = next;
      hasDealt ||= next;
      handle.update();
      handle.queueTask(() => {
        if (!list) return;
        padStack();
        let reduceMotion = prefersReducedMotion();
        let resize = spring({
          duration: dealt ? RESIZE_DURATION.deal : RESIZE_DURATION.gather,
          bounce: 0,
        });
        // Grow or shrink the list instead of snapping the content below it.
        if (!reduceMotion) {
          list.animate(
            [
              { height: `${startHeight}px` },
              { height: `${list.offsetHeight}px` },
            ],
            { ...resize },
          );
        }
        if (dealt) {
          list.focus({ preventScroll: true });
          return;
        }
        list
          .querySelector<HTMLElement>("button[data-deal]")
          ?.focus({ preventScroll: true });
        // Any card can gather, even far down the grid, so follow the cards
        // back up to the stack, centered in the viewport.
        let top = list.firstElementChild as HTMLElement;
        let targetY =
          window.scrollY +
          list.getBoundingClientRect().top +
          top.offsetTop -
          (window.innerHeight - top.offsetHeight) / 2;
        // On the list's own spring, not a native smooth scroll, which gets
        // cut short as the list shrinks under it.
        if (reduceMotion) window.scrollTo(0, targetY);
        else scrollAlongCurve(pageScrollY, targetY, [...resize], handle.signal);
      });
    };
    let deal = () => setDealt(true);

    // A card about to be opened starts loading its full-size photo: after a
    // short hover, as Remix's link prefetching waits, or at once on focus
    // or press.
    let preloadTimer: ReturnType<typeof setTimeout> | undefined;
    let preloadOnIntent = (card: PhotoCard) => [
      on<HTMLAnchorElement, "pointerenter">("pointerenter", (event) => {
        if (event.pointerType !== "mouse") return;
        clearTimeout(preloadTimer);
        preloadTimer = setTimeout(() => preloadViewerImage(card.url), 100);
      }),
      on<HTMLAnchorElement, "pointerleave">("pointerleave", () =>
        clearTimeout(preloadTimer),
      ),
      on<HTMLAnchorElement, "focus">("focus", () =>
        preloadViewerImage(card.url),
      ),
      on<HTMLAnchorElement, "pointerdown">("pointerdown", () =>
        preloadViewerImage(card.url),
      ),
    ];
    handle.signal.addEventListener("abort", () => clearTimeout(preloadTimer));

    // The card is a real link the frame runtime follows; the viewer shows its
    // photo before that navigation comes back. While the viewer closes, the
    // close's navigation would undo the open, so the click waits it out.
    let openPhoto = (event: MouseEvent, slug: string) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
      if (event.shiftKey || event.altKey) return;
      if (!photoViewer.show(slug)) event.preventDefault();
    };
    let gather = () => setDealt(false);

    // Escape gathers the dealt photos from anywhere on the page, unless a
    // modal is open. That includes one animating closed, which has already
    // released the page but should still own the key.
    handle.queueTask(() => {
      document.addEventListener(
        "keydown",
        (event) => {
          if (event.key !== "Escape" || event.defaultPrevented || !dealt) {
            return;
          }
          if (document.querySelector("[role='dialog'][aria-modal='true']")) {
            return;
          }
          gather();
        },
        { signal: handle.signal },
      );
    });

    return () => {
      let { cards } = handle.props;
      handle.queueTask(() => photoGallery.set(cards));
      let animate = !prefersReducedMotion();

      return (
        <div mix={deckStyle}>
          <ul
            aria-label="Photos"
            tabIndex={-1}
            mix={[
              gridStyle,
              dealt ? null : stackedListStyle,
              ref((node, signal) => {
                list = node;
                // Card sizes follow the list's width.
                let observer = new ResizeObserver(padStack);
                observer.observe(node);
                signal.addEventListener(
                  "abort",
                  () => {
                    observer.disconnect();
                    list = null;
                  },
                  { once: true },
                );
              }),
            ]}
          >
            {cards.map((card, index) => {
              let stacked = !dealt;
              let buried = stacked && index >= STACK_SIZE;

              return (
                <li
                  key={card.url}
                  mix={[
                    // First, so it keeps its place in the mix list when the
                    // conditional styles below drop out; a moved mixin remounts
                    // and loses the stacked position it animates from. It's
                    // configured for the move this render starts: back into
                    // the stack, or out to the grid.
                    animateLayout(
                      animate && {
                        size: false,
                        ...spring(
                          stacked
                            ? GATHER
                            : {
                                duration:
                                  DEAL.duration +
                                  Math.min(index, DEAL.staggerCap) *
                                    DEAL.stagger,
                                bounce: DEAL.bounce,
                              },
                        ),
                      },
                    ),
                    cellStyle,
                    stacked ? stackedCellStyle : null,
                    stacked && index > 0 ? pileCellStyle : null,
                    buried ? buriedCellStyle : null,
                    // The visible cards act as one: clicking any of them deals,
                    // including the button on top, whose click bubbles here.
                    stacked && index < STACK_SIZE
                      ? [visibleStackCellStyle, on("click", deal)]
                      : null,
                  ]}
                  style={{
                    "--photo-ratio": String(card.width / card.height),
                    "--stack-z": String(cards.length - index),
                    "--deal-index": String(index),
                    ...(stacked && index < STACK_SIZE && getJitter(index)),
                  }}
                >
                  <div
                    mix={[
                      jam2026WindowSurfaceStyle,
                      cardStyle,
                      stacked ? stackedCardStyle : dealtCardStyle,
                    ]}
                  >
                    {stacked ? null : (
                      <a
                        aria-label={`View ${card.filename}`}
                        data-rmx-reset-focus="manual"
                        data-rmx-reset-scroll="manual"
                        data-rmx-target={jam2026ModalConfig.frameName}
                        href={routes.jam.y2026.photos.show.href({
                          photo: card.slug,
                        })}
                        mix={[
                          cardLinkStyle,
                          ...preloadOnIntent(card),
                          // The viewer grows out of this card, shrinks back
                          // into it, and returns focus to it.
                          ref((link, signal) =>
                            photoViewer.registerCard(card.slug, link, signal),
                          ),
                          on<HTMLAnchorElement, "click">("click", (event) =>
                            openPhoto(event, card.slug),
                          ),
                        ]}
                      />
                    )}
                    <div mix={cardTitleBarStyle}>
                      <p aria-hidden="true" mix={jam2026WindowTitleStyle}>
                        {card.filename}
                      </p>
                      {stacked ? null : (
                        <button
                          aria-label="Stack photos"
                          mix={[
                            stackButtonStyle,
                            on("click", (event) => {
                              // The gather re-renders before this click
                              // finishes bubbling, and by then the top cards
                              // deal on click again.
                              event.stopPropagation();
                              gather();
                            }),
                          ]}
                          type="button"
                        >
                          <Icon name="circle-minus" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <div mix={imageFrameStyle}>
                      {/* Buried cards stay empty until the first deal, so the
                        stack doesn't download every photo while it sits on
                        screen. */}
                      {buried && !hasDealt ? null : (
                        <img
                          alt={
                            card.altText ||
                            `Remix Jam 2026 photo ${index + 1} of ${cards.length}`
                          }
                          decoding="async"
                          draggable={false}
                          height={card.height}
                          loading="lazy"
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 280px"
                          src={resizeShopifyImage(card.url, 480)}
                          srcSet={THUMBNAIL_WIDTHS.map(
                            (width) =>
                              `${resizeShopifyImage(card.url, width)} ${width}w`,
                          ).join(", ")}
                          width={card.width}
                        />
                      )}
                    </div>
                  </div>
                  {stacked && index === 0 ? (
                    // A label over the stack so it reads as something to press,
                    // not decoration, and a focus target for the keyboard.
                    <button
                      data-deal
                      mix={[jam2026WindowSurfaceStyle, dealButtonStyle]}
                      type="button"
                    >
                      View {cards.length} photos
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      );
    };
  },
);

/**
 * A fixed nudge for each stacked card, from -1 to 1 on each axis, so the
 * stack looks tossed together rather than laid out.
 */
function getJitter(index: number) {
  let { x, y } = getJitterValues(index);
  return { "--jitter-x": String(x), "--jitter-y": String(y) };
}

function getJitterValues(index: number) {
  let noise = (seed: number) => {
    let value = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
    return Math.round(((value - Math.floor(value)) * 2 - 1) * 100) / 100;
  };
  return { x: noise(1), y: noise(2) };
}

/**
 * How far the stacked cards reach above and below the row they're centered
 * in, at rest. Mirrors `stackedCardStyle` with the cards' layout sizes, which
 * transforms don't affect, so the hover spread and animations don't skew it.
 */
function getStackOverflow(list: HTMLElement) {
  let columns = Number(getComputedStyle(list).getPropertyValue("--columns"));
  if (!columns) return { top: 0, bottom: 0 };
  let rows = Math.min(Math.ceil(STACK_SIZE / columns), 3);
  let items = [...list.children].slice(0, STACK_SIZE) as HTMLElement[];
  let rowHeight = items[0]?.offsetHeight ?? 0;
  let top = 0;
  let bottom = 0;

  items.forEach((item, index) => {
    let height = (item.firstElementChild as HTMLElement).offsetHeight;
    let row = Math.min(Math.floor(index / columns), 2);
    let level = (row - (rows - 1) / 2) / Math.max(1, (rows - 1) / 2);
    // Each card is centered in the row before the stack moves it.
    let cardTop =
      (rowHeight - height) / 2 +
      level * STACK_REST.rowSpacing +
      getJitterValues(index).y * JITTER.y;
    top = Math.max(top, -cardTop);
    bottom = Math.max(bottom, cardTop + height - rowHeight);
  });

  return { top: Math.ceil(top), bottom: Math.ceil(bottom) };
}

let gridStyle = css({
  "--columns": "2",
  "--column-gap": "16px",
  // Keeps the stack order inside the list, below the fixed header, and makes
  // the grid the frame for the stacked cards.
  position: "relative",
  isolation: "isolate",
  display: "grid",
  gap: "24px var(--column-gap)",
  gridTemplateColumns: "repeat(var(--columns), minmax(0, 1fr))",
  // Rows pack to the top: while the list's height animates, a stretched row
  // would carry the stack down into the middle of it.
  alignContent: "start",
  alignItems: "center",
  justifyItems: "center",
  width: "100%",
  margin: 0,
  padding: 0,
  listStyle: "none",
  outline: "none",
  [breakpointMedia.sm]: {
    "--columns": "3",
    "--column-gap": "32px",
    rowGap: "40px",
  },
  [breakpointMedia.lg]: { "--columns": "4" },
  // Wider than the 1200px windows so five columns keep the four-column card size.
  [breakpointMedia["2xl"]]: { "--columns": "5" },
});

// Room for the stacked blob above and below its row (see padStack). Before
// hydration measures it, a typical overflow keeps the page close.
let stackedListStyle = css({
  paddingBlock: "var(--stack-pad-top, 90px) var(--stack-pad-bottom, 90px)",
});

// Landscape cards span the cell; portrait cards share the same long edge, so
// every photo prints at one size, like a stack of Polaroids. Cards keep their
// stacking order whether stacked or dealt; nothing raises one on hover.
let cellStyle = css({
  position: "relative",
  transition: "opacity 150ms ease-out, visibility 0s",
  zIndex: "var(--stack-z)",
  width: "calc(100% * min(1, var(--photo-ratio)))",
});

let visibleStackCellStyle = css({ cursor: "pointer" });

// Until it's dealt, the stack spans the whole row and sits centered in it,
// with each card still sized to one column so the deal only moves cards.
let stackedCellStyle = css({
  gridColumn: "1 / -1",
  width:
    "calc((100% - (var(--columns) - 1) * var(--column-gap)) / var(--columns) * min(1, var(--photo-ratio)))",
});

// The first card holds the row; the rest pile onto it, centered.
let pileCellStyle = css({
  position: "absolute",
  // Row 1 too, not just the columns: otherwise the frame is the whole list,
  // which is still tall while it shrinks after a gather.
  gridRow: "1 / 2",
  inset: 0,
  height: "fit-content",
  margin: "auto",
});

// On a gather, buried cards stay visible while they fly back and fade out as
// they converge on the stack, instead of vanishing at the click.
let buriedCellStyle = css({
  opacity: 0,
  visibility: "hidden",
  transition: "opacity 50ms ease-in 80ms, visibility 0s 130ms",
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

// States only change the --card-* offsets, so every transition interpolates
// the same translate.
let cardStyle = css({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  transform: "translate(var(--card-x, 0px), var(--card-y, 0px))",
  transition:
    "transform 300ms cubic-bezier(0.22, 1.5, 0.36, 1), box-shadow 300ms cubic-bezier(0.22, 1.5, 0.36, 1)",
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let liftedShadow =
  "0 2px 4px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.24)), 0 8px 16px light-dark(rgb(8 40 69 / 0.07), rgb(0 0 0 / 0.28)), 0 20px 36px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.32)), 0 40px 72px light-dark(rgb(8 40 69 / 0.1), rgb(0 0 0 / 0.38))";

// The stack is a loose pile: each card sits toward the column it'll be dealt
// to and its rows sit around the middle, so the deal reads as the pile
// spreading out, while a fixed jitter per card keeps it from looking like a
// grid. Hovering spreads it further, toward the livestream's width.
let stackedCardStyle = css({
  "--stack-col": "mod(var(--deal-index), var(--columns))",
  "--stack-row": "min(round(down, var(--deal-index) / var(--columns), 1), 2)",
  "--stack-rows": `min(round(up, ${STACK_SIZE} / var(--columns), 1), 3)`,
  // -1 for the first column through 1 for the last.
  "--stack-side":
    "calc((var(--stack-col) - (var(--columns) - 1) / 2) / max(1, (var(--columns) - 1) / 2))",
  // -1 for the first row through 1 for the last.
  "--stack-level":
    "calc((var(--stack-row) - (var(--stack-rows) - 1) / 2) / max(1, (var(--stack-rows) - 1) / 2))",
  // How far an edge card's center can sit from the middle and still keep the
  // card within the livestream's width.
  "--stack-reach":
    "max(0px, (var(--livestream-width) - (100cqw - (var(--columns) - 1) * var(--column-gap)) / var(--columns)) / 2)",
  // Solid, unlike a lone window, so the cards behind don't show through.
  background: jamTheme.surfaceRaised,
  ...stackPose(STACK_REST),
  ":is(ul:has(> li:hover, > li > button:focus-visible)) > li > &":
    stackPose(STACK_HOVER),
  "@media (prefers-reduced-motion: reduce)": {
    // Lift the stack instead of fanning it.
    ":is(ul:has(> li:hover, > li > button:focus-visible)) > li > &": {
      ...stackPose(STACK_REST),
      boxShadow: liftedShadow,
    },
  },
});

function stackPose(pose: typeof STACK_REST) {
  return {
    "--card-x": `calc(var(--stack-side) * var(--stack-reach) * ${pose.spread} + var(--jitter-x, 0) * ${JITTER.x}px)`,
    "--card-y": `calc(var(--stack-level) * ${pose.rowSpacing}px + var(--jitter-y, 0) * ${JITTER.y}px)`,
  };
}

// A hovered card lifts off the grid.
let dealtCardStyle = css({
  ":is(li:hover) > &": { "--card-y": "-4px", boxShadow: liftedShadow },
  "@media (prefers-reduced-motion: reduce)": {
    ":is(li:hover) > &": { "--card-y": "0px" },
  },
});

let imageFrameStyle = css({
  aspectRatio: "var(--photo-ratio)",
  overflow: "hidden",
  borderRadius: "0.25rem",
  background: jamTheme.inkWash,
  "& img": {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    userSelect: "none",
  },
});

// Centered over the stack. It changes with the stack's own hover and focus
// (the same trigger that fans the cards), not on its own.
let dealButtonStyle = css({
  appearance: "none",
  position: "absolute",
  top: "50%",
  left: "50%",
  zIndex: 1,
  translate: "-50% -50%",
  border: 0,
  borderRadius: "8px",
  padding: "14px 20px",
  color: jamTheme.ink,
  cursor: "pointer",
  fontFamily: theme.fontFamily.mono,
  fontSize: "13px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.06em",
  lineHeight: 1,
  outline: "none",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  transition: "background-color 200ms ease",
  // Turns solid, so it stands out over the fanned-out cards.
  ":is(ul:has(> li:hover, > li > button:focus-visible)) &": {
    background: jamTheme.surfaceRaised,
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "3px",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

// Sized to the grid.
let deckStyle = css({
  // The livestream window's width (see hero.tsx), which the stack spreads to.
  "--livestream-width": "min(960px, 100vw - 32px)",
  position: "relative",
  // Lets the stack size its spread from the grid's width (cqw).
  containerType: "inline-size",
  width: "100%",
  maxWidth: "1200px",
  marginInline: "auto",
  [breakpointMedia.sm]: { "--livestream-width": "min(960px, 100vw - 64px)" },
  // Wider than the 1200px windows so five columns keep the four-column card size.
  [breakpointMedia["2xl"]]: { maxWidth: "1600px" },
});

// Covers the whole card, under its minus button.
let cardLinkStyle = css({
  position: "absolute",
  inset: 0,
  zIndex: 1,
  borderRadius: "0.5rem",
  cursor: "zoom-in",
  outline: "none",
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "4px",
  },
});

let cardTitleBarStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  minWidth: 0,
});

// The photo moments' close button, as a minimize: any card stacks them all.
let stackButtonStyle = css({
  appearance: "none",
  position: "relative",
  zIndex: 2,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flex: "0 0 auto",
  width: "28px",
  height: "28px",
  // Pinned to the right end of the title bar.
  margin: "-8px -8px -8px auto",
  border: 0,
  borderRadius: theme.radius.full,
  background: "transparent",
  color: jamTheme.ink,
  cursor: "pointer",
  outline: "none",
  padding: 0,
  transition: "opacity 140ms ease",
  "& svg": { display: "block", width: "12px", height: "12px" },
  "&:hover": { opacity: 0.7 },
  "&:focus-visible": {
    color: jamTheme.brandRed,
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});
