import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { render } from "remix/ui/test";

import { Jam2026Countdown } from "./countdown.tsx";

describe("Jam2026Countdown", () => {
  it("renders a stable zeroed countdown before the intro animation starts", () => {
    let result = render(<Jam2026Countdown />);

    expect(result.container.textContent).toContain("000days");
    expect(result.container.textContent).toContain("00hrs");
    expect(result.container.textContent).toContain("00min");
    expect(result.container.textContent).toContain("00sec");
    expect(result.container.textContent).toContain("remaining");

    result.cleanup();
  });

  it("renders the live countdown immediately for reduced motion", async (t) => {
    let originalDateNow = Date.now;
    let originalMatchMedia = window.matchMedia;
    Date.now = () => new Date("2026-09-30T09:00:00-04:00").getTime();
    window.matchMedia = (query) =>
      ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
    t.after(() => {
      Date.now = originalDateNow;
      window.matchMedia = originalMatchMedia;
    });

    let result = render(<Jam2026Countdown />);
    t.after(result.cleanup);

    await result.act(() => {});

    expect(result.container.textContent).toContain("001days");
    expect(result.container.textContent).toContain("00hrs");
    expect(result.container.textContent).toContain("00min");
    expect(result.container.textContent).toContain("00sec");
  });
});
