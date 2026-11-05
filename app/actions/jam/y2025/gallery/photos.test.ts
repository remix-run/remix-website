import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { getSelectedPhotoIndex, transformShopifyImageUrl } from "./photos.ts";

describe("getSelectedPhotoIndex", () => {
  it("accepts indexes within the gallery", () => {
    expect(getSelectedPhotoIndex("0", 3)).toBe(0);
    expect(getSelectedPhotoIndex("2", 3)).toBe(2);
  });

  it("returns null for missing, non-numeric, and out-of-range values", () => {
    expect(getSelectedPhotoIndex(null, 3)).toBe(null);
    expect(getSelectedPhotoIndex("", 3)).toBe(null);
    expect(getSelectedPhotoIndex("photo", 3)).toBe(null);
    expect(getSelectedPhotoIndex("-1", 3)).toBe(null);
    expect(getSelectedPhotoIndex("3", 3)).toBe(null);
  });
});

describe("transformShopifyImageUrl", () => {
  it("adds sizing params while keeping existing ones", () => {
    let url = transformShopifyImageUrl(
      "https://cdn.shopify.com/photo.jpg?v=123",
      { width: 800, format: "webp", height: undefined },
    );

    let params = new URL(url).searchParams;
    expect(params.get("v")).toBe("123");
    expect(params.get("width")).toBe("800");
    expect(params.get("format")).toBe("webp");
    expect(params.has("height")).toBe(false);
  });

  it("returns unparseable URLs unchanged", () => {
    expect(transformShopifyImageUrl("not a url", { width: 800 })).toBe(
      "not a url",
    );
  });
});
