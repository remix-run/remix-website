import { routes } from "../routes.ts";
import {
  landingContent,
  packageRunners,
} from "./public/remix-landing/landing-content.ts";

const guides = landingContent.resources.find(
  (resource) => resource.key === "G",
)!;
const skillHref =
  "https://raw.githubusercontent.com/remix-run/remix/main/.agents/skills/remix/SKILL.md";

const createAppMarkdown = `\`\`\`sh
${packageRunners[0].command}
cd ${landingContent.projectDirectory}
npm install
\`\`\``;

export const guideLinks = [
  {
    title: "Start Here",
    href: "https://guides.remix.run/start-here.md",
    description:
      "A high-level introduction to Remix and the mental model behind a Remix application.",
  },
  {
    title: "Routing and Controllers",
    href: "https://guides.remix.run/routing-and-controllers.md",
    description:
      "How route maps, route helpers, controllers, actions, and responses define Remix request handling.",
  },
  {
    title: "Request Handling",
    href: "https://guides.remix.run/request-handling.md",
    description:
      "How a Web Request becomes a Web Response across runtime adapters and the middleware pipeline.",
  },
  {
    title: "Rendering UI",
    href: "https://guides.remix.run/rendering-ui.md",
    description:
      "How to build pages from Remix components, props, context, document shells, styles, and first-party UI.",
  },
  {
    title: "Interactivity",
    href: "https://guides.remix.run/interactivity.md",
    description:
      "How server-rendered UI hydrates, handles events, connects components to application models, navigates, and cancels stale work.",
  },
  {
    title: "Streaming UI with Frames",
    href: "https://guides.remix.run/streaming-ui-with-frames.md",
    description:
      "How to stream and reload route-owned UI with Frame, fallbacks, and server and browser frame resolvers.",
  },
  {
    title: "Animation",
    href: "https://guides.remix.run/animation.md",
    description:
      "The CSS-first animation model and Remix component helpers for motion that respects rendering state.",
  },
  {
    title: "Data and Validation",
    href: "https://guides.remix.run/data-and-validation.md",
    description:
      "How Remix validates inputs, defines relational data, queries databases, and runs SQL migrations.",
  },
  {
    title: "Forms and Mutations",
    href: "https://guides.remix.run/forms-and-mutations.md",
    description:
      "How native forms, action responses, validation failures, redirects, and enhanced mutations fit together.",
  },
  {
    title: "Auth, Sessions, and Security",
    href: "https://guides.remix.run/auth-sessions-security.md",
    description:
      "How Remix stores per-browser state, resolves identity, protects routes, and defends browser request boundaries.",
  },
  {
    title: "Files and Assets",
    href: "https://guides.remix.run/files-and-assets.md",
    description:
      "How Remix serves static files and source assets, accepts bounded uploads, stores files, and returns HTTP file responses.",
  },
  {
    title: "Errors and Cancellation",
    href: "https://guides.remix.run/errors-and-cancellation.md",
    description:
      "How expected HTTP failures, uncaught server errors, rendering failures, client runtime errors, and aborted work propagate through Remix.",
  },
  {
    title: "Testing",
    href: "https://guides.remix.run/testing.md",
    description:
      "How to choose a test boundary and test Remix routes, stateful request flows, browser components, and end-to-end behavior.",
  },
  {
    title: "CLI and Tooling",
    href: "https://guides.remix.run/cli-and-tooling.md",
    description:
      "The Remix command-line workflow for creating, inspecting, testing, checking, and running TypeScript projects.",
  },
  {
    title: "Production",
    href: "https://guides.remix.run/production.md",
    description:
      "How to configure, start, cache, observe, and shut down a Remix application in production.",
  },
];

export const agentGuidance = [
  "This site documents Remix 3. Remix 3 has its own UI runtime; do not assume React hooks or Remix 2 route conventions.",
  `For a new app, use the Remix CLI to generate the starter and install its dependencies. Replace \`${landingContent.projectDirectory}\` with your app's directory name:`,
  createAppMarkdown,
  "Confirm the app works with `npm run typecheck` and `npm test`. `npm run dev` (or `npm run hmr` for live browser updates) starts a development server that runs until stopped; start it in the background so it does not block your session.",
  `The starter includes \`AGENTS.md\` and \`.agents/skills/remix/SKILL.md\`. After creating the app, follow the steps below. [Start here](${guides.markdownHref}) walks through the generated files and building your first feature.`,
  "1. For an existing or newly generated app, check its installed Remix version with `npm ls remix` and read its `AGENTS.md`, `package.json`, and `tsconfig.json`. For Remix 1 or 2, use the [legacy documentation](https://v2.remix.run/docs).",
  `2. Read the app's \`.agents/skills/remix/SKILL.md\` when present. The [current Remix skill](${skillHref}) explains the framework and development workflow. Online docs and this linked skill follow current Remix 3; prefer the docs for the installed version.`,
  "3. Search `node_modules/remix/INDEX.md` for the task or API, then read the relevant guide and API README before writing code. If the index is missing, check the installed package's exports, READMEs, source, and types.",
  "4. Check your work with the app's typechecks and focused tests. Run `npx remix doctor` after changes to routes or configuration.",
].join("\n\n");

export function renderLlmsTxt() {
  let api = landingContent.resources.find((resource) => resource.key === "A")!;
  let github = landingContent.resources.find(
    (resource) => resource.key === "H",
  )!;

  return [
    "# Remix 3",
    `> ${landingContent.hero.body.join(" ")}`,
    agentGuidance,
    "## Start here",
    [
      `- [Remix homepage](https://remix.run${routes.homeMarkdown.href()}): Framework overview and quickstart commands in Markdown.`,
      `- [Start here](${guides.markdownHref}): Create an app and learn how its parts fit together.`,
      `- [API reference](${api.markdownHref}): Package overview and CLI commands. Use the installed package index to find API details for your version.`,
      `- [Remix agent skill](${skillHref}): Instructions for building, reviewing, and testing Remix 3 apps.`,
    ].join("\n"),
    "## Guides",
    guideLinks
      .map((guide) => `- [${guide.title}](${guide.href}): ${guide.description}`)
      .join("\n"),
    "## Optional",
    [
      `- [Source code](${github.href}): Framework source and development history.`,
      "- [Remix 1 and 2 documentation](https://v2.remix.run/docs): Reference for apps using earlier Remix versions.",
    ].join("\n"),
    "",
  ].join("\n\n");
}
