# Client Navigation Migration Guide

This guide is for upgrading an existing Remix 3 application from full document navigations to the client navigation model shown on this branch.

Assumptions:

- The app is already on the latest `main` branch of `remix`.
- The app already renders HTML on the server.
- The implementor can modify both the server render path and the browser entry.
- It is acceptable to leave some app-specific routing and layout decisions to the implementor.

Scope:

- Top-level client navigations for normal `<a href="...">` links.
- Optional named-frame navigations for regions that should update independently.
- API changes introduced on this branch that are required to make the above work.

## remix-website Handoff Status

This repo is partway through the migration already.

Completed in this repo:

- Browser boot migrated in `remix/assets/entry.ts`:
  - Uses `run({ loadModule, resolveFrame })`
  - Sends `x-remix-frame`, `x-remix-top-frame-src`, and optional `x-remix-target`
  - Uses `app.addEventListener('error', ...)` and `await app.ready()`
- SSR frame context migrated in `remix/utils/render.ts`:
  - Passes `frameSrc` and `topFrameSrc` to `renderToStream()`
  - Uses `resolveFrame(src, target, context)`
  - Preserves cookies and forwards frame headers on internal fetches
- Existing document shell already loads the browser entry in `remix/components/document.tsx`

Verified in this repo:

- Main header top-level client navigation works for:
  - Home via the wordmark link
  - Blog
  - Jam
- Relative internal links inside rendered blog markdown also perform client navigation
- The targeted Playwright check for the wordmark path now passes locally

Important repo-specific note:

- `remix/assets/wordmark-link.tsx` currently wraps the SVG in a `pointer-events-none` container.
- This is a temporary workaround for the preview runtime's click interception path, which currently misses clicks when the event target is the inner SVG instead of the anchor.
- Keep this in mind before treating the wordmark implementation as finished.

Current migration state:

- Step 2 is complete.
- The simple part of Step 6 is effectively complete for top-level navigation.
- The first named-frame slice is implemented for the Jam info routes.
- Jam gallery/modal flows are intentionally deferred because they likely need nested-frame behavior.

Recommended next task for the next agent:

1. Decide whether to formalize Step 6 as complete in repo docs/tests or keep the wordmark caveat called out as an open follow-up.
2. Treat the Jam info frame as the reference implementation for future frame work.
3. The best deferred candidate is still likely a Jam sub-route region with nested behavior, but not the gallery modal until that nesting is intentionally designed.

Suggested verification commands for this repo:

```sh
pnpm run typecheck:remix
pnpm exec playwright test e2e/navigation.spec.ts --project chromium
pnpm exec playwright test e2e/blog.spec.ts --project chromium
pnpm exec playwright test e2e/jam.spec.ts --project chromium
```

If Playwright is run locally while `pnpm run dev` is already running:

- `playwright.config.ts` is set to reuse the existing dev server outside CI.
- Do not force `CI=1` for local verification unless you also stop the existing server.

Agent workflow notes for this repo:

- For upstream client-navigation details, inspect the local `remix` checkout at `~/code/remix`.
- The most useful searches so far have been:

```sh
cd ~/code/remix
rg -n "rmx-target|rmx-src|<Frame|matchController|run\(" demos/frame-navigation demos/frames packages/component -g '!**/dist/**'
```

- The upstream files that were most useful for understanding the intended app-side pattern were:
  - `demos/frame-navigation/app/lib/NavLink.tsx`
  - `demos/frame-navigation/app/settings/controller.tsx`
  - `demos/frame-navigation/config/routes.ts`
  - `packages/component/docs/frames.md`
- In this workspace, Playwright should usually be run by the user locally and the results reported back to the agent.
- Sandbox Playwright runs are unreliable here, so agents should avoid depending on sandboxed E2E execution unless the user explicitly asks for it.
- A good default is to ask the user to run:

```sh
pnpm exec playwright test e2e/navigation.spec.ts --project chromium
pnpm exec playwright test e2e/blog.spec.ts --project chromium
```

- When asking for Playwright results, remind the user that reusing an already-running local dev server is preferred and `CI=1` should not be forced for local verification.

Named-frame implementation notes from this repo:

