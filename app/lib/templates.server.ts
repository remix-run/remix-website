import fs from "fs";
import path from "path";
import yaml from "yaml";
import LRUCache from "lru-cache";
import { env } from "~/env.server";
import { getRepoContent } from "./gh-docs/repo-content";
import { processMarkdown } from "./md.server";
import type { Octokit } from "octokit";
import { slugify } from "~/ui/templates";

// This is relative to where this code ends up in the build, not the source
let dataPath = path.join(__dirname, "..", "data");

let formatter = new Intl.NumberFormat("en", { notation: "compact" });

export interface Template {
  title: string;
  imgSrc: string;
  description?: string;
  repoUrl: string;
  sponsorUrl?: string;
  stars: string;
  initCommand: string;
  tags: string[];
}

type TemplateYamlKeys = "title" | "imgSrc" | "repoUrl" | "initCommand";
type TemplateYamlData = Pick<Template, TemplateYamlKeys>;
type TemplateGitHubData = Omit<Template, TemplateYamlKeys>;

// load the YAML file once and store it in memory
// TODO: parse this with zod
let _templates: TemplateYamlData[] = yaml.parse(
  fs.readFileSync(path.join(dataPath, "templates.yaml")).toString(),
);

// every time the templates are requested, fetch GitHub data against LRU cache
export async function getAllTemplates({ octokit }: CacheContext) {
  let templates: Template[] = await Promise.all(
    _templates.map(async (template) => {
      // This is cached, so should just be a simple lookup
      let gitHubData = await getTemplateGitHubData(template.repoUrl, {
        octokit,
      });
      if (!gitHubData) {
        throw new Error(`Could not find GitHub data for ${template.repoUrl}`);
      }
      return { ...template, ...gitHubData };
    }),
  );

  return templates;
}

export async function getTemplate(
  templateSlug: string,
  { octokit }: CacheContext,
) {
  let template = _templates.find(
    (template) => slugify(template.title) === templateSlug,
  );

  if (!template) return;

  let [gitHubData, readmeHtml] = await Promise.all([
    getTemplateGitHubData(template.repoUrl, { octokit }),
    getTemplateReadme(template.repoUrl),
  ]);

  if (!gitHubData || !readmeHtml) {
    throw new Error(`Could not find GitHub data for ${template.repoUrl}`);
  }

  return { ...template, ...gitHubData, readmeHtml };
}

type CacheContext = { octokit: Octokit };

declare global {
  var templateReadmeCache: LRUCache<string, string>;
  var templateGitHubDataCache: LRUCache<
    string,
    TemplateGitHubData,
    CacheContext
  >;
}

let NO_CACHE = env.NO_CACHE;

global.templateReadmeCache ??= new LRUCache<string, string>({
  max: 300,
  ttl: NO_CACHE ? 1 : 1000 * 60 * 5, // 5 minutes
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchReadme,
});

async function fetchReadme(repo: string): Promise<string> {
  let md = await getRepoContent(repo, "main", "README.md");
  if (md === null) {
    throw Error(`Could not find README in ${repo}`);
  }
  let { html } = await processMarkdown(md);
  return html;
}

export async function getTemplateReadme(repoUrl: string) {
  let repo = repoUrl.replace("https://github.com/", "");
  let doc = await templateReadmeCache.fetch(repo);

  return doc || undefined;
}

async function getSponsorUrl(owner: string) {
  let sponsorUrl = `https://github.com/sponsors/${owner}`;

  try {
    let response = await fetch(sponsorUrl);
    return !response.redirected ? sponsorUrl : undefined;
  } catch (e) {
    console.error("Failed to fetch sponsor url for", owner);
    return undefined;
  }
}

export async function getTemplateGitHubData(
  repoUrl: string,
  { octokit }: CacheContext,
) {
  return templateGitHubDataCache.fetch(repoUrl, {
    context: { octokit },
  });
}

global.templateGitHubDataCache ??= new LRUCache<
  string,
  TemplateGitHubData,
  CacheContext
>({
  max: 300,
  ttl: NO_CACHE ? 1 : 1000 * 60 * 5, // 5 minutes
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchTemplateGitHubData,
});

export async function fetchTemplateGitHubData(
  repoUrl: string,
  staleValue: TemplateGitHubData | undefined,
  {
    context,
  }: LRUCache.FetchOptionsWithContext<string, TemplateGitHubData, CacheContext>,
): Promise<TemplateGitHubData> {
  let [owner, repo] = repoUrl.replace("https://github.com/", "").split("/");

  let [{ data }, sponsorUrl] = await Promise.all([
    context.octokit.rest.repos.get({ owner, repo }),
    getSponsorUrl(owner),
  ]);

  let description = data.description ?? undefined;
  let stars = formatter.format(data.stargazers_count).toLowerCase();
  let tags = data.topics ?? []; //.filter((topic) => topic !== "remix-stack");

  return { description, stars, tags, sponsorUrl };
}
