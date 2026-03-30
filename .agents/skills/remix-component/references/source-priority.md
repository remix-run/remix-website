## Source Priority

Use these sources in this order when working with Remix Component in this repo:

1. `AGENTS.md`
2. `.agents/skills/remix-component/SKILL.md`
3. Sibling docs in `.agents/skills/remix-component/references/*.md`
4. Nearby application code under `app/**`
5. Installed package source only when local repo guidance is insufficient

## Current API Deltas

Use these current patterns:

- Host `on` prop was removed:
  - Old: `<button on={{ click() {} }} />`
  - New: `<button mix={[on('click', () => {})]} />`
- Host `css` prop runtime support was removed:
  - Old: `<div css={{ color: 'red' }} />`
  - New: `<div mix={[css({ color: 'red' })]} />`
- Host `animate` prop runtime support was removed:
  - Old: `<div animate={{ enter: true, exit: true, layout: true }} />`
  - New: `<div mix={[animateEntrance(), animateExit(), animateLayout()]} />`
- Host `connect` prop was removed:
  - Old: `<div connect={(node) => {}} />`
  - New: `<div mix={[ref((node) => {})]} />`
- `@remix-run/interaction` is gone.
- Component `handle.on(...)` is gone:
  - Use `addEventListeners(target, handle.signal, listeners)` for global listeners.

## Navigation / Frames Deltas

- `run(document, init)` became `run(init)`.
- `run()` returns a typed runtime `EventTarget`; listen on `app.addEventListener('error', ...)`.
- `resolveFrame(src, signal, target)` receives the optional named target.
- `renderToStream()` supports `frameSrc` and `topFrameSrc`.
- Head hoisting was removed. Render an explicit `<head>` in the document tree.
- Navigation attributes:
  - `rmx-target` targets a mounted frame
  - `rmx-src` overrides the fetched frame source
  - `rmx-document` forces a full document navigation
- Prefer `navigate(href, options)` or the `link(href, options)` mixin for imperative/declarative app-driven navigation when plain anchors are not enough.
