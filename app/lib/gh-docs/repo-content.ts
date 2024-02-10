import fsp from "fs/promises";
import path from "path";
import invariant from "tiny-invariant";
import { env } from "~/env.server";
import { octokit } from "../github.server";

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
): Promise<string | null> {
  if (ref === "local") return getLocalContent(filepath);
  let [owner, repo] = repoPair.split("/");
  let contents = await octokit.rest.repos.getContent({
    owner,
    repo,
    ref,
    path: filepath,
    mediaType: { format: "base64" },
  });

  return base64DecodeFileContents(contents);
}

export function base64DecodeFileContents(
  contents: Awaited<ReturnType<typeof octokit.rest.repos.getContent>>,
): string | null {
  if ("type" in contents.data && contents.data.type === "file") {
    return Buffer.from(contents.data.content, "base64").toString("utf-8");
  }

  return null;
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
