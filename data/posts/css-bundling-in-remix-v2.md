---
draft: true
title: CSS Bundling in Remix v2
summary: Remix now provides built-in support for CSS Modules, Vanilla Extract, Tailwind and PostCSS.
featured: false
date: 2023-04-05
image: /blog-images/headers/css-bundling-in-remix-v2.jpg
imageAlt: Close-up photo of cupcakes
imagePosition: bottom
authors:
  - Mark Dalgleish
---

With the release of Remix v2, we're introducing some major additions to the way we handle CSS, as well as some quality-of-life improvements to our existing CSS solutions. This post will explain what's changing and why.

## Background

Remix has always had a strong focus on web fundamentals, and CSS is no exception.

In Remix, each route can attach CSS files to the page via plain old `<link>` tags. These are defined using link descriptor objects returned from the exported `links` function. Remix then manages the lifecycle of these during server-rendering and subsequent browser navigations.

```ts
import tailwindStylesHref from "./tailwind.css";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: tailwindStylesHref,
    },
  ];
}
```

This foundation meant that Remix was able to support a wide range of CSS solutions—basically, anything that can output a plain CSS file.

However, this came with a couple of tradeoffs.

Firstly, this meant that some of the most widely used tools in the Remix community like Tailwind and PostCSS required a lot of boilerplate to get started.

Secondly, this didn't cover everything. Many popular CSS solutions require bundler integrations that were at odds with Remix's more straightforward approach to CSS. This was particularly painful for those looking to migrate existing projects to Remix.

With the release of Remix v2, we've been able to revisit our approach to styling and provide additional support for some of the most popular CSS bundling solutions—unlocking several new abilities and streamlining some old ones.

## CSS Modules

Up until now, one of the most requested features for Remix has been CSS Modules support. The challenge with CSS Modules is that it works very differently compared to the way regular CSS files work in Remix.

When importing a CSS file, Remix provides you with a string containing the file's public URL.

```ts
import href from './tailwind.css';

console.log(href);
// -> "/build/_assets/tailwind-5SPCWDMG.css"
```

In contrast, when CSS Modules you're given a `styles` object that maps human-readable class names to globally unique hashes.

```tsx
import styles from './styles.module.css';

console.log(JSON.stringify(styles));
// -> '{"root":"styles-module__root__a7w4m"}'

export default function() {
  return <div className={styles.root}>...</div>;
}
```

In this model, we're not given any way to access the URL of the generated CSS file. This seems to clash with how Remix typically manages CSS. If we can't access the file's URL, how can we add it to the page?

This is where the new `@remix-run/css-bundle` package comes in. To show how this works, we'll first install the package from npm.

```sh
npm install @remix-run/css-bundle
```

This package exports a `cssBundleHref` string that provides the public URL to the generated CSS bundle. We can attach this to a link descriptor returned from one of our `links` functions, most likely at the root of the application.

```ts
// app/root.tsx
import { cssBundleHref } from "@remix-run/css-bundle";

export const links = () => {
  return [
    // Check if `cssBundleHref` is defined first!
    // The app might not have any bundled CSS (yet)
    ...(cssBundleHref
      ? [{ rel: "stylesheet", href: cssBundleHref }]
      : []),
    // ...
  ];
};
```

Now that we've hooked up the CSS bundle to our app, we can now opt into CSS Modules via the `.module.css` file name convention.

```css
/* styles.module.css */
.root {
  border: solid 1px;
  background: white;
  color: #454545;
}
```

```tsx
// Button.tsx
import styles from "./styles.module.css";

export const Button = React.forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <button
        {...props}
        ref={ref}
        className={styles.root}
      />
    );
  }
);
Button.displayName = "Button";
```

## Vanilla Extract

