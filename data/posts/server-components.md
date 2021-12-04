---
title: Server Components and Remix
date: December 6, 2021
image: /remix-v1.jpg
imageAlt: "Nothing yet"
authors:
  - name: Ryan Florence
    avatar: /r.jpg
    title: Co-Founder
---

Since releasing Remix v1 two big questions keep coming up:

> `let`?!

We switched the docs to `const` because there are hills not worth dying on, or even visiting. Knock yourself out 😆

> Server Components?

Aha! Now this is something worth talking about. We've been experimenting with Suspense for years. In fact, the early versions of Remix used it. Realizing it probably wouldn't be released by the time we were ready, we built the async parts of Remix into the framework and are very happy with the results.

After following along with the React team's announcements and doing our own research into Server Components and Remix, we're excited for their potential to create a better user experience for some of your pages, but we're not sure they are the right approach for all of your app.

[What are Server Components?][server-components]

## Data Loading Strategies

When talking about rendering and data loading, there are three approaches in the React ecosystem:

1. **Fetch As You Render** - Components render a spinner, fetch data in a `useEffect`, set state, render the child components, they render spinners, they fetch, etc. If you use React Query or swr or just your own `useFetch` kind of abstraction, this is what you're doing (along with nearly every other React website).
2. **Fetch Then Render** - Fetch all of the next pages resources in parallel while keeping the old screen up, then turn the UI over to a fully rendered document. This is the default in Remix.
3. **Render As You Fetch** - Fetch all of the next pages resources in parallel, but intead of waiting for all of them, render the parts that are ready immediately. You need a framework above React to achieve this.

Without the help of a framework, Suspense and Server Components are **Fetch As You Render**. Which unfortunately is the worst one of the three (and probably what you're doing right now). This approach leads to spinners that beget spinners that bounce and jank the user all around until the page is finally complete at an artificially slowed down pace.

I say _artificially_ because all of those resources could have been fetched in parallel. They aren't because _rendering components is what kicks off the loads_. You don't know what to load until you render. Now your resource loading has artifical dependencies on the UI hierarchy. Render spinner, fetch, render new spinner, fetch, render new spinner, fetch, etc.

I took the [official Server Components demo][demo] and shuffled code around into Remix's route conventions and deployed both of them to a servers in Australia. With a good connection, you can't really tell a difference. But on a slow network, it's clear that loading in parallel is the way to go:

<iframe width="100%" height="390" src="https://www.youtube.com/embed/DUKT_eLwIAk" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

We recognize this demo from React doesn't show off the recently announced streaming server rendering. But remember, streamed rendering is still fetch as you render. Perhaps it will give the user something more useful sooner, but not the full page.

## Render As You Fetch

The strategy these React features were built for is **Render As You Fetch**, but React can't do that all by itself; it needs a framework above it to kick off a parallel load of the page's resources _before it renders_. As that framework fetches everything in parallel, React can now render the pieces that are ready as you fetch.

Facebook has a fancy compiler, Relay, backend infrastructure, and a team that gets paid way more than you and I to make this possible. **But you have Remix**.

## Server Components in Remix

Remix is uniquely positioned to take full advantage of Suspense, Server Components, and streamed rendering: it already knows everything about a page just from the URL, just what React needs for render as you fetch.

(A nice side effect of this is that Remix can prefetch all of the resources for a URL the user is expected to visit and just skip this entire conversation after the initial page load, but I digress...)

Additionally, Remix already has the benefits of colocating your server and client code, including the `{name}.client.js` and `{name}.server.js` file convention (it hints to the compiler which files should only run in one place or the other).

If Remix adopts Server Components for data loading, we think that a simple file rename is all you'll have to do to use them:

```sh
# from
routes/posts.tsx
# to
routes/posts.server.tsx
```

The `loader` and `useLoaderData` APIs won't need to change and you're already running server code in your route modules anyway. In some ways, Remix routes are already server components.

## But ... We're Not Sure

We're not sure you'll actually want to enable server components for some of your routes.

First, backend infrastructure is getting _really_ good. Not only can you can run your app servers at the edge, but you can get your data to the edge with things like [Fly.io Postgres Read Replicas][fly], [Cloudflare KV][cf-kv] and [Durable Objects][cf-durable-objects], [FaunaDB][fauna], [Deno Deploy][deno] and more. These technologies enable you to render full pages, even with user data, in mere milliseconds. Remix already works with these technologies.

If you can render a full document in under a second, rendering that in streamed chunks of UI in quick succession might actually be a degraded user experience.

There's also a significant tradeoff to consider before enabling server components in your app.

Server Components big feature is "Zero-Bundle". This has two main benefits:

1. The browser never needs to load the JavaScript bundle that contains the template that renders the server component
2. It also removes the need for the typical React SSR inline hydration `<script>` full of JSON that's repeated in the markup already (open the devtools here on this site and you'll notice at the bottom this entire post is repeated in the markup and the script tag).

