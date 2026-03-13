## Host Elements

For host elements, compose behavior with `mix`, not legacy host props.

Common mixins exported from `remix/component`:

- `on(...)`
- `ref(...)`
- `css(...)`
- `link(...)`
- `pressEvents(...)`
- `keysEvents(...)`
- `animateEntrance(...)`
- `animateExit(...)`
- `animateLayout(...)`

## Events

Use `mix={[on(type, handler)]}` for DOM event listeners.

```tsx
<form
  mix={[
    on("submit", async (event, signal) => {
      event.preventDefault();
      let formData = new FormData(event.currentTarget);
      await submit(formData, { signal });
    }),
  ]}
/>
```

Rules:

- Event handlers may receive `signal`.
- Pass `signal` to async work when possible.
- Check `signal.aborted` after async work if the API cannot cancel itself.
- Prefer semantic press behavior over raw click when accessibility or touch behavior matters:
  - use `pressEvents(...)` or the package animation/interaction skills when relevant

## Refs

Use `ref(...)` for DOM node access:

```tsx
<input mix={[ref((node) => node.focus())]} />
```

## Styling

Current package direction prefers the `css(...)` mixin for static stylesheet-like rules and `style={...}` for dynamic values.

```tsx
<button
  mix={[
    css({
      color: "white",
      backgroundColor: "blue",
      "&:hover": { backgroundColor: "darkblue" },
      "@media (max-width: 768px)": { width: "100%" },
    }),
  ]}
  style={{ opacity: disabled ? 0.5 : 1 }}
/>
```

Use `css(...)` for:

- pseudo selectors
- nested selectors
- media queries
- static styles that should not regenerate every update

Use `style` for:

- dynamic numeric/string values
- frequently changing transforms, sizes, positions, opacity, etc.

## Animation

Use animation mixins instead of the removed `animate` prop:

```tsx
<div
  key={item.id}
  mix={[
    animateEntrance({ opacity: 0, transform: "scale(0.98)" }),
    animateExit({ opacity: 0 }),
    animateLayout(),
  ]}
/>
```

For deeper animation guidance, also read:

- `references/remix/packages/component/skills/animate-elements/SKILL.md`
- `references/remix/packages/component/skills/create-mixins/SKILL.md` when authoring new mixins
