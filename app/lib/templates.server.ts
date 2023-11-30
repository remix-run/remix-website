import fs from "fs";
import path from "path";
import yaml from "yaml";
import LRUCache from "lru-cache";
import { env } from "~/env.server";
import { getRepoContent } from "./gh-docs/repo-content";
import { processMarkdown } from "./md.server";

// This is relative to where this code ends up in the build, not the source
let dataPath = path.join(__dirname, "..", "data");

let formatter = new Intl.NumberFormat("en", { notation: "compact" });

export let templates: Template[] = yaml
  .parse(fs.readFileSync(path.join(dataPath, "templates.yaml")).toString())
  // Format the stars here, eventually this will come from GitHub and can be done in that function
  .map((t: { stars: number }) => ({
    ...t,
    stars: formatter.format(t.stars).toLowerCase(),
  }));

export interface Template {
  name: string;
  imgSrc: string;
  description: string;
  repoUrl: string;
  sponsorUrl?: string;
  stars: string;
  initCommand: string;
  tags: string[];
}

type TemplateReadme = { html: string };

declare global {
  var templateReadmeCache: LRUCache<string, TemplateReadme>;
}

let NO_CACHE = env.NO_CACHE;

global.templateReadmeCache ??= new LRUCache<string, TemplateReadme>({
  max: 300,
  ttl: NO_CACHE ? 1 : 1000 * 60 * 5, // 5 minutes
  allowStale: !NO_CACHE,
  noDeleteOnFetchRejection: true,
  fetchMethod: fetchReadme,
});

async function fetchReadme(repo: string): Promise<TemplateReadme> {
  let md = await getRepoContent(repo, "main", "README.md");
  if (md === null) {
    throw Error(`Could not find README in ${repo}`);
  }
  let { html } = await processMarkdown(md);

  return { html };
}

export async function getTemplateReadme(
  repoUrl: string,
): Promise<TemplateReadme | undefined> {
  let repo = repoUrl.replace("https://github.com/", "");
  let doc = await templateReadmeCache.fetch(repo);

  return doc || undefined;
}