This sounds great on the surface, but now every time the user interacts with the site **the template is repeated in the server component payload**.

Clicking on a single item in the Server Components demo results in a fetch for this (this is a "server component").

```text
M1:{"id":22,"chunks":[2],"name":""}
M2:{"id":20,"chunks":[0],"name":""}
S3:"react.suspense"
J0:["$","div",null,{"className":"main","children":[["$","section",null,{"className":"col sidebar","children":[["$","section",null,{"className":"sidebar-header","children":[["$","img",null,{"className":"logo","src":"logo.svg","width":"22px","height":"20px","alt":"","role":"presentation"}],["$","strong",null,{"children":"React Notes"}]]}],["$","section",null,{"className":"sidebar-menu","role":"menubar","children":[["$","@1",null,{}],["$","@2",null,{"noteId":null,"children":"New"}]]}],["$","nav",null,{"children":["$","$3",null,{"fallback":["$","div",null,{"children":["$","ul",null,{"className":"notes-list skeleton-container","children":[["$","li",null,{"className":"v-stack","children":["$","div",null,{"className":"sidebar-note-list-item skeleton","style":{"height":"5em"}}]}],["$","li",null,{"className":"v-stack","children":["$","div",null,{"className":"sidebar-note-list-item skeleton","style":{"height":"5em"}}]}],["$","li",null,{"className":"v-stack","children":["$","div",null,{"className":"sidebar-note-list-item skeleton","style":{"height":"5em"}}]}]]}]}],"children":"@4"}]}]]}],["$","section","3",{"className":"col note-viewer","children":["$","$3",null,{"fallback":["$","div",null,{"className":"note skeleton-container","role":"progressbar","aria-busy":"true","children":[["$","div",null,{"className":"note-header","children":[["$","div",null,{"className":"note-title skeleton","style":{"height":"3rem","width":"65%","marginInline":"12px 1em"}}],["$","div",null,{"className":"skeleton skeleton--button","style":{"width":"8em","height":"2.5em"}}]]}],["$","div",null,{"className":"note-preview","children":[["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}],["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}],["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}],["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}],["$","div",null,{"className":"skeleton v-stack","style":{"height":"1.5em"}}]]}]]}],"children":"@5"}]}]]}]
M6:{"id":21,"chunks":[3],"name":""}
J4:["$","ul",null,{"className":"notes-list","children":[["$","li","1",{"children":["$","@6",null,{"id":1,"title":"Meeting Notes","expandedChildren":["$","p",null,{"className":"sidebar-note-excerpt","children":"This is an example note. It contains Markdown!"}],"children":["$","header",null,{"className":"sidebar-note-header","children":[["$","strong",null,{"children":"Meeting Notes"}],["$","small",null,{"children":"12/30/20"}]]}]}]}],["$","li","2",{"children":["$","@6",null,{"id":2,"title":"A note with a very long title because sometimes you need more words","expandedChildren":["$","p",null,{"className":"sidebar-note-excerpt","children":"You can write all kinds of amazing notes in this app! These note live on the server in the notes..."}],"children":["$","header",null,{"className":"sidebar-note-header","children":[["$","strong",null,{"children":"A note with a very long title because sometimes you need more words"}],["$","small",null,{"children":"12/30/20"}]]}]}]}],["$","li","3",{"children":["$","@6",null,{"id":3,"title":"I wrote this note toda","expandedChildren":["$","p",null,{"className":"sidebar-note-excerpt","children":"It was an excellent note."}],"children":["$","header",null,{"className":"sidebar-note-header","children":[["$","strong",null,{"children":"I wrote this note toda"}],["$","small",null,{"children":"5:59 PM"}]]}]}]}]]}]
J5:["$","div",null,{"className":"note","children":[["$","div",null,{"className":"note-header","children":[["$","h1",null,{"className":"note-title","children":"I wrote this note toda"}],["$","div",null,{"className":"note-menu","role":"menubar","children":[["$","small",null,{"className":"note-updated-at","role":"status","children":["Last updated on ","3 Dec 2021 at 5:59 PM"]}],["$","@2",null,{"noteId":3,"children":"Edit"}]]}]]}],["$","div",null,{"className":"note-preview","children":["$","div",null,{"className":"text-with-markdown","dangerouslySetInnerHTML":{"__html":"<p>It was an excellent note.</p>\n"}}]}]]}]
```

That's over 4kB. If you click all three items, you get a response just like it for each one.

