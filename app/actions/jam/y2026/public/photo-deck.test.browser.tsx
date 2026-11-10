import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/component/test";

import { Jam2026PhotoDeck } from "./photo-deck.tsx";

let cards = Array.from({ length: 6 }, (_, index) => ({
  url: `https://cdn.shopify.com/files/DSC0${index + 1}.jpg`,
  width: index === 1 ? 800 : 1200,
  height: index === 1 ? 1200 : 800,
  filename: `DSC0${index + 1}.jpg`,
  tilt: index - 2,
}));

describe("Jam2026PhotoDeck", () => {
  it("stacks every card centered in the list until the deck is dealt", async (t) => {
    let result = render(<Jam2026PhotoDeck cards={cards} />);
    t.after(result.cleanup);

    let items = getItems(result.container);
    expect(items).toHaveLength(6);
    let list = result.container.querySelector("ul")!;
    expect(Math.abs(getCenterX(items[0]) - list.clientWidth / 2)).toBeLessThan(
      1,
    );
    // Every card is centered on the first one, whatever its own shape.
    for (let item of items.slice(1)) {
      expect(Math.abs(getCenterX(item) - getCenterX(items[0]))).toBeLessThan(1);
    }
    expect(result.container.querySelectorAll("img")).toHaveLength(3);

    await result.act(() => getDealButton(result.container).click());

    let dealtCenters = getItems(result.container).map((item) =>
      Math.round(getCenterX(item)),
    );
    expect(new Set(dealtCenters).size).toBe(
      Math.min(6, getColumnCount(result.container)),
    );
    expect(result.container.querySelectorAll("img")).toHaveLength(6);
    expect(queryDealButton(result.container)).toBe(null);
    expect(document.activeElement).toBe(result.container.querySelector("ul"));
  });

  it("deals from any visible card in the stack, not just the top one", async (t) => {
    let result = render(<Jam2026PhotoDeck cards={cards} />);
    t.after(result.cleanup);

    await result.act(() => getItems(result.container)[2].click());

    expect(queryDealButton(result.container)).toBe(null);
    expect(result.container.querySelectorAll("img")).toHaveLength(6);
  });

  it("gathers the dealt cards back into the stack", async (t) => {
    let result = render(<Jam2026PhotoDeck cards={cards} />);
    t.after(result.cleanup);

    expect(
      [...result.container.querySelectorAll("button")].some((node) =>
        node.textContent?.includes("Stack photos"),
      ),
    ).toBe(false);
    await result.act(() => getDealButton(result.container).click());
    await result.act(() => getStackButton(result.container).click());

    let items = getItems(result.container);
    for (let item of items.slice(1)) {
      expect(Math.abs(getCenterX(item) - getCenterX(items[0]))).toBeLessThan(1);
    }
    expect(document.activeElement).toBe(getDealButton(result.container));
    // The buried cards stay visible while they fly back, then fade out.
    let isHidden = (item: HTMLElement) =>
      getComputedStyle(item).visibility === "hidden";
    expect(items.slice(3).some(isHidden)).toBe(false);

    await result.act(() => settle(result.container));
    await settle(result.container);

    expect(items.slice(3).every(isHidden)).toBe(true);
    expect(items.slice(0, 3).some(isHidden)).toBe(false);
  });
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
    'button[aria-label="Deal 6 photos"]',
  );
}

function getDealButton(container: HTMLElement) {
  let button = queryDealButton(container);
  if (!button) throw new Error("Unable to find the deal button");
  return button;
}

function getStackButton(container: HTMLElement) {
  let button = [...container.querySelectorAll("button")].find(
    (node) => node.textContent?.trim() === "Stack photos",
  );
  if (!button) throw new Error("Unable to find the stack button");
  return button;
}

function getColumnCount(container: HTMLElement) {
  let list = container.querySelector("ul")!;
  return getComputedStyle(list).gridTemplateColumns.split(" ").length;
}
