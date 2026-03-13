# Upstream Repro: Search Param Navigation Lags One Render Behind

## Summary

In the current Remix preview runtime, intercepted client navigation between URLs on the same route that differ only by a search param can leave the rendered DOM one navigation behind for a short window.

Observed behavior in this app:

1. Start at `/jam/2025/gallery?photo=0`
2. Click `Next photo`
3. URL updates immediately to `?photo=1`
4. For roughly 150-300ms, the modal content and the `Next photo` link still reflect photo `0`
5. If the user clicks again during that window, they hit the stale link and the UI appears stuck or one step behind

This reproduces against a production build, not just the dev server.

## Why This Looks Upstream

- The server response for the next URL is correct
- The URL updates immediately on click
- The DOM eventually catches up without another network request
- Forcing a full document navigation with `window.location.assign(...)` avoids the issue entirely

That points at a client-side reconciliation/intercepted-navigation timing problem rather than route logic.

## Goal For Upstream Repro

Build the smallest possible Remix fixture that:

- uses a single route
- derives all rendered state from `request.url` search params
- uses plain anchors for `previous` / `next`
- reproduces the lag with no custom client-entry code

## Suggested Minimal Route

Add a route like `/repro/search-param-gallery` with three items and a query-param-driven modal.

Example shape:

```tsx
export async function searchParamGalleryHandler() {
  let request = new URL(getRequestContext().request.url);
  let items = [
    { id: 0, label: "Photo 1" },
    { id: 1, label: "Photo 2" },
    { id: 2, label: "Photo 3" },
  ];

  let raw = request.searchParams.get("photo");
  let selected = raw === null ? null : Number.parseInt(raw, 10);
  if (
    selected !== null &&
    (!Number.isFinite(selected) || selected < 0 || selected >= items.length)
  ) {
    selected = null;
  }

  return render.document(
    <html>
      <body>
        <main>
          <h1>Search Param Gallery Repro</h1>

          <div>
            {items.map((item) => (
              <a
                key={item.id}
                href={`/repro/search-param-gallery?photo=${item.id}`}
                data-open-link
                data-photo-index={item.id}
              >
                {item.label}
              </a>
            ))}
          </div>

          {selected !== null ? (
            <div data-modal>
              <p data-counter>
                {selected + 1} / {items.length}
              </p>

              <p data-selected-label>{items[selected].label}</p>

              <a href="/repro/search-param-gallery" aria-label="Close modal">
                Close modal
              </a>

              <a
                href={`/repro/search-param-gallery?photo=${selected === 0 ? items.length - 1 : selected - 1}`}
                aria-label="Previous photo"
              >
                Previous photo
              </a>

              <a
                href={`/repro/search-param-gallery?photo=${selected === items.length - 1 ? 0 : selected + 1}`}
                aria-label="Next photo"
              >
                Next photo
              </a>
            </div>
          ) : null}
        </main>
      </body>
    </html>,
  );
}
```

Important constraints:

- Do not use custom `clientEntry(...)`
- Do not use explicit `navigate(...)`
- Do not use frames
- Do not use any client-only state
- All UI should be derived from the server-rendered URL

## Suggested Playwright Repro Test

Use a browser test that checks for stale DOM immediately after the URL change.

```ts
test("search-param modal navigation lags one render behind", async ({
  page,
}) => {
  await page.goto("/repro/search-param-gallery?photo=0");

  await expect(page.locator("[data-counter]")).toHaveText("1 / 3");
  await expect(page.locator("[data-selected-label]")).toHaveText("Photo 1");
  await expect(page.getByRole("link", { name: "Next photo" })).toHaveAttribute(
    "href",
    "/repro/search-param-gallery?photo=1",
  );

  await page.getByRole("link", { name: "Next photo" }).click();
  await page.waitForURL("**/repro/search-param-gallery?photo=1");

  await page.waitForTimeout(50);

  await expect(page.locator("[data-counter]")).toHaveText("2 / 3");
  await expect(page.locator("[data-selected-label]")).toHaveText("Photo 2");
  await expect(page.getByRole("link", { name: "Next photo" })).toHaveAttribute(
    "href",
    "/repro/search-param-gallery?photo=2",
  );
});
```

If that timing is too aggressive on faster/slower machines, capture diagnostic output instead of a strict failing assertion first:

```ts
let snapshot = await page.evaluate(() => ({
  href: window.location.href,
  counter: document.querySelector("[data-counter]")?.textContent?.trim(),
  selected: document
    .querySelector("[data-selected-label]")
    ?.textContent?.trim(),
  nextHref: document
    .querySelector('a[aria-label="Next photo"]')
    ?.getAttribute("href"),
}));
console.log(snapshot);
```

In this app, the diagnostic sequence was:

- initial: URL `?photo=0`, counter `1 / 152`
- after first click, about 50ms later: URL `?photo=1`, counter still `1 / 152`, `nextHref` still `?photo=1`
- after about 300ms: URL still `?photo=1`, counter becomes `2 / 152`, `nextHref` becomes `?photo=2`

## Manual Repro Script

If maintainers want a dead-simple browser repro first:

1. Open `/repro/search-param-gallery?photo=0`
2. Click `Next photo`
3. Watch the URL update to `?photo=1`
4. Immediately inspect the visible counter and the `href` of the `Next photo` link
5. Click `Next photo` again quickly
6. Observe that the UI can feel frozen because the second click uses the stale link before the DOM catches up

## Useful Notes For The Issue

- Reproduced in a production build
- Route logic is purely URL-derived
- No client state involved
- No frames involved
- No custom event handlers required to reproduce
- Full document navigation avoids the issue

## Suggested Issue Title

`Client navigation between same-route search-param URLs can leave DOM one render behind`

## Suggested Issue Body

```md
We are seeing a client-navigation issue in the Remix preview runtime where navigating between URLs on the same route that differ only by a search param updates `window.location` immediately, but the rendered DOM can remain on the previous state for a short window.

In our reproduction:

- route state is derived entirely from `request.url`
- navigation uses plain anchors only
- there is no custom client code, no frames, and no local state
- a production build reproduces the issue

Behavior:

1. Load `/repro/search-param-gallery?photo=0`
2. Click `Next photo`
3. URL becomes `?photo=1`
4. For roughly 150-300ms, the DOM still reflects photo `0`
5. If the user clicks again during that window, they interact with stale DOM/hrefs

Forcing a full document navigation avoids the issue, which makes this look like a client-side reconciliation/intercepted-navigation problem.
```
