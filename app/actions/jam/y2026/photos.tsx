import { css, type Handle } from "remix/component";
import { breakpointMedia } from "../../../ui/public/theme.ts";
import { Jam2026PhotoDeck } from "./public/photo-deck.tsx";
import type { PhotoCard } from "./public/shopify-photo.ts";

export function Jam2026Photos(
  handle: Handle<{ photos: PhotoCard[]; dealt?: boolean }>,
) {
  return () => {
    let { photos } = handle.props;
    if (photos.length === 0) return null;

    return (
      <section id="photos" aria-label="Photos" mix={sectionStyle}>
        <Jam2026PhotoDeck cards={photos} initiallyDealt={handle.props.dealt} />
      </section>
    );
  };
}

// Directly under the hero, whose bottom padding is the gap above.
let sectionStyle = css({
  position: "relative",
  padding: "0 16px",
  scrollMarginBlockStart: "48px",
  [breakpointMedia.sm]: {
    paddingInline: "max(24px, 3.2vw)",
  },
});
