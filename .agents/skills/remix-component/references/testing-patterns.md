## Testing

For component-unit tests, use `createRoot(...)` and `root.flush()`.

```tsx
let container = document.createElement("div");
let root = createRoot(container);

root.render(<Counter />);
root.flush();

container.querySelector("button")?.click();
root.flush();

expect(container.textContent).toContain("1");
```

Guidelines:

- Flush after initial render so listeners/tasks are attached.
- Flush after interactions that call `handle.update()`.
- Flush after async work resolves if the component uses `queueTask(...)`.
- Use `root.remove()` or `root.dispose()` to verify cleanup behavior when relevant.

## High-Value Patterns

- Minimal component state
- Work in event handlers first
- Use `queueTask` for post-render work
- Use `TypedEventTarget` for granular context/event subscriptions
- Prefer browser/CSS state over JS state for hover/focus when possible

## Avoid

- Testing implementation-only markers unless they are the only stable way to synchronize hydration-sensitive behavior
- Over-mocking framework behavior that can be exercised with real DOM interactions
- Repeating the same navigation assertion across many paths when one representative flow proves the behavior

## When to Load More Upstream Docs

- `references/remix/packages/component/docs/testing.md` for root/flush patterns
- `references/remix/packages/component/docs/patterns.md` for state/data/focus guidance
- `references/remix/packages/component/docs/context.md` when using `handle.context` or `TypedEventTarget`
