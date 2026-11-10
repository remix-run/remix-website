import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/component/test";

import { Jam2026PhotoGallery } from "./photo-gallery.tsx";

let photos = createPhotos(3);

describe("Jam2026PhotoGallery", () => {
  it("opens the viewer from a thumbnail and steps with the arrow keys, wrapping around", async (t) => {
    let result = render(<Jam2026PhotoGallery photos={photos} />);
    t.after(result.cleanup);

    expect(result.container.querySelector('[role="dialog"]')).toBe(null);

    await result.act(() => getThumbnail(result.container, 0).click());

    let dialog =
      result.container.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain("1 / 3");
    expect(dialog.querySelector("img")?.getAttribute("src")).toContain(
      "DSC01.jpg",
    );

    await result.act(() => pressKey(dialog, "ArrowLeft"));
    expect(dialog.textContent).toContain("3 / 3");
    expect(dialog.querySelector("img")?.getAttribute("src")).toContain(
      "DSC03.jpg",
    );

    await result.act(() => pressKey(dialog, "ArrowRight"));
    expect(dialog.textContent).toContain("1 / 3");
  });

  it("closes with Escape and returns focus to the thumbnail", async (t) => {
    let result = render(<Jam2026PhotoGallery photos={photos} />);
    t.after(result.cleanup);

    await result.act(() => getThumbnail(result.container, 1).click());
    let dialog =
      result.container.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog.textContent).toContain("2 / 3");

    await result.act(() => pressKey(dialog, "Escape"));

    expect(result.container.querySelector('[role="dialog"]')).toBe(null);
    expect(document.activeElement).toBe(getThumbnail(result.container, 1));
  });

  it("previews the first photos and reveals the rest on request", async (t) => {
    let result = render(<Jam2026PhotoGallery photos={createPhotos(14)} />);
    t.after(result.cleanup);

    expect(getThumbnails(result.container)).toHaveLength(12);

    await result.act(() =>
      getButton(result.container, "Show all 14 photos").click(),
    );

    expect(getThumbnails(result.container)).toHaveLength(14);
    expect(document.activeElement).toBe(getThumbnail(result.container, 12));
    expect(result.container.textContent).not.toContain("Show all");
  });

  it("reveals the rest when the viewer closes on a photo past the preview", async (t) => {
    let result = render(<Jam2026PhotoGallery photos={createPhotos(14)} />);
    t.after(result.cleanup);

    await result.act(() => getThumbnail(result.container, 0).click());
    let dialog =
      result.container.querySelector<HTMLElement>('[role="dialog"]')!;
    await result.act(() => pressKey(dialog, "ArrowLeft"));
    expect(dialog.textContent).toContain("14 / 14");

    await result.act(() => pressKey(dialog, "Escape"));

    expect(getThumbnails(result.container)).toHaveLength(14);
    expect(document.activeElement).toBe(getThumbnail(result.container, 13));
  });
});

function createPhotos(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    url: `https://cdn.shopify.com/files/DSC0${index + 1}.jpg`,
    width: 1200,
    height: 800,
  }));
}

function getThumbnails(container: HTMLElement) {
  return container.querySelectorAll<HTMLButtonElement>(
    "button[aria-haspopup='dialog']",
  );
}

function getButton(container: HTMLElement, text: string) {
  let button = [...container.querySelectorAll("button")].find(
    (node) => node.textContent?.trim() === text,
  );
  if (!button) throw new Error(`Unable to find button: ${text}`);
  return button;
}

function getThumbnail(container: HTMLElement, index: number) {
  let thumbnail = getThumbnails(container)[index];
  if (!thumbnail) throw new Error(`Unable to find thumbnail ${index}`);
  return thumbnail;
}

function pressKey(element: HTMLElement, key: string) {
  element.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));
}
