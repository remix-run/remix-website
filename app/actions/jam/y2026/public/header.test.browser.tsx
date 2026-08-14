import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/ui/test";

import { routes } from "../../../../routes.ts";
import { Jam2026Header } from "./header.tsx";

describe("Jam2026Header", () => {
  it("follows system theme changes until the user chooses a theme", async (t) => {
    protectRootTheme(t);
    let systemTheme = createMediaQueryList(
      "(prefers-color-scheme: dark)",
      true,
    );
    let originalMatchMedia = window.matchMedia;
    window.matchMedia = (query) =>
      query === systemTheme.media
        ? systemTheme
        : createMediaQueryList(query, true);
    t.after(() => {
      window.matchMedia = originalMatchMedia;
    });

    let result = render(<Jam2026Header />);
    t.after(result.cleanup);
    await result.act(() => {});

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(
      result.container.querySelector(
        'button[aria-label="Switch to light mode"]',
      ),
    ).not.toBe(null);

    systemTheme.setMatches(false);
    await result.act(() => systemTheme.dispatchChange());

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(
      result.container.querySelector(
        'button[aria-label="Switch to dark mode"]',
      ),
    ).not.toBe(null);
  });

  it("applies and persists an explicit theme choice", async (t) => {
    protectRootTheme(t);
    let originalMatchMedia = window.matchMedia;
    let originalFetch = window.fetch;
    let themeSubmission:
      | { method?: string; theme?: FormDataEntryValue | null; url: string }
      | undefined;

    window.matchMedia = (query) => createMediaQueryList(query, false);
    window.fetch = async (input, init) => {
      let body = init?.body;
      themeSubmission = {
        method: init?.method,
        theme: body instanceof FormData ? body.get("theme") : undefined,
        url: String(input),
      };
      return new Response(null, { status: 204 });
    };
    t.after(() => {
      window.matchMedia = originalMatchMedia;
      window.fetch = originalFetch;
    });

    let result = render(<Jam2026Header initialTheme="light" />);
    t.after(result.cleanup);
    await result.act(() => {});

    let themeSwitch = result.container.querySelector<HTMLButtonElement>(
      'button[aria-label="Switch to dark mode"]',
    )!;
    await result.act(() => themeSwitch.click());

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(
      result.container.querySelector(
        'button[aria-label="Switch to light mode"]',
      ),
    ).not.toBe(null);
    expect(themeSubmission).toEqual({
      url: routes.jam.y2026.theme.href(),
      method: "POST",
      theme: "dark",
    });
  });
});

function protectRootTheme(t: { after(cleanup: () => void): void }) {
  let root = document.documentElement;
  let previousTheme = root.getAttribute("data-theme");
  let previousColorScheme = root.style.colorScheme;
  let wasDark = root.classList.contains("dark");

  t.after(() => {
    if (previousTheme === null) root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", previousTheme);
    root.style.colorScheme = previousColorScheme;
    root.classList.toggle("dark", wasDark);
  });
}

function createMediaQueryList(media: string, initialMatches: boolean) {
  let listeners = new Set<(event: MediaQueryListEvent) => void>();
  let query = {
    matches: initialMatches,
    media,
    onchange: null,
    addListener(listener: (event: MediaQueryListEvent) => void) {
      listeners.add(listener);
    },
    removeListener(listener: (event: MediaQueryListEvent) => void) {
      listeners.delete(listener);
    },
    addEventListener(
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      if (typeof listener === "function") {
        listeners.add(listener as (event: MediaQueryListEvent) => void);
      }
    },
    removeEventListener(
      _type: string,
      listener: EventListenerOrEventListenerObject,
    ) {
      if (typeof listener === "function") {
        listeners.delete(listener as (event: MediaQueryListEvent) => void);
      }
    },
    dispatchEvent: () => false,
    setMatches(matches: boolean) {
      query.matches = matches;
    },
    dispatchChange() {
      let event = { matches: query.matches, media } as MediaQueryListEvent;
      for (let listener of listeners) listener(event);
    },
  };
  return query as MediaQueryList & {
    setMatches(matches: boolean): void;
    dispatchChange(): void;
  };
}
