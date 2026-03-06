import { describe, expect, it } from "vitest";
import {
  getSelectedPhotoIndex,
  isJamGalleryPhotoNavigation,
} from "./jam-gallery-navigation";

describe("jam gallery navigation helpers", () => {
  it("detects same-path gallery photo transitions", () => {
    let currentUrl = new URL("https://remix.run/jam/2025/gallery?photo=0");
    let nextUrl = new URL("https://remix.run/jam/2025/gallery?photo=1");

    expect(isJamGalleryPhotoNavigation(currentUrl, nextUrl)).toBe(true);
  });

  it("ignores gallery transitions that change other search params", () => {
    let currentUrl = new URL("https://remix.run/jam/2025/gallery?photo=0");
    let nextUrl = new URL("https://remix.run/jam/2025/gallery?photo=1&view=all");

    expect(isJamGalleryPhotoNavigation(currentUrl, nextUrl)).toBe(false);
  });

  it("parses valid photo indexes", () => {
    expect(getSelectedPhotoIndex("2", 5)).toBe(2);
    expect(getSelectedPhotoIndex(null, 5)).toBe(null);
    expect(getSelectedPhotoIndex("9", 5)).toBe(null);
  });
});
