import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { LandingNav } from "./components/landing-nav.tsx";
import { listenForKonamiCode } from "./konami-code.ts";

const code = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
  "Enter",
];

describe("Konami keyboard grace period", () => {
  it("completes without navigation or focused controls receiving reserved keys", async (t) => {
    let onJump = t.mock.fn<(index: number) => void>();
    let onComplete = t.mock.fn();
    // Install navigation first to exercise listener ordering, not just key matching.
    let result = render(
      <div>
        <button type="button">Focused control</button>
        <LandingNav
          activeIndexRef={{ current: 1 }}
          totalSections={3}
          onJump={onJump}
          scrollYRef={{ current: 0 }}
        />
      </div>,
    );
    t.after(result.cleanup);
    let controller = new AbortController();
    t.after(() => controller.abort());
    let otherShortcut = t.mock.fn();
    window.addEventListener("keydown", otherShortcut, {
      signal: controller.signal,
    });
    listenForKonamiCode(onComplete, controller.signal);
    let button = result.container.querySelector("button")!;
    let focusedKey = t.mock.fn();
    button.addEventListener("keydown", focusedKey);
    button.focus();

    for (let key of code) {
      let event = keydown(key);
      await result.act(() => button.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(true);
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onJump).toHaveBeenCalledTimes(1);
    expect(otherShortcut).toHaveBeenCalledTimes(1);
    expect(focusedKey).toHaveBeenCalledTimes(1);

    await result.act(() => button.dispatchEvent(keydown("ArrowDown")));
    expect(onJump).toHaveBeenCalledTimes(2);
    // Completing again remains supported (the landing page toggles the effect).
    await result.act(() => {
      for (let key of code) button.dispatchEvent(keydown(key));
    });
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it("refreshes the four-second grace period on progress and releases it on idle", (t) => {
    let timers = t.useFakeTimers();
    let controller = new AbortController();
    t.after(() => controller.abort());
    let onComplete = t.mock.fn();
    listenForKonamiCode(onComplete, controller.signal);
    window.dispatchEvent(keydown("ArrowUp"));
    window.dispatchEvent(keydown("ArrowUp"));
    timers.advance(3999);
    let down = keydown("ArrowDown");
    window.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    timers.advance(3999);
    let nextDown = keydown("ArrowDown");
    window.dispatchEvent(nextDown);
    expect(nextDown.defaultPrevented).toBe(true);
    timers.advance(4000);
    let blog = keydown("b");
    window.dispatchEvent(blog);
    expect(blog.defaultPrevented).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("consumes a cancelling shortcut, then releases keys; unmount also releases them", (t) => {
    let controller = new AbortController();
    t.after(() => controller.abort());
    let onComplete = t.mock.fn();
    listenForKonamiCode(onComplete, controller.signal);
    window.dispatchEvent(keydown("ArrowUp"));
    window.dispatchEvent(keydown("ArrowUp"));
    let wrongKey = keydown("f");
    window.dispatchEvent(wrongKey);
    expect(wrongKey.defaultPrevented).toBe(true);
    let nextKey = keydown("b");
    window.dispatchEvent(nextKey);
    expect(nextKey.defaultPrevented).toBe(false);
    window.dispatchEvent(keydown("ArrowUp"));
    window.dispatchEvent(keydown("ArrowUp"));
    controller.abort();
    let released = keydown("ArrowDown");
    window.dispatchEvent(released);
    expect(released.defaultPrevented).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("leaves typing, control-owned keys, and modified shortcuts alone and ignores held arrows", (t) => {
    let controller = new AbortController();
    t.after(() => controller.abort());
    let onComplete = t.mock.fn();
    let result = render(
      <div>
        <input />
        <button aria-haspopup="listbox">Runner</button>
      </div>,
    );
    t.after(result.cleanup);
    listenForKonamiCode(onComplete, controller.signal);
    for (let target of result.container.querySelectorAll("input, button")) {
      window.dispatchEvent(keydown("ArrowUp"));
      window.dispatchEvent(keydown("ArrowUp"));
      for (let key of code) {
        let event = keydown(key);
        target.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
      }
    }
    window.dispatchEvent(keydown("ArrowUp"));
    let held = keydown("ArrowUp", { repeat: true });
    window.dispatchEvent(held);
    expect(held.defaultPrevented).toBe(false);
    let down = keydown("ArrowDown");
    window.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(false);
    window.dispatchEvent(keydown("ArrowUp"));
    window.dispatchEvent(keydown("ArrowUp"));
    let modified = keydown("b", { ctrlKey: true });
    window.dispatchEvent(modified);
    expect(modified.defaultPrevented).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
  });
});

function keydown(key: string, options: KeyboardEventInit = {}) {
  return new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    key,
    ...options,
  });
}
