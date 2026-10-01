export const landingContent = {
  hero: {
    title: ["The fully-stacked", "web framework"],
    body: [
      "Remix brings together a server runtime, routing, authentication, sessions, database integrations, a UI framework, asset compilation, dynamic styling, and accessible components in a cohesive",
      "stack built on Web APIs.",
    ],
  },
  stackTitle: "Everything you need, all in a single package",
  differentiators: {
    title: "Re-rethinking best practices",
    body: "Web frameworks have accumulated layers of complexity and indirection that now feel inevitable. Remix revisits those assumptions with APIs and boundaries you can follow all the way down to web standards.",
    items: [
      {
        title: "State is just JavaScript",
        body: "A component runs setup once, then returns a function that renders JSX. Keep state in ordinary JavaScript variables, objects, or classes rather than hooks or a prescribed state container.",
      },
      {
        title: "Updates are explicit",
        body: "Your code decides when the UI renders. Call `handle.update()` after changing state, and await it when your next step depends on the updated DOM.",
      },
      {
        title: "Not everything needs a component",
        body: "Mixins attach reusable behavior to events, styles, refs, and accessibility behavior directly on individual elements. This keeps the markup intact without introducing another component.",
      },
      {
        title: "Client components with visible boundaries",
        body: "You define how hydrated client components map to browser code in the server runtime. The client boundary stays visible in your code.",
      },
      {
        title: "HTML over the wire",
        body: "Use `<Frame>` to update regions of a page independently with server-rendered HTML from ordinary routes.",
      },
      {
        title: "HTTP is the interface",
        body: "Routes, middleware, assets, and integrations all use standard Request and Response objects for HTML, JSON, files, redirects, and more. The server contract stays portable and inspectable.",
      },
      {
        title: "Assets compile when requested",
        body: "Start your server immediately. TypeScript, JSX, and CSS compile on demand in development and production, so there is no application build step.",
      },
      {
        title: "Modules stay modules",
        body: "Native JavaScript modules and module preloads let the browser own loading and caching. Each module can be cached independently instead of invalidating an entire bundle.",
      },
    ],
  },
  storySections: [
    {
      id: "smaller-mental-model",
      title: "A bigger toolkit with a smaller mental model",
      body: "Building a complete web app shouldn't mean learning a different system at every layer. Remix gives you more of the stack with fewer concepts.",
      align: "left",
      points: [
        {
          title: "Web APIs throughout",
          body: "Use standard requests, responses, streams, and files across the stack.",
        },
        {
          title: "Runtime-first",
          body: "Run source directly without making a bundler the center of the architecture.",
        },
        {
          title: "Composable packages",
          body: "Use the complete framework or adopt focused parts independently.",
        },
        {
          title: "One coherent model",
          body: "Server, data, UI, assets, and testing are designed to work together.",
        },
      ],
    },
    {
      id: "humans-and-agents",
      title: "Better for humans. Better for agents.",
      body: "Remix keeps the important parts of your app visible: standard Web APIs, explicit updates, runtime boundaries, and recognizable source modules. Humans and coding agents can trace how the system works and take control when the defaults aren't enough.",
      align: "right",
      points: [
        {
          title: "Built to be understood",
          body: "Trace behavior through ordinary code and web standards instead of hidden framework machinery.",
        },
        {
          title: "Built to be changed",
          body: "Follow the defaults, replace a layer, or take control of the logic when your app needs it.",
        },
        {
          title: "Built for coding agents",
          body: "Remix skills teach agents the framework’s APIs, conventions, and workflows.",
        },
      ],
    },
    {
      id: "test-drive",
      title: "Take Remix for a test drive",
      body: "Build your first app with the step-by-step guide, then explore the API when you want to go deeper.",
      align: "left",
      ctaLabel: "Get started",
      ctaHref: "https://guides.remix.run/start-here/",
      secondary: {
        title: "Stay in the loop",
        body: "Get a monthly update on releases, technical work, events, and what is coming next. No spam. Unsubscribe anytime.",
        newsletter: true,
      },
    },
  ],
  resources: [
    {
      key: "G",
      label: "guides",
      href: "https://guides.remix.run",
      markdownHref: "https://guides.remix.run/start-here.md",
      external: true,
    },
    {
      key: "A",
      label: "api",
      href: "https://api.remix.run",
      markdownHref: "https://api.remix.run/api/remix/overview.md",
      external: true,
    },
    {
      key: "H",
      label: "github",
      href: "https://github.com/remix-run/remix",
      external: true,
    },
  ],
} as const;

export const packageRunners = [
  {
    value: "npm",
    label: "npm",
    icon: "/landing/package-runner-npm.svg",
    command: "npx remix@next new my-app",
  },
  {
    value: "pnpm",
    label: "pnpm",
    icon: "/landing/package-runner-pnpm.svg",
    command: "pnpm dlx remix@next new my-app",
  },
  {
    value: "yarn",
    label: "Yarn",
    icon: "/landing/package-runner-yarn.svg",
    command: "yarn dlx remix@next new my-app",
  },
  {
    value: "bun",
    label: "Bun",
    icon: "/landing/package-runner-bun.svg",
    command: "bunx remix@next new my-app",
  },
  {
    value: "deno",
    label: "Deno",
    icon: "/landing/package-runner-deno.svg",
    command: "deno run -A npm:remix@next new my-app",
  },
] as const;
