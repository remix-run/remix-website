import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { MobileMenu } from "./mobile-menu.tsx";

describe("MobileMenu", () => {
  it("opens natively, stays open for inside interaction, and restores focus on Escape", async (t) => {
    let result = render(
      <div>
        <MobileMenu>
          <a href="/blog">Blog</a>
          <a href="/jam">Jam</a>
        </MobileMenu>
        <button id="outside">Outside</button>
      </div>,
    );
    t.after(result.cleanup);

    let details = result.container.querySelector("details")!;
    let summary = result.container.querySelector("summary")!;
    let blogLink =
      result.container.querySelector<HTMLAnchorElement>('a[href="/blog"]')!;

    expect(details.open).toBe(false);
    await result.act(() => summary.click());
    expect(details.open).toBe(true);

    await result.act(() => blogLink.focus());
    expect(details.open).toBe(true);
    expect(document.activeElement).toBe(blogLink);

    await result.act(() => {
      details.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    });
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });

  it("closes when focus moves outside", async (t) => {
    let result = render(
      <div>
        <MobileMenu>
          <a href="/blog">Blog</a>
        </MobileMenu>
        <button id="outside">Outside</button>
      </div>,
    );
    t.after(result.cleanup);

    let details = result.container.querySelector("details")!;
    await result.act(() => result.container.querySelector("summary")!.click());
    expect(details.open).toBe(true);

    await result.act(() => result.$("#outside")!.focus());
    expect(details.open).toBe(false);
  });
});
