import fsp from "fs/promises";
import path from "path";
import invariant from "tiny-invariant";
import { env } from "~/env.server";

import type { CacheContext } from ".";

/**
 * Fetches the contents of a file in a repository or from your local disk.
 *
 * @param ref The GitHub ref, use `"local"` for local docs development
 * @param filepath The filepath inside the repo (including "docs/")
 * @returns The text of the file
 */
export async function getRepoContent(
  repoPair: string,
  ref: string,
  filepath: string,
  context: CacheContext,
): Promise<string | null> {
  if (ref === "local") return getLocalContent(filepath);
  let [owner, repo] = repoPair.split("/");
  let contents = await context.octokit.rest.repos.getContent({
    owner,
    repo,
    ref,
    path: filepath,
    mediaType: { format: "raw" },
  });

  // when using `format: raw` the data property is the file contents
  let md = contents.data as unknown;
  if (md == null || typeof md !== "string") return null;
  return md;
}

/**
 * Reads a single file from your local source repository
 */
async function getLocalContent(filepath: string): Promise<string> {
  invariant(
    env.LOCAL_REPO_RELATIVE_PATH,
    "LOCAL_REPO_RELATIVE_PATH is not set",
  );
  let localFilePath = path.join(env.LOCAL_REPO_RELATIVE_PATH, filepath);
  let content = await fsp.readFile(localFilePath);
  return content.toString();
}
