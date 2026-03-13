---
name: remix-component
description: "Build or update UIs with Remix Component. Use when creating Remix Component pages or client entries, handling state and events, composing mixins, styling, hydration, frames, navigation, context, or writing tests for Remix Component code."
---

# Remix Component

Build interactive UIs with Remix Component using the current mixin-based API, explicit updates, and selective hydration.

## When to Use

- Creating new Remix components or pages
- Updating existing Remix Component code to the current API
- Implementing state management, event handling, or data loading
- Adding or refactoring `clientEntry(...)`, `run(...)`, frames, or navigation
- Styling with `css(...)` mixins and `style`
- Setting up context, `TypedEventTarget`, or DOM refs
- Using or authoring mixins
- Writing component tests with `root.flush()`
- Implementing animation or link semantics with mixins

## Procedure

1. Read [./references/source-priority.md](./references/source-priority.md) first.
2. Follow the two-phase component shape:
   - setup runs once
   - returned render function runs on every update
3. Use plain JS state in setup scope plus `handle.update()`.
4. Prefer real DOM events on elements via `mix={[on(...)]}`.
5. Prefer `addEventListeners(target, handle.signal, listeners)` for global listeners.
6. Use `queueTask(...)` for post-render DOM work, reactive effects, or hydration-sensitive setup.
7. Keep `<head>` explicit in document/layout code; do not rely on head hoisting.
8. Test with real interactions and `root.flush()` where unit tests need synchronous assertions.

## Current Guardrails

- Prefer:
  - `mix={[on(...)]}`
  - `mix={[css(...)]}`
  - `mix={[animateEntrance(), animateExit(), animateLayout()]}`
  - `mix={[ref(...)]}`
- `@remix-run/interaction` is gone.
- `run()` uses `run({ loadModule, resolveFrame })`, not `run(document, ...)`.
- `app.addEventListener("error", ...)` is the top-level error surface for hydrated runtime failures.

## Load These References As Needed

- [./references/component-model.md](./references/component-model.md)
  Use for component shape, state, handle usage, and global listeners.
- [./references/mixins-styling-events.md](./references/mixins-styling-events.md)
  Use for host-element event handling, refs, styling, and animation mixins.
- [./references/hydration-frames-navigation.md](./references/hydration-frames-navigation.md)
  Use for `clientEntry`, `run`, frames, SSR frame context, and navigation APIs.
- [./references/testing-patterns.md](./references/testing-patterns.md)
  Use for component tests, `root.flush()`, and high-value testing heuristics.

## Upstream Deep Dives

Read these only when the curated references are not enough:

- `references/remix/packages/component/AGENTS.md`
- `references/remix/packages/component/docs/components.md`
- `references/remix/packages/component/docs/handle.md`
- `references/remix/packages/component/docs/patterns.md`
- `references/remix/packages/component/docs/testing.md`
- `references/remix/packages/component/docs/hydration.md`
- `references/remix/packages/component/docs/frames.md`

## Common Mistakes

- Using host `on`, `css`, `animate`, or `connect` props instead of mixins
- Using component state for transient event data or CSS-driven hover/focus behavior
- Using stylesheet-style APIs for dynamic values that should live in `style`
- Using implementation-only hooks in tests when user-observable assertions would do
- Forgetting `root.flush()` in tests after events
- Forgetting explicit document head handling during client navigation work
