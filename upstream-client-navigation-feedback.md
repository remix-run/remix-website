# Upstream client navigation feedback

This document is a clean handoff for follow-up work in Remix itself.

The local repo migration is effectively complete. What remains here are upstream runtime issues and product gaps discovered while moving this site onto Remix 3 client navigation.

## Current repo state

- Browser boot uses `run({ loadModule, resolveFrame })`.
- Top-level client navigation is working for the main document-level paths in this repo.
- Jam routes intentionally stay on top-level navigation only.
- The repo should not carry local hacks for runtime issues unless they are required to keep shipping.

## Likely bugs to test and fix

### 1. Nested SVG click targets are missed by click interception

Problem:

- The preview runtime's document-level click interception can miss clicks when the event target is an inner SVG node rather than the anchor itself.
- In this repo, `remix/assets/wordmark-link.tsx` needs a `pointer-events-none` wrapper around the SVG to make anchor interception reliable.

Expected behavior:

- Normal anchor interception should work even when the actual click target is nested SVG content inside the anchor.

Why this matters:

- This is ordinary anchor markup, not an exotic custom component case.
- App code should not need CSS hit-target workarounds just to get basic link interception.

Suggested verification:

1. Render an anchor whose contents are an inline SVG tree.
2. Click a nested SVG node, not just the anchor box.
3. Verify client navigation intercepts consistently.

## Runtime/product gaps worth validating upstream

### 2. Top-level navigations do not fully reconcile document state

Observed gaps in this repo:

- route-scoped metadata did not reliably update on in-app navigation
- forced theme state on `<html>` and `<body>` was not automatically cleared or replaced
- route-scoped stylesheet links such as the Jam CSS asset did not have a built-in navigation story

Local mitigation used here:

- explicit client entries for document head sync
- global preload of `jam.css` in the document shell

Preferred upstream outcome:

- a more declarative built-in story for document head reconciliation on top-level navigation
- consistent `<html>` and `<body>` attribute/class updates during navigation
- better route-asset preload/prefetch semantics for navigation-critical styles

Why this matters:

- Without this, apps have to hand-roll document/head synchronization and asset warming for route families.

## Useful local context for an upstream agent

- The clearest repo-local examples are in:
  - `remix/assets/entry.ts`
  - `remix/utils/render.ts`
  - `remix/assets/wordmark-link.tsx`
  - `remix/assets/document-head-sync.tsx`
  - `remix/components/document.tsx`
  - `remix/routes/jam-2025-gallery.tsx`
- For upstream runtime details, inspect the local Remix checkout at `~/remix/code` or `~/code/remix`.
- Useful search command:

```sh
cd ~/code/remix
rg -n "rmx-target|rmx-src|rmx-document|navigate\(|<Frame|matchController|run\(" demos/frame-navigation demos/frames packages/component -g '!**/dist/**'
```

## Recommended upstream task split

1. Reproduce and fix missed interception on nested SVG click targets.
2. Evaluate whether document/head reconciliation gaps are bugs, missing APIs, or expected app-owned behavior.
3. Clarify docs around links that must bypass interception entirely, including when `rmx-document` is required.
