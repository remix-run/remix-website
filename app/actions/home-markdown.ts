import { CACHE } from "../utils/cache-control.ts";
import {
  landingContent,
  packageRunners,
} from "./public/remix-landing/landing-content.ts";
import { stackCategories } from "./public/remix-landing/components/stack-explorer-content.tsx";

export function homeMarkdownResponse() {
  let [mentalModel, agents, quickstart] = landingContent.storySections;
  let markdown = [
    `# Remix 3 — ${landingContent.hero.title.join(" ")}`,
    landingContent.hero.body.join(" "),
    `## ${quickstart.title}`,
    quickstart.body,
    `\`\`\`sh\n${packageRunners[0].command}\ncd my-app\nnpm install\nnpm run dev\n\`\`\``,
    `[${quickstart.ctaLabel}](${quickstart.ctaHref.replace(/\/$/, ".md")})`,
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

  return new Response(`${markdown}\n`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      ...(process.env.NODE_ENV === "development"
        ? { "Cache-Control": "no-store" }
        : CACHE.DOCUMENT),
    },
  });
}
