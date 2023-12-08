import yaml from "yaml";
import LRUCache from "lru-cache";
import { env } from "~/env.server";
import { getRepoContent } from "./gh-docs/repo-content";
import { processMarkdown } from "./md.server";
import { slugify } from "~/ui/templates";
import type { Octokit } from "octokit";
import templatesYamlFileContents from "../../data/templates.yaml?raw";

// TODO: parse this with zod
let _templates: TemplateYamlData[] = yaml.parse(templatesYamlFileContents);

let starFormatter = new Intl.NumberFormat("en", { notation: "compact" });

export interface Template {
  title: string;
  imgSrc: string;
  featured?: boolean;
  description?: string;
  repoUrl: string;
  sponsorUrl?: string;
  stars: string;
  initCommand: string;
  tags: string[];
}

type TemplateYamlKeys =
  | "title"
  | "imgSrc"
  | "repoUrl"
  | "initCommand"
  | "featured";
type TemplateYamlData = Pick<Template, TemplateYamlKeys>;
type TemplateGitHubData = Omit<Template, TemplateYamlKeys>;
type CacheContext = { octokit: Octokit };

/**
 * Gets all of the templates, fetching and merging GitHub data for each one
 */
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

/**
 * Get a single template by slug, fetching and merging GitHub data and README contents
 */
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

//#region LRUCache and fetchers for GitHub data and READMEs

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

async function getTemplateReadme(repoUrl: string) {
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

async function getTemplateGitHubData(
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

let ignoredTopics = new Set(["remix-stack", "remix-run", "remix"]);

async function fetchTemplateGitHubData(
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
  let stars = starFormatter.format(data.stargazers_count).toLowerCase();
  let tags = (data.topics ?? []).filter((topic) => !ignoredTopics.has(topic));

  return { description, stars, tags, sponsorUrl };
}

//#endregion
