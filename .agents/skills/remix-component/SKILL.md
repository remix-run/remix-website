---
name: remix-component
description: "Build UIs with Remix Component. Use when creating components, handling state, writing event handlers, using context, styling with css prop, managing data loading, writing tests, or implementing navigation in a Remix app."
---

# Remix Component

Build interactive UIs using the Remix Component framework — a two-phase component model with plain JS state, explicit updates, and web-standards-first design.

## When to Use

- Creating new Remix components or pages
- Implementing state management, event handling, or data loading
- Styling with the `css` prop (pseudo-selectors, media queries, nesting)
- Setting up context for ancestor/descendant communication
- Writing component tests with `root.flush()`
- Adding navigation with `navigate()` or the `link` mixin

## Quick Reference

### Component Shape

```tsx
import type { Handle } from "remix/component";

function MyComponent(handle: Handle, setup: SetupType) {
  // Setup phase: runs once
  let state = initialValue;

  // Return render function: runs on every update
  return (props: Props) => <div>{state}</div>;
}
```

### Key APIs

| API                                             | Purpose                                             |
| ----------------------------------------------- | --------------------------------------------------- |
| `handle.update()`                               | Schedule re-render, returns `Promise<AbortSignal>`  |
| `handle.queueTask(fn)`                          | Run work after next update (receives `AbortSignal`) |
| `handle.signal`                                 | Aborted when component disconnects                  |
| `handle.on(target, listeners)`                  | Auto-cleaned event listeners                        |
| `handle.context.set(value)` / `.get(Component)` | Context API                                         |
| `handle.id`                                     | Stable instance ID                                  |
| `mix={[on('event', handler)]}`                  | DOM event listeners on elements                     |
| `mix={[ref(callback)]}`                         | DOM node reference after render                     |
| `css={{ ... }}`                                 | Static styles with pseudo/media/nesting support     |
| `style={{ ... }}`                               | Dynamic styles that change frequently               |
| `root.flush()`                                  | Synchronous flush for tests                         |

### Event Listeners

Host-element `on` props were **removed**. Use `mix` with the `on` helper:

```tsx
<button
  mix={[
    on("click", () => {
      count++;
      handle.update();
    }),
  ]}
>
  Click
</button>
```

Event handlers receive an `AbortSignal` as the second argument — aborted on re-entry or disconnect.

## Procedure

1. **Read the full guide** — Load [./references/component-guide.md](./references/component-guide.md) for the complete API reference, patterns, and examples.
2. **Follow two-phase structure** — Setup (once) returns a render function (every update). Never put one-time init inside the render function.
3. **Use plain JS state** — Variables in setup scope + `handle.update()`. Derive computed values in render; don't store what you can compute.
4. **Do work in event handlers** — Keep transient state in handler scope. Only capture to component state if needed for rendering.
5. **Use `queueTask` correctly** — In event handlers for post-DOM work (focus, scroll). In render for reactive data loading. Never create intermediate state just to react to it.
6. **Style with `css` for static, `style` for dynamic** — `css` supports `&:hover`, `& .child`, `@media`. Use `style` for values that change on updates.
7. **Manage signals** — Pass `signal` to `fetch()` and check `signal.aborted` after async work.
8. **Test with `root.flush()`** — Flush after `render()` and after events that trigger `handle.update()`.

## Common Mistakes

- Using `on` props on host elements (removed — use `mix={[on(...)]}`)
- Storing input values in state when only needed on submit (use `FormData`)
- Creating state to "react to" in `queueTask` (do work directly)
- Using `css` for dynamic values that change every render (use `style`)
- Forgetting `root.flush()` in tests after events
- Managing hover/focus state in JS instead of CSS nested selectors