The first time you click a link on the Remix version you have to download the template in this code split bundle:

```text
import{a as i,c as a,d as p}from"/build/_shared/chunk-CDZR6LSD.js";import{a as m}from"/build/_shared/chunk-DQ7ZO7ZN.js";import"/build/_shared/chunk-XXRJHXMM.js";import{i as d}from"/build/_shared/chunk-2FSL4QX2.js";import{b as l,e as t,f as e}from"/build/_shared/chunk-AKSB5QXU.js";e();e();e();var f=l(p());function r(){let{id:n,title:s,body:u,updatedAt:o}=d();return o=new Date(o),t.createElement("div",{className:"note"},t.createElement("div",{className:"note-header"},t.createElement("h1",{className:"note-title"},s),t.createElement("div",{className:"note-menu",role:"menubar"},t.createElement("small",{className:"note-updated-at",role:"status"},"Last updated on ",i(o,"d MMM yyyy 'at' h:mm bb")),t.createElement(a,{noteId:n},"Edit"))),t.createElement(m,{body:u}))}export{r as default};

import{a as d}from"/build/_shared/chunk-XXRJHXMM.js";import{b as i,e as t,f as e}from"/build/_shared/chunk-AKSB5QXU.js";e();e();var n=i(d());function o({text:r}){return t.createElement("div",{className:"text-with-markdown",dangerouslySetInnerHTML:{__html:(0,n.default)(r)}})}function a({body:r}){return t.createElement("div",{className:"note-preview"},t.createElement(o,{text:r}))}export{a};
```

But from now on, every navigation only transfers this little bugger:

```text
{"id": 1, "createdAt": "2020-12-30T10:13:29.023Z", "updatedAt":
"2020-12-30T10:13:29.023Z", "title": "Meeting Notes", "body": "This is an
example note. It contains **Markdown**!"}
```

Because server components couple your data to your template over the wire, your users have to download the template _with every single interaction_ related to that component. While it's "Zero-Bundle" for your JavaScript, the subsequent interactions are "Infinite Bundle" 😟.

Clicking all three links with Server Components results in 14kB over the write. With Remix it's only 1.5kB. We're hoping in a real world app this difference isn't the 10x we're seeing in the demo.

Without server components, the only time the user has to download that template again is if they empty their browser cache or you ship a new version of the template.

Note that the item template wasn't included in the initial page load of the Remix version either. So the only benefit we got on the initial page load from Server Components was removing the hydration `<script>`. Is it worth trading that for much larger payloads as the user interacts with the app? We don't know yet, but that's our second biggest concern.

## Our Take

Server Components + streamed rendering seems optimal for pages you can't make fast on the backend or when you don't expect your user to click on more than a link or two. You'll get the user something useful as soon as possible. For anything else, we're not sure the tradeoffs on subsequent interactions are worth removing the hydration script--especially for sites where your users visit more pages than the one they landed on. Remix is concerned about the entire user experience, not just the TTFB.

Additionaly, if you can get your app and your data to the edge, you can usually render the entire document, even with the hydration script data duplication, in milliseconds. The UX of a document coming in pieces _very quickly_ might not be ideal. Or at the very least, not needed.

Server components also complicate your code in order to use them, and this is our biggest concern.

## Our Biggest Concern

So far what we've discussed are tradeoffs in a silly demo toy app. While instructive, it's still a bit speculative on how the tradeoffs will pan out in the real world.

There's one thing, however, that really concerns us. This is some code from the [server components demo that uses prisma][prisma-demo]:

```js lines=[1,5,13]
import { prisma } from "./db.server";
import SidebarNote from "./SidebarNote";

export default function NoteList({ searchText }) {
  const notes = prisma.note.findMany({
    where: {
      title: {
        contains: searchText ?? undefined,
      },
    },
  });

  return notes.length > 0 ? (
    <ul className="notes-list">
      {notes.map((note) => (
        <li key={note.id}>
          <SidebarNote note={note} />
        </li>
      ))}
    </ul>
  ) : (
    <div className="notes-empty">
      {searchText
        ? `Couldn't find any notes titled "${searchText}".`
        : "No notes created yet!"}{" "}
    </div>
  );
}
```

If you know prisma you should be confused by this code. Anything involved with data loading and server components **can't be used as-is**. That is not the normal `prisma` you're used to, it's a special, [React specific version][react-prisma]. The tiny demo [has three wrappers][react-packages] of normal things to accomodate React's new features.

On a personal level, this is the [exact thing][ember-firebase] Michael and I ran away from when we came to React. When we got to React, we said "set state" and it was done. It didn't matter what other libraries we brought to the party, they didn't need to be plugged-in to React.

A second problem with this kind of API is that it will be easy for developers to accidentally create serialized data loading in their components when they could have parallelized it:

```tsx
// in remix its obvious this is serialized and
// artifically slower than it needs to be
export async function loader({ params }) {
  let users = await prisma.user.findMany();
  let projects = await prisma.project.findMany();
  return { users, projects };
}

