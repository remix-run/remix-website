import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { getBlogImageAsset } from "./blog-image-assets.ts";

describe("Blog image assets", () => {
  it("falls back to the original source when optimization fails", async (t) => {
    t.mock.method(console, "error", () => {});
    let source = "/blog-images/does-not-exist.png";

    expect(await getBlogImageAsset(source)).toEqual({ src: source });
  });
});
