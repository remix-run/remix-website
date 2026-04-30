---
title: Remix 3 Beta Preview
summary: Remix 3 is ready for you to kick the tires and start prompting your next big idea into existence.
date: 2026-04-30
draft: true
authors:
  - Michael Jackson
image: /blog-images/headers/remix-3-beta-preview.png
ogImage: /blog-images/headers/remix-3-beta-preview.png
imageAlt: "A glowing blue particle race car labeled frontend, backend, and everything in between."
imageDisableOverlay: true
---

Today we're releasing the Remix 3 beta preview.

This is still a pre-release. It is not production ready yet, and there is still a lot to do. But it is ready for you to kick the tires and tell us where the sharp edges are.

When we started [talking publicly about Remix waking up](https://remix.run/blog/wake-up-remix), we said we wanted to build something simpler, faster, and closer to the web itself. Today's beta preview is a concrete step in that direction.

The idea is simple: what would it look like if a framework owned the full stack?

Not just routing. Not just rendering. Not just a dev server. The whole thing: routes, request handlers, responses, middleware, sessions, auth, forms, uploads, assets, data and database management, UI components, theming, networking, tests ... everything.

All under one `remix` umbrella.

That does not mean every piece is welded together in a giant monolith. Remix 3 is built from [small, composable packages that can stand on their own](https://github.com/remix-run/remix/tree/main/packages). But when you're building an app, you shouldn't have to spend your time stitching together a dozen unrelated dependencies before you can make progress.

You should be able to install Remix and start building.

## Features You Can Feel

Remix 3 routes are Fetch API routes. Controllers return responses. Middleware owns the request lifecycle. Forms submit to URLs. Sessions and auth share context with your data and UI. Tests exercise the same router your server uses.

Frames are one of my favorite examples of the direction we're heading. A frame is server-rendered UI with a `src`. The client can load it, navigate it, or reload it independently while the server keeps rendering HTML. It's server/client communication that feels like the web: URLs, requests, responses, and markup instead of a separate RPC layer.

You can [see how frames work in the bookstore demo](https://github.com/remix-run/remix/blob/main/demos/bookstore/app/controllers/cart/page.tsx), where the cart page renders a server-owned cart fragment that can update independently from the rest of the page.

Remix components follow the same pattern: plain JavaScript variables for state, explicit updates, abortable async work, and reusable behavior composed with mixins. Component code is written in a procedural style that is easy to follow. First do this, then do that.

Here's a small example:

```tsx
import { type Handle, Glyph, on, ui } from "remix/ui";
import { tooltip } from "remix/ui/tooltip";

function CopyToClipboard(handle: Handle<{ url: string }>) {
  let state: "idle" | "copied" | "error" = "idle";

  return () => {
    let label =
      state === "idle"
        ? "Copy to clipboard"
        : state === "copied"
          ? "Copied"
          : "Error";

    return (
      <button
        aria-label={label}
        aria-live="polite"
        mix={[
          ui.button,
          tooltip(label),
          on("click", async () => {
            try {
              await navigator.clipboard.writeText(handle.props.url);
              if (handle.signal.aborted) return;
            } catch (error) {
              state = "error";
              handle.update();
              return;
            }

            state = "copied";
            handle.update();
            setTimeout(() => {
              if (handle.signal.aborted) return;
              state = "idle";
              handle.update();
            }, 2000);
          }),
        ]}
      >
        {state === "copied" ? (
          <Glyph name="check" />
        ) : (
          <Glyph name="clipboard" />
        )}
      </button>
    );
  };
}
```

That code is small, but it says a lot about the model. State and async behavior are right there. Styling, tooltip, and event handling compose directly on the element.

## Unbundling

One of the things I'm most excited about is our approach to assets. We're calling it "unbundling".

Modern web development has spent years treating bundling as table stakes. That can be powerful, but it also starts to shape your app. Over time, framework APIs bend around what the bundler can understand.

Remix 3 takes a different path. The runtime is the source of truth. Assets are compiled and served by Remix, but the app model does not depend on a big pre-runtime analysis step to make sense. There are no special semantics around `import` statements, for example.

That matters for humans, and I think it matters even more for agents. AI rewards frameworks with clear shapes: routes in one place, controllers that return responses, middleware that owns request lifecycle concerns, tables for data, forms that submit to URLs, frames that load from URLs and can be fetched and reloaded, and client entries for the bits of UI that actually need interactivity.

These are durable concepts. They are easy for people to reason about, and they give agents solid building blocks.

## Fewer Dependencies, More Leverage

Remix 3 also reduces how much of your app's foundation depends on somebody else's roadmap. You do not need a lot of dependencies to do significant, real work. The beta preview already includes the core pieces for serious web apps: routing, sessions, auth, forms, uploads, static files, asset delivery, data, server rendering, UI, and more.

The default experience should be cohesive. The framework should give you leverage before it gives you more decisions to make about which dependencies to use.

That's the heart of Remix 3. It feels like building a web app before building a custom toolchain.

## Try It

The Remix 3 beta preview is ready for curious builders. It is ready for experiments, demos, prototypes, and feedback. It is especially ready for you to open your editor, point an agent at the repo, and start prompting your next big idea into existence.

To get started with the current preview:

```sh
npx remix@next new my-remix-app
```

Build something small, or build something ambitious. Tell us where the model clicks, where it breaks (and it will!), what feels obvious, and what still feels weird.

We're going to keep moving quickly, following up with new features and releases every week, and your feedback now will shape what Remix 3 becomes.

This has been a labor of love, and we're excited to finally put it in your hands.

Go [try Remix 3](https://remix.run).
