import { css, type Handle } from "remix/component";
import { breakpointMedia } from "../../../ui/public/theme.ts";
import {
  getPhotoFilename,
  resizeShopifyImage,
  type Photo,
} from "./public/shopify-photo.ts";
import { jamTheme } from "./public/theme.ts";
import {
  jam2026WindowSurfaceStyle,
  jam2026WindowTitleStyle,
} from "./public/window-styles.ts";

const THUMBNAIL_WIDTHS = [320, 480, 640];
const MAX_TILT_DEGREES = 3;

export function Jam2026Photos(handle: Handle<{ photos: Photo[] }>) {
  return () => {
    let { photos } = handle.props;
    if (photos.length === 0) return null;

    return (
      <section id="photos" aria-label="Photos" mix={sectionStyle}>
        <ul mix={gridStyle}>
          {photos.map((photo, index) => {
            let filename = getPhotoFilename(photo, index);

            return (
              <li
                key={photo.url}
                mix={cellStyle}
                style={{
                  "--photo-ratio": String(photo.width / photo.height),
                  "--photo-tilt": `${getTilt(filename)}deg`,
                }}
              >
                <div mix={[jam2026WindowSurfaceStyle, cardStyle]}>
                  <p aria-hidden="true" mix={jam2026WindowTitleStyle}>
                    {filename}
                  </p>
                  <div mix={imageFrameStyle}>
                    <img
                      alt={
                        photo.altText ||
                        `Remix Jam 2026 photo ${index + 1} of ${photos.length}`
                      }
                      decoding="async"
                      draggable={false}
                      height={photo.height}
                      loading="lazy"
                      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 280px"
                      src={resizeShopifyImage(photo.url, 480)}
                      srcSet={THUMBNAIL_WIDTHS.map(
                        (width) =>
                          `${resizeShopifyImage(photo.url, width)} ${width}w`,
                      ).join(", ")}
                      width={photo.width}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );
  };
}

/**
 * Tilts each card by a hash of its filename, so a photo keeps its angle across
 * renders and reorderings without any client-side randomness.
 */
function getTilt(filename: string) {
  // FNV-1a, seeded so the spread can be reshuffled by changing the seed.
  let hash = 0x811c9dc5;
  for (let char of `remix-jam-2026:${filename}`) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193);
  }
  let unit = (hash >>> 0) / 0xffffffff;
  return Math.round((unit * 2 - 1) * MAX_TILT_DEGREES * 10) / 10;
}

let sectionStyle = css({
  position: "relative",
  padding: "72px 16px 0",
  scrollMarginBlockStart: "48px",
  [breakpointMedia.sm]: {
    paddingInline: "max(24px, 3.2vw)",
  },
  [breakpointMedia.lg]: {
    paddingBlockStart: "40px",
  },
  [breakpointMedia.xl]: {
    paddingBlockStart: "144px",
  },
});

let gridStyle = css({
  display: "grid",
  gap: "24px 16px",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  alignItems: "center",
  justifyItems: "center",
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: 0,
  listStyle: "none",
  [breakpointMedia.sm]: {
    gap: "40px 32px",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  },
  [breakpointMedia.lg]: {
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  },
  // Wider than the 1200px windows so five columns keep the four-column card size.
  [breakpointMedia["2xl"]]: {
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    maxWidth: "1600px",
  },
});

// Landscape cards span the cell; portrait cards share the same long edge, so
// every photo prints at one size, like a stack of Polaroids.
let cellStyle = css({
  position: "relative",
  width: "calc(100% * min(1, var(--photo-ratio)))",
  "&:hover": { zIndex: 1 },
});

let cardStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  transform: "rotate(var(--photo-tilt))",
  transition:
    "transform 350ms cubic-bezier(0.22, 1.5, 0.36, 1), box-shadow 350ms cubic-bezier(0.22, 1.5, 0.36, 1)",
  // The photo moments' hover nudge, applied on top of each card's own tilt.
  ":is(li:hover) > &": {
    transform: "rotate(calc(var(--photo-tilt) - 2deg))",
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
    // Lift instead of turn: the photo moments' drag shadow, without motion.
    ":is(li:hover) > &": {
      transform: "rotate(var(--photo-tilt))",
      boxShadow:
        "0 2px 4px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.24)), 0 8px 16px light-dark(rgb(8 40 69 / 0.07), rgb(0 0 0 / 0.28)), 0 20px 36px light-dark(rgb(8 40 69 / 0.08), rgb(0 0 0 / 0.32)), 0 40px 72px light-dark(rgb(8 40 69 / 0.1), rgb(0 0 0 / 0.38))",
    },
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
