import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { render } from "remix/ui/test";

import { Jam2026Countdown } from "./countdown.tsx";

describe("Jam2026Countdown", () => {
  function mockMatchMedia(matches: boolean) {
    let originalMatchMedia = window.matchMedia;
    window.matchMedia = (query) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      }) as MediaQueryList;

    return () => {
      window.matchMedia = originalMatchMedia;
    };
  }

  function mockIntroIntervals(t: { after(cleanup: () => void): void }) {
    let originalSetInterval = window.setInterval;
    let originalClearInterval = window.clearInterval;
    let nextIntervalId = 1;

    window.setInterval = ((handler: TimerHandler, timeout?: number) => {
      let intervalId = nextIntervalId++;
      if (typeof handler === "function" && timeout === 150) {
        for (let tick = 0; tick < 8; tick++) handler();
      }
      return intervalId;
    }) as typeof window.setInterval;
    window.clearInterval = (() => {}) as typeof window.clearInterval;

    t.after(() => {
      window.setInterval = originalSetInterval;
      window.clearInterval = originalClearInterval;
    });
  }

  it("renders a stable zeroed countdown before the intro animation starts", () => {
    let result = render(<Jam2026Countdown />);

    expect(result.container.textContent).toContain("000days");
    expect(result.container.textContent).toContain("00hrs");
    expect(result.container.textContent).toContain("00min");
    expect(result.container.textContent).toContain("00sec");
    expect(result.container.textContent).toContain("remaining");

    result.cleanup();
  });

  it("reaches the live countdown after the intro animation", async (t) => {
    let originalDateNow = Date.now;
    Date.now = () => new Date("2026-10-01T09:00:00-04:00").getTime();
    t.after(() => {
      Date.now = originalDateNow;
    });
    t.after(mockMatchMedia(false));
    mockIntroIntervals(t);

    let result = render(<Jam2026Countdown />);
    t.after(result.cleanup);

    await result.act(() => {});

    expect(result.container.textContent).toContain("001days");
    expect(result.container.textContent).toContain("00hrs");
    expect(result.container.textContent).toContain("00min");
    expect(result.container.textContent).toContain("00sec");
  });

  it("renders the live countdown immediately for reduced motion", async (t) => {
    let originalDateNow = Date.now;
    Date.now = () => new Date("2026-10-01T09:00:00-04:00").getTime();
    t.after(() => {
      Date.now = originalDateNow;
    });
    t.after(mockMatchMedia(true));

    let result = render(<Jam2026Countdown />);
    t.after(result.cleanup);

    await result.act(() => {});

    expect(result.container.textContent).toContain("001days");
    expect(result.container.textContent).toContain("00hrs");
    expect(result.container.textContent).toContain("00min");
    expect(result.container.textContent).toContain("00sec");
  });
});
