import { css, type Handle } from "remix/component";
import { breakpointMedia } from "../../../ui/public/theme.ts";
import { Jam2026PhotoDeck } from "./public/photo-deck.tsx";
import { getPhotoFilename, type Photo } from "./public/shopify-photo.ts";

const MAX_TILT_DEGREES = 3;

export function Jam2026Photos(handle: Handle<{ photos: Photo[] }>) {
  return () => {
    let { photos } = handle.props;
    if (photos.length === 0) return null;

    return (
      <section id="photos" aria-label="Photos" mix={sectionStyle}>
        <Jam2026PhotoDeck
          cards={photos.map((photo, index) => {
            let filename = getPhotoFilename(photo, index);
            return { ...photo, filename, tilt: getTilt(filename) };
          })}
        />
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
