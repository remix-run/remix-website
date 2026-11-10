import { clientEntry, css, on, ref, type Handle } from "remix/component";
import {
  animateEntrance,
  animateLayout,
  prefersReducedMotion,
  spring,
} from "@remix-run/ui/animation";
import { jamTheme } from "./theme.ts";
import { resizeShopifyImage, type Photo } from "./shopify-photo.ts";
import {
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./window-styles.ts";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";

export type PhotoCard = Photo & { filename: string; tilt: number };

type Jam2026PhotoDeckProps = {
  cards: PhotoCard[];
};

const THUMBNAIL_WIDTHS = [320, 480, 640];
// How the top three cards sit in the stack, and where they fan to while it's
// hovered: the cards underneath slide out left, right, and a little down,
// hinting at the directions the deal will send them. Offsets add to each
// card's own tilt.
const STACK = [
  { rest: ["0px", "0px", "0deg"], fan: ["0px", "-4px", "0deg"] },
  { rest: ["5px", "4px", "3deg"], fan: ["-24%", "14%", "-8deg"] },
  { rest: ["-4px", "6px", "-3deg"], fan: ["24%", "14%", "8deg"] },
];

export let Jam2026PhotoDeck = clientEntry(
  import.meta.url,
  function Jam2026PhotoDeck(handle: Handle<Jam2026PhotoDeckProps>) {
    let dealt = false;
    let hasDealt = false;
    let list: HTMLUListElement | null = null;

    let setDealt = (next: boolean) => {
      if (dealt === next) return;
      let startHeight = list?.offsetHeight ?? 0;
      dealt = next;
      hasDealt ||= next;
      handle.update();
      handle.queueTask(() => {
        if (!list) return;
        // Grow or shrink the list instead of snapping the content below it,
        // keeping pace with the first cards (without their bounce, so the page
        // below doesn't wobble).
        if (!prefersReducedMotion()) {
          list.animate(
            [
              { height: `${startHeight}px` },
              { height: `${list.offsetHeight}px` },
            ],
            { ...spring({ duration: 520, bounce: 0 }) },
          );
        }
        let focusTarget = dealt ? list : list.querySelector("button");
        focusTarget?.focus({ preventScroll: true });
      });
    };
    let deal = () => setDealt(true);
    let gather = () => setDealt(false);

    return () => {
      let { cards } = handle.props;
      let animate = !prefersReducedMotion();

      return (
        <div>
          {/* Keeps its height while stacked, so the button coming and going
              never shifts the cards. */}
          <div mix={gatherBarStyle}>
            {dealt ? (
              <div
                mix={animateEntrance(
                  animate && {
                    opacity: 0,
                    transform: "translateY(-12px)",
                    delay: 250,
                    ...spring("snappy"),
                  },
                )}
              >
                <button
                  mix={[
                    jam2026WindowSurfaceStyle,
                    gatherButtonStyle,
                    on("click", gather),
                  ]}
                  type="button"
                >
                  <StackGlyph />
                  Stack photos
                </button>
              </div>
            ) : null}
          </div>
          <ul
            aria-label="Photos"
            tabIndex={-1}
            mix={[
              gridStyle,
              ref((node, signal) => {
                list = node;
                signal.addEventListener("abort", () => (list = null), {
                  once: true,
                });
              }),
            ]}
            style={{ "--card-count": String(cards.length) }}
          >
            {cards.map((card, index) => {
              let stacked = !dealt;
              let buried = stacked && index >= STACK.length;
              let pose = stacked ? STACK[index] : undefined;

              return (
                <li
                  key={card.url}
                  mix={[
                    // First, so it keeps its place in the mix list when the
                    // conditional styles below drop out; a moved mixin remounts
                    // and loses the stacked position it animates from. Every
                    // card leaves the stack at once; later cards take a little
                    // longer, so they land in a wave rather than together.
                    animateLayout(
                      animate && {
                        size: false,
                        ...spring({
                          duration: 520 + Math.min(index, 24) * 18,
                          bounce: 0.2,
                        }),
                      },
                    ),
                    cellStyle,
                    stacked ? null : dealtCellStyle,
                    stacked ? stackedCellStyle : null,
                    stacked && index > 0 ? pileCellStyle : null,
                    buried ? buriedCellStyle : null,
                    // The visible cards act as one: clicking any of them deals,
                    // including the button on top, whose click bubbles here.
                    stacked && index < STACK.length
                      ? [visibleStackCellStyle, on("click", deal)]
                      : null,
                  ]}
                  style={{
                    "--photo-ratio": String(card.width / card.height),
                    "--photo-tilt": `${card.tilt}deg`,
                    "--stack-z": String(cards.length - index),
                    ...(pose && {
                      "--rest-x": pose.rest[0],
                      "--rest-y": pose.rest[1],
                      "--rest-rotate": pose.rest[2],
                      "--fan-x": pose.fan[0],
                      "--fan-y": pose.fan[1],
                      "--fan-rotate": pose.fan[2],
                    }),
                  }}
                >
                  <div
                    mix={[
                      jam2026WindowSurfaceStyle,
                      cardStyle,
                      stacked ? stackedCardStyle : dealtCardStyle,
                    ]}
                  >
                    <p aria-hidden="true" mix={jam2026WindowTitleStyle}>
                      {card.filename}
                    </p>
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
                    <button
                      aria-label={`Deal ${cards.length} photos`}
                      mix={dealButtonStyle}
                      type="button"
                    />
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
  maxWidth: "1200px",
  margin: "0 auto",
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
  [breakpointMedia["2xl"]]: { "--columns": "5", maxWidth: "1600px" },
});

// Landscape cards span the cell; portrait cards share the same long edge, so
// every photo prints at one size, like a stack of Polaroids.
let cellStyle = css({
  position: "relative",
  transition: "opacity 150ms ease-out, visibility 0s",
  zIndex: "var(--stack-z)",
  width: "calc(100% * min(1, var(--photo-ratio)))",
});

// Once dealt, a hovered card rises above its neighbors. The stack keeps its
// order, so the cards underneath never jump in front of the top one.
let dealtCellStyle = css({
  "&:hover": { zIndex: "calc(var(--card-count) + 1)" },
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
  transition: "opacity 200ms ease-in 400ms, visibility 0s 600ms",
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

// States only change the --card-* offsets, so every transition interpolates
// the same translate + rotate.
let cardStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  transform:
    "translate(var(--card-x, 0px), var(--card-y, 0px)) rotate(calc(var(--photo-tilt) + var(--card-rotate, 0deg)))",
  transformOrigin: "50% 100%",
  transition:
    "transform 350ms cubic-bezier(0.22, 1.5, 0.36, 1), box-shadow 350ms cubic-bezier(0.22, 1.5, 0.36, 1)",
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let liftedShadow =
  "0 2px 4px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.24)), 0 8px 16px light-dark(rgb(8 40 69 / 0.07), rgb(0 0 0 / 0.28)), 0 20px 36px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.32)), 0 40px 72px light-dark(rgb(8 40 69 / 0.1), rgb(0 0 0 / 0.38))";

let stackedCardStyle = css({
  "--card-x": "var(--rest-x, 0px)",
  "--card-y": "var(--rest-y, 0px)",
  "--card-rotate": "var(--rest-rotate, 0deg)",
  ":is(ul:has(> li:hover, > li > button:focus-visible)) > li > &": {
    "--card-x": "var(--fan-x, 0px)",
    "--card-y": "var(--fan-y, 0px)",
    "--card-rotate": "var(--fan-rotate, 0deg)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    // Lift the stack instead of fanning it.
    ":is(ul:has(> li:hover, > li > button:focus-visible)) > li > &": {
      "--card-x": "var(--rest-x, 0px)",
      "--card-y": "var(--rest-y, 0px)",
      "--card-rotate": "var(--rest-rotate, 0deg)",
      boxShadow: liftedShadow,
    },
  },
});

// The photo moments' hover nudge, applied on top of each card's own tilt.
let dealtCardStyle = css({
  ":is(li:hover) > &": { "--card-rotate": "-2deg" },
  "@media (prefers-reduced-motion: reduce)": {
    ":is(li:hover) > &": { "--card-rotate": "0deg", boxShadow: liftedShadow },
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

function StackGlyph() {
  return () => (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 16 14"
      width="16"
    >
      <rect
        height="8"
        rx="1"
        transform="rotate(-8 5 7)"
        width="10"
        x="1"
        y="4"
      />
      <rect
        style={{ fill: jamTheme.surfaceRaised }}
        height="8"
        rx="1"
        transform="rotate(6 10 6)"
        width="10"
        x="5"
        y="2"
      />
    </svg>
  );
}

let dealButtonStyle = css({
  appearance: "none",
  position: "absolute",
  inset: 0,
  zIndex: 1,
  border: 0,
  borderRadius: "0.5rem",
  background: "transparent",
  cursor: "pointer",
  outline: "none",
  padding: 0,
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "4px",
  },
});

let gatherBarStyle = css({
  position: "relative",
  zIndex: 1,
  display: "flex",
  justifyContent: "center",
  minHeight: "38px",
  marginBlockEnd: "32px",
});

// A small window, matching the cards it gathers.
let gatherButtonStyle = css({
  appearance: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  border: 0,
  color: jamTheme.ink,
  cursor: "pointer",
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.06em",
  lineHeight: 1,
  outline: "none",
  padding: "12px 16px",
  textTransform: "uppercase",
  backdropFilter: "blur(8px)",
  transition: "color 160ms ease",
  "& svg": { flex: "0 0 auto" },
  // Like the header's buttons; tilting is for the photos.
  "&:hover, &:focus-visible": { color: jamTheme.brandRed },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "3px",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});
