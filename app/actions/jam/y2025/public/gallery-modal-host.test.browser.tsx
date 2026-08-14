import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { routes } from "../../../../routes.ts";
import { JamGalleryModalHost } from "./gallery-modal-host.tsx";

describe("JamGalleryModalHost", () => {
  it("locks scroll, focuses close, and handles keyboard photo navigation", async (t) => {
    let root = document.documentElement;
    let previousOverflow = root.style.overflow;
    let previousScrollbarGutter = root.style.scrollbarGutter;
    let previousUrl = window.location.href;
    let navigation = window.navigation;
    let originalNavigate = navigation.navigate;
    let navigatedTo: string | undefined;
    let galleryHref = routes.jam.y2025.gallery.index.href();

    window.history.replaceState(null, "", `${galleryHref}?photo=0`);
    navigation.navigate = ((destination: string | URL) => {
      navigatedTo = String(destination);
      return {
        committed: Promise.resolve(navigation.currentEntry),
        finished: Promise.resolve(navigation.currentEntry),
      } as ReturnType<typeof navigation.navigate>;
    }) as typeof navigation.navigate;
    t.after(() => {
      navigation.navigate = originalNavigate;
      window.history.replaceState(null, "", previousUrl);
      root.style.overflow = previousOverflow;
      root.style.scrollbarGutter = previousScrollbarGutter;
    });

    let result = render(
      <JamGalleryModalHost
        photoCount={3}
        nav={{
          closeHref: galleryHref,
          previousHref: `${galleryHref}?photo=2`,
          nextHref: `${galleryHref}?photo=1`,
        }}
      >
        <a href={galleryHref}>Close modal</a>
        <a href={`${galleryHref}?photo=2`}>Previous photo</a>
        <a href={`${galleryHref}?photo=1`}>Next photo</a>
      </JamGalleryModalHost>,
    );
    t.after(result.cleanup);

    await result.act(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );

    expect(root.style.overflow).toBe("hidden");
    expect(document.activeElement?.textContent).toBe("Close modal");

    await result.act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "ArrowRight",
        }),
      );
    });
    let destination = new URL(navigatedTo!, window.location.origin);
    expect(destination.pathname + destination.search).toBe(
      `${galleryHref}?photo=1`,
    );
  });
});
