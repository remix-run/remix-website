import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/component/test";

import { Jam2026PhotoDeck } from "./photo-deck.tsx";

let cards = Array.from({ length: 12 }, (_, index) => ({
  url: `https://cdn.shopify.com/files/DSC${index + 1}.jpg`,
  width: index === 1 ? 800 : 1200,
  height: index === 1 ? 1200 : 800,
  filename: `DSC${index + 1}.jpg`,
  tilt: index - 2,
}));

describe("Jam2026PhotoDeck", () => {
  it("stacks every card centered in the list until the deck is dealt", async (t) => {
    let result = render(<Jam2026PhotoDeck cards={cards} />);
    t.after(result.cleanup);

    let items = getItems(result.container);
    expect(items).toHaveLength(12);
    let list = result.container.querySelector("ul")!;
    expect(Math.abs(getCenterX(items[0]) - list.clientWidth / 2)).toBeLessThan(
      1,
    );
    // Every card is centered on the first one, whatever its own shape.
    for (let item of items.slice(1)) {
      expect(Math.abs(getCenterX(item) - getCenterX(items[0]))).toBeLessThan(1);
    }
    // Only the ten visible cards in the stack load their images.
    expect(result.container.querySelectorAll("img")).toHaveLength(10);

    await result.act(() => getDealButton(result.container).click());

    let dealtCenters = getItems(result.container).map((item) =>
      Math.round(getCenterX(item)),
    );
    expect(new Set(dealtCenters).size).toBe(
      Math.min(cards.length, getColumnCount(result.container)),
    );
    expect(result.container.querySelectorAll("img")).toHaveLength(12);
    expect(queryDealButton(result.container)).toBe(null);
    expect(document.activeElement).toBe(result.container.querySelector("ul"));
  });

  it("deals from any visible card in the stack, not just the top one", async (t) => {
    let result = render(<Jam2026PhotoDeck cards={cards} />);
    t.after(result.cleanup);

    await result.act(() => getItems(result.container)[9].click());

    expect(queryDealButton(result.container)).toBe(null);
    expect(result.container.querySelectorAll("img")).toHaveLength(12);
  });

  for (let trigger of ["first card", "last card", "Escape"]) {
    it(`gathers the dealt cards back into the stack: ${trigger}`, async (t) => {
      let result = render(<Jam2026PhotoDeck cards={cards} />);
      t.after(result.cleanup);

      expect(queryStackButtons(result.container)).toHaveLength(0);
      await result.act(() => getDealButton(result.container).click());
      // Every dealt card gets its own minus.
      let stackButtons = queryStackButtons(result.container);
      expect(stackButtons).toHaveLength(cards.length);

      await result.act(() => {
        if (trigger === "Escape") {
          document.dispatchEvent(
            new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
          );
        } else {
          (trigger === "first card"
            ? stackButtons[0]
            : stackButtons.at(-1)!
          ).click();
        }
      });

      expect(queryStackButtons(result.container)).toHaveLength(0);
      let items = getItems(result.container);
      for (let item of items.slice(1)) {
        expect(Math.abs(getCenterX(item) - getCenterX(items[0]))).toBeLessThan(
          1,
        );
      }
      expect(document.activeElement).toBe(getDealButton(result.container));
      // The buried cards stay visible while they fly back, then fade out.
      let isHidden = (item: HTMLElement) =>
        getComputedStyle(item).visibility === "hidden";
      expect(items.slice(10).some(isHidden)).toBe(false);

      await result.act(() => settle(result.container));
      await settle(result.container);

      expect(items.slice(10).every(isHidden)).toBe(true);
      expect(items.slice(0, 10).some(isHidden)).toBe(false);
    });
  }
});

async function settle(container: HTMLElement) {
  let animations = container.querySelector("ul")!.getAnimations({
    subtree: true,
  });
  await Promise.allSettled(animations.map((animation) => animation.finished));
}

function getItems(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLLIElement>("ul > li")];
}

// Layout position, ignoring the transforms that animate cards into place.
function getCenterX(item: HTMLElement) {
  return item.offsetLeft + item.offsetWidth / 2;
}

function queryDealButton(container: HTMLElement) {
  return container.querySelector<HTMLButtonElement>(
    'button[aria-label="Deal 12 photos"]',
  );
}

function getDealButton(container: HTMLElement) {
  let button = queryDealButton(container);
  if (!button) throw new Error("Unable to find the deal button");
  return button;
}

function queryStackButtons(container: HTMLElement) {
  return [
    ...container.querySelectorAll<HTMLButtonElement>(
      'button[aria-label="Stack photos"]',
    ),
  ];
}

function getColumnCount(container: HTMLElement) {
  let list = container.querySelector("ul")!;
  return getComputedStyle(list).gridTemplateColumns.split(" ").length;
}
