import { expect } from "remix/assert";
import { afterEach, beforeEach, describe, it } from "remix/test";

import { render } from "remix/ui/test";

import { Jam2026TicketsModalFrame } from "./tickets-modal.tsx";
import { remixJam2026Ticket } from "./ticket-data.ts";
import { ticketModalConfig } from "./tickets-modal-contract.ts";
import { routes } from "../../../../routes.ts";

describe("Jam2026TicketsModal", () => {
  let originalHead: string;

  beforeEach(() => {
    originalHead = document.head.innerHTML;
  });

  afterEach(() => {
    document.head.innerHTML = originalHead;
  });

  it("preserves the current stylesheet during head updates", async (t) => {
    let href = "/assets/app/styles/public/global.@fingerprint.css";
    document.head.insertAdjacentHTML(
      "beforeend",
      `<link data-remix-managed-head="true" rel="stylesheet" href="${href}">`,
    );

    let result = render(<Jam2026TicketsModalFrame />);
    t.after(result.cleanup);
    await result.act(() => {});

    expect(
      document.head
        .querySelector<HTMLLinkElement>('link[rel="stylesheet"]')
        ?.getAttribute("href"),
    ).toBe(href);
  });

  it("applies modal effects and renders frame navigation controls", async (t) => {
    let homeHref = routes.jam.y2026.index.href();
    let previousOverflow = document.documentElement.style.overflow;
    let previousScrollbarGutter =
      document.documentElement.style.scrollbarGutter;

    t.after(() => {
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
    });

    let result = render(
      <div>
        <main id={ticketModalConfig.pageBackgroundId}>Page content</main>
        <Jam2026TicketsModalFrame open />
      </div>,
    );
    t.after(result.cleanup);

    await result.act(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );

    let dialog = result.container.querySelector('[role="dialog"]');
    expect(Boolean(dialog)).toBe(true);
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(document.activeElement).toBe(
      result.container.querySelector(
        "section[role='dialog'] [aria-label='Close tickets']",
      ),
    );
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(
      result.container
        .querySelector(`#${ticketModalConfig.pageBackgroundId}`)
        ?.hasAttribute("inert"),
    ).toBe(true);

    let backdrop = result.container.querySelector<HTMLAnchorElement>(
      `[${ticketModalConfig.attributes.backdrop}]`,
    )!;
    expect(backdrop.getAttribute("href")).toBe(homeHref);
    expect(backdrop.getAttribute("rmx-reset-scroll")).toBe("false");
    expect(backdrop.getAttribute("rmx-target")).toBe(
      ticketModalConfig.frameName,
    );

    let close = result.container.querySelector<HTMLAnchorElement>(
      "[aria-label='Close tickets']",
    )!;
    expect(close.getAttribute("href")).toBe(homeHref);
    expect(close.getAttribute("rmx-reset-scroll")).toBe("false");
    expect(close.getAttribute("rmx-target")).toBe(ticketModalConfig.frameName);
  });

  it("updates ticket quantity and subtotal in the hydrated modal", async (t) => {
    let result = render(<Jam2026TicketsModalFrame open />);
    t.after(result.cleanup);

    await result.act(() => {});

    let getQuantityValue = () =>
      result.container.querySelector("[aria-live='polite']")?.textContent;
    let getQuantityInput = () =>
      result.container.querySelector<HTMLInputElement>(
        "input[name='quantity']",
      )!;
    let getProductInput = () =>
      result.container.querySelector<HTMLInputElement>(
        "input[name='productId']",
      )!;
    let form = result.container.querySelector<HTMLFormElement>("form")!;
    let getIncreaseButton = () =>
      result.container.querySelector<HTMLButtonElement>(
        "button[aria-label='Increase quantity']",
      )!;
    let getDecreaseButton = () =>
      result.container.querySelector<HTMLButtonElement>(
        "button[aria-label='Decrease quantity']",
      )!;
    let checkoutButton = result.container.querySelector<HTMLButtonElement>(
      "button[type='submit']",
    )!;

    expect(form.getAttribute("action")).toBe(
      routes.jam.y2026.ticket.action.href(),
    );
    expect(
      result.container.querySelector<HTMLInputElement>(
        "input[name='ticketType']",
      )?.value,
    ).toBe(remixJam2026Ticket.type);
    expect(getProductInput().value).toBe("");
    expect(checkoutButton.disabled).toBe(true);
    expect(getQuantityValue()).toBe("1");
    expect(getQuantityInput().value).toBe("1");
    expect(getDecreaseButton().disabled).toBe(true);

    await result.act(() => getIncreaseButton().click());

    expect(getQuantityValue()).toBe("2");
    expect(getQuantityInput().value).toBe("2");
    expect(result.container.textContent).toContain(
      `$${remixJam2026Ticket.price * 2}`,
    );
    expect(result.container.textContent).toContain(
      `$${remixJam2026Ticket.originalPrice * 2}`,
    );
    expect(getDecreaseButton().disabled).toBe(false);

    for (let index = 2; index < remixJam2026Ticket.maxQuantity; index++) {
      await result.act(() => getIncreaseButton().click());
    }

    expect(getQuantityValue()).toBe(String(remixJam2026Ticket.maxQuantity));
    expect(getQuantityInput().value).toBe(
      String(remixJam2026Ticket.maxQuantity),
    );
    expect(getIncreaseButton().disabled).toBe(true);
  });

  it("enables checkout when the server provides an available ticket variant", async (t) => {
    let result = render(
      <Jam2026TicketsModalFrame
        open
        ticketCheckout={{
          availableForSale: true,
          initialQuantity: 1,
          maxQuantity: remixJam2026Ticket.maxQuantity,
          productId: "gid://shopify/ProductVariant/2026",
        }}
      />,
    );
    t.after(result.cleanup);

    await result.act(() => {});

    let checkoutButton = result.container.querySelector<HTMLButtonElement>(
      "button[type='submit']",
    )!;
    let productInput = result.container.querySelector<HTMLInputElement>(
      "input[name='productId']",
    )!;

    expect(checkoutButton.disabled).toBe(false);
    expect(checkoutButton.textContent).toBe("Check out");
    expect(productInput.value).toBe("gid://shopify/ProductVariant/2026");
  });

  it("announces checkout errors returned by the server", async (t) => {
    let result = render(
      <Jam2026TicketsModalFrame
        open
        ticketCheckout={{
          availableForSale: false,
          error: "Tickets are sold out or unavailable",
          initialQuantity: 1,
          maxQuantity: remixJam2026Ticket.maxQuantity,
        }}
      />,
    );
    t.after(result.cleanup);
    await result.act(() => {});

    let alert = result.container.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain("Tickets are sold out or unavailable");
    expect(
      result.container.querySelector<HTMLButtonElement>(
        "button[type='submit']",
      )!.disabled,
    ).toBe(true);
  });

  it("shows a pending checkout state after submit", async (t) => {
    let result = render(
      <Jam2026TicketsModalFrame
        open
        ticketCheckout={{
          availableForSale: true,
          initialQuantity: 1,
          maxQuantity: remixJam2026Ticket.maxQuantity,
          productId: "gid://shopify/ProductVariant/2026",
        }}
      />,
    );
    t.after(result.cleanup);

    await result.act(() => {});

    let form = result.container.querySelector<HTMLFormElement>("form")!;
    form.addEventListener("submit", (event) => event.preventDefault());

    let checkoutButton = result.container.querySelector<HTMLButtonElement>(
      "button[type='submit']",
    )!;
    let increaseButton = result.container.querySelector<HTMLButtonElement>(
      "button[aria-label='Increase quantity']",
    )!;

    await result.act(() => checkoutButton.click());

    expect(form.getAttribute("aria-busy")).toBe("true");
    expect(form.getAttribute("data-pending")).toBe("true");
    expect(checkoutButton.disabled).toBe(true);
    expect(checkoutButton.textContent).toBe("Checking out...");
    expect(increaseButton.disabled).toBe(true);

    await result.act(() => {
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", {
          persisted: true,
        }),
      );
    });

    expect(form.hasAttribute("aria-busy")).toBe(false);
    expect(form.getAttribute("data-pending")).toBe("false");
    expect(checkoutButton.disabled).toBe(false);
    expect(checkoutButton.textContent).toBe("Check out");
    expect(increaseButton.disabled).toBe(false);
  });

  it("restores page scroll after the close frame navigation", async (t) => {
    let previousOverflow = document.documentElement.style.overflow;
    let previousScrollbarGutter =
      document.documentElement.style.scrollbarGutter;
    let previousScrollX = window.scrollX;
    let previousScrollY = window.scrollY;
    let originalMatchMedia = window.matchMedia;
    let navigation = window.navigation;
    let originalNavigate = navigation.navigate;

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
    navigation.navigate = (() => {
      window.scrollTo(0, 0);
      return {
        committed: Promise.resolve(navigation.currentEntry),
        finished: Promise.resolve(navigation.currentEntry),
      } as ReturnType<typeof navigation.navigate>;
    }) as typeof navigation.navigate;

    t.after(() => {
      window.matchMedia = originalMatchMedia;
      navigation.navigate = originalNavigate;
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
      window.scrollTo(previousScrollX, previousScrollY);
    });

    let renderModal = (open = false) => (
      <div style={{ minHeight: "3000px" }}>
        <main id={ticketModalConfig.pageBackgroundId}>Page content</main>
        <Jam2026TicketsModalFrame open={open} />
      </div>
    );

    let result = render(renderModal());
    t.after(result.cleanup);

    window.scrollTo(0, 360);

    await result.act(() => {
      result.root.render(renderModal(true));
    });
    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(window.scrollY).toBe(360);

    await result.act(() => {
      result.container
        .querySelector<HTMLAnchorElement>(
          "section[role='dialog'] [aria-label='Close tickets']",
        )!
        .click();
    });
    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    await result.act(
      () =>
        new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => resolve());
        }),
    );

    expect(window.scrollY).toBe(360);
  });

  it("releases modal page effects when closing animation starts", async (t) => {
    let previousOverflow = document.documentElement.style.overflow;
    let previousScrollbarGutter =
      document.documentElement.style.scrollbarGutter;

    t.after(() => {
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
    });

    let result = render(
      <div>
        <main id={ticketModalConfig.pageBackgroundId}>Page content</main>
        <Jam2026TicketsModalFrame open />
      </div>,
    );
    t.after(result.cleanup);

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    let background = result.container.querySelector(
      `#${ticketModalConfig.pageBackgroundId}`,
    )!;
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(background.hasAttribute("inert")).toBe(true);

    await result.act(() => {
      result.container
        .querySelector<HTMLAnchorElement>(
          "section[role='dialog'] [aria-label='Close tickets']",
        )!
        .click();
    });
    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(
      result.container
        .querySelector("section[role='dialog']")
        ?.getAttribute("data-state"),
    ).toBe("closing");
    expect(document.documentElement.style.overflow).toBe(previousOverflow);
    expect(background.hasAttribute("inert")).toBe(false);
  });
});