// fix it with Promise.all
export async function loader({ params }) {
  let [users, projects] = await Promise.all([
    prisma.user.findMany(),
    prisma.project.findMany(),
  ]);
  return { users, projects };
}

// not obvious in server components
export default function Dashboard() {
  let users = prisma.user.findMany();
  let projects = prisma.project.findMany();
  // ...
}
```

Not only is that an easy mistake, but it's not possible to fix. The react prisma wrapper needs to provide both read _and_ preload APIs, but at the time of this article, it doesn't. It needs something like this:

```ts [2,3]
export default function Dashboard() {
  prisma.preload.user.findMany();
  prisma.preload.project.findMany();
  let users = prisma.user.findMany();
  let projects = prisma.project.findMany();
  // ...
}
```

It just seems like a lot to ask of the community, especially when the benefits (at least for a Remix app) aren't totally obvious yet.

Another issue with these packages is that the read APIs need to be wrapped but the write APIs should not be wrapped (you don't mutate your data while rendering). So when you're working with a UI that reads from and writes to prisma you'll use `react-prisma` for the reads but normal prisma [for the writes][normal-prisma]. Likewise, when reading from the file system you'll need [`react-fs`][react-fs], but when writing you'll use the normal fs module. The demo conveniently has all writes happening in a separate node server, so it didn't run into these questions, but I'm already confused about how to initialize prisma in an app that does reads and writes. This is the [`db.server.js`][db-server] from the Server Components demo:

```tsx filename=db.server.js
import { PrismaClient } from "react-prisma";
export const prisma = new PrismaClient();
```

That only knows how to do reads. How do I initialize a client that can do both?

```tsx filename=db.server.js
import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "react-prisma";
export const prismaReact = new PrismaClient();
export const prisma = new PrismaClient();
```

Maybe that works? Even if it does, it's going to be awkward in code using wrapper libraries for reads and the real library for writes.

Perhaps this is a necessary step for React and we can be dragged along, but if you've been using Remix for a while, you'll already know we have a strong bias for keeping the abstractions to a minimum and staying close to the tech you're using.

JavaScript already has syntax for async behavior, is it worth hiding that and requiring hundreds of `react-*` packages of various quality and correctness just to get data into a component? Is it worth wrapping every data library on NPM with three APIs, one for reads, one for preloads, and one for writes--especially when Remix apps on modern infrastructure can send a full page in under second?

This feels like the first step back onto the road we ran from when coming to React 👻

In the end though, we're excited to have a new lever to pull that helps us bend the tradeoffs to create better user experiences. We're also happy to announce we've been invited to the React Working Group. We hope to help React continue to be an amazing UI library (without getting weird), and for Remix to take full advantage of not just the Web Platform, but React too.

[cf-durable-objects]: https://blog.cloudflare.com/introducing-workers-durable-objects/
[cf-kv]: https://developers.cloudflare.com/workers/learning/how-kv-works
[demo]: https://github.com/reactjs/server-components-demo/tree/9285cbd2624c6838ebd2d05df1685df2c0f2f875
[deno]: https://deno.com/blog/deploy-beta1
[ember-firebase]: https://github.com/mjackson/ember-firebase
[fauna]: https://fauna.com/
[fly]: https://fly.io/docs/getting-started/multi-region-databases/
[normal-prisma]: https://github.com/prisma/prisma/blob/1904c4b11fd5a5faa7c9ab9098667fb27e2b3c07/packages/react-prisma/src/index.ts#L94-L95
[prisma-demo]: https://github.com/prisma/server-components-demo/blob/36de5831ac2df454a223a7094c46acc53edf1ee2/src/NoteList.server.js
[react-packages]: https://github.com/prisma/server-components-demo/blob/c1dc0cd124b178fa41fa0a1cdc3792ff729918b4/package.json#L27-L29
[react-prisma]: https://github.com/prisma/prisma/blob/1904c4b11fd5a5faa7c9ab9098667fb27e2b3c07/packages/react-prisma/src/index.ts
[server-components]: https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html
[react-fs]: https://unpkg.com/browse/react-fs@0.0.0-experimental-3310209d0/cjs/react-fs.node.development.server.js
[db-server]: https://github.com/prisma/server-components-demo/blob/c1dc0cd124b178fa41fa0a1cdc3792ff729918b4/src/db.server.js
