import { describe, it } from "remix/test";
import { expect } from "remix/assert";
import { render } from "remix/component/test";

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
    // The 9-tick intro takes 1,350ms, so it lands half a second before the
    // countdown reaches one day.
    let timers = t.useFakeTimers({
      now: new Date("2026-10-01T08:59:58.150-04:00"),
    });
    t.after(mockMatchMedia(false));
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

    await result.act(() => timers.advance(1_000));
    expect(countdownValues(result.container)).toEqual([
      "000",
      "23",
      "59",
      "59",
    ]);
  });

  it("skips the intro for reduced motion", async (t) => {
    t.useFakeTimers({ now: new Date("2026-10-01T09:00:00-04:00") });
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
  return [...container.querySelectorAll("strong")].map(
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
