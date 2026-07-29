import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { Jam2026PhotoMoments } from "./photo-moments.tsx";

describe("Jam2026PhotoMoments", () => {
  it("pops in the photo windows after hydration", async (t) => {
    let result = render(
      <Jam2026PhotoMoments popInBaseDelay={0} popInStagger={0} />,
    );
    t.after(result.cleanup);

    expect(getComputedStyle(getPhotoSurface(result.container)).opacity).toBe(
      "0",
    );

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 420)));

    expect(getComputedStyle(getPhotoSurface(result.container)).opacity).toBe(
      "1",
    );
  });

  it("drags windows and keeps their dropped position", async (t) => {
    let result = render(
      <Jam2026PhotoMoments popInBaseDelay={0} popInStagger={0} />,
    );
    t.after(result.cleanup);

    let firstWindow = getPhotoWindow(result.container, "hero-toronto");

    await result.act(() => {
      firstWindow.dispatchEvent(pointerEvent("pointerdown", 100, 100));
      firstWindow.dispatchEvent(pointerEvent("pointermove", 132, 148));
      firstWindow.dispatchEvent(pointerEvent("pointerup", 132, 148));
    });

    firstWindow = getPhotoWindow(result.container, "hero-toronto");
    expect(firstWindow.style.transform).toBe("translate(32px, 48px)");
  });

  it("closes windows with Escape and moves focus to the next close button", async (t) => {
    let result = render(
      <Jam2026PhotoMoments popInBaseDelay={0} popInStagger={0} />,
    );
    t.after(result.cleanup);

    let firstWindow = getPhotoWindow(result.container, "hero-toronto");
    let firstClose = firstWindow.querySelector("button")!;

    firstClose.focus();
    await result.act(() => {
      firstWindow.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    });

    expect(
      result.container.querySelector('[data-photo-window-id="hero-toronto"]'),
    ).toBe(null);

    let nextWindow = getPhotoWindow(result.container, "hero-shoppy");
    expect(document.activeElement).toBe(nextWindow.querySelector("button"));
  });

  it("does not move focus to the next close button after a mouse close", async (t) => {
    let result = render(
      <Jam2026PhotoMoments popInBaseDelay={0} popInStagger={0} />,
    );
    t.after(result.cleanup);

    let firstWindow = getPhotoWindow(result.container, "hero-toronto");
    let firstClose = firstWindow.querySelector("button")!;

    firstClose.focus();
    await result.act(() => {
      firstClose.dispatchEvent(
        new MouseEvent("click", { bubbles: true, detail: 1 }),
      );
    });

    expect(
      result.container.querySelector('[data-photo-window-id="hero-toronto"]'),
    ).toBe(null);

    let nextWindow = getPhotoWindow(result.container, "hero-shoppy");
    expect(document.activeElement).not.toBe(nextWindow.querySelector("button"));
  });
});

function getPhotoWindow(container: HTMLElement, id: string) {
  let photoWindow = container.querySelector<HTMLElement>(
    `[data-photo-window-id="${id}"]`,
  );
  if (!photoWindow) {
    throw new Error(`Unable to find photo window: ${id}`);
  }
  return photoWindow;
}

function getPhotoSurface(container: HTMLElement) {
  return getPhotoWindow(container, "hero-toronto").firstElementChild!;
}

function pointerEvent(type: string, clientX: number, clientY: number) {
  return new PointerEvent(type, {
    bubbles: true,
    button: 0,
    clientX,
    clientY,
    isPrimary: true,
    pointerId: 1,
    pointerType: "mouse",
  });
}
