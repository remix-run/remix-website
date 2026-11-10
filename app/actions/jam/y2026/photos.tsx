import { css, type Handle } from "remix/component";
import { breakpointMedia } from "../../../ui/public/theme.ts";
import { Jam2026PhotoDeck } from "./public/photo-deck.tsx";
import {
  getPhotoFilename,
  getPhotoSlug,
  getPhotoTilt,
  type Photo,
} from "./public/shopify-photo.ts";

export function Jam2026Photos(
  handle: Handle<{ photos: Photo[]; dealt?: boolean }>,
) {
  return () => {
    let { photos } = handle.props;
    if (photos.length === 0) return null;

    return (
      <section id="photos" aria-label="Photos" mix={sectionStyle}>
        <Jam2026PhotoDeck
          cards={photos.map((photo, index) => {
            let filename = getPhotoFilename(photo, index);
            return {
              ...photo,
              filename,
              slug: getPhotoSlug(filename),
              tilt: getPhotoTilt(filename),
            };
          })}
          initiallyDealt={handle.props.dealt}
        />
      </section>
    );
  };
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