Another popular CSS solution in the React ecosystem is [Vanilla Extract.](https://vanilla-extract.style)

Vanilla Extract lets you use TypeScript as your CSS preprocessor, via a special `.css.ts` file extension, while generating plain CSS files at build time. This means you get the best of both worlds—the type safety of TypeScript and the performance of plain CSS.

To get started, we first need to install the core `@vanilla-extract/css` package.

```sh
npm install @vanilla-extract/css
```

Vanilla Extract support is built on top of the same CSS bundling setup that we used for CSS Modules. For example, our earlier CSS Modules example could be rewritten using Vanilla Extract like this:

```ts
// styles.css.ts
import { style } from '@vanilla-extract/css';

export const root = style({
  border: 'solid 1px',
  background: 'white',
  color: '#454545',
});
```

```tsx
// Button.tsx
import * as styles from "./styles.css";

export const Button = React.forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <button
        {...props}
        ref={ref}
        className={styles.root}
      />
    );
  }
);
Button.displayName = "Button";
```

With this basic example, we'll now start getting type errors if a class name doesn't exist—but it doesn't end there. This benefit extends to the style sheets themselves, ensuring that our themes, design tokens and other CSS generation logic is type safe. This is especially useful for design systems where you'll want to programmatically generate CSS variables, styles and utilities based on your design tokens and then provide type-safe access to your consumers.

For more information, check out the [Vanilla Extract documentation.](https://vanilla-extract.style)

## CSS Side-Effect Imports

In the React ecosystem, it's not uncommon to see plain CSS files imported as side-effects.

```js
import "./styles.css";
```

This is sometimes leveraged by component libraries that want to ship plain CSS files (e.g. [React Spectrum](https://react-spectrum.adobe.com/react-spectrum/index.html)) while allowing bundlers to exclude CSS from unused components.

In Remix v2, once CSS bundling has been set up in your project, CSS side-effect imports like this are now supported automatically.

```css
/* Button.css */
.Button__root {
  border: solid 1px;
  padding: 12px;
  background: white;
  color: #454545;
}
```

```tsx
// Button.jsx
import './Button.css';

export function Button(props) {
  return <button className="Button__root" {...props} />;
}
```

Since JavaScript runtimes don't support importing CSS in this way, you'll also need to add any packages using this pattern to the `serverDependenciesToBundle` option in your `remix.config.js` file. This ensures that any CSS imports are compiled out of your code before running it on the server.

```js
// remix.config.js
/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverDependenciesToBundle: [
    /^@adobe\/react-spectrum/,
    /^@react-spectrum/,
    /^@spectrum-icons/,
  ],
  // ...
};
```

## Tailwind

One of the most popular CSS solutions in the Remix ecosystem is [Tailwind](https://tailwindcss.com/). The Remix documentation originally recommended setting up multiple npm scripts to run alongside the core Remix scripts.

```json
{
  "scripts": {
    "build": "run-s \"build:*\"",
    "build:css": "npm run generate:css -- --minify",
    "build:remix": "remix build",
    "dev": "run-p \"dev:*\"",
    "dev:css": "npm run generate:css -- --watch",
    "dev:remix": "remix dev",
    "generate:css": "npx tailwindcss -o ./app/tailwind.css",
    "start": "remix-serve build"
  }
}
```

This setup was obviously a bit cumbersome. Now, with Remix v2, this is no longer needed. As long as your project depends on `tailwindcss`, Remix automatically supports Tailwind's functions and directives in your CSS files.

This means any npm scripts for generating Tailwind CSS files can be removed from `package.json`. Our earlier example could now be simplified to this.

```json
{
  "scripts": {
    "build": "remix build",
    "dev": "remix dev",
    // etc.
  }
}
```

Instead, we just need a CSS file containing the core Tailwind directives. For example, we can create a `tailwind.css` file in our `app` directory.

```css
/* app/tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

We can then import this into our app as we did previously, but this time without needing to generate it first using the Tailwind CLI.

```ts
// app/root.tsx
import tailwindStylesHref from "./tailwind.css";

export function links() {
  return [
    {
      rel: "stylesheet",
      href: tailwindStylesHref,
    },
  ];
}
```

This also means that you can now use [Tailwind functions and directives](https://tailwindcss.com/docs/functions-and-directives) anywhere in your CSS—not just in your `tailwind.css` file.

While Tailwind uses PostCSS under the hood, Remix doesn't require you to set up PostCSS in order to use this feature. If all you care about is Tailwind support then you're good to go!

## PostCSS

The original PostCSS setup guide for Remix recommended a project structure where CSS source files lived in a top-level `styles` directory and were then compiled into `app/styles`. This, too, was coordinated with npm scripts.

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:css\" \"remix dev\"",
    "dev:css": "postcss styles --base styles --dir app/styles -w",
    // etc.
  }
}
```

With Remix v2, this is no longer needed. If a `postcss.config.js` file is present in your project, Remix will automatically run PostCSS on any imported CSS files. This means that your CSS source files can now be co-located with your component code.

This also means that, just like when using the new built-in Tailwind support, your npm scripts can be simplified too.

```json
{
  "scripts": {
    "dev": "remix dev",
    // etc.
  }
}
```

## Have Your Say

There's plenty of room for us to make it even easier to style your Remix app. If you have any ideas or feedback for us, you can take part in our [open development process](./open-development) by reaching out via [GitHub Discussions.](https://github.com/remix-run/remix/discussions)

## More Information

For more information about all of the different CSS approaches that Remix supports, check out the [Remix styling guide.](https://remix.run/docs/en/guides/styling)