- The first implemented frame is the Jam info frame, defined in `remix/routes.ts` as `frames.jamInfo`.
- Keep frame name constants next to route definitions, matching the upstream frame-navigation demo pattern.
- The current Jam frame-backed routes are:
  - `/jam/2025`
  - `/jam/2025/lineup`
  - `/jam/2025/faq`
  - `/jam/2025/coc`
- The current non-frame Jam routes are still top-level navigations:
  - `/jam/2025/gallery`
  - `/jam/2025/ticket`
- The shared shell and frame wiring live in:
  - `remix/routes.ts`
  - `remix/routes/jam-shared.tsx`
  - `remix/assets/jam-frame-head-sync.tsx`
- The implemented pattern is:
  - normal request: `render.document(<JamDocument ... frameSrc={request.url} />)`
  - targeted frame request: `render.frame(<JamFramePage ...>{content}</JamFramePage>)`
- The Jam frame fragment intentionally starts with the scaffold root element, not with a leading zero-DOM client entry. Changing that shape caused client-side reconcile issues during development.
- Jam head updates during frame navigations are handled by the `JamFrameHeadSync` client entry instead of relying on frame-managed `<title>` replacement alone.
- The targeted Jam Playwright coverage currently lives in `e2e/jam.spec.ts` under:
  - `jam info navigation updates in-frame without a full reload`
- The gallery Escape test has a deterministic fallback path for cases where Escape races hydration in CI/dev.
- During local development, Vite may log `Internal server error: aborted` during frame or document navigations. So far this has behaved like a canceled in-flight request rather than a functional bug. Treat it as noteworthy only if it corresponds to broken UI behavior.

Upstream feedback from this repo:

- `packages/component/docs/server-rendering.md` says SSR hoists `<title>`, `<meta>`, `<link>`, and `<style>` into `<head>`, and that does match the server-rendered output here.
- The main gap we hit was not SSR hoisting but client-side reconciliation after in-app navigation.
- Top-level client navigations in this repo did not automatically clear or replace route-scoped head state such as:
  - forced theme state on `<html>` / `<body>`
  - route-scoped stylesheet links such as the Jam CSS asset
  - page metadata when a frame-targeted navigation wanted to update document title/meta without a full document replacement
- This repo currently works around that with explicit client entries:
  - `remix/assets/document-head-sync.tsx`
  - `remix/assets/jam-frame-head-sync.tsx`
- That workaround seems justified for the current preview branch, but it would be better if Remix Component exposed a more declarative built-in story for:
  - document head reconciliation on top-level client navigation
  - html/body attribute and class updates during navigation
  - frame-aware head updates when a named frame changes the active sub-route
- The click interception path also appears brittle for anchors whose event target is an inner SVG node. In this repo, `remix/assets/wordmark-link.tsx` still needs a `pointer-events-none` wrapper around the SVG so the anchor click is intercepted reliably.

## 1. Decide what should stay full-page vs frame-targeted

Before changing code, inventory the application's navigation model.

- Identify links that should become top-level client navigations.
- Identify sections that should update in place without replacing the entire document.
- Group those in-place sections into a small number of named frames such as `settings`, `sidebar`, or `details`.

Handoff to implementor:

- Decide whether the app only needs top-level client navigations or whether it also needs named frames.
- Decide which routes should render a full document on normal requests and only a fragment on frame-targeted requests.

## 2. Add or update the client entry boot file

The browser needs to boot the component runtime with `run()`.

On this branch, the shape is:

```tsx
import { run } from "remix/component";

let app = run({
  async loadModule(moduleUrl, exportName) {
    let mod = await import(moduleUrl);
    let exp = mod[exportName];
    if (typeof exp !== "function") {
      throw new Error(
        `Export "${exportName}" from "${moduleUrl}" is not a function`,
      );
    }
    return exp;
  },
  async resolveFrame(src, signal, target) {
    let headers = new Headers();
    headers.set("accept", "text/html");
    headers.set("x-remix-frame", "true");
    headers.set("x-remix-top-frame-src", window.location.href);
    if (target) headers.set("x-remix-target", target);

    let response = await fetch(src, { headers, signal });
    if (!response.ok) {
      throw new Error(
        `Frame request failed: ${response.status} ${response.statusText}`,
      );
    }
    return response.body ?? (await response.text());
  },
});

app.addEventListener("error", (event) => {
  console.error(event.error);
});

await app.ready();
```

Notes:

