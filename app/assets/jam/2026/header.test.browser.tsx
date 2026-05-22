import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { routes } from "../../../routes.ts";
import { Jam2026Header } from "./header.tsx";

describe("Jam2026Header", () => {
  it("uses the system theme without forcing a saved theme", async (t) => {
    let originalMatchMedia = window.matchMedia;
    let root = document.documentElement;

    window.matchMedia = (query) => mediaQueryList(query, true);
    root.dataset.theme = "light";
    root.style.colorScheme = "light";

    t.after(() => {
      window.matchMedia = originalMatchMedia;
      delete root.dataset.theme;
      root.style.colorScheme = "";
      root.classList.remove("dark");
    });

    let result = render(<Jam2026Header />);
    t.after(result.cleanup);

    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(root.dataset.theme).toBe(undefined);
    expect(root.style.colorScheme).toBe("light dark");
    expect(root.classList.contains("dark")).toBe(true);
    expect(result.container.querySelector("header")?.dataset.theme).toBe(
      undefined,
    );
    expect(
      result.container.querySelector(
        'button[aria-label="Switch to light mode"]',
      ),
    ).not.toBe(null);
  });

  it("toggles the page theme with one switch", async (t) => {
    let originalMatchMedia = window.matchMedia;
    let originalFetch = window.fetch;
    let root = document.documentElement;
    let themeSubmission:
      | { method?: string; theme?: FormDataEntryValue | null; url: string }
      | undefined;
    let formSubmitted = false;
    let onSubmit = () => {
      formSubmitted = true;
    };

    window.matchMedia = (query) => mediaQueryList(query, false);
    window.fetch = async (input, init) => {
      let body = init?.body;
      themeSubmission = {
        method: init?.method,
        theme: body instanceof FormData ? body.get("theme") : undefined,
        url: String(input),
      };
      return new Response(null, { status: 204 });
    };
    document.addEventListener("submit", onSubmit);

    t.after(() => {
      window.matchMedia = originalMatchMedia;
      window.fetch = originalFetch;
      document.removeEventListener("submit", onSubmit);
      delete root.dataset.theme;
      root.style.colorScheme = "";
    });

    let result = render(<Jam2026Header initialTheme="light" />);
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
    await result.act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(root.dataset.theme).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
    expect(
      result.container.querySelector(
        'button[aria-label="Switch to light mode"]',
      ),
    ).not.toBe(null);
    expect(formSubmitted).toBe(false);
    expect(themeSubmission?.url).toBe(routes.jam.y2026.theme.href());
    expect(themeSubmission?.method).toBe("POST");
    expect(themeSubmission?.theme).toBe("dark");
  });
});

function mediaQueryList(media: string, matches: boolean) {
  return { matches, media } as MediaQueryList;
}
