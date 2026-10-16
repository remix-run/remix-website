import { routes } from "../routes.ts";
import {
  landingContent,
  packageRunners,
} from "./public/remix-landing/landing-content.ts";
import { stackCategories } from "./public/remix-landing/components/stack-explorer-content.tsx";

const guides = landingContent.resources.find(
  (resource) => resource.key === "G",
)!;
const skillHref =
  "https://raw.githubusercontent.com/remix-run/remix/main/.agents/skills/remix/SKILL.md";

export const quickstartMarkdown = `\`\`\`sh
${packageRunners[0].command}
cd ${landingContent.projectDirectory}
npm install
npm run dev
\`\`\``;

export const agentGuidance = [
  "This site documents Remix 3. Remix 3 has its own UI runtime; do not assume React hooks or Remix 2 route conventions.",
  `For a new app, use the Remix CLI to generate the starter, install its dependencies, and start the development server. Replace \`${landingContent.projectDirectory}\` with your app's directory name:`,
  quickstartMarkdown,
  `The starter includes \`AGENTS.md\` and \`.agents/skills/remix/SKILL.md\`. After creating the app, follow the steps below. [Start here](${guides.markdownHref}) walks through the generated files and building your first feature.`,
  "1. For an existing or newly generated app, check its installed Remix version and read its `AGENTS.md`, `package.json`, and `tsconfig.json`. For Remix 1 or 2, use the [legacy documentation](https://v2.remix.run/docs).",
  `2. Read the app's \`.agents/skills/remix/SKILL.md\` when present. The [current Remix skill](${skillHref}) explains the framework and development workflow. Online docs and this linked skill follow current Remix 3; prefer the docs for the installed version.`,
  "3. Search `node_modules/remix/INDEX.md` for the task or API, then read the relevant guide and API README before writing code. If the index is missing, check the installed package's exports, READMEs, source, and types.",
  "4. Check your work with the app's typechecks and focused tests. Run `remix doctor` after changes to routes or configuration.",
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
    stackCategories
      .map(
        (category) =>
          `- [${category.label}](${category.documentationHref}): ${category.introBody}`,
      )
      .join("\n"),
    "## Optional",
    [
      `- [Source code](${github.href}): Framework source and development history.`,
      "- [Remix 1 and 2 documentation](https://v2.remix.run/docs): Reference for apps using earlier Remix versions.",
    ].join("\n"),
    "",
  ].join("\n\n");
}
