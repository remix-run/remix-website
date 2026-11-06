import { expect } from "remix/assert";
import { describe, it } from "remix/test";
import { render } from "remix/component/test";

import { routes } from "../../../../routes.ts";
import { Jam2026Header } from "./header.tsx";

describe("Jam2026Header", () => {
  it("follows system theme changes until the user chooses a theme", async (t) => {
    protectRootTheme(t);
    let systemTheme = createMediaQueryList(
      "(prefers-color-scheme: dark)",
      true,
    );
    t.mock.method(window, "matchMedia", (query: string) =>
      query === systemTheme.media
        ? systemTheme
        : createMediaQueryList(query, true),
    );

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
    let themeSubmission:
      | { method?: string; theme?: FormDataEntryValue | null; url: string }
      | undefined;

    t.mock.method(window, "matchMedia", (query: string) =>
      createMediaQueryList(query, false),
    );
    let themeFetch: typeof fetch = async (input, init) => {
      let body = init?.body;
      themeSubmission = {
        method: init?.method,
        theme: body instanceof FormData ? body.get("theme") : undefined,
        url: String(input),
      };
      return new Response(null, { status: 204 });
    };
    t.mock.method(window, "fetch", themeFetch);

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

  it("reports a failed theme save without reverting the applied theme", async (t) => {
    protectRootTheme(t);
    t.mock.method(window, "matchMedia", (query: string) =>
      createMediaQueryList(query, false),
    );
    let themeFetch: typeof fetch = async () =>
      new Response(null, { status: 500 });
    t.mock.method(window, "fetch", themeFetch);
    let errors: unknown[][] = [];
    t.mock.method(console, "error", (...args: unknown[]) => {
      errors.push(args);
    });

    let result = render(<Jam2026Header initialTheme="light" />);
    t.after(result.cleanup);
    await result.act(() => {});

    await result.act(() =>
      result.container
        .querySelector<HTMLButtonElement>(
          'button[aria-label="Switch to dark mode"]',
        )!
        .click(),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(errors.length).toBe(1);
    expect(errors[0][0]).toBe("[jam-theme] Failed to save theme preference");
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

/**
 * A `MediaQueryList` stand-in built on `EventTarget`, so `change` listeners
 * honor `{ signal }`. It omits the deprecated `addListener` API on purpose.
 */
function createMediaQueryList(media: string, initialMatches: boolean) {
  let query = Object.assign(new EventTarget(), {
    matches: initialMatches,
    media,
    onchange: null,
    setMatches(matches: boolean) {
      query.matches = matches;
    },
    dispatchChange() {
      query.dispatchEvent(new Event("change"));
    },
  });
  return query as unknown as MediaQueryList & {
    setMatches(matches: boolean): void;
    dispatchChange(): void;
  };
}
