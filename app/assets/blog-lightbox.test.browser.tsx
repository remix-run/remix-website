import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { BlogLightbox } from "./blog-lightbox.tsx";

describe("BlogLightbox", () => {
  it("locks document scrolling while the image preview is open", async (t) => {
    let documentElement = document.documentElement;
    let previousOverflow = documentElement.style.overflow;
    let previousScrollbarGutter = documentElement.style.scrollbarGutter;

    t.after(() => {
      documentElement.style.overflow = previousOverflow;
      documentElement.style.scrollbarGutter = previousScrollbarGutter;
    });

    let result = render(
      <div>
        <article class="md-prose">
          <img src="/favicon.svg" alt="Remix logo" />
        </article>
        <BlogLightbox />
      </div>,
    );
    t.after(result.cleanup);

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    let image =
      result.container.querySelector<HTMLImageElement>(".md-prose img")!;

    await result.act(() => image.click());

    expect(documentElement.style.overflow).toBe("hidden");
    expect(
      result.container
        .querySelector<HTMLDivElement>('[role="dialog"]')
        ?.hasAttribute("hidden"),
    ).toBe(false);

    await result.act(() => {
      result.container
        .querySelector<HTMLButtonElement>('[aria-label="Close image preview"]')!
        .click();
    });

    expect(documentElement.style.overflow).toBe(previousOverflow);
    expect(documentElement.style.scrollbarGutter).toBe(previousScrollbarGutter);
  });
});
