# Client-Side Navigation

This document explains the current client-side navigation model in `remix/**`.

## Overview

The app now uses a top-frame navigation model for selected same-origin navigations.

- Direct visits still render a full HTML document on the server.
- In-app navigations reload a named Remix `Frame` instead of doing a full document navigation.
- The browser's [Navigation API](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API) is the primary client-side routing primitive.
- When the Navigation API is unavailable, the app degrades to normal browser navigations.

The current pilot surface is centered on the blog flow, with shared header links also participating.

## Core pieces

- `remix/components/document.tsx`
  Hosts the top-level `Frame name="app"` and the persistent `AppNavigation` client entry.
- `remix/assets/app-navigation.tsx`
  Owns same-origin navigation interception and frame reloads.
- `remix/utils/render.ts`
  Splits HTML responses into full-document and frame-fragment variants and marks them with `Vary: x-remix-target`.
- `remix/shared/app-navigation.ts`
  Defines the shared frame/header/attribute constants.
- `remix/routes/blog.tsx`
  Returns either a full document or a frame fragment for the blog index.
- `remix/routes/blog-post.tsx`
  Returns either a full document or a frame fragment for a blog post.
- `remix/lib/blog.server.ts`
  Normalizes relative markdown links so blog content emits stable same-origin URLs.

Minimal shape:

```tsx
// remix/components/document.tsx
<>
  <AppNavigation setup={{ frameName: APP_FRAME_NAME }} />
  <Frame name={APP_FRAME_NAME} src={appFrameSrc} />
</>
```

## Request/response model

The same URL can now return two different HTML payloads.

### Full document request

Normal requests without `x-remix-target` return a full HTML document:

- `<html>`, `<head>`, and the shared asset shell
- the persistent `AppNavigation` controller
- `<Frame name="app" src={request.url}>`

This is what direct visits, reloads, and non-enhanced browsers receive.

Example route shape:

```tsx
return render.document(<Document appFrameSrc={request.url} />, {
  headers: {
    "Cache-Control": CACHE_CONTROL.DEFAULT,
  },
});
```

### Frame request

Requests with `x-remix-target: app` return only the frame fragment:

- route-local `<title>`, `<meta>`, and `<link>` tags
- page body content
- any nested client entries within that fragment

The `Frame` runtime hoists head-managed elements from the fragment into `document.head`, then diffs the new frame content into the DOM.

Because the same URL has both a full-document and fragment representation, all HTML responses rendered through `remix/utils/render.ts` must vary on `x-remix-target`.

Example route shape:

```tsx
if (isAppFrameRequest(request)) {
  return render.frame(
    <>
      <title>Remix Blog</title>
      <Header />
      <main data-app-nav-scope="">
        <BlogPageContent posts={posts} />
      </main>
      <Footer />
    </>,
    {
      headers: {
        "Cache-Control": CACHE_CONTROL.DEFAULT,
      },
    },
  );
}
```

Example shared render behavior:

```ts
// remix/utils/render.ts
headers.set("Vary", "x-remix-target");
```

## Client navigation flow

The client controller lives in `remix/assets/app-navigation.tsx`.

### Normal forward navigation

1. A user clicks a same-origin link marked with `data-app-nav`, or a link inside a container marked with `data-app-nav-scope`.
2. The click handler records that the next navigation should target the `app` frame.
3. The browser performs a same-document navigation, which triggers `window.navigation`'s `navigate` event.
4. The `navigate` handler:
   - ignores hash-only changes, downloads, forms, and cross-origin navigations
   - determines which frame to reload
   - calls `event.intercept(...)`
   - reloads the target `Frame`
5. The frame request is re-fetched with `x-remix-target: app`.
6. Remix diffs the returned fragment into the existing DOM and hoists head elements.

Minimal client flow:

```tsx
let onDocumentClick = (event: MouseEvent) => {
  let anchor = (event.target as Element)?.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (!shouldInterceptAnchor(anchor)) return;
  pendingFrameName = APP_FRAME_NAME;
};

let onNavigate = (event: NavigateEventLike) => {
  if (!event.canIntercept || event.hashChange) return;

  event.intercept({
    handler: async () => {
      await reloadFrame(new URL(event.destination.url), APP_FRAME_NAME);
    },
  });
};
```

