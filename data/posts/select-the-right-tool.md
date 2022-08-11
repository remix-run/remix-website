---
title: "<Select> The Right Tool For The Job"
summary: A static file server won’t know how to handle the default browser requests from a <select>, showing that our technology choices are more interconnected than we often think. Remix can help, as it embraces characteristics inherent to the web such as a progressive enhancement and a server/client model.
date: 2022-08-11
featured: true
image: /blog-images/posts/select-the-right-tool/post-image.jpg
imageAlt: "The markup `<select>…</select>` in a monospace font with syntax highlighting."
authors:
  - Jim Nielsen
---

## tl;dr

If you’re using a static file server to serve an HTML page which uses a `<select>` element to provide user navigation, you cannot achieve path-based navigation without 1) client-side JavaScript, or 2) server-side redirect logic.

In other words, path-based navigation with a `<select>` element will break for users where [JavaScript fails](https://kryogenix.org/code/browser/everyonehasjs.html) — fails to load due to a network issue or a user preference, fails to parse, fails to execute, etc. — unless you control the server and can redirect a path + query parameters (`/path?foo=bar`) to a different path (`/path/bar`).

## The Problem

A lot of sites use a `<select>` element to afford user navigation.

It’s a tidy, spacing-saving solution that collapses a large number of choices into a single UI element, providing navigational options at the time they’re needed.

As a developer, an example of this you might see a lot is the “docs version switcher”.

![Example of a website header navigation bar that shows the logo “Docs Website” and right next to it a select element with a semver version of 4.17.15][img-1]

The neat thing about a `<select>` element is that, when clicked, it triggers a menu drawn by the underlying operating system in a manner best suited (and accessible) to the given user’s device and preferences.

In the case of a “docs version switcher”, you interact with the `<select>` and it gives you a menu of choices. Once you choose an option, it navigates you to your selected version of the docs.

![Example of a website header navigation bar that shows the logo “Docs Website” and right next to it a select element that is open and showing a menu of different semver options][img-2]

A common way to create this would be to write the `<select>` markup and then add a JavaScript handler that redirects the user to the selected version of the docs.

```html
<select onChange={(e) => {
  e.preventDefault();
  const version = e.target.value;
  window.location = "/docs/" + (version === "main" ? "" : version);
}}>
  <option value="main">Latest</option>
  <option value="6.3.0">6.3.0</option>
  <option value="5.x">5.x</option>
</select>
```

However, without JavaScript that `onChange` handler does absolutely nothing.

So, if you’re aiming for a progressively-enhanced experience, how do you use `<select>`_?_

### Making Things Work Before (Or Without) JavaScript

By default (and before/without JavaScript), the `<select>` element won’t submit anywhere on its own. For that, it needs a `<form>`. It also won’t submit when changed. For that it needs a `<button>`. Combined, these constitute the semantics in HTML for declaratively describing the navigation a form will make.

```html
<form action="/docs" method="GET">
  <select name="version">
    <option value="main">Latest</option>
    <option value="6.3.0">6.3.0</option>
    <option value="5.x">5.x</option>
  </select>
  <button type="submit">Switch</button>
</form>
```

When this form submits, it will do a GET to the `action` with the form elements parameterized, e.g. `/docs?version=6.3.0`

Now we have markup properly suited to the task of progressively-enhanced navigation (sprinkle some JS in there and you can hide the submit button, that way if/when JS executes the form submits `onChange` and the user is unencumbered by the presence of an unnecessary submit button).

But will this experience work before (or without) JavaScript? Maybe. There’s another caveat.

### Are You Using a Static File Server?

If you’re doing static site generation, i.e. creating static HTML files on disk that map to URLs, you’ve got another obstacle to using `<select>`: routing.

In the “docs switcher” example, a standard SSG approach would mean architecting your site to generate different versions of the docs within different, nested folders on the file system whose structure will parity your public-facing URLs.

For example, your file structure is:

```
docs/
├── index.html
├── foo/
│   └── ...
├── bar/
│   └── ...
└── 6.3.0/
│   ├── index.html
│   ├── foo/
│   │   └── ...
│   ├── bar/
│   │   └── ...
└── 5.x/
    ├── index.html
    └── old-foo/
```

This would result in the following URLs:

- `/docs/` Latest version of the docs
- `/docs/6.3.0/` Specific version of the docs
- `/docs/5.x/` Previous major version of the docs

However, as noted, by default the browser uses `<select>` to create a parameterized request. And for a static file server, a request to the same path but with different query parameters will result in the same response, e.g. a request for `/docs?version=5.3.0` will result in the same response as a request for `/docs?version=3.2.0`.

Routing based on query parameters is impossible for SSG without assuming 1) working JavaScript on the client, or 2) control over a (host-specific) request/response mechanism on the server.

