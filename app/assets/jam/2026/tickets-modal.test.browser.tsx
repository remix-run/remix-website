import { expect } from "remix/assert";
import { describe, it } from "remix/test";

import { render } from "remix/ui/test";

import { Jam2026TicketsModalFrame } from "./tickets-modal.tsx";
import {
  JAM_2026_PAGE_BACKGROUND_ID,
  JAM_2026_TICKETS_FRAME_NAME,
  getJam2026TicketsFrameHref,
  getJam2026TicketsHref,
} from "../../../controllers/jam/2026/tickets-modal-contract.ts";

describe("Jam2026TicketsModal", () => {
  it("applies modal effects and renders frame navigation controls", async (t) => {
    let homeHref = "/jam/2026";
    let ticketsHref = getJam2026TicketsHref();
    let frameHref = getJam2026TicketsFrameHref();
    let previousOverflow = document.documentElement.style.overflow;
    let previousScrollbarGutter =
      document.documentElement.style.scrollbarGutter;

    window.history.replaceState(window.history.state, "", ticketsHref);

    t.after(() => {
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
      window.history.replaceState(window.history.state, "", homeHref);
    });

    let result = render(
      <div>
        <main id={JAM_2026_PAGE_BACKGROUND_ID}>Page content</main>
        <Jam2026TicketsModalFrame open />
      </div>,
    );
    t.after(result.cleanup);

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    let dialog = result.container.querySelector('[role="dialog"]');
    expect(Boolean(dialog)).toBe(true);
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(window.location.pathname + window.location.search).toBe(ticketsHref);
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(
      result.container
        .querySelector(`#${JAM_2026_PAGE_BACKGROUND_ID}`)
        ?.hasAttribute("inert"),
    ).toBe(true);

    let backdrop = result.container.querySelector<HTMLAnchorElement>(
      "[data-jam-2026-tickets-backdrop]",
    )!;
    expect(backdrop.getAttribute("href")).toBe(homeHref);
    expect(backdrop.getAttribute("rmx-reset-scroll")).toBe("false");
    expect(backdrop.getAttribute("rmx-src")).toBe(frameHref);
    expect(backdrop.getAttribute("rmx-target")).toBe(
      JAM_2026_TICKETS_FRAME_NAME,
    );

    let close = result.container.querySelector<HTMLAnchorElement>(
      "[aria-label='Close tickets']",
    )!;
    expect(close.getAttribute("href")).toBe(homeHref);
    expect(close.getAttribute("rmx-reset-scroll")).toBe("false");
    expect(close.getAttribute("rmx-src")).toBe(frameHref);
    expect(close.getAttribute("rmx-target")).toBe(JAM_2026_TICKETS_FRAME_NAME);
  });
});
