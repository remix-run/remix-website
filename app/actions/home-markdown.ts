import {
  landingContent,
  packageRunners,
} from "./public/remix-landing/landing-content.ts";
import { stackCategories } from "./public/remix-landing/components/stack-explorer-content.tsx";

export function renderHomeMarkdown() {
  let mentalModel = landingContent.storySections.find(
    (section) => section.id === "smaller-mental-model",
  )!;
  let agents = landingContent.storySections.find(
    (section) => section.id === "humans-and-agents",
  )!;
  let quickstart = landingContent.storySections.find(
    (section) => section.id === "test-drive",
  )!;
  let guides = landingContent.resources.find(
    (resource) => resource.key === "G",
  )!;
  let markdown = [
    `# Remix 3 — ${landingContent.hero.title.join(" ")}`,
    landingContent.hero.body.join(" "),
    `## ${quickstart.title}`,
    quickstart.body,
    `\`\`\`sh
${packageRunners[0].command}
cd ${landingContent.projectDirectory}
npm install
npm run dev
\`\`\``,
    `[${quickstart.ctaLabel}](${guides.markdownHref})`,
    `## ${landingContent.stackTitle}`,
    ...stackCategories.flatMap((category) => [
      `### ${category.label}`,
      category.introBody,
      `[Learn more](${category.documentationHref})`,
    ]),
    `## ${mentalModel.title}`,
    mentalModel.body,
    mentalModel.points
      .map((point) => `- **${point.title}:** ${point.body}`)
      .join("\n"),
    `## ${landingContent.differentiators.title}`,
    landingContent.differentiators.body,
    landingContent.differentiators.items
      .map((item) => `- **${item.title}:** ${item.body}`)
      .join("\n"),
    `## ${agents.title}`,
    agents.body,
    agents.points
      .map((point) => `- **${point.title}:** ${point.body}`)
      .join("\n"),
    "## Learn more",
    landingContent.resources
      .map(
        (resource) =>
          `- [${resource.label}](${"markdownHref" in resource ? resource.markdownHref : resource.href})`,
      )
      .join("\n"),
  ].join("\n\n");

  return `${markdown}\n`;
}