- `run(document, ...)` from older call sites becomes `run(...)`.
- The runtime now forwards initialization, hydration, and frame reload failures through `app` error events.
- Even if the app does not use named frames yet, `resolveFrame()` still needs to exist if the document contains `<Frame>`.

## 3. Ensure the document loads the browser entry

The server-rendered document must include a module script for the browser entry.

Typical shape:

```tsx
<script async type="module" src="/assets/entry.js" />
```

If the app already has a browser entry, update it instead of adding a second one.

Handoff to implementor:

- Confirm the correct asset path, bundler output, and deployment pipeline for the existing app.

## 4. Update server rendering to preserve frame context

If the app renders with `renderToStream()`, pass `frameSrc` and preserve `topFrameSrc`.

Target shape:

```tsx
import { renderToStream } from "remix/component/server";

let topFrameSrc = request.headers.get("x-remix-top-frame-src") ?? request.url;

let stream = renderToStream(<App />, {
  frameSrc: request.url,
  topFrameSrc,
  resolveFrame: (src, target, context) =>
    resolveFrame(router, request, src, target, context),
  onError(error) {
    console.error(error);
  },
});
```

Why this matters:

- `frameSrc` tells SSR what frame is being rendered right now.
- `topFrameSrc` preserves the outer document URL across nested frame renders.
- The branch relies on that distinction so `handle.frame.src` and `handle.frames.top.src` remain accurate during SSR and client updates.

## 5. Implement server-side frame resolution

The server-side frame resolver should translate frame requests into internal HTML requests.

Target shape:

```tsx
async function resolveFrame(router, request, src, target, context) {
  let frameSrc = context?.currentFrameSrc ?? request.url;
  let topFrameSrc =
    context?.topFrameSrc ??
    request.headers.get("x-remix-top-frame-src") ??
    request.url;
  let url = new URL(src, frameSrc);

  let headers = new Headers();
  headers.set("accept", "text/html");
  headers.set("accept-encoding", "identity");
  headers.set("x-remix-frame", "true");
  headers.set("x-remix-top-frame-src", topFrameSrc);
  if (target) headers.set("x-remix-target", target);

  let cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  let response = await router.fetch(
    new Request(url, {
      method: "GET",
      headers,
      signal: request.signal,
    }),
  );

  if (!response.ok) {
    return `<pre>Frame error: ${response.status} ${response.statusText}</pre>`;
  }

  return response.body ?? response.text();
}
```

Why these headers exist:

- `x-remix-frame`: identifies the request as a frame fetch.
- `x-remix-target`: tells the server which named frame this fetch is intended for.
- `x-remix-top-frame-src`: keeps the outer document URL stable across nested frame renders.

## 6. Turn top-level links into client navigations

Once `run()` is active, normal anchor clicks are intercepted by the runtime and converted into Navigation API navigations. For top-level links, no custom attributes are required.

This means plain links like the following can become client navigations automatically:

```tsx
<a href="/dashboard">Dashboard</a>
```

Requirements:

- Links must be real anchors with `href`.
- Do not replace links with custom click handlers on `div` or `span` elements.
- Audit any existing code that calls `event.preventDefault()` on anchors, because it may suppress the runtime's interception.

Important limitation:

- The branch code shown here intercepts anchor clicks. It does not add a generic form-navigation layer. If the app relies on forms for route-to-route navigation, that remains an app-specific follow-up.

Handoff to implementor:

- Search for existing custom link abstractions and ensure they still render a real `<a href="...">`.
- Search for click handlers that hijack anchors and decide whether they should be removed, preserved, or integrated with this runtime.

## 7. Introduce named frames where partial updates are needed

For any region that should update independently, render a named `<Frame>` inside the full-page shell.

Example:

```tsx
<Layout title="Settings">
  <Frame name="settings" src={request.url} />
</Layout>
```

Use frames when:

- The surrounding page shell should remain mounted.
- The sub-route content should be fetched and diffed in place.
- Local client-entry state inside the frame should survive reloads.

Avoid frames when:

- The route needs a full document replacement anyway.
- The content is too tightly coupled to the rest of the page to benefit from partial updates.

## 8. Split framed routes into full-document and fragment responses

Any route that can render into a frame should support two modes:

- Normal request: return the full page shell.
- Targeted frame request: return only the fragment that belongs inside the named frame.

Typical pattern:

