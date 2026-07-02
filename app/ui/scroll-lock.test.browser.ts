import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { lockScroll } from "./scroll-lock.ts";

describe("lockScroll", () => {
  it("locks document scrolling until every lock is released", (t) => {
    let documentElement = document.documentElement;
    let previousOverflow = documentElement.style.overflow;
    let previousScrollbarGutter = documentElement.style.scrollbarGutter;
    let unlocks: Array<() => void> = [];

    t.after(() => {
      for (let unlock of unlocks.splice(0).reverse()) unlock();
      documentElement.style.overflow = previousOverflow;
      documentElement.style.scrollbarGutter = previousScrollbarGutter;
    });

    let unlockFirst = lockScroll();
    unlocks.push(unlockFirst);
    let unlockSecond = lockScroll();
    unlocks.push(unlockSecond);

    expect(documentElement.style.overflow).toBe("hidden");

    unlockSecond();
    unlocks.pop();
    expect(documentElement.style.overflow).toBe("hidden");

    unlockFirst();
    unlocks.pop();
    expect(documentElement.style.overflow).toBe(previousOverflow);
    expect(documentElement.style.scrollbarGutter).toBe(previousScrollbarGutter);

    unlockFirst();
    expect(documentElement.style.overflow).toBe(previousOverflow);
  });

  it("restores the page scroll position when unlocked", (t) => {
    let documentElement = document.documentElement;
    let previousOverflow = documentElement.style.overflow;
    let previousScrollbarGutter = documentElement.style.scrollbarGutter;
    let previousScrollX = window.scrollX;
    let previousScrollY = window.scrollY;
    let spacer = document.createElement("div");
    let unlock = () => {};

    spacer.style.height = "3000px";
    document.body.append(spacer);
    window.scrollTo(0, 120);

    t.after(() => {
      unlock();
      spacer.remove();
      documentElement.style.overflow = previousOverflow;
      documentElement.style.scrollbarGutter = previousScrollbarGutter;
      window.scrollTo(previousScrollX, previousScrollY);
    });

    unlock = lockScroll();
    window.scrollTo(0, 240);
    unlock();
    unlock = () => {};

    expect(window.scrollY).toBe(120);
  });
});
