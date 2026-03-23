## Component Model

Every component has two phases:

1. Setup phase: runs once per instance
2. Render phase: returned function runs on initial render and every update

```tsx
import { on, type Handle } from "remix/component";

function Counter(handle: Handle, initialCount = 0) {
  let count = initialCount;

  return (props: { label: string }) => (
    <button
      mix={[
        on("click", () => {
          count++;
          handle.update();
        }),
      ]}
    >
      {props.label}: {count}
    </button>
  );
}
```

## State Rules

- Keep state in setup scope as plain JavaScript variables.
- Store only what affects rendering.
- Derive computed values in render.
- Do not mirror input state unless you truly need controlled behavior.
- Use `setup` only for one-time initialization inputs.
- Prefer the smallest state shape that matches the real interaction model.
- When several locals only exist for one active interaction, consider grouping them into a single session object instead of scattering them across setup scope.
- If data is only needed by an immediate child, prefer props over `handle.context`.

## Handle Usage

- `handle.update()`
  - schedules a rerender
  - await it when you need updated DOM before follow-up work
- `handle.queueTask(task)`
  - use for post-render DOM work, reactive loading, focus, scroll, or measurement
- `handle.signal`
  - aborted when the component disconnects
- `handle.id`
  - stable per instance
- `handle.context`
  - ancestor or descendant communication
- `handle.frame` and `handle.frames`
  - frame-aware behavior for client entries rendered inside frames

## Practical Demos

If you want concrete examples beyond the API docs, these demos are especially useful:

- [`readme/entry.tsx`](https://github.com/remix-run/remix/blob/main/packages/component/demos/readme/entry.tsx)
  - practical examples of `handle.queueTask(...)`, `await handle.update()`, focus after state
    changes, scroll coordination, refs, and local state ownership
- [`controlled-uncontrolled-values/entry.tsx`](https://github.com/remix-run/remix/blob/main/packages/component/demos/controlled-uncontrolled-values/entry.tsx)
  - useful for input ownership, controlled vs uncontrolled tradeoffs, and when remounting is the
    simplest reset strategy
- [`drummer/app.tsx`](https://github.com/remix-run/remix/blob/main/packages/component/demos/drummer/app.tsx)
  - useful as a larger multi-file example of component organization, with both good patterns and a
    few older patterns worth scrutinizing

## Global Events

Prefer:

```tsx
import { addEventListeners, type Handle } from "remix/component";

function ResizeTracker(handle: Handle) {
  let width = window.innerWidth;

  addEventListeners(window, handle.signal, {
    resize() {
      width = window.innerWidth;
      handle.update();
    },
  });

  return () => <div>{width}</div>;
}
```

## Behavior Boundaries

- Use `mix={[on(...)]}` for stable host behavior that should exist for the element's whole mounted lifetime.
- Use imperative `addEventListener(..., { signal })` when listeners should only exist for a short-lived session, such as an active drag.
- If a visible UI change can be derived from component state, prefer rendering it via `class` or `style` instead of imperatively mutating the DOM.
