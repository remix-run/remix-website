import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { Jam2026Header } from "./header.tsx";

describe("Jam2026Header", () => {
  it("toggles the page theme with one switch", async (t) => {
    let originalMatchMedia = window.matchMedia;
    let originalStoredTheme = sessionStorage.getItem("remix-jam-2026-theme");
    let root = document.documentElement;

    window.matchMedia = (query) => mediaQueryList(query, false);
    sessionStorage.removeItem("remix-jam-2026-theme");

    t.after(() => {
      window.matchMedia = originalMatchMedia;
      if (originalStoredTheme == null) {
        sessionStorage.removeItem("remix-jam-2026-theme");
      } else {
        sessionStorage.setItem("remix-jam-2026-theme", originalStoredTheme);
      }
      delete root.dataset.theme;
      root.style.colorScheme = "";
    });

    let result = render(<Jam2026Header />);
    t.after(result.cleanup);

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(root.dataset.theme).toBe("light");
    expect(root.style.colorScheme).toBe("light");
    expect(
      result.container.querySelectorAll('button[aria-label^="Switch to"]')
        .length,
    ).toBe(1);

    let themeSwitch = result.container.querySelector<HTMLButtonElement>(
      'button[aria-label="Switch to dark mode"]',
    )!;

    await result.act(() => themeSwitch.click());

    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
    expect(
      result.container.querySelector(
        'button[aria-label="Switch to light mode"]',
      ),
    ).not.toBe(null);
    expect(sessionStorage.getItem("remix-jam-2026-theme")).toBe("dark");
  });
});

function mediaQueryList(media: string, matches: boolean) {
  return { matches, media } as MediaQueryList;
}
