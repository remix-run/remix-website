import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { Icon } from "./icon.tsx";

describe("Icon", () => {
  it("references the inline sprite and stays decorative", (t) => {
    let result = render(<Icon name="menu" />);
    t.after(result.cleanup);

    let svg = result.container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("focusable")).toBe("false");
    expect(svg.querySelector("use")?.getAttribute("href")).toBe("#menu");
  });
});