### Back/forward traversal

Back/forward is also handled through the Navigation API `navigate` event.

- Traversals default to the top `app` frame when entry state is missing or stale.
- Navigation entry state still stores frame-target information so the same model can support more targeted frame reloads later.

That fallback looks roughly like this:

```ts
let nextFrameName =
  event.navigationType === "traverse"
    ? stateFrameName ?? APP_FRAME_NAME
    : stateFrameName ?? pendingFrameName;
```

## How link targeting works

The thread that motivated this work prefers "reload the frame the link belongs to" over "target an adjacent sibling frame".

That has two big consequences:

- Active state can stay server-derived because the navigation UI lives inside the fragment being re-rendered.
- Route complexity stays closer to `O(n)` instead of exploding into sibling-target combinations.

Today, the app only uses the top `app` frame in production code, but the controller and entry-state model intentionally leave room for future nested frame targets.

Example link shapes:

```tsx
<a href={routes.blog.href()} data-app-nav="">
  Blog
</a>
```

```tsx
<main data-app-nav-scope="">
  <a href={routes.blogPost.href({ slug: post.slug })}>{post.title}</a>
</main>
```

## Why the Navigation API is primary

The Navigation API is a better fit than hand-rolled `pushState`/`popstate` logic because it gives us:

- one centralized navigation event for clicks, traversals, and programmatic navigations
- entry-local state via `currentEntry.getState()` / `updateCurrentEntry()`
- explicit interception via `event.intercept(...)`

We still need a tiny app-owned layer for frame-target intent, because the Navigation API does not know anything about Remix `Frame` boundaries by itself.

That is why the current controller stores frame-target information in navigation entry state:

```ts
navigation.updateCurrentEntry({
  state: {
    __remixAppNav: "app",
  },
});
```

## Current scope

Implemented now:

- Top-frame same-origin navigation for selected links.
- Shared header links participate.
- Blog index and blog post routes support both document and fragment rendering.
- Blog markdown content emits stable same-origin URLs, so rendered post links can participate in navigation.
- Cache safety for document vs fragment HTML variants.
- Playwright regression coverage for blog back/forward behavior.

## Known limitations and follow-up work

These are the main gaps that still need attention.

### 1. Navigation is not app-wide yet

Only selected routes currently participate in the enhanced flow.

- Some same-origin routes still do full document navigations.
- Nested frame targeting is not implemented yet.

### 2. No prefetch/intents parity yet

The current model upgrades navigation behavior, but not predictive or intent-based prefetch.

Potential follow-up:

- add route-aware prefetch for likely next navigations
- mirror any previous intent/prefetch behavior the legacy site relied on

### 3. Head deduping still needs work

Repeated navigations can accumulate duplicate head-managed elements such as route-local stylesheet links.

This is not currently breaking the user-visible flow, but it is a cleanup/perf concern and should eventually be deduped.

Example of the kind of fragment output that can currently accumulate:

```tsx
<>
  <title>{`${post.title} | Remix`}</title>
  <link rel="stylesheet" href={mdStyles} />
  <meta name="description" content={post.summary} />
  {/* ... */}
</>
```

### 4. DOM-state preservation is still imperfect

The Remix team discussion called out native/reflected UI state like:

- `details[open]`
- dialogs
- popovers

Top-frame reloads can still lose this kind of state if the DOM diff does not special-case the relevant reflected properties.

### 5. Analytics on in-app transitions should be explicitly verified

Fathom is configured with SPA history mode, which should track these transitions correctly, but this should be verified intentionally in production-like behavior.

### 6. Fallback behavior is intentionally coarse

If the Navigation API is unavailable, the app currently falls back to normal browser navigations rather than maintaining a separate History API implementation.

This keeps the code simpler, but means the enhanced experience is not universal.

## Tests

Current coverage:

- Route tests for the core blog/home handlers
- Playwright regression for blog back/forward behavior in `e2e/blog.spec.ts`

The most useful future e2e additions would be:

- cached traversal checks across more surfaces
- nested frame navigation once implemented
- analytics verification on in-app transitions