This presents a problem for you: you crafted a nice solution built on the native, semantic primitives of the web — the `<form>`, `<select>`, and `<button>` elements — but now you have a crisis around your site’s architecture because of how it’s built and hosted.

Now you have to consider your options. Here are a few:

- Stop caring about a progressively-enhanced solution.
  - _Pro:_ easy.
  - _Con:_ if a browser can’t (or won’t) run your JavaScript, the user can’t navigate your site.
- Implement a redirect _on the server_ which takes the `/docs?version=*` request from the browser and redirects it to the appropriate `/docs/*` path.
  - _Pro:_ maintain your current UI solution using a `<select>`.
  - _Con:_ now you’re taking control of the server, which is what you were likely trying to avoid with an SSG approach, and relying on the host-specific escape hatch for server-side control in a static file server environment.
- Re-think your UI solution of a “docs switcher” from a `<select>` element to something more tailored to your site’s architecture, e.g a list of links whose `href` attributes you can control for path-based routing.
  - _Pro:_ maintains progressive enhancement and lets you control routing without needing server-side control.
  - _Con:_ can’t leverage the UI benefits of a `<select>` — now or in the future.
- Consider re-architecting how your site is built and hosted.
  - _Pro:_ will likely scale with you in the future as you encounter other static site limitations and creeping lock in from host-specific escape hatches.
  - _Con:_ who wants to re-architect their entire site just to use a `<select>`?

## Working With The Materials of The Web

More than you ever wanted to know about `<select>`? It’s intended to illustrate how interconnected our decision making can be when creating a website. If you’re planning on providing a universally-accessible, progressively-enhanced experience, then which HTML element you use can have ramifications for your choice of server and host.

Using `<select>` instead of `<a>` has its ramifications and tradeoffs (both on you as a developer and on your users). In the case of a `<select>` element, it visually collapses a large number of options into a single point of interaction whose UI is (in large part) under the control of the operating system. But functionally it is a form request which works by parameterizing the request URL.

A form like this:

```html
<form action="/docs" method="GET">
  <select name="version">
    <option value="main">Latest</option>
    <option value="6.3.0">6.3.0</option>
    <option value="5.x">5.x</option>
  </select>
  <button type="submit">Switch</button>
</form>
```

Is a navigation on the web. Navigationally, it is similar to a set of links like this:

```html
<a href="/docs?version=main">Latest</a>
<a href="/docs?version=6.3.0">6.3.0</a>
<a href="/docs?version=5.x">5.x</a>
```

A link gives you, the developer, more declarative control over navigation (you can easily change the `href` from query parameters to paths, for example). But it’s also a different experience for the end user. A `<select>` hides navigation options behind a menu while a set of links is revealed all at once.

You could, for example, try to mimic hiding a set of options behind a user interaction using something like `<details>`:

```html
<details>
  <summary>Version: 6.3.0</summary>
  <ul>
    <li><a href="/docs/main">Latest</a></li>
    <li><a href="/docs/6.3.0">6.3.0</a></li>
    <li><a href="/docs/5.x">5.x</a></li>
  </ul>
</details>
```

But it’s still not equivalent. `<select>` triggers a menu drawn by the OS, while `<details>` would necessitate that you ”roll your own“ menu.

The point is, when considering a progressively-enhanced experience that will be accessible to the widest range of users, your technology choices are interconnected and opinionated. Some play nice with each other, others do not.

## Where Remix Fits In

Remix aligns itself with web fundamentals, including [a server/client model, web standards, and progressive enhancement](https://remix.run/docs/en/v1/pages/philosophy). Embracing these aspects of web development encourages web-based technology decisions that mesh more seamlessly since they follow each others’ [grain](https://frankchimero.com/blog/2015/the-webs-grain/) and [underlying principles](https://blog.jim-nielsen.com/2022/permeating-principles-of-the-web/).

Remix is also about scaling up and down. It provides you the option (i.e. a lever) to scale your solution up or down in complexity while preserving choice: use whatever web primitives best fit your problem at hand — be it the `<a>` element or a combination of the `<form>`, `<select>`, and `<button>` elements.

Remix encourages you to ask, “How can I make this work best for my users?” As opposed to being burdened with the opinions of technology which force you to ask, “How can I make this work at all?” It promotes building semantic, progressively-enhanced experiences that use elements of the web the way they were designed and created to be used.

Remix: embrace the web and build better websites.

[img-1]: /blog-images/posts/select-the-right-tool/select-1.png
[img-2]: /blog-images/posts/select-the-right-tool/select-2.png
