## Hydration

Use `clientEntry()` to mark interactive islands and `run()` to hydrate them.

```tsx
export let Counter = clientEntry(`${assets.entry}#Counter`, (handle: Handle) => {
  let count = 0;
  return () => (
    <button mix={[on("click", () => {
      count++;
      handle.update();
    })]}>
      {count}
    </button>
  );
});
```

```tsx
let app = run({
  async loadModule(moduleUrl, exportName) {
    let mod = await import(moduleUrl);
    return mod[exportName];
  },
  async resolveFrame(src, signal, target) {
    let headers = new Headers({ accept: "text/html" });
    if (target) headers.set("x-remix-target", target);
    let response = await fetch(src, { headers, signal });
    return response.body ?? (await response.text());
  },
});

app.addEventListener("error", (event) => {
  console.error(event.error);
});

await app.ready();
```

Rules:

- `run()` now takes only the init object.
- `app.ready()` waits for initial hydration.
- `app` emits top-level runtime errors.
- Client entry props must be serializable.

## Frames

Use `<Frame>` for server-rendered regions that should load or reload independently.

Server rendering shape:

```tsx
import { renderToStream } from "remix/component/server";

let stream = renderToStream(<App />, {
  frameSrc: request.url,
  topFrameSrc: request.headers.get("x-remix-top-frame-src") ?? request.url,
  resolveFrame(src, target, context) {
    let currentFrameSrc = context?.currentFrameSrc ?? request.url;
    let url = new URL(src, currentFrameSrc);
    return fetch(url).then((response) => response.text());
  },
});
```

Key points:

- `frameSrc` seeds SSR frame state for the current render.
- `topFrameSrc` preserves the outer document URL across nested frame renders.
- `resolveFrame(src, target, context)` receives the target and nested-frame context.
- Frame content can be HTML strings, streams, or Remix nodes.

## Navigation

Prefer real anchors for normal document navigation.

When you need app-driven navigation, use:

- `navigate(href, options)`
- `link(href, options)` mixin

Attributes understood by the runtime:

- `rmx-target`
- `rmx-src`
- `rmx-document`

## Explicit Head

Head hoisting is gone.

Do not rely on route-local bare `title`, `meta`, `link`, `style`, or JSON-LD tags being hoisted automatically. Render an explicit `<head>` in your document/layout structure and manage reconciliation intentionally when client navigation changes document state.
