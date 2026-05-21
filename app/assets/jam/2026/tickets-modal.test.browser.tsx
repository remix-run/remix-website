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
});
