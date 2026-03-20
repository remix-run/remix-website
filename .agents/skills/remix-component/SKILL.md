---
name: ui
description: Build the UI of a Remix app. Use when creating pages, layouts, client entries, interactions, stateful UI, navigation, hydration, styling, animations, reusable mixins, or UI tests.
---

# Build UI

Use this skill when building the UI of a Remix app.

This skill uses Remix Component as the UI model behind the app's pages, layouts, interactions, and
client behavior.

## When to Use

- Creating or updating pages, layouts, and presentational components
- Adding interactivity, state, event handling, or reactive DOM work
- Styling with `css(...)`, `style`, refs, keyboard helpers, or press helpers
- Adding or refactoring `clientEntry(...)`, `run(...)`, frames, or UI navigation
- Implementing enter/exit/layout animations
- Authoring reusable mixins with `createMixin(...)`
- Writing or updating UI-focused component tests

## Procedure

1. Follow the two-phase component shape:
   - setup runs once
   - returned render function runs on every update
2. Keep state in setup scope as plain JavaScript variables and call `handle.update()` explicitly.
3. Prefer the simplest shape that clearly matches ownership:
   - inline one-use logic instead of extracting tiny helpers that are only called once
   - prefer props for direct parent-to-child coordination
   - use `handle.context` only for real ancestor/descendant communication, not callback plumbing to an immediate child
   - extract wrapper components or custom mixins only when they clarify ownership or are likely to be reused
4. Prefer host-element mixins over legacy host props:
   - `mix={[on(...)]}`
   - `mix={[css(...)]}`
   - `mix={[ref(...)]}`
   - `mix={[keysEvents()]}`
   - `mix={[pressEvents()]}`
   - `mix={[link(href, options)]}`
5. Use `addEventListeners(target, handle.signal, listeners)` for global listeners.
6. Split persistent host behavior from short-lived interaction sessions:
   - use `mix={[on(...)]}` for stable host behavior
   - use imperative `addEventListener(..., { signal })` when listeners should only exist for an active session like a drag
7. Prefer render-driven classes and `style` for visible UI state when it can be derived from component state. Avoid imperative DOM writes for things like cursor, classes, or inline styles unless the DOM change is truly transient and non-rendered.
8. Use `queueTask(...)` for post-render DOM work, reactive effects, or hydration-sensitive setup.
9. Keep `<head>` explicit in document or layout code.
10. Test with real interactions and `root.flush()` when unit tests need synchronous assertions.

## Load These References As Needed

- [./references/component-model.md](./references/component-model.md)
  Use for component shape, state, `handle` usage, and global listeners.
- [./references/mixins-styling-events.md](./references/mixins-styling-events.md)
  Use for host-element events, refs, styling, and built-in behavior helpers. Prefer these helpers
  over re-implementing keyboard, press, link, or animation behavior yourself.
- [./references/hydration-frames-navigation.md](./references/hydration-frames-navigation.md)
  Use for `clientEntry`, `run`, frames, SSR frame context, navigation APIs, and explicit `<head>`
  management.
- [./references/testing-patterns.md](./references/testing-patterns.md)
  Use for component tests, `root.flush()`, and high-value testing heuristics.
- [./references/animate-elements.md](./references/animate-elements.md)
  Use when the task is about enter/exit transitions, FLIP reordering, shared-layout swaps, or
  animation-heavy interactions in app code.
- [./references/create-mixins.md](./references/create-mixins.md)
  Use when authoring or reviewing reusable mixins, touching `createMixin(...)`, using
  `handle.addEventListener('insert' | 'remove', ...)`, or reasoning about mixin lifecycle
  semantics and type flow.
- [packages/component/docs](https://github.com/remix-run/remix/tree/main/packages/component/docs)
  Use as the general upstream docs directory when the local references here are not enough and you
  need to choose the most relevant Component docs to open.
