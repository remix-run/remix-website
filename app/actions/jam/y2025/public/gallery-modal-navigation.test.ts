import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import {
  getGalleryKeyAction,
  getGalleryPhotoIndex,
  getTabTrapTarget,
  isPlainPrimaryClick,
  wrapPhotoIndex,
} from "./gallery-modal-navigation.ts";

let noModifiers = { metaKey: false, ctrlKey: false, altKey: false };

describe("getGalleryKeyAction", () => {
  it("maps gallery keys to actions", () => {
    expect(getGalleryKeyAction({ key: "Tab", ...noModifiers })).toBe(
      "trap-focus",
    );
    expect(getGalleryKeyAction({ key: "Escape", ...noModifiers })).toBe(
      "close",
    );
    expect(getGalleryKeyAction({ key: "ArrowLeft", ...noModifiers })).toBe(
      "previous",
    );
    expect(getGalleryKeyAction({ key: "ArrowRight", ...noModifiers })).toBe(
      "next",
    );
    expect(getGalleryKeyAction({ key: "ArrowDown", ...noModifiers })).toBe(
      "block-scroll",
    );
    expect(getGalleryKeyAction({ key: "a", ...noModifiers })).toBe(null);
  });

  it("leaves modified arrow keys to the browser but still traps Tab and Escape", () => {
    let meta = { ...noModifiers, metaKey: true };
    expect(getGalleryKeyAction({ key: "ArrowRight", ...meta })).toBe(null);
    expect(
      getGalleryKeyAction({ key: "ArrowUp", ...noModifiers, altKey: true }),
    ).toBe(null);
    expect(getGalleryKeyAction({ key: "Tab", ...meta })).toBe("trap-focus");
    expect(getGalleryKeyAction({ key: "Escape", ...meta })).toBe("close");
  });
});

describe("getGalleryPhotoIndex", () => {
  let closeHref = "/jam/2025/gallery";

  it("reads the photo index from the gallery URL", () => {
    expect(
      getGalleryPhotoIndex(
        "https://remix.run/jam/2025/gallery?photo=2",
        closeHref,
        3,
      ),
    ).toBe(2);
  });

  it("falls back to the first photo for invalid input", () => {
    let origin = "https://remix.run";
    expect(
      getGalleryPhotoIndex(`${origin}/jam/2025/gallery?photo=3`, closeHref, 3),
    ).toBe(0);
    expect(
      getGalleryPhotoIndex(`${origin}/jam/2025/gallery?photo=-1`, closeHref, 3),
    ).toBe(0);
    expect(
      getGalleryPhotoIndex(`${origin}/jam/2025/gallery?photo=x`, closeHref, 3),
    ).toBe(0);
    expect(getGalleryPhotoIndex(`${origin}/blog?photo=1`, closeHref, 3)).toBe(
      0,
    );
    expect(getGalleryPhotoIndex("not a url", closeHref, 3)).toBe(0);
    expect(
      getGalleryPhotoIndex(`${origin}/jam/2025/gallery?photo=1`, closeHref, 0),
    ).toBe(0);
  });
});

describe("wrapPhotoIndex", () => {
  it("wraps around both ends", () => {
    expect(wrapPhotoIndex(0, -1, 3)).toBe(2);
    expect(wrapPhotoIndex(2, 1, 3)).toBe(0);
    expect(wrapPhotoIndex(1, 1, 3)).toBe(2);
  });
});

describe("getTabTrapTarget", () => {
  let host = "host";
  let focusableElements = ["first", "middle", "last"];

  it("pulls focus back in from outside the modal", () => {
    let outside = {
      host,
      focusableElements,
      activeElement: "outside",
      hostContainsActive: false,
    };
    expect(getTabTrapTarget({ ...outside, shiftKey: false })).toBe("first");
    expect(getTabTrapTarget({ ...outside, shiftKey: true })).toBe("last");
  });

  it("wraps at the boundaries and otherwise lets Tab move normally", () => {
    let inside = { host, focusableElements, hostContainsActive: true };
    expect(
      getTabTrapTarget({ ...inside, activeElement: "last", shiftKey: false }),
    ).toBe("first");
    expect(
      getTabTrapTarget({ ...inside, activeElement: "first", shiftKey: true }),
    ).toBe("last");
    expect(
      getTabTrapTarget({ ...inside, activeElement: "middle", shiftKey: false }),
    ).toBe(null);
  });

  it("keeps focus on the host when nothing inside is focusable", () => {
    expect(
      getTabTrapTarget({
        host,
        focusableElements: [],
        activeElement: host,
        hostContainsActive: true,
        shiftKey: false,
      }),
    ).toBe(host);
  });
});

describe("isPlainPrimaryClick", () => {
  let plain = {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
  };

  it("accepts only unmodified, unhandled primary clicks", () => {
    expect(isPlainPrimaryClick(plain)).toBe(true);
    expect(isPlainPrimaryClick({ ...plain, button: 1 })).toBe(false);
    expect(isPlainPrimaryClick({ ...plain, metaKey: true })).toBe(false);
    expect(isPlainPrimaryClick({ ...plain, shiftKey: true })).toBe(false);
    expect(isPlainPrimaryClick({ ...plain, defaultPrevented: true })).toBe(
      false,
    );
  });
});
