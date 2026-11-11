import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/component/test";

import { Jam2026PhotoDeck } from "./photo-deck.tsx";
import { photoViewer } from "./photo-viewer-controller.ts";
import { jam2026ModalConfig } from "./modal-contract.ts";
import { routes } from "../../../../routes.ts";

let cards = Array.from({ length: 12 }, (_, index) => ({
  url: `https://cdn.shopify.com/files/DSC${index + 1}.jpg`,
  width: index === 1 ? 800 : 1200,
  height: index === 1 ? 1200 : 800,
  filename: `DSC${index + 1}.jpg`,
  slug: `DSC${index + 1}`,
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
    // The pile is loose but straight: no card is turned.
    for (let item of items) {
      let { a, b } = new DOMMatrix(
        getComputedStyle(item.firstElementChild!).transform,
      );
      expect(Math.atan2(b, a)).toBe(0);
    }
    // A visible label names what the stack does, and how many photos it holds.
    expect(getDealButton(result.container).textContent).toBe("View 12 photos");
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

  it("starts dealt when asked, with every card linking into the viewer", async (t) => {
    let result = render(<Jam2026PhotoDeck cards={cards} initiallyDealt />);
    t.after(result.cleanup);

    expect(queryDealButton(result.container)).toBe(null);
    expect(result.container.querySelectorAll("img")).toHaveLength(12);
    let links = [
      ...result.container.querySelectorAll<HTMLAnchorElement>(
        'a[aria-label^="View "]',
      ),
    ];
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      cards.map((card) =>
        routes.jam.y2026.photos.show.href({ photo: card.slug }),
      ),
    );
    expect(links[0].getAttribute("data-rmx-target")).toBe(
      jam2026ModalConfig.frameName,
    );
  });

  it("opens a card's photo in the viewer straight away", async (t) => {
    let result = render(<Jam2026PhotoDeck cards={cards} initiallyDealt />);
    t.after(result.cleanup);
    t.after(() => {
      photoViewer.clear();
      photoViewer.setClosing(false);
    });
    await result.act(() => {});
    let link = result.container.querySelector<HTMLAnchorElement>(
      'a[aria-label="View DSC3.jpg"]',
    )!;
    // The viewer grows out of, shrinks into, and refocuses this link.
    expect(photoViewer.getCard("DSC3") === link).toBe(true);

    // Whether the deck let the last click through to the frame runtime,
    // which isn't running here; the page stays in place either way.
    let followed = false;
    let holdPage = (event: Event) => {
      followed = !event.defaultPrevented;
      event.preventDefault();
    };
    window.addEventListener("click", holdPage);
    t.after(() => window.removeEventListener("click", holdPage));
    let click = (init?: MouseEventInit) => {
      link.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, ...init }),
      );
      return followed;
    };

    // A new-tab click is left to the browser.
    click({ metaKey: true });
    expect(photoViewer.pending).toBe(undefined);

    expect(click()).toBe(true);
    expect(photoViewer.pending).toEqual({ slug: "DSC3", preview: false });

    // While the viewer closes, the click waits rather than racing it.
    photoViewer.clear();
    photoViewer.setClosing(true);
    expect(click()).toBe(false);
    expect(photoViewer.pending).toBe(undefined);
  });

  it("leaves Escape to an open modal instead of gathering", async (t) => {
    let result = render(
      <div>
        <Jam2026PhotoDeck cards={cards} initiallyDealt />
        <div role="dialog" aria-modal="true" />
      </div>,
    );
    t.after(result.cleanup);
    await result.act(() => {});

    await result.act(() =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      ),
    );

    expect(queryDealButton(result.container)).toBe(null);
    expect(queryStackButtons(result.container)).toHaveLength(cards.length);
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
  return container.querySelector<HTMLButtonElement>("button[data-deal]");
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
