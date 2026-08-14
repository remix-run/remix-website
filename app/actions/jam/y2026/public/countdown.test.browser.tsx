import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { render } from "remix/ui/test";

import { Jam2026Countdown } from "./countdown.tsx";

describe("Jam2026Countdown", () => {
  it("starts at zero with a stable accessible event label", () => {
    let result = render(<Jam2026Countdown />);

    expect(countdownValues(result.container)).toEqual([
      "000",
      "00",
      "00",
      "00",
    ]);
    expect(
      result.container
        .querySelector("[aria-label]")
        ?.getAttribute("aria-label"),
    ).toBe("Remix Jam starts October 2, 2026 at 9:00 AM Eastern time");

    result.cleanup();
  });

  it("finishes the intro deterministically and continues ticking live", async (t) => {
    let now = new Date("2026-10-01T09:00:00-04:00").getTime();
    let originalDateNow = Date.now;
    Date.now = () => now;
    t.after(() => {
      Date.now = originalDateNow;
    });
    t.after(mockMatchMedia(false));
    let timers = installControlledIntervals(t);
    let result = render(<Jam2026Countdown />);
    t.after(result.cleanup);
    await result.act(() => {});

    for (let tick = 0; tick < 9; tick++) {
      await result.act(() => timers.advance(150));
    }
    expect(countdownValues(result.container)).toEqual([
      "001",
      "00",
      "00",
      "00",
    ]);

    now += 1_000;
    await result.act(() => timers.advance(1_000));
    expect(countdownValues(result.container)).toEqual([
      "000",
      "23",
      "59",
      "59",
    ]);
  });

  it("skips the intro for reduced motion", async (t) => {
    let originalDateNow = Date.now;
    Date.now = () => new Date("2026-10-01T09:00:00-04:00").getTime();
    t.after(() => {
      Date.now = originalDateNow;
    });
    t.after(mockMatchMedia(true));
    let result = render(<Jam2026Countdown />);
    t.after(result.cleanup);

    await result.act(() => {});

    expect(countdownValues(result.container)).toEqual([
      "001",
      "00",
      "00",
      "00",
    ]);
  });
});

function countdownValues(container: HTMLElement) {
  return [...container.querySelectorAll("[data-countdown-number]")].map(
    (element) => element.textContent,
  );
}

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

function installControlledIntervals(t: { after(cleanup: () => void): void }) {
  let originalSetInterval = window.setInterval;
  let originalClearInterval = window.clearInterval;
  let nextId = 1;
  let intervals = new Map<number, { handler: TimerHandler; timeout: number }>();

  window.setInterval = ((handler: TimerHandler, timeout = 0) => {
    let id = nextId++;
    intervals.set(id, { handler, timeout });
    return id;
  }) as typeof window.setInterval;
  window.clearInterval = ((id?: number) => {
    if (id !== undefined) intervals.delete(id);
  }) as typeof window.clearInterval;

  t.after(() => {
    window.setInterval = originalSetInterval;
    window.clearInterval = originalClearInterval;
  });

  return {
    advance(timeout: number) {
      for (let interval of intervals.values()) {
        if (
          interval.timeout === timeout &&
          typeof interval.handler === "function"
        ) {
          interval.handler();
        }
      }
    },
  };
}
