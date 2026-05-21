import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { render } from "remix/ui/test";

import { Jam2026TicketsModalFrame } from "./tickets-modal.tsx";
import { ticketModalConfig } from "../../../controllers/jam/2026/tickets-modal-contract.ts";
import { routes } from "../../../routes.ts";

describe("Jam2026TicketsModal", () => {
  it("applies modal effects and renders frame navigation controls", async (t) => {
    let homeHref = routes.jam.y2026.index.href();
    let ticketHref = routes.jam.y2026.ticket.href();
    let previousOverflow = document.documentElement.style.overflow;
    let previousScrollbarGutter =
      document.documentElement.style.scrollbarGutter;

    window.history.replaceState(window.history.state, "", ticketHref);

    t.after(() => {
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
      window.history.replaceState(window.history.state, "", homeHref);
    });

    let result = render(
      <div>
        <main id={ticketModalConfig.pageBackgroundId}>Page content</main>
        <Jam2026TicketsModalFrame open />
      </div>,
    );
    t.after(result.cleanup);

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    let dialog = result.container.querySelector('[role="dialog"]');
    expect(Boolean(dialog)).toBe(true);
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(
      result.container
        .querySelector(`[${ticketModalConfig.attributes.modal}]`)
        ?.getAttribute("data-animate-entrance"),
    ).toBe("true");
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

  it("can render open without entrance motion for document reloads", async (t) => {
    let result = render(
      <Jam2026TicketsModalFrame animateEntrance={false} open />,
    );
    t.after(result.cleanup);

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(
      result.container
        .querySelector(`[${ticketModalConfig.attributes.modal}]`)
        ?.getAttribute("data-animate-entrance"),
    ).toBe("false");
    expect(Boolean(result.container.querySelector('[role="dialog"]'))).toBe(
      true,
    );
  });

  it("updates ticket quantity and subtotal in the hydrated modal", async (t) => {
    let result = render(<Jam2026TicketsModalFrame open />);
    t.after(result.cleanup);

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    let getQuantityValue = () =>
      result.container.querySelector("[aria-live='polite']")?.textContent;
    let getQuantityInput = () =>
      result.container.querySelector<HTMLInputElement>(
        "input[name='quantity']",
      )!;
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

    expect(result.container.textContent).toContain("Remix Jam 2026 Ticket");
    expect(result.container.textContent).toContain("$299");
    expect(result.container.textContent).toContain("$399");
    expect(checkoutButton.disabled).toBe(true);
    expect(getQuantityValue()).toBe("1");
    expect(getQuantityInput().value).toBe("1");
    expect(getDecreaseButton().disabled).toBe(true);

    await result.act(() => getIncreaseButton().click());

    expect(getQuantityValue()).toBe("2");
    expect(getQuantityInput().value).toBe("2");
    expect(result.container.textContent).toContain("$598");
    expect(result.container.textContent).toContain("$798");
    expect(getDecreaseButton().disabled).toBe(false);

    for (let index = 0; index < 4; index++) {
      await result.act(() => getIncreaseButton().click());
    }

    expect(getQuantityValue()).toBe("6");
    expect(getQuantityInput().value).toBe("6");
    expect(getIncreaseButton().disabled).toBe(true);
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
