import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { JamGalleryModalHost } from "./gallery-modal-host.tsx";

describe("JamGalleryModalHost", () => {
  it("locks document scrolling while mounted", async (t) => {
    let documentElement = document.documentElement;
    let previousOverflow = documentElement.style.overflow;
    let previousScrollbarGutter = documentElement.style.scrollbarGutter;

    t.after(() => {
      documentElement.style.overflow = previousOverflow;
      documentElement.style.scrollbarGutter = previousScrollbarGutter;
    });

    let result = render(
      <JamGalleryModalHost
        photoCount={1}
        nav={{
          closeHref: "/jam/2025/gallery",
          previousHref: "/jam/2025/gallery?photo=0",
          nextHref: "/jam/2025/gallery?photo=0",
        }}
      >
        <a href="/jam/2025/gallery">Close modal</a>
      </JamGalleryModalHost>,
    );
    let cleanedUp = false;
    t.after(() => {
      if (!cleanedUp) result.cleanup();
    });

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(documentElement.style.overflow).toBe("hidden");

    result.cleanup();
    cleanedUp = true;

    expect(documentElement.style.overflow).toBe(previousOverflow);
    expect(documentElement.style.scrollbarGutter).toBe(previousScrollbarGutter);
  });
});
