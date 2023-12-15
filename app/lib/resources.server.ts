import yaml from "yaml";
import LRUCache from "lru-cache";
import { env } from "~/env.server";
import { getRepoContent } from "./gh-docs/repo-content";
import { processMarkdown } from "./md.server";
import type { Octokit } from "octokit";
import resourcesYamlFileContents from "../../data/resources.yaml?raw";
import { slugify } from "./misc";

// TODO: parse this with zod
let _resources: ResourceYamlData[] = yaml.parse(resourcesYamlFileContents);

let starFormatter = new Intl.NumberFormat("en", { notation: "compact" });

export interface Resource {
  title: string;
  repoUrl: string;
  imgSrc: string;
  initCommand: string;
  category: Exclude<Category, "all">;
  featured?: boolean;
  description?: string;
  sponsorUrl?: string;
  stars: number;
  starsFormatted: string;
  tags: string[];
}
export type Category = "all" | "templates" | "libraries";

type ResourceYamlKeys =
  | "title"
  | "imgSrc"
  | "repoUrl"
  | "initCommand"
  | "category"
  | "featured";
type ResourceYamlData = Pick<Resource, ResourceYamlKeys>;
type ResourceGitHubData = Omit<Resource, ResourceYamlKeys>;
type CacheContext = { octokit: Octokit };

/**
 * Gets all of the resources, fetching and merging GitHub data for each one
 */
export async function getAllResources({ octokit }: CacheContext) {
  let resources: Resource[] = await Promise.all(
    _resources.map(async (resource) => {
      // This is cached, so should just be a simple lookup
      let gitHubData = await getResourceGitHubData(resource.repoUrl, {
        octokit,
      });
      if (!gitHubData) {
        throw new Error(`Could not find GitHub data for ${resource.repoUrl}`);
      }
      return { ...resource, ...gitHubData };
    }),
  );

  return resources.sort((a, b) => b.stars - a.stars);
}

/**
 * Get a single resource by slug, fetching and merging GitHub data and README contents
 */
export async function getResource(
  resourceSlug: string,
  { octokit }: CacheContext,
) {
  let resource = _resources.find(
    (resource) => slugify(resource.title) === resourceSlug,
  );

  if (!resource) return;

  let [gitHubData, readmeHtml] = await Promise.all([
    getResourceGitHubData(resource.repoUrl, { octokit }),
    getResourceReadme(resource.repoUrl),
  ]);

  if (!gitHubData || !readmeHtml) {
    throw new Error(`Could not find GitHub data for ${resource.repoUrl}`);
  }

  return { ...resource, ...gitHubData, readmeHtml };
}

//#region LRUCache and fetchers for GitHub data and READMEs

declare global {
  var resourceReadmeCache: LRUCache<string, string>;
  var resourceGitHubDataCache: LRUCache<
    string,
    ResourceGitHubData,
    CacheContext
  >;
}

let NO_CACHE = env.NO_CACHE;

global.resourceReadmeCache ??= new LRUCache<string, string>({
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

async function getResourceReadme(repoUrl: string) {
  let repo = repoUrl.replace("https://github.com/", "");
  let doc = await resourceReadmeCache.fetch(repo);

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

async function getResourceGitHubData(
  repoUrl: string,
  { octokit }: CacheContext,
) {
  return resourceGitHubDataCache.fetch(repoUrl, {
    context: { octokit },
  });
}

global.resourceGitHubDataCache ??= new LRUCache<
  string,
  ResourceGitHubData,
  CacheContext
>({
  max: 300,
  ttl: NO_CACHE ? 1 : 1000 * 60 * 5, // 5 minutes
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchResourceGitHubData,
});

let ignoredTopics = new Set(["remix-stack", "remix-run", "remix"]);

async function fetchResourceGitHubData(
  repoUrl: string,
  staleValue: ResourceGitHubData | undefined,
  {
    context,
  }: LRUCache.FetchOptionsWithContext<string, ResourceGitHubData, CacheContext>,
): Promise<ResourceGitHubData> {
  let [owner, repo] = repoUrl.replace("https://github.com/", "").split("/");

  let [{ data }, sponsorUrl] = await Promise.all([
    context.octokit.rest.repos.get({ owner, repo }),
    getSponsorUrl(owner),
  ]);

  let description = data.description ?? undefined;
  let stars = data.stargazers_count;
  let tags = (data.topics ?? []).filter((topic) => !ignoredTopics.has(topic));

  return {
    description,
    stars,
    starsFormatted: starFormatter.format(stars).toLowerCase(),
    tags,
    sponsorUrl,
  };
}

//#endregion
