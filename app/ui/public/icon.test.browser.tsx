import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { Icon } from "./icon.tsx";

describe("Icon", () => {
  it("resolves the document sprite and stays decorative", (t) => {
    let previousSpriteHref = document.documentElement.dataset.remixIconsSprite;
    document.documentElement.dataset.remixIconsSprite =
      "/assets/app/ui/public/icons.test.svg";
    t.after(() => {
      if (previousSpriteHref == null) {
        delete document.documentElement.dataset.remixIconsSprite;
      } else {
        document.documentElement.dataset.remixIconsSprite = previousSpriteHref;
      }
    });

    let result = render(<Icon name="menu" class="size-5" />);
    t.after(result.cleanup);

    let svg = result.container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("focusable")).toBe("false");
    expect(svg.getAttribute("class")).toBe("size-5");
    expect(svg.querySelector("use")?.getAttribute("href")).toBe(
      "/assets/app/ui/public/icons.test.svg#menu",
    );
  });
});
