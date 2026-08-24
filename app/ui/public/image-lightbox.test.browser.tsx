import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { ImageLightbox } from "./image-lightbox.tsx";

describe("ImageLightbox", () => {
  it("opens from the keyboard, traps page scroll, and restores focus on Escape", async (t) => {
    let root = document.documentElement;
    let previousOverflow = root.style.overflow;
    let previousScrollbarGutter = root.style.scrollbarGutter;
    t.after(() => {
      root.style.overflow = previousOverflow;
      root.style.scrollbarGutter = previousScrollbarGutter;
    });

    let result = render(
      <div>
        <article class="md-prose">
          <img
            src="/favicon.svg"
            data-full-src="/full-remix-logo.svg"
            alt="Remix logo"
          />
        </article>
        <ImageLightbox />
      </div>,
    );
    t.after(result.cleanup);
    await result.act(() => {});

    let trigger =
      result.container.querySelector<HTMLImageElement>(".md-prose img")!;
    trigger.focus();
    await result.act(() => {
      trigger.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Enter",
        }),
      );
    });

    let dialog =
      result.container.querySelector<HTMLDivElement>('[role="dialog"]')!;
    let preview = dialog.querySelector("img")!;
    let close = dialog.querySelector<HTMLButtonElement>(
      '[aria-label="Close image preview"]',
    )!;
    expect(dialog.hidden).toBe(false);
    expect(preview.src).toMatch(/\/full-remix-logo\.svg$/);
    expect(preview.alt).toBe("Remix logo");
    expect(document.activeElement).toBe(close);
    expect(root.style.overflow).toBe("hidden");

    await result.act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Escape",
        }),
      );
    });

    expect(dialog.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
    expect(root.style.overflow).toBe(previousOverflow);
    expect(root.style.scrollbarGutter).toBe(previousScrollbarGutter);
  });
});
