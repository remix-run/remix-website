import {
  landingContent,
  packageRunners,
} from "./public/remix-landing/landing-content.ts";

// Served at `/` (Accept: text/markdown), `/index.md`, and `/llms.txt`, so it
// follows the llms.txt layout: H1, blockquote summary, heading-free details,
// then H2 sections that only contain link lists.
export function renderHomeMarkdown() {
  let guides = landingContent.resources.find(
    (resource) => resource.key === "G",
  )!;
  let api = landingContent.resources.find((resource) => resource.key === "A")!;
  let github = landingContent.resources.find(
    (resource) => resource.key === "H",
  )!;
  let skillHref =
    "https://raw.githubusercontent.com/remix-run/remix/main/.agents/skills/remix/SKILL.md";
  let markdown = [
    `# Remix 3 — ${landingContent.hero.title.join(" ")}`,
    `> ${landingContent.hero.body.join(" ")}`,
    "This site documents Remix 3. Remix 3 has its own UI runtime; do not assume React hooks or Remix 2 route conventions. For apps on Remix 1 or 2, use the [legacy documentation](https://v2.remix.run/docs).",
    `Create an app with the Remix CLI, replacing \`${landingContent.projectDirectory}\` with your app's directory name:`,
    `\`\`\`sh
${packageRunners[0].command}
cd ${landingContent.projectDirectory}
npm install
\`\`\``,
    `Confirm it works with \`npm run typecheck\` and \`npm test\`. \`npm run dev\` starts a development server that runs until stopped, so coding agents should run it in the background. [Start here](${guides.markdownHref}) walks through the generated files and your first feature.`,
    [
      "**Working in a Remix app:**",
      "",
      `1. Check the installed version with \`npm ls remix\`, then read the app's \`AGENTS.md\` and \`.agents/skills/remix/SKILL.md\`. If the app has no skill, use the [Remix agent skill](${skillHref}).`,
      "2. Search `node_modules/remix/INDEX.md` for the task or API and read the matching guide and package README. These match the installed version; the online docs follow the latest release.",
      "3. Check your work with typechecks and focused tests, and run `npx remix doctor` after changing routes or configuration.",
    ].join("\n"),
    "## Learn more",
    [
      `- [Guides](${guides.markdownHref}): Build your first app, then learn how each part of Remix fits together.`,
      `- [API reference](${api.markdownHref}): Package overview and CLI commands.`,
      `- [Remix agent skill](${skillHref}): Instructions for building, reviewing, and testing Remix 3 apps.`,
      `- [Source code](${github.href}): Framework source and development history.`,
    ].join("\n"),
  ].join("\n\n");

  return `${markdown}\n`;
}
