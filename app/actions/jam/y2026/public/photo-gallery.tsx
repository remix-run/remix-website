import { clientEntry, css, on, ref, type Handle } from "remix/component";
import { jamTheme } from "./theme.ts";
import {
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./window-styles.ts";
import { focusTrap } from "../../../../ui/public/focus-trap.ts";
import { Icon } from "../../../../ui/public/icon.tsx";
import { lockScroll } from "../../../../ui/public/scroll-lock.ts";
import { breakpointMedia, theme } from "../../../../ui/public/theme.ts";
import {
  getPhotoFilename,
  resizeShopifyImage,
  type Photo,
} from "./shopify-photo.ts";

type Jam2026PhotoGalleryProps = {
  photos: Photo[];
};

// About a viewport of rows, so the schedule and FAQ stay within reach.
const PREVIEW_COUNT = 12;
const THUMBNAIL_WIDTHS = [320, 480, 640];
const VIEWER_IMAGE_WIDTH = 1920;

export let Jam2026PhotoGallery = clientEntry(
  import.meta.url,
  function Jam2026PhotoGallery(handle: Handle<Jam2026PhotoGalleryProps>) {
    let expanded = false;
    let selected: number | null = null;
    let lastSelected: number | null = null;
    let thumbnails = new Map<number, HTMLButtonElement>();

    let select = (index: number) => {
      let { photos } = handle.props;
      selected = (index + photos.length) % photos.length;
      lastSelected = selected;
      handle.update();

      // Warm the neighbors so arrow-key browsing doesn't flash empty frames.
      handle.queueTask(() => {
        for (let offset of [-1, 1]) {
          let neighbor =
            photos[(selected! + offset + photos.length) % photos.length];
          new Image().src = resizeShopifyImage(
            neighbor.url,
            VIEWER_IMAGE_WIDTH,
          );
        }
      });
    };

    let close = () => {
      if (selected === null) return;
      selected = null;
      // Browsing past the preview reveals the rest so focus has somewhere to go.
      if (lastSelected !== null && lastSelected >= PREVIEW_COUNT) {
        expanded = true;
      }
      handle.update();
      handle.queueTask(() => {
        if (lastSelected !== null) thumbnails.get(lastSelected)?.focus();
      });
    };

    let expand = () => {
      expanded = true;
      handle.update();
      handle.queueTask(() => thumbnails.get(PREVIEW_COUNT)?.focus());
    };

    return () => {
      let { photos } = handle.props;
      let collapsed = !expanded && photos.length > PREVIEW_COUNT;
      let visible = collapsed ? photos.slice(0, PREVIEW_COUNT) : photos;

      return (
        <div>
          <ul mix={gridStyle}>
            {visible.map((photo, index) => (
              <li key={photo.url}>
                <button
                  aria-haspopup="dialog"
                  aria-label={
                    photo.altText || `Photo ${index + 1} of ${photos.length}`
                  }
                  mix={[
                    tileStyle,
                    on("click", () => select(index)),
                    ref((node, signal) => {
                      thumbnails.set(index, node);
                      signal.addEventListener(
                        "abort",
                        () => thumbnails.delete(index),
                        { once: true },
                      );
                    }),
                  ]}
                  type="button"
                >
                  <img
                    alt=""
                    decoding="async"
                    draggable={false}
                    height={photo.height}
                    loading="lazy"
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 300px"
                    src={resizeShopifyImage(photo.url, 480)}
                    srcSet={THUMBNAIL_WIDTHS.map(
                      (width) =>
                        `${resizeShopifyImage(photo.url, width)} ${width}w`,
                    ).join(", ")}
                    width={photo.width}
                  />
                </button>
              </li>
            ))}
          </ul>
          {collapsed ? (
            <div mix={showAllRowStyle}>
              <button
                mix={[showAllButtonStyle, on("click", expand)]}
                type="button"
              >
                Show all {photos.length} photos
              </button>
            </div>
          ) : null}
          {selected === null ? null : (
            <PhotoViewer
              photo={photos[selected]}
              index={selected}
              count={photos.length}
              onClose={close}
              onStep={(delta) => select(selected! + delta)}
            />
          )}
        </div>
      );
    };
  },
);

function PhotoViewer(
  handle: Handle<{
    photo: Photo;
    index: number;
    count: number;
    onClose: () => void;
    onStep: (delta: number) => void;
  }>,
) {
  return () => {
    let { photo, index, count, onClose, onStep } = handle.props;

    return (
      <div
        aria-label="Photo viewer"
        aria-modal="true"
        role="dialog"
        tabindex={-1}
        mix={[
          scrimStyle,
          focusTrap(),
          on<HTMLDivElement, "click">("click", (event) => {
            if (event.target === event.currentTarget) onClose();
          }),
          on("keydown", (event) => {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            if (event.key === "Escape") {
              event.preventDefault();
              onClose();
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              onStep(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              onStep(1);
            }
          }),
          ref((node, signal) => {
            let unlock = lockScroll();
            signal.addEventListener("abort", unlock, { once: true });
            node.querySelector("button")?.focus();
          }),
        ]}
      >
        <div
          mix={[jam2026WindowSurfaceStyle, viewerWindowStyle]}
          style={{ "--photo-ratio": String(photo.width / photo.height) }}
        >
          <div mix={titleBarStyle}>
            <button
              aria-label="Close photo viewer"
              mix={[iconButtonStyle, on("click", onClose)]}
              type="button"
            >
              <Icon name="circle-x" />
            </button>
            <p mix={[jam2026WindowTitleStyle, css({ flex: "1 1 auto" })]}>
              {getPhotoFilename(photo, index)}
            </p>
            <button
              aria-label="Previous photo"
              mix={[iconButtonStyle, on("click", () => onStep(-1))]}
              type="button"
            >
              <Icon name="chevron-r" mix={css({ transform: "scaleX(-1)" })} />
            </button>
            <p
              aria-live="polite"
              mix={[
                jam2026WindowTitleStyle,
                css({
                  flex: "0 0 auto",
                  fontVariantNumeric: "tabular-nums",
                }),
              ]}
            >
              {index + 1} / {count}
            </p>
            <button
              aria-label="Next photo"
              mix={[iconButtonStyle, on("click", () => onStep(1))]}
              type="button"
            >
              <Icon name="chevron-r" />
            </button>
          </div>
          <div
            mix={viewerBodyStyle}
            // The thumbnail is already cached, so it stands in while the full
            // image loads instead of an empty frame.
            style={{
              backgroundImage: `url("${resizeShopifyImage(photo.url, 480)}")`,
            }}
          >
            <img
              alt={photo.altText || ""}
              draggable={false}
              height={photo.height}
              key={photo.url}
              src={resizeShopifyImage(photo.url, VIEWER_IMAGE_WIDTH)}
              width={photo.width}
            />
          </div>
        </div>
      </div>
    );
  };
}

// Column counts all divide PREVIEW_COUNT, so the preview always ends on a full
// row. Cells match the camera's 3:2 frame; only portrait shots are cropped.
let gridStyle = css({
  display: "grid",
  gap: "8px",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  listStyle: "none",
  margin: 0,
  padding: 0,
  [breakpointMedia.sm]: { gridTemplateColumns: "repeat(3, minmax(0, 1fr))" },
  [breakpointMedia.lg]: { gridTemplateColumns: "repeat(4, minmax(0, 1fr))" },
});

let tileStyle = css({
  appearance: "none",
  aspectRatio: "3 / 2",
  background: jamTheme.inkWash,
  border: 0,
  borderRadius: "0.25rem",
  cursor: "zoom-in",
  display: "block",
  outline: "none",
  overflow: "hidden",
  padding: 0,
  position: "relative",
  width: "100%",
  "& img": {
    display: "block",
    height: "100%",
    inset: 0,
    objectFit: "cover",
    position: "absolute",
    // Portrait crops favor the upper frame, where faces usually are.
    objectPosition: "50% 30%",
    transition: "transform 300ms cubic-bezier(0.22, 1.5, 0.36, 1)",
    userSelect: "none",
    width: "100%",
  },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
  "&:is(:hover, :focus-visible) img": {
    transform: "scale(1.04)",
  },
  "@media (prefers-reduced-motion: reduce)": {
    "& img": { transition: "none" },
    "&:is(:hover, :focus-visible) img": { transform: "none" },
  },
});

let showAllRowStyle = css({
  display: "flex",
  justifyContent: "center",
  marginBlockStart: "16px",
});

let showAllButtonStyle = css({
  appearance: "none",
  backgroundColor: jamTheme.surfaceRaised,
  border: `1px solid ${jamTheme.borderDefault}`,
  borderRadius: "6px",
  color: jamTheme.ink,
  cursor: "pointer",
  fontFamily: theme.fontFamily.mono,
  fontSize: "11px",
  fontWeight: theme.fontWeight.bold,
  letterSpacing: "0.06em",
  lineHeight: 1,
  padding: "12px 16px",
  textTransform: "uppercase",
  transition: "background-color 160ms ease",
  "&:hover": { backgroundColor: jamTheme.surfaceRaisedHover },
  "&:focus-visible": {
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "2px",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

// Matches the tickets modal scrim.
let scrimStyle = css({
  alignItems: "center",
  background: "rgb(0 0 0 / 0.85)",
  display: "flex",
  inset: 0,
  justifyContent: "center",
  padding: "12px",
  position: "fixed",
  zIndex: 60,
  [breakpointMedia.md]: { padding: "32px" },
});

// Sized to the photo so portrait shots and small screens don't float in an
// empty frame. The subtracted height covers the scrim padding, the window
// padding, and the title bar.
let viewerWindowStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  width: "min(100%, 1200px, calc((100svh - 76px) * var(--photo-ratio) + 16px))",
  [breakpointMedia.md]: {
    width:
      "min(100%, 1200px, calc((100svh - 116px) * var(--photo-ratio) + 16px))",
  },
});

let titleBarStyle = css({
  alignItems: "center",
  display: "flex",
  gap: "6px",
  minWidth: 0,
});

let iconButtonStyle = css({
  alignItems: "center",
  background: "transparent",
  border: 0,
  borderRadius: theme.radius.full,
  color: jamTheme.ink,
  cursor: "pointer",
  display: "inline-flex",
  flex: "0 0 auto",
  height: "28px",
  justifyContent: "center",
  outline: "none",
  padding: 0,
  transition: "opacity 140ms ease",
  width: "28px",
  "& svg": { display: "block", height: "12px", width: "12px" },
  "&:hover": { opacity: 0.7 },
  "&:focus-visible": {
    color: jamTheme.brandRed,
    outline: `2px solid ${jamTheme.brandRed}`,
    outlineOffset: "-2px",
  },
  "@media (prefers-reduced-motion: reduce)": { transition: "none" },
});

let viewerBodyStyle = css({
  aspectRatio: "var(--photo-ratio)",
  backgroundColor: jamTheme.inkWash,
  backgroundPosition: "center",
  backgroundSize: "cover",
  borderRadius: "0.25rem",
  overflow: "hidden",
  width: "100%",
  "& img": {
    display: "block",
    height: "100%",
    objectFit: "contain",
    userSelect: "none",
    width: "100%",
  },
});
