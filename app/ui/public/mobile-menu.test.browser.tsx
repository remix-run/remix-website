import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { MobileMenu } from "./mobile-menu.tsx";

describe("MobileMenu", () => {
  it("opens, shows navigation links, and escapes back to toggle", async (t) => {
    let result = render(
      <MobileMenu>
        <a href="/blog">Blog</a>
        <a href="/jam">Jam</a>
        <a href="/store">Store</a>
      </MobileMenu>,
    );
    t.after(result.cleanup);

    let details = result.container.querySelector("details")!;
    let menuToggle = result.container.querySelector("summary")!;
    let mobileNav = result.container.querySelector('nav[aria-label="Mobile"]')!;

    expect(details.open).toBe(false);
    expect(mobileNav.textContent).toContain("Blog");
    expect(mobileNav.textContent).toContain("Jam");
    expect(mobileNav.textContent).toContain("Store");

    menuToggle.focus();
    await result.act(() => {
      menuToggle.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
      );
      details.open = true;
      details.dispatchEvent(new Event("toggle", { bubbles: true }));
    });

    expect(details.open).toBe(true);

    await result.act(() => {
      result.container
        .querySelector<HTMLAnchorElement>('a[href="/blog"]')
        ?.focus();
    });
    expect(document.activeElement).toBe(
      result.container.querySelector('a[href="/blog"]'),
    );

    await result.act(() => {
      details.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    });

    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(menuToggle);
  });
});
