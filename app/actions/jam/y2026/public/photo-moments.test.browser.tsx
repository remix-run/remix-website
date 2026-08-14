import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { Jam2026PhotoMoments } from "./photo-moments.tsx";

describe("Jam2026PhotoMoments", () => {
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

  it("links the racing shirt photo to the shop without dragging", async (t) => {
    let result = render(
      <Jam2026PhotoMoments popInBaseDelay={0} popInStagger={0} />,
    );
    t.after(result.cleanup);

    let shirtWindow = getPhotoWindow(result.container, "hero-racing-shirt");
    let shirtLink = shirtWindow.querySelector("a");

    expect(shirtLink?.getAttribute("href")).toBe(
      "https://shop.remix.run/products/remix-tee?discount=START_YOUR_ENGINES",
    );
    expect(shirtLink?.getAttribute("target")).toBe(null);
    expect(shirtLink?.getAttribute("aria-label")).toBe("Shop Remix tee");

    await result.act(() => {
      shirtWindow.dispatchEvent(pointerEvent("pointerdown", 100, 100));
      shirtWindow.dispatchEvent(pointerEvent("pointermove", 140, 160));
      shirtWindow.dispatchEvent(pointerEvent("pointerup", 140, 160));
    });

    shirtWindow = getPhotoWindow(result.container, "hero-racing-shirt");
    expect(shirtWindow.style.transform).toBe("translate(0px, 0px)");
    expect(shirtWindow.getAttribute("data-dragging")).toBe(null);
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
