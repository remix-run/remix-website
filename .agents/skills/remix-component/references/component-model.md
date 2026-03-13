## Component Model

Every component has two phases:

1. Setup phase: runs once per instance
2. Render phase: returned function runs on initial render and every update

```tsx
import type { Handle } from "remix/component";

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

- Keep state in setup scope as plain JS variables.
- Store only what affects rendering.
- Derive computed values in render.
- Do not mirror input state unless you truly need controlled behavior.
- Use `setup` only for one-time initialization inputs.

## Handle Usage

- `handle.update()`:
  - schedule a rerender
  - await it when you need DOM to exist before follow-up work
- `handle.queueTask(task)`:
  - use for post-render DOM work, reactive loading, focus, scroll, measurement
  - receives an `AbortSignal`
- `handle.signal`:
  - aborted when the component disconnects
- `handle.id`:
  - stable per instance
- `handle.context`:
  - ancestor/descendant communication
- `handle.frame` / `handle.frames`:
  - frame-aware behavior for client entries rendered inside frames

## Global Events

In the current package direction, prefer:

```tsx
import { addEventListeners } from "remix/component";

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