```tsx
function isFrameRequest(request: Request) {
  return request.headers.get("x-remix-target") === "settings";
}

if (isFrameRequest(request)) {
  return render(<SettingsLayout>{content}</SettingsLayout>);
}

return render(
  <Layout title="Settings">
    <Frame name="settings" src={request.url} />
  </Layout>,
);
```

This is the core server change that makes named-frame navigation possible.

Handoff to implementor:

- Decide which route modules should grow this dual-render behavior.
- Confirm whether frame-targeted requests should share the same loaders/auth checks as the full document response.

## 9. Mark frame-targeted links with `rmx-target` and `rmx-src`

Links that should update a named frame instead of the top document need extra attributes.

Pattern:

```tsx
<a href={href} rmx-target="settings" rmx-src={href}>
  Profile
</a>
```

What they do:

- `rmx-target`: tells the runtime which named frame should handle the navigation.
- `rmx-src`: tells the runtime what URL should become that frame's new `src` before reload.

For top-level client navigations, do not set either attribute.

Recommended implementation approach:

- If the app already has a shared link component, add optional props such as `targetFrame` and `frameSrc` there.
- Default `rmx-src` to `href` for targeted frame links unless the frame should intentionally reload a different route than the browser URL.

## 10. Add controller-level active-link matching if the UI needs section state

If the app has a sidebar that should keep one section active across multiple sub-routes, route-level matching may not be enough.

That is why the demo introduces route-controller metadata and `matchController()`.

Use this only if the app needs it.

Examples:

- Keep `Settings` active for `/settings`, `/settings/profile`, and `/settings/privacy`.
- Keep `Billing` active across an entire nested area even if only one link points at the section root.

If the app's current active-state logic already supports route groups, reuse it instead of copying the demo's controller helpers verbatim.

## 11. Validate hydration and error handling

This branch forwards more runtime failures to the top-level app runtime. Use that.

Minimum checks:

- A top-level navigation updates the page without a full reload.
- A frame-targeted navigation only updates the intended region.
- Browser back/forward keeps the expected UI in sync.
- A failed frame fetch surfaces through `app.addEventListener('error', ...)`.
- Interactive state inside reloaded frames behaves correctly.

Specific behaviors worth testing because this branch changed them:

- Checkboxes keep live checked state when the server HTML only changes defaults.
- Inputs and textareas keep user-entered values across frame diffs.
- Select state is preserved when server HTML changes serialized `selected` attributes.
- Removing framed subtrees does not leave stale client behavior behind.

## 12. Decide browser support for the Navigation API

The runtime on this branch uses `window.navigation`.

That means the implementor needs an explicit browser support decision:

- If target browsers support the Navigation API, proceed directly.
- If not, add an app-level fallback strategy before relying on client navigations broadly.

Handoff to implementor:

- Confirm the production browser matrix.
- Decide whether to feature-gate the client navigation boot, ship a fallback, or limit this feature to supported environments.

## Suggested implementation order

If the app currently has only hard navigations, implement in this order:

1. Update the browser entry to use `run({ loadModule, resolveFrame })`.
2. Update server rendering to pass `frameSrc`, `topFrameSrc`, and the new `resolveFrame(src, target, context)` shape.
3. Verify ordinary anchors perform top-level client navigations.
4. Add one named frame for a single high-value section.
5. Split that section's route responses into full-document and frame-fragment modes.
6. Add `rmx-target` and `rmx-src` only to the links that should update that frame.
7. Add grouped active-link logic only if the UI needs section-level active state.

For this repo specifically, that order is now effectively:

1. Browser boot completed.
2. SSR frame context completed.
3. Top-level nav baseline completed for the simple routes already verified.
4. Pick the first named-frame route.
5. Avoid the Jam gallery modal until nested-frame behavior is intentionally designed.

## Deliverables for the implementor

At the end of the migration, the app should have:

- A browser entry that boots `run()` using the branch API shape.
- A server render path that preserves frame context across SSR.
- A working frame resolver on both server and client.
- Real anchor links for top-level client navigation.
- Named frames only where partial updates are worth the extra complexity.
- Error handling attached to the returned app runtime.

What the implementor still needs to determine in the target app:

- Which route groups deserve named frames.
- Which links stay top-level vs become frame-targeted.
- Whether route-group active-state helpers like the demo's controller metadata are necessary.
- Whether unsupported browsers need a fallback path.
