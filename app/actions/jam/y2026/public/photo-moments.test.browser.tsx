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

    let firstWindow = getPhotoWindow(result.container, "TORONTO-CN-TOWER.AVIF");

    await result.act(() => {
      firstWindow.dispatchEvent(pointerEvent("pointerdown", 100, 100));
      firstWindow.dispatchEvent(pointerEvent("pointermove", 132, 148));
      firstWindow.dispatchEvent(pointerEvent("pointerup", 132, 148));
    });

    firstWindow = getPhotoWindow(result.container, "TORONTO-CN-TOWER.AVIF");
    expect(firstWindow.style.transform).toBe("translate(32px, 48px)");
  });

  it("links the racing shirt photo to the shop without dragging", async (t) => {
    let result = render(
      <Jam2026PhotoMoments popInBaseDelay={0} popInStagger={0} />,
    );
    t.after(result.cleanup);

    let shirtWindow = getPhotoWindow(
      result.container,
      "REMIX-RACING-SHIRT.AVIF",
    );
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

    shirtWindow = getPhotoWindow(result.container, "REMIX-RACING-SHIRT.AVIF");
    expect(shirtWindow.style.transform).toBe("translate(0px, 0px)");
  });

  it("closes windows with Escape and moves focus to the next close button", async (t) => {
    let result = render(
      <Jam2026PhotoMoments popInBaseDelay={0} popInStagger={0} />,
    );
    t.after(result.cleanup);

    let firstWindow = getPhotoWindow(result.container, "TORONTO-CN-TOWER.AVIF");
    let firstClose = firstWindow.querySelector("button")!;

    firstClose.focus();
    await result.act(() => {
      firstWindow.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    });

    expect(
      result.container.querySelector(
        'button[aria-label="Close TORONTO-CN-TOWER.AVIF"]',
      ),
    ).toBe(null);

    let nextWindow = getPhotoWindow(
      result.container,
      "REMIX-JAM-2025-SHOPPY.AVIF",
    );
    expect(document.activeElement).toBe(nextWindow.querySelector("button"));
  });
});

function getPhotoWindow(container: HTMLElement, filename: string) {
  let photoWindow = container
    .querySelector(`button[aria-label="Close ${filename}"]`)
    ?.closest<HTMLElement>("article");
  if (!photoWindow) {
    throw new Error(`Unable to find photo window: ${filename}`);
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
